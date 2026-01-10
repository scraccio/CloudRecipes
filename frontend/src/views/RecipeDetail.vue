<template>
  <div class="flex flex-column flex-centered flex-gap">
    <div v-if="loading">
      <div class="loader-wrapper">
        <div class="spinner"></div>
      </div>
    </div>

    <div v-else-if="error">
      errore nel caricamento ricetta
    </div>

    <div v-else-if="recipe" class="flex flex-column flex-centered big-gap recipe-detail">
      <h1>{{ recipe.title }}</h1>

      <div class="flex horizontal-container">
        <div class="flex flex-column flex-gap inner-container">
          <div class="image-container">
            <img
              v-if="imageUrl"
              :src="imageUrl"
              class="recipe-image box-shadow"
            />
            <img
              v-else
              src="../assets/placeholder.png"
              class="recipe-image box-shadow"
            />
          </div>
          <div class="flex flex-row big-gap flex-centered user-div">
            <img v-if="profileImage"
              class="avatar"
              :src="profileImage"
            />
            <img
              v-else
              src="../assets/placeholder.png"
              class="avatar"
            />
            <h3 class="nickname">
              <i>@{{ nickname }}</i>
            </h3>
            <div class="button primary-cta profile-button" @click="router.push(`/users/${recipe.user_id}`)">
              Vai al profilo
            </div>
          </div>
        </div>
        <div class="flex flex-column inner-container-2 justify-start">
          <h2 v-if="recipe.description">
            DESCRIZIONE
          </h2>
          <p v-if="recipe.description" class="description">
            <i>{{ recipe.description }}</i>
          </p>
          <h2>INGREDIENTI</h2>
          <div class="servings flex flex-gap">
            <span>Porzioni per</span>
            <button class="servings-button" @click="servings > 1 && servings--">−</button>
            <strong>{{ servings }}</strong>
            <button class="servings-button" @click="servings++">+</button>
            <span>{{servings > 1 ? "persone" : "persona"}}:</span>
          </div>
          <div
            v-for="(i, idx) in recipe.ingredients"
            :key="idx"
            class="flex flex-gap"
          >
            <span class="ingredient-name">{{ i.name }}</span>

            <span
              v-if="i.amount"
              class="ingredient-amount"
            >
              {{ i.amount*servings }}{{ i.unit ? ' ' + i.unit : '' }}
            </span>

            <span
              v-else
              class="ingredient-qb"
            >
              q.b.
            </span>
          </div>
          <section v-if="tags.length" class="recipe-tags flex flex-column">
            <h2>TAG</h2>
            <div class="flex flex-row flex-gap">
              <div
                v-for="tag in tags"
                :key="tag.name"
                class="tag-card"
                :class="'tag-' + tag.quality"
                :title="`Confidence: ${tag.confidence}`"
              >
                {{ tag.name }}
              </div>
            </div>
          </section>

          <div v-if="recipe.difficulty != null">
            <h2>DIFFICOLTÀ</h2>
            <p>{{ recipe.difficulty }}</p>
          </div>

          <div v-if="recipe.timeRequired != null">
            <h2>TEMPO DI PREPARAZIONE</h2>
            <p>{{ recipe.timeRequired }} minuti</p>
          </div>
          
          
          <div v-if="recipe.procedure != null">
            <h2>PROCEDIMENTO</h2>
            <p>{{ recipe.procedure }}</p>
          </div>
          
          <h3>
            <span class="star filled">★</span> {{ averageRating }}
            <small>({{ reviews.length }} recensioni)</small>
          </h3>
        </div>

      </div>

      <div class="flex flex-column bigger-gap reviews-container" v-if="reviews.length > 0">
        <div class="flex flex-column flex-gap card" v-for="r in reviews" :key="r.user_id">
          <div class="flex flex-row flex-gap">
            <img v-if="r.user_profile_image" :src="r.user_profile_image" class="avatar-review">
            <img v-else src="../assets/placeholder.png" class="avatar-review" />
            <div class="flex flex-column flex-gap">
              <span class="nickname" @click="router.push(`/users/${r.user_id}`)">@{{ r.nickname }}</span>
              <span>{{ formatDate(r.created_at) }}</span>
            </div>
          </div>
          <div class="stars">
            <span
              v-for="i in 5"
              :key="i"
              class="star"
              :class="{ filled: i <= Math.round(r.rating) }"
            >
              ★
            </span>
          </div>
          <p>{{ r.comment || "—" }}</p>
        </div>
      </div>

      <div v-if="canReview" class="flex flex-column flex-gap flex-centered">
        <h3>Lascia una recensione</h3>

        <div class="flex flex-row flex-gap flex-centered">
          <select class="rating-select" v-model.number="newRating">
            <option disabled value="">Stelle</option>
            <option v-for="n in 5" :key="n" :value="n">{{ n }}</option>
          </select>
          <textarea
            class="comment-textarea"
            v-model="newComment"
            placeholder="Commento (opzionale)"
          />
        </div>

        <button class="button primary-cta" @click="submitReview">Invia</button>
      </div>

      <div class="flex flex-row flex-gap flex-centered">
        <button
          class="button primary-cta"
          v-if="isOwner"
          @click="goToEdit">
          Modifica ricetta
        </button>

        <button
          class="button red-button"
          v-if="isOwner"
          @click="deleteRecipeClick">
          Cancella
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue"
import { useRoute, useRouter } from "vue-router"
import { getRecipeById, getRecipeImage, deleteRecipe, getRecipeTags } from "../services/recipes"
import type { Recipe } from "../types/recipe"
import type { Tag } from "../types/tag"
import { getStoredToken } from "../services/auth"
import { computed } from "vue"
import { getReviews, postReview } from "../services/reviews"
import type { Review } from "../services/reviews"
import { getNicknameByUserId, getUserProfileImage } from "../services/users"

