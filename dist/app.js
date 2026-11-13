(() => {
  'use strict';

  const data = window.EC_CONTENT;
  if (!data?.products?.length || !data?.chapters?.length) return;
  const { products, chapters } = data;
  const root = document.documentElement;
  const reducedPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
  const desktop = window.matchMedia('(min-width: 1000px)');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  const $ = selector => document.querySelector(selector);
  const $$ = selector => [...document.querySelectorAll(selector)];
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const wrap = (value, length) => (value % length + length) % length;
  const animations = new WeakMap();
  const activeMotion = new Set();
  function animateElement(element, frames, options) {
    const animation = element.animate(frames, options);
    activeMotion.add(animation);
    animation.finished.catch(() => {}).then(() => activeMotion.delete(animation));
    return animation;
  }

  let productIndex = 0;
  let chapterIndex = 0;
  let motionSetting = 'full';
  try { motionSetting = localStorage.getItem('ec-motion') === 'reduced' ? 'reduced' : 'full'; } catch {}
  const motionEnabled = () => root.dataset.motion === 'full' && !reducedPreference.matches;

  function entrance(element, distance = 14, duration = 520) {
    if (!element || !motionEnabled()) return;
    animations.get(element)?.cancel();
    const animation = animateElement(element, [
      { opacity: .15, transform: 'translate3d(0,' + distance + 'px,0)' },
      { opacity: 1, transform: 'translate3d(0,0,0)' }
    ], { duration, easing: 'cubic-bezier(.22,1,.36,1)' });
    animations.set(element, animation);
  }

  /* Keep the outgoing photograph in place until the incoming original is decoded. */
  const photoRequests = new WeakMap();
  function changePhoto(image, item, animate = true, style = 'page') {
    const ticket = {};
    photoRequests.set(image, ticket);
    if (image.getAttribute('src') === item.image) { image.alt = item.alt; return; }
    const loader = new Image();
    loader.src = item.image;
    const ready = loader.decode ? loader.decode().catch(() => {}) : Promise.resolve();
    ready.then(() => {
      if (photoRequests.get(image) !== ticket) return;
      const parent = image.parentElement;
      parent.querySelectorAll('.photo-ghost').forEach(ghost => ghost.remove());
      const outgoing = image.cloneNode();
      outgoing.removeAttribute('id');
      outgoing.alt = '';
      outgoing.setAttribute('aria-hidden', 'true');
      outgoing.className = 'photo-ghost';
      image.src = item.image;
      image.alt = item.alt;
      if (!animate || !motionEnabled()) return;
      parent.append(outgoing);
      animations.get(image)?.cancel();
      const turn = style === 'page' ? 'perspective(1000px) translate3d(26px,18px,0) rotateY(-13deg) rotateZ(2deg) scale(.97)' : 'translate3d(25px,0,0) scale(1.035)';
      const incoming = animateElement(image, [{ opacity: 0, transform: turn }, { opacity: 1, transform: 'none' }], { duration: 760, easing: 'cubic-bezier(.16,1,.3,1)' });
      animations.set(image, incoming);
      animateElement(outgoing, [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: style === 'page' ? 'translate3d(-30px,-5px,0) rotateZ(-3deg) scale(.96)' : 'translate3d(-18px,0,0)' }], { duration: 600, easing: 'cubic-bezier(.22,1,.36,1)' }).finished.catch(() => {}).then(() => outgoing.remove());
    });
  }

  function setNotes(element, notes) {
    element.replaceChildren(...notes.map(note => {
      const span = document.createElement('span');
      span.textContent = note;
      return span;
    }));
  }

  function syncMotion() {
    const reduced = reducedPreference.matches || motionSetting === 'reduced';
    root.dataset.motion = reduced ? 'reduced' : 'full';
    const button = $('#motion-toggle');
    button.setAttribute('aria-pressed', String(reduced));
    button.disabled = reducedPreference.matches;
    button.textContent = reducedPreference.matches ? 'Animations réduites · réglage système' : reduced ? 'Réactiver les animations' : 'Réduire les animations';
    $$('.motion-pause').forEach(control => { control.setAttribute('aria-pressed', String(reduced)); control.textContent = reduced ? 'Reprendre' : 'Pause'; control.setAttribute('aria-label', reduced ? 'Reprendre les animations' : 'Mettre les animations en pause'); control.disabled = reducedPreference.matches; });
    if (reduced) {
      // Cancelled close animations still complete their dialog cleanup via finished.
      activeMotion.forEach(animation => animation.cancel());
      $$('[data-reveal]').forEach(element => { element.dataset.reveal = 'shown'; });
      $('.hero').style.setProperty('--pointer-x', '0px');
      $('.hero').style.setProperty('--pointer-y', '0px');
      $('.hero').style.setProperty('--scene-y', '0px');
    }
  }
  [$('#motion-toggle'), ...$$('.motion-pause')].forEach(button => button.addEventListener('click', () => {
    motionSetting = motionSetting === 'reduced' ? 'full' : 'reduced';
    try { localStorage.setItem('ec-motion', motionSetting); } catch {}
    syncMotion();
    requestFrame();
  }));
  reducedPreference.addEventListener('change', syncMotion);
  syncMotion();

  /* One selection controls the scene, tasting note and accessible state. */
  const heroCards = $$('[data-hero-product]');
  const productChoices = $$('[data-select-product]');
  function selectProduct(index, animate = true) {
    const next = wrap(index, products.length);
    const changed = next !== productIndex;
    productIndex = next;
    const product = products[next];
    root.style.setProperty('--tone', product.tone);
    heroCards.forEach((card, i) => {
      const position = wrap(i - next, products.length);
      card.tabIndex = i === next ? 0 : -1;
      card.dataset.position = position === 0 ? 'center' : position === 1 ? 'right' : position === products.length - 1 ? 'left' : 'hidden';
      card.setAttribute('aria-hidden', String(card.dataset.position === 'hidden'));
      if (i === next) card.setAttribute('aria-current', 'true');
      else card.removeAttribute('aria-current');
      card.setAttribute('aria-label', products[i].name + (i === next ? ' : ouvrir la photographie' : ' : choisir cette création'));
    });
    productChoices.forEach(button => button.setAttribute('aria-pressed', String(Number(button.dataset.selectProduct) === next)));
    $('#hero-product-name').textContent = product.name;
    $('.stage-word').textContent = product.shortName.toLowerCase() + '.';
    if (changed && animate) entrance($('#hero-product-name'), 7, 400);
  }

  $$('[data-product-step]').forEach(button => button.addEventListener('click', () => selectProduct(productIndex + Number(button.dataset.productStep))));
  let hoverTimer;
  productChoices.forEach(button => {
    const index = Number(button.dataset.selectProduct);
    button.addEventListener('click', () => selectProduct(index));
    button.addEventListener('focus', () => { if (finePointer.matches) selectProduct(index); });
    button.addEventListener('pointerenter', () => {
      if (!finePointer.matches) return;
      clearTimeout(hoverTimer);
      hoverTimer = setTimeout(() => selectProduct(index), 110);
    });
    button.addEventListener('pointerleave', () => clearTimeout(hoverTimer));
    button.addEventListener('keydown', event => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? products.length - 1 : wrap(index + (event.key === 'ArrowRight' ? 1 : -1), products.length);
      selectProduct(next);
      button.parentElement.querySelector('[data-select-product="' + next + '"]').focus();
    });
  });
  heroCards.forEach((card, index) => card.addEventListener('click', () => {
    if (index === productIndex) openProduct(index, card);
    else selectProduct(index);
  }));
  $('#hero-stage').addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    event.preventDefault();
    selectProduct(productIndex + (event.key === 'ArrowRight' ? 1 : -1));
    heroCards[productIndex].focus({ preventScroll: true });
  });
  $$('[data-product-open]').forEach(button => button.addEventListener('click', event => openProduct(Number(button.dataset.productOpen), event.currentTarget)));
  selectProduct(0, false);

  document.addEventListener('ec:open-product', event => openProduct(event.detail.index, event.detail.trigger));

  /* Horizontal gestures leave ordinary vertical phone scrolling untouched. */
  function addSwipe(element, change) {
    let start = null;
    let ignoreClickUntil = 0;
    element.addEventListener('pointerdown', event => {
      if (!event.isPrimary || event.button !== 0) return;
      start = { id: event.pointerId, x: event.clientX, y: event.clientY, horizontal: false };
    });
    element.addEventListener('pointermove', event => {
      if (!start || event.pointerId !== start.id) return;
      const dx = event.clientX - start.x;
      const dy = event.clientY - start.y;
      if (!start.horizontal && Math.abs(dx) > 12 && Math.abs(dx) > Math.abs(dy) * 1.35) {
        start.horizontal = true;
        element.setPointerCapture(event.pointerId);
      }
      if (start.horizontal && event.cancelable) event.preventDefault();
    });
    element.addEventListener('pointerup', event => {
      if (!start || event.pointerId !== start.id) return;
      const dx = event.clientX - start.x;
      const dy = event.clientY - start.y;
      if (start.horizontal) {
        ignoreClickUntil = performance.now() + 450;
        if (Math.abs(dx) > 38 && Math.abs(dx) > Math.abs(dy) * 1.2) change(dx < 0 ? 1 : -1);
      }
      if (element.hasPointerCapture(event.pointerId)) element.releasePointerCapture(event.pointerId);
      start = null;
    });
    element.addEventListener('pointercancel', () => { start = null; });
    element.addEventListener('click', event => {
      if (performance.now() < ignoreClickUntil) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    }, true);
  }
  addSwipe($('#hero-stage'), step => selectProduct(productIndex + step));

  /* Native full-screen menu, with staggered links and focus containment. */
  const header = $('#site-header');
  const menu = $('#menu-dialog');
  const menuOpen = $('#menu-open');
  const productDialog = $('#product-dialog');
  const updateDialogLock = () => document.body.classList.toggle('dialog-open', Boolean(document.querySelector('dialog[open]')));
  function closeWithMotion(dialog, kind = 'product') {
    if (!dialog.open || dialog.dataset.closing) return;
    if (!motionEnabled()) { dialog.close(); return; }
    dialog.dataset.closing = 'true';
    const frames = kind === 'menu' ? [{ clipPath: 'inset(0 0 0 0 round 0px)', opacity: 1 }, { clipPath: 'inset(0 0 100% 0 round 0px)', opacity: .8 }] : [{ opacity: 1, transform: 'translateY(0) scale(1)' }, { opacity: 0, transform: 'translateY(24px) scale(.96)' }];
    animateElement(dialog, frames, { duration: kind === 'menu' ? 480 : 280, easing: 'cubic-bezier(.65,0,.35,1)' }).finished.catch(() => {}).then(() => { dialog.close(); delete dialog.dataset.closing; });
  }
  function closeMenu() { closeWithMotion(menu, 'menu'); }
  menuOpen.addEventListener('click', () => {
    header.classList.remove('is-hidden');
    menu.showModal();
    if (motionEnabled()) animateElement(menu, [{ clipPath: 'inset(0 0 100% 0 round 0px)' }, { clipPath: 'inset(0 0 0 0 round 0px)' }], { duration: 720, easing: 'cubic-bezier(.76,0,.24,1)' });
    menuOpen.setAttribute('aria-expanded', 'true');
    updateDialogLock();
    $('#menu-close').focus({ preventScroll: true });
  });
  $('#menu-close').addEventListener('click', closeMenu);
  $$('[data-close-menu]').forEach(link => link.addEventListener('click', closeMenu));
  menu.addEventListener('cancel', event => { event.preventDefault(); closeMenu(); });
  menu.addEventListener('close', () => {
    menuOpen.setAttribute('aria-expanded', 'false');
    updateDialogLock();
    header.classList.remove('is-hidden');
  });
  const menuPhotos = [products[0], { image: chapters[0].image, alt: '' }, { image: 'assets/boutique-hd.jpg', alt: '' }];
  $$('[data-menu-preview]').forEach(link => {
    const preview = () => changePhoto($('#menu-preview-image'), menuPhotos[Number(link.dataset.menuPreview)], true, 'slide');
    link.addEventListener('pointerenter', preview);
    link.addEventListener('focus', preview);
  });
  header.addEventListener('focusin', () => header.classList.remove('is-hidden'));

  /* The full original is the default. A deliberate detail view is optional. */
  let dialogProduct = 0;
  let opener = null;
  let zoomed = false;
  function setZoom(value) {
    zoomed = value;
    $('.dialog-photo').classList.toggle('is-zoomed', value);
    $('#zoom-toggle').setAttribute('aria-pressed', String(value));
    $('#zoom-toggle').textContent = value ? 'Photo entière −' : 'Voir le détail +';
  }
  function updateProductDialog(index) {
    dialogProduct = wrap(index, products.length);
    const product = products[dialogProduct];
    const image = $('#dialog-image');
    setZoom(false);
    changePhoto(image, product, productDialog.open, 'slide');
    $('#dialog-title').textContent = product.name;
    $('#dialog-body').textContent = product.body;
    $('#dialog-publication').textContent = 'Création publiée le ' + product.published;
    $('#dialog-source').href = product.source;
    $('#dialog-count').textContent = product.shortName;
    setNotes($('#dialog-notes'), product.notes);
    productDialog.scrollTop = 0;
    selectProduct(dialogProduct, false);
  }
  function openProduct(index, trigger) {
    opener = trigger;
    updateProductDialog(index);
    const box = trigger?.getBoundingClientRect();
    productDialog.showModal();
    if (motionEnabled()) {
      const dx = box ? clamp(box.left + box.width / 2 - innerWidth / 2, -80, 80) : 0;
      animateElement(productDialog, [{ opacity: 0, transform: 'translate3d(' + dx + 'px,45px,0) scale(.89) rotateX(5deg)' }, { opacity: 1, transform: 'translate3d(0,0,0) scale(1) rotateX(0)' }], { duration: 650, easing: 'cubic-bezier(.16,1,.3,1)' });
    }
    updateDialogLock();
  }
  $('#dialog-close').addEventListener('click', () => closeWithMotion(productDialog));
  productDialog.addEventListener('cancel', event => { event.preventDefault(); closeWithMotion(productDialog); });
  $('#zoom-toggle').addEventListener('click', () => setZoom(!zoomed));
  $$('[data-dialog-step]').forEach(button => button.addEventListener('click', () => updateProductDialog(dialogProduct + Number(button.dataset.dialogStep))));
  productDialog.addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    event.preventDefault();
    updateProductDialog(dialogProduct + (event.key === 'ArrowRight' ? 1 : -1));
  });
  productDialog.addEventListener('click', event => {
    if (event.target !== productDialog) return;
    const box = productDialog.getBoundingClientRect();
    if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) closeWithMotion(productDialog);
  });
  productDialog.addEventListener('close', () => {
    updateDialogLock();
    setZoom(false);
    const focusTarget = opener?.matches('[data-hero-product]') ? heroCards[productIndex] : opener;
    focusTarget?.focus({ preventScroll: true });
  });
  addSwipe($('.dialog-photo'), step => updateProductDialog(dialogProduct + step));

  /* The atelier keeps a stable image frame as its story changes. */
  const chapterButtons = $$('[data-select-chapter]');
  const chapterArticles = $$('[data-story-chapter]');
  let manualChapterUntil = 0;
  function selectChapter(index, animate = true) {
    const next = clamp(index, 0, chapters.length - 1);
    const changed = next !== chapterIndex;
    chapterIndex = next;
    $('.story-chapters').style.setProperty('--chapter-tab', next);
    const chapter = chapters[next];
    chapterButtons.forEach((button, i) => button.setAttribute('aria-pressed', String(i === next)));
    chapterArticles.forEach((article, i) => {
      article.classList.toggle('is-active', i === next);
      article.querySelector('p').textContent = chapters[i].body;
    });
    changePhoto($('#story-image'), chapter, changed && animate, 'slide');
    $('#story-caption').textContent = chapter.caption;
    $('#story-credit').textContent = chapter.credit;
    $('#story-mobile-body').textContent = chapter.body;
    $('#story-count').textContent = next === 0 ? 'Le savoir-faire' : 'L’équipe';
    if (changed && animate) {
      entrance($('#story-mobile-body'), 8, 450);
      entrance($('#story-caption'), 7, 400);
    }
  }
  chapterButtons.forEach((button, i) => {
    button.addEventListener('click', () => {
      manualChapterUntil = performance.now() + 1400;
      selectChapter(i);
      if (desktop.matches) chapterArticles[i].scrollIntoView({ behavior: motionEnabled() ? 'smooth' : 'instant', block: 'center' });
    });
    button.addEventListener('keydown', event => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? chapters.length - 1 : wrap(i + (event.key === 'ArrowRight' ? 1 : -1), chapters.length);
      manualChapterUntil = performance.now() + 1400;
      selectChapter(next);
      chapterButtons[next].focus({ preventScroll: true });
      if (desktop.matches) chapterArticles[next].scrollIntoView({ behavior: motionEnabled() ? 'smooth' : 'instant', block: 'center' });
    });
  });
  addSwipe($('.story-image-wrap'), step => {
    manualChapterUntil = performance.now() + 1400;
    selectChapter(wrap(chapterIndex + step, chapters.length));
  });
  selectChapter(0, false);

  /* Progressive reveals: never hide the first screen or a no-JS page. */
  const revealObserver = new IntersectionObserver(entries => entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.dataset.reveal = 'shown';
    revealObserver.unobserve(entry.target);
  }), { rootMargin: '0px 0px -7% 0px', threshold: .08 });
  $$('[data-reveal]').forEach((element, index) => {
    if (motionEnabled() && element.getBoundingClientRect().top > innerHeight * .92) {
      element.dataset.reveal = 'pending';
      element.style.setProperty('--reveal-delay', (index % 2) * 70 + 'ms');
      revealObserver.observe(element);
    } else element.dataset.reveal = 'shown';
  });
  window.addEventListener('beforeprint', () => $$('[data-reveal]').forEach(element => { element.dataset.reveal = 'shown'; }));

  const navigation = $$('[data-nav-section]');
  const sectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const current = entry.target.dataset.spy;
      navigation.forEach(link => {
        if (link.dataset.navSection === current) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    });
  }, { rootMargin: '-32% 0px -45% 0px', threshold: 0 });
  $$('[data-spy]').forEach(section => sectionObserver.observe(section));

  /* A single scheduled frame batches scroll and small pointer movements. */
  const hero = $('.hero');
  const stage = $('#hero-stage');
  const signature = $('.atelier-signature');
  const dock = $('.mobile-dock');
  const footer = $('.site-footer');
  const progress = $('.reading-progress');
  let framePending = false;
  let previousScroll = scrollY;
  const pointer = { x: 0, y: 0, targetX: 0, targetY: 0 };

  function renderFrame() {
    framePending = false;
    const y = scrollY;
    const delta = y - previousScroll;
    const focused = header.contains(document.activeElement) && document.activeElement.matches(':focus-visible');
    const locked = Boolean(document.querySelector('dialog[open]')) || focused;
    header.classList.toggle('is-scrolled', y > 35);
    if (y < 120 || locked || delta < -5) header.classList.remove('is-hidden');
    else if (y > 220 && delta > 6) header.classList.add('is-hidden');
    previousScroll = y;
    const range = document.documentElement.scrollHeight - innerHeight;
    progress.style.transform = 'scaleX(' + (range > 0 ? clamp(y / range, 0, 1) : 0) + ')';
    const shopBox = $('.boutique-section').getBoundingClientRect();
    const galleryBox = $('.culot-experience').getBoundingClientRect();
    const localControls = (shopBox.top < innerHeight * .7 && shopBox.bottom > 100) || (galleryBox.top < innerHeight * .7 && galleryBox.bottom > 100);
    dock.classList.toggle('is-hidden', localControls || y < hero.offsetHeight * .6 || footer.getBoundingClientRect().top < innerHeight - 70);

    const heroBox = hero.getBoundingClientRect();
    if (motionEnabled() && heroBox.bottom > 0) {
      const journey = clamp(-heroBox.top / heroBox.height, 0, 1);
      hero.style.setProperty('--scene-y', (-journey * (desktop.matches ? 30 : 12)).toFixed(2) + 'px');
      pointer.x += (pointer.targetX - pointer.x) * .09;
      pointer.y += (pointer.targetY - pointer.y) * .09;
      hero.style.setProperty('--pointer-x', pointer.x.toFixed(2) + 'px');
      hero.style.setProperty('--pointer-y', pointer.y.toFixed(2) + 'px');
      hero.style.setProperty('--tilt-x', (-pointer.y * .35).toFixed(2) + 'deg');
      hero.style.setProperty('--tilt-y', (pointer.x * .5).toFixed(2) + 'deg');
      if (Math.abs(pointer.x - pointer.targetX) > .1 || Math.abs(pointer.y - pointer.targetY) > .1) requestFrame();
    }
    const signatureBox = signature.getBoundingClientRect();
    if (motionEnabled() && signatureBox.top < innerHeight && signatureBox.bottom > 0) {
      const phase = clamp((innerHeight - signatureBox.top) / (innerHeight + signatureBox.height), 0, 1);
      const distance = Math.min(signature.firstElementChild.scrollWidth - innerWidth + 50, desktop.matches ? 220 : 270);
      signature.style.setProperty('--signature-x', (-Math.max(0, distance) * phase).toFixed(2) + 'px');
    }
    if (desktop.matches && performance.now() > manualChapterUntil) {
      const target = innerHeight * .48;
      let closest = chapterIndex;
      let distance = Infinity;
      chapterArticles.forEach((article, index) => {
        const box = article.getBoundingClientRect();
        if (box.bottom < 100 || box.top > innerHeight) return;
        const nextDistance = Math.abs(box.top + box.height / 2 - target);
        if (nextDistance < distance) { distance = nextDistance; closest = index; }
      });
      if (distance < Infinity && closest !== chapterIndex) selectChapter(closest);
    }
  }
  function requestFrame() {
    if (framePending) return;
    framePending = true;
    requestAnimationFrame(renderFrame);
  }
  window.addEventListener('scroll', requestFrame, { passive: true });
  window.addEventListener('resize', () => {
    pointer.targetX = 0;
    pointer.targetY = 0;
    requestFrame();
  }, { passive: true });
  stage.addEventListener('pointermove', event => {
    if (!motionEnabled() || !finePointer.matches || !desktop.matches) return;
    const box = stage.getBoundingClientRect();
    pointer.targetX = ((event.clientX - box.left) / box.width - .5) * 14;
    pointer.targetY = ((event.clientY - box.top) / box.height - .5) * 10;
    requestFrame();
  });
  stage.addEventListener('pointerleave', () => { pointer.targetX = 0; pointer.targetY = 0; requestFrame(); });
  const motionObserver = new IntersectionObserver(entries => entries.forEach(entry => entry.target.classList.toggle('is-in-view', entry.isIntersecting)), { rootMargin: '80px' });
  [hero, $('.values-ribbon')].forEach(element => motionObserver.observe(element));
  document.addEventListener('visibilitychange', () => root.classList.toggle('page-hidden', document.hidden));
  requestFrame();
})();

