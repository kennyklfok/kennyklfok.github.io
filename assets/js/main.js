/* Kenny Fok — site interactions
   Dark-mode-first theme toggle, hero entrance, entrance reveals,
   scroll-drawn timeline rail, active nav highlight, and a small
   "run ecg" easter egg. Respects prefers-reduced-motion and
   degrades gracefully without JS or anime.js. */

(() => {
  "use strict";

  const docEl = document.documentElement;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hasAnime = typeof anime === "function";
  const motion = !reduced && hasAnime;

  /* ---------------- Theme toggle (dark by default) ---------------- */
  const toggle = document.querySelector(".theme-toggle");
  const applyTheme = (theme) => {
    docEl.dataset.theme = theme;
    toggle.textContent = theme === "dark" ? "Dark" : "Light";
  };

  applyTheme(localStorage.getItem("theme") || "dark");

  toggle.addEventListener("click", () => {
    const next = docEl.dataset.theme === "dark" ? "light" : "dark";
    localStorage.setItem("theme", next);
    applyTheme(next);
  });

  if (motion) docEl.classList.add("motion");

  /* ---------------- Hero entrance ---------------- */
  if (motion) {
    const heroEls = document.querySelectorAll("[data-hero]");
    heroEls.forEach((el) => {
      el.style.opacity = "0";
    });

    anime({
      targets: heroEls,
      opacity: [0, 1],
      translateY: [24, 0],
      duration: 850,
      delay: anime.stagger(130, { start: 100 }),
      easing: "easeOutCubic",
    });
  }

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
    const sections = Array.from(byId.keys())
      .map((id) => document.getElementById(id))
      .filter(Boolean);

    const navObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const link = byId.get(entry.target.id);
          if (!link) return;
          if (entry.isIntersecting) {
            navLinks.forEach((a) => a.classList.remove("active"));
            link.classList.add("active");
          }
        });
      },
      // A narrow horizontal band around the viewport's middle decides
      // which section is "current".
      { rootMargin: "-40% 0px -55% 0px", threshold: 0 }
    );

    sections.forEach((s) => navObserver.observe(s));
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

    if (hasAnime) {
      anime({
        targets: path,
        strokeDashoffset: [len, 0],
        duration: 2600,
        easing: "easeInOutSine",
        complete: () => setTimeout(cleanup, 1200),
      });
    } else {
      // CSS-transition fallback.
      path.getBoundingClientRect(); // force layout
      path.style.transition = "stroke-dashoffset 2.6s ease-in-out";
      path.style.strokeDashoffset = "0";
      setTimeout(cleanup, 3800);
    }
  };

  const eggBtn = document.querySelector(".egg-btn");
  if (eggBtn) eggBtn.addEventListener("click", runEcg);

  let keyBuffer = "";
  window.addEventListener("keydown", (e) => {
    if (e.key.length !== 1) return;
    keyBuffer = (keyBuffer + e.key.toLowerCase()).slice(-10);
    if (keyBuffer.endsWith("run ecg")) {
      keyBuffer = "";
      runEcg();
    }
  });
})();
