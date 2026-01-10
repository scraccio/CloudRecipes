<template>
  <div class="flex flex-column flex-gap flex-centered menu">
    <h1>Cloud Recipes</h1>

    <div
      v-if="step === 'form'"
      class="flex flex-column flex-gap credentials-container"
    >
      <div class="flex flex-column flex-gap">
        <input
          v-model="name"
          placeholder="Nome"
          @blur="touch('name')"
          @keyup.enter="submitRegister"
          :class="{ invalid: touched.name && errors.name }"
        />

        <input
          v-model="surname"
          placeholder="Cognome"
          @blur="touch('surname')"
          @keyup.enter="submitRegister"
          :class="{ invalid: touched.surname && errors.surname }"
        />

        <input
          v-model="nickname"
          placeholder="Nickname"
          @blur="touch('nickname')"
          @keyup.enter="submitRegister"
          :class="{ invalid: touched.nickname && errors.nickname }"
        />

        <input
          v-model="email"
          placeholder="Email"
          @blur="touch('email')"
          @keyup.enter="submitRegister"
          :class="{ invalid: touched.email && errors.email }"
        />

        <input
          v-model="password"
          type="password"
          placeholder="Password"
          @blur="touch('password')"
          @keyup.enter="submitRegister"
          :class="{ invalid: touched.password && errors.password }"
        />
      </div>

      <button class="button primary-cta" @click="submitRegister">
        Registrati
      </button>
    </div>

    <div v-else class="flex flex-column flex-gap">
      <input v-model="code" placeholder="Codice di verifica" />
      <button class="button primary-cta" @click="submitConfirm">
        Conferma
      </button>
    </div>

    <p v-if="message" class="msg">{{ message }}</p>

    <router-link to="/login">Hai già un account? Login</router-link>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue"
import { useRouter } from "vue-router"
import { register, confirmRegistration } from "../services/auth"

const router = useRouter()

const name = ref("")
const surname = ref("")
const nickname = ref("")
const email = ref("")
const password = ref("")
const code = ref("")
const message = ref("")
const step = ref<"form" | "confirm">("form")

const errors = ref<Record<string, string>>({})
const touched = ref<Record<string, boolean>>({})

function touch(field: string) {
  touched.value[field] = true
}

function validateForm() {
  errors.value = {}

  if (!name.value) errors.value.name = "obbligatorio"
  if (!surname.value) errors.value.surname = "obbligatorio"
  if (!nickname.value) errors.value.nickname = "obbligatorio"
  if (!email.value) errors.value.email = "obbligatorio"
  if (!password.value) errors.value.password = "obbligatorio"
  return Object.keys(errors.value).length === 0
}

async function submitRegister() {
  message.value = ""

  touchAll()

  if (!validateForm()) {
    message.value = "Compila tutti i campi obbligatori"
    return
  }

  try {
    await register(
      email.value,
      password.value,
      name.value,
      surname.value,
      nickname.value
    )

    step.value = "confirm"
    message.value = "Controlla la mail per il codice di conferma"
  } catch (err: any) {
    message.value = err
  }

}


function touchAll() {
  touched.value = {
    name: true,
    surname: true,
    nickname: true,
    email: true,
    password: true,
  }
}


async function submitConfirm() {
  message.value = ""

  try {
    await confirmRegistration(email.value, code.value)
    router.push("/login")
  } catch {
    message.value = "codice di verifica non valido"
  }
}
</script>

<style scoped>
.menu {
  width: 25%;
  margin: auto;
  gap: 30px;
  padding: 5px;
  height: 80vh;
}

.credentials-container {
  width: 100%;
  justify-content: space-between;
  gap: 30px;
}

input {
  border: 1px solid lightgray;
  padding: 10px;
  outline: none;
  font-size: 14px;
}

input.invalid {
  border-color: #d32f2f;
}

.msg {
  color: #d32f2f;
  text-align: center;
  font-size: 14px;
}
</style>
