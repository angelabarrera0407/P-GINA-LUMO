from pathlib import Path
import re, json, shutil, zipfile
base=Path('/mnt/data/lumo4_work')
html=(base/'index.html').read_text()
# Fix case-sensitive stylesheet path and add Bootstrap CSS before project styles
html=html.replace('<link rel="stylesheet" href="styles.css">', '<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">\n  <link rel="stylesheet" href="Styles.css">')
# Add stable id to Juega button
html=html.replace('<button>Juega con LUMO</button>', '<button id="goJuega" type="button">Juega con LUMO</button>')
# Mark all community image spaces as blank image frames: suppress text pseudo element via CSS, retain data-t for accessibility metadata
# Replace entire existing script
start=html.index('  <script>')
end=html.index('  </script>', start)+len('  </script>')
script=r'''  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
  <script>
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
  </script>'''
html=html[:start]+script+html[end:]
(base/'index.html').write_text(html)

# Centralize all literal hex colors in both stylesheets as editable CSS custom properties.
files=['Styles.css','comunidad.css']
colors=[]
for fn in files:
    txt=(base/fn).read_text()
    for c in re.findall(r'#[0-9a-fA-F]{3,8}\b',txt):
        if c.lower() not in [x.lower() for x in colors]: colors.append(c)
# semantic aliases for main existing palette; others get generated names
preferred={'#007f7b':'color-primario','#00665f':'color-primario-oscuro','#e6f5f5':'color-fondo-suave','#b2d9d9':'color-secundario','#7b9ccb':'color-acento','#1f5f5c':'color-texto','#ffffff':'color-blanco','#fff':'color-blanco'}
varmap={}
for i,c in enumerate(colors):
    name=preferred.get(c.lower(), 'color-extra-'+str(i+1))
    varmap[c.lower()]='var(--'+name+')'
# Build palette, avoid duplicate variable definitions for #fff/#ffffff variants.
palette='/* =========================================================\n   LUMO · PALETA CENTRALIZADA\n   Edita estos valores para cambiar los colores de todo el sitio.\n   ========================================================= */\n:root {\n'
seen=set()
for c in colors:
    name=varmap[c.lower()][6:-1]
    if name in seen: continue
    seen.add(name)
    palette+=f'  --{name}: {c};\n'
palette+='  --img: none;\n}\n\n'
for fn in files:
    txt=(base/fn).read_text()
    # Remove old root block in main stylesheet; community has none.
    if fn=='Styles.css':
        txt=re.sub(r':root\s*\{.*?\}\s*', '', txt, count=1, flags=re.S)
    for c in sorted(colors,key=len,reverse=True):
        txt=re.sub(re.escape(c)+r'(?![0-9a-fA-F])',varmap[c.lower()],txt,flags=re.I)
    if fn=='Styles.css':
        txt=palette+txt
        txt=txt.replace('font:15px/1.5 Raleway,sans-serif;', "font:15px/1.5 'Nunito Sans',sans-serif;")
        txt=txt.replace('font-family:Poppins,sans-serif;', "font-family:'Nunito Sans',sans-serif;")
        txt=txt.replace('font:600 12px Poppins;', "font:600 12px 'Nunito Sans',sans-serif;")
        txt=txt.replace('font:600 18px Poppins;', "font:700 18px 'Nunito Sans',sans-serif;")
        txt=txt.replace('font:14px Raleway;', "font:14px 'Nunito Sans',sans-serif;")
        # hide photo placeholder captions site-wide for community image slots only
        txt += '''\n\n/* =========================================================\n   RENOVACIÓN VISUAL Y NAVEGACIÓN LUMO\n   ========================================================= */\n.lumo-view { display:none; min-height:60vh; }\n.lumo-view.active { display:block; animation:lumoFade .35s ease both; }\n@keyframes lumoFade { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }\n.community-section .ph::before { content:none !important; }\n.coming-soon-section { min-height:65vh; display:grid; place-items:center; padding:60px 22px; background:linear-gradient(135deg,var(--color-fondo-suave),var(--color-extra-2)); }\n.coming-soon-card { max-width:680px; padding:clamp(30px,6vw,70px); border-radius:32px; background:var(--color-blanco); text-align:center; box-shadow:0 18px 50px var(--color-extra-3); }\n.coming-soon-card h1 { color:var(--color-primario); margin:12px 0; font-size:clamp(30px,5vw,48px); }\n.coming-soon-card p { color:var(--color-texto); font-size:17px; }\nnav { box-shadow:0 5px 20px var(--color-extra-3); }\nnav button { transition:transform .2s,background .2s,box-shadow .2s; }\nnav button:hover { transform:translateY(-2px); }\n@media(max-width:700px) { nav { justify-content:center; } .search-box { width:100%; justify-content:center; margin:6px 0 0; } .search-box input { flex:1; max-width:260px; } }\n@media(prefers-reduced-motion:reduce) { .lumo-view.active { animation:none; } }\n'''
    (base/fn).write_text(txt)

# ensure community placeholders stay blank and use shared palette; no content text overlay
# Correct path capitalization and keep asset directory as supplied.
# Create README and ZIP
readme='''LUMO - VERSION RENOVADA\n\nArchivos:\n- index.html\n- Styles.css\n- comunidad.css\n- img/ (recursos originales)\n\nPara probar: conserva la carpeta img junto a index.html y abre index.html en el navegador.\nBootstrap 5.3.3 se carga desde CDN, por lo que requiere conexión a internet.\n\nLa navegación ahora muestra pantallas independientes sin recargar la pestaña.\nJuega con LUMO queda como sección temporal Próximamente.\nLos espacios de imagen de Comunidad LUMO no muestran textos de muestra.\nLos colores editables están centralizados al inicio de Styles.css.\n'''
(base/'LEEME.txt').write_text(readme)
zip_path=Path('/mnt/data/LUMO_renovacion_v1.zip')
with zipfile.ZipFile(zip_path,'w',zipfile.ZIP_DEFLATED) as z:
    for p in base.rglob('*'):
        if p.is_file() and p.name!='update.py': z.write(p,p.relative_to(base))
print('ZIP',zip_path,zip_path.stat().st_size)
print('palette colors',len(colors),'files',[(p.name,p.stat().st_size) for p in base.iterdir() if p.is_file()])
