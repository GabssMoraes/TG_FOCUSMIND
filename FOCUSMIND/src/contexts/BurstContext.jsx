import { createContext, useContext, useRef } from 'react';
import RewardBurst from '../components/RewardBurst';

const BurstContext = createContext(null);

/**
 * BurstProvider — Envolva o app inteiro com esse provider.
 * Qualquer componente pode usar useBurst() para disparar partículas.
 */
export function BurstProvider({ children }) {
    const burstRef = useRef();

    return (
        <BurstContext.Provider value={burstRef}>
            <RewardBurst ref={burstRef} />
            {children}
        </BurstContext.Provider>
    );
}

/**
 * Hook para usar o RewardBurst de qualquer lugar:
 *
 * const burst = useBurst();
 *
 * // No click de um botão:
 * <button onClick={(e) => { burst.fireFromEvent(e); concluirMeta(); }}>
 *   Concluir
 * </button>
 *
 * // Em coordenadas absolutas:
 * burst.fire(window.innerWidth / 2, window.innerHeight / 3);
 */
export function useBurst() {
    const ref = useContext(BurstContext);
    return ref?.current ?? null;
}
