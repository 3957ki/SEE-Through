import React, { useState, useMemo, useEffect, ReactNode } from "react";
import Material from "@/interfaces/Material";
import { DroppedMaterial } from "@/interfaces/DroppedMaterial";
import { MaterialContext, MaterialContextType } from "@/contexts/MaterialContext";
import { APIServerFetcher } from "@/lib/fetchers";
import { useCurrentMember } from "@/contexts/CurrentMemberContext";


const callInsertAPI = async (material: Material) => {
  return APIServerFetcher.post("/ingredients", material);
};

const callDeleteAPI = async (materialId: string, memberId: string) => {
  return APIServerFetcher.delete(`/ingredients`, {
    data: {
      member_id: memberId,
      ingredient_id_list: [materialId],
    },
  });
};

export const MaterialProvider = ({ children }: { children: ReactNode }) => {
  const { currentMember } = useCurrentMember();
  const [mainMaterials, setMainMaterials] = useState<Material[]>([]);
  const [draggedMaterials, setDraggedMaterials] = useState<DroppedMaterial[]>([]);

  const fetchMainMaterials = async () => {
    try {
      const response = await APIServerFetcher.get("/ingredients?page=1&size=10&sortBy=inboundAt&sortDirection=ASC");
      const materials = response.data.content;
      setMainMaterials(materials);
    } catch (error) {
      console.error("Failed to fetch main materials:", error);
    }
  };

  useEffect(() => {
    fetchMainMaterials();
  }, []);

  const addDraggedMaterial = async (material: Material, x: number, y: number) => {
    await callInsertAPI(material);
    setDraggedMaterials((prev) => [...prev, { material, x, y }]);
    await fetchMainMaterials();
  };
  
  const removeDraggedMaterial = async (materialId: string) => {
    if (!currentMember) return;
    await callDeleteAPI(materialId, currentMember.member_id);
    setDraggedMaterials((prev) =>
      prev.filter((item) => item.material.ingredient_id !== materialId)
    );
    await fetchMainMaterials();
  };
  

  const value: MaterialContextType = useMemo(
    () => ({
      mainMaterials,
      draggedMaterials,
      addDraggedMaterial,
      removeDraggedMaterial,
      fetchMainMaterials,  // 추가
    }),
    [mainMaterials, draggedMaterials]
  );

  return (
    <MaterialContext value={value}>
      {children}
    </MaterialContext>
  );
};

export default MaterialProvider;
