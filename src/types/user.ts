// 
// types/user.ts
export interface Recipe {
    id: string
    title: string
    imageUrl?: string
  }
  
  export interface Favorite {
    id: number
    recipe: Recipe
  }
  
  export interface UserProfile {
    id: number
    name: string | null
    email: string
    favorites?: Favorite[]
  }