(() => {
  'use strict';
  const section = document.querySelector('.culot-experience');
  if (!section) return;
  section.classList.add('is-ready');
  const products = window.EC_CONTENT.products;
  const cards = [...section.querySelectorAll('[data-orbit-product]')];
  const thumbs = [...section.querySelectorAll('[data-orbit-choice]')];
  const stage = section.querySelector('.culot-stage');
  const root = document.documentElement;
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  const clamp = (v,min,max) => Math.min(max,Math.max(min,v));
  const wrap = v => (v % products.length + products.length) % products.length;
  let inView = false, scheduled = false, current = null, selected = -1, manualOffset = 0;
  let cameraX = 0, cameraY = 0, targetX = 0, targetY = 0;
  let gesture = null, ignoreClickUntil = 0;
  const enabled = () => root.dataset.motion !== 'reduced' && !preference.matches && innerHeight >= 600;
  function scrollPosition() {
    const box = section.getBoundingClientRect();
    const sticky = section.querySelector('.culot-sticky');
    const travel = Math.max(1,box.height - sticky.offsetHeight - innerHeight * .04);
    return clamp((innerHeight * .04 - box.top) / travel,0,1) * (products.length - 1);
  }
  function setSelected(index) {
    index = wrap(index);
    const changed = selected !== index;
    selected = index;
    const product = products[index];
    if (changed) {
    section.style.setProperty('--experience-tone',product.tone);
    section.querySelector('.culot-product-name').textContent = product.name;
    section.querySelector('.culot-flavour').textContent = product.notes.join(' & ');
    section.querySelector('.culot-orbit-word').textContent = product.shortName.toLowerCase() + '.';
    }
    thumbs.forEach((thumb,i) => { thumb.setAttribute('aria-pressed',String(i === index)); thumb.tabIndex = i === index ? 0 : -1; });
    cards.forEach((card,i) => { card.tabIndex = !enabled() || i === index ? 0 : -1; card.setAttribute('aria-current',String(i === index)); });
  }
  function render() {
    scheduled = false;
    if (!enabled() || !inView || document.hidden) return;
    const target = scrollPosition() + manualOffset;
    current = current === null ? target : current + (target-current)*.105;
    cameraX += (targetX-cameraX)*.09;
    cameraY += (targetY-cameraY)*.09;
    const large = innerWidth >= 600;
    const radius = Math.min(innerWidth * (large ? .37 : .6),large ? 570 : 245);
    const depth = large ? 360 : 245;
    const step = Math.PI * 2 / products.length;
    const progress = current / (products.length-1);
    cards.forEach((card,index) => {
      let distance = index-current;
      while(distance > products.length/2) distance -= products.length;
      while(distance < -products.length/2) distance += products.length;
      const angle = distance*step;
      const front = (Math.cos(angle)+1)/2;
      const visibility = clamp((front-.12)/.88,0,1);
      card.style.setProperty('--orbit-x',(Math.sin(angle)*radius).toFixed(2)+'px');
      card.style.setProperty('--orbit-y',(Math.sin(angle)*-12 + (1-front)*-22 + Math.sin(progress*Math.PI*2)*6).toFixed(2)+'px');
      card.style.setProperty('--orbit-z',(Math.cos(angle)*depth-depth+45).toFixed(2)+'px');
      card.style.setProperty('--orbit-ry',(-Math.sin(angle)*(large?39:30)).toFixed(2)+'deg');
      card.style.setProperty('--orbit-rz',(Math.sin(angle)*5).toFixed(2)+'deg');
      card.style.setProperty('--orbit-opacity',visibility.toFixed(3));
      card.style.setProperty('--orbit-light',(.48+front*.52).toFixed(3));
      card.style.zIndex = String(10+Math.round(front*30));
      card.style.pointerEvents = visibility > .2 ? 'auto' : 'none';
      card.setAttribute('aria-hidden',String(visibility < .06));
    });
    section.style.setProperty('--camera-rx',(-cameraY).toFixed(2)+'deg');
    section.style.setProperty('--camera-ry',cameraX.toFixed(2)+'deg');
    section.style.setProperty('--ring-angle',(progress*80).toFixed(2)+'deg');
    section.style.setProperty('--word-x',((progress-.5)*90).toFixed(2)+'px');
    section.style.setProperty('--flavour-y',(Math.sin(progress*Math.PI*3)*12).toFixed(2)+'px');
    setSelected(Math.round(current));
    if (Math.abs(target-current)>.001 || Math.abs(targetX-cameraX)>.01 || Math.abs(targetY-cameraY)>.01) request();
  }
  function request() {
    if (scheduled || !inView || !enabled() || document.hidden) return;
    scheduled = true;
    requestAnimationFrame(render);
  }
  function choose(index) {
    index = wrap(index);
    if (!enabled()) { setSelected(index); return; }
    const nearest = index + Math.round(((current ?? 0) - index) / products.length) * products.length;
    manualOffset = nearest-scrollPosition();
    request();
  }
  function open(index,trigger) {
    document.dispatchEvent(new CustomEvent('ec:open-product',{detail:{index,trigger}}));
  }
  cards.forEach((card,index) => {
    card.addEventListener('click',event => {
      if (performance.now()<ignoreClickUntil) { event.preventDefault();return; }
      if (!enabled() || Math.abs((current??0) - (index + Math.round(((current??0)-index)/products.length)*products.length))<.3) open(index,card);
      else choose(index);
    });
    card.addEventListener('focus',()=>{ if (card.matches(':focus-visible')) choose(index); });
  });
  thumbs.forEach((thumb,index) => {
    thumb.addEventListener('click',()=>choose(index));
    thumb.addEventListener('keydown',event => {
      if (!['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return;
      event.preventDefault();
      const index = event.key==='Home'?0:event.key==='End'?products.length-1:wrap(selected+(event.key==='ArrowRight'?1:-1));
      choose(index);thumbs[index].focus({preventScroll:true});
    });
  });
  section.querySelector('.culot-discover').addEventListener('click',event=>open(Math.max(0,selected),event.currentTarget));
  stage.addEventListener('keydown',event=>{
    if (!['ArrowLeft','ArrowRight'].includes(event.key)) return;
    event.preventDefault();choose(selected+(event.key==='ArrowRight'?1:-1));
  });
  stage.addEventListener('pointerdown',event=>{
    if (!event.isPrimary || event.button!==0 || !enabled()) return;
    gesture={id:event.pointerId,x:event.clientX,y:event.clientY,horizontal:false};
  });
  stage.addEventListener('pointermove',event=>{
    if (gesture && event.pointerId===gesture.id) {
      const dx=event.clientX-gesture.x,dy=event.clientY-gesture.y;
      if (!gesture.horizontal && Math.abs(dx)>12 && Math.abs(dx)>Math.abs(dy)*1.4) { gesture.horizontal=true;stage.setPointerCapture(event.pointerId); }
      if (gesture.horizontal && event.cancelable) event.preventDefault();
      return;
    }
    if (!enabled() || !fine.matches || innerWidth<1000) return;
    const box=stage.getBoundingClientRect();
    targetX=((event.clientX-box.left)/box.width-.5)*5;
    targetY=((event.clientY-box.top)/box.height-.5)*3;
    request();
  });
  stage.addEventListener('pointerup',event=>{
    if (!gesture || event.pointerId!==gesture.id) return;
    const dx=event.clientX-gesture.x;
    if (gesture.horizontal) {
      ignoreClickUntil=performance.now()+450;
      if (Math.abs(dx)>36) choose(selected+(dx<0?1:-1));
    }
    if(stage.hasPointerCapture(event.pointerId)) stage.releasePointerCapture(event.pointerId);
    gesture=null;
  });
  stage.addEventListener('pointercancel',()=>{gesture=null;});
  stage.addEventListener('pointerleave',()=>{targetX=0;targetY=0;request();});
  function sync() {
    const active=enabled();section.classList.toggle('is-spatial',active);
    current=null;manualOffset=0;
    cards.forEach(card=>{
      if(active)return;
      card.removeAttribute('style');card.removeAttribute('aria-hidden');card.tabIndex=0;
    });
    if(active)request();
  }
  new IntersectionObserver(entries=>{
    inView=entries[0].isIntersecting;
    if(inView)request();
    else {targetX=0;targetY=0;}
  },{rootMargin:'10% 0px'}).observe(section);
  new MutationObserver(sync).observe(root,{attributes:true,attributeFilter:['data-motion']});
  preference.addEventListener('change',sync);
  addEventListener('scroll',request,{passive:true});
  addEventListener('resize',sync,{passive:true});
  document.addEventListener('visibilitychange',request);
  setSelected(0);sync();
})();

(() => {
  'use strict';
  const section = document.querySelector('.boutique-section');
  if (!section) return;
  const root = document.documentElement;
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  const scene = section.querySelector('.boutique-scene');
  const image = section.querySelector('#boutique-view-image');
  const caption = section.querySelector('#boutique-view-caption');
  const buttons = [...section.querySelectorAll('[data-shop-view]')];
  const views = [
    { image: 'assets/boutique-hd.jpg', alt: 'Le comptoir et les créations dans la boutique Étienne Culot, place Championnet.', caption: 'Un petit tour à l’intérieur.' },
    { image: 'assets/boutique-detail.jpg', alt: 'Les viennoiseries et les pâtisseries dans les vitrines de la boutique Étienne Culot.', caption: 'De quoi prendre le temps de choisir.' }
  ];
  const animations = new Set();
  const motion = () => root.dataset.motion !== 'reduced' && !preference.matches;
  const clamp = (n, a, b) => Math.min(b, Math.max(a, n));
  let selected = 0;
  let photoRequest = 0;
  function animate(element, frames, options) {
    const animation = element.animate(frames, options);
    animations.add(animation);
    animation.finished.catch(() => {}).then(() => animations.delete(animation));
    return animation;
  }
  async function chooseView(index) {
    const ticket = ++photoRequest;
    if (index === selected) return;
    const next = views[index];
    const loader = new Image();
    loader.src = next.image;
    try { await loader.decode(); } catch { if (!loader.complete || !loader.naturalWidth) return; }
    if (ticket !== photoRequest) return;
    selected = index;
    buttons.forEach((button, i) => button.setAttribute('aria-pressed', String(i === index)));
    const parent = image.parentElement;
    parent.querySelectorAll('.boutique-photo-ghost').forEach(ghost => ghost.remove());
    const ghost = image.cloneNode();
    ghost.removeAttribute('id');
    ghost.alt = '';
    ghost.setAttribute('aria-hidden', 'true');
    ghost.className = 'boutique-photo-ghost';
    image.src = next.image;
    image.alt = next.alt;
    caption.textContent = next.caption;
    if (!motion()) return;
    parent.append(ghost);
    animate(image, [{ opacity: 0, transform: 'translate3d(15px,0,0)' }, { opacity: 1, transform: 'none' }], { duration: 650, easing: 'cubic-bezier(.22,1,.36,1)' });
    animate(ghost, [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translate3d(-15px,0,0)' }], { duration: 550, easing: 'ease' }).finished.catch(() => {}).then(() => ghost.remove());
    animate(caption, [{ opacity: 0, transform: 'translateY(5px)' }, { opacity: 1, transform: 'none' }], { duration: 500 });
  }
  buttons.forEach((button, index) => {
    button.addEventListener('click', () => chooseView(index));
    button.addEventListener('keydown', event => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? 1 : 1 - index;
      chooseView(next);
      buttons[next].focus({ preventScroll: true });
    });
  });
  const status = section.querySelector('#boutique-copy-status');
  section.querySelector('#boutique-copy-address').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText('Étienne Culot, 6/8 place Championnet, 38000 Grenoble');
      status.textContent = 'L’adresse est copiée.';
    } catch { status.textContent = '6/8 place Championnet, 38000 Grenoble'; }
  });

  const dialog = section.querySelector('#boutique-dialog');
  const zoom = section.querySelector('#boutique-zoom');
  const dialogImage = section.querySelector('#boutique-dialog-image');
  const lock = () => document.body.classList.toggle('dialog-open', Boolean(document.querySelector('dialog[open]')));
  let closing = false;
  zoom.addEventListener('click', () => {
    dialogImage.src = views[selected].image;
    dialogImage.alt = views[selected].alt;
    section.querySelector('#boutique-dialog-caption').textContent = views[selected].caption;
    dialog.showModal();
    lock();
    if (motion()) animate(dialog, [{ opacity: 0, transform: 'translateY(26px) scale(.94)' }, { opacity: 1, transform: 'none' }], { duration: 600, easing: 'cubic-bezier(.16,1,.3,1)' });
  });
  function closePhoto() {
    if (closing || !dialog.open) return;
    if (!motion()) { dialog.close(); return; }
    closing = true;
    animate(dialog, [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(18px) scale(.97)' }], { duration: 250, easing: 'ease' }).finished.catch(() => {}).then(() => { dialog.close(); closing = false; });
  }
  section.querySelector('#boutique-dialog-close').addEventListener('click', closePhoto);
  dialog.addEventListener('cancel', event => { event.preventDefault(); closePhoto(); });
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const box = dialog.getBoundingClientRect();
    if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) closePhoto();
  });
  dialog.addEventListener('close', () => { lock(); zoom.focus({ preventScroll: true }); });

  let inView = false;
  let scheduled = false;
  let openness = null;
  let preloaded = false;
  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  function render() {
    scheduled = false;
    if (!motion() || !inView || document.hidden) return;
    const box = scene.getBoundingClientRect();
    const target = clamp((innerHeight * .85 - box.top) / (innerHeight * .64), 0, 1);
    openness = openness === null ? target : openness + (target - openness) * .13;
    pointer.x += (pointer.tx - pointer.x) * .1;
    pointer.y += (pointer.ty - pointer.y) * .1;
    section.style.setProperty('--shop-open', openness.toFixed(4));
    section.style.setProperty('--shop-y', ((1 - openness) * 15).toFixed(2) + 'px');
    section.style.setProperty('--shop-rx', (pointer.y * -.45 + (1 - openness) * 3).toFixed(2) + 'deg');
    section.style.setProperty('--shop-ry', (pointer.x * .6).toFixed(2) + 'deg');
    const bounds = section.getBoundingClientRect();
    const phase = clamp((innerHeight - bounds.top) / (innerHeight + bounds.height), 0, 1);
    section.style.setProperty('--shop-farewell-x', (-Math.min(innerWidth < 1000 ? 160 : 360, Math.max(0,section.querySelector('.boutique-farewell').scrollWidth - innerWidth)) * phase).toFixed(2) + 'px');
    if (Math.abs(target - openness) > .001 || Math.abs(pointer.tx - pointer.x) > .02 || Math.abs(pointer.ty - pointer.y) > .02) request();
  }
  function request() {
    if (scheduled || !inView || !motion() || document.hidden) return;
    scheduled = true;
    requestAnimationFrame(render);
  }
  scene.addEventListener('pointermove', event => {
    if (!finePointer.matches || innerWidth < 1000 || !motion()) return;
    const box = scene.getBoundingClientRect();
    pointer.tx = ((event.clientX - box.left) / box.width - .5) * 5;
    pointer.ty = ((event.clientY - box.top) / box.height - .5) * 4;
    request();
  });
  scene.addEventListener('pointerleave', () => { pointer.tx = 0; pointer.ty = 0; request(); });
  const observer = new IntersectionObserver(entries => {
    inView = entries[0].isIntersecting;
    if (inView) {
      if (!preloaded) { const loader = new Image(); loader.src = views[1].image; preloaded = true; }
      request();
    }
  }, { rootMargin: '10% 0px', threshold: 0 });
  observer.observe(section);
  function sync() {
    section.classList.toggle('is-enhanced', motion());
    openness = null;
    if (!motion()) {
      animations.forEach(animation => animation.cancel());
      section.querySelectorAll('.boutique-photo-ghost').forEach(ghost => ghost.remove());
      ['--shop-open','--shop-y','--shop-rx','--shop-ry','--shop-farewell-x'].forEach(name => section.style.removeProperty(name));
    } else request();
  }
  new MutationObserver(sync).observe(root, { attributes: true, attributeFilter: ['data-motion'] });
  preference.addEventListener('change', sync);
  addEventListener('scroll', request, { passive: true });
  addEventListener('resize', () => { pointer.tx = 0; pointer.ty = 0; request(); }, { passive: true });
  document.addEventListener('visibilitychange', request);
  sync();
})();
