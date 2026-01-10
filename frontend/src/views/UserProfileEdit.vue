<template>
  <div class="flex flex-column flex-centered flex-gap">
    <h2>Modifica profilo</h2>

    <div v-if="loading">
      <div class="loader-wrapper">
        <div class="spinner"></div>
      </div>
    </div>
    <div v-else class="flex flex-column flex-centered flex-gap profile-edit-card">
      <div class="flex flex-column big-gap">
        <div class="flex flex-column flex-centered">
          <img v-if="!hasFile && !filePreview"
            src="../assets/placeholder.png"
            class="edit-user-image box-shadow"
            @click="openFileUpload"
            style="cursor: pointer;"
          />

          <img v-else
            :src="filePreview"
            class="edit-user-image box-shadow"
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
        </div>
        <div class="flex flex-column">
          <label>Nome</label>
          <input v-model="form.name" placeholder="Nome" />
        </div>
        <div class="flex flex-column">
          <label>Cognome</label>
          <input v-model="form.surname" placeholder="Cognome" />
        </div>
        <div class="flex flex-column">
          <label>Nickname</label>
          <input v-model="form.nickname" placeholder="Nickname" />
        </div>
        <div id="buttons-container" class="flex flex-row flex-gap flex-centered">
          <button class="button primary-cta" @click="save" :disabled="saving">Salva</button>
          <button class="button red-button" @click="router.push('/me')" :disabled="saving">Annulla</button>
        </div>
      </div>

      <p v-if="msg">{{ msg }}</p>
    </div>
  </div>
</template>
  
<script setup lang="ts">
  import { ref, onMounted, computed } from "vue"
  import { useRouter } from "vue-router"
  import { getMe, updateMe, getProfileImageUploadUrl, getUserProfileImage } from "../services/users"
  
  const router = useRouter()
  
  const loading = ref(true)
  const saving = ref(false)
  const msg = ref("")
  const hasFile = computed(() => file.value !== null)
  const filePreview = computed(() => filePreviewUrl.value || "")
  const filePreviewUrl = ref<string | null>(null)
  const fileInput = ref<HTMLInputElement | null>(null)
  const file = ref<File | null>(null)
  const hasImage = computed(() =>
    file.value !== null || filePreviewUrl.value !== null
  )

  const form = ref<any>({
    name: "",
    surname: "",
    nickname: ""
  })
  
  onMounted(async () => {
    const me = await getMe()
    form.value.name = me.name || ""
    form.value.surname = me.surname || ""
    form.value.nickname = me.nickname || ""

    try{
      const image = await getUserProfileImage(me.user_id)
      filePreviewUrl.value = image;
    }
    catch (e: any) {
      
    }
    

    loading.value = false
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
  
  async function save() {
    saving.value = true
    msg.value = ""
    try {
      await updateMe({
        name: form.value.name,
        surname: form.value.surname,
        nickname: form.value.nickname
      })

      if (file.value) {
        const { upload_url } = await getProfileImageUploadUrl(
          file.value.type
        )
        await fetch(upload_url, {
          method: "PUT",
          headers: {
            "Content-Type": file.value.type
          },
          body: file.value
        })
      }
      router.push("/me")
    } catch (e: any) {
      msg.value = e?.message || "errore salvataggio"
    } finally {
      saving.value = false
    }
  }
</script>
<style>

  #buttons-container {
    margin-top: 50px;
  }

  .profile-edit-card {
    border: 2px solid #057b45;
    padding: 20px;
    border-radius: 20px;
    width: 30%;
  }

  .edit-user-image {
    max-width: 40%;
  }

</style>
  