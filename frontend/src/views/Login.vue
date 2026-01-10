<template>
  <div class="flex flex-column flex-centered login-menu">
    <h1>Cloud Recipes</h1>

    <div class="flex flex-row flex-gap credentials-row">
      <input class="input-credential" v-model="email" @keyup.enter="doLogin" placeholder="Email" />
      <input class="input-credential" v-model="password" @keyup.enter="doLogin" type="password" placeholder="Password" />
    </div>

    <button class="button primary-cta" @click="doLogin">Login</button>

    <p v-if="error">{{ error }}</p>
    <p>
        Non hai un account?
        <a @click.prevent="router.push('/register')" href="#">Registrati</a>
    </p>

  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { login, storeToken, setUserFromToken } from "../services/auth";
import { useRouter } from "vue-router";

const email = ref("");
const password = ref("");
const error = ref("");
const router = useRouter();

async function doLogin() {
  try {
    const token = await login(email.value, password.value);
    storeToken(token);
    setUserFromToken(token)
    router.push("/dashboard");
  } catch (e: any) {
    error.value = e.message || "Login failed";
  }
}
</script>

<style>

  .login-menu {
    width: 25%;
    margin: auto;
    gap: 30px;
    padding: 5px;
    text-align: center;
    height: 80vh;
  }

  .login-menu > * {
    width: 100%;
  }

  .credentials-row {
    width: 100%;
    justify-content: space-between;
  }

  .input-credential {
    width: 49%;
  }

</style>
