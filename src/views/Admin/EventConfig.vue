<template>
  <section class="event-config">
    <v-container class="py-8 py-md-12" max-width="1440">
      <v-sheet class="config__hero pa-5 pa-md-7 mb-5" rounded="xl">
        <div class="d-flex flex-wrap align-center justify-space-between ga-3">
          <div>
            <p class="config__eyebrow">UC-07</p>
            <h1 class="config__title">Configuracoes do evento</h1>
            <p class="config__subtitle">Atualize dados principais, links e chaves Pix do seu evento.</p>
          </div>

          <v-btn
            color="primary"
            prepend-icon="mdi-arrow-left"
            rounded="pill"
            variant="tonal"
            @click="router.push(`/admin/eventos/${eventId}`)"
          >
            Voltar ao dashboard
          </v-btn>
        </div>
      </v-sheet>

      <v-progress-linear v-if="isLoading" class="mb-4" color="primary" indeterminate />

      <v-sheet class="pa-5 pa-md-7" rounded="xl">
        <v-form ref="formRef" @submit.prevent="submit">
          <v-row dense>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.name"
                density="comfortable"
                label="Nome do evento"
                :rules="nameRules"
                variant="outlined"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.date"
                density="comfortable"
                label="Data e horario"
                :rules="dateRules"
                type="datetime-local"
                variant="outlined"
              />
            </v-col>
          </v-row>

          <v-text-field
            v-model="form.venueAddress"
            class="mt-2"
            density="comfortable"
            label="Endereco do evento"
            :rules="venueRules"
            variant="outlined"
          />

          <v-text-field
            v-model="form.deliveryAddress"
            class="mt-2"
            density="comfortable"
            label="Endereco para entrega de presentes"
            variant="outlined"
          />

          <v-text-field
            v-model="form.mapsLink"
            class="mt-2"
            density="comfortable"
            label="Link do Google Maps"
            variant="outlined"
          />

          <v-text-field
            v-model="form.coverImageUrl"
            class="mt-2"
            density="comfortable"
            label="URL da imagem de capa"
            variant="outlined"
          />

          <v-row class="mt-2" dense>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.pixKeyDad"
                density="comfortable"
                label="Chave Pix do papai"
                variant="outlined"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.pixKeyMom"
                density="comfortable"
                label="Chave Pix da mamae"
                variant="outlined"
              />
            </v-col>
          </v-row>

          <v-row dense>
            <v-col cols="12" md="6">
              <v-textarea
                v-model="form.pixQrcodeDad"
                auto-grow
                density="comfortable"
                label="QR Code Pix do papai (base64)"
                rows="2"
                variant="outlined"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-textarea
                v-model="form.pixQrcodeMom"
                auto-grow
                density="comfortable"
                label="QR Code Pix da mamae (base64)"
                rows="2"
                variant="outlined"
              />
            </v-col>
          </v-row>

          <div class="d-flex flex-wrap ga-2 mt-3">
            <v-btn
              color="primary"
              :loading="isSaving"
              rounded="pill"
              type="submit"
            >
              Salvar alteracoes
            </v-btn>
            <v-btn rounded="pill" variant="text" @click="loadEvent">
              Recarregar
            </v-btn>
          </div>
        </v-form>
      </v-sheet>

      <v-snackbar
        v-model="toast.visible"
        :color="toast.color"
        :location="toastLocation"
        :timeout="2000"
      >
        {{ toast.message }}
      </v-snackbar>
    </v-container>
  </section>
</template>

