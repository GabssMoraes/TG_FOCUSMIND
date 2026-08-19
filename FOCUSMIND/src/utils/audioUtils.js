export const playSuccessSound = () => {
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;

        const ctx = new AudioContext();
        
        // Oscilador 1 (Nota mais grave)
        const osc1 = ctx.createOscillator();
        const gainNode1 = ctx.createGain();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        osc1.connect(gainNode1);
        gainNode1.connect(ctx.destination);
        
        // Oscilador 2 (Nota mais aguda)
        const osc2 = ctx.createOscillator();
        const gainNode2 = ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1); // E5
        osc2.connect(gainNode2);
        gainNode2.connect(ctx.destination);

        // Envelope Osc 1
        gainNode1.gain.setValueAtTime(0, ctx.currentTime);
        gainNode1.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 0.05);
        gainNode1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

        // Envelope Osc 2
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

        // Arpejo de moedas
        const now = ctx.currentTime;
        osc.frequency.setValueAtTime(523.25, now);
        osc.frequency.setValueAtTime(659.25, now + 0.1);
        osc.frequency.setValueAtTime(783.99, now + 0.2);
        osc.frequency.setValueAtTime(1046.50, now + 0.3); // C6

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.3, now + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);

        osc.start(now);
        osc.stop(now + 0.6);
    } catch (e) {
        console.warn("Erro ao tocar som do baú: ", e);
    }
};
