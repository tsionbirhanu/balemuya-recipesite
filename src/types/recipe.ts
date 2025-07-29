export type Recipe = {
  id: string;
  title: string;
  imageUrl: string;
  category: { name: string };
};

export type RecipeDetail = {
  title: string;
  imageUrl: string;
  createdAt: string;
  category: { name: string };
  ingredients: { list: { ingredients: { ingredient: string; quantity: number;  unit: string }[] } }[];
  instructions: { step: { instructions: { step: number; action: string }[] } }[];
  reviews: {
    comment: string;
    rating: number;
    createdAt: string;
    user: { name: string; imageUrl: string };
  }[];
};
