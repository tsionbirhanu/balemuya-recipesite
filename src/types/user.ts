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

  // For better type safety, consider updating your interfaces:
interface User {
  id: number
  name: string
  email: string
  role: 'admin' | 'user' // or whatever roles you have
  // isAdmin?: boolean // remove if not used
}