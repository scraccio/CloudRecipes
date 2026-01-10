export interface Recipe {
  recipe_id: string
  title: string
  description?: string
  ingredients: {
    name: string
    amount?: number
    unit?: string
  }[]
  user_id: string
  rating_count?: number
  rating_sum?: number
  difficulty: string
  procedure: string
  timeRequired: number
}