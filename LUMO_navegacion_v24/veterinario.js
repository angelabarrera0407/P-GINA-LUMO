/* =========================================================
   LUMO · Juego "Visita al veterinario"
   LUMO está en el consultorio y el veterinario pregunta qué
   instrumento necesita. El niño toca o arrastra el instrumento y
   este viaja hasta LUMO. LUMO cambia de ánimo según su tranquilidad.
   Edita INSTRUMENTOS, RONDAS y FINAL para cambiar los textos.
   Imágenes opcionales en img/ (si no existen se ve el espacio):
   - LUMO: vet-lumo-tranquilo, vet-lumo-nervioso, vet-lumo-triste, vet-lumo-feliz
   - Instrumentos: vet-estetoscopio, vet-termometro, vet-bascula,
     vet-otoscopio, vet-linterna, vet-vacuna        (todas .png)
   ========================================================= */
(() => {
  'use strict';
  const card = document.getElementById('veCard');
  if (!card) return;
  const $ = id => document.getElementById(id);
  const stage = $('veStage'), escena = $('veEscena'), bubble = $('veBubble'), chip = $('vePaso');
  const tip = $('veTip'), bandeja = $('veBandeja'), carnet = $('veCarnet'), barra = card.querySelector('.jg-bar');

  const ANIMOS = {
    tranquilo: { alt: 'LUMO tranquilo en el consultorio', img: ['CALMADO.png', 'PERRO VET.png'] },
    nervioso:  { alt: 'LUMO nervioso en el consultorio',  img: ['NERVIOSO2.png'] },
    triste:    { alt: 'LUMO triste en el consultorio',    img: ['TRISTE.jpg'] },
    feliz:     { alt: 'LUMO feliz en el consultorio',     img: ['FELIZ.jpg', 'PERRO VET.png'] }
  };

  const INSTRUMENTOS = {
    estetoscopio: { nombre: 'Estetoscopio', sirve: 'Sirve para escuchar el corazón y los pulmones.',
                    dice: '¡Su corazón late fuerte y sano!', dato: 'El veterinario escucha el corazón para saber si todo funciona bien.' },
    termometro:   { nombre: 'Termómetro', sirve: 'Sirve para medir la temperatura.',
                    dice: 'Su temperatura está perfecta.', dato: 'Un perro sano tiene entre 38 y 39 grados. Si está más caliente o más frío, puede estar enfermo.' },
    bascula:      { nombre: 'Báscula', sirve: 'Sirve para saber cuánto pesa.',
                    dice: '¡Está en su peso ideal!', dato: 'Pesar de más o de menos puede enfermarlo. Por eso se controla su peso.' },
    otoscopio:    { nombre: 'Otoscopio', sirve: 'Sirve para mirar dentro de las orejas.',
                    dice: 'Orejitas limpias y sanas.', dato: 'Se revisan las orejas para detectar a tiempo infecciones o parásitos.' },
    linterna:     { nombre: 'Linterna', sirve: 'Sirve para ver con buena luz la boca y los dientes.',
                    dice: 'Dientes y encías muy sanos.', dato: 'Cuidar sus dientes evita dolor y mal aliento.' },
    vacuna:       { nombre: 'Vacuna', sirve: 'Sirve para protegerlo de enfermedades graves.',
                    dice: 'Un pinchacito y listo. ¡Qué valiente!', dato: 'Las vacunas se ponen en las fechas que indica el veterinario.' }
  };

  const RONDAS = [
    { pregunta: 'Quiero escuchar si el corazón de LUMO late bien. ¿Qué instrumento necesito?', correcta: 'estetoscopio' },
    { pregunta: 'LUMO parece un poco caliente. ¿Cómo comprobamos su temperatura?', correcta: 'termometro' },
    { pregunta: 'Queremos saber si está en su peso ideal. ¿Qué usamos?', correcta: 'bascula' },
    { pregunta: 'Hay que mirar dentro de sus orejas. ¿Qué instrumento sirve?', correcta: 'otoscopio' },
    { pregunta: 'Vamos a mirar su boca y sus dientes con buena luz. ¿Con qué?', correcta: 'linterna' },
    { pregunta: 'Para protegerlo de enfermedades graves, ¿qué le ponemos?', correcta: 'vacuna' }
  ];

  const FINAL = {
    dice: '¡Revisión completa! LUMO está sano y contento.',
    dato: 'Lo ideal es llevarlo al veterinario al menos una vez al año, y antes si no quiere comer, cojea, se rasca mucho o está muy decaído.'
  };

  const CALMAS = [
    ['Mmm, qué rico… ya me siento más tranquilo.', 'Hablarle suave y acariciarlo le quita el miedo en el consultorio.'],
    ['Gracias por quedarte conmigo.', 'Un animal acompañado y consentido se asusta menos.']
  ];

  let calma = 70, ronda = 0, ocupado = false, temp = null, tempTimer = 0, nCalma = 0, token = 0, hechos = [];

  /* ---------- LUMO ---------- */
  function animo() {
    if (temp) return temp;
    if (calma < 30) return 'triste';
    if (calma < 55) return 'nervioso';
    return 'tranquilo';
  }
  let animoActual = '';
  function pintarLumo() {
    const a = animo();
    if (a === animoActual) return;
    animoActual = a;
    const m = ANIMOS[a], mi = ++token;
    escena.dataset.t = m.alt; escena.dataset.mood = a;
    escena.setAttribute('aria-label', m.alt);
    escena.classList.remove('con-img'); escena.style.removeProperty('--img');
    const probar = n => {
      if (n >= m.img.length) return;
      const im = new Image();
      im.onload = () => { if (mi !== token) return; escena.style.setProperty('--img', 'url("' + encodeURI('img/' + m.img[n]) + '")'); escena.classList.add('con-img'); };
      im.onerror = () => { if (mi === token) probar(n + 1); };
      im.src = 'img/' + m.img[n];
    };
    probar(0);
  }
  function animoTemporal(a, ms) {
    temp = a; clearTimeout(tempTimer);
    tempTimer = setTimeout(() => { temp = null; pintar(); }, ms);
    pintar();
  }

  function decir(dice, dato) { bubble.textContent = dice; tip.textContent = dato || ''; }

  function pintar() {
    const v = Math.round(calma);
    barra.querySelector('.jg-fill').style.width = v + '%';
    barra.querySelector('.jg-pct').textContent = v + '%';
    barra.querySelector('[role="progressbar"]').setAttribute('aria-valuenow', v);
    barra.classList.toggle('low', calma < 30);
    chip.textContent = ronda < RONDAS.length ? 'Pregunta ' + (ronda + 1) + ' de ' + RONDAS.length : '¡Final!';
    bandeja.querySelectorAll('.ve-instr').forEach(b => {
      const ok = hechos.includes(b.dataset.instr);
      b.classList.toggle('hecho', ok);
      b.disabled = ok || ronda >= RONDAS.length;
    });
    pintarLumo();
  }

  /* ---------- Instrumento que viaja hasta LUMO ---------- */
  function volar(c, rect) {
    const st = stage.getBoundingClientRect(), l = escena.getBoundingClientRect();
    const v = c.querySelector('.ph').cloneNode(true);
    v.className = v.className + ' ve-vuelo';
    v.style.left = (rect.left - st.left) + 'px';
    v.style.top = (rect.top - st.top) + 'px';
    v.style.width = rect.width + 'px'; v.style.height = rect.height + 'px';
    stage.appendChild(v);
    const dx = (l.left + l.width / 2) - (rect.left + rect.width / 2);
    const dy = (l.top + l.height / 2) - (rect.top + rect.height / 2);
    requestAnimationFrame(() => requestAnimationFrame(() => { v.style.transform = 'translate(' + dx + 'px,' + dy + 'px) scale(1.2)'; }));
    setTimeout(() => v.classList.add('ve-uso'), 650);
    setTimeout(() => v.remove(), 2100);
  }

  /* ---------- Elegir instrumento ---------- */
  function elegir(c, rect) {
    if (ocupado || ronda >= RONDAS.length) return;
    const clave = c.dataset.instr, ins = INSTRUMENTOS[clave], r = RONDAS[ronda];
    if (calma < 30) {
      decir('Estoy muy nervioso y triste… ¿me consientes primero?', 'Si un animal tiene miedo, hay que darle tiempo y cariño antes de seguir.');
      return;
    }
    ocupado = true;
    volar(c, rect);
    setTimeout(() => {
      if (clave === r.correcta) {
        calma = Math.max(0, calma - 8);
        hechos.push(clave);
        decir(ins.dice, ins.dato);
        if (calma >= 55) animoTemporal('feliz', 1800);
        ronda += 1;
        pintar();
        setTimeout(() => {
          ocupado = false;
          if (ronda >= RONDAS.length) return final();
          decir(RONDAS[ronda].pregunta, 'Pista: piensa para qué sirve cada instrumento.');
          pintar();
        }, 2300);
      } else {
        calma = Math.max(0, calma - 15);
        decir('Hmm, eso no era…', 'Eso es un ' + ins.nombre.toLowerCase() + '. ' + ins.sirve + ' ¡Busquemos otro!');
        c.classList.add('sacude');
        setTimeout(() => c.classList.remove('sacude'), 600);
        animoTemporal(calma < 30 ? 'triste' : 'nervioso', 2600);
        ocupado = false;
        pintar();
      }
    }, 700);
  }

  /* ---------- Tocar o arrastrar ---------- */
  bandeja.querySelectorAll('.ve-instr').forEach(c => {
    let inicio = null, ghost = null, arrastra = false;
    const limpiar = () => { if (ghost) ghost.remove(); ghost = null; inicio = null; arrastra = false; };
    c.addEventListener('pointerdown', e => {
      if (c.disabled || ocupado) return;
      inicio = { x: e.clientX, y: e.clientY };
      c.setPointerCapture(e.pointerId);
    });
    c.addEventListener('pointermove', e => {
      if (!inicio) return;
      if (!arrastra && Math.hypot(e.clientX - inicio.x, e.clientY - inicio.y) > 10) {
        arrastra = true;
        ghost = c.querySelector('.ph').cloneNode(true);
        ghost.className = ghost.className + ' ve-ghost';
        document.body.appendChild(ghost);
      }
      if (ghost) { ghost.style.left = (e.clientX - 42) + 'px'; ghost.style.top = (e.clientY - 42) + 'px'; }
    });
    c.addEventListener('pointerup', e => {
      if (!inicio) return;
      const fueArrastre = arrastra, gr = ghost && ghost.getBoundingClientRect();
      limpiar();
      if (!fueArrastre) return elegir(c, c.querySelector('.ph').getBoundingClientRect());
      const l = escena.getBoundingClientRect();
      if (e.clientX > l.left - 30 && e.clientX < l.right + 30 && e.clientY > l.top - 30 && e.clientY < l.bottom + 30) elegir(c, gr);
    });
    c.addEventListener('pointercancel', limpiar);
    c.addEventListener('click', e => { if (e.detail === 0) elegir(c, c.querySelector('.ph').getBoundingClientRect()); });
  });

  $('veCalmar').addEventListener('click', () => {
    if (ocupado) return;
    calma = Math.min(100, calma + 30);
    const m = CALMAS[nCalma++ % CALMAS.length];
    decir(m[0], m[1]);
    animoTemporal('feliz', 2200);
    pintar();
  });

  /* ---------- Final y reinicio ---------- */
  const el = (tag, clase, texto) => { const e = document.createElement(tag); if (clase) e.className = clase; if (texto) e.textContent = texto; return e; };

  /* El carnet final sale como ventana emergente encima de la página */
  const popup = el('div', 've-popup');
  popup.hidden = true;
  popup.setAttribute('role', 'dialog');
  popup.setAttribute('aria-modal', 'true');
  popup.setAttribute('aria-label', 'Carnet de salud de LUMO');
  popup.appendChild(carnet);
  document.body.appendChild(popup);
  popup.addEventListener('click', e => { if (e.target === popup) reiniciar(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !popup.hidden) reiniciar(); });

  function final() {
    decir(FINAL.dice, '');
    animoTemporal('feliz', 600000);
    popup.hidden = false;
    carnet.hidden = false;
    carnet.replaceChildren(
      el('p', 've-pop-titulo', '¡Lo has logrado!'),
      el('p', 've-pop-sub', 'Revisaste a LUMO y está muy bien.'),
      el('p', 'av-medalla', '🏅 Ayudante de veterinario'),
      el('p', '', '📋 Carnet de salud de LUMO: ' + hechos.map(k => '✓ ' + INSTRUMENTOS[k].nombre).join(' · ')),
      el('p', '', '🐾 ' + FINAL.dato)
    );
    const b = el('button', 'jg-btn', 'Otra revisión');
    b.type = 'button';
    b.addEventListener('click', reiniciar);
    carnet.appendChild(b);
    pintar();
    b.focus();
  }

  function reiniciar() {
    calma = 70; ronda = 0; ocupado = false; temp = null; nCalma = 0; hechos = [];
    clearTimeout(tempTimer);
    carnet.hidden = true;
    popup.hidden = true;
    bandeja.querySelectorAll('.ve-instr').forEach(b => { b.style.order = Math.floor(Math.random() * 6); });
    decir('¡Bienvenidos al consultorio! ' + RONDAS[0].pregunta, 'Pista: piensa para qué sirve cada instrumento.');
    pintar();
  }

  reiniciar();
})();
