<template>
    <div class="dashboard">
  
      <section class="hero box-shadow">
        <div class="hero-content flex-centered">
          <h1>CloudRecipes</h1>
          <p>Scopri cosa stanno cucinando gli altri</p>
        </div>
      </section>
  
      <section class="latest">
        <div v-if="loading" class="loading">
          <div class="loader-wrapper">
            <div class="spinner"></div>
          </div>
        </div>
  
        <div v-else-if="recipes.length === 0" class="empty">
          Nessuna ricetta pubblicata
        </div>
        
        <div v-else>
        <h2 id="h2">Ultime ricette</h2>
          <LatestRecipesCarousel :recipes="recipes" />
        </div>
      </section>
  
    </div>
  </template>
  
  <script setup lang="ts">
    import { ref, onMounted } from "vue"
    import { getLatestRecipes, getRecipeImage } from "../services/recipes"
    import { getNicknameByUserId } from "../services/users"
    import LatestRecipesCarousel from '../views/RecipesCarousel.vue'

    const recipes = ref<any[]>([])
    const loading = ref(true)
    
    onMounted(async () => {
      try {
        recipes.value = await getLatestRecipes()
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
      } finally {
        loading.value = false
      }
    })

  </script>
  
  <style scoped>
    .dashboard {
      display: flex;
      flex-direction: column;
      height: 85vh;
    }
    
    .hero {
      background: #057b45;
      color: white;
      padding: 64px 24px;
      height: 45%;
    }
    
    .hero-content {
      max-width: 900px;
      margin: auto;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    
    .hero h1 {
      font-size: 48px;
      font-weight: 700;
    }
    
    .hero p {
      font-size: 18px;
      opacity: 0.9;
    }

    #h2 {
      margin-left: 50px;
    }
    
    .primary-cta {
      margin-top: 16px;
      width: fit-content;
      background: white;
      color: #057b45;
      border: none;
      padding: 14px 28px;
      border-radius: 999px;
      font-weight: 600;
      cursor: pointer;
    }
    
    .latest {
      max-width: 1100px;
      margin: auto;
      padding: 0 24px;
      display: flex;
      flex-direction: column;
      gap: 24px;
    }
    
    .latest h2 {
      font-size: 24px;
    }
    
    .carousel {
      display: flex;
      gap: 16px;
      overflow-x: auto;
      padding-bottom: 8px;
    }
    
    .recipe-card {
      min-width: 220px;
      max-width: 220px;
      background: #057b45;
      border-radius: 16px;
      overflow: hidden;
      cursor: pointer;
      flex-shrink: 0;
    }
    
    .recipe-card img {
      width: 100%;
      height: 140px;
      object-fit: cover;
    }
    
    .card-content {
      padding: 12px;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    
    .card-content h3 {
      font-size: 16px;
      font-weight: 600;
    }
    
    .author {
      font-size: 13px;
      opacity: 0.6;
    }
    
    .loading,
    .empty {
      opacity: 0.6;
    }
    </style>
    