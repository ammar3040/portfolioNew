// =========================================================
// Ammar Shaikh — Portfolio interactions
// Split-text · Horizontal pin-scroll · Text fill · Timeline draw · Matte 3D sculpture
// =========================================================

import * as THREE from "three";
import Lenis from "lenis";

const { gsap } = window;
const ScrollTrigger = window.ScrollTrigger;
gsap.registerPlugin(ScrollTrigger);

/* ---------- Utility: split text into chars ---------- */
function splitToChars(el) {
  const text = el.textContent;
  el.textContent = "";
  const frag = document.createDocumentFragment();
  const chars = [];
  for (const ch of text) {
    if (ch === " ") {
      frag.appendChild(document.createTextNode(" "));
      continue;
    }
    const s = document.createElement("span");
    s.className = "char";
    s.textContent = ch;
    frag.appendChild(s);
    chars.push(s);
  }
  el.appendChild(frag);
  return chars;
}

/* ---------- Year ---------- */
document.getElementById("year").textContent = new Date().getFullYear();

/* ---------- Theme toggle ---------- */
const modeToggle = document.getElementById("modeToggle");
const storedMode = localStorage.getItem("mode");
if (storedMode) document.documentElement.setAttribute("data-mode", storedMode);
modeToggle.addEventListener("click", () => {
  const cur = document.documentElement.getAttribute("data-mode") || "dark";
  const next = cur === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-mode", next);
  localStorage.setItem("mode", next);
  window.dispatchEvent(new CustomEvent("themechange", { detail: next }));
});

/* ---------- Nav toggle ---------- */
const navToggle = document.getElementById("navToggle");
const navLinks = document.getElementById("navLinks");
navToggle?.addEventListener("click", () => navLinks.classList.toggle("open"));
navLinks?.querySelectorAll("a").forEach((a) =>
  a.addEventListener("click", () => navLinks.classList.remove("open"))
);

/* ---------- Lenis smooth scroll ---------- */
const lenis = new Lenis({
  duration: 1.15,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smoothWheel: true,
  smoothTouch: false,
});
function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
requestAnimationFrame(raf);
lenis.on("scroll", ScrollTrigger.update);
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);

document.querySelectorAll('a[href^="#"]').forEach((a) => {
  a.addEventListener("click", (e) => {
    const id = a.getAttribute("href");
    if (id && id.length > 1) {
      const el = document.querySelector(id);
      if (el) {
        e.preventDefault();
        lenis.scrollTo(el, { offset: -40, duration: 1.2 });
      }
    }
  });
});

/* ---------- Custom cursor ---------- */
const cDot = document.getElementById("cursorDot");
const cRing = document.getElementById("cursorRing");
const cLabel = document.getElementById("cursorLabel");
let mx = -100, my = -100, rx = -100, ry = -100;
window.addEventListener("mousemove", (e) => { mx = e.clientX; my = e.clientY; });
function loopCursor() {
  cDot.style.transform = `translate3d(${mx - 3}px, ${my - 3}px, 0)`;
  rx += (mx - rx) * 0.18;
  ry += (my - ry) * 0.18;
  const size = cRing.classList.contains("hover") ? 35 : 16;
  cRing.style.transform = `translate3d(${rx - size}px, ${ry - size}px, 0)`;
  requestAnimationFrame(loopCursor);
}
loopCursor();
document.querySelectorAll("a, button, .chip, .c-card, .soft, .t-card, .h-card").forEach((el) => {
  el.addEventListener("mouseenter", () => {
    cRing.classList.add("hover");
    const label = el.getAttribute("data-cursor");
    cLabel.textContent = label || "";
  });
  el.addEventListener("mouseleave", () => {
    cRing.classList.remove("hover");
    cLabel.textContent = "";
  });
});

/* ---------- Scroll progress ---------- */
const bar = document.getElementById("scrollProgress");
lenis.on("scroll", ({ scroll, limit }) => {
  const pct = limit > 0 ? (scroll / limit) * 100 : 0;
  bar.style.width = pct + "%";
});

/* ---------- Section indicator ---------- */
const siNum = document.getElementById("siNum");
const siLabel = document.getElementById("siLabel");
const siRoot = document.getElementById("sectionIndicator");
const sections = document.querySelectorAll("[data-section]");
sections.forEach((sec) => {
  ScrollTrigger.create({
    trigger: sec,
    start: "top 40%",
    end: "bottom 40%",
    onToggle: (self) => {
      if (self.isActive) {
        siNum.textContent = sec.dataset.section;
        siLabel.textContent = sec.dataset.label;
        siRoot.classList.add("visible");
      }
    },
  });
});
ScrollTrigger.create({
  trigger: document.body,
  start: "top+=200 top",
  onToggle: (self) => siRoot.classList.toggle("visible", self.isActive),
});

/* ---------- Reveal on scroll ---------- */
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12, rootMargin: "0px 0px -60px 0px" }
);
document.querySelectorAll("[data-reveal]").forEach((el) => revealObserver.observe(el));

