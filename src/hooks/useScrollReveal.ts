import { useEffect } from 'react';

/**
 * Revela seções conforme entram na tela.
 *
 * Regra de performance (06/11/2026): o que já está no primeiro viewport NÃO
 * recebe a animação. `animate-fadeSlideIn` usa `animation-fill-mode: both`, ou
 * seja, começa em opacity 0 e leva 1s para aparecer. Aplicar isso em conteúdo
 * que já tinha sido pintado invalida o candidato a LCP e o navegador só
 * recontabiliza depois da animação: no artigo do blog isso aparecia como
 * ~4,1s de "render delay" (Lighthouse mobile, LCP 5,9s, com o elemento final
 * já presente no HTML pré-renderizado).
 */
export const useScrollReveal = () => {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const viewportBottom = window.innerHeight;
    // Só anima o que ainda não está na tela; acima da dobra pinta direto.
    const elements = Array.from(
      document.querySelectorAll<HTMLElement>('.animate-on-scroll'),
    ).filter((el) => el.getBoundingClientRect().top >= viewportBottom);

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fadeSlideIn');
            observer.unobserve(entry.target);
          }
        });
      },
      { root: null, rootMargin: '0px', threshold: 0.1 },
    );

    elements.forEach((el) => observer.observe(el));

    return () => {
      elements.forEach((el) => observer.unobserve(el));
      observer.disconnect();
    };
  }, []);
};
