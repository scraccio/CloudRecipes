<template>
  <div class="flex flex-column flex-centered flex-gap">
    <h2>Profilo di {{ user.nickname }}</h2>

    <div v-if="loading">
      <div class="loader-wrapper">
        <div class="spinner"></div>
      </div>
    </div>
    <div v-else-if="error">{{ error }}</div>

    <div v-else class="flex flex-column flex-centered bigger-gap">
      <div class="flex flex-row flex-centered bigger-gap card">
        <img v-if="profileImageUrl"
        class="avatar"
        :src="profileImageUrl"
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

      <div class="flex flex-row flex-gap flex-centered">
        <button class="button primary-cta" @click="router.push('/me/edit')">Modifica profilo</button>
        <button class="button red-button" @click="handleLogout">Logout</button>
      </div>
      
    </div>
  </div>
</template>
  
<script setup lang="ts">
import { ref, onMounted } from "vue"
import { useRouter, onBeforeRouteUpdate } from "vue-router"
import { getMe, getProfileImage } from "../services/users"
import { clearStoredToken, clearUser } from "../services/auth"


const router = useRouter()

const loading = ref(true)
const error = ref<string | null>(null)
const user = ref<any>({})
const profileImageUrl = ref<string | null>(null)

async function load() {
  loading.value = true
  error.value = null
  try {
    user.value = await getMe()
    profileImageUrl.value = await getProfileImage()
  } catch {
    error.value = "errore nel caricamento profilo"
  } finally {
    loading.value = false
  }
}

onMounted(load)

onBeforeRouteUpdate(async (to, from, next) => {
  await load()
  next()
})

function formatDate(d?: string) {
  if (!d) return "—"
  return new Date(d).toLocaleDateString()
}

function handleLogout() {
  clearStoredToken()
  clearUser()
  router.push("/login")
}
</script>

<style>

  .avatar {
    width: 150px;
    height: 150px;
    border-radius: 100%;
  }

</style>