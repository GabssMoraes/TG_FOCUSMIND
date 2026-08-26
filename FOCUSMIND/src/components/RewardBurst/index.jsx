import React, { useRef, useEffect, useImperativeHandle, forwardRef } from 'react';

/**
 * RewardBurst — Partículas físicas via Canvas API
 *
 * Uso:
 *   const burstRef = useRef();
 *   <RewardBurst ref={burstRef} />
 *   // Quando concluir meta ou pomodoro:
 *   burstRef.current?.fire(x, y); // x,y = coordenadas absolutas na tela
 *   // ou passando o evento do botão:
 *   burstRef.current?.fireFromEvent(e);
 */

class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.size = 4 + Math.random() * 6;
        this.speedX = (Math.random() - 0.5) * 14;
        this.speedY = -(Math.random() * 12 + 4);  // sempre para cima
        this.gravity = 0.45;
        this.friction = 0.97;
        this.alpha = 1;
        this.decay = 0.015 + Math.random() * 0.01;
        this.shape = Math.random() > 0.5 ? 'circle' : 'rect';
        this.rotation = Math.random() * Math.PI * 2;
        this.rotSpeed = (Math.random() - 0.5) * 0.2;
    }

    update() {
        this.speedX *= this.friction;
        this.speedY += this.gravity;
        this.x += this.speedX;
        this.y += this.speedY;
        this.alpha -= this.decay;
        this.rotation += this.rotSpeed;
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = Math.max(0, this.alpha);
        ctx.fillStyle = this.color;
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);

        if (this.shape === 'circle') {
            ctx.beginPath();
            ctx.arc(0, 0, this.size / 2, 0, Math.PI * 2);
            ctx.fill();
        } else {
            ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size * 0.5);
        }
        ctx.restore();
    }

    isDead() {
        return this.alpha <= 0;
    }
}

const COLORS = [
    '#7c6cfa', '#4ecdc4', '#f7c59f', '#ff6b6b',
    '#ffd700', '#fff', '#a89cf7', '#7ee8a2',
];

const RewardBurst = forwardRef(function RewardBurst(_, ref) {
    const canvasRef = useRef(null);
    const particlesRef = useRef([]);
    const rafRef = useRef(null);

    const startLoop = () => {
        if (rafRef.current) return; // já está rodando

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        const loop = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            particlesRef.current = particlesRef.current.filter(p => {
                p.update();
                p.draw(ctx);
                return !p.isDead();
            });

            if (particlesRef.current.length > 0) {
                rafRef.current = requestAnimationFrame(loop);
            } else {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                rafRef.current = null;
            }
        };

        rafRef.current = requestAnimationFrame(loop);
    };

    // Resize canvas to window size
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        resize();
        window.addEventListener('resize', resize);
        return () => window.removeEventListener('resize', resize);
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, []);

    useImperativeHandle(ref, () => ({
        // fire(x, y): dispara partículas em coordenadas absolutas de tela
        fire(x, y, count = 60) {
            for (let i = 0; i < count; i++) {
                const color = COLORS[Math.floor(Math.random() * COLORS.length)];
                particlesRef.current.push(new Particle(x, y, color));
            }
            startLoop();
        },

        // fireFromEvent(e): usa a posição do click/pointer para disparar
        fireFromEvent(e, count = 60) {
            const x = e.clientX ?? (e.touches?.[0]?.clientX ?? window.innerWidth / 2);
            const y = e.clientY ?? (e.touches?.[0]?.clientY ?? window.innerHeight / 2);
            this.fire(x, y, count);
        },

        // fireFromElement(el): usa o centro de um elemento DOM
        fireFromElement(el, count = 60) {
            if (!el) return;
            const rect = el.getBoundingClientRect();
            this.fire(rect.left + rect.width / 2, rect.top + rect.height / 2, count);
        },
    }));

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'fixed',
                inset: 0,
                pointerEvents: 'none',
                zIndex: 9999,
            }}
            aria-hidden="true"
        />
    );
});

export default RewardBurst;
