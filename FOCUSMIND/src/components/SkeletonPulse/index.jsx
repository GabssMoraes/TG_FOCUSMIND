import React from 'react';
import styles from './styles.module.css';

/**
 * SkeletonPulse — Placeholder de carregamento com brilho varredor
 *
 * Uso básico:
 *   <SkeletonPulse width="100%" height={20} radius={8} />
 *
 * Uso em bloco (múltiplos):
 *   <SkeletonPulse.Group>
 *     <SkeletonPulse height={200} radius={16} />
 *     <SkeletonPulse height={20} width="60%" />
 *     <SkeletonPulse height={16} width="40%" />
 *   </SkeletonPulse.Group>
 */
function SkeletonPulse({ width = '100%', height = 16, radius = 8, style = {} }) {
    return (
        <div
            className={styles.skeleton}
            style={{
                width,
                height,
                borderRadius: radius,
                ...style,
            }}
            aria-hidden="true"
        >
            <div className={styles.shimmer} />
        </div>
    );
}

// ── Presets prontos para uso comum ─────────────────────────────────────────

SkeletonPulse.Card = function SkeletonCard() {
    return (
        <div className={styles.skeletonCard}>
            <SkeletonPulse height={180} radius={14} />
            <div className={styles.skeletonBody}>
                <SkeletonPulse height={20} width="55%" />
                <SkeletonPulse height={14} />
                <SkeletonPulse height={14} width="75%" />
                <SkeletonPulse height={38} radius={10} />
            </div>
        </div>
    );
};

SkeletonPulse.Row = function SkeletonRow({ lines = 3 }) {
    return (
        <div className={styles.skeletonRow}>
            <SkeletonPulse width={40} height={40} radius={12} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {Array.from({ length: lines }).map((_, i) => (
                    <SkeletonPulse key={i} height={14} width={i === lines - 1 ? '60%' : '100%'} />
                ))}
            </div>
        </div>
    );
};

SkeletonPulse.Group = function SkeletonGroup({ children }) {
    return <div className={styles.skeletonGroup}>{children}</div>;
};

export default SkeletonPulse;
