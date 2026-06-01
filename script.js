/* =========================================================
   RECRUTAÊ — MAIN SCRIPT
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  const safe = (fn, name) => { try { fn(); } catch (e) { console.warn('[recrutae] init error in ' + name, e); } };
  safe(initNavbar, 'navbar');
  safe(initMobileMenu, 'mobileMenu');
  safe(initMarquee, 'marquee');
  safe(initIndustries, 'industries');
  safe(initScrollAnimations, 'scrollAnimations');
  safe(initCounters, 'counters');
  safe(initCarousel, 'carousel');
  safe(initForm, 'form');
  safe(initSmoothScroll, 'smoothScroll');
  safe(initPageTransitions, 'pageTransitions');

  // Safety net: nothing stays invisible if the IntersectionObserver fails
  setTimeout(() => {
    document.querySelectorAll('.animate-up:not(.in-view)').forEach(el => el.classList.add('in-view'));
  }, 1200);
});

/* =========================================================
   NAVBAR
   ========================================================= */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  // Navbar is now always light/cream (matches the design template).
  // We only toggle a `.scrolled` class for the compact + glassy variant.
  // Legacy `transparent / on-dark / on-light / solid` classes are kept on the
  // element so other selectors still apply, but they all render identically.
  function update() {
    if (window.scrollY > 20) navbar.classList.add('scrolled');
    else navbar.classList.remove('scrolled');
  }

  update();
  window.addEventListener('scroll', update, { passive: true });
}

/* =========================================================
   MOBILE MENU
   ========================================================= */