/* ---------- Preloader (counter + bar) ---------- */
const preloader = document.getElementById("preloader");
const preBar = document.getElementById("preBar");
const preCount = document.getElementById("preCount");
function startPreloader() {
  return new Promise((resolve) => {
    const start = performance.now();
    const dur = 1600;
    function tick(now) {
      const t = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      const pct = Math.floor(eased * 100);
      preBar.style.width = pct + "%";
      preCount.textContent = String(pct).padStart(2, "0");
      if (t < 1) requestAnimationFrame(tick);
      else resolve();
    }
    requestAnimationFrame(tick);
  });
}

async function bootHero() {
  await startPreloader();
  preloader.classList.add("hidden");

  // Split each hero-title line into chars
  document.querySelectorAll(".hero-title [data-split]").forEach((el) => splitToChars(el));

  // Animate chars in, staggered by line
  const lines = document.querySelectorAll(".hero-title .line");
  const tl = gsap.timeline({ delay: 0.2 });
  lines.forEach((line, i) => {
    const chars = line.querySelectorAll(".char");
    tl.to(
      chars,
      { y: 0, duration: 0.9, ease: "power4.out", stagger: 0.018 },
      i === 0 ? 0 : "-=0.7"
    );
  });

  // Reveal hero secondary els (tag, sub, cta, stats)
  gsap.set(".hero [data-hero-el]", { y: 24, opacity: 0 });
  gsap.to(".hero [data-hero-el]", {
    y: 0,
    opacity: 1,
    duration: 0.9,
    ease: "power3.out",
    stagger: 0.09,
    delay: 0.4,
  });
}
if (document.readyState === "complete") bootHero();
else window.addEventListener("load", bootHero);

/* ---------- Counter animation ---------- */
document.querySelectorAll(".stat .num span[data-count]").forEach((el) => {
  const target = parseInt(el.dataset.count, 10) || 0;
  const obj = { v: 0 };
  gsap.to(obj, {
    v: target,
    duration: 2.2,
    ease: "power2.out",
    scrollTrigger: { trigger: el, start: "top 85%" },
    onUpdate: () => { el.textContent = Math.round(obj.v); },
  });
});

/* ---------- Timeline draw + item reveal ---------- */
document.querySelectorAll(".tl").forEach((tl) => {
  const items = tl.querySelectorAll(".tl-item");
  ScrollTrigger.create({
    trigger: tl,
    start: "top 75%",
    onEnter: () => {
      tl.classList.add("drawn");
      items.forEach((it, i) => {
        setTimeout(() => it.classList.add("visible"), 200 + i * 180);
      });
    },
  });
});

/* ---------- Testimonial cards: staggered rotation on reveal ---------- */
document.querySelectorAll(".t-card").forEach((c, i) => {
  c.style.setProperty("--tilt", `${i % 2 === 0 ? -1.5 : 1.5}deg`);
});

/* ---------- HORIZONTAL SCROLL for #work ---------- */
function initHorizontalScroll() {
  const wrap = document.getElementById("hScroll");
  const track = document.getElementById("hTrack");
  const bar = document.getElementById("hProgressBar");
  if (!wrap || !track) return;

  const mm = gsap.matchMedia();
  mm.add("(min-width: 901px)", () => {
    const getDistance = () => track.scrollWidth - window.innerWidth;

    const tween = gsap.to(track, {
      x: () => -getDistance(),
      ease: "none",
      scrollTrigger: {
        trigger: wrap,
        pin: true,
        scrub: 1,
        anticipatePin: 1,
        end: () => `+=${getDistance()}`,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          if (bar) bar.style.width = (self.progress * 100).toFixed(2) + "%";
        },
      },
    });

    return () => tween.kill();
  });
}
initHorizontalScroll();

/* ---------- Big contact "fill text" ---------- */
(function fillText() {
  const el = document.getElementById("fillText");
  if (!el) return;
  const spans = el.querySelectorAll("span");
  spans.forEach((s, i) => {
    gsap.fromTo(
      s,
      { color: "var(--surface)" },
      {
        color: i === spans.length - 1 ? "var(--accent)" : "var(--ink)",
        ease: "none",
        scrollTrigger: {
          trigger: s,
          start: "top 85%",
          end: "top 40%",
          scrub: true,
        },
      }
    );
  });
})();

/* ---------- Marquee (already CSS-animated) — nudge with scroll velocity ---------- */
const marquees = document.querySelectorAll(".mq-track");
let velTimeout;
lenis.on("scroll", ({ velocity }) => {
  const boost = Math.min(Math.abs(velocity) * 0.05, 3);
  const sign = velocity > 0 ? 1 : -1;
  marquees.forEach((m) => {
    const isAlt = m.classList.contains("alt");
    const base = isAlt ? -1 : 1;
    m.style.animationDuration = `${Math.max(10, 40 - boost * 5)}s`;
    m.style.animationDirection = (base * sign) > 0 ? "normal" : "reverse";
  });
  clearTimeout(velTimeout);
  velTimeout = setTimeout(() => {
    marquees.forEach((m) => {
      m.style.animationDuration = "40s";
      m.style.animationDirection = m.classList.contains("alt") ? "reverse" : "normal";
    });
  }, 200);
});

