import { create } from "zustand";

interface MapState {
  position: { x: number; y: number };
  zoom: number;
  setPosition: (pos: { x: number; y: number }) => void;
  setZoom: (zoom: number) => void;
  setTransform: (pos: { x: number; y: number }, zoom: number) => void;
}

export const useMapStore = create<MapState>((set) => ({
  position: { x: 0, y: 0 },
  zoom: 1,
  setPosition: (pos) => set({ position: pos }),
  setZoom: (zoom) => set({ zoom }),
  setTransform: (pos, zoom) => set({ position: pos, zoom }),
}));