function initMobileMenu() {
  const hamburger = document.getElementById('hamburger');
  const overlay = document.getElementById('mobileOverlay');
  if (!hamburger || !overlay) return;

  const menuData = [
    { label: 'Sou empresa', sub: [
      { label: 'Recrutamento e Seleção', href: 'recrutamento-selecao.html' },
      { label: 'Alocação', href: 'alocacao.html' }
    ]},
    { label: 'Sou candidato', href: 'sou-candidato.html' },
    { label: 'Blog', href: 'blog.html' },
    { label: 'Indústrias', sub: [
      { label: 'Tecnologia', href: 'industria-template.html?ind=tecnologia' },
      { label: 'Telecom', href: 'industria-template.html?ind=telecom' },
      { label: 'Mídia', href: 'industria-template.html?ind=midia' },
      { label: 'Varejo', href: 'industria-template.html?ind=varejo' },
      { label: 'Bens de Consumo', href: 'industria-template.html?ind=bens-consumo' },
      { label: 'Logística', href: 'industria-template.html?ind=logistica' },
      { label: 'Serviços Financeiros', href: 'industria-template.html?ind=servicos-financeiros' },
      { label: 'Banking', href: 'industria-template.html?ind=banking' },
      { label: 'Agro', href: 'industria-template.html?ind=agro' },
      { label: 'Energia', href: 'industria-template.html?ind=energia' },
      { label: 'Seguros', href: 'industria-template.html?ind=seguros' },
      { label: 'Educação', href: 'industria-template.html?ind=educacao' },
      { label: 'Saúde', href: 'industria-template.html?ind=saude' },
      { label: 'Games', href: 'industria-template.html?ind=games' },
    ]},
    { label: 'Posições', sub: [
      { label: 'Bancos e Serviços Financeiros', href: 'posicao-template.html?pos=bancos-financeiros' },
      { label: 'Engenharia e Manufatura', href: 'posicao-template.html?pos=engenharia-manufatura' },
      { label: 'Financeiro e Tributário', href: 'posicao-template.html?pos=financeiro-tributario' },
      { label: 'Imobiliário e Construção', href: 'posicao-template.html?pos=imobiliario-construcao' },
      { label: 'Jurídico e Legal', href: 'posicao-template.html?pos=juridico-legal' },
      { label: 'Marketing/Comunicação/Digital', href: 'posicao-template.html?pos=marketing-comunicacao' },
      { label: 'Operações/Logística/Supply Chain', href: 'posicao-template.html?pos=operacoes-logistica' },
      { label: 'Petróleo e Gás', href: 'posicao-template.html?pos=petroleo-gas' },
      { label: 'Recursos Humanos', href: 'posicao-template.html?pos=recursos-humanos' },
      { label: 'Saúde e Ciências', href: 'posicao-template.html?pos=saude-ciencias' },
      { label: 'Seguros', href: 'posicao-template.html?pos=seguros' },
      { label: 'Tecnologia da Informação', href: 'posicao-template.html?pos=tecnologia-informacao' },
      { label: 'Varejo', href: 'posicao-template.html?pos=varejo' },
      { label: 'Vendas', href: 'posicao-template.html?pos=vendas' },
    ]}
  ];

  const chevronSVG = `<svg class="chevron" width="14" height="14" viewBox="0 0 12 12" fill="none"><path d="M2 4l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`;

  let html = '';
  menuData.forEach(item => {
    if (!item.sub) {
      html += `<a href="${item.href}" class="mob-link">${item.label}</a>`;
    } else {
      const id = 'mob-' + item.label.replace(/\s/g, '').toLowerCase();
      html += `<button class="mob-acc-btn" data-target="${id}">${item.label}${chevronSVG}</button>`;
      html += `<div class="mob-submenu" id="${id}">`;
      item.sub.forEach(s => { html += `<a href="${s.href}">${s.label}</a>`; });
      html += `</div>`;
    }
  });
  html += `<div class="mob-cta"><a href="#contato" class="btn btn-gold btn-full" onclick="closeMobileMenu()">Agendar Reunião</a></div>`;
  overlay.innerHTML = html;

  // Accordion
  overlay.querySelectorAll('.mob-acc-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = document.getElementById(btn.dataset.target);
      btn.classList.toggle('open');
      target.classList.toggle('open');
    });
  });

  // Close on link
  overlay.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMobileMenu));

  function openMobileMenu() {
    overlay.classList.add('active');
    hamburger.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
  function closeMobileMenu() {
    overlay.classList.remove('active');
    hamburger.classList.remove('active');
    document.body.style.overflow = '';
  }
  window.closeMobileMenu = closeMobileMenu;

  hamburger.addEventListener('click', () => {
    overlay.classList.contains('active') ? closeMobileMenu() : openMobileMenu();
  });
}

/* =========================================================
   MARQUEE — branded text wordmarks (always renders, no external deps)
   ========================================================= */
function initMarquee() {
  const track = document.getElementById('marqueeTrack');
  if (!track) return;
  // If logos are already baked into the HTML, don't overwrite them.
  if (track.children.length > 0) return;

  const companies = [
    { name: 'Itaú',          color: '#EC7000', style: 'bold' },
    { name: 'Santander',     color: '#EC0000', style: 'bold' },
    { name: 'Mercado Livre', color: '#2D3277', style: 'normal' },
    { name: 'iFood',         color: '#EA1D2C', style: 'bold' },
    { name: 'Nubank',        color: '#820AD1', style: 'bold' },
    { name: 'Ambev',         color: '#0B1F3A', style: 'normal' },
    { name: 'Natura',        color: '#F36E21', style: 'normal' },
    { name: 'TOTVS',         color: '#0049A4', style: 'upper' },
    { name: 'BTG Pactual',   color: '#0F2A4A', style: 'serif' },
    { name: 'XP Inc.',       color: '#000000', style: 'bold' },
    { name: 'Magalu',        color: '#0086FF', style: 'bold' },
    { name: 'Bradesco',      color: '#CC092F', style: 'normal' },
    { name: 'Vivo',          color: '#660099', style: 'bold' },
    { name: 'Embraer',       color: '#003DA5', style: 'upper' },
    { name: 'Petrobras',     color: '#008542', style: 'upper' },
    { name: 'Vale',          color: '#EEC524', style: 'upper' },
    { name: 'Claro',         color: '#E50000', style: 'bold' },
    { name: 'TIM',           color: '#003B71', style: 'upper' }
  ];

  const set = companies.map(c =>
    `<div class="logo-item logo-${c.style}" title="${c.name}">
      <span class="logo-text" style="--brand:${c.color}">${c.name}</span>
    </div>`
  ).join('');

  track.innerHTML = set + set;
}

