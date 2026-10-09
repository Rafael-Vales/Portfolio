"use client";
import { useLocale } from "./LocaleProvider";
import { createParticleRenderer } from "../lib/particle-renderer";

import { useEffect, useRef, useState } from "react";

type Dot = { x: number; y: number; tx: number; ty: number; nx: number; ny: number; vx: number; vy: number; r: number; lx: number; ly: number; logoTone: number; logoV: boolean; bx: number; by: number; delay: number; bend: number; nightX: number; nightY: number; nightR: number };

export default function ParticlePortrait() {
  const {t}=useLocale();
  const ref = useRef<HTMLCanvasElement>(null);
  const pausedRef = useRef(false);
  const [paused, setPaused] = useState(false);
  const [failed, setFailed] = useState(false);
  const [staticFallback, setStaticFallback] = useState(false);
  useEffect(() => {
    const canvas = ref.current;
    const renderer = canvas && createParticleRenderer(canvas, staticFallback);
    if (!canvas) return;
    if (!renderer) {
      queueMicrotask(() => staticFallback ? setFailed(true) : setStaticFallback(true));
      return;
    }
    canvas.dataset.renderer = renderer.kind;
    let disposed = false, frame = 0, loaded = false;
    let width = 0, height = 0, last = 0, progress = 0, heroTop = 72, range = 600;
    const stage = canvas.parentElement!;
    const hero = canvas.closest<HTMLElement>(".hero")!;
    let dots: Dot[] = [];
    let dotBuffers = [new Float32Array(0), new Float32Array(0), new Float32Array(0)];
    const dotCounts = [0, 0, 0];
    let frameAlpha = 1;
    function fillDots(group: number, color: string) {
      renderer!.fill(dotBuffers[group], dotCounts[group], color, frameAlpha);
    }
    let flowTime = 0, cycleTime = 0, holdTimer = 0, themeTimer = 0, resizeTimer = 0, basinTimer = 0;
    let basinY = 0;
    const visualViewport = window.visualViewport;
    let builtWidth = 0, builtHeight = 0, lastPaint = 0;
    const compact = window.matchMedia("(max-width: 700px), (pointer: coarse)").matches;
    const animated = renderer.kind === "webgl" || (!compact && !staticFallback);
    stage.dataset.static = String(!animated);
    const frameInterval = 1000 / (compact ? 24 : 60);
    // Keep fine facial detail on Retina screens; save work by sleeping offscreen
    // and between transformations rather than enlarging a sparse set of dots.
    const canvasDpr = Math.min(window.devicePixelRatio || 1, 2);
    const portraitSampleWidth = 480;
    let baseInk = "#151515", accentInk = "#6b8876", projectInk = "", highlightPortrait = false;
    function readPalette() {
      const style = getComputedStyle(document.body);
      projectInk = style.getPropertyValue("--particle-ink").trim();
      baseInk = projectInk || style.getPropertyValue("--portrait-ink").trim() || "#151515";
      accentInk = style.getPropertyValue("--accent").trim() || "#6b8876";
      highlightPortrait = style.getPropertyValue("--portrait-highlights").trim() === "1";
    }
    let returning = false;
    const smooth = (v: number) => { const t = Math.max(0, Math.min(1, v)); return t * t * (3 - 2 * t); };
    const pointer = { x: -1000, y: -1000 };
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const source = new window.Image();
    // One opening per mount; direct links and reduced motion go straight to content.
    let intro = animated && !motion.matches && window.scrollY < 12 && !['#proyectos', '#sobre-mi', '#contacto'].includes(window.location.hash);
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
    const loaderCount = compact ? 6000 : 12000;
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
      sample.width = variant.silhouette ? 420 : Math.min(compact ? 300 : 560, sw); sample.height = Math.round(sample.width * sh / sw);
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
    if (intro) loaderImage.src = variant.src || "/images/loaders/mar-del-plata-studies.webp";
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
      width = document.documentElement.clientWidth; height = compact ? hero.offsetHeight + 72 : window.innerHeight;
      const dpr = canvasDpr;
      renderer!.resize(width, height, dpr);
      canvas!.style.height = `${height}px`;
    }
    function measureBasin() {
      const visibleBottom = (visualViewport?.height ?? window.innerHeight) + (visualViewport?.offsetTop ?? 0);
      const safeBottom = parseFloat(getComputedStyle(stage).getPropertyValue("--particle-safe-bottom")) || 0;
      const bottom = Math.min(height, visibleBottom) - Math.max(8, safeBottom + 8);
      return Math.max(88, bottom);
    }
    function refreshBasin() {
      if (!loaded || disposed || document.hidden || progress !== 0) return;
      const nextHeight = compact ? hero.offsetHeight + 72 : window.innerHeight;
      let surfaceChanged = false;
      if (nextHeight !== height) {
        surfaceChanged = true;
        height = nextHeight;
        renderer!.resize(width, height, canvasDpr);
        canvas!.style.height = `${height}px`;
      }
      const next = measureBasin(), delta = next - basinY;
      if (Math.abs(delta) < .5) { if (surfaceChanged) wake(); return; }
      basinY = next;
      // Browser toolbar movements only relocate the floor, never re-sample dots.
      for (const dot of dots) dot.by += delta;
      wake();
    }
    const viewportResize = () => {
      clearTimeout(basinTimer); basinTimer = window.setTimeout(refreshBasin, 100);
    };
    const introTimeout = window.setTimeout(() => { finishIntro(); wake(); }, 6500);
    dotBuffers = [new Float32Array(loaderCount * 3), new Float32Array(loaderCount * 3), new Float32Array(loaderCount * 3)];
    sizeCanvas();
    readPalette();
    function draw(time: number) {
      frame = 0;
      if (disposed || document.hidden || (!loaded && !intro)) return;
      // The mobile header is opaque: there is no visible portrait left to draw.
      if (compact && progress > 0) return;
      if (time - lastPaint < frameInterval - 1) { frame = requestAnimationFrame(draw); return; }
      const elapsed = Math.min((time - last) / 1000, .1);
      lastPaint = time;
      const dt = Math.min((time - last) / 16.667 || 1, 2);
      last = time;
      if (intro) {
        introTime += elapsed;
        if (motion.matches || window.scrollY > 12) finishIntro();
        else if (loaded && loaderReady && introTime >= 3.1) {
          formation = Math.min(1, formation + elapsed / 1.8);
          if (formation > .4) root.dataset.particleIntro = "revealing";
          if (formation >= 1) finishIntro();
        }
      }
      if (!loaded) {
        renderer!.clear();
        frameAlpha = .65;
        dotCounts.fill(0);
        for (let i = 0; i < loaderCount; i++) {
          const p = loaderPoint(i), r = loaderRadius(i), offset = dotCounts[0];
          dotBuffers[0][offset] = p.x; dotBuffers[0][offset + 1] = p.y; dotBuffers[0][offset + 2] = r;
          dotCounts[0] += 3;
        }
        fillDots(0, baseInk);
        if (intro) frame = requestAnimationFrame(draw);
        return;
      }
      if (animated && !motion.matches && !pausedRef.current) {
        if (intro || progress < .001) flowTime += elapsed;
        if (!intro && progress < .001) cycleTime = (cycleTime + elapsed) % 22;
      }
      if (motion.matches) cycleTime = 0;
      // Hold each settled pile for one second without slowing the other stages.
      const onFloor = (cycleTime >= 8 && cycleTime < 9) || (cycleTime >= 19 && cycleTime < 20);
      const phase = cycleTime < 8 ? cycleTime : cycleTime < 9 ? 8 : cycleTime < 19 ? cycleTime - 1 : cycleTime < 20 ? 18 : cycleTime - 2;
      canvas!.dataset.phase = intro ? (formation > 0 ? "opening-portrait" : "loading") : onFloor ? "floor-hold" : phase < 6 ? "portrait" : phase < 8 ? "fall-to-logo" : phase < 10 ? "form-logo" : phase < 16 ? "logo" : phase < 18 ? "fall-to-portrait" : "form-portrait";
      renderer!.clear();
      const logoColorBlend = (phase < 8 ? 0 : phase < 10 ? smooth((phase - 8) / 2) : phase < 16 ? 1 : phase < 18 ? 1 - smooth((phase - 16) / 2) : 0) * (1 - progress);
      const portraitTone = root.dataset.theme === "dark" ? 220 : 21;
      const greenInk = [107, 136, 118].map(value => Math.round(portraitTone + (value - portraitTone) * logoColorBlend));
      const veeInk = projectInk || `rgb(${greenInk.join(",")})`;
      // Bright particles on dark backgrounds describe reflected light, not shadows.
      const logoBlend = phase < 8 ? 0 : phase < 10 ? smooth((phase - 8) / 2) : phase < 16 ? 1 : phase < 18 ? 1 - smooth((phase - 16) / 2) : 0;
      const highlightRadiusBlend = highlightPortrait ? (1 - logoBlend) * (1 - progress) * (intro ? smooth(formation) : 1) : 0;
      dotCounts.fill(0);
      const settle = Math.max(0, Math.min(1, (progress - .65) / .35));
      const navbarFade = settle * settle * (3 - 2 * settle);
      frameAlpha = (1 - progress * .18) * (1 - navbarFade * .58);
      let moving = false;
      const landing = !intro && progress < .001 && (onFloor || (phase >= 6 && phase < 8) || (phase >= 16 && phase < 18));
      const friction = Math.pow(.8, dt);
      const settledFigure = !intro && progress === 0 && (onFloor || phase < 6 || (phase >= 10 && phase < 16));
      // Full sampling remains intact for the final figures. Only moving frames
      // use a bounded subset; stationary mobile figures need no spring loop.
      const stride = compact && !settledFigure && !pausedRef.current && !motion.matches && !(intro && formation === 0)
        ? Math.max(1, Math.ceil(dots.length / 8000)) : 1;
      const count = intro && formation === 0 ? Math.min(loaderCount, dots.length) : dots.length;
      for (let index = 0; index < count; index += stride) {
        const p = dots[index];
        // A coherent current bends neighboring particles together instead of random jitter.
        const flow = motion.matches || compact || progress === 1 ? 0 : progress;
        const driftX = flow ? Math.sin(flowTime * .38 + p.nx * .004 + p.ny * .035) * 22 * flow : 0;
        const driftY = flow ? Math.sin(flowTime * .55 + p.nx * .009) * 4.5 * flow : 0;
        const portraitX = highlightPortrait ? p.nightX : p.tx;
        const portraitY = highlightPortrait ? p.nightY : p.ty;
        let hx = portraitX, hy = portraitY;
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
          hx = p.lx; hy = p.ly;
        } else if (phase >= 16 && phase < 18) {
          const t = Math.max(0, Math.min(1, (phase - 16 - p.delay) / (2 - p.delay)));
          const landing = Math.min(1, t / .78);
          const spread = smooth((t - .45) / .55);
          hx = p.lx + (p.bx - p.lx) * (.35 * t + .65 * spread);
          hy = p.ly + (p.by - p.ly) * landing * landing;
          hy -= Math.sin(Math.max(0, (t - .78) / .22) * Math.PI) * 15;
        } else if (phase >= 18) {
          const t = smooth((phase - 18) / 2);
          hx = p.bx + (portraitX - p.bx) * t + Math.sin(t * Math.PI) * p.bend;
          hy = p.by + (portraitY - p.by) * t;
        }
        if (intro) {
          const origin = loaderPoint(index);
          const t = smooth(formation);
          hx = origin.x + (portraitX - origin.x) * t + Math.sin(t * Math.PI) * p.bend * .35;
          hy = origin.y + (portraitY - origin.y) * t;
        }
        const tx = hx + (p.nx + driftX - hx) * progress;
        const ty = hy + (p.ny + driftY - hy) * progress;
        if (animated && !motion.matches && !(compact && settledFigure)) {
          const dx = p.x - pointer.x, dy = p.y - pointer.y;
          const distance = compact ? Infinity : Math.hypot(dx, dy);
          const radius = Math.min(width * .18, 85);
          let fx = 0, fy = 0;
          if (!intro && distance < radius && progress < .9) {
            const force = (1 - distance / radius) * 2.5;
            fx = dx / (distance || 1) * force;
            fy = dy / (distance || 1) * force;
          }
          p.vx = (p.vx + ((tx - p.x) * .035 + fx) * dt) * friction;
          p.vy = (p.vy + ((ty - p.y) * .035 + fy) * dt) * friction;
          p.x += p.vx * dt; p.y += p.vy * dt;
          if (Math.abs(p.x - tx) + Math.abs(p.y - ty) + Math.abs(p.vx) + Math.abs(p.vy) > .08) moving = true;
          else { p.x = tx; p.y = ty; p.vx = p.vy = 0; }
        } else { p.x = tx; p.y = ty; p.vx = p.vy = 0; }
        if (landing) {
          // A physical floor also stops spring overshoot below the visible area.
          const floor = basinY - Math.max(p.r, p.nightR) * 1.1;
          if (p.y > floor) { p.y = floor; p.vy = Math.min(0, p.vy); }
          p.x = Math.max(8, Math.min(width - 8, p.x));
        }
        let clearance = 1;
        if (progress > 0) {
          // The texture reaches beyond the viewport sides and dissolves over a
          // generous vertical distance, rather than ending at the header height.
          const fade = Math.max(0, Math.min(1, (p.y - 24) / 128));
          clearance *= 1 - fade * fade * (3 - 2 * fade);
        }
        // Keep the travelling cloud substantial, then settle into a darker fine texture.
        const transitionBoost = Math.sin(progress * Math.PI) * .22;
        const tone = 1 + (p.logoTone - 1) * logoBlend * (1 - progress);
        const portraitRadius = p.r + (p.nightR - p.r) * highlightRadiusBlend;
        const radius = (intro ? (loaderRadius(index) + (portraitRadius - loaderRadius(index)) * smooth(formation)) : portraitRadius) * tone * (1 - progress * .14 + transitionBoost) * (1 - progress * (1 - clearance));
        if (radius < .025) continue;
        const seed = loaderSeeds[index % loaderCount];
        const accent = intro && formation < .45 && seed.depth < 7 && Math.abs(seed.u - (introTime * .32 % 1.3)) < .12;
        const group = accent ? 2 : p.logoV ? 1 : 0;
        const offset = dotCounts[group];
        dotBuffers[group][offset] = p.x;
        dotBuffers[group][offset + 1] = p.y;
        dotBuffers[group][offset + 2] = radius;
        dotCounts[group] += 3;
      }
      fillDots(1, veeInk);
      fillDots(0, baseInk);
      fillDots(2, accentInk);
      const cycling = animated && !pausedRef.current && !motion.matches && progress < .001;
      // Settled portraits/logos remain on the canvas without a render loop.
      if (!intro && !moving && cycling && (phase < 6 || (phase >= 10 && phase < 16) || onFloor)) {
        const boundary = cycleTime < 6 ? 6 : cycleTime < 9 ? 9 : cycleTime < 17 ? 17 : 20;
        holdTimer = window.setTimeout(() => { holdTimer = 0; cycleTime = boundary; wake(); }, (boundary - cycleTime) * 1000);
      } else if (intro || (animated && !motion.matches && (moving || cycling))) frame = requestAnimationFrame(draw);
    }
    function wake() {
      clearTimeout(holdTimer); holdTimer = 0;
      if (!frame && (loaded || intro) && !document.hidden && !(compact && progress > 0)) {
        last = performance.now(); lastPaint = 0; frame = requestAnimationFrame(draw);
      }
    }
    function build() {
      if (!loaded || disposed || (intro && !loaderReady)) return;
      const rect = stage.getBoundingClientRect();
      // Safari's browser chrome can change viewport height during a swipe.
      // Re-sample only for a real layout change, not each toolbar movement.
      if (builtWidth === rect.width && (compact || builtHeight === rect.height)) return;
      builtWidth = rect.width; builtHeight = rect.height;
      const heroRect = hero.getBoundingClientRect();
      heroTop = heroRect.top + window.scrollY;
      range = heroRect.height * .7;
      width = document.documentElement.clientWidth; height = compact ? hero.offsetHeight + 72 : window.innerHeight;
      if (!width || !height) return;
      const dpr = canvasDpr;
      renderer!.resize(width, height, dpr);
      canvas!.style.height = `${height}px`;
      const sample = document.createElement("canvas");
      sample.width = portraitSampleWidth; sample.height = Math.round(sample.width * source.height / source.width);
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
      // Spread particles across the whole monogram before reusing a point.
      // Random selection with replacement leaves holes and thick clumps.
      for (let i = logoPoints.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1));
        [logoPoints[i], logoPoints[j]] = [logoPoints[j], logoPoints[i]];
      }
      const logoSize = Math.min(width * .9, heroRect.height * .98, 820);
      const logoLeft = width / 2 - logoSize / 2;
      const logoTop = heroTop + heroRect.height * .52 - logoSize * (320 / 360) / 2;
      basinY = measureBasin();
      dots = [];
      for (let y = 0; y < sample.height; y += 2) for (let x = 0; x < sample.width; x += 2) {
        const i = (y * sample.width + x) * 4;
        const dark = (1 - (data[i] * .2126 + data[i + 1] * .7152 + data[i + 2] * .0722) / 255) * data[i + 3] / 255;
        if (dark < .035 || random() > Math.pow(dark, .65) * .98) continue;
        const tx = ox + (x + (random() - .5) * 1.1) * scale;
        const ty = oy + (y + (random() - .5) * 1.1) * scale;
        const nx = -32 + random() * (width + 64), ny = -12 + random() * 164;
        const lp = logoPoints[dots.length % logoPoints.length];
        const lx = logoLeft + (lp.x + (random() - .5) * .65) / 360 * logoSize;
        const ly = logoTop + (lp.y + (random() - .5) * .65) / 360 * logoSize;
        // A broad, tapered distribution and varying mound height avoid a rectangular pile.
        const normal = Math.sqrt(-2 * Math.log(Math.max(.0001, random()))) * Math.cos(2 * Math.PI * random());
        const bx = width / 2 + Math.tanh(normal * .58) * (width / 2 - 10);
        const u = bx / width;
        const mound = 7 + 29 * Math.exp(-Math.pow((u - .32) / .13, 2)) + 20 * Math.exp(-Math.pow((u - .67) / .17, 2)) + 6 * Math.sin(u * 25) ** 2;
        const by = basinY - 2 - Math.pow(random(), 2.6) * mound - random() * 3;
        const delay = Math.min(.7, Math.max(0, (ty - oy) / rect.height) * .45 + random() * .2);
        dots.push({ tx, ty, nightX: tx, nightY: ty, nightR: 0, nx, ny, lx, ly, logoTone: lp.tone, logoV: lp.vee, bx, by, delay, bend: (random() - .5) * rect.width * .4, x: motion.matches ? tx : tx + (random() - .5) * width * .85, y: motion.matches ? ty : ty + (random() - .5) * height * .65, vx: 0, vy: 0, r: (.4 + dark * .5 + random() * .1) * scale });
      }
      // Sample the same cutout by luminance for night mode. Reuse the existing
      // particle count and logo/nav targets so the cycle and its density stay stable.
      const highlights: { x: number; y: number; tone: number; order: number; rank: number }[] = [];
      for (let y = 0; y < sample.height; y += 2) for (let x = 0; x < sample.width; x += 2) {
        const offset = (y * sample.width + x) * 4;
        const alpha = data[offset + 3] / 255;
        const luminance = (data[offset] * .2126 + data[offset + 1] * .7152 + data[offset + 2] * .0722) / 255;
        const tone = Math.pow(luminance, 1.45) * alpha;
        if (tone < .025) continue;
        highlights.push({ x, y, tone, order: offset,
          rank: -Math.log(Math.max(.00001, noise(offset, 19))) / tone });
      }
      const nightPoints = highlights.sort((a, b) => a.rank - b.rank).slice(0, dots.length).sort((a, b) => a.order - b.order);
      dots.forEach((p, index) => {
        const point = nightPoints[index % nightPoints.length];
        if (!point) { p.nightR = p.r; return; }
        p.nightX = ox + (point.x + (noise(index, 20) - .5) * 1.1) * scale;
        p.nightY = oy + (point.y + (noise(index, 21) - .5) * 1.1) * scale;
        p.nightR = (.22 + .65 * Math.sqrt(point.tone)) * scale;
      });
      if (intro) dots.forEach((p, index) => {
        const origin = loaderPoint(index);
        const t = smooth(formation);
        p.x = origin.x + ((highlightPortrait ? p.nightX : p.tx) - origin.x) * t;
        p.y = origin.y + ((highlightPortrait ? p.nightY : p.ty) - origin.y) * t;
      });
      dotBuffers = [new Float32Array(dots.length * 3), new Float32Array(dots.length * 3), new Float32Array(dots.length * 3)];
      updateScroll();
      wake();
    }
    function updateScroll() {
      const raw = Math.max(0, Math.min(1, (window.scrollY - heroTop + 72) / range));
      if (raw > .001) { returning = true; finishIntro(); }
      if (raw <= .001 && returning) { cycleTime = 0; returning = false; }
      const next = motion.matches ? (raw >= .5 ? 1 : 0) : raw * raw * (3 - 2 * raw);
      if (next === progress) return;
      progress = next;
      if (progress === 0) refreshBasin();
      stage.style.setProperty("--navbar-progress", String(progress));
      canvas!.dataset.docked = String(progress === 1);
      if (compact) {
        // Scrolling moves one composited layer, never thousands of springs.
        canvas!.style.transform = progress > 0 ? `translate3d(0, ${-progress * height * .55}px, 0)` : "";
        canvas!.style.opacity = String(1 - progress);
        if (progress > 0) {
          cancelAnimationFrame(frame); frame = 0; clearTimeout(holdTimer); holdTimer = 0;
          if (progress === 1) renderer!.clear();
          return;
        }
      }
      wake();
    }
    const move = (e: PointerEvent) => { if (motion.matches || progress === 1) return; pointer.x = e.clientX; pointer.y = e.clientY; wake(); };
    const leave = () => { pointer.x = pointer.y = -1000; wake(); };
    const resume = () => wake();
    const contextLost = (event: Event) => {
      event.preventDefault(); cancelAnimationFrame(frame); frame = 0;
      clearTimeout(holdTimer); setStaticFallback(true);
    };
    const visibility = () => { if (document.hidden) { cancelAnimationFrame(frame); frame = 0; clearTimeout(holdTimer); } else { refreshBasin(); wake(); } };
    const themeObserver = new MutationObserver(() => {
      readPalette(); wake();
      clearTimeout(themeTimer);
      themeTimer = window.setTimeout(() => { readPalette(); wake(); }, 750);
    });
    themeObserver.observe(root, {attributes:true, attributeFilter:["data-project-theme", "data-theme"]});
    const resize = new ResizeObserver(() => {
      clearTimeout(resizeTimer); resizeTimer = window.setTimeout(build, 120);
    });
    const rebuild = () => { builtWidth = 0; build(); };
    source.onload = () => { loaded = true; build(); };
    source.onerror = () => { if (!disposed) { finishIntro(); renderer.clear(); setFailed(true); } };
    source.src = "/images/rafael/portrait-source.webp";
    wake();
    resize.observe(stage);
    canvas.addEventListener("resume-particles", resume);
    canvas.addEventListener("webglcontextlost", contextLost);
    window.addEventListener("scroll", updateScroll, { passive: true });
    window.addEventListener("resize", viewportResize, { passive: true });
    visualViewport?.addEventListener("resize", viewportResize, { passive: true });
    visualViewport?.addEventListener("scroll", viewportResize, { passive: true });
    if (!compact) { window.addEventListener("pointermove", move, {passive: true}); window.addEventListener("pointerleave", leave); window.addEventListener("pointerup", leave); }
    motion.addEventListener("change", rebuild); document.addEventListener("visibilitychange", visibility);
    return () => { disposed = true; canvas.removeEventListener("webglcontextlost", contextLost); renderer.dispose(); clearTimeout(introTimeout); clearTimeout(holdTimer); clearTimeout(themeTimer); clearTimeout(resizeTimer); clearTimeout(basinTimer); window.removeEventListener("resize", viewportResize); visualViewport?.removeEventListener("resize", viewportResize); visualViewport?.removeEventListener("scroll", viewportResize); finishIntro(); canvas.removeEventListener("resume-particles", resume); cancelAnimationFrame(frame); resize.disconnect(); themeObserver.disconnect(); window.removeEventListener("scroll", updateScroll); window.removeEventListener("pointermove", move); window.removeEventListener("pointerleave", leave); window.removeEventListener("pointerup", leave); motion.removeEventListener("change", rebuild); document.removeEventListener("visibilitychange", visibility); };
  }, [staticFallback]);
  return <div className="portrait-stage"><button type="button" className="particle-toggle" aria-pressed={paused} aria-label={paused ? t("Reanudar animación") : t("Pausar animación")} onClick={() => { pausedRef.current = !pausedRef.current; setPaused(pausedRef.current); ref.current?.dispatchEvent(new Event("resume-particles")); }}>{paused ? t("Reanudar") : t("Pausar")}</button><canvas key={staticFallback ? "static" : "gpu"} ref={ref} role="img" aria-label={t("Partículas que alternan entre el retrato de Rafael Vales y su monograma RV")} />{failed && <p className="portrait-error">Rafael Vales</p>}</div>;
}
