const $ = selector => document.querySelector(selector);
    const $$ = selector => [...document.querySelectorAll(selector)];

    /* =====================================================
       NAVEGACIÓN POR PANTALLAS, SIN RECARGAR EL NAVEGADOR
       ===================================================== */
    const main = $('main');
    const sections = {
      inicio: ['#inicio', '#que-es-lumo'],
      conoce: ['#conoce-lumo', '#por-que-importante', '.needs-section'],
      juega: [],
      comunidad: ['#comunidad-lumo'],
      contacto: []
    };
    const views = {};

    Object.entries(sections).forEach(([name, selectors]) => {
      const view = document.createElement('div');
      view.className = 'lumo-view';
      view.dataset.view = name;
      main.appendChild(view);
      views[name] = view;
      selectors.forEach(selector => {
        const section = $(selector);
        if (section) view.appendChild(section);
      });
    });

    views.juega.innerHTML = `
      <section class="coming-soon-section">
        <div class="coming-soon-card">
          <span class="community-kicker">PRÓXIMAMENTE</span>
          <h1>¡Juega con LUMO!</h1>
          <p>Muy pronto tendremos aquí el libro y actividades para aprender jugando.</p>
        </div>
      </section>`;

    const contact = $('#contacto');
    function showView(name, shouldScroll = true) {
      const current = views[name] || views.inicio;
      current.appendChild(contact);
      Object.values(views).forEach(view => {
        const active = view === current;
        view.classList.toggle('active', active);
        view.setAttribute('aria-hidden', String(!active));
      });
      const buttons = {
        inicio: $('#goInicio'), conoce: $('#goLumo'), juega: $('#goJuega'),
        comunidad: $('#goCommunity'), contacto: $('#goContact')
      };
      $$('nav button').forEach(button => button.classList.remove('on'));
      if (buttons[name]) buttons[name].classList.add('on');
      if (shouldScroll) window.scrollTo({ top: 0, behavior: 'smooth' });
      document.title = 'LUMO · ' + ({inicio:'Inicio', conoce:'Conoce a LUMO', juega:'Juega con LUMO', comunidad:'Comunidad LUMO', contacto:'Contáctanos'}[name] || 'Inicio');
    }

    $('#goInicio').addEventListener('click', () => showView('inicio'));
    $('#goLumo').addEventListener('click', () => showView('conoce'));
    $('#goJuega').addEventListener('click', () => showView('juega'));
    $('#goCommunity').addEventListener('click', () => showView('comunidad'));
    $('#goContact').addEventListener('click', () => showView('contacto'));
    showView('inicio', false);

    /* Enlaces internos de Comunidad: desplazan dentro de su pantalla */
    $$('a[href^="#"]').forEach(link => {
      link.addEventListener('click', event => {
        const target = $(link.getAttribute('href'));
        if (!target) return;
        event.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });

    /* Carrusel de fundaciones: conserva la cuadrícula 2 x 2 */
    $$('.foundation-scroll').forEach(button => {
      button.addEventListener('click', () => {
        const track = $('#foundationsTrack');
        if (track) track.scrollBy({ left: Number(button.dataset.direction) * track.clientWidth, behavior: 'smooth' });
      });
    });

    /* Carrusel de historias */
    $$('.story-scroll').forEach(button => {
      button.addEventListener('click', () => {
        const track = $('#storiesTrack');
        if (track) track.scrollBy({ left: Number(button.dataset.direction) * 300, behavior: 'smooth' });
      });
    });

    /* Interacción de necesidades de los animales */
    const needs = {
      'Alimentación': 'Necesita comida y agua fresca todos los días.',
      'Cariño': 'Las caricias y el juego le dan confianza.',
      'Un hogar': 'Un lugar seguro y abrigado donde descansar.',
      'Salud': 'Vacunas y visitas al veterinario lo mantienen sano.',
      'Amor': 'Los animales sienten y merecen ser queridos.',
      'Respeto': 'Nunca se les grita ni se les golpea.'
    };
    $$('.need .pill').forEach(button => button.addEventListener('click', () => {
      $$('.need .pill').forEach(item => item.classList.remove('on'));
      button.classList.add('on');
      const name = button.textContent.trim();
      const tip = $('#tip');
      if (tip) tip.textContent = name + ': ' + needs[name];
    }));

    /* Formulario de contacto */
    const contactForm = $('#contacto form');
    if (contactForm) contactForm.addEventListener('submit', event => {
      event.preventDefault();
      const message = contactForm.querySelector('.msg');
      if (!contactForm.checkValidity()) {
        message.textContent = 'Completa los campos obligatorios con un correo válido.';
        message.className = 'msg err';
        return;
      }
      message.textContent = '¡Gracias! Te contactaremos pronto 🐾';
      message.className = 'msg ok';
      contactForm.reset();
    });

    /* Ventanas informativas del footer */
    $$('footer [data-d]').forEach(button => button.addEventListener('click', () => {
      $('#dt').textContent = button.dataset.d;
      $('dialog').showModal();
    }));

    /* Buscador: encuentra contenido y abre la pantalla correspondiente */
    function searchContent() {
      const query = $('#searchInput').value.trim().toLowerCase();
      if (!query) return;
      const found = $$('main h1, main h2, main h3, main p, main button, main label').find(element => element.textContent.toLowerCase().includes(query));
      if (!found) { alert('No encontramos "' + query + '" en esta página.'); return; }
      const view = found.closest('.lumo-view');
      if (view) showView(view.dataset.view, false);
      found.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    $('#searchBtn').addEventListener('click', searchContent);
    $('#searchInput').addEventListener('keydown', event => { if (event.key === 'Enter') searchContent(); });

    /* Carga de imágenes desde la carpeta img */
    $$('[imagen]').forEach(element => {
      const filename = element.getAttribute('imagen').trim();
      if (!filename) return;
      const image = new Image();
      image.onload = () => {
        element.style.setProperty('--img', 'url("' + encodeURI('img/' + filename) + '")');
        element.classList.add('con-img');
      };
      image.src = 'img/' + filename;
    });

    /* Aparición suave de elementos */
    const revealItems = $$('.about-lumo, .meet-lumo, .important-section, .important-card, .needs-section, .community-section, .community-card, .support-detail, .story-card, .contact .card');
    revealItems.forEach(element => element.classList.add('reveal'));
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries, currentObserver) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) { entry.target.classList.add('visible'); currentObserver.unobserve(entry.target); }
        });
      }, { threshold: 0.12 });
      revealItems.forEach(element => observer.observe(element));
    } else revealItems.forEach(element => element.classList.add('visible'));