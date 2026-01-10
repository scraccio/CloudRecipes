<template>
    
  <div v-if="recipes.length === 0 && !loading" class="flex flex-column flex-centered bigger-gap">
    <img
      src="../assets/food-dashboard.png"
      alt="food illustration"
      class="hero-image"
    />

    <button class="button primary-cta" @click="go('/recipes/new')">
      Carica una ricetta
    </button>
  </div>
  <div v-else class="flex flex-column flex-centered flex-gap">
    <h2>Le tue ricette</h2>
    <div class="flex flex-column flex-centered bigger-gap recipes-container card">
      <div class="recipes-scroll flex flex-row flex-centered bigger-gap">
        <div
          v-for="recipe in recipes"
          :key="recipe.recipe_id"
          class="recipe-card"
          @click="go(`/recipes/${recipe.recipe_id}`)"
        >
          <div class="flex flex-column flex-centered">
            <div class="image-container">
              <img v-if="recipe.image_url" :src="recipe.image_url" />
            </div>
            <div class="recipe-body">
              <h3 class="recipe-title">{{ recipe.title }}</h3>
            </div>
          </div>

        </div>
      </div>
    </div>
    <button class="button primary-cta" @click="go('/recipes/new')">
        Carica una ricetta
      </button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue"
import { useRouter } from "vue-router"
import { getRecipes, getRecipeImage } from "../services/recipes"

const router = useRouter()
const recipes = ref<any[]>([])
const loading = ref(true)

onMounted(async () => {
  try {
    const data = await getRecipes()
    recipes.value = Array.isArray(data) ? data : []
    for (const recipe of recipes.value) {
      if (recipe.recipe_id && !recipe.image_url) {
        try {
          const res = await getRecipeImage(recipe.recipe_id)
          recipe.image_url = res.image_url
        } catch {
          recipe.image_url = null
        }
      }
    }
  }
  catch (err) {
    console.warn("errore caricamento ricette", err)
  }
  finally {
    loading.value = false
  }
})

function go(path: string) {
  router.push(path)
}
</script>
<style>

  .recipes-container {
    height: calc(100vh - 64px - 260px);
    width: 100%;
    display: flex;
    flex-direction: column;
  }

  .recipe-card {
    width: 15%;
    background-color: #057b45;
    border-radius: 20px;
    padding: 10px;
    box-shadow: 10px 5px 5px rgba(0, 0, 0, 0.144);
    color: white;
    transition: background-color 0.1s;
  }

  .recipe-card:hover {
    cursor: pointer;
    background-color: #06a15b;
  }

  .recipes-scroll {
    flex-wrap: wrap;
    width: 100%;
    overflow-y: auto;
    overflow-x: hidden;
    padding: 24px;
    box-sizing: border-box;
  }

</style>