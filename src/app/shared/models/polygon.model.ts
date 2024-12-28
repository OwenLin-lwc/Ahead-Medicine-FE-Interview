export type PolygonItem = {
  id: string;
  label: string;
  data: PolygonPosition[];
  color: string;
  display: boolean;
};

export type PolygonPosition = { x: number; y: number };
