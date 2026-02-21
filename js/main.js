/* =========================
   KG Creative — main.js (FIXED)
   - mobile nav
   - mobile services dropdown
   - scroll reveal (only elements already marked .reveal)
   - global page loader
   - featured slider + lightbox (only if present)
   - reviews (only if present)
========================= */

(() => {
  // ✅ Flag that JS is running (used by CSS failsafe)
  document.documentElement.classList.add("js");

  // -------------------------
  // Global Page Loader (ALL PAGES)
  // -------------------------
  const pageLoader = document.getElementById("pageLoader");
  const hideLoader = () => {
    if (!pageLoader) return;
    pageLoader.classList.add("hidden");
  };

  // Hide as soon as page is usable
  window.addEventListener("load", () => {
    // small delay for smoothness
    setTimeout(hideLoader, 350);
  });

  // Extra failsafe: never let loader trap the site
  setTimeout(hideLoader, 2500);

  // -------------------------
  // Mobile nav toggle
  // -------------------------
  const navToggle = document.querySelector(".nav-toggle");
  const siteNav = document.querySelector("#site-nav");

  if (navToggle && siteNav) {
    navToggle.addEventListener("click", () => {
      const open = siteNav.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    });

    // Close menu when clicking a link (mobile)
    siteNav.addEventListener("click", (e) => {
      const a = e.target.closest("a");
      if (!a) return;
      if (window.matchMedia("(max-width: 900px)").matches) {
        siteNav.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  // -------------------------
  // Mobile dropdown toggle (Services)
  // - Your HTML doesn't have .dropdown-toggle, so we target the Services link
  // -------------------------
  const dropdown = document.querySelector(".dropdown");
  const dropdownToggle = dropdown ? dropdown.querySelector("a.nav-link") : null;

  if (dropdown && dropdownToggle) {
    dropdownToggle.addEventListener("click", (e) => {
      // Only intercept on mobile
      if (!window.matchMedia("(max-width: 900px)").matches) return;

      e.preventDefault(); // don't navigate; expand submenu
      const open = dropdown.classList.toggle("open");
      dropdownToggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  // -------------------------
  // Scroll reveal (IMPORTANT FIX)
  // Only reveal elements that YOU already marked with .reveal in HTML
  // (Prevents whole pages being hidden by accident)
  // -------------------------
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const revealTargets = document.querySelectorAll(".reveal");

  // If nothing is marked reveal, do nothing (avoid hiding content)
  if (revealTargets.length) {
    // If reduced motion or no IntersectionObserver, show immediately
    if (prefersReduced || typeof IntersectionObserver === "undefined") {
      revealTargets.forEach((el) => el.classList.add("in"));
    } else {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (!e.isIntersecting) return;
            e.target.classList.add("in");
            io.unobserve(e.target);
          });
        },
        { threshold: 0.12 }
      );

      revealTargets.forEach((el) => io.observe(el));

      // Failsafe: if something is still hidden after 1.5s, show it
      setTimeout(() => {
        revealTargets.forEach((el) => el.classList.add("in"));
      }, 1500);
    }
  }

  // -------------------------
  // Shared Lightbox (Featured slider OR Grid galleries)
  // -------------------------
  const lightbox = document.getElementById("lightbox");
  const lbImg = document.getElementById("lbImg");
  const lbClose = document.getElementById("lbClose");
  const lbPrev = document.getElementById("lbPrev");
  const lbNext = document.getElementById("lbNext");

  // Featured slider elements (index)
  const viewport = document.getElementById("featuredViewport");
  const dotsWrap = document.getElementById("featuredDots");
  const prevBtn = document.querySelector(".featured-nav.prev");
  const nextBtn = document.querySelector(".featured-nav.next");

  let slides = []; // array of {src, alt, el}
  let index = 0;

  function setSlidesFromFeatured() {
    if (!viewport) return false;
    const imgs = Array.from(viewport.querySelectorAll(".featured-slide img"));
    if (!imgs.length) return false;
    slides = imgs.map((img) => ({
      src: img.getAttribute("src"),
      alt: img.getAttribute("alt") || "",
      el: img,
    }));
    return true;
  }

  function setSlidesFromGallery(group = null) {
    const all = Array.from(document.querySelectorAll("img.js-lightbox"));
    if (!all.length) return false;

    const filtered = group
      ? all.filter((img) => (img.getAttribute("data-gallery") || "") === group)
      : all;

    if (!filtered.length) return false;

    slides = filtered.map((img) => ({
      src: img.getAttribute("src"),
      alt: img.getAttribute("alt") || "",
      el: img,
    }));
    return true;
  }

  function updateDots() {
    if (!dotsWrap) return;
    dotsWrap.querySelectorAll("button").forEach((b, i) => {
      b.classList.toggle("active", i === index);
    });
  }

  function goTo(i, smooth = true) {
    if (!viewport || slides.length === 0) return;
    index = Math.max(0, Math.min(i, slides.length - 1));
    const left = index * viewport.clientWidth;
    viewport.scrollTo({ left, behavior: smooth ? "smooth" : "auto" });
    updateDots();
  }

  function openLightbox(i) {
    if (!lightbox || !lbImg || slides.length === 0) return;

    index = Math.max(0, Math.min(i, slides.length - 1));
    lbImg.src = slides[index].src;
    lbImg.alt = slides[index].alt || `Photo ${index + 1}`;

    lightbox.classList.add("open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove("open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
  }

  function lbGo(dir) {
    if (!slides.length || !lbImg) return;
    index = (index + dir + slides.length) % slides.length;
    lbImg.src = slides[index].src;
    lbImg.alt = slides[index].alt || `Photo ${index + 1}`;
    if (viewport) goTo(index);
  }

  // Featured slider wiring (homepage)
  const hasFeatured = setSlidesFromFeatured();

  if (hasFeatured && viewport) {
    if (dotsWrap) {
      dotsWrap.innerHTML = "";
      slides.forEach((_, i) => {
        const b = document.createElement("button");
        b.type = "button";
        b.setAttribute("aria-label", `Go to photo ${i + 1}`);
        b.addEventListener("click", () => goTo(i));
        dotsWrap.appendChild(b);
      });
    }

    updateDots();
    goTo(0, false);

    if (prevBtn) prevBtn.addEventListener("click", () => goTo(index - 1));
    if (nextBtn) nextBtn.addEventListener("click", () => goTo(index + 1));

    viewport.addEventListener("scroll", () => {
      const w = viewport.clientWidth || 1;
      const i = Math.round(viewport.scrollLeft / w);
      if (i !== index) {
        index = i;
        updateDots();
      }
    });

    slides.forEach((s, i) => {
      if (!s.el) return;
      s.el.style.cursor = "zoom-in";
      s.el.addEventListener("click", () => openLightbox(i));
    });
  }

  // Grid galleries wiring
  const galleryImgs = Array.from(document.querySelectorAll("img.js-lightbox"));
  if (galleryImgs.length) {
    galleryImgs.forEach((img) => {
      img.style.cursor = "zoom-in";

      const link = img.closest("a");
      if (link) link.addEventListener("click", (e) => e.preventDefault());

      img.addEventListener("click", () => {
        const group = img.getAttribute("data-gallery") || null;
        setSlidesFromGallery(group);
        const i = slides.findIndex((s) => s.el === img);
        openLightbox(i >= 0 ? i : 0);
      });
    });
  }

  // Lightbox events only if present
  if (lightbox) {
    if (lbClose) lbClose.addEventListener("click", closeLightbox);
    if (lbPrev) lbPrev.addEventListener("click", () => lbGo(-1));
    if (lbNext) lbNext.addEventListener("click", () => lbGo(1));

    lightbox.addEventListener("click", (e) => {
      if (e.target === lightbox) closeLightbox();
    });

    document.addEventListener("keydown", (e) => {
      if (!lightbox.classList.contains("open")) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") lbGo(-1);
      if (e.key === "ArrowRight") lbGo(1);
    });

    // Swipe
    let startX = 0;
    lightbox.addEventListener(
      "touchstart",
      (e) => (startX = e.changedTouches[0].clientX),
      { passive: true }
    );
    lightbox.addEventListener(
      "touchend",
      (e) => {
        const endX = e.changedTouches[0].clientX;
        const diff = endX - startX;
        if (Math.abs(diff) > 40) lbGo(diff > 0 ? -1 : 1);
      },
      { passive: true }
    );
  }

  // -------------------------
  // Reviews (index only) — DO NOT return out of the whole script
  // -------------------------
  const reviewsList = document.getElementById("reviewsList");
  const reviewForm = document.getElementById("reviewForm");
  if (!reviewsList || !reviewForm) return; // safe now, since it's the end

  const REVIEWS_KEY = "kg_reviews_v1";

  const avgRatingEl = document.getElementById("avgRating");
  const avgStarsEl = document.getElementById("avgStars");
  const reviewCountEl = document.getElementById("reviewCount");
  const waBtn = document.getElementById("sendReviewWhatsApp");

  function getStoredReviews() {
    try {
      return JSON.parse(localStorage.getItem(REVIEWS_KEY)) || [];
    } catch {
      return [];
    }
  }

  function setStoredReviews(arr) {
    localStorage.setItem(REVIEWS_KEY, JSON.stringify(arr));
  }

  function escapeHTML(str) {
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function starIcons(rating) {
    const full = Math.max(0, Math.min(5, Number(rating)));
    let html = "";
    for (let i = 1; i <= 5; i++) {
      html += i <= full
        ? '<i class="fa-solid fa-star"></i>'
        : '<i class="fa-regular fa-star"></i>';
    }
    return html;
  }

  function makeReviewCard({ name, service, rating, message }) {
    const firstLetter = (name || "?").trim().charAt(0).toUpperCase() || "?";
    const card = document.createElement("article");
    card.className = "review-card";
    card.innerHTML = `
      <div class="review-top">
        <div class="avatar" aria-hidden="true">${firstLetter}</div>
        <div class="who">
          <p class="name">${escapeHTML(name)}</p>
          <p class="meta">${escapeHTML(service)} • Client review</p>
        </div>
        <div class="stars" aria-label="${rating} star rating">
          ${starIcons(rating)}
        </div>
      </div>
      <p class="review-text">“${escapeHTML(message)}”</p>
    `;
    return card;
  }

  function updateSummary() {
    const cards = Array.from(reviewsList.querySelectorAll(".review-card"));
    const ratings = [];
    cards.forEach((card) => {
      const stars = card.querySelectorAll(".stars i.fa-solid.fa-star").length;
      if (stars) ratings.push(stars);
    });

    const count = ratings.length || 0;
    const avg = count ? ratings.reduce((a, b) => a + b, 0) / count : 0;

    if (avgRatingEl) avgRatingEl.textContent = avg ? avg.toFixed(1) : "0.0";
    if (reviewCountEl) reviewCountEl.textContent = String(count);
    if (avgStarsEl) avgStarsEl.innerHTML = starIcons(Math.round(avg));
  }

  function renderStoredReviews() {
    const stored = getStoredReviews();
    stored.forEach((r) => reviewsList.appendChild(makeReviewCard(r)));
    updateSummary();
  }

  reviewForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = document.getElementById("revName").value.trim();
    const service = document.getElementById("revService").value;
    const rating = Number(document.querySelector('input[name="rating"]:checked')?.value);
    const message = document.getElementById("revMsg").value.trim();

    if (!name || !service || !rating || message.length < 10) return;

    const review = { name, service, rating, message };

    const stored = getStoredReviews();
    stored.unshift(review);
    setStoredReviews(stored);

    reviewsList.insertBefore(makeReviewCard(review), reviewsList.firstChild);
    reviewForm.reset();
    updateSummary();
  });

  if (waBtn) {
    waBtn.addEventListener("click", () => {
      const name = document.getElementById("revName")?.value.trim() || "Anonymous";
      const service = document.getElementById("revService")?.value || "Service";
      const rating = document.querySelector('input[name="rating"]:checked')?.value || "5";
      const message = document.getElementById("revMsg")?.value.trim() || "";

      const stars = "⭐".repeat(Number(rating));
      const text =
        `Hi KG Creative! I want to leave a review:\n\n` +
        `Name: ${name}\n` +
        `Service: ${service}\n` +
        `Rating: ${stars} (${rating}/5)\n` +
        `Review: ${message}\n\n` +
        `You can add this to the website.`;

      const url = `https://wa.me/254713482813?text=${encodeURIComponent(text)}`;
      window.open(url, "_blank", "noopener");
    });
  }

  renderStoredReviews();
})();