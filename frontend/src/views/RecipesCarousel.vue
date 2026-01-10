<template>
    <div class="carousel-wrapper">
        <button class="nav left" @click="prev">‹</button>

        <div class="carousel-viewport">
        <div
            class="carousel-track"
            :style="{ transform: `translateX(-${currentIndex * itemWidth}px)` }"
        >
            <div
            v-for="(recipe, i) in loopedRecipes"
            :key="i"
            class="recipe-card"
            @click="go(recipe.recipe_id)"
            >
            <img :src="recipe.image_url" />
            <div class="info flex flex-column">
                <h3>{{ recipe.title }}</h3>
                <span>@{{ recipe.nickname }}</span>
                <div v-if="recipe.rating_count > 0" class="stars">
                  <span
                    v-for="i in 5"
                    :key="i"
                    class="star"
                    :class="starType(getRating(recipe), i)"
                  >
                    ★
                  </span>
                </div>
              </div>
            </div>
        </div>
        </div>

        <button class="nav right" @click="next">›</button>
    </div>
</template>

<script setup lang="ts">
    import { ref, computed, onMounted } from "vue"
    import { useRouter } from "vue-router"

    const props = defineProps<{
        recipes: any[]
    }>()

    const router = useRouter()

    const itemWidth = 240
    const currentIndex = ref(0)

    const loopedRecipes = computed(() => {
        return [
        ...props.recipes,
        ...props.recipes
        ]
    })

    function getRating(recipe: any) {
      if (recipe.rating_sum && recipe.rating_count) {
        return recipe.rating_sum / recipe.rating_count
      }
      return 0
    }

    function starType(rating: number, index: number) {
      if (rating >= index) return "full"
      if (rating >= index - 0.5) return "half"
      return "empty"
    }

    onMounted(() => {
        currentIndex.value = props.recipes.length
    })

    function next() {
        currentIndex.value++

        if (currentIndex.value >= props.recipes.length * 1.5) {
        currentIndex.value = props.recipes.length
        }
    }

    function prev() {
        currentIndex.value--

        if (currentIndex.value <= props.recipes.length - 1) {
        currentIndex.value = props.recipes.length * 1.5 - 1
        }
    }

    function go(id: string) {
        router.push(`/recipes/${id}`)
    }
</script>
<style scoped>
    .carousel-wrapper {
      position: relative;
      display: flex;
      align-items: center;
      gap: 12px;
    }
    
    .carousel-viewport {
      width: 1100px;
      overflow: hidden;
    }
    
    .carousel-track {
      display: flex;
      transition: transform 0.4s ease;
    }
    
    .recipe-card {
      width: 220px;
      flex-shrink: 0;
      margin-right: 20px;
      border-radius: 16px;
      background: #057b45;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0,0,0,0.08);
    }
    
    .recipe-card img {
      width: 100%;
      height: 140px;
      object-fit: cover;
    }
    
    .info {
      padding: 12px;
    }
    
    .info h3 {
      font-size: 18px;
      font-weight: 600;
    }
    
    .nav {
      border: none;
      background: #057b45;
      color: white;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      font-size: 22px;
      cursor: pointer;
    }
    
    .nav:hover {
      opacity: 0.9;
    }

    .stars {
      display: flex;
      gap: 2px;
      margin-top: 6px;
    }

    .star {
      font-size: 16px;
      color: rgba(255,255,255,0.3);
    }

    .star.full {
      color: #ffd700;
    }

    .star.half {
      background: linear-gradient(
        90deg,
        #ffd700 50%,
        rgba(255,255,255,0.3) 50%
      );
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
</style>
    