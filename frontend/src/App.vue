<template>
  <div class="app-layout">
    <header class="app-header">
      <div class="left">
        <span class="logo" @click="go('/dashboard')">CloudRecipes</span>
      </div>

      <div class="center">
        <input
          class="search"
          v-model="searchQuery"
          placeholder="Cerca utenti"
          @keyup.enter="doUserSearch"
        />
      </div>

      <div class="right">
        <button class="avatar-btn" @click="go('/recipes')"><i class="fa-solid fa-utensils"></i></button>
        <button class="avatar-btn" @click="go('/me')"><i class="fa-solid fa-user"></i></button>
      </div>
    </header>

    <main class="app-content">
      <router-view />
      <div class="toast-container">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="toast flex flex-column flex-gap"
        >
          <p>{{ toast.code }}</p>
          <p>{{ toast.message }}</p>
        </div>
      </div>
    </main>

    <footer class="app-footer">
      <span class="left-footer">
        © 2025 CloudRecipes
      </span>
    </footer>

  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router"
import { getUserByNickname } from "../src/services/users"
import { getStoredToken, setUserFromToken, userId } from "../src/services/auth"
import { onMounted, watch } from "vue"

const searchQuery = ref("")
const router = useRouter()
const token = getStoredToken();

type Toast = {
  id: number,
  code: string,
  message: string
}

let ws: WebSocket | null = null
let heartbeat: number | null = null
const toasts = ref<Toast[]>([])

watch(userId, (newUserId) => {
  if (newUserId) {
    connectWS(newUserId)
  } else {
    disconnectWS()
  }
})

function connectWS(userId: string) {
  disconnectWS()

  ws = new WebSocket(
    `${import.meta.env.VITE_WS_URL}?user_id=${userId}`
  )

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data)

    if (data.event === "IMAGE_RESIZE") {
      showToast(data.event, data.message)
    }

    if (data.event === "IMAGE_TAGGED") {
      showToast(data.event, data.message)
    }

    if (data.status === "error") {
      showToast(data.status, data.message)
    }
  }

  ws.onclose = () => {
    retryReconnect(userId)
  }

  ws.onerror = () => {
    ws?.close()
  }

  heartbeat = window.setInterval(() => {
    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: "ping" }))
    }
  }, 25_000)
}

function disconnectWS() {
  if (heartbeat) {
    clearInterval(heartbeat)
    heartbeat = null
  }

  if (ws) {
    ws.close()
    ws = null
  }
}

function retryReconnect(userId: string) {
  setTimeout(() => {
    if (userId) {
      connectWS(userId)
    }
  }, 3000)
}

function showToast(code: string, message: string) {
  const id = Date.now()

  toasts.value.push({ id, code, message })

  setTimeout(() => {
    toasts.value = toasts.value.filter(t => t.id !== id)
  }, 4000)
}

onMounted(() => {
  const sub = getSubFromIdToken()
  if (sub && token) {
    setUserFromToken(token)
  }
  else{
    return
  } 
})

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

function go(path: string) {
  router.push(path)
}

async function doUserSearch() {
  const query = searchQuery.value.trim()
  if (!query) return

  try {
    const results = await getUserByNickname(query)
    if (results.length === 1) {
      router.push(`/users/${results[0].user_id}`)
    }
    else {
      console.log("nessun utente trovato")
    }
  }
  catch {
    console.log("errore ricerca utenti")
  }
}
</script>

<style scoped>
.app-layout {
  min-height: 100vh;
  background: #ffffff;
}

.app-header {
  height: 64px;
  background: #057b45;
  color: #ffffff;
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  padding: 0 24px;
  gap: 24px;
}

.logo {
  font-size: 20px;
  font-weight: 700;
  cursor: pointer;
}

.center {
  display: flex;
  justify-content: center;
}

.search {
  width: 100%;
  max-width: 420px;
  padding: 8px 12px;
  border-radius: 8px;
  border: none;
  outline: none;
  font-size: 14px;
}

.right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.icon-btn,
.avatar-btn {
  background: transparent;
  border: none;
  color: #ffffff;
  font-size: 18px;
  cursor: pointer;
}


.app-footer {
  height: 56px;
  border-top: 1px solid #eaeaea;
  background: #ffffff;
  color: #666;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  font-size: 13px;
  margin-top: 20px;
}

.left-footer {
  font-weight: 500;
}

.right-footer {
  opacity: 0.8;
}

.toast-container {
  position: fixed;
  bottom: 24px;
  right: 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  z-index: 9999;
}

.toast {
  background: #2b2b2b;
  color: white;
  padding: 20px 20px;
  border-radius: 8px;
  min-width: 240px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.25);

  animation: slide-in 0.3s ease-out,
             fade-out 0.3s ease-in 3.7s forwards;
}

@keyframes slide-in {
  from {
    transform: translateX(120%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes fade-out {
  to {
    transform: translateX(120%);
    opacity: 0;
  }
}
</style>
