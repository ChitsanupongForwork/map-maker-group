export type PinCategoryId =
  | "food"
  | "culture"
  | "nature"
  | "work"
  | "idea";

export type Location = {
  id: string;
  name: string;
  category: PinCategoryId;
  note: string;
  lat: number;
  lng: number;
  color: string;
  createdAt: string;
};

export type PinDraft = Pick<Location, "name" | "category" | "note">;

export type MapPoint = Pick<Location, "lat" | "lng">;
