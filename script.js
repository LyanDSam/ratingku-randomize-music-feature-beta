const clickSound = new Audio("note.mp3");
const impact = new Audio("impact.wav");

async function spinImage(totalStep) {
  const blurBg = document.querySelector(".blur-bg");
  blurBg.classList.add("visible");
  setDeepMode(true);
  const button = document.querySelector(".rand-button");
  button.classList.add("disabled");
  const img = document.querySelector(".img-rand");
  img.classList.add("spinning");
  const minDelay = 1;
  const maxDelay = 500;

  for (let i = 0; i < totalStep; i++) {
    randomVinyet();
    const progress = i / totalStep;

    const eased = Math.pow(progress, 3);
    const delay = minDelay + (maxDelay - minDelay) * eased;

    const rand = Math.floor(Math.random() * 1000);

    const newImg = new Image();
    newImg.src = `https://picsum.photos/300/300?random=${rand}`;
    clickSound.currentTime = 0;
    clickSound.play();

    await new Promise((resolve) => {
      newImg.onload = resolve;
      newImg.onerror = resolve;
    });

    img.src = newImg.src;

    await wait(delay);
  }
  impact.play();
  wait(0.7);
  flash();
  button.classList.remove("disabled");
  img.classList.remove("spinning");
  disableVinyet();
  setDeepMode(false);
  blurBg.classList.remove("visible");
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function randomVinyet() {
  const colors = [
    [Math.floor(Math.random() * 256), 0, 0],
    [0, Math.floor(Math.random() * 256), 0],
    [0, 0, Math.floor(Math.random() * 256)],
  ];

  const randomColor = colors[Math.floor(Math.random() * 3)];
  const [r, g, b] = randomColor;

  document.querySelector(".vinyet").style.background =
    `radial-gradient(ellipse at center, rgba(${r},${g},${b},0) 60%, rgba(${r},${g},${b},0.3) 100%)`;
}

function disableVinyet() {
  document.querySelector(".vinyet").style.background = "none";
}

async function flash() {
  const flashDiv = document.querySelector(".flash");
  flashDiv.setAttribute("able", "true");
  await wait(300);
  flashDiv.setAttribute("able", "false");
  await wait(500);
}
document.querySelector(".rand-button").addEventListener("click", randomVinyet);
flash();

function closeAsk() {
  const container = document.querySelector(".bgm-ask");
  container.classList.add("hidden");
}