/* =========================================================
   Three.js hero: matte low-poly icosahedron sculpture
   ========================================================= */
(function initHero3D() {
  const canvas = document.getElementById("heroCanvas");
  if (!canvas) return;

  const readVars = () => {
    const cs = getComputedStyle(document.documentElement);
    const parse = (name, fallback) => {
      const v = cs.getPropertyValue(name).trim();
      if (!v) return fallback;
      // supports "0xff0000" or hex "#ff0000"
      if (v.startsWith("0x")) return parseInt(v, 16);
      if (v.startsWith("#")) return parseInt(v.replace("#", "0x"), 16);
      return fallback;
    };
    return {
      fog:  parse("--scene-fog",  0x0f0d0a),
      key:  parse("--scene-key",  0xffb480),
      fill: parse("--scene-fill", 0x88a294),
      mat:  parse("--scene-mat",  0xd97b57),
      emit: parse("--scene-emit", 0x2a1810),
    };
  };

  const cols = readVars();

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(cols.fog, 0.07);

  const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    100
  );
  camera.position.set(0, 0, 6);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;

  // Ambient soft
  const ambient = new THREE.AmbientLight(0xffffff, 0.35);
  scene.add(ambient);

  // Key (warm) + Fill (cool)
  const key = new THREE.DirectionalLight(cols.key, 1.4);
  key.position.set(4, 3, 5);
  scene.add(key);

  const fill = new THREE.DirectionalLight(cols.fill, 0.7);
  fill.position.set(-5, -2, 3);
  scene.add(fill);

  const rim = new THREE.DirectionalLight(0xffffff, 0.4);
  rim.position.set(0, 4, -6);
  scene.add(rim);

  // Sculpture: low-poly icosahedron w/ flat shading (matte)
  const geo = new THREE.IcosahedronGeometry(1.55, 1);
  const mat = new THREE.MeshStandardMaterial({
    color: cols.mat,
    roughness: 0.62,
    metalness: 0.08,
    flatShading: true,
    emissive: cols.emit,
    emissiveIntensity: 0.15,
  });
  const sculpture = new THREE.Mesh(geo, mat);
  scene.add(sculpture);

  // Subtle wireframe halo (thin, minimalist)
  const haloGeo = new THREE.IcosahedronGeometry(1.9, 1);
  const haloMat = new THREE.MeshBasicMaterial({
    color: cols.mat,
    wireframe: true,
    transparent: true,
    opacity: 0.06,
  });
  const halo = new THREE.Mesh(haloGeo, haloMat);
  scene.add(halo);

  // Position sculpture toward the right (hero-right area)
  const group = new THREE.Group();
  group.add(sculpture);
  group.add(halo);
  scene.remove(sculpture); scene.remove(halo);
  scene.add(group);

  function placeGroup() {
    if (window.innerWidth > 1000) {
      group.position.x = 2.1;
      group.position.y = 0.1;
    } else {
      group.position.x = 0;
      group.position.y = 0;
    }
  }
  placeGroup();

  // Interaction
  const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
  window.addEventListener("mousemove", (e) => {
    mouse.tx = (e.clientX / window.innerWidth - 0.5) * 2;
    mouse.ty = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  let scrollY = 0;
  lenis.on("scroll", ({ scroll }) => (scrollY = scroll));

  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    placeGroup();
  });

  // Theme change: recolor scene
  window.addEventListener("themechange", () => {
    const c = readVars();
    scene.fog.color.setHex(c.fog);
    key.color.setHex(c.key);
    fill.color.setHex(c.fill);
    mat.color.setHex(c.mat);
    mat.emissive.setHex(c.emit);
    haloMat.color.setHex(c.mat);
  });

  const clock = new THREE.Clock();
  function animate() {
    const t = clock.getElapsedTime();
    mouse.x += (mouse.tx - mouse.x) * 0.05;
    mouse.y += (mouse.ty - mouse.y) * 0.05;

    // Slow organic rotation with cursor tilt
    sculpture.rotation.y = t * 0.18 + mouse.x * 0.5;
    sculpture.rotation.x = t * 0.09 + mouse.y * 0.35;
    sculpture.position.y = Math.sin(t * 0.4) * 0.08;

    halo.rotation.y = -t * 0.06 + mouse.x * 0.2;
    halo.rotation.x = t * 0.04;

    // Scroll parallax
    const factor = Math.min(scrollY / (window.innerHeight * 1.2), 1);
    group.scale.setScalar(1 - factor * 0.4);
    group.position.y = (window.innerWidth > 1000 ? 0.1 : 0) - factor * 1.5;
    group.rotation.z = factor * 0.5;

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  animate();
})();

/* ---------- Refresh triggers after everything is set ---------- */
window.addEventListener("load", () => {
  setTimeout(() => ScrollTrigger.refresh(), 100);
});
