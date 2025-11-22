import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AttackResult } from "../types/game";

interface AttackStore {
  fronteiras: string[];
  setFronteiras: (fronteiras: string[]) => void;

  atacanteId: number | null;
  defensorId: number | null;
  defensorOriginalPlayerId: number | null; // PlayerId original do defensor antes do ataque
  attackDiceCount: number | null;
  attackTroops: number | null;
  defenseTroops: number | null;
  lastAttackResult: AttackResult | null;
  showDiceAnimation: boolean;
  pendingAttackResult: AttackResult | null;
  attackerDiceValues: number[];
  defenderDiceValues: number[];
  
  setAtacanteId: (id: number | null) => void;
  setDefensorId: (id: number | null) => void;
  setDefensorOriginalPlayerId: (id: number | null) => void;
  setAttackDiceCount: (count: number | null) => void;
  setAttackTroops: (id: number | null) => void;
  setDefenseTroops: (id: number | null) => void;
  setLastAttackResult: (result: AttackResult | null) => void;
  setShowDiceAnimation: (show: boolean) => void;
  setPendingAttackResult: (result: AttackResult | null) => void;
  setAttackerDiceValues: (values: number[]) => void;
  setDefenderDiceValues: (values: number[]) => void;
  resetTroops: () => void;

  resetAttack: () => void;
}

export const useAttackStore = create<AttackStore>()(
  persist(
    (set) => ({
      fronteiras: [],
      atacanteId: null,
      defensorId: null,
      defensorOriginalPlayerId: null,
      attackDiceCount: null,
      attackTroops: null,
      defenseTroops: null,
      lastAttackResult: null,
      showDiceAnimation: false,
      pendingAttackResult: null,
      attackerDiceValues: [],
      defenderDiceValues: [],
      
      setFronteiras: (fronteiras) => set(() => ({ fronteiras })),
      setAtacanteId: (id) => set(() => ({ atacanteId: id })),
      setDefensorId: (id) => set(() => ({ defensorId: id })),
      setDefensorOriginalPlayerId: (id) => set(() => ({ defensorOriginalPlayerId: id })),
      setAttackDiceCount: (count) => set(() => ({ attackDiceCount: count })),
      setAttackTroops: (troops) => set(() => ({ attackTroops: troops })),
      setDefenseTroops: (troops) => set(() => ({ defenseTroops: troops })),
      setLastAttackResult: (result) => set(() => ({ lastAttackResult: result })),
      setShowDiceAnimation: (show) => set(() => ({ showDiceAnimation: show })),
      setPendingAttackResult: (result) => set(() => ({ pendingAttackResult: result })),
      setAttackerDiceValues: (values) => set(() => ({ attackerDiceValues: values })),
      setDefenderDiceValues: (values) => set(() => ({ defenderDiceValues: values })),
      resetTroops: () => set(() => ({ attackTroops: null, defenseTroops: null })),
      resetAttack: () =>
        set(() => ({
          fronteiras: [],
          atacanteId: null,
          defensorId: null,
          defensorOriginalPlayerId: null,
          attackDiceCount: null,
          lastAttackResult: null,
          showDiceAnimation: false,
          pendingAttackResult: null,
          attackTroops:null,
          defenseTroops:null,
          attackerDiceValues: [],
          defenderDiceValues: [],
        })),
    }),
    {
      name: "attack-store",
      partialize: (state) => ({
        fronteiras: state.fronteiras,
        atacanteId: state.atacanteId,
        defensorId: state.defensorId,
        defensorOriginalPlayerId: state.defensorOriginalPlayerId,
        attackDiceCount: state.attackDiceCount,
        attackTroops: state.attackTroops,
        defenseTroops: state.defenseTroops
      }),
    }
  )
);
