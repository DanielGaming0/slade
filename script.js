/* script.js
   Navegação robusta com bloqueio durante animação, suporte a toque e teclado.
*/

document.addEventListener('DOMContentLoaded', () => {
  const slides = Array.from(document.querySelectorAll('.slide'));
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const dotsWrap = document.getElementById('dots');

  let current = 0;
  let isAnimating = false;
  const TRANS_MS = 600; // manter em sincronia com CSS

  // inicializa slides
  slides.forEach((s, i) => {
    if (i === 0) {
      s.classList.add('active');
      s.setAttribute('aria-hidden', 'false');
    } else {
      s.style.transform = 'translateX(100%)';
      s.style.opacity = '0';
      s.setAttribute('aria-hidden', 'true');
    }
    // cria dot
    const dot = document.createElement('button');
    dot.className = 'dot';
    dot.setAttribute('aria-label', `Ir para slide ${i+1}`);
    dot.dataset.index = i;
    if (i === 0) dot.classList.add('active');
    dotsWrap.appendChild(dot);
  });

  const dots = Array.from(document.querySelectorAll('.dot'));

  function updateDots(idx) {
    dots.forEach(d => d.classList.toggle('active', Number(d.dataset.index) === idx));
  }

  // animação entre slides
  function goTo(nextIdx) {
    if (isAnimating || nextIdx === current) return;
    if (nextIdx < 0) nextIdx = slides.length - 1;
    if (nextIdx >= slides.length) nextIdx = 0;

    isAnimating = true;
    const from = slides[current];
    const to = slides[nextIdx];
    const direction = (nextIdx > current || (current === slides.length - 1 && nextIdx === 0)) ? 'next' : 'prev';

    // preparar posição inicial do "to"
    to.style.transition = 'none';
    to.style.opacity = '1';
    to.style.transform = direction === 'next' ? 'translateX(100%)' : 'translateX(-100%)';
    to.classList.add('preparing');
    to.style.zIndex = 3;

    // força reflow para aplicar estilos
    void to.offsetWidth;

    // aciona transição
    from.style.transition = `transform ${TRANS_MS}ms ease, opacity ${TRANS_MS}ms ease`;
    to.style.transition = `transform ${TRANS_MS}ms ease, opacity ${TRANS_MS}ms ease`;

    from.style.transform = direction === 'next' ? 'translateX(-100%)' : 'translateX(100%)';
    from.style.opacity = '0';

    to.style.transform = 'translateX(0)';
    to.style.opacity = '1';

    // quando terminar a transição do "to" (fallback com timeout)
    let finished = false;
    function done() {
      if (finished) return;
      finished = true;
      // limpar
      from.classList.remove('active');
      from.style.transition = '';
      from.style.transform = '';
      from.style.opacity = '';
      from.style.zIndex = '';

      to.classList.add('active');
      to.classList.remove('preparing');
      to.style.transition = '';
      to.style.transform = '';
      to.style.opacity = '';
      to.style.zIndex = '';

      from.setAttribute('aria-hidden', 'true');
      to.setAttribute('aria-hidden', 'false');

      current = nextIdx;
      updateDots(current);
      isAnimating = false;
    }

    // evento de término (adiciona a ambos por precaução)
    to.addEventListener('transitionend', done, { once: true });

    // fallback em caso de não disparar transitionend
    setTimeout(done, TRANS_MS + 80);
  }

  // botões
  prevBtn.addEventListener('click', () => { goTo(current - 1); });
  nextBtn.addEventListener('click', () => { goTo(current + 1); });

  // dots clique
  dots.forEach(d => d.addEventListener('click', (e) => {
    const idx = Number(e.currentTarget.dataset.index);
    goTo(idx);
  }));

  // teclado
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); goTo(current + 1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); goTo(current - 1); }
  });

  // suporte a toque (swipe)
  let touchStartX = 0, touchStartY = 0, touchMoved = false;
  const THRESHOLD = 40;

  document.addEventListener('touchstart', (e) => {
    if (e.touches.length !== 1) return;
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    touchMoved = false;
  }, {passive:true});

  document.addEventListener('touchmove', (e) => {
    touchMoved = true;
  }, {passive:true});

  document.addEventListener('touchend', (e) => {
    if (!touchMoved) return;
    const touchEndX = (e.changedTouches && e.changedTouches[0]) ? e.changedTouches[0].clientX : touchStartX;
    const dx = touchEndX - touchStartX;
    const dy = (e.changedTouches && e.changedTouches[0]) ? Math.abs(e.changedTouches[0].clientY - touchStartY) : 0;
    if (Math.abs(dx) > THRESHOLD && Math.abs(dx) > dy) {
      if (dx < 0) goTo(current + 1);
      else goTo(current - 1);
    }
  }, {passive:true});
});