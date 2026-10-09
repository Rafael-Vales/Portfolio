/** Run with playwright-cli run-code after removing the export-default prefix. */
export default async function verifyMobileProjects(page) {
  const context = await page.context().browser().newContext({viewport:{width:393,height:852},deviceScaleFactor:2,isMobile:true,hasTouch:true});
  const p = await context.newPage();
  const errors=[]; p.on('pageerror',e=>errors.push(String(e)));
  const results=[];
  const bounds=async () => p.evaluate(() => {
    const r=s=>{const b=document.querySelector(s).getBoundingClientRect();return {top:b.top,bottom:b.bottom,left:b.left,right:b.right,height:b.height};};
    const content=document.querySelector('.project-front .trip-project-content, .clinic-project-content');
    return {viewport:{width:innerWidth,height:innerHeight},header:r('.header'),browser:r('.project-browser'),card:r('.project-expanded-cover'),action:r('.project-front .project-flip-trigger'),overflowX:content.scrollWidth-content.clientWidth,overflowY:content.scrollHeight-content.clientHeight,storyBottom:document.querySelector('.trip-showcase-story p')?.getBoundingClientRect().bottom,controlsTop:document.querySelector('.trip-showcase-controls')?.getBoundingClientRect().top};
  });
  function check(result, label) {
    if(Math.abs(result.browser.top-result.header.bottom)>2 || result.card.bottom>result.viewport.height+1 || result.card.left<0 || result.card.right>result.viewport.width+1 || result.action.bottom>result.card.bottom || result.card.height<100 || result.overflowX>1) throw Error(label+': '+JSON.stringify(result));
    if(result.storyBottom>result.controlsTop+1) throw Error('Slide text overlaps its controls: '+JSON.stringify(result));
  }
  try {
    for(const viewport of [{width:393,height:852},{width:360,height:780},{width:430,height:932},{width:320,height:568},{width:852,height:393}]) {
      await p.setViewportSize(viewport);
      for(const locale of ['es','en']) for(const slug of ['trippilot','animal-feed','consultorio']) {
        await p.goto(new URL(`${locale==='en'?'/en':'/'}?project=${slug}&verify=fit#proyectos`,page.url()).href);
        await p.waitForTimeout(750);
        const result=await bounds(); check(result,`${locale}/${slug}/${viewport.width}`);
        // Full overview without internal scrolling on standard portrait phones.
        if(viewport.height>=780 && result.overflowY>1) throw Error('Overview still needs scrolling: '+JSON.stringify({locale,slug,viewport,result}));
        results.push({locale,slug,...viewport,overflowY:result.overflowY,cardHeight:result.card.height});
        if(viewport.width===393 && locale==='es') await p.screenshot({path:`/private/tmp/mobile-project-${slug}.png`});
      }
    }
    await p.setViewportSize({width:393,height:852});
    await p.goto(new URL('/?verify=selection#proyectos',page.url()).href);
    await p.getByRole('button',{name:'Abrir TripPilot',exact:true}).click();
    await p.waitForFunction(() => document.documentElement.dataset.projectTheme==='trippilot' && !document.documentElement.dataset.projectPainting);
    check(await bounds(),'Opening from gallery');
    for(let i=0;i<8;i++) {
      await p.locator('.trip-showcase-dots button').nth(i).click();
      await p.waitForTimeout(650);
      const result=await bounds(); check(result,'TripPilot slide '+i);
      if(result.overflowY>1) throw Error('Slide does not fit: '+JSON.stringify(result));
    }
    await p.setViewportSize({width:852,height:393});
    await p.waitForTimeout(500);
    check(await bounds(),'Rotate selected project');
    await p.setViewportSize({width:393,height:852});
    await p.waitForTimeout(500);
    check(await bounds(),'Return to portrait');
    const scrollBefore=await p.evaluate(()=>scrollY);
    await p.getByRole('button',{name:'Cómo lo construí',exact:true}).click();
    await p.waitForTimeout(900);
    const back=await p.locator('.project-back').boundingBox();
    const returnButton=await p.getByRole('button',{name:'Volver al producto',exact:true}).boundingBox();
    if(returnButton.y+returnButton.height>back.y+back.height || await p.evaluate(()=>scrollY)!==scrollBefore) throw Error('Flipping moves the reader or hides the return action');
    await p.locator('.project-back-content').evaluate(el=>{el.scrollTop=el.scrollHeight;});
    const last=await p.locator('.project-back-content > small').boundingBox();
    if(last.y+last.height>returnButton.y) throw Error('Technical details cannot be read to the end');
    await p.getByRole('button',{name:'Volver al producto',exact:true}).click();
    await p.waitForTimeout(900);
    check(await bounds(),'Return from technical details');
    await p.getByRole('button',{name:'Proyecto siguiente',exact:true}).click();
    await p.waitForFunction(() => document.documentElement.dataset.projectTheme==='animal-feed' && !document.documentElement.dataset.projectPainting);
    check(await bounds(),'Next project');
    if(await p.locator('.animal-try-mobile').getAttribute('href')!=='https://ecommerce-los-abuelos.vercel.app/') throw Error('Store CTA lost its destination');
    await p.getByRole('button',{name:'Proyecto siguiente',exact:true}).click();
    await p.waitForFunction(() => new URL(location.href).searchParams.get('project')==='consultorio');
    await p.waitForTimeout(800);
    check(await bounds(),'Next clinic');
    await p.getByRole('button',{name:'Cómo lo construí',exact:true}).click();
    await p.waitForTimeout(900);
    await p.locator('.project-back-content').evaluate(el=>{el.scrollTop=el.scrollHeight;});
    await p.screenshot({path:'/private/tmp/mobile-project-technical-details.png'});
    await p.getByRole('button',{name:'Volver al proyecto',exact:true}).click();
    await p.waitForTimeout(900);
    await p.getByRole('button',{name:'Volver a la galería',exact:true}).click();
    await p.waitForFunction(()=>document.querySelector('.project-gallery'));
    await p.waitForTimeout(650);
    const focused=await p.evaluate(()=>document.activeElement?.getAttribute('aria-label'));
    if(focused!=='Abrir TripPilot') throw Error('Gallery focus was not restored: '+focused);
    await p.evaluate(()=>localStorage.setItem('portfolio-theme','dark'));
    await p.goto(new URL('/?project=consultorio&verify=dark#proyectos',page.url()).href);
    await p.waitForTimeout(800);
    check(await bounds(),'Dark clinic');
    if(errors.length) throw Error(JSON.stringify(errors));
    return {cases:results,slides:8,selectionAndFlip:'passed',darkMode:'passed',errors};
  } finally { await context.close(); }
}
