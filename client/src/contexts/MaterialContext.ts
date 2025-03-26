import { createContext, useContext } from "react";
import Material from "@/interfaces/Material";
import { DroppedMaterial } from "@/interfaces/DroppedMaterial";

export interface MaterialContextType {
  mainMaterials: Material[];           // API로 받아온 재료 + 드래그로 추가된 재료
  draggedMaterials: DroppedMaterial[]; // Showcase에서 드래그된 재료들
  addDraggedMaterial: (material: Material, x: number, y: number) => Promise<void>;
  removeDraggedMaterial: (materialId: string) => Promise<string | undefined>;
  fetchMainMaterials: () => Promise<void>;  
}

export const MaterialContext = createContext<MaterialContextType | null>(null);

export const useMaterialContext = () => {
  const context = useContext(MaterialContext);
  if (!context) {
    throw new Error("useMaterialContext must be used within a MaterialProvider");
  }
  return context;
};
