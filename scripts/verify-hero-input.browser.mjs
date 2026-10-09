/** Run with playwright-cli run-code after removing the export-default prefix. */
export default async function verifyHeroInput(page) {
  const context = await page.context().browser().newContext({
    viewport: { width: 393, height: 852 }, deviceScaleFactor: 2,
    isMobile: true, hasTouch: true,
  });
  const testPage = await context.newPage();
  const errors = [];
  testPage.on("pageerror", error => errors.push(String(error)));
  await testPage.addInitScript(() => {
    window.__heroDraws = 0;
    const clear = WebGLRenderingContext.prototype.clear;
    WebGLRenderingContext.prototype.clear = function (...args) {
      if (this.canvas.closest(".portrait-stage")) window.__heroDraws++;
      return clear.apply(this, args);
    };
  });
  try {
    await testPage.bringToFront();
    await testPage.goto(new URL("/?verify=input#contacto", page.url()).href);
    await testPage.waitForFunction(() => document.querySelector(".portrait-stage canvas")?.dataset.motion === "gpu");
    // Let the initial hash navigation finish before moving back to the hero.
    await testPage.waitForTimeout(500);
    await testPage.evaluate(() => {
      history.replaceState(null, "", location.pathname + location.search);
      document.documentElement.style.scrollBehavior = "auto";
      scrollTo({ top: 0, behavior: "instant" });
    });
    await testPage.waitForTimeout(200);
    await testPage.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
    await testPage.waitForFunction(() => scrollY === 0 && Number(document.querySelector(".portrait-stage").style.getPropertyValue("--navbar-progress")) === 0);
    await testPage.waitForTimeout(200);
    await testPage.getByRole("button", { name: "Pausar animación", exact: true }).evaluate(el => el.click());
    await testPage.waitForTimeout(100);
    const pixels = async (save = false) => testPage.evaluate(save => {
      const canvas = document.querySelector(".portrait-stage canvas");
      const gl = canvas.getContext("webgl");
      const data = new Uint8Array(canvas.width * canvas.height * 4);
      gl.readPixels(0, 0, canvas.width, canvas.height, gl.RGBA, gl.UNSIGNED_BYTE, data);
      let changed = 0, yTotal = 0, ink = 0;
      for (let i = 3; i < data.length; i += 4) {
        if (window.__heroPixels && Math.abs(data[i] - window.__heroPixels[i]) > 20) changed++;
        if (data[i] > 40) { yTotal += canvas.height - 1 - Math.floor(i / 4 / canvas.width); ink++; }
      }
      if (save) window.__heroPixels = data;
      return { changed, ink, centerY: yTotal / ink / 2, draws: window.__heroDraws, error: gl.getError() };
    }, save);
    const baseline = await pixels(true);
    await testPage.dispatchEvent("body", "pointerdown", {
      pointerId: 1, pointerType: "touch", clientX: 200, clientY: 460, isPrimary: true,
    });
    await testPage.waitForTimeout(250);
    const touched = await pixels();
    if (touched.changed < 100) throw Error(`Touch did not displace particles: ${JSON.stringify(touched)}`);
    await testPage.dispatchEvent("body", "pointercancel", { pointerId: 1, pointerType: "touch" });
    await testPage.waitForTimeout(800);
    const released = await pixels();
    if (released.changed > 100) throw Error(`Particles did not settle after cancellation: ${JSON.stringify(released)}`);
    await testPage.waitForTimeout(350);
    const idleDraws = (await pixels()).draws - released.draws;
    if (idleDraws) throw Error(`Paused interaction kept drawing: ${idleDraws}`);

    await testPage.evaluate(() => scrollTo({ top: 160, behavior: "instant" }));
    await testPage.waitForTimeout(180);
    const scrolled = await pixels();
    if (scrolled.draws <= released.draws || scrolled.centerY >= baseline.centerY - 20) {
      throw Error(`Scroll did not gather particles toward header: ${JSON.stringify({ baseline, scrolled })}`);
    }
    await testPage.waitForTimeout(350);
    const scrollIdleDraws = (await pixels()).draws - scrolled.draws;
    if (scrollIdleDraws) throw Error(`Stationary scroll kept rendering: ${scrollIdleDraws}`);

    const hero = await testPage.evaluate(() => {
      const box = document.querySelector(".hero").getBoundingClientRect();
      return { top: box.top + scrollY, height: box.height };
    });
    const nameWidths = [];
    for (const progress of [.985, .99, .999, 1]) {
      await testPage.evaluate(y => scrollTo({ top: y, behavior: "instant" }), hero.top - 72 + hero.height * .7 * progress);
      await testPage.waitForTimeout(80);
      nameWidths.push(await testPage.locator(".scroll-name").evaluate(el => el.getBoundingClientRect().width));
    }
    const maxNameJump = Math.max(...nameWidths.slice(1).map((width, i) => Math.abs(width - nameWidths[i])));
    if (maxNameJump > 1) throw Error(`Name snaps at docking: ${JSON.stringify(nameWidths)}`);
    const docked = await testPage.locator(".scroll-name").boundingBox();
    if (Math.abs(docked.x - 20) > 1 || docked.y < 0 || docked.y + docked.height > 72) {
      throw Error(`Name misses header: ${JSON.stringify(docked)}`);
    }
    if (errors.length || touched.error || scrolled.error) throw Error(JSON.stringify({ errors, touched, scrolled }));
    return { touchChangedPixels: touched.changed, releasedChangedPixels: released.changed,
      idleDraws, scrollIdleDraws, centerBefore: baseline.centerY, centerAfterScroll: scrolled.centerY,
      maxNameJump, docked, errors };
  } finally {
    await context.close();
  }
}
