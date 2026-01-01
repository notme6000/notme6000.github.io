// Theme functionality
function changeTheme(theme) {
  document.body.className = `theme-${theme}`;
  document.getElementById('themeOptions').style.display = 'none';
}

function toggleThemeOptions() {
  const themeOptions = document.getElementById('themeOptions');
  themeOptions.style.display = themeOptions.style.display === 'flex' ? 'none' : 'flex';
}

// Mobile menu functionality
document.getElementById('mobileMenuBtn').addEventListener('click', function () {
  const mobileMenu = document.getElementById('mobileMenu');
  mobileMenu.style.display = mobileMenu.style.display === 'block' ? 'none' : 'block';
});

// Close mobile menu when clicking a link
document.querySelectorAll('#mobileMenu a').forEach(link => {
  link.addEventListener('click', function () {
    document.getElementById('mobileMenu').style.display = 'none';
  });
});

// Animate skill bars on scroll
function animateSkills() {
  const skillBars = document.querySelectorAll('.skill-progress');
  skillBars.forEach(bar => {
    const width = bar.style.width;
    bar.style.width = '0';
    setTimeout(() => {
      bar.style.width = width;
    }, 100);
  });
}

// Intersection Observer for skill animation
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateSkills();
      observer.unobserve(entry.target);
    }
  });
}, {threshold: 0.1});

const skillsSection = document.getElementById('skills');
if (skillsSection) {
  observer.observe(skillsSection);
}

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const targetId = this.getAttribute('href');
    const targetElement = document.querySelector(targetId);
    if (targetElement) {
      window.scrollTo({
        top: targetElement.offsetTop - 80,
        behavior: 'smooth'
      });
    }
  });
});

