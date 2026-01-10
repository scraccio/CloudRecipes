import api from "./api"

export type Review = {
  recipe_id: string
  user_id: string,
  nickname: string,
  rating: number
  comment?: string
  created_at: string,
  user_profile_image?: string
}

export async function getReviews(recipeId: string) {
  const res = await api.get(`/recipes/${recipeId}/reviews`, { requiresAuth: true })
  return res.data
}

export async function postReview(
  recipeId: string,
  rating: number,
  comment?: string
) {
  const res = await api.post(`/recipes/${recipeId}/reviews`, {
    rating,
    comment
  }, { requiresAuth: true })
  return res.data
}
