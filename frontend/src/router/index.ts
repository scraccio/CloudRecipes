import { createRouter, createWebHistory } from "vue-router"

import Landing from "../views/Landing.vue"
import Dashboard from "../views/Dashboard.vue"
import Recipes from "../views/Recipes.vue"
import RecipeDetail from "../views/RecipeDetail.vue"
import CreateRecipe from "../views/CreateRecipe.vue"
import Login from "../views/Login.vue";
import Register from "../views/Register.vue";
import UserProfile from "../views/UserProfile.vue";
import UserProfileEdit from "../views/UserProfileEdit.vue";
import UserPublicProfile from "../views/UserPublicProfile.vue";
import RecipeEdit from "../views/RecipeEdit.vue";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", component: Landing },
    { path: "/dashboard", component: Dashboard, meta: { requiresAuth: true } },
    { path: "/recipes", component: Recipes, meta: { requiresAuth: true } },
    { path: "/recipes/new", component: CreateRecipe, meta: { requiresAuth: true } },
    { path: "/recipes/:id", component: RecipeDetail, meta: { requiresAuth: true } },
    { path: "/login", component: Login },
    { path: "/register", component: Register },
    { path: "/recipes/:id/edit", name: "RecipeEdit", component: RecipeEdit, meta: { requiresAuth: true } },
    { path: "/me", name: "Me", component: UserProfile, meta: { requiresAuth: true } },
    { path: "/me/edit", name: "MeEdit", component: UserProfileEdit, meta: { requiresAuth: true } },
    { path: "/users/:userId", component: UserPublicProfile }
  ]
})

router.beforeEach((to) => {
  const token = localStorage.getItem('id_token')

  if (!token && to.meta.requiresAuth) {
    return '/login'
  }
})

export default router
