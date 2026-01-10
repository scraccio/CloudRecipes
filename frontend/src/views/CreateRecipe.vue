<template>
  <div class="flex flex-column flex-centered flex-gap">
    <h1>Nuova ricetta</h1>

    <form @submit.prevent="submit" class="form">
      <div class="flex flex-column bigger-gap flex-centered">
        <div class="flex flex-column big-gap flex-centered">
          
          <img v-if="!hasFile"
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

          <p class="image-subtext" v-if="hasFile" @click="removeImage">Rimuovi immagine</p>
          <p class="image-subtext" v-if="!hasFile" @click="openFileUpload">Aggiungi immagine</p>
          
          <label>Titolo</label>
          <input v-model="title" required />

          <label>Descrizione</label>
          <textarea v-model="description" />

          <label>Ingredienti</label>
          <IngredientsInput ref="ingredientsRef" />

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

        <button class="button primary-cta" type="submit">
          Crea ricetta
        </button>
      </div>

      
    </form>

    <p v-if="error" class="red-text">
      {{ error }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from "vue"
import { useRouter } from "vue-router"
import { createRecipe } from "../services/recipes"
import { getRecipeImageUploadUrl } from "../services/recipes"
import IngredientsInput from "./IngredientsInput.vue"

const router = useRouter()
const ingredientsRef = ref<any>(null)
const title = ref("")
const description = ref("")
const procedure = ref("")
const timeRequired = ref(0)
const difficulty = ref("")
const file = ref<File | null>(null)
const error = ref("")
const filePreviewUrl = ref<string | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)

const hasFile = computed(() => file.value !== null)
const filePreview = computed(() => filePreviewUrl.value || "")

watch(file, (newFile) => {
  if (filePreviewUrl.value) {
    URL.revokeObjectURL(filePreviewUrl.value)
    filePreviewUrl.value = null
  }
  if (newFile) {
    filePreviewUrl.value = URL.createObjectURL(newFile)
  }
})

onUnmounted(() => {
  if (filePreviewUrl.value) {
    URL.revokeObjectURL(filePreviewUrl.value)
  }
})

function onFile(e: Event) {
  const target = e.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    file.value = target.files[0] ?? null
  }
}

function removeImage() {
  file.value = null;
}

function openFileUpload() {
  fileInput.value?.click()
}

async function submit() {
  error.value = ""

  const ingredients = ingredientsRef.value.getPayload()

  if (!title.value || ingredients.length === 0) {
    error.value = "Titolo e ingredienti obbligatori"
    return
  }

  if (timeRequired.value === 0) {
    error.value = "Imposta il tempo di preparazione"
    return
  }

  

  try {
    const recipe = await createRecipe({
      title: title.value,
      description: description.value,
      ingredients: ingredients,
      difficulty: difficulty.value,
      procedure: procedure.value,
      timeRequired: timeRequired.value
    })

    const recipeId = recipe.recipe_id

    if (file.value) {
      const { upload_url } = await getRecipeImageUploadUrl(recipeId, "create")

      await fetch(upload_url, {
        method: "PUT",
        headers: {
          "Content-Type": file.value.type
        },
        body: file.value
      })
    }

    router.push(`/recipes/${recipeId}`)
  } catch (e: any) {
    error.value = e.message || "Errore creazione ricetta"
  }
}
</script>
<style>

  .form {
    width: 30%;
    padding: 20px;
    border: 2px solid #057b45;
    border-radius: 20px;
  }

  .form > div {
    width: 100%;
  }

  .form > div > * {
    width: 100%;
  }

  .form > div > div > * {
    width: 100%;
  }

  select {
    border: 1px solid lightgray;
    outline: none;
    padding: 10px;
  }

  .image-subtext {
    cursor: pointer;
    color: #057b45;
    text-align: center;
  }

  .create-recipe-image {
    max-width: 70%;
  }

</style>