const route = useRoute()
const router = useRouter()
const token = getStoredToken();
const recipe = ref<Recipe | null>(null)
const reviews = ref<Review[]>([])
const tags = ref<Tag[]>([])
const tagsLoading = ref(true)
const newRating = ref<number | null>(null)
const newComment = ref("")
const imageUrl = ref<string | null>(null)
const nickname = ref<string | null>(null)
const loading = ref(true)
const error = ref(false)
const profileImage = ref<string | undefined>(undefined)
const servings = ref(1)

const recipeId = route.params.id as string

onMounted(async () => {
  try {
    const data = await getRecipeById(recipeId)
    recipe.value = data.recipe
    try {
      const imageResponse = await getRecipeImage(recipeId)
      imageUrl.value = imageResponse.image_url
    } catch {
      imageUrl.value = null
    }
    
    try {
      const r = await getReviews(recipeId)
      reviews.value = r.reviews
    } catch {
      reviews.value = []
    }

    for(const r of reviews.value) {
      try {
        const image = await getUserProfileImage(r.user_id)
        r.user_profile_image = image
      } catch {
        r.user_profile_image = undefined
      }
    }

    for(const r of reviews.value) {
      const nickname = await getNicknameByUserId(r.user_id)
      r.nickname = nickname
    }

    try {
      nickname.value = await getNicknameByUserId(recipe.value.user_id);
    } catch {
      nickname.value = null
    }

    try {
      const image = await getUserProfileImage(recipe.value.user_id)
      profileImage.value = image;
    } catch {
      profileImage.value = undefined
    }

    try {
      const data = await getRecipeTags(recipeId)
      tags.value = Array.isArray(data) ? data : []
    } catch (e) {
      tags.value = []
    } finally {
      tagsLoading.value = false
    }
  } catch {
    error.value = true
  } finally {
    loading.value = false
  }
})

const isOwner = computed(() => {
  if (!recipe.value || !token) return false
  const sub = getSubFromIdToken()
  return recipe.value.user_id === sub
})

const averageRating = computed(() => {
  if (!reviews.value.length) return "—"
  const sum = reviews.value.reduce((a, r) => a + r.rating, 0)
  return (sum / reviews.value.length).toFixed(1)
})

const canReview = computed(() => {
  if (!recipe.value) return false
  const sub = getSubFromIdToken()
  const hasReviewed = reviews.value.some(r => r.user_id === sub)
  return (recipe.value.user_id !== sub) && !hasReviewed
})

async function submitReview() {
  if (!newRating.value) return

  await postReview(recipeId, newRating.value, newComment.value)

  const r = await getReviews(recipeId)
  reviews.value = r.reviews

  newRating.value = null
  newComment.value = ""
}

function getSubFromIdToken(): string | null {
  if (!token) return null

  try {
    const parts = token.split(".")
    if (parts.length < 2) return null
    const payloadPart = parts[1]
    if (!payloadPart) return null
    const payload = JSON.parse(atob(payloadPart))
    return payload.sub ?? null
  } catch {
    return null
  }
}

function formatDate(d?: string) {
  if (!d) return "—"
  return new Date(d).toLocaleDateString()
}

function goToEdit() {
  if (!recipe.value) return
  router.push(`/recipes/${recipe.value.recipe_id}/edit`)
}

async function deleteRecipeClick() {
  if (!recipe.value) return
  await deleteRecipe(recipe.value.recipe_id)
  router.push('/dashboard');
}
</script>

<style scoped>

  .recipe-detail {
    width: 80%;
    padding-left: 50px;
    padding-right: 50px;
  }

  .horizontal-container {
    width: 100%;
    max-height: 80vh;;
  }

  .inner-container {
    padding-right: 20px;
    width: 65%;
  }

  .inner-container-2 {
    padding: 20px;
    width: 35%;
    overflow-y: scroll;
  }

  h2 {
    font-size: 30px;
  }

  h3 {
    font-size: 25px;
  }

  p, li {
    font-size: 20px;
  }

  .nickname {
    color: grey;
    cursor: pointer;
  }

  .recipe-tags {
    width: 100%;
  }

  .avatar {
    width: 60px;
    height: 60px;
    border-radius: 100%;
  }

  .avatar-review {
    width: 50px;
    height: 50px;
    border-radius: 100%;
  }

  .user-div {
    width: 100%;
    max-height: 15%;
    margin-top: 10px;
  }

  .tag-card {
    padding: 10px;
    border-radius: 20px;
  }

  .tag-HIGH {
    border: 2px solid #057b45;
    color: #057b45;
  }

  .tag-MEDIUM {
    border: 2px solid #d1ce0d;
    color: #d1ce0d;
  }

  .tag-LOW {
    border: 2px solid #e6640d;
    color: #e6640d;
  }

  .tag-FALLBACK {
    border: 2px solid #d11313;
    color: #d11313;
  }

  .rating-select {
    border: 2px solid #057b45;
    border-radius: 10px;
    padding: 10px;
  }

  .comment-textarea {
    min-width: 50%;
  }

  .profile-button {
    height: 35px;
  }

  .reviews-container {
    width: 40%;
  }

  .stars {
    display: flex;
    gap: 2px;
  }

  .star {
    color: #ddd;
    font-size: 1rem;
  }

  .star.filled {
    color: #f5b301;
  }

  .servings-button {
    background: none;
    border: none;
    font-size: 20px;
    cursor: pointer;
    color: #057b45;
    font-weight: bold;
  }

</style>
