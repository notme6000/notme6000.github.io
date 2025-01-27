// script.js
const output = document.getElementById("output");
const input = document.getElementById("input");

const commands = {
  help: "Available commands: <span class='cmd'>about</span>, <span class='cmd'>projects</span>, <span class='cmd'>contact</span>, <span class='cmd'>clear</span>",
  about: "Hi! I'm a web developer with a passion for creating terminal-style websites.",
  projects: "1. Terminal Portfolio\n 2. E-commerce Website\n 3. Real-time Packet Sniffer",
  contact: "Email: notmee6000@gmail.com | GitHub: github.com/notme6000",
  clear: "",
};

function handleCommand(command) {
  if (command in commands) {
    return commands[command];
  }
  return `Command not found: <span class='cmd'>${command}</span>. Type <span class='cmd'>help</span> for a list of commands.`;
}

function addOutput(text) {
  const div = document.createElement("div");
  div.innerHTML = text;
  output.appendChild(div);
  output.scrollTop = output.scrollHeight;
}

input.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && input.value.trim()) {
    const command = input.value.trim();
    addOutput(`<span>${document.getElementById("prompt").textContent} ${command}</span>`);
    const response = handleCommand(command);
    if (command === "clear") {
      output.innerHTML = "";
    } else {
      addOutput(response);
    }
    input.value = "";
  }
});
