/* Native interactions, a first-visit ECG, and a continuous single-lead ECG. */

(() => {
  "use strict";

  const docEl = document.documentElement;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const motion = !reduced;

  // Fit twelve clipped lead cells and a rhythm strip into the existing canvas.
  const ecg = document.querySelector(".hero-ecg");
  if (ecg) {
    const make = (tag, attributes) => {
      const node = document.createElementNS("http://www.w3.org/2000/svg", tag);
      Object.entries(attributes).forEach(([key, value]) => node.setAttribute(key, value));
      return node;
    };
    ecg.querySelector(":scope > .ecg-strip")?.remove();
    ecg.setAttribute("aria-label", "Illustrative animated twelve-lead ECG with a Lead II rhythm strip");
    const leads = [["I", .48], ["aVR", -.55], ["V1", -.4], ["V4", 1.05], ["II", .85], ["aVL", .32], ["V2", -.2], ["V5", .9], ["III", .37], ["aVF", .62], ["V3", .65], ["V6", .7]];
    const draw = (name, gain, x, y, width) => {
      const cell = make("svg", { x, y, width, height: 106, viewBox: `0 0 ${width} 106`, overflow: "hidden" });
      const trace = make("g", { transform: `translate(0 ${62 - 300 * gain * .34}) scale(.5 ${gain * .34})` });
      const strip = make("g", { class: "ecg-strip" });
      for (let i = 0; i < 3; i++) strip.append(make("use", { href: "#sinus-beats", x: i * 960 }));
      trace.append(strip);
      cell.append(trace);
      const label = make("text", { x: 8, y: 16, fill: "currentColor", "font-size": 16, "font-family": "monospace" });
      label.textContent = name;
      cell.append(label);
      ecg.append(cell);
    };
    leads.forEach(([name, gain], i) => draw(name, gain, (i % 4) * 232 + 16, Math.floor(i / 4) * 112 + 92, 224));
    draw("II", .85, 16, 436, 928);
  }
  const readStored = (key) => {
    try { return localStorage.getItem(key); } catch (_) { return null; }
  };
  const store = (key, value) => {
    try { localStorage.setItem(key, value); } catch (_) { /* Optional persistence. */ }
  };

  /* ---------------- Theme toggle (dark by default) ---------------- */
  const toggle = document.querySelector(".theme-toggle");
  const applyTheme = (theme) => {
    docEl.dataset.theme = theme;
    toggle.textContent = theme === "dark" ? "Dark" : "Light";
    toggle.setAttribute("aria-label", `Switch to ${theme === "dark" ? "light" : "dark"} mode`);
    document.querySelector('meta[name="theme-color"]').content = theme === "dark" ? "#080a0c" : "#f5f6f4";
  };

  applyTheme(readStored("theme") === "light" ? "light" : "dark");

  toggle.addEventListener("click", () => {
    const next = docEl.dataset.theme === "dark" ? "light" : "dark";
    store("theme", next);
    applyTheme(next);
  });

  if (motion && "IntersectionObserver" in window) docEl.classList.add("motion");

  const introPlaying = docEl.classList.contains("intro-pending");
  const introOverlay = document.querySelector(".site-intro");
  let introTimer;
  const finishIntro = () => {
    clearTimeout(introTimer);
    docEl.classList.remove("intro-pending");
  };
  // Finish on the actual fade endpoint, rather than cutting the animation short.
  introOverlay.addEventListener("animationend", (event) => {
    if (event.target === introOverlay && event.animationName === "intro-exit") finishIntro();
  });
  if (introPlaying) {
    store("kenny-ecg-intro-seen", "1");
    introTimer = setTimeout(finishIntro, 3600); // Fallback if animation events are unavailable.
  }
  document.querySelector(".replay-intro").addEventListener("click", () => {
    if (reduced) return;
    clearTimeout(introTimer);
    docEl.classList.remove("intro-pending");
    introOverlay.getBoundingClientRect();
    docEl.classList.add("intro-pending");
    window.scrollTo({ top: 0, behavior: "instant" });
    introTimer = setTimeout(finishIntro, 3600);
  });

  /* ---------------- Hero entrance ---------------- */
  if (motion && !introPlaying) {
    const heroEls = document.querySelectorAll("[data-hero]");
    heroEls.forEach((el, index) => {
      el.animate?.([{ opacity: 0, transform: "translateY(12px)" }, { opacity: 1, transform: "none" }], {
        duration: 650,
        delay: 50 + index * 80,
        easing: "cubic-bezier(.2,.65,.3,1)",
        fill: "backwards",
      });
    });
  }

  /* A finite native track with circular button navigation. No duplicate links. */
  const track = document.querySelector(".project-grid");
  const cards = Array.from(track.querySelectorAll(".project-card"));
  const pagination = document.querySelector(".project-pagination");
  const counter = document.querySelector(".project-counter");
  let current = 0;
  const projectName = (card) => card.querySelector("h3").textContent.trim();
  const markCurrent = (index) => {
    current = index;
    counter.textContent = `${String(index + 1).padStart(2, "0")} / ${String(cards.length).padStart(2, "0")}`;
    pagination.querySelectorAll("button").forEach((button, i) => {
      if (i === index) button.setAttribute("aria-current", "true");
      else button.removeAttribute("aria-current");
    });
  };
  const projectScrollLeft = (index) => {
    const maxScroll = Math.max(0, track.scrollWidth - track.clientWidth);
    if (index === cards.length - 1) return maxScroll;
    const padding = parseFloat(getComputedStyle(track).paddingLeft);
    const left = cards[index].getBoundingClientRect().left - track.getBoundingClientRect().left + track.scrollLeft - padding;
    return Math.max(0, Math.min(left, maxScroll));
  };
  const goToProject = (index) => {
    const next = (index + cards.length) % cards.length;
    track.scrollTo({ left: projectScrollLeft(next), behavior: reduced ? "instant" : "smooth" });
    markCurrent(next);
  };
  cards.forEach((card, index) => {
    card.classList.remove("reveal");
    card.setAttribute("role", "group");
    card.setAttribute("aria-roledescription", "slide");
    card.setAttribute("aria-label", `${index + 1} of ${cards.length}: ${projectName(card)}`);
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = String(index + 1).padStart(2, "0");
    button.setAttribute("aria-label", `Show ${projectName(card)}`);
    button.setAttribute("aria-controls", "project-track");
    button.addEventListener("click", () => goToProject(index));
    pagination.append(button);
  });
  document.querySelector(".project-prev").addEventListener("click", () => goToProject(current - 1));
  document.querySelector(".project-next").addEventListener("click", () => goToProject(current + 1));
  track.addEventListener("keydown", (event) => {
    if (event.target !== track) return;
    if (["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) {
      event.preventDefault();
      goToProject(event.key === "Home" ? 0 : event.key === "End" ? cards.length - 1 : current + (event.key === "ArrowRight" ? 1 : -1));
    }
  });
  // Translate vertical wheel input locally; release page scrolling at either end.
  track.addEventListener("pointerdown", (event) => {
    if (event.pointerType === "touch") track.style.removeProperty("scroll-snap-type");
  }, { passive: true });
  track.addEventListener("wheel", (event) => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || Math.abs(event.deltaX) >= Math.abs(event.deltaY)) return;
    const maxScroll = Math.max(0, track.scrollWidth - track.clientWidth);
    const delta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? track.clientWidth : 1);
    if (!maxScroll || !delta || (delta < 0 && track.scrollLeft <= 1) || (delta > 0 && track.scrollLeft >= maxScroll - 1)) return;
    if (!event.cancelable) return;
    event.preventDefault();
    track.style.scrollSnapType = "none";
    track.scrollLeft = Math.max(0, Math.min(maxScroll, track.scrollLeft + delta));
  }, { passive: false });

  let scrollFrame = false;
  track.addEventListener("scroll", () => {
    if (scrollFrame) return;
    scrollFrame = true;
    requestAnimationFrame(() => {
      const origin = track.getBoundingClientRect().left + parseFloat(getComputedStyle(track).paddingLeft);
      let closest = 0;
      cards.forEach((card, index) => {
        if (Math.abs(card.getBoundingClientRect().left - origin) < Math.abs(cards[closest].getBoundingClientRect().left - origin)) closest = index;
      });
      // At the end, the last card sits against the right gutter, not the left.
      const maxScroll = track.scrollWidth - track.clientWidth;
      if (maxScroll > 0 && track.scrollLeft >= maxScroll - 2) closest = cards.length - 1;
      markCurrent(closest);
      scrollFrame = false;
    });
  }, { passive: true });
  track.addEventListener("focusin", (event) => {
    const card = event.target.closest(".project-card");
    if (card) goToProject(cards.indexOf(card));
  });
  window.addEventListener("resize", () => {
    track.scrollLeft = projectScrollLeft(current);
  });
  markCurrent(0);
  docEl.classList.add("gallery-ready");

  /* ---------------- Entrance reveals ---------------- */
  const reveals = document.querySelectorAll(".reveal");

  if (motion && "IntersectionObserver" in window) {
    // Stagger siblings that share a parent so grids cascade gently.
    const groups = new Map();
    reveals.forEach((el) => {
      const parent = el.parentElement;
      if (!groups.has(parent)) groups.set(parent, 0);
      const i = groups.get(parent);
      el.style.setProperty("--reveal-delay", Math.min(i * 90, 360) + "ms");
      groups.set(parent, i + 1);
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
    );

    reveals.forEach((el) => observer.observe(el));
  }

  /* ---------------- Active nav highlight ---------------- */
  const navLinks = Array.from(
    document.querySelectorAll('.site-nav a[href^="#"]')
  );

  if (navLinks.length && "IntersectionObserver" in window) {
    const byId = new Map(
      navLinks.map((a) => [a.getAttribute("href").slice(1), a])
    );
    const setActive = (link) => {
      navLinks.forEach((a) => a.classList.remove("active"));
      link.classList.add("active");
    };
    const sections = Array.from(byId.keys())
      .map((id) => document.getElementById(id))
      .filter(Boolean);

    const navObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const link = byId.get(entry.target.id);
          if (!link) return;
          if (entry.isIntersecting) {
            setActive(link);
          }
        });
      },
      // A narrow horizontal band around the viewport's middle decides
      // which section is "current".
      { rootMargin: "-40% 0px -55% 0px", threshold: 0 }
    );
    sections.forEach((s) => navObserver.observe(s));

    const contactLink = byId.get("contact");
    let activeBeforeBottom = null;
    const updateBottomNav = () => {
      const atBottom =
        window.scrollY + window.innerHeight >=
        document.documentElement.scrollHeight - 1;

      if (atBottom && contactLink) {
        if (!activeBeforeBottom && !contactLink.classList.contains("active")) {
          activeBeforeBottom =
            navLinks.find((link) => link.classList.contains("active")) || null;
        }
        setActive(contactLink);
      } else if (!atBottom && activeBeforeBottom) {
        setActive(activeBeforeBottom);
        activeBeforeBottom = null;
      }
    };

    window.addEventListener("scroll", updateBottomNav, { passive: true });
    window.addEventListener("resize", updateBottomNav);
    updateBottomNav();
  }


  /* ---------------- Experience timeline: scroll-drawn rail ---------------- */
  const flow = document.querySelector(".timeline-flow");
  const list = flow ? flow.querySelector("ol") : null;

  if (flow && list) {
    flow.classList.add("has-rail");
    const items = Array.from(list.children);
    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("class", "timeline-rail");
    svg.setAttribute("aria-hidden", "true");
    flow.prepend(svg);

    const lineX = 20;
    const line = document.createElementNS(svgNS, "path");
    line.setAttribute("class", "rail-line");
    svg.appendChild(line);

    let nodes = [];
    let railHeight = 0;
    let lineLen = 0;

    const build = () => {
      nodes.forEach((n) => n.dot.remove());
      nodes = [];

      railHeight = list.offsetHeight;
      const listTop = list.getBoundingClientRect().top;
      svg.setAttribute("viewBox", "0 0 40 " + railHeight);
      svg.setAttribute("width", "40");
      svg.setAttribute("height", railHeight);

      line.setAttribute("d", "M" + lineX + " 0 V" + railHeight);
      lineLen = railHeight;
      line.style.strokeDasharray = lineLen;

      items.forEach((li) => {
        const y = Math.round(li.getBoundingClientRect().top - listTop + 40);

        const dot = document.createElementNS(svgNS, "circle");
        dot.setAttribute("class", "rail-dot");
        dot.setAttribute("cx", lineX);
        dot.setAttribute("cy", y);
        dot.setAttribute("r", 4);
        svg.appendChild(dot);

        nodes.push({ li, y, dot });
      });
    };

    let drawn = -1;
    const update = () => {
      const rect = flow.getBoundingClientRect();
      const target = window.innerHeight * 0.68 - rect.top;
      const next = Math.max(0, Math.min(railHeight, target));
      if (next === drawn) return;
      drawn = next;
      line.style.strokeDashoffset = lineLen - drawn;
      nodes.forEach((n) => {
        const passed = n.y <= drawn;
        n.li.classList.toggle("is-passed", passed);
        n.dot.classList.toggle("is-on", passed);
      });
    };

    if (reduced) {
      build();
      line.style.strokeDasharray = "none";
      nodes.forEach((n) => {
        n.li.classList.add("is-passed");
        n.dot.classList.add("is-on");
      });
    } else {
      build();
      update();

      let ticking = false;
      window.addEventListener(
        "scroll",
        () => {
          if (ticking) return;
          ticking = true;
          requestAnimationFrame(() => {
            update();
            ticking = false;
          });
        },
        { passive: true }
      );

      let resizeTimer;
      window.addEventListener("resize", () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
          build();
          drawn = -1;
          update();
        }, 180);
      });
    }
  }

  /* ---------------- Easter egg: run ecg ---------------- */
  // Trigger by clicking "run ecg" in the footer or typing: run ecg
  let eggRunning = false;

  const BEAT =
    "h40 c5 0 8 -11 14 -11 c6 0 9 11 14 11 h14 l5 6 l7 -44 l7 52 l4 -14 " +
    "h12 c8 0 12 -16 20 -16 c8 0 12 16 20 16 h40";

  const runEcg = () => {
    if (eggRunning) return;
    eggRunning = true;

    const wrap = document.createElement("div");
    wrap.className = "ecg-egg";
    wrap.setAttribute("aria-hidden", "true");

    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("viewBox", "0 0 1400 120");
    svg.setAttribute("preserveAspectRatio", "none");

    const path = document.createElementNS(svgNS, "path");
    path.setAttribute("d", "M0 60 " + BEAT.repeat(7) + " H1400");
    svg.appendChild(path);

    const label = document.createElement("span");
    label.className = "egg-label";
    label.textContent = "Normal sinus rhythm · 60 bpm";

    wrap.appendChild(svg);
    wrap.appendChild(label);
    document.body.appendChild(wrap);

    const cleanup = () => {
      wrap.classList.add("fade-out");
      setTimeout(() => {
        wrap.remove();
        eggRunning = false;
      }, 1000);
    };

    if (reduced) {
      // No drawing animation — show briefly, then fade.
      setTimeout(cleanup, 2200);
      return;
    }

    const len = path.getTotalLength();
    path.style.strokeDasharray = len;
    path.style.strokeDashoffset = len;

    path.getBoundingClientRect(); // Start the native drawing transition.
    path.style.transition = "stroke-dashoffset 2.6s ease-in-out";
    path.style.strokeDashoffset = "0";
    setTimeout(cleanup, 3800);
  };

  const eggBtn = document.querySelector(".egg-btn");
  if (eggBtn) eggBtn.addEventListener("click", runEcg);

  let keyBuffer = "";
  window.addEventListener("keydown", (e) => {
    if (e.target.closest('input, textarea, select, [contenteditable="true"]') || e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key.length !== 1) return;
    keyBuffer = (keyBuffer + e.key.toLowerCase()).slice(-10);
    if (keyBuffer.endsWith("run ecg")) {
      keyBuffer = "";
      runEcg();
    }
  });

  /* ---------------- Expanded project screenshots ---------------- */
  const imageDialog = document.getElementById("project-image-dialog");
  if (imageDialog && typeof imageDialog.showModal === "function") {
    const largeImage = imageDialog.querySelector(".image-lightbox-image");
    const imageTitle = imageDialog.querySelector("#project-image-title");
    let imageTrigger = null;

    document.querySelectorAll(".project-preview").forEach((link) => {
      link.addEventListener("click", (event) => {
        if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        const thumbnail = link.querySelector("img");
        if (!thumbnail) return;
        event.preventDefault();
        imageTrigger = link;
        largeImage.src = link.href;
        largeImage.alt = thumbnail.alt;
        imageTitle.textContent = link.closest(".project-card").querySelector("h3").textContent;
        document.documentElement.classList.add("image-lightbox-open");
        imageDialog.showModal();
      });
    });
    imageDialog.querySelector(".image-lightbox-close").addEventListener("click", () => imageDialog.close());
    imageDialog.addEventListener("click", (event) => {
      if (event.target === imageDialog) imageDialog.close();
    });
    imageDialog.addEventListener("close", () => {
      document.documentElement.classList.remove("image-lightbox-open");
      largeImage.removeAttribute("src");
      if (imageTrigger) imageTrigger.focus({ preventScroll: true });
    });
  }

})();
