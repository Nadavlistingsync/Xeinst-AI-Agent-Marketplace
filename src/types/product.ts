import { JsonValue } from './json';
import { ProductStatus, ProductAccessLevel, ProductLicenseType } from '@prisma/client';

export interface Product {
  id: string;
  name: string;
  description: string;
  fileUrl: string;
  rating: number;
  downloadCount: number;
  requirements: string[];
  longDescription?: string;
  price: number;
  category: string;
  tags: string[];
  version: string;
  status: ProductStatus;
  accessLevel: ProductAccessLevel;
  licenseType: ProductLicenseType;
  environment: string;
  framework: string;
  modelType: string;
  createdBy: string;
  earningsSplit: number;
  isPublic: boolean;
  uploadedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductWithDetails extends Product {
  reviews: Array<{
    id: string;
    rating: number;
    comment: string | null;
    createdAt: Date;
    user: {
      name: string | null;
      email: string | null;
      image: string | null;
    };
  }>;
  metrics: {
    totalRatings: number;
    averageRating: number;
    downloadCount: number;
  };
}

export interface CreateProductInput {
  name: string;
  description: string;
  price: number;
  category: string;
  environment: string;
  framework: string;
  modelType: string;
  isPublic: boolean;
  version: string;
  tags: string[];
  earningsSplit: number;
  createdBy: string;
  images: string[];
  requirements: string[];
  metadata?: JsonValue;
}

export interface UpdateProductInput {
  name?: string;
  description?: string;
  price?: number;
  category?: string;
  environment?: string;
  framework?: string;
  modelType?: string;
  isPublic?: boolean;
  version?: string;
  tags?: string[];
  earningsSplit?: number;
  images?: string[];
  requirements?: string[];
  metadata?: JsonValue;
} 