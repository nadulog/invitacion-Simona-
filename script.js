const EVENT_DATE = new Date("2026-11-27T21:00:00-03:00");
const LOCATION_URL = "https://share.google/pFxXKKBpxFRk7xKTv";
const GIFT_DETAILS = "";
const MUSIC_URL = "https://open.spotify.com/playlist/1lxHP0LHTlmkNU0AKxeHwd?si=7l7zoMXdSbiMtfP1-h9Xjw&utm_source=whatsapp&pt=cad947bb37bd16954bbde998f2ce7f6d&pi=OlDkYZRrRWmvz";
const BLOOMKEEP_URL = "https://app.bloomkeep.site/simona-15";
const RSVP_URL = "https://bloomdate-rsvp.netlify.app/r/cumple-xv-simona";

const fields = {
  days: document.querySelector("#days"),
  hours: document.querySelector("#hours"),
  minutes: document.querySelector("#minutes"),
  seconds: document.querySelector("#seconds")
};

function updateCountdown() {
  const distance = EVENT_DATE.getTime() - Date.now();

  if (distance <= 0) {
    document.querySelector(".countdown").hidden = true;
    document.querySelector("#eventStarted").hidden = false;
    return;
  }

  fields.days.textContent = String(Math.floor(distance / 86400000));
  fields.hours.textContent = String(Math.floor(distance / 3600000) % 24).padStart(2, "0");
  fields.minutes.textContent = String(Math.floor(distance / 60000) % 60).padStart(2, "0");
  fields.seconds.textContent = String(Math.floor(distance / 1000) % 60).padStart(2, "0");
}

function setupCalendar() {
  const start = "20261128T000000Z";
  const end = "20261128T060000Z";
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: "Mis XV Simona",
    dates: `${start}/${end}`,
    details: "Celebramos los XV de Simona"
  });
  document.querySelector("#calendarLink").href = `https://calendar.google.com/calendar/render?${params}`;
}

function showToast(message) {
  const toast = document.querySelector("#toast");
  toast.textContent = message;
  toast.classList.add("is-visible");
  window.clearTimeout(showToast.timeout);
  showToast.timeout = window.setTimeout(() => toast.classList.remove("is-visible"), 3000);
}

function setupLocation() {
  const button = document.querySelector("#locationButton");
  const modal = document.querySelector("#locationModal");
  const closeButton = modal.querySelector(".location-modal__close");
  const mapLink = modal.querySelector(".location-modal__map");

  mapLink.href = LOCATION_URL;

  function openLocationModal() {
    modal.hidden = false;
    document.body.classList.add("location-modal-open");
    closeButton.focus();
  }

  function closeLocationModal() {
    modal.hidden = true;
    document.body.classList.remove("location-modal-open");
    button.focus();
  }

  button.addEventListener("click", openLocationModal);
  closeButton.addEventListener("click", closeLocationModal);
  modal.addEventListener("click", (event) => { if (event.target === modal) closeLocationModal(); });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !modal.hidden) closeLocationModal();
  });
}

function setupGifts() {
  const button = document.querySelector("#giftButton");
  const modal = document.querySelector("#giftModal");
  const closeButton = modal.querySelector(".gift-modal__close");
  const copyButton = document.querySelector("#copyGiftAlias");

  function openGiftModal() {
    modal.hidden = false;
    document.body.classList.add("gift-modal-open");
    closeButton.focus();
  }

  function closeGiftModal() {
    modal.hidden = true;
    document.body.classList.remove("gift-modal-open");
    button.focus();
  }

  button.addEventListener("click", openGiftModal);
  closeButton.addEventListener("click", closeGiftModal);
  modal.addEventListener("click", (event) => { if (event.target === modal) closeGiftModal(); });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !modal.hidden) closeGiftModal();
  });
  copyButton.addEventListener("click", async () => {
    copyButton.textContent = "Alias copiado";
    window.clearTimeout(copyButton.resetTimeout);
    copyButton.resetTimeout = window.setTimeout(() => { copyButton.textContent = "Copiar alias"; }, 2200);
    try {
      await navigator.clipboard.writeText("simo.alanis");
      showToast("Alias copiado");
    } catch {
      showToast("Alias: simo.alanis");
    }
  });
}

function setupBloomKeep() {
  document.querySelector("#bloomkeepButton").addEventListener("click", () => {
    if (BLOOMKEEP_URL) {
      window.open(BLOOMKEEP_URL, "_blank", "noopener");
      return;
    }
    showToast("Próximamente estará disponible BloomKeep");
  });
}

function setupMusic() {
  document.querySelector("#musicButton").addEventListener("click", () => {
    if (MUSIC_URL) {
      window.open(MUSIC_URL, "_blank", "noopener");
      return;
    }
    showToast("Próximamente podrás agregar tu canción");
  });
}

function setupRsvp() {
  document.querySelector("#rsvpButton").addEventListener("click", () => {
    if (RSVP_URL) {
      window.open(RSVP_URL, "_blank", "noopener");
      return;
    }
    showToast("Próximamente podrás confirmar tu asistencia");
  });
}

