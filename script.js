document.addEventListener("DOMContentLoaded", () => {
  "use strict";

  const site = document.getElementById("site");
  const sections = [...document.querySelectorAll(".screen, .letter-section")];
  const progressBar = document.getElementById("progress-bar");

  const startBtn = document.getElementById("start-btn");
  const musicBtn = document.getElementById("music-btn");
  const music = document.getElementById("bg-music");

  const countdown = document.getElementById("countdown");
  const birthdayReveal = document.getElementById("birthday-reveal");

  const envelope = document.getElementById("envelope-container");
  const letter = document.getElementById("full-letter");

  const finalBtn = document.getElementById("final-btn");
  const finalReveal = document.getElementById("final-reveal");
  const replayBtn = document.getElementById("replay-btn");
  const particles = document.getElementById("particles");

  let musicPlaying = false;
  let countdownStarted = false;
  let countdownTimers = [];
  let letterOpened = false;

  /* ---------------------------------------------------------
     Navigation
     --------------------------------------------------------- */

  function goTo(index) {
    const target = sections[index];
    if (!target) return;

    const siteRect = site.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();

    const top =
      site.scrollTop +
      (targetRect.top - siteRect.top);

    site.scrollTo({
      top: Math.max(0, top),
      behavior: "smooth"
    });
  }

  document.querySelectorAll(".next-btn").forEach((button) => {
    button.addEventListener("click", () => {
      const current = button.closest(".screen, .letter-section");
      const index = sections.indexOf(current);

      if (index !== -1 && index < sections.length - 1) {
        goTo(index + 1);
      }
    });
  });

  /* ---------------------------------------------------------
     Music
     Music can NEVER block navigation.
     --------------------------------------------------------- */

  function updateMusicButton() {
    musicBtn.textContent = musicPlaying ? "Ⅱ Pause Music" : "♫ Play Music";
    musicBtn.classList.toggle("playing", musicPlaying);
  }

  async function tryPlayMusic() {
    try {
      await music.play();
      musicPlaying = true;
      updateMusicButton();
    } catch {
      musicPlaying = false;
      updateMusicButton();
      // This is expected when music.mp3 is missing or browser blocks it.
    }
  }

  function pauseMusic() {
    music.pause();
    musicPlaying = false;
    updateMusicButton();
  }

  musicBtn.addEventListener("click", () => {
    if (musicPlaying) {
      pauseMusic();
    } else {
      tryPlayMusic();
    }
  });

  music.addEventListener("play", () => {
    musicPlaying = true;
    updateMusicButton();
  });

  music.addEventListener("pause", () => {
    musicPlaying = false;
    updateMusicButton();
  });

  music.addEventListener("error", () => {
    musicPlaying = false;
    updateMusicButton();
  });

  /* First button: navigate FIRST, music SECOND. */
  startBtn.addEventListener("click", () => {
    goTo(1);
    tryPlayMusic();
  });

  /* ---------------------------------------------------------
     Countdown
     --------------------------------------------------------- */

  function clearCountdown() {
    countdownTimers.forEach(clearTimeout);
    countdownTimers = [];
  }

  function animateNumber(value) {
    countdown.textContent = value;
    countdown.style.animation = "none";
    void countdown.offsetWidth;
    countdown.style.animation = "countdownPop .8s ease";
  }

  function startCountdown() {
    if (countdownStarted) return;
    countdownStarted = true;
    clearCountdown();

    countdown.classList.remove("hidden");
    birthdayReveal.classList.add("hidden");

    ["3", "2", "1"].forEach((value, i) => {
      countdownTimers.push(
        setTimeout(() => animateNumber(value), i * 850)
      );
    });

    countdownTimers.push(
      setTimeout(() => {
        countdown.classList.add("hidden");
        birthdayReveal.classList.remove("hidden");
      }, 2750)
    );
  }

  /* ---------------------------------------------------------
     Intersection observer
     --------------------------------------------------------- */

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        entry.target.querySelectorAll(
          ".reveal-on-view"
        ).forEach((el) => el.classList.add("visible"));

        if (entry.target.id === "screen-2") {
          startCountdown();
        }
      });
    },
    {
      root: site,
      threshold: 0.3
    }
  );

  sections.forEach((section) => observer.observe(section));

  /* Progress based on the actual scroll container. */
  function updateProgress() {
    const max = site.scrollHeight - site.clientHeight;
    const value = max > 0 ? (site.scrollTop / max) * 100 : 0;
    progressBar.style.width = `${Math.min(100, Math.max(0, value))}%`;
  }

  site.addEventListener("scroll", updateProgress, { passive: true });
  window.addEventListener("resize", updateProgress);
  updateProgress();

  /* ---------------------------------------------------------
     Notice cards
     --------------------------------------------------------- */

  document.querySelectorAll(".notice-card").forEach((card) => {
    card.addEventListener("click", () => {
      const open = card.classList.toggle("open");
      const symbol = card.querySelector(".notice-head b");
      if (symbol) symbol.textContent = open ? "×" : "+";
    });
  });

  /* ---------------------------------------------------------
     Stars
     --------------------------------------------------------- */

  const stars = document.getElementById("stars");

  if (stars) {
    const fragment = document.createDocumentFragment();

    for (let i = 0; i < 80; i++) {
      const star = document.createElement("span");
      const size = Math.random() * 2 + 0.6;

      star.className = "star";
      star.style.width = `${size}px`;
      star.style.height = `${size}px`;
      star.style.left = `${Math.random() * 100}%`;
      star.style.top = `${Math.random() * 100}%`;
      star.style.setProperty(
        "--duration",
        `${Math.random() * 2.5 + 1.5}s`
      );

      fragment.appendChild(star);
    }

    stars.appendChild(fragment);
  }

  /* ---------------------------------------------------------
     Letter
     --------------------------------------------------------- */

  function openLetter() {
    if (letterOpened) return;

    letterOpened = true;
    envelope.classList.add("opening");

    // IMPORTANT:
    // Do not calculate offsetTop here and do not scroll the page.
    // The previous version measured the letter while it was display:none,
    // which could return 0 and send the user back to the top of the site.
    //
    // Instead, reveal the letter in the exact same document flow position.
    // The user stays on Screen 9 and can naturally scroll through the letter.
    setTimeout(() => {
      envelope.classList.add("hidden");
      letter.classList.remove("hidden");
      updateProgress();
    }, 650);
  }

  envelope.addEventListener("click", openLetter);

  envelope.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openLetter();
    }
  });

  /* ---------------------------------------------------------
     Final surprise
     --------------------------------------------------------- */

  function makeParticles() {
    const symbols = ["❤️", "💖", "✨", "🤍", "🌹", "🫶🏻"];

    for (let i = 0; i < 60; i++) {
      setTimeout(() => {
        const particle = document.createElement("span");

        particle.className = "particle";
        particle.textContent =
          symbols[Math.floor(Math.random() * symbols.length)];

        particle.style.left = `${Math.random() * 100}%`;
        particle.style.fontSize = `${10 + Math.random() * 17}px`;
        particle.style.animationDuration = `${3 + Math.random() * 2.5}s`;

        particles.appendChild(particle);

        setTimeout(() => particle.remove(), 6000);
      }, i * 65);
    }
  }

  finalBtn.addEventListener("click", () => {
    finalBtn.classList.add("hidden");
    finalReveal.classList.remove("hidden");
    makeParticles();
  });

  /* ---------------------------------------------------------
     Replay
     --------------------------------------------------------- */

  replayBtn.addEventListener("click", () => {
    clearCountdown();

    countdownStarted = false;
    letterOpened = false;

    countdown.textContent = "3";
    countdown.classList.remove("hidden");
    birthdayReveal.classList.add("hidden");

    envelope.classList.remove("hidden", "opening");
    letter.classList.add("hidden");

    document.querySelectorAll(".notice-card").forEach((card) => {
      card.classList.remove("open");
      const symbol = card.querySelector(".notice-head b");
      if (symbol) symbol.textContent = "+";
    });

    finalBtn.classList.remove("hidden");
    finalReveal.classList.add("hidden");
    particles.replaceChildren();

    if (musicPlaying) pauseMusic();

    goTo(0);
  });
});
