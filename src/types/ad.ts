export interface Ad {
  id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  categoryId: string;
  subCategoryId?: string;
  userId: string;
  photos: string[];
  video?: string;
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  amenities: string[];
  isActive: boolean;
  isAvailable: boolean;
  views?: number;
  createdAt: string;
  updatedAt: string;
}