let muted = false;

export function muteSound() {
  muted = true;
  const music = document.getElementById("music-background");
  music.pause();
}

export function playBackgroundMusic() {
  const music = document.getElementById("music-background");
  music.volume = 0.1;
  music.play();
}

export function playHitSound() {
  playSound("sound-hit");
}

function playSound(soundId) {
  if (!muted) {
    const music = document.getElementById(soundId);
    music.play();
  }
}
