<template>
    <div class="ingredients-wrapper">
      <div
        v-for="(ing, index) in ingredients"
        :key="index"
        class="ingredient-row"
      >
        <input
          type="text"
          placeholder="Ingrediente"
          v-model="ing.name"
        />
  
        <input
          type="number"
          placeholder="Quantità"
          v-model.number="ing.amount"
          :disabled="ing.unit === 'qb'"
          min="0"
        />
  
        <select v-on:change="selectOnChange" v-model="ing.unit">
          <option value="g">g</option>
          <option value="ml">ml</option>
          <option value="pz">pz</option>
          <option value="cucchiai">cucchiai</option>
          <option value="qb">q.b.</option>
        </select>
  
        <button class="remove" @click="remove(index)">✕</button>
      </div>
  
      <button class="add" @click="add">
        + Aggiungi ingrediente
      </button>
    </div>
</template>
<script setup lang="ts">
import { ref, watch } from "vue"

export interface Ingredient {
  name: string
  amount: number | null
  unit: string
}

const props = defineProps<{
  initialIngredients?: Ingredient[]
}>()

const ingredients = ref<Ingredient[]>([])

watch(
  () => props.initialIngredients,
  (val) => {
    if (val && val.length > 0) {
      ingredients.value = val.map(i => ({
        name: i.name,
        amount: i.amount,
        unit: i.unit
      }))
    } else {
      ingredients.value = [{ name: "", amount: null, unit: "g" }]
    }
  },
  { immediate: true }
)

function add() {
  ingredients.value.push({
    name: "",
    amount: null,
    unit: "g"
  })
}

function remove(index: number) {
  ingredients.value.splice(index, 1)
  if (ingredients.value.length === 0) {
    add()
  }
}

function selectOnChange() {
  for (const ing of ingredients.value) {
    if (ing.unit === "qb") {
      ing.amount = null
    }
  }
}

function getPayload(): Ingredient[] {
  return ingredients.value.filter(i => i.name.trim() !== "")
}

defineExpose({
  getPayload
})

</script>
<style scoped>
    .ingredients-wrapper {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    
    .ingredient-row {
      display: grid;
      grid-template-columns: 1fr 120px 140px 40px;
      gap: 8px;
      align-items: center;
    }
    
    input, select {
      padding: 8px;
      border: 1px solid #ddd;
    }
    
    button.add {
        border: 1px solid #057b45;
        border-radius: 20px;
        background: none;
        padding: 10px;
        cursor: pointer;
        margin-top: 8px;
        align-self: flex-start;
        transition: background-color 0.1s;
    }

    button.add:hover{
        background: #effff8;
    }
    
    button.remove {
      background: none;
      border: none;
      font-size: 18px;
      cursor: pointer;
    }
</style>