import { create } from "zustand";

interface AttackAnimationState {
  isAnimating: boolean;
  attackerPosition: { x: number; y: number } | null;
  defenderPosition: { x: number; y: number } | null;
  mapTransform: { x: number; y: number; zoom: number } | null;
  animationCount: number; // Contador para forçar re-render
  startAttackAnimation: (
    attackerPos: { x: number; y: number },
    defenderPos: { x: number; y: number },
    mapTransform?: { x: number; y: number; zoom: number }
  ) => void;
  stopAttackAnimation: () => void;
}

export const useAttackAnimationStore = create<AttackAnimationState>((set) => ({
  isAnimating: false,
  attackerPosition: null,
  defenderPosition: null,
  mapTransform: null,
  animationCount: 0,
  startAttackAnimation: (attackerPos, defenderPos, mapTransform) => {
    console.log("🎬 startAttackAnimation called:", { attackerPos, defenderPos, mapTransform });
    set((state) => ({
      isAnimating: true,
      attackerPosition: attackerPos,
      defenderPosition: defenderPos,
      mapTransform: mapTransform || null,
      animationCount: state.animationCount + 1, // Incrementa contador
    }));
    // ⏱️ Duração mínima de 2 segundos para garantir visualização completa
    setTimeout(() => {
      console.log("⏹️ Animation timeout - stopping animation");
      set({
        isAnimating: false,
        attackerPosition: null,
        defenderPosition: null,
        mapTransform: null,
        // Mantém animationCount para permitir nova animação
      });
    }, 2000);
  },
  stopAttackAnimation: () => {
    console.log("🛑 stopAttackAnimation called");
    set({
      isAnimating: false,
      attackerPosition: null,
      defenderPosition: null,
      mapTransform: null,
      // Mantém animationCount
    });
  },
}));
