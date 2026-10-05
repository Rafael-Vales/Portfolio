"use client";

import { useEffect, useRef, useState } from "react";

type Dot = { x: number; y: number; tx: number; ty: number; nx: number; ny: number; vx: number; vy: number; r: number; lx: number; ly: number; logoTone: number; logoV: boolean; bx: number; by: number; delay: number; bend: number };

export default function ParticlePortrait() {
  const ref = useRef<HTMLCanvasElement>(null);
  const pausedRef = useRef(false);
  const [paused, setPaused] = useState(false);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    let disposed = false, frame = 0, loaded = false;
    let width = 0, height = 0, last = 0, progress = 0, heroTop = 72, range = 600;
    const stage = canvas.parentElement!;
    const hero = canvas.closest<HTMLElement>(".hero")!;
    let dots: Dot[] = [];
    let flowTime = 0, cycleTime = 0;
    let returning = false;
    const smooth = (v: number) => { const t = Math.max(0, Math.min(1, v)); return t * t * (3 - 2 * t); };
    const pointer = { x: -1000, y: -1000 };
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const source = new window.Image();
    // One opening per mount; direct links and reduced motion go straight to content.
    let intro = !motion.matches && window.scrollY < 12 && !['#proyectos', '#sobre-mi', '#contacto'].includes(window.location.hash);
    let introTime = 0, formation = 0;
    const root = document.documentElement;
    if (intro) root.dataset.particleIntro = "loading";
    function finishIntro() {
      intro = false;
      delete root.dataset.particleIntro;
    }
    // Approved concept sheet, sampled into live particles (captions excluded).
    const variants = [
      { name: "lobo-marino", crop: [35, 85, 445, 408] },
      { name: "faro", crop: [510, 52, 404, 438] },
      { name: "escollera", crop: [934, 210, 580, 280] },
      { name: "torreon", crop: [175, 532, 560, 424] },
      { name: "barco", crop: [778, 548, 661, 411] },
      { name: "pato-mogotes", crop: [5, 52, 175, 183], src: "/images/loaders/pato-mogotes-source.png",
        silhouette: "M94 67 Q94 57 111 57 Q128 56 136 65 L132 75 Q138 80 136 89 L141 92 Q139 101 127 105 L125 115 L136 125 L148 136 L154 141 L155 149 L163 163 L174 172 Q179 180 173 182 L165 179 L160 174 L149 167 L139 157 L137 177 L136 184 L132 201 L128 214 L140 222 Q144 228 134 230 L121 229 L114 222 L114 207 L106 204 L97 206 L94 219 L88 229 L76 230 Q69 226 76 221 L85 215 L84 201 L81 191 L80 178 L80 135 L68 132 L61 126 L50 127 L46 124 L47 117 L47 112 L52 109 L58 113 L68 114 L75 112 L81 113 L92 117 L102 113 L102 105 Q96 103 96 98 L89 95 L89 89 L94 85 L94 67 Z M8 88 L51 73 L51 94 Z M49 74 L52 74 L52 231 L49 231 Z" },
    ];
    let variantIndex = 0;
    try { variantIndex = Number(sessionStorage.getItem("mdp-loader-next") || 0) % variants.length; } catch { /* Storage is optional. */ }
    if (!Number.isInteger(variantIndex) || variantIndex < 0) variantIndex = 0;
    const variant = variants[variantIndex];
    canvas.dataset.loader = variant.name;
    const loaderCount = 18000;
    let loaderReady = false;
    const noise = (index: number, salt: number) => {
      const value = Math.sin(index * 127.1 + salt * 311.7) * 43758.5453;
      return value - Math.floor(value);
    };
    let loaderSeeds = Array.from({ length: loaderCount }, () => ({u: 0, x: 0, y: 0, depth: 0, r: 0}));
    const loaderImage = new window.Image();
    loaderImage.onload = () => {
      if (disposed) return;
      const sample = document.createElement("canvas");
      const [sx, sy, sw, sh] = variant.crop;
      sample.width = variant.silhouette ? 420 : Math.min(560, sw); sample.height = Math.round(sample.width * sh / sw);
      const context = sample.getContext("2d", {willReadFrequently: true});
      if (!context) { finishIntro(); return; }
      if (variant.silhouette) {
        // Keep the supplied photo intact; isolate the statue during sampling.
        context.save();
        context.setTransform(sample.width / sw, 0, 0, sample.height / sh, -sx * sample.width / sw, -sy * sample.height / sh);
        context.clip(new Path2D(variant.silhouette));
        context.drawImage(loaderImage, 0, 0);
        context.restore();
      } else context.drawImage(loaderImage, sx, sy, sw, sh, 0, 0, sample.width, sample.height);
      const pixels = context.getImageData(0, 0, sample.width, sample.height).data;
      const candidates: {x: number; y: number; ink: number}[] = [];
      const extent = Math.max(sample.width, sample.height);
      for (let y = 0; y < sample.height; y++) for (let x = 0; x < sample.width; x++) {
        const offset = (y * sample.width + x) * 4;
        if (pixels[offset + 3] < 128) continue;
        const luminance = (pixels[offset] * .2126 + pixels[offset + 1] * .7152 + pixels[offset + 2] * .0722) / 255;
        const ink = variant.silhouette ? Math.max(.17, Math.min(1, (1 - luminance) * 1.2)) : 1 - luminance;
        const edge = Math.min(1, x / 10, (sample.width - x) / 10, y / 8, (sample.height - y) / 12);
        if (ink > .12 && noise(offset, 4) < Math.sqrt(ink) * edge) candidates.push({x, y, ink});
      }
      if (!candidates.length) { finishIntro(); return; }
      // Shuffle once, then sample without replacement: preserve fine features
      // instead of stacking randomly repeated dots over the same pixels.
      for (let i = candidates.length - 1; i > 0; i--) {
        const j = Math.floor(noise(i, 5) * (i + 1));
        [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
      }
      loaderSeeds = loaderSeeds.map((_, i) => {
        const p = candidates[i % candidates.length];
        return { u: 1 - p.y / sample.height,
          x: (p.x - sample.width / 2 + (noise(i, 6) - .5) * .35) / extent,
          y: (p.y - sample.height / 2 + (noise(i, 7) - .5) * .35) / extent,
          depth: (1 - p.ink) * 40, r: .3 + p.ink * .65 };
      });
      loaderReady = true; introTime = 0;
      if (intro) {
        try { sessionStorage.setItem("mdp-loader-next", String((variantIndex + 1) % variants.length)); } catch { /* Keep loading without storage. */ }
      }
      if (loaded) build();
      wake();
    };
    loaderImage.onerror = () => { if (!disposed) { finishIntro(); if (loaded) build(); } };
    if (intro) loaderImage.src = variant.src || "/images/loaders/mar-del-plata-studies.png";
    function loaderPoint(index: number) {
      const seed = loaderSeeds[index % loaderCount];
      const size = Math.min(width * .84, height * .58, 460);
      const breath = 1 + Math.sin(introTime * 1.5) * .006;
      return { x: width / 2 + seed.x * size * breath,
        y: height / 2 + seed.y * size * breath };
    }
    function loaderRadius(index: number) {
      if (index >= loaderCount || !loaderReady) return 0;
      const seed = loaderSeeds[index];
      return seed.r * Math.min(width * .84, height * .58, 460) / 400 * smooth((introTime / .85 - seed.u) * 6);
    }
    function sizeCanvas() {
      width = document.documentElement.clientWidth; height = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas!.width = Math.round(width * dpr); canvas!.height = Math.round(height * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    const introTimeout = window.setTimeout(() => { finishIntro(); wake(); }, 6500);
    sizeCanvas();
    function draw(time: number) {
      frame = 0;
      if (disposed || document.hidden || (!loaded && !intro)) return;
      const dt = Math.min((time - last) / 16.667 || 1, 2);
      last = time;
      if (intro) {
        introTime += dt / 60;
        if (motion.matches || window.scrollY > 12) finishIntro();
        else if (loaded && loaderReady && introTime >= 3.1) {
          formation = Math.min(1, formation + dt / 60 / 1.8);
          if (formation > .4) root.dataset.particleIntro = "revealing";
          if (formation >= 1) finishIntro();
        }
      }
      if (!loaded) {
        ctx!.clearRect(0, 0, width, height);
        ctx!.globalAlpha = .65; ctx!.fillStyle = "#151515";
        ctx!.beginPath();
        for (let i = 0; i < loaderCount; i++) {
          const p = loaderPoint(i);
          const r = loaderRadius(i);
          ctx!.moveTo(p.x + r, p.y); ctx!.arc(p.x, p.y, r, 0, Math.PI * 2);
        }
        ctx!.fill();
        if (intro) frame = requestAnimationFrame(draw);
        return;
      }
      if (!motion.matches && !pausedRef.current) {
        flowTime += dt / 60;
        if (!intro && progress < .001) cycleTime = (cycleTime + dt / 60) % 22;
      }
      if (motion.matches) cycleTime = 0;
      // Hold each settled pile for one second without slowing the other stages.
      const onFloor = (cycleTime >= 8 && cycleTime < 9) || (cycleTime >= 19 && cycleTime < 20);
      const phase = cycleTime < 8 ? cycleTime : cycleTime < 9 ? 8 : cycleTime < 19 ? cycleTime - 1 : cycleTime < 20 ? 18 : cycleTime - 2;
      canvas!.dataset.phase = intro ? (formation > 0 ? "opening-portrait" : "loading") : onFloor ? "floor-hold" : phase < 6 ? "portrait" : phase < 8 ? "fall-to-logo" : phase < 10 ? "form-logo" : phase < 16 ? "logo" : phase < 18 ? "fall-to-portrait" : "form-portrait";
      ctx!.clearRect(0, 0, width, height);
      const pageStyle = getComputedStyle(document.body);
      const backgroundChannels = pageStyle.backgroundColor.match(/[\d.]+/g)?.slice(0, 3).join(",") ?? "250,250,249";
      if (progress > 0) {
        const veil = ctx!.createLinearGradient(0, 0, 0, 160);
        veil.addColorStop(0, pageStyle.backgroundColor);
        veil.addColorStop(.28, `rgba(${backgroundChannels},.96)`);
        veil.addColorStop(.55, `rgba(${backgroundChannels},.68)`);
        veil.addColorStop(.8, `rgba(${backgroundChannels},.18)`);
        veil.addColorStop(1, `rgba(${backgroundChannels},0)`);
        ctx!.globalAlpha = progress;
        ctx!.fillStyle = veil;
        ctx!.fillRect(0, 0, width, 160);
      }
      const baseInk = pageStyle.getPropertyValue("--particle-ink").trim() || "#151515";
      const logoColorBlend = (phase < 8 ? 0 : phase < 10 ? smooth((phase - 8) / 2) : phase < 16 ? 1 : phase < 18 ? 1 - smooth((phase - 16) / 2) : 0) * (1 - progress);
      const greenInk = [107, 136, 118].map(value => Math.round(21 + (value - 21) * logoColorBlend));
      const veeInk = pageStyle.getPropertyValue("--particle-ink").trim() || `rgb(${greenInk.join(",")})`;
      const frontDots = new Path2D(), veeDots = new Path2D(), loaderAccent = new Path2D();
      const settle = Math.max(0, Math.min(1, (progress - .65) / .35));
      const navbarFade = settle * settle * (3 - 2 * settle);
      ctx!.globalAlpha = (1 - progress * .18) * (1 - navbarFade * .58);
      ctx!.beginPath();
      let moving = false;
      for (const [index, p] of dots.entries()) {
        // A coherent current bends neighboring particles together instead of random jitter.
        const flow = motion.matches ? 0 : progress;
        const driftX = Math.sin(flowTime * .38 + p.nx * .004 + p.ny * .035) * 22 * flow;
        const driftY = Math.sin(flowTime * .55 + p.nx * .009) * 4.5 * flow;
        let hx = p.tx, hy = p.ty;
        if (phase >= 6 && phase < 8) {
          const t = Math.max(0, Math.min(1, (phase - 6 - p.delay) / (2 - p.delay)));
          const landing = Math.min(1, t / .78);
          const spread = smooth((t - .45) / .55);
          hx += (p.bx - hx) * (.35 * t + .65 * spread);
          hy += (p.by - hy) * landing * landing;
          hy -= Math.sin(Math.max(0, (t - .78) / .22) * Math.PI) * 15;
        } else if (phase >= 8 && phase < 10) {
          const t = smooth((phase - 8) / 2);
          hx = p.bx + (p.lx - p.bx) * t + Math.sin(t * Math.PI) * p.bend;
          hy = p.by + (p.ly - p.by) * t;
        } else if (phase >= 10 && phase < 16) {
          hx = p.lx; hy = p.ly + (motion.matches || pausedRef.current ? 0 : Math.sin(flowTime * .8) * 1.5);
        } else if (phase >= 16 && phase < 18) {
          const t = Math.max(0, Math.min(1, (phase - 16 - p.delay) / (2 - p.delay)));
          const landing = Math.min(1, t / .78);
          const spread = smooth((t - .45) / .55);
          hx = p.lx + (p.bx - p.lx) * (.35 * t + .65 * spread);
          hy = p.ly + (p.by - p.ly) * landing * landing;
          hy -= Math.sin(Math.max(0, (t - .78) / .22) * Math.PI) * 15;
        } else if (phase >= 18) {
          const t = smooth((phase - 18) / 2);
          hx = p.bx + (p.tx - p.bx) * t + Math.sin(t * Math.PI) * p.bend;
          hy = p.by + (p.ty - p.by) * t;
        }
        if (intro) {
          const origin = loaderPoint(index);
          const t = smooth(formation);
          hx = origin.x + (p.tx - origin.x) * t + Math.sin(t * Math.PI) * p.bend * .35;
          hy = origin.y + (p.ty - origin.y) * t;
        }
        const tx = hx + (p.nx + driftX - hx) * progress;
        const ty = hy + (p.ny + driftY - hy) * progress;
        if (!motion.matches) {
          const dx = p.x - pointer.x, dy = p.y - pointer.y;
          const distance = Math.hypot(dx, dy);
          const radius = Math.min(width * .18, 85);
          let fx = 0, fy = 0;
          if (!intro && distance < radius && progress < .9) {
            const force = (1 - distance / radius) * 2.5;
            fx = dx / (distance || 1) * force;
            fy = dy / (distance || 1) * force;
          }
          p.vx = (p.vx + ((tx - p.x) * .035 + fx) * dt) * Math.pow(.8, dt);
          p.vy = (p.vy + ((ty - p.y) * .035 + fy) * dt) * Math.pow(.8, dt);
          p.x += p.vx * dt; p.y += p.vy * dt;
          if (Math.abs(p.x - tx) + Math.abs(p.y - ty) + Math.abs(p.vx) + Math.abs(p.vy) > .08) moving = true;
        } else { p.x = tx; p.y = ty; }
        let clearance = 1;
        if (progress > 0) {
          // The texture reaches beyond the viewport sides and dissolves over a
          // generous vertical distance, rather than ending at the header height.
          const fade = Math.max(0, Math.min(1, (p.y - 24) / 128));
          clearance *= 1 - fade * fade * (3 - 2 * fade);
        }
        // Keep the travelling cloud substantial, then settle into a darker fine texture.
        const transitionBoost = Math.sin(progress * Math.PI) * .22;
        const logoBlend = phase < 8 ? 0 : phase < 10 ? smooth((phase - 8) / 2) : phase < 16 ? 1 : phase < 18 ? 1 - smooth((phase - 16) / 2) : 0;
        const tone = 1 + (p.logoTone - 1) * logoBlend * (1 - progress);
        const radius = (intro ? (loaderRadius(index) + (p.r - loaderRadius(index)) * smooth(formation)) : p.r) * tone * (1 - progress * .14 + transitionBoost) * (1 - progress * (1 - clearance));
        if (radius < .025) continue;
        const seed = loaderSeeds[index % loaderCount];
        const accent = intro && formation < .45 && seed.depth < 7 && Math.abs(seed.u - (introTime * .32 % 1.3)) < .12;
        const dotPath = accent ? loaderAccent : p.logoV ? veeDots : frontDots;
        dotPath.moveTo(p.x + radius, p.y);
        dotPath.arc(p.x, p.y, radius, 0, Math.PI * 2);
      }
      ctx!.fillStyle = veeInk; ctx!.fill(veeDots);
      ctx!.fillStyle = baseInk; ctx!.fill(frontDots);
      ctx!.fillStyle = "#6b8876"; ctx!.fill(loaderAccent);
      if ((moving || !pausedRef.current) && !motion.matches) frame = requestAnimationFrame(draw);
    }
    function wake() { if (!frame && (loaded || intro) && !document.hidden) { last = performance.now(); frame = requestAnimationFrame(draw); } }
    function build() {
      if (!loaded || disposed || (intro && !loaderReady)) return;
      const rect = stage.getBoundingClientRect();
      const heroRect = hero.getBoundingClientRect();
      heroTop = heroRect.top + window.scrollY;
      range = heroRect.height * .7;
      width = document.documentElement.clientWidth; height = window.innerHeight;
      if (!width || !height) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas!.width = Math.round(width * dpr); canvas!.height = Math.round(height * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      const sample = document.createElement("canvas");
      sample.width = 480; sample.height = Math.round(sample.width * source.height / source.width);
      const sc = sample.getContext("2d", { willReadFrequently: true });
      if (!sc) return;
      sc.drawImage(source, 0, 0, sample.width, sample.height);
      const data = sc.getImageData(0, 0, sample.width, sample.height).data;
      const scale = Math.min(rect.width / sample.width, rect.height / sample.height);
      const ox = rect.left + (rect.width - sample.width * scale) / 2, oy = rect.top + window.scrollY + (rect.height - sample.height * scale) / 2;
      let seed = 42;
      const random = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
      // Depth trial. Approved previous version is preserved in docs/visual-versions.
      const logo = document.createElement("canvas"); logo.width = 360; logo.height = 320;
      const lc = logo.getContext("2d")!;
      const ribbon = new Path2D("M 36 276 L 84 44 L 178 44 C 259 44 273 138 196 164 L 260 276 L 205 276 L 143 163 L 111 163 L 88 276 Z M 120 82 L 111 126 L 169 126 C 207 126 217 82 179 82 Z");
      // Align the V's base with the foreground R's right foot (205–260 at y=276).
      const vee = new Path2D("M 65 44 L 110 44 L 230 236 L 283 44 L 329 44 L 260 276 L 205 276 Z");
      lc.fillStyle = "rgba(0,0,0,.48)";
      lc.fill(vee);
      // A small shadow falls on the back letter only.
      lc.save(); lc.clip(vee); lc.translate(4, 5);
      lc.fillStyle = "rgba(0,0,0,.8)"; lc.fill(ribbon, "evenodd"); lc.restore();
      // A fine light seam separates the foreground R at the overlap.
      lc.globalCompositeOperation = "destination-out";
      lc.lineWidth = 3; lc.lineJoin = "round"; lc.stroke(ribbon);
      lc.globalCompositeOperation = "source-over";
      lc.fillStyle = "black"; lc.fill(ribbon, "evenodd");
      const pixels = lc.getImageData(0, 0, 360, 320).data;
      const logoPoints: {x: number; y: number; tone: number; vee: boolean}[] = [];
      for (let y = 0; y < 320; y += 2) for (let x = 0; x < 360; x += 2) {
        const alpha = pixels[(y * 360 + x) * 4 + 3] / 255;
        // Increase particle coverage on the foreground R by 10%, leaving the V unchanged.
        const coverage = lc.isPointInPath(ribbon, x, y, "evenodd") ? 1.1 : 1;
        if (alpha > .08) logoPoints.push({x,y,tone: Math.sqrt(alpha * coverage), vee: coverage === 1});
      }
      const logoSize = Math.min(width * .9, heroRect.height * .98, 820);
      const logoLeft = width / 2 - logoSize / 2;
      const logoTop = heroTop + heroRect.height * .52 - logoSize * (320 / 360) / 2;
      const basinY = height - 8;
      dots = [];
      for (let y = 0; y < sample.height; y += 2) for (let x = 0; x < sample.width; x += 2) {
        const i = (y * sample.width + x) * 4;
        const dark = (1 - (data[i] * .2126 + data[i + 1] * .7152 + data[i + 2] * .0722) / 255) * data[i + 3] / 255;
        if (dark < .035 || random() > Math.pow(dark, .65) * .98) continue;
        const tx = ox + (x + (random() - .5) * 1.1) * scale;
        const ty = oy + (y + (random() - .5) * 1.1) * scale;
        const nx = -32 + random() * (width + 64), ny = -12 + random() * 164;
        const lp = logoPoints[Math.floor(random() * logoPoints.length)];
        const lx = logoLeft + (lp.x + random() * 2) / 360 * logoSize;
        const ly = logoTop + (lp.y + random() * 2) / 360 * logoSize;
        // A broad, tapered distribution and varying mound height avoid a rectangular pile.
        const normal = Math.sqrt(-2 * Math.log(Math.max(.0001, random()))) * Math.cos(2 * Math.PI * random());
        const bx = width / 2 + Math.tanh(normal * .58) * (width / 2 - 10);
        const u = bx / width;
        const mound = 7 + 29 * Math.exp(-Math.pow((u - .32) / .13, 2)) + 20 * Math.exp(-Math.pow((u - .67) / .17, 2)) + 6 * Math.sin(u * 25) ** 2;
        const by = basinY - Math.pow(random(), 2.6) * mound - random() * 3;
        const delay = Math.min(.7, Math.max(0, (ty - oy) / rect.height) * .45 + random() * .2);
        dots.push({ tx, ty, nx, ny, lx, ly, logoTone: lp.tone, logoV: lp.vee, bx, by, delay, bend: (random() - .5) * rect.width * .4, x: motion.matches ? tx : tx + (random() - .5) * width * .85, y: motion.matches ? ty : ty + (random() - .5) * height * .65, vx: 0, vy: 0, r: (.4 + dark * .5 + random() * .1) * scale });
      }
      if (intro) dots.forEach((p, index) => {
        const origin = loaderPoint(index);
        const t = smooth(formation);
        p.x = origin.x + (p.tx - origin.x) * t;
        p.y = origin.y + (p.ty - origin.y) * t;
      });
      updateScroll();
    }
    function updateScroll() {
      const raw = Math.max(0, Math.min(1, (window.scrollY - heroTop + 72) / range));
      if (raw > .001) { returning = true; finishIntro(); }
      if (raw <= .001 && returning) { cycleTime = 0; returning = false; }
      progress = motion.matches ? (raw >= .5 ? 1 : 0) : raw * raw * (3 - 2 * raw);
      wake();
    }
    const move = (e: PointerEvent) => { if (motion.matches) return; pointer.x = e.clientX; pointer.y = e.clientY; wake(); };
    const leave = () => { pointer.x = pointer.y = -1000; wake(); };
    const resume = () => wake();
    const visibility = () => { if (document.hidden) { cancelAnimationFrame(frame); frame = 0; } else wake(); };
    const resize = new ResizeObserver(build);
    source.onload = () => { loaded = true; build(); };
    source.onerror = () => { if (!disposed) { finishIntro(); ctx.clearRect(0, 0, width, height); setFailed(true); } };
    source.src = "/images/rafael/portrait-source.png";
    wake();
    resize.observe(stage);
    canvas.addEventListener("resume-particles", resume);
    window.addEventListener("scroll", updateScroll, { passive: true });
    window.addEventListener("pointermove", move); window.addEventListener("pointerleave", leave); window.addEventListener("pointerup", leave);
    motion.addEventListener("change", build); document.addEventListener("visibilitychange", visibility);
    return () => { disposed = true; clearTimeout(introTimeout); finishIntro(); canvas.removeEventListener("resume-particles", resume); cancelAnimationFrame(frame); resize.disconnect(); window.removeEventListener("scroll", updateScroll); window.removeEventListener("pointermove", move); window.removeEventListener("pointerleave", leave); window.removeEventListener("pointerup", leave); motion.removeEventListener("change", build); document.removeEventListener("visibilitychange", visibility); };
  }, []);
  return <div className="portrait-stage"><button type="button" className="particle-toggle" aria-pressed={paused} aria-label={paused ? "Reanudar animación" : "Pausar animación"} onClick={() => { pausedRef.current = !pausedRef.current; setPaused(pausedRef.current); ref.current?.dispatchEvent(new Event("resume-particles")); }}>{paused ? "Reanudar" : "Pausar"}</button><canvas ref={ref} role="img" aria-label="Partículas que alternan entre el retrato de Rafael Vales y su monograma RV" />{failed && <p className="portrait-error">Rafael Vales</p>}</div>;
}
