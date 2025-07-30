export type Category = {
  id: string;
  name: string;
  imageUrl?: string;
};

export type Recipe = {
  id: string;
  title: string;
  imageUrl: string;
  category: { name: string };
  createdAt?: string;
};

export type RecipeDetail = {
  id: string;
  title: string;
  imageUrl: string;
  createdAt: string;
  category: { name: string };
  ingredients: { list: { ingredients: { ingredient: string; quantity: number;  unit: string }[] } }[];
  instructions: { step: { instructions: { step: number; action: string }[] } }[];
  reviews: {
    id: string; 
    comment: string;
    rating: number;
    createdAt: string;
    user: { id: string; name: string; imageUrl: string };
  }[];
  // Add to RecipeDetail type
 creator?: {
    id: string;
    name: string;
    imageUrl?: string;
};
};