/* =========================================================
   INDUSTRIES GRID
   ========================================================= */
function initIndustries() {
  const grid = document.getElementById('industriesGrid');
  if (!grid) return;

  const items = [
    { name: 'Tecnologia',           href: 'industria-template.html?ind=tecnologia' },
    { name: 'Telecom',              href: 'industria-template.html?ind=telecom' },
    { name: 'Mídia',                href: 'industria-template.html?ind=midia' },
    { name: 'Varejo',               href: 'industria-template.html?ind=varejo' },
    { name: 'Bens de Consumo',      href: 'industria-template.html?ind=bens-consumo' },
    { name: 'Logística',            href: 'industria-template.html?ind=logistica' },
    { name: 'Serviços Financeiros', href: 'industria-template.html?ind=servicos-financeiros' },
    { name: 'Banking',              href: 'industria-template.html?ind=banking' },
    { name: 'Agro',                 href: 'industria-template.html?ind=agro' },
    { name: 'Energia',              href: 'industria-template.html?ind=energia' },
    { name: 'Seguros',              href: 'industria-template.html?ind=seguros' },
    { name: 'Educação',             href: 'industria-template.html?ind=educacao' },
    { name: 'Saúde',                href: 'industria-template.html?ind=saude' },
    { name: 'Games',                href: 'industria-template.html?ind=games' },
  ];

  const arrowSVG = `<svg class="ind-arrow" width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 12L12 2M12 2H5M12 2v7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

  grid.innerHTML = items.map((item, i) => {
    const idx = String(i + 1).padStart(2, '0');
    const delay = i % 4;
    const stagger = delay > 0 ? ` stagger-${delay}` : '';
    return `
      <a href="${item.href}" class="ind-card animate-up${stagger}">
        <span class="ind-idx">${idx}</span>
        <span class="ind-name">${item.name}</span>
        ${arrowSVG}
      </a>`;
  }).join('');

  // Mouse-follow glow on industry cards
  grid.querySelectorAll('.ind-card').forEach(card => {
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      const mx = ((e.clientX - r.left) / r.width) * 100;
      const my = ((e.clientY - r.top) / r.height) * 100;
      card.style.setProperty('--mx', mx + '%');
      card.style.setProperty('--my', my + '%');
    });
  });
}

/* =========================================================
   SCROLL ANIMATIONS
   ========================================================= */
function initScrollAnimations() {
  const els = document.querySelectorAll('.animate-up');
  if (!els.length) return;

  // Reveal anything already in the initial viewport synchronously — the very
  // first paint of a subpage hero must never look empty.
  const vh = window.innerHeight || document.documentElement.clientHeight;
  els.forEach(el => {
    const r = el.getBoundingClientRect();
    if (r.top < vh * 0.95) el.classList.add('in-view');
  });

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });

  els.forEach(el => { if (!el.classList.contains('in-view')) obs.observe(el); });
}

/* =========================================================
   COUNTER ANIMATION
   ========================================================= */
function initCounters() {
  const counters = document.querySelectorAll('.counter');
  if (!counters.length) return;

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      animateCount(entry.target, parseInt(entry.target.dataset.target));
      obs.unobserve(entry.target);
    });
  }, { threshold: 0.5 });

  counters.forEach(el => obs.observe(el));
}

function animateCount(el, target) {
  const dur = 1600;
  const start = performance.now();
  function tick(now) {
    const p = Math.min((now - start) / dur, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.round(eased * target);
    if (p < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

/* =========================================================
   TESTIMONIALS CAROUSEL
   ========================================================= */
function initCarousel() {
  const slides = document.querySelectorAll('.testi-slide');
  const dots   = document.querySelectorAll('.dot');
  const prev   = document.getElementById('carouselPrev');
  const next   = document.getElementById('carouselNext');
  if (!slides.length) return;

  let cur = 0, timer;

  function go(i) {
    slides[cur].classList.remove('active');
    dots[cur]?.classList.remove('active');
    cur = (i + slides.length) % slides.length;
    slides[cur].classList.add('active');
    dots[cur]?.classList.add('active');
  }

  function start() { timer = setInterval(() => go(cur + 1), 5000); }
  function stop()  { clearInterval(timer); }

  prev?.addEventListener('click', () => { stop(); go(cur - 1); start(); });
  next?.addEventListener('click', () => { stop(); go(cur + 1); start(); });
  dots.forEach(d => d.addEventListener('click', () => { stop(); go(+d.dataset.index); start(); }));

  start();
}

/* =========================================================
   FORM VALIDATION
   ========================================================= */
function initForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  const success = document.getElementById('formSuccess');
  const btnText = document.getElementById('btnText');

  const setErr = (el, msg) => {
    el.closest('.form-group')?.classList.add('has-error');
    const span = el.closest('.form-group')?.querySelector('.form-error');
    if (span) span.textContent = msg;
  };
  const clrErr = (el) => {
    el.closest('.form-group')?.classList.remove('has-error');
    const span = el.closest('.form-group')?.querySelector('.form-error');
    if (span) span.textContent = '';
  };

  form.addEventListener('submit', e => {
    e.preventDefault();
    const nome  = form.querySelector('#nome');
    const email = form.querySelector('#email');
    let ok = true;

    clrErr(nome); clrErr(email);
    if (!nome.value.trim())  { setErr(nome,  'Informe seu nome.'); ok = false; }
    if (!email.value.trim()) { setErr(email, 'Informe seu e-mail.'); ok = false; }
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) { setErr(email, 'E-mail inválido.'); ok = false; }

    if (!ok) return;

    if (btnText) btnText.textContent = 'Enviando…';
    const btn = form.querySelector('[type=submit]');
    if (btn) btn.disabled = true;

    setTimeout(() => {
      form.reset();
      if (btn) btn.disabled = false;
      if (btnText) btnText.textContent = 'Enviar mensagem';
      if (success) { success.classList.add('visible'); setTimeout(() => success.classList.remove('visible'), 5000); }
    }, 1200);
  });

  ['#nome', '#email'].forEach(sel => {
    const el = form.querySelector(sel);
    el?.addEventListener('blur', () => { if (el.value.trim()) clrErr(el); });
  });
}

/* =========================================================
   SMOOTH SCROLL
   ========================================================= */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href');
      if (id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const offset = (document.getElementById('navbar')?.offsetHeight || 72) + 8;
      window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - offset, behavior: 'smooth' });
    });
  });
}

/* =========================================================
   PAGE TRANSITIONS
   ========================================================= */
function initPageTransitions() {
  const overlay = document.createElement('div');
  overlay.id = 'page-overlay';
  document.body.insertBefore(overlay, document.body.firstChild);

  document.querySelectorAll('a').forEach(a => {
    const href = a.getAttribute('href');
    if (!href || a.target === '_blank') return;
    if (
      href.startsWith('#') ||
      href.startsWith('mailto:') ||
      href.startsWith('tel:') ||
      /^https?:\/\//.test(href)
    ) return;

    a.addEventListener('click', e => {
      e.preventDefault();
      const dest = a.href;
      overlay.classList.add('active');
      setTimeout(() => { window.location.href = dest; }, 280);
    });
  });
}
