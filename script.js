(() => {
  const button = document.querySelector('#lang-switch');
  const themeButton = document.querySelector('#theme-switch');
  const nav = document.querySelector('.nav');
  const menu = document.querySelector('.menu-button');
  let lang = 'es';
  const applyLanguage = (next) => {
    lang = next;
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-es][data-en]').forEach((el) => {
      const copy = el.dataset[lang];
      if (copy.includes('<')) el.innerHTML = copy;
      else el.textContent = copy;
    });
    document.querySelector('.lang-current').textContent = lang.toUpperCase();
    document.querySelector('.lang-other').textContent = lang === 'es' ? 'EN' : 'ES';
    button.setAttribute('aria-label', lang === 'es' ? 'Switch to English' : 'Cambiar a español');
    nav.setAttribute('aria-label', lang === 'es' ? 'Navegación principal' : 'Main navigation');
    document.querySelector('.project-tabs').setAttribute('aria-label', lang === 'es' ? 'Seleccionar proyecto' : 'Select a project');
    menu.setAttribute('aria-label', menu.getAttribute('aria-expanded') === 'true' ? (lang === 'es' ? 'Cerrar navegación' : 'Close navigation') : (lang === 'es' ? 'Abrir navegación' : 'Open navigation'));
    themeButton.setAttribute('aria-label', document.documentElement.dataset.theme === 'light' ? (lang === 'es' ? 'Cambiar a tema oscuro' : 'Switch to dark theme') : (lang === 'es' ? 'Cambiar a tema claro' : 'Switch to light theme'));
    themeButton.title = themeButton.getAttribute('aria-label');
    document.title = lang === 'es' ? 'Portafolio — Ingeniería en Sistemas Computacionales' : 'Portfolio — Computer Systems Engineering';
    document.querySelector('meta[name="description"]').content = lang === 'es'
      ? 'Portafolio de Ingeniería en Sistemas Computacionales con enfoque en backend, hardware y proyectos interactivos.'
      : 'Computer Systems Engineering portfolio focused on backend development, hardware, and interactive projects.';
    try { localStorage.setItem('portfolio-lang', lang); } catch { /* Optional preference. */ }
  };
  const applyTheme = (next) => {
    document.documentElement.dataset.theme = next;
    const light = next === 'light';
    themeButton.textContent = light ? '☾' : '☼';
    const label = light ? (lang === 'es' ? 'Cambiar a tema oscuro' : 'Switch to dark theme') : (lang === 'es' ? 'Cambiar a tema claro' : 'Switch to light theme');
    themeButton.setAttribute('aria-label', label);
    themeButton.title = label;
    try { localStorage.setItem('portfolio-theme', next); } catch { /* Optional preference. */ }
  };
  button.addEventListener('click', () => applyLanguage(lang === 'es' ? 'en' : 'es'));
  themeButton.addEventListener('click', () => applyTheme(document.documentElement.dataset.theme === 'light' ? 'dark' : 'light'));
  const contactForm = document.querySelector('#contact-form');
  const formStatus = document.querySelector('#form-status');
  contactForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const submitButton = contactForm.querySelector('button[type="submit"]');
    const payload = Object.fromEntries(new FormData(contactForm));
    payload._subject = `Portafolio | ${String(payload.subject).trim()}`;
    submitButton.disabled = true;
    submitButton.setAttribute('aria-busy', 'true');
    formStatus.textContent = lang === 'es' ? 'Enviando mensaje…' : 'Sending your message…';

    try {
      const response = await fetch('https://formsubmit.co/ajax/ingrid.hgmz@gmail.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      const succeeded = result.success === true || result.success === 'true';

      if (!response.ok || !succeeded) {
        throw new Error(result.message || 'Submission failed');
      }

      const needsActivation = /activat|confirm/i.test(String(result.message || ''));
      if (needsActivation) {
        formStatus.textContent = lang === 'es'
          ? 'Confirma FormSubmit desde el correo de activación que te llegará y después vuelve a enviar el mensaje.'
          : 'Confirm FormSubmit using the activation email, then send your message again.';
      } else {
        formStatus.textContent = lang === 'es'
          ? 'Mensaje enviado. ¡Gracias por escribirme!'
          : 'Message sent. Thanks for reaching out!';
        contactForm.reset();
      }
    } catch {
      formStatus.textContent = lang === 'es'
        ? 'No se pudo enviar. Intenta de nuevo o escríbeme a ingrid.hgmz@gmail.com.'
        : 'Could not send your message. Please try again or email ingrid.hgmz@gmail.com.';
    } finally {
      submitButton.disabled = false;
      submitButton.removeAttribute('aria-busy');
    }
  });
  menu.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    menu.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-label', open ? (lang === 'es' ? 'Cerrar navegación' : 'Close navigation') : (lang === 'es' ? 'Abrir navegación' : 'Open navigation'));
  });
  nav.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => {
    nav.classList.remove('open');
    menu.setAttribute('aria-expanded', 'false');
  }));
  const sectionLinks = [...nav.querySelectorAll('a[href^="#"]')];
  const navSections = sectionLinks
    .map((link) => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);
  const updateActiveSection = () => {
    const marker = window.innerHeight * .36;
    let activeSection = navSections[0];
    for (const section of navSections) {
      if (section.getBoundingClientRect().top <= marker) activeSection = section;
      else break;
    }
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) {
      activeSection = navSections[navSections.length - 1];
    }
    sectionLinks.forEach((link) => {
      const active = link.hash === `#${activeSection.id}`;
      link.classList.toggle('is-active', active);
      if (active) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  };
  let activeUpdateQueued = false;
  window.addEventListener('scroll', () => {
    if (activeUpdateQueued) return;
    activeUpdateQueued = true;
    window.requestAnimationFrame(() => {
      updateActiveSection();
      activeUpdateQueued = false;
    });
  }, {passive: true});
  window.addEventListener('resize', updateActiveSection);
  updateActiveSection();
  const projectTabs = [...document.querySelectorAll('[data-project-select]')];
  const projectCards = [...document.querySelectorAll('[data-project-card]')];
  const projectGrid = document.querySelector('.project-grid');
  const showProject = (selected) => {
    projectTabs.forEach((tab) => {
      const active = tab.dataset.projectSelect === selected;
      tab.classList.toggle('active', active);
      tab.setAttribute('aria-pressed', String(active));
    });
    projectCards.forEach((card) => { card.hidden = card.dataset.projectCard !== selected; });
    projectGrid.hidden = selected === 'forklift';
    projectGrid.classList.toggle('single-panel', selected !== 'forklift');
  };
  projectTabs.forEach((tab) => tab.addEventListener('click', () => showProject(tab.dataset.projectSelect)));
  showProject('api');
  try { if (localStorage.getItem('portfolio-lang') === 'en') applyLanguage('en'); } catch { /* Spanish is the default. */ }
  try { applyTheme(localStorage.getItem('portfolio-theme') === 'light' ? 'light' : 'dark'); } catch { applyTheme('dark'); }
})();
