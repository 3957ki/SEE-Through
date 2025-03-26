import Material from "@/interfaces/Material";
import { APIServerFetcher } from "@/lib/fetchers";

export async function getMaterials(): Promise<Material[]> {
  const response = await APIServerFetcher.get("/ingredients?page=1&size=100&sortBy=inboundAt&sortDirection=ASC");
  return response.data.content;
}

export async function insertMaterial(material: Material, memberId: string): Promise<void> {
  return APIServerFetcher.post(`/ingredients`, {
    member_id: memberId,
    inbound_ingredient_request_list: [material]
  });

};
  
export async function deleteMaterial(materialId: string, memberId: string): Promise<string> {
  const response = await APIServerFetcher.delete(`/ingredients`, {
      data: {
      member_id: memberId,
      ingredient_id_list: [materialId],
    },
  });
  return response.data.content;
};