/* ===== Nebula background (WebGL2) ===== */
(() => {
  const canvas = document.getElementById('nebula');
  const gl = canvas.getContext('webgl2', { antialias: false, alpha: false, powerPreference: 'low-power' });
  if (!gl) {
    document.body.style.background = '#09090b';
    return;
  }

  const VS = `#version 300 es
void main() {
  vec2 v[3] = vec2[3](vec2(-1.0,-1.0), vec2(3.0,-1.0), vec2(-1.0,3.0));
  gl_Position = vec4(v[gl_VertexID], 0.0, 1.0);
}`;

  const FS = `#version 300 es
precision highp float;
uniform vec2 u_res;
uniform float u_time;
uniform vec2 u_mouse;
uniform float u_glow;
out vec4 outColor;

float hash(vec2 p) {
  p = mod(p, vec2(256.0));
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p *= 2.02;
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = (gl_FragCoord.xy / u_res) * 2.0 - 1.0;
  uv.x *= u_res.x / u_res.y;
  float t = u_time * 0.012;
  vec2 p = uv * 1.4;
  vec2 q = vec2(fbm(p + vec2(0.0, 0.0) + t),
                fbm(p + vec2(5.2, 1.3) - t * 0.7));
  vec2 r = vec2(fbm(p + 4.0 * q + vec2(1.7, 9.2) + t * 0.3),
                fbm(p + 4.0 * q + vec2(8.3, 2.8) - t * 0.4));
  float n = fbm(p + 4.0 * r);
  n = pow(n, 1.4);
  vec3 voidCol = vec3(0.022, 0.022, 0.034);
  vec3 nebCol  = vec3(0.30, 0.28, 0.36);
  vec3 highCol = vec3(0.60, 0.60, 0.70);
  vec3 tint    = vec3(0.45, 0.55, 1.00);
  vec3 col = mix(voidCol, nebCol, smoothstep(0.0, 0.7, n));
  col = mix(col, highCol, smoothstep(0.7, 1.0, n) * 0.6);
  col = mix(col, col * tint * 1.4, 0.16);
  vec2 hiddenP = p * 2.4 + 3.0 * r + vec2(t * 0.8, -t * 0.5);
  float hidden = fbm(hiddenP);
  hidden = smoothstep(0.35, 0.85, hidden);
  vec2 mouseUv = (u_mouse / u_res) * 2.0 - 1.0;
  mouseUv.x *= u_res.x / u_res.y;
  mouseUv.y = -mouseUv.y;
  float md = length(uv - mouseUv);
  float lamp = exp(-md * md * 2.6) * u_glow;
  vec3 hiddenCol = vec3(0.78, 0.82, 0.98);
  col = mix(col, mix(col, hiddenCol, hidden * 0.55), lamp);
  col += col * lamp * 0.22;
  float vig = 1.0 - smoothstep(0.5, 1.4, length(uv));
  col *= 0.55 + 0.45 * vig;
  col += (hash(gl_FragCoord.xy + t * 100.0) - 0.5) * 0.012;
  outColor = vec4(col, 1.0);
}`;

  function compile(type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    return s;
  }

  const program = gl.createProgram();
  gl.attachShader(program, compile(gl.VERTEX_SHADER, VS));
  gl.attachShader(program, compile(gl.FRAGMENT_SHADER, FS));
  gl.linkProgram(program);
  gl.useProgram(program);

  const uRes = gl.getUniformLocation(program, 'u_res');
  const uTime = gl.getUniformLocation(program, 'u_time');
  const uMouse = gl.getUniformLocation(program, 'u_mouse');
  const uGlow = gl.getUniformLocation(program, 'u_glow');

  let dpr = Math.min(window.devicePixelRatio || 1, 1.5);
  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = Math.max(2, Math.floor(window.innerWidth * dpr));
    canvas.height = Math.max(2, Math.floor(window.innerHeight * dpr));
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform2f(uRes, canvas.width, canvas.height);
  }
  resize();
  window.addEventListener('resize', resize);

  let mx = window.innerWidth * 0.5, my = window.innerHeight * 0.5;
  let tx = mx, ty = my;
  let glow = 0, glowTarget = 0;

  window.addEventListener('mousemove', e => {
    tx = e.clientX;
    ty = e.clientY;
    glowTarget = 1;
  });
  window.addEventListener('mouseout', e => {
    if (!e.relatedTarget && !e.toElement) glowTarget = 0;
  });
  window.addEventListener('mouseover', () => { glowTarget = 1; });

  const start = performance.now();
  function frame(now) {
    mx += (tx - mx) * 0.12;
    my += (ty - my) * 0.12;
    glow += (glowTarget - glow) * 0.08;
    gl.uniform1f(uTime, (now - start) / 1000);
    gl.uniform2f(uMouse, mx * dpr, my * dpr);
    gl.uniform1f(uGlow, glow);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();

/* ===== Scroll reveal (IntersectionObserver) ===== */
(() => {
  const revealEls = document.querySelectorAll(
    '.info-block, .skill-card, .tools-card, .project-card, .contact-info, .contact-form, .showcase-heading'
  );
  if (!revealEls.length || !('IntersectionObserver' in window)) {
    revealEls.forEach(f => f.classList.add('in-view'));
    return;
  }
  const reveal = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in-view');
      }
    });
  }, { threshold: 0.08 });
  revealEls.forEach(f => reveal.observe(f));
})();

/* ===== Animate skill bars on reveal ===== */
(() => {
  const cards = document.querySelectorAll('.skill-card');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const bars = entry.target.querySelectorAll('.skill-progress');
        bars.forEach(bar => {
          bar.style.width = bar.dataset.width || '0%';
        });
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });
  cards.forEach(card => observer.observe(card));
})();

/* ===== Nav hide/show on scroll ===== */
(() => {
  const nav = document.getElementById('nav');
  let lastY = 0;
  window.addEventListener('scroll', () => {
    const sy = window.scrollY;
    if (sy > 80 && sy > lastY) {
      nav.classList.add('nav-hidden');
    } else {
      nav.classList.remove('nav-hidden');
    }
    lastY = sy;
  }, { passive: true });
})();

/* ===== Scrim hide on scroll ===== */
(() => {
  const update = () => {
    document.body.classList.toggle('scrolled', window.scrollY > 16);
  };
  update();
  window.addEventListener('scroll', update, { passive: true });
})();

/* ===== Smooth scrolling for anchor links ===== */
(() => {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const id = this.getAttribute('href');
      if (id === '#') return;
      e.preventDefault();
      const target = document.querySelector(id);
      if (target) {
        window.scrollTo({
          top: target.offsetTop - 64,
          behavior: 'smooth'
        });
      }
    });
  });
})();

/* ===== Mobile menu ===== */
(() => {
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  const mobileClose = document.getElementById('mobileClose');

  if (!hamburger || !mobileMenu) return;

  function open() { mobileMenu.classList.add('open'); }
  function close() { mobileMenu.classList.remove('open'); }

  hamburger.addEventListener('click', open);
  if (mobileClose) mobileClose.addEventListener('click', close);

  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', close);
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') close();
  });
})();
