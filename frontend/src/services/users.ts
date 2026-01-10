import api from "./api"
import type { Recipe } from "../types/recipe"

export async function getMe() {
  const res = await api.get("/me", { requiresAuth: true })
  return res.data
}

export async function updateMe(payload: {
  name?: string
  surname?: string
  nickname?: string
}) {
  const res = await api.put("/me", payload, { requiresAuth: true })
  return res.data
}

export async function getProfileImageUploadUrl(mimeType: string) {
  const res = await api.post("/me/profile-image/upload-url", {
    mime_type: mimeType
  }, { requiresAuth: true })
  return res.data
}

export async function getProfileImage(): Promise<string | null> {
  try {
    const res = await api.get("/me/profile-image", { requiresAuth: true })
    return res.data?.url ?? null
  } catch (err: any) {
    if (err.response?.status === 404) {
      return null
    }
    throw err
  }
}

export async function searchUsers(query: string) {
  const res = await api.get("/users/search", {
    params: { q: query }
  })
  return res.data
}

export async function getUserPublicProfile(userId: string) {
  const res = await api.get(`/users/${userId}`)
  return res.data
}

export async function getUserByNickname(nickname: string) {
  const normalized = nickname.trim().toLowerCase()
  if (!normalized) {
    throw new Error("nickname vuoto")
  }
  try {
    const res = await api.get("/users/search", {
      params: { q: normalized }
    })
    return res.data
  } catch (err: any) {
    if (err.response?.status === 404) {
      return null
    }
    throw err
  }
}

export async function getNicknameByUserId(userId: string): Promise<string> {
  const res = await api.get(`/users/${userId}`)
  return res.data?.nickname
}

export async function getUserRecipes(userId: string): Promise<Recipe[]> {
  const res = await api.get(`/users/${userId}/recipes`)
  return res.data
}

export async function getUserProfileImage(userId: string) {
  const res = await api.get(`/users/${userId}/profile-image`)
  return res.data.image_url as string
}
