(() => {
 'use strict';
 const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
 if (!reduceMotion.matches) document.documentElement.classList.add('has-motion');
 const menu = document.getElementById('mobile-menu');
 const menuButton = document.querySelector('.menu-toggle');
 function closeMenu() { menu.hidden = true; menuButton.setAttribute('aria-expanded', 'false'); }
 menuButton.addEventListener('click', () => { const open = menuButton.getAttribute('aria-expanded') === 'true'; menu.hidden = open; menuButton.setAttribute('aria-expanded', String(!open)); });
 menu.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
 document.addEventListener('keydown', event => { if (event.key === 'Escape' && !menu.hidden) { closeMenu(); menuButton.focus(); } });
 window.matchMedia('(min-width: 980px)').addEventListener('change', event => { if (event.matches) closeMenu(); });
 document.addEventListener('click', event => { if (!menu.hidden && !menu.contains(event.target) && !menuButton.contains(event.target)) closeMenu(); });

 const revealObserver = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('is-visible'); revealObserver.unobserve(entry.target); } }), { threshold: .12 });
 document.querySelectorAll('.reveal').forEach(element => revealObserver.observe(element));
 const progress = document.querySelector('.scroll-progress');
 const dock = document.querySelector('.mobile-dock');
 let scrollQueued = false;
 function updateScroll() { const range = document.documentElement.scrollHeight - innerHeight; progress.style.transform = 'scaleX(' + (range > 0 ? scrollY / range : 0) + ')'; dock.classList.toggle('is-hidden', document.querySelector('.site-footer').getBoundingClientRect().top < innerHeight - 80); scrollQueued = false; }
 window.addEventListener('scroll', () => { if (!scrollQueued) { scrollQueued = true; requestAnimationFrame(updateScroll); } }, { passive: true });
 updateScroll();

 const rail = document.getElementById('product-rail');
 const cards = [...rail.querySelectorAll('.product-card')];
 const dots = [...document.querySelectorAll('[data-slide]')];
 let current = 0, railQueued = false;
 function select(index) { current = Math.max(0, Math.min(index, cards.length - 1)); cards.forEach((card,i) => card.classList.toggle('is-active',i === current)); dots.forEach((dot,i) => { dot.classList.toggle('is-active',i === current); if(i === current) dot.setAttribute('aria-current','true'); else dot.removeAttribute('aria-current'); }); document.getElementById('slide-current').textContent = String(current+1).padStart(2,'0'); document.getElementById('previous-product').disabled = current === 0; document.getElementById('next-product').disabled = current === cards.length - 1; }
 function goTo(index) { index = Math.max(0,Math.min(index,cards.length-1)); select(index); const padding = parseFloat(getComputedStyle(rail).paddingLeft); const target = cards[index].offsetLeft - rail.offsetLeft - padding; const maxScroll = rail.scrollWidth - rail.clientWidth; if(maxScroll > 4) rail.scrollTo({left:Math.max(0,Math.min(target,maxScroll)),behavior:reduceMotion.matches?'instant':'smooth'}); else { cards[index].animate([{transform:'translateY(0)'},{transform:'translateY(-9px)'},{transform:'translateY(0)'}],{duration:reduceMotion.matches?0:400,easing:'ease-out'}); } }
 rail.addEventListener('scroll', () => { if (railQueued) return; railQueued = true; requestAnimationFrame(() => { const padding = parseFloat(getComputedStyle(rail).paddingLeft); const start = rail.getBoundingClientRect().left + padding; let nearest = 0, distance = Infinity; cards.forEach((card,index) => { const delta = Math.abs(card.getBoundingClientRect().left - start); if(delta < distance){distance = delta;nearest = index;} }); if (rail.scrollLeft >= rail.scrollWidth - rail.clientWidth - 2) nearest = cards.length-1; select(nearest); railQueued = false; }); }, {passive:true});
 dots.forEach(dot => dot.addEventListener('click', () => goTo(Number(dot.dataset.slide))));
 document.getElementById('previous-product').addEventListener('click', () => goTo(current-1));
 document.getElementById('next-product').addEventListener('click', () => goTo(current+1));
 rail.addEventListener('keydown', event => { if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') { event.preventDefault(); goTo(current + (event.key === 'ArrowRight' ? 1 : -1)); cards[current].querySelector('button').focus({preventScroll:true}); } });
 select(0);

 const dialog = document.getElementById('product-dialog');
 let dialogIndex = 0, returnFocus = null;
 const products = [
  {image:'assets/product-1.jpg',title:'Figue & fleur d’oranger',description:'La figue fraîche rencontre la fleur d’oranger dans cette tarte de la maison, partagée le 5 septembre 2026.',source:'https://www.instagram.com/p/Dc5S23ziKEH/'},
  {image:'assets/product-2.jpg',title:'Brioche chocolat–passion',description:'Une brioche moelleuse chocolat et passion, présentée par la maison le 24 octobre 2026. Une rencontre gourmande et fruitée.',source:'https://www.instagram.com/p/De3gPjOCGGA/'},
  {image:'assets/product-3.jpg',title:'Coing & vanille',description:'Une tarte coing et vanille aux teintes dorées, partagée par la maison le 24 octobre 2026. Une inspiration d’automne.',source:'https://www.instagram.com/p/De3gPjOCGGA/'}
 ];
 function updateDialog(index) { dialog.scrollTop = 0; dialogIndex = (index + products.length) % products.length; const product = products[dialogIndex]; document.getElementById('dialog-source').href = product.source; const image = document.getElementById('dialog-image'); image.src = product.image; image.alt = product.title + ' Photographie entière de la création.'; document.getElementById('dialog-title').textContent = product.title; document.getElementById('dialog-description').textContent = product.description; document.getElementById('dialog-count').textContent = String(dialogIndex+1).padStart(2,'0')+' / 03'; image.classList.remove('is-changing'); void image.offsetWidth; image.classList.add('is-changing'); }
 document.querySelectorAll('[data-product]').forEach(button => button.addEventListener('click', () => { returnFocus = button; updateDialog(Number(button.dataset.product)); dialog.showModal(); document.body.style.overflow = 'hidden'; }));
 function closeDialog() { dialog.close(); }
 document.querySelector('.dialog-close').addEventListener('click', closeDialog);
 dialog.addEventListener('click', event => { if(event.target === dialog){ const r=dialog.getBoundingClientRect(); if(event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) closeDialog(); } });
 dialog.addEventListener('close', () => { document.body.style.overflow = ''; returnFocus?.focus({preventScroll:true}); });
 dialog.addEventListener('keydown', event => { if(event.key === 'ArrowRight' || event.key === 'ArrowLeft'){event.preventDefault();updateDialog(dialogIndex+(event.key === 'ArrowRight'?1:-1));} });
 document.querySelectorAll('[data-dialog-step]').forEach(button => button.addEventListener('click', () => updateDialog(dialogIndex+Number(button.dataset.dialogStep))));
 const tabs = [...document.querySelectorAll('.scene-tabs [role=tab]')];
 function activateTab(tab,focus=false) { tabs.forEach(item => { const active = item === tab; item.setAttribute('aria-selected',String(active)); item.tabIndex = active ? 0 : -1; document.getElementById(item.getAttribute('aria-controls')).hidden = !active; }); if(focus) tab.focus(); }
 tabs.forEach(tab => { tab.addEventListener('click', () => activateTab(tab)); tab.addEventListener('keydown', event => { const i = tabs.indexOf(tab); if(['ArrowLeft','ArrowRight','Home','End'].includes(event.key)){event.preventDefault();const next=event.key==='Home'?0:event.key==='End'?tabs.length-1:(i+(event.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;activateTab(tabs[next],true);} }); });
 activateTab(tabs[0]);
})();
