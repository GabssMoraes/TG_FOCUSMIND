import { useRef, useCallback } from 'react';

/**
 * useTilt — Hook de efeito 3D magnético nos cards
 *
 * Uso:
 *   const tilt = useTilt();
 *   <div {...tilt.props} className={styles.card}>...</div>
 *
 * Ele injeta 3 variáveis CSS no elemento:
 *   --rx  (rotação X em graus)
 *   --ry  (rotação Y em graus)
 *   --gx  (posição X do brilho em %)
 *   --gy  (posição Y do brilho em %)
 */
export function useTilt(options = {}) {
    const {
        maxTilt = 12,       // graus máximos de inclinação
        glowOpacity = 0.15, // opacidade do brilho
        scale = 1.03,       // escala ao hover
        speed = 400,        // ms da transição de retorno
    } = options;

    const ref = useRef(null);
    const rafRef = useRef(null);

    const onMouseMove = useCallback((e) => {
        const el = ref.current;
        if (!el) return;

        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        rafRef.current = requestAnimationFrame(() => {
            const rect = el.getBoundingClientRect();
            const cx = rect.left + rect.width / 2;
            const cy = rect.top + rect.height / 2;
            const dx = e.clientX - cx;
            const dy = e.clientY - cy;

            // Normaliza para [-1, 1]
            const nx = dx / (rect.width / 2);
            const ny = dy / (rect.height / 2);

            // Rotação: eixo Y inverte esq/dir, eixo X inverte cima/baixo
            const ry =  nx * maxTilt;
            const rx = -ny * maxTilt;

            // Posição do brilho em %
            const gx = ((dx / rect.width)  + 0.5) * 100;
            const gy = ((dy / rect.height) + 0.5) * 100;

            el.style.transition = 'transform 0.05s ease-out';
            el.style.transform = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg) scale(${scale})`;
            el.style.setProperty('--gx', `${gx}%`);
            el.style.setProperty('--gy', `${gy}%`);
            el.style.setProperty('--glow-opacity', glowOpacity.toString());
        });
    }, [maxTilt, glowOpacity, scale]);

    const onMouseLeave = useCallback(() => {
        const el = ref.current;
        if (!el) return;
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        el.style.transition = `transform ${speed}ms cubic-bezier(0.23,1,0.32,1)`;
        el.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) scale(1)';
        el.style.setProperty('--glow-opacity', '0');
    }, [speed]);

    return {
        ref,
        props: {
            ref,
            onMouseMove,
            onMouseLeave,
            // Garante que o card tenha o brilho renderizável via CSS
            'data-tilt': true,
        },
    };
}

/**
 * CSS recomendado para o elemento com data-tilt:
 *
 * [data-tilt] {
 *   transform-style: preserve-3d;
 *   will-change: transform;
 *   position: relative;
 *   overflow: hidden; (opcional)
 * }
 *
 * [data-tilt]::after {
 *   content: '';
 *   position: absolute;
 *   inset: 0;
 *   background: radial-gradient(
 *     circle at var(--gx, 50%) var(--gy, 50%),
 *     rgba(255,255,255,0.18) 0%,
 *     transparent 60%
 *   );
 *   opacity: var(--glow-opacity, 0);
 *   transition: opacity 0.3s;
 *   pointer-events: none;
 *   border-radius: inherit;
 *   z-index: 1;
 * }
 */
