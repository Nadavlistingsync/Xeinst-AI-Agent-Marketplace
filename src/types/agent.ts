export interface Agent {
  id: string;
  name: string;
  description: string;
  status: string;
  metadata: any;
  createdAt: Date;
  updatedAt: Date;
  image?: string;
  rating?: number;
  reviews?: number;
  isFeatured?: boolean;
  isTrending?: boolean;
  user?: {
    id: string;
    email: string;
    name: string;
  };
} 