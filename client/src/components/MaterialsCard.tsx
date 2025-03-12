import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/main-card";

interface Material {
  id: string;
  name?: string;
  image?: string;
}

interface MaterialBlockProps {
  material: Material;
}

interface MaterialsCardProps {
  materials: Material[];
}

function MaterialBlock({ material }: MaterialBlockProps) {
  return (
    <div className="aspect-square bg-white rounded-md overflow-hidden">
      <img
        src={material.image ?? "/placeholder.svg"}
        alt={material.name ?? "Material image"}
        className="w-full h-full object-cover"
      />
    </div>
  );
}

function MaterialsCard({ materials }: MaterialsCardProps) {
  const MAX_MATERIALS = 10;

  return (
    <Card>
      <CardHeader>
        <CardTitle>재료 목록</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-5 gap-1">
          {materials
            ?.slice(0, MAX_MATERIALS)
            .map((material) => <MaterialBlock key={material.id} material={material} />)}
        </div>
      </CardContent>
    </Card>
  );
}

export default MaterialsCard;
