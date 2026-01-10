<template>
  <div class="flex flex-column flex-centered flex-gap">
    <h1>Modifica ricetta</h1>

    <div v-if="loading">
      <div class="loader-wrapper">
        <div class="spinner"></div>
      </div>
    </div>
    <div v-else-if="error">{{ error }}</div>

    <form v-else @submit.prevent="submit" class="edit-recipe-form">
      <div class="flex flex-centered flex-column bigger-gap">
        <div class="flex flex-column big-gap flex-centered">

          <img v-if="!hasFile && !filePreview"
            src="../assets/recipe-placeholder.png"
            class="create-recipe-image box-shadow"
            @click="openFileUpload"
            style="cursor: pointer;"
          />

          <img v-else
            :src="filePreview"
            class="create-recipe-image box-shadow"
            @click="openFileUpload"
            style="cursor: pointer;"
          />

          <input
            ref="fileInput"
            type="file"
            accept="image/jpeg,image/png"
            @change="onFile"
            style="display: none;"
          />

          <p class="image-subtext" v-if="hasImage" @click="removeImage">Rimuovi immagine</p>
          <p class="image-subtext" v-else @click="openFileUpload">Aggiungi immagine</p>

          <label>Titolo</label>
          <input v-model="title" required />
    
          <label>Descrizione</label>
          <textarea v-model="description" />
    
          <label>Ingredienti</label>
          <IngredientsInput ref="ingredientsRef" :initial-ingredients="initialIngredients" />

          <label>Difficoltà</label>
          <select v-model="difficulty" required >
            <option value="" disabled selected>Seleziona la difficoltà</option>
            <option value="Facile">Facile</option>
            <option value="Media">Media</option>
            <option value="Difficile">Difficile</option>
          </select>

          <label>Procedimento</label>
          <textarea required v-model="procedure" />

          <label>Tempo di preparazione (in minuti)</label>
          <input type="number" step="5" v-model="timeRequired" required />
        </div>

        <div id="buttons-container" class="flex flex-row flex-gap flex-centered">
          <button class="button primary-cta" type="submit">Salva</button>
          <button class="button red-button" type="button" @click="goBack">Annulla</button>
        </div>
      </div>

    </form>
  </div>
</template>
  
<script setup lang="ts">
  import { ref, onMounted, computed } from "vue"
  import { useRoute, useRouter } from "vue-router"
  import { getRecipeById, getRecipeImage, updateRecipe, getRecipeImageUploadUrl } from "../services/recipes"
  import IngredientsInput, { type Ingredient } from "./IngredientsInput.vue"

  const route = useRoute()
  const router = useRouter()
  
  const recipeId = route.params.id as string
  const hasFile = computed(() => file.value !== null)
  const hasImage = computed(() =>
    file.value !== null || filePreviewUrl.value !== null
  )
  const filePreview = computed(() => filePreviewUrl.value || "")
  const filePreviewUrl = ref<string | null>(null)
  const fileInput = ref<HTMLInputElement | null>(null)
  const loading = ref(true)
  const error = ref<string | null>(null)
  const file = ref<File | null>(null)
  const title = ref("")
  const description = ref("")
  const ingredientsRef = ref<any>(null)
  const procedure = ref("")
  const timeRequired = ref(0)
  const difficulty = ref("")
  const initialIngredients = ref<Ingredient[]>([])
  
  onMounted(async () => {
    try {
      const data = await getRecipeById(recipeId)
      const recipe = data.recipe
  
      title.value = recipe.title
      description.value = recipe.description || ""
      difficulty.value = recipe.difficulty || ""
      procedure.value = recipe.procedure || ""
      timeRequired.value = recipe.timeRequired || 0
      initialIngredients.value = recipe.ingredients.map(ing => ({
        name: ing.name,
        amount: ing.amount ?? null,
        unit: ing.unit || "g"
      }))
      
      const image = await getRecipeImage(recipe.recipe_id)
      filePreviewUrl.value = image.image_url;

    } catch (e) {
      error.value = "errore nel caricamento ricetta"
    } finally {
      loading.value = false
    }
  })

  function onFile(e: Event) {
    const target = e.target as HTMLInputElement
    if (target.files && target.files.length > 0) {
      const newFile = target.files[0]!
      file.value = newFile

      if (filePreviewUrl.value) {
        URL.revokeObjectURL(filePreviewUrl.value)
      }

      filePreviewUrl.value = URL.createObjectURL(newFile)
    }
  }

  function openFileUpload() {
    fileInput.value?.click()
  }
  
  function removeImage() {
    file.value = null

    if (filePreviewUrl.value) {
      URL.revokeObjectURL(filePreviewUrl.value)
      filePreviewUrl.value = null
    }

  }

  async function submit() {
    try {
      const ingredients = ingredientsRef.value.getPayload()
  
      await updateRecipe(recipeId, {
        title: title.value,
        description: description.value,
        ingredients: ingredients,
        difficulty: difficulty.value,
        procedure: procedure.value,
        timeRequired: timeRequired.value
      })

      if (file.value) {
        const { upload_url } = await getRecipeImageUploadUrl(recipeId, "update")
        await fetch(upload_url, {
          method: "PUT",
          headers: {
            "Content-Type": file.value.type
          },
          body: file.value
        })
      }
  
      router.push(`/recipes/${recipeId}`)
    } catch (e) {
      error.value = "errore nel salvataggio"
    }
  }
  
  function goBack() {
    router.push(`/recipes/${recipeId}`)
  }
</script>
<style>

  .edit-recipe-form {
    width: 30%;
    padding: 20px;
    border: 2px solid #057b45;
    border-radius: 20px;
  }

  .edit-recipe-form > div > * {
    width: 100%;
  }

  .edit-recipe-form > div > div > * {
    width: 100%;
  }

  label {
    margin-bottom: 5px;
  }

  #buttons-container {
    margin-top: 50px;
  }

</style>
  