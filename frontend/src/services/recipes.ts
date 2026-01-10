import api from "./api"
import type { Recipe } from "../types/recipe"
import type { RecipeDetailResponse } from "../types/recipeDetailResponse"
import type { Tag } from "../types/tag"

export async function getRecipes(): Promise<Recipe[]> {
  const res = await api.get("/recipes", { requiresAuth: true })
  return res.data
}

export type CreateRecipePayload = {
  title: string
  description?: string
  ingredients: [
    {
      name: string,
      amount: number | null,
      unit: string
    }
  ]
  difficulty: string,
  procedure: string,
  timeRequired: number
}

export async function createRecipe(payload: CreateRecipePayload) {
  const res = await api.post("/recipes", payload, { requiresAuth: true })
  return res.data
}

export async function getLatestRecipes() {
  const res = await api.get("/recipes/latest")
  return Array.isArray(res.data) ? res.data : []
}

export async function getRecipeTags(recipeId: string): Promise<Tag[]> {
  const res = await api.get(`/recipes/${recipeId}/tags`, { requiresAuth: true })
  return res.data
}

export async function getRecipeImageUploadUrl(
  recipeId: string,
  mode: "create" | "update" = "create"
) {
  const params = new URLSearchParams({ mode })

  const res = await api.post(
    `/recipes/${recipeId}/image/upload-url?${params.toString()}`,
    {},
    { requiresAuth: true }
  )

  return res.data
}

export async function getRecipeById(
  recipeId: string
): Promise<RecipeDetailResponse> {
  const res = await api.get(`/recipes/${recipeId}`, { requiresAuth: true })
  return res.data
}


export async function getRecipeImage(
  recipeId: string
): Promise<{ image_url: string | null }> {
  const res = await api.get(`/recipes/${recipeId}/image`, { requiresAuth: true })
  return res.data
}

export type UpdateRecipePayload = {
  title: string
  description?: string
  ingredients: [
    {
      name: string,
      amount: number | null,
      unit: string
    }
  ]
  difficulty: string,
  procedure: string,
  timeRequired: number
}

export async function updateRecipe(
  recipeId: string,
  payload: UpdateRecipePayload
) {
  const res = await api.put(`/recipes/${recipeId}`, payload, { requiresAuth: true })
  return res.data
}

export async function deleteRecipe(
  recipeId: string
) {
  const res = await api.delete(`/recipes/${recipeId}`, { requiresAuth: true })
  return res.data
}