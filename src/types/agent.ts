export interface Agent {
  id: string;
  name: string;
  description: string;
  image: string;
  rating: number;
  reviews: number;
  isFeatured: boolean;
  isTrending: boolean;
} 