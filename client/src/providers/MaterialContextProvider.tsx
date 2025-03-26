import React, { useState, useMemo, useEffect, ReactNode } from "react";
import Material from "@/interfaces/Material";
import { DroppedMaterial } from "@/interfaces/DroppedMaterial";
import { MaterialContext, MaterialContextType } from "@/contexts/MaterialContext";
import { useCurrentMember } from "@/contexts/CurrentMemberContext";
import { deleteMaterial, getMaterials, insertMaterial } from "@/api/material";

// API 호출 함수는 insertMaterial, deleteMaterial, getMaterials를 그대로 사용합니다.

export const MaterialProvider = ({ children }: { children: ReactNode }) => {
  const { currentMember } = useCurrentMember();
  const [mainMaterials, setMainMaterials] = useState<Material[]>([]);
  const [draggedMaterials, setDraggedMaterials] = useState<DroppedMaterial[]>([]);

  // 재료 목록을 API에서 받아오는 함수 (Material 배열)
  const fetchMainMaterials = async () => {
    try {
      const materials = await getMaterials();
      setMainMaterials(materials);
      console.log("Fetched mainMaterials:", materials);
    } catch (error) {
      console.error("Failed to fetch main materials:", error);
    }
  };

  useEffect(() => {
    console.log("실행");
    fetchMainMaterials();
  }, []);

  const updateDraggedMaterials = async () => {
    setDraggedMaterials((prev) => {
      const updated = prev.map((dm) => {
        const draggedName = dm.material.name?.trim().toLowerCase() || "";
        const match = mainMaterials.find(
          (m) => (m.name?.trim().toLowerCase() || "") === draggedName
        );
        if (match) {
          console.log("Overwriting dragged material:", dm.material.name, "with", match);
          return { ...dm, material: match };
        }
        return dm;
      });
      console.log("Updated draggedMaterials:", updated);
      return updated;
    });
  }

  const addDraggedMaterial = async (material: Material, x: number, y: number) => {
    if (!currentMember) return;
    console.log("멤버있음: " + currentMember);
    await insertMaterial(material, currentMember.member_id);
    console.log("insert 실행");
    // draggedMaterials에 추가
    setDraggedMaterials((prev) => [...prev, { material, x, y }]);
    console.log("재료갱신시작");
    // API 호출 후 재료 목록을 갱신
    await fetchMainMaterials();
    await updateDraggedMaterials();
  };

  const removeDraggedMaterial = async (materialId: string) => {
    if (!currentMember) return;
    const comment = await deleteMaterial(materialId, currentMember.member_id);
    setDraggedMaterials((prev) =>
      prev.filter((item) => item.material.ingredient_id !== materialId)
    );
    await fetchMainMaterials();
    return comment;
  };

  const value: MaterialContextType = useMemo(
    () => ({
      mainMaterials,
      draggedMaterials,
      addDraggedMaterial,
      removeDraggedMaterial,
      fetchMainMaterials,
    }),
    [mainMaterials, draggedMaterials]
  );

  return (
    <MaterialContext.Provider value={value}>
      {children}
    </MaterialContext.Provider>
  );
};

export default MaterialProvider;
