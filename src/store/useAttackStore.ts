import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AttackStore {
  fronteiras: string[];
  setFronteiras: (fronteiras: string[]) => void;

  atacanteId: number | null;
  defensorId: number | null;
  attackDiceCount: number | null;
  setAtacanteId: (id: number | null) => void;
  setDefensorId: (id: number | null) => void;
  setAttackDiceCount: (count: number | null) => void;
  resetAttack: () => void;
}

export const useAttackStore = create<AttackStore>()(
  persist(
    (set) => ({
      fronteiras: [],
      atacanteId: null,
      defensorId: null,
      attackDiceCount: null,
      setFronteiras: (fronteiras) => set(() => ({ fronteiras })),
      setAtacanteId: (id) => set(() => ({ atacanteId: id })),
      setDefensorId: (id) => set(() => ({ defensorId: id })),
      setAttackDiceCount: (count) => set(() => ({ attackDiceCount: count })),
      resetAttack: () =>
        set(() => ({
          fronteiras: [],
          atacanteId: null,
          defensorId: null,
          attackDiceCount: null,
        })),
    }),
    {
      name: "attack-store",
      partialize: (state) => ({
        fronteiras: state.fronteiras,
        atacanteId: state.atacanteId,
        defensorId: state.defensorId,
        attackDiceCount: state.attackDiceCount,
      }),
    }
  )
);
