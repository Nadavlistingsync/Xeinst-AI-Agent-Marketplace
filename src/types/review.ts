import { JsonValue } from './json';

export interface Review {
  id: string;
  userId: string;
  productId: string;
  rating: number;
  comment: string;
  createdAt: Date;
  updatedAt: Date;
  metadata: JsonValue;
}

export interface ReviewWithDetails extends Review {
  user: {
    name: string;
    email: string;
  };
  product: {
    name: string;
    category: string;
  };
}

export interface CreateReviewInput {
  userId: string;
  productId: string;
  rating: number;
  comment: string;
  metadata?: JsonValue;
}

export interface UpdateReviewInput {
  rating?: number;
  comment?: string;
  metadata?: JsonValue;
}

export interface ReviewResponse {
  success: boolean;
  data?: ReviewWithDetails;
  error?: string;
}

export interface ReviewListResponse {
  success: boolean;
  data?: {
    reviews: ReviewWithDetails[];
    total: number;
    page: number;
    pageSize: number;
  };
  error?: string;
} 