<script setup lang="ts">
  import { computed, onMounted, reactive, ref } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { getAdminEventById, updateAdminEventById } from '@/api/adminApi'
  import { useAppToast } from '@/composables/useAppToast'
  import { ApiError } from '@/services/http'
  import { useAdminAuthStore } from '@/stores/useAdminAuthStore'

  const route = useRoute()
  const router = useRouter()
  const authStore = useAdminAuthStore()
  const { toast, toastLocation, showToast } = useAppToast()

  const formRef = ref<{ validate: () => Promise<{ valid: boolean }> } | null>(null)
  const isLoading = ref(false)
  const isSaving = ref(false)

  const form = reactive({
    name: '',
    date: '',
    venueAddress: '',
    deliveryAddress: '',
    mapsLink: '',
    coverImageUrl: '',
    pixKeyDad: '',
    pixKeyMom: '',
    pixQrcodeDad: '',
    pixQrcodeMom: '',
  })

  const eventId = computed(() => String(route.params.event_id || ''))
  const nameRules = [
    (value: string) => !!value.trim() || 'Informe o nome do evento',
    (value: string) => value.trim().length >= 3 || 'Nome deve ter ao menos 3 caracteres',
  ]

  const dateRules = [
    (value: string) => !!value || 'Informe data e horario',
  ]

  const venueRules = [
    (value: string) => !!value.trim() || 'Informe o endereco do evento',
  ]

  function toDatetimeLocal (value: string): string {
    if (!value) return ''

    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return ''

    const offset = date.getTimezoneOffset()
    const adjusted = new Date(date.getTime() - offset * 60_000)
    return adjusted.toISOString().slice(0, 16)
  }

  function fromDatetimeLocal (value: string): string {
    if (!value) return ''
    const date = new Date(value)
    return Number.isNaN(date.getTime()) ? '' : date.toISOString()
  }

  async function loadEvent (): Promise<void> {
    if (!eventId.value) {
      showToast('Evento invalido.', 'error')
      return
    }

    isLoading.value = true

    try {
      const eventItem = await getAdminEventById(eventId.value)

      form.name = eventItem.name
      form.date = toDatetimeLocal(eventItem.date)
      form.venueAddress = eventItem.venueAddress
      form.deliveryAddress = eventItem.deliveryAddress || ''
      form.mapsLink = eventItem.mapsLink || ''
      form.coverImageUrl = eventItem.coverImageUrl || ''
      form.pixKeyDad = eventItem.pixKeyDad || ''
      form.pixKeyMom = eventItem.pixKeyMom || ''
      form.pixQrcodeDad = eventItem.pixQrcodeDad || ''
      form.pixQrcodeMom = eventItem.pixQrcodeMom || ''
    } catch (error) {
      handleApiError(error, 'Nao foi possivel carregar as configuracoes do evento.')
    } finally {
      isLoading.value = false
    }
  }

  async function submit (): Promise<void> {
    if (!eventId.value) {
      showToast('Evento invalido.', 'error')
      return
    }

    const validation = await formRef.value?.validate()
    if (!validation?.valid) {
      return
    }

    isSaving.value = true

    try {
      await updateAdminEventById(eventId.value, {
        name: form.name.trim(),
        date: fromDatetimeLocal(form.date),
        venueAddress: form.venueAddress.trim(),
        deliveryAddress: form.deliveryAddress.trim() || null,
        mapsLink: form.mapsLink.trim() || null,
        coverImageUrl: form.coverImageUrl.trim() || null,
        pix: {
          dadKey: form.pixKeyDad.trim() || null,
          momKey: form.pixKeyMom.trim() || null,
          dadQrCode: form.pixQrcodeDad.trim() || null,
          momQrCode: form.pixQrcodeMom.trim() || null,
        },
      })

      showToast('Configuracoes atualizadas com sucesso.', 'success')
    } catch (error) {
      handleApiError(error, 'Nao foi possivel salvar as configuracoes.')
    } finally {
      isSaving.value = false
    }
  }

  function handleApiError (error: unknown, fallback: string): void {
    if (error instanceof ApiError) {
      if (error.status === 401 || error.status === 403) {
        showToast('Sessao expirada. Faca login novamente.', 'error')
        authStore.logout()
        router.push('/admin/login')
        return
      }

      if (error.status === 404) {
        showToast('Evento nao encontrado.', 'error')
        router.push('/admin/eventos')
        return
      }

      if (error.status === 422) {
        showToast('Dados invalidos. Revise os campos.', 'error')
        return
      }
    }

    showToast(fallback, 'error')
  }

  onMounted(() => {
    loadEvent()
  })
</script>

<style scoped>
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=Manrope:wght@400;500;700&display=swap');

  .event-config {
    min-height: calc(100vh - 64px);
    background:
      radial-gradient(circle at 16% 10%, rgba(69, 95, 126, 0.14), transparent 34%),
      radial-gradient(circle at 85% 24%, rgba(223, 121, 66, 0.16), transparent 30%),
      linear-gradient(145deg, #f6f9fb, #edf2f6 56%, #e8eef4 100%);
  }

  .config__hero,
  .event-config .v-sheet:last-of-type {
    border: 1px solid rgba(20, 33, 57, 0.1);
    background: rgba(255, 255, 255, 0.95);
    box-shadow: 0 12px 28px rgba(20, 33, 57, 0.08);
  }

  .config__eyebrow {
    margin: 0;
    color: #3d4f71;
    font-family: 'Manrope', sans-serif;
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.18em;
  }

  .config__title {
    margin: 10px 0 8px;
    color: #151f36;
    font-family: 'Cormorant Garamond', serif;
    font-size: clamp(2rem, 4vw, 3rem);
    line-height: 1.05;
  }

  .config__subtitle {
    margin: 0;
    color: #425273;
    font-family: 'Manrope', sans-serif;
    font-size: 0.94rem;
  }
</style>
