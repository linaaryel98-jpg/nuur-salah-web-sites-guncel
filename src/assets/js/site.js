/* Site appearance and navigation only; no network requests or tracking. */
(() => {
  const root = document.documentElement;
  root.dataset.theme = 'light';
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#f3eee5');
    document.querySelectorAll('.hero-animation-toggle').forEach(animationButton => {
    const animationImage = animationButton.closest('.product-frame').querySelector('.hero-language-animation');
    if (animationButton && animationImage) {
      const syncFlags = () => {
        const frame = animationButton.closest('.product-frame');
        frame.classList.add('flags-restart');
        void frame.offsetWidth;
        frame.classList.remove('flags-restart');
      };
      animationImage.addEventListener('load', syncFlags);
      if (animationImage.complete) syncFlags();
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
      const syncMotion = () => { animationButton.hidden = reducedMotion.matches; };
      syncMotion();
      reducedMotion.addEventListener('change', syncMotion);
      animationButton.addEventListener('click', () => {
        const paused = animationButton.getAttribute('aria-pressed') !== 'true';
        animationImage.src = paused ? animationImage.dataset.poster : animationImage.dataset.animated;
        const watchImage = animationButton.closest('.device-preview')?.querySelector('.watch-animation');
        if (watchImage) watchImage.src = paused ? watchImage.dataset.poster : watchImage.dataset.animated;
        animationButton.setAttribute('aria-pressed', String(paused));
        animationButton.setAttribute('aria-label', paused ? animationButton.dataset.playLabel : animationButton.dataset.pauseLabel);
        animationButton.classList.toggle('is-paused', paused);
        animationButton.closest('.product-frame').classList.toggle('animation-paused', paused);
      });
    }
    });
    const groups = [...document.querySelectorAll('.nav-group')];
    const setOpen = (group, open) => {
      group.querySelector('.nav-panel').hidden = !open;
      group.querySelector('.nav-expand').setAttribute('aria-expanded', String(open));
    };
    const closeAll = except => groups.forEach(g => { if (g !== except) setOpen(g, false); });
    groups.forEach(group => {
      group.addEventListener('mouseenter', () => {
        if (window.matchMedia('(hover: hover)').matches) { closeAll(group); setOpen(group, true); }
      });
      group.addEventListener('mouseleave', () => { if (!group.contains(document.activeElement)) setOpen(group, false); });
      group.addEventListener('focusin', () => { closeAll(group); setOpen(group, true); });
      group.addEventListener('focusout', e => { if (!group.contains(e.relatedTarget)) setOpen(group, false); });
      group.querySelector('.nav-expand').addEventListener('click', e => {
        // Focus may have opened the panel already; use the previous pointer state for touch.
        const open = e.currentTarget.dataset.pointerExpanded ?? e.currentTarget.getAttribute('aria-expanded');
        closeAll(group); setOpen(group, open !== 'true');
        delete e.currentTarget.dataset.pointerExpanded;
      });
      group.querySelector('.nav-expand').addEventListener('pointerdown', e => {
        e.currentTarget.dataset.pointerExpanded = e.currentTarget.getAttribute('aria-expanded');
      });
    });
    document.addEventListener('click', e => {
      if (!e.target.closest('.nav-group')) closeAll();
      if (!e.target.closest('.lang')) document.querySelector('.lang')?.removeAttribute('open');
      if (e.target.closest('a')) {
        closeAll();
        document.querySelector('.mobile-menu')?.removeAttribute('open');
      }
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        const language = document.querySelector('.lang[open]');
        if (language?.contains(document.activeElement)) language.querySelector('summary').focus();
        language?.removeAttribute('open');
        const active = document.activeElement.closest?.('.nav-group');
        active?.querySelector('.nav-label > a').focus();
        closeAll();
        document.querySelector('.mobile-menu')?.removeAttribute('open');
      }
    });
  });
})();

// Continuous galleries: hover/focus pauses, dragging provides direct control.
document.addEventListener('DOMContentLoaded', () => {
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 for (const id of ['feature-slider','screen-slider']) {
  const track=document.getElementById(id); if(!track)continue;
  const list=id==='feature-slider'?track:track.querySelector('ul');
  const original=[...list.children];
  for(const card of (id==='feature-slider' ? original : [])){
   const clone=card.cloneNode(true); clone.setAttribute('aria-hidden','true'); clone.inert=true; clone.removeAttribute('id');
   clone.querySelectorAll('[id]').forEach(el=>el.removeAttribute('id'));
   list.append(clone);
  }
  let hover=false,focus=false,drag=null,last=0,until=0;
  const cycle=()=>id==='feature-slider'
   ? list.children[original.length].offsetLeft-list.children[0].offsetLeft
   : track.scrollWidth-track.clientWidth;
  const normalize=()=>{const width=cycle();if(width>0&&track.scrollLeft>=width-1){
   if(id==='screen-slider')track.scrollLeft=0;
   else track.scrollLeft-=width;
  }};
  track.classList.add('auto-slider');
  track.addEventListener('pointerenter',()=>hover=true);
  track.addEventListener('pointerleave',()=>hover=false);
  track.addEventListener('focusin',()=>focus=true);
  track.addEventListener('focusout',e=>focus=track.contains(e.relatedTarget));
  track.addEventListener('pointerdown',e=>{
   if(e.pointerType!=='mouse'||e.button!==0)return;
   drag={x:e.clientX,start:track.scrollLeft,moved:false};
  });
  window.addEventListener('pointermove',e=>{
   if(!drag)return;
   const dx=e.clientX-drag.x;
   if(Math.abs(dx)>5){drag.moved=true;track.classList.add('is-dragging');}
   if(drag.moved){track.scrollLeft=drag.start-dx;normalize();e.preventDefault();}
  },{passive:false});
  window.addEventListener('pointerup',()=>{if(drag){track.dataset.dragged=String(drag.moved);drag=null;track.classList.remove('is-dragging');}});
  track.addEventListener('click',e=>{if(track.dataset.dragged==='true'){e.preventDefault();e.stopPropagation();track.dataset.dragged='false';}},true);
  track.addEventListener('dragstart',e=>e.preventDefault());
  track.addEventListener('wheel',()=>until=performance.now()+1500,{passive:true});
  track.addEventListener('touchstart',()=>until=Infinity,{passive:true});
  track.addEventListener('touchend',()=>until=performance.now()+1800,{passive:true});
  const animate=now=>{
   const dt=Math.min(now-last,50);last=now;
   if(!reduced.matches&&!document.hidden&&!hover&&!focus&&!drag&&now>until){track.scrollLeft+=dt*.028;normalize();}
   requestAnimationFrame(animate);
  };
  requestAnimationFrame(animate);
 }
});
