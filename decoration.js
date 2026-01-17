const musicIcons = ["🎵", "🎶", "🎸", "🎹", "🎤", "🎧", "🎺", "🎻", "🥁", "🎼"];
const filmIcons = ["🎬", "🎥", "🎞️", "📽️", "🍿", "🎭", "🎪", "🏆", "⭐", "🌟"];

const allIcons = [...musicIcons, ...filmIcons];
const animations = ["shake1", "shake2", "shake3", "shake4", "shake5"];

function createDecoration() {
  const decoration = document.createElement("div");
  decoration.className = "decoration";

  // Random icon
  const randomIcon = allIcons[Math.floor(Math.random() * allIcons.length)];
  decoration.textContent = randomIcon;

  // Random position
  decoration.style.left = Math.random() * 100 + "%";
  decoration.style.top = Math.random() * 100 + "%";

  // Random animation
  const randomAnimation =
    animations[Math.floor(Math.random() * animations.length)];
  decoration.classList.add(randomAnimation);

  // Random size
  const randomSize = 30 + Math.random() * 40;
  decoration.style.fontSize = randomSize + "px";

  // Random opacity
  decoration.style.opacity = 0.3 + Math.random() * 0.5;

  // Random animation delay
  decoration.style.animationDelay = Math.random() * 2 + "s";

  document.body.appendChild(decoration);
}

// Buat 15-20 dekorasi random
const totalDecorations = 15 + Math.floor(Math.random() * 6);
for (let i = 0; i < totalDecorations; i++) {
  createDecoration();
}


