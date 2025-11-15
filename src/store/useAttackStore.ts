import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AttackResult } from "../types/game";

interface AttackStore {
  fronteiras: string[];
  setFronteiras: (fronteiras: string[]) => void;

  atacanteId: number | null;
  defensorId: number | null;
  attackDiceCount: number | null;
  attackTroops: number | null;
  defenseTroops: number | null;
  lastAttackResult: AttackResult | null;
  showDiceAnimation: boolean;
  pendingAttackResult: AttackResult | null;
  
  setAtacanteId: (id: number | null) => void;
  setDefensorId: (id: number | null) => void;
  setAttackDiceCount: (count: number | null) => void;
  setAttackTroops: (id: number | null) => void;
  setDefenseTroops: (id: number | null) => void;
  setLastAttackResult: (result: AttackResult | null) => void;
  setShowDiceAnimation: (show: boolean) => void;
  setPendingAttackResult: (result: AttackResult | null) => void;
  resetTroops: () => void;

  resetAttack: () => void;
}

export const useAttackStore = create<AttackStore>()(
  persist(
    (set) => ({
      fronteiras: [],
      atacanteId: null,
      defensorId: null,
      attackDiceCount: null,
      attackTroops: null,
      defenseTroops: null,
      lastAttackResult: null,
      showDiceAnimation: false,
      pendingAttackResult: null,
      
      setFronteiras: (fronteiras) => set(() => ({ fronteiras })),
      setAtacanteId: (id) => set(() => ({ atacanteId: id })),
      setDefensorId: (id) => set(() => ({ defensorId: id })),
      setAttackDiceCount: (count) => set(() => ({ attackDiceCount: count })),
      setAttackTroops: (troops) => set(() => ({ attackTroops: troops })),
      setDefenseTroops: (troops) => set(() => ({ defenseTroops: troops })),
      setLastAttackResult: (result) => set(() => ({ lastAttackResult: result })),
      setShowDiceAnimation: (show) => set(() => ({ showDiceAnimation: show })),
      setPendingAttackResult: (result) => set(() => ({ pendingAttackResult: result })),
      resetTroops: () => set(() => ({ attackTroops: null, defenseTroops: null })),
      resetAttack: () =>
        set(() => ({
          fronteiras: [],
          atacanteId: null,
          defensorId: null,
          attackDiceCount: null,
          lastAttackResult: null,
          showDiceAnimation: false,
          pendingAttackResult: null,
          attackTroops:null,
          defenseTroops:null
        })),
    }),
    {
      name: "attack-store",
      partialize: (state) => ({
        fronteiras: state.fronteiras,
        atacanteId: state.atacanteId,
        defensorId: state.defensorId,
        attackDiceCount: state.attackDiceCount,
        attackTroops: state.attackTroops,
        defenseTroops: state.defenseTroops
      }),
    }
  )
);
