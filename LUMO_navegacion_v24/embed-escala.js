/* =========================================================
   LUMO · Escala de los contenidos incrustados
   El recuadro de GitHub (clase lumo-escala) se muestra a su tamaño
   de diseño 1280 × 800 y se reduce proporcionalmente si la pantalla
   es más angosta, para que el contenido quede bien encuadrado.
   En celular (menos de 700 px) ocupa todo el ancho.
   ========================================================= */
(() => {
  'use strict';
  const cajas = document.querySelectorAll('.lumo-escala');
  if (!cajas.length) return;

  const ajustar = caja => {
    const ancho = caja.clientWidth;
    if (!ancho) return;                       // pantalla oculta: se ajusta al mostrarse
    const diseno = Number(caja.dataset.ancho) || 1280;
    if (ancho < 700) { caja.classList.add('movil'); return; }
    caja.classList.remove('movil');
    caja.style.setProperty('--escala', Math.min(ancho / diseno, 1));
  };

  cajas.forEach(caja => {
    ajustar(caja);
    if ('ResizeObserver' in window) new ResizeObserver(() => ajustar(caja)).observe(caja);
    else window.addEventListener('resize', () => ajustar(caja));
  });
})();
