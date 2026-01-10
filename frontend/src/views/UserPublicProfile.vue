<template>
  <div class="flex flex-column flex-centered">
    <h2>Profilo di {{ user.nickname }}</h2>
  
    <div v-if="loading"> 
      <div class="loader-wrapper">
        <div class="spinner"></div>
      </div>
    </div>
    <div v-else-if="error">{{ error }}</div>
    
    <div v-else class="flex flex-column flex-centered bigger-gap">
      <div class="flex flex-row flex-centered bigger-gap card">
        <img v-if="profileImage"
        class="avatar"
        :src="profileImage"
        />
        <img v-else
          src="../assets/placeholder.png"
          class="avatar"
        />
        <div class="flex flex-column">
          <p><strong>Email:</strong> {{ user.email }}</p>
          <p><strong>Nome:</strong> {{ user.name || "—" }}</p>
          <p><strong>Cognome:</strong> {{ user.surname || "—" }}</p>
          <p><strong>Nickname:</strong> {{ user.nickname || "—" }}</p>
          <p><strong>Creato il:</strong> {{ formatDate(user.created_at) }}</p>
        </div>
      </div>
      <div v-if="recipes.length > 0" class="flex flex-column flex-centered">
        <h3>Ricette di {{ user.nickname }}</h3>
        <RecipesCarousel :recipes="recipes" />
      </div>
      <div v-else>
        L'utente non ha caricato alcuna ricetta
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue"
import { useRoute, useRouter } from "vue-router"
import { getUserPublicProfile, getUserRecipes, getUserProfileImage, getNicknameByUserId } from "../services/users"
import { getRecipeImage } from "../services/recipes"
import RecipesCarousel from '../views/RecipesCarousel.vue'

const route = useRoute()
const router = useRouter()

const userId = computed(() => route.params.userId as string)

const loading = ref(true)
const error = ref<string | null>(null)

const user = ref<any>({})
const recipes = ref<any[]>([])
const profileImage = ref<string | undefined>(undefined)

onMounted(async () => {
  try {
    user.value = await getUserPublicProfile(userId.value)
    recipes.value = await getUserRecipes(userId.value)

    try {
      profileImage.value = await getUserProfileImage(userId.value)
    } catch {
      profileImage.value = undefined
    }
    for (const recipe of recipes.value) {
      if (recipe.recipe_id && !recipe.image_url) {
        try {
          const res = await getRecipeImage(recipe.recipe_id)
          recipe.image_url = res.image_url
        } catch {
          recipe.image_url = null
        }
      }
      try {
        const res1 = await getNicknameByUserId(recipe.user_id);
        recipe.nickname = res1;
      } catch {
        recipe.nickname = null
      }
    }
  } catch {
    error.value = "profilo non disponibile"
  } finally {
    loading.value = false
  }
})

function formatDate(d?: string) {
  if (!d) return "—"
  return new Date(d).toLocaleDateString()
}
</script>

<style scoped>

.avatar {
  width: 150px;
  height: 150px;
  border-radius: 100%;
}
</style>