function setupGallery() {
  const items = [...document.querySelectorAll("[data-gallery-index]")];
  const track = document.querySelector(".photo-gallery__grid");
  const carouselPrevious = document.querySelector(".photo-gallery__nav--prev");
  const carouselNext = document.querySelector(".photo-gallery__nav--next");
  const lightbox = document.querySelector("#galleryLightbox");
  const image = lightbox.querySelector(".lightbox__image");
  const counter = lightbox.querySelector(".lightbox__counter");
  let currentIndex = 0;
  let lastTrigger = null;

  function carouselStep() {
    const gap = parseFloat(getComputedStyle(track).gap) || 0;
    return items[0].getBoundingClientRect().width + gap;
  }

  function updateCarouselArrows() {
    const atStart = track.scrollLeft <= 4;
    const atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 4;
    carouselPrevious.disabled = atStart;
    carouselNext.disabled = atEnd;
  }

  carouselPrevious.addEventListener("click", () => track.scrollBy({ left: -carouselStep(), behavior: "smooth" }));
  carouselNext.addEventListener("click", () => track.scrollBy({ left: carouselStep(), behavior: "smooth" }));
  track.addEventListener("scroll", updateCarouselArrows, { passive: true });
  window.addEventListener("resize", updateCarouselArrows);
  updateCarouselArrows();

  function showPhoto(index) {
    currentIndex = (index + items.length) % items.length;
    const thumbnail = items[currentIndex].querySelector("img");
    image.src = thumbnail.src;
    image.alt = thumbnail.alt;
    counter.textContent = `${currentIndex + 1} / ${items.length}`;
  }

  function openGallery(index, trigger) {
    lastTrigger = trigger;
    showPhoto(index);
    lightbox.hidden = false;
    document.body.classList.add("lightbox-open");
    lightbox.querySelector(".lightbox__close").focus();
  }

  function closeGallery() {
    lightbox.hidden = true;
    document.body.classList.remove("lightbox-open");
    image.src = "";
    lastTrigger?.focus();
  }

  items.forEach((item, index) => item.addEventListener("click", () => openGallery(index, item)));
  lightbox.querySelector(".lightbox__close").addEventListener("click", closeGallery);
  lightbox.querySelector(".lightbox__arrow--prev").addEventListener("click", () => showPhoto(currentIndex - 1));
  lightbox.querySelector(".lightbox__arrow--next").addEventListener("click", () => showPhoto(currentIndex + 1));
  lightbox.addEventListener("click", (event) => { if (event.target === lightbox) closeGallery(); });
  document.addEventListener("keydown", (event) => {
    if (lightbox.hidden) return;
    if (event.key === "Escape") closeGallery();
    if (event.key === "ArrowLeft") showPhoto(currentIndex - 1);
    if (event.key === "ArrowRight") showPhoto(currentIndex + 1);
  });
}

function setupVideoCutoffs() {
  document.querySelectorAll("video[data-end-time]").forEach((video) => {
    const endTime = Number(video.dataset.endTime);

    function stopAtCutoff() {
      if (video.currentTime < endTime) return;
      video.currentTime = endTime;
      video.pause();
    }

    video.addEventListener("timeupdate", stopAtCutoff);
    video.addEventListener("seeking", stopAtCutoff);
    video.addEventListener("play", () => {
      if (video.currentTime >= endTime - .05) video.currentTime = 0;
    });
  });
}

function keepVideosMuted() {
  document.querySelectorAll(".video-frame video").forEach((video) => {
    video.muted = true;
    video.volume = 0;
    video.addEventListener("volumechange", () => {
      if (!video.muted || video.volume !== 0) {
        video.muted = true;
        video.volume = 0;
      }
    });
  });
}

function setupInvitationAudio() {
  const audio = document.querySelector("#invitationAudio");
  const toggle = document.querySelector("#audioToggle");

  function syncAudioButton() {
    const isPlaying = !audio.paused;
    toggle.setAttribute("aria-pressed", String(isPlaying));
    toggle.setAttribute("aria-label", isPlaying ? "Pausar música" : "Reproducir música");
  }

  toggle.addEventListener("click", async () => {
    if (!audio.paused) {
      audio.pause();
      return;
    }

    try {
      await audio.play();
    } catch {
      showToast("Tocá nuevamente para reproducir la música");
    }
  });

  audio.addEventListener("play", syncAudioButton);
  audio.addEventListener("pause", syncAudioButton);
  syncAudioButton();
}

function setupWelcomeScreen() {
  const screen = document.querySelector("#welcomeScreen");
  const audio = document.querySelector("#invitationAudio");

  function enterInvitation() {
    document.body.classList.add("invitation-entered");
    screen.classList.add("is-closing");
    window.setTimeout(() => { screen.hidden = true; }, 600);
  }

  document.querySelector("#enterWithMusic").addEventListener("click", () => {
    enterInvitation();
    audio.play().catch(() => showToast("Tocá la nota musical para iniciar el audio"));
  });

  document.querySelector("#enterWithoutMusic").addEventListener("click", () => {
    audio.pause();
    enterInvitation();
  });
}

updateCountdown();
setupCalendar();
setupLocation();
setupGifts();
setupMusic();
setupBloomKeep();
setupGallery();
setupVideoCutoffs();
keepVideosMuted();
setupInvitationAudio();
setupWelcomeScreen();
setupRsvp();
window.setInterval(updateCountdown, 1000);
