/* =========================================================
   LUMO · Juego "Cuida a LUMO"
   Se carga al final de index.html, después del script principal.
   Imágenes de Lumo (opcionales, carpeta img/): si el archivo no existe
   se ve el espacio con la etiqueta, igual que en el resto de la página.
   Para cambiar velocidades o textos, edita DECAY y MENSAJES.
   ========================================================= */
/* Menú de juegos: muestra el juego elegido */
(() => {
  const pills = document.querySelectorAll('.juego-pill[data-juego]');
  const panels = document.querySelectorAll('.juego-panel');
  pills.forEach(b => b.addEventListener('click', () => {
    pills.forEach(x => { x.classList.toggle('on', x === b); x.setAttribute('aria-pressed', String(x === b)); });
    panels.forEach(p => { p.hidden = p.dataset.juego !== b.dataset.juego; });
  }));
})();

(() => {
  'use strict';

  const card = document.getElementById('jgCard');
  if (!card) return;

  const view = card.closest('.lumo-view');
  const lumo = document.getElementById('jgLumo');
  const stage = card.querySelector('.jg-stage');
  const bubble = document.getElementById('jgBubble');
  const estado = document.getElementById('jgEstado');
  const tip = document.getElementById('jgTip');

  const KEY = 'lumo-juego-v1';
  const TICK = 3000;                                   // cada cuántos ms bajan las barras
  const DECAY = { comida: 0.9, agua: 1.1, diversion: 0.8, carino: 0.4 };
  const STATS = Object.keys(DECAY);

  /* Estados de LUMO: texto, etiqueta del espacio y nombre de la imagen en img/ */
  const MOODS = {
    feliz:      { emoji: '😊', texto: 'LUMO está feliz',          alt: 'LUMO feliz',            img: 'FELIZ.png' },
    hambre:     { emoji: '🍖', texto: 'LUMO tiene hambre',        alt: 'LUMO con hambre',       img: 'HAMBRE.png' },
    sed:        { emoji: '💧', texto: 'LUMO tiene sed',           alt: 'LUMO con sed',          img: 'SED.png' },
    aburrido:   { emoji: '🎾', texto: 'LUMO se aburre',           alt: 'LUMO aburrido',         img: 'ABURRIDO.png' },
    triste:     { emoji: '😢', texto: 'LUMO está triste',         alt: 'LUMO triste',           img: 'TRISTE.png' },
    durmiendo:  { emoji: '💤', texto: 'LUMO está durmiendo',      alt: 'LUMO durmiendo',        img: 'DORMIR.png' },
    comiendo:   { emoji: '😋', texto: 'LUMO está comiendo',       alt: 'LUMO comiendo',         img: 'COMIENDO.png' },
    bebiendo:   { emoji: '💦', texto: 'LUMO está tomando agua',   alt: 'LUMO tomando agua',     img: 'BEBER.png' },
    jugando:    { emoji: '🎾', texto: 'LUMO está jugando',        alt: 'LUMO jugando',          img: 'JUGAR.png' },
    consentido: { emoji: '🥰', texto: 'LUMO se siente querido',   alt: 'LUMO recibiendo cariño', img: 'CONSENTIDO.png' },
    asustado:   { emoji: '😟', texto: 'LUMO está asustado',       alt: 'LUMO asustado',         img: 'ASUSTAO.png' }
  };

  /* Reacción de LUMO (globo) y dato para aprender (debajo) */
  const MENSAJES = {
    comer: [
      ['¡Ñam, ñam! Qué rico, gracias.', 'Los perros necesitan comer a sus horas y con comida hecha para ellos.'],
      ['¡Guau! Estaba muy hambriento.', 'Chocolate, uvas y cebolla son peligrosos para los perros. ¡Nunca se los des!'],
      ['¡Qué delicia!', 'La porción depende de su tamaño y edad: el veterinario te dice cuánto darle.']
    ],
    agua: [
      ['¡Glu, glu! Qué fresquita.', 'Debe tener agua limpia y fresca a su alcance todos los días.'],
      ['¡Gracias, tenía mucha sed!', 'Cambiar el agua cada día evita que se ensucie y se enferme.']
    ],
    jugar: [
      ['¡Guau, guau! ¡Qué divertido!', 'Jugar y pasear lo mantiene feliz, fuerte y tranquilo.'],
      ['¡Atrapé la pelota!', 'Después de jugar necesita descansar y tomar agua.']
    ],
    consentir: [
      ['Mmm, qué rico cariño…', 'Las caricias suaves le dan confianza y lo hacen sentir seguro.'],
      ['¡Te quiero mucho!', 'Hablarle con calma y cariño le enseña que está en un lugar seguro.']
    ],
    pegar: [
      ['¡Ay! Eso duele…', 'Pegarle lastima a LUMO. Los animales sienten dolor y miedo, igual que nosotros.'],
      ['LUMO tiene miedo y se esconde.', 'Nunca se debe golpear a un animal. Si algo no te gusta, pide ayuda a un adulto.'],
      ['LUMO ya no confía en ti…', 'Cuando un animal es lastimado, le cuesta mucho volver a confiar. Pídele perdón con caricias suaves.']
    ]
  };

  const clamp = v => Math.max(0, Math.min(100, v));
  const contador = {};
  const siguiente = tipo => {
    contador[tipo] = ((contador[tipo] ?? -1) + 1) % MENSAJES[tipo].length;
    return MENSAJES[tipo][contador[tipo]];
  };

  /* ---------- Estado y guardado ---------- */

  const nuevo = () => ({ comida: 70, agua: 70, diversion: 70, carino: 70, miedo: 0, golpes: 0, t: Date.now() });

  function cargar() {
    try {
      const guardado = JSON.parse(localStorage.getItem(KEY));
      if (!guardado || [...STATS, 'miedo', 'golpes', 't'].some(k => typeof guardado[k] !== 'number')) return nuevo();
      // Mientras no estabas, LUMO se cansa un poco, pero nunca queda en crisis.
      const pasos = Math.min((Date.now() - guardado.t) / TICK, 200);
      STATS.forEach(k => {
        guardado[k] = Math.max(guardado[k] - DECAY[k] * pasos, Math.min(guardado[k], 25));
      });
      guardado.miedo = clamp(guardado.miedo - 0.5 * pasos);
      guardado.t = Date.now();
      return guardado;
    } catch (e) {
      return nuevo();
    }
  }

  function guardar() {
    try { localStorage.setItem(KEY, JSON.stringify({ ...s, t: Date.now() })); } catch (e) { /* sin guardado */ }
  }

  let s = cargar();
  let temp = null;                 // estado temporal (comiendo, jugando…)
  let tempTimer = 0;
  let ultimaAccion = Date.now();
  let moodActual = '';
  let imgToken = 0;

  /* ---------- Estado de ánimo ---------- */

  function animo() {
    if (temp && temp.hasta > Date.now()) return temp.mood;
    if (s.miedo >= 30) return 'asustado';
    const bajos = [['triste', s.carino], ['hambre', s.comida], ['sed', s.agua], ['aburrido', s.diversion]]
      .filter(([, valor]) => valor < 30)
      .sort((a, b) => a[1] - b[1]);
    if (bajos.length) return bajos[0][0];
    const minimo = Math.min(...STATS.map(k => s[k]));
    if (Date.now() - ultimaAccion > 40000 && minimo >= 55) return 'durmiendo';
    return 'feliz';
  }

  function mostrarImagen(archivo) {
    const token = ++imgToken;
    const img = new Image();
    img.onload = () => {
      if (token !== imgToken) return;
      lumo.style.setProperty('--img', 'url("' + encodeURI('img/' + archivo) + '")');
      lumo.classList.add('con-img');
    };
    img.onerror = () => {
      if (token !== imgToken) return;
      lumo.classList.remove('con-img');
      lumo.style.removeProperty('--img');
    };
    img.src = 'img/' + archivo;
  }

  function pintar() {
    const mood = animo();
    if (mood !== moodActual) {
      moodActual = mood;
      const m = MOODS[mood];
      lumo.dataset.mood = mood;
      lumo.dataset.t = m.alt;
      lumo.setAttribute('aria-label', m.alt);
      estado.textContent = m.emoji + ' ' + m.texto;
      mostrarImagen(m.img);
    }
    STATS.forEach(k => {
      const barra = card.querySelector('.jg-bar[data-stat="' + k + '"]');
      const valor = Math.round(s[k]);
      barra.querySelector('.jg-fill').style.width = valor + '%';
      barra.querySelector('.jg-pct').textContent = valor + '%';
      barra.querySelector('[role="progressbar"]').setAttribute('aria-valuenow', valor);
      barra.classList.toggle('low', s[k] < 30);
    });
  }

  /* ---------- Acciones ---------- */

  function decir(dice, dato) {
    bubble.textContent = dice;
    tip.textContent = dato || '';
  }

  function temporal(mood, ms) {
    temp = { mood, hasta: Date.now() + ms };
    clearTimeout(tempTimer);
    tempTimer = setTimeout(() => { temp = null; pintar(); }, ms + 30);
  }

  function flotar(emoji) {
    const el = document.createElement('span');
    el.className = 'jg-float';
    el.textContent = emoji;
    el.setAttribute('aria-hidden', 'true');
    el.style.left = (30 + Math.random() * 40) + '%';
    stage.appendChild(el);
    setTimeout(() => el.remove(), 1700);
  }

  const acciones = {
    comer() {
      if (s.comida >= 95) return decir('Uff, ya estoy lleno.', 'Comer de más le puede dar dolor de barriga. Dale de comer solo cuando tenga hambre.');
      s.comida = clamp(s.comida + 28);
      temporal('comiendo', 2200); flotar('🍖');
      decir(...siguiente('comer'));
    },
    agua() {
      if (s.agua >= 95) return decir('Ya tomé suficiente agua por ahora.', 'Lo importante es que siempre tenga agua fresca disponible.');
      s.agua = clamp(s.agua + 30);
      temporal('bebiendo', 2200); flotar('💧');
      decir(...siguiente('agua'));
    },
    jugar() {
      if (s.miedo >= 30) return decir('Todavía tengo miedo…', 'Un animal asustado no quiere jugar. Primero consiéntelo con calma.');
      if (s.comida < 20 || s.agua < 20) return decir('Tengo mucha hambre o sed para jugar.', 'Primero hay que cuidar sus necesidades básicas: comida y agua.');
      if (s.diversion >= 95) return decir('¡Estoy cansado de tanto jugar!', 'Los animales también necesitan descansar.');
      s.diversion = clamp(s.diversion + 28);
      s.comida = clamp(s.comida - 6);
      s.agua = clamp(s.agua - 8);
      s.carino = clamp(s.carino + 5);
      temporal('jugando', 2600); flotar('🎾');
      decir(...siguiente('jugar'));
    },
    consentir() {
      const conMiedo = s.miedo > 0;
      s.carino = clamp(s.carino + (conMiedo ? 12 : 25));
      s.miedo = clamp(s.miedo - 25);
      s.diversion = clamp(s.diversion + 3);
      temporal('consentido', 2400); flotar('💗');
      if (conMiedo && s.miedo > 0) return decir('Poquito a poco… sigue con calma.', 'La confianza que se pierde tarda en volver. Sé paciente y gentil.');
      decir(...siguiente('consentir'));
    },
    pegar() {
      s.carino = clamp(s.carino - 35);
      s.diversion = clamp(s.diversion - 15);
      s.miedo = clamp(s.miedo + 45);
      s.golpes += 1;
      temporal('asustado', 4500); flotar('💔');
      const n = Math.min(s.golpes, 3) - 1;
      decir(...MENSAJES.pegar[n]);
    }
  };

  card.querySelectorAll('[data-act]').forEach(boton => {
    boton.addEventListener('click', () => {
      ultimaAccion = Date.now();
      acciones[boton.dataset.act]();
      guardar();
      pintar();
    });
  });

  document.getElementById('jgReset').addEventListener('click', () => {
    s = nuevo();
    temp = null;
    ultimaAccion = Date.now();
    decir('¡Hola otra vez! ¿Jugamos?', 'Cuidar a un animal es un compromiso de todos los días.');
    guardar();
    pintar();
  });

  /* Las barras bajan solo mientras esta pantalla está abierta */
  setInterval(() => {
    if (document.hidden || !view.classList.contains('active') || card.closest('.juego-panel').hidden) { s.t = Date.now(); return; }
    STATS.forEach(k => { s[k] = clamp(s[k] - DECAY[k]); });
    s.miedo = clamp(s.miedo - 0.5);
    guardar();
    pintar();
  }, TICK);

  pintar();
})();
