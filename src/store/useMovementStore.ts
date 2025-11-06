import { create } from "zustand";
import { persist } from "zustand/middleware";

interface MovementStore {
  fronteiras: string[];
  setFronteiras: (fronteiras: string[]) => void;

  sourceTerritoryId: number | null;
  targetTerritoryId: number | null;
  moveCount: number | null;
  setSourceId: (id: number | null) => void;
  setTargetId: (id: number | null) => void;
  setMoveCount: (count: number | null) => void;
  resetMove: () => void;
}

export const useMovementStore = create<MovementStore>()(
  persist(
    (set) => ({
      fronteiras: [],
      sourceTerritoryId: null,
      targetTerritoryId: null,
      moveCount: null,
      setFronteiras: (fronteiras) => set(() => ({ fronteiras })),
      setSourceId: (id) => set(() => ({ sourceTerritoryId: id })),
      setTargetId: (id) => set(() => ({ targetTerritoryId: id })),
      setMoveCount: (count) => set(() => ({ moveCount: count })),
      resetMove: () =>
        set(() => ({
          fronteiras: [],
          sourceTerritoryId: null,
          targetTerritoryId: null,
          moveCount: null,
        })),
    }),
    {
      name: "move-store",
      partialize: (state) => ({
        fronteiras: state.fronteiras,
        sourceTerritoryId: state.sourceTerritoryId,
        targetTerritoryId: state.targetTerritoryId,
        moveCount: state.moveCount,
      }),
    }
  )
);
