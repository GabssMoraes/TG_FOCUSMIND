export const playSuccessSound = () => {
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;

        const ctx = new AudioContext();
        
        const osc1 = ctx.createOscillator();
        const gainNode1 = ctx.createGain();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(523.25, ctx.currentTime);
        osc1.connect(gainNode1);
        gainNode1.connect(ctx.destination);
        
        const osc2 = ctx.createOscillator();
        const gainNode2 = ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1);
        osc2.connect(gainNode2);
        gainNode2.connect(ctx.destination);

        gainNode1.gain.setValueAtTime(0, ctx.currentTime);
        gainNode1.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 0.05);
        gainNode1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

        gainNode2.gain.setValueAtTime(0, ctx.currentTime + 0.1);
        gainNode2.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 0.15);
        gainNode2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

        osc1.start(ctx.currentTime);
        osc1.stop(ctx.currentTime + 0.3);
        osc2.start(ctx.currentTime + 0.1);
        osc2.stop(ctx.currentTime + 0.5);
    } catch (e) {
        console.warn("Erro ao tocar som: ", e);
    }
};

export const playChestSound = () => {
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        const ctx = new AudioContext();
        
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.connect(gain);
        gain.connect(ctx.destination);

        const now = ctx.currentTime;
        osc.frequency.setValueAtTime(523.25, now);
        osc.frequency.setValueAtTime(659.25, now + 0.1);
        osc.frequency.setValueAtTime(783.99, now + 0.2);
        osc.frequency.setValueAtTime(1046.50, now + 0.3);

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.3, now + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);

        osc.start(now);
        osc.stop(now + 0.6);
    } catch (e) {
        console.warn("Erro ao tocar som do baú: ", e);
    }
};

// Som de compra: fanfarra de 4 notas ascendentes
export const playPurchaseSound = () => {
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        const ctx = new AudioContext();

        const notes = [523.25, 659.25, 783.99, 1046.50];
        notes.forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.value = freq;
            osc.connect(gain);
            gain.connect(ctx.destination);

            const t = ctx.currentTime + i * 0.1;
            gain.gain.setValueAtTime(0, t);
            gain.gain.linearRampToValueAtTime(0.35, t + 0.04);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

            osc.start(t);
            osc.stop(t + 0.25);
        });
    } catch (e) {
        console.warn("Erro ao tocar som de compra: ", e);
    }
};

// Som de erro: nota descendente/áspera
export const playErrorSound = () => {
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        const ctx = new AudioContext();

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.connect(gain);
        gain.connect(ctx.destination);

        const now = ctx.currentTime;
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.linearRampToValueAtTime(80, now + 0.3);

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.25, now + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

        osc.start(now);
        osc.stop(now + 0.4);
    } catch (e) {
        console.warn("Erro ao tocar som de erro: ", e);
    }
};
