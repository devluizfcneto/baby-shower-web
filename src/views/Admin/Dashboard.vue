<template>
  <section class="admin-dashboard">
    <v-container class="py-8 py-md-12" max-width="1120">
      <v-sheet class="dashboard__hero pa-5 pa-md-7 mb-5" rounded="xl">
        <div class="d-flex flex-wrap align-center justify-space-between ga-3">
          <div>
            <p class="dashboard__eyebrow">VISAO GERAL</p>
            <h1 class="dashboard__title">Dashboard do evento</h1>
            <p class="dashboard__subtitle">Acompanhe em tempo real os principais numeros do seu evento.</p>
          </div>

          <v-btn
            color="primary"
            prepend-icon="mdi-arrow-left"
            rounded="pill"
            variant="tonal"
            @click="router.push('/admin/eventos')"
          >
            Voltar para eventos
          </v-btn>
        </div>

        <div class="d-flex flex-wrap ga-2 mt-4">
          <v-btn rounded="pill" variant="text" @click="goToSection('config')">Configuracoes</v-btn>
          <v-btn rounded="pill" variant="text" @click="goToSection('gifts')">Presentes</v-btn>
          <v-btn rounded="pill" variant="text" @click="goToSection('guests')">Convidados e compras</v-btn>
          <v-btn rounded="pill" variant="text" @click="goToSection('donations')">Doacoes</v-btn>
        </div>
      </v-sheet>

      <v-progress-linear v-if="isLoading" class="mb-4" color="primary" indeterminate />

      <v-row v-else dense>
        <v-col
          v-for="card in cards"
          :key="card.title"
          cols="12"
          lg="3"
          md="6"
        >
          <v-sheet class="metric-card pa-4" rounded="xl">
            <p class="metric-card__label">{{ card.title }}</p>
            <h2 class="metric-card__value">{{ card.value }}</h2>
            <p class="metric-card__desc">{{ card.description }}</p>
          </v-sheet>
        </v-col>
      </v-row>

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
  import { computed, onMounted, ref } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { getAdminEventDashboard } from '@/api/adminApi'
  import { useAppToast } from '@/composables/useAppToast'
  import { ApiError } from '@/services/http'
  import { useAdminAuthStore } from '@/stores/useAdminAuthStore'

  const route = useRoute()
  const router = useRouter()
  const authStore = useAdminAuthStore()
  const { toast, toastLocation, showToast } = useAppToast()

  const isLoading = ref(false)
  const metrics = ref({
    guestsCount: 0,
    giftsCount: 0,
    purchasesCount: 0,
    donationsCount: 0,
  })

  const eventId = computed(() => String(route.params.event_id || ''))
  const eventCode = computed(() => {
    const routeCode = typeof route.query.event_code === 'string' ? route.query.event_code : ''

    if (routeCode) {
      localStorage.setItem(`admin:event-code:${eventId.value}`, routeCode)
      return routeCode
    }

    return localStorage.getItem(`admin:event-code:${eventId.value}`) || ''
  })

  const cards = computed(() => [
    {
      title: 'Convidados confirmados',
      value: metrics.value.guestsCount,
      description: 'Total de RSVPs recebidos.',
    },
    {
      title: 'Presentes cadastrados',
      value: metrics.value.giftsCount,
      description: 'Itens disponiveis para os convidados.',
    },
    {
      title: 'Compras declaradas',
      value: metrics.value.purchasesCount,
      description: 'Confirmacoes de compra registradas.',
    },
    {
      title: 'Doacoes declaradas',
      value: metrics.value.donationsCount,
      description: 'Contribuicoes informadas no sistema.',
    },
  ])

  async function loadDashboard (): Promise<void> {
    if (!eventId.value) {
      showToast('Evento invalido.', 'error')
      return
    }

    isLoading.value = true

    try {
      metrics.value = await getAdminEventDashboard(eventId.value)
    } catch (error) {
      handleApiError(error)
    } finally {
      isLoading.value = false
    }
  }

  function goToSection (target: 'config' | 'gifts' | 'guests' | 'donations') {
    const base = `/admin/eventos/${eventId.value}`
    const query = eventCode.value ? { event_code: eventCode.value } : undefined

    if (target === 'config') {
      router.push({ path: `${base}/configuracoes`, query })
      return
    }

    if (target === 'gifts') {
      router.push({ path: `${base}/presentes`, query })
      return
    }

    if (target === 'guests') {
      router.push({ path: `${base}/convidados`, query })
      return
    }

    router.push({ path: `${base}/doacoes`, query })
  }

  function handleApiError (error: unknown): void {
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
    }

    showToast('Nao foi possivel carregar o dashboard.', 'error')
  }

  onMounted(() => {
    loadDashboard()
  })
</script>

<style scoped>
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=Manrope:wght@400;500;700&display=swap');

  .admin-dashboard {
    min-height: calc(100vh - 64px);
    background:
      radial-gradient(circle at 18% 12%, rgba(70, 97, 128, 0.14), transparent 36%),
      radial-gradient(circle at 84% 24%, rgba(224, 122, 66, 0.15), transparent 31%),
      linear-gradient(145deg, #f6f9fb, #edf2f6 56%, #e8eef4 100%);
  }

  .dashboard__hero {
    border: 1px solid rgba(20, 33, 57, 0.1);
    background: linear-gradient(155deg, rgba(255, 255, 255, 0.96), rgba(236, 243, 247, 0.9));
    box-shadow: 0 18px 40px rgba(20, 33, 57, 0.1);
  }

  .dashboard__eyebrow {
    margin: 0;
    color: #3d4f71;
    font-family: 'Manrope', sans-serif;
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.18em;
  }

  .dashboard__title {
    margin: 10px 0 8px;
    color: #151f36;
    font-family: 'Cormorant Garamond', serif;
    font-size: clamp(2rem, 4vw, 3rem);
    line-height: 1.05;
  }

  .dashboard__subtitle {
    margin: 0;
    color: #425273;
    font-family: 'Manrope', sans-serif;
    font-size: 0.94rem;
  }

  .metric-card {
    border: 1px solid rgba(20, 33, 57, 0.1);
    background: rgba(255, 255, 255, 0.95);
    box-shadow: 0 12px 28px rgba(20, 33, 57, 0.08);
    height: 100%;
  }

  .metric-card__label {
    margin: 0;
    color: #3f5072;
    font-family: 'Manrope', sans-serif;
    font-size: 0.84rem;
  }

  .metric-card__value {
    margin: 8px 0;
    color: #151f36;
    font-family: 'Cormorant Garamond', serif;
    font-size: clamp(2rem, 4vw, 2.8rem);
    line-height: 1;
  }

  .metric-card__desc {
    margin: 0;
    color: #425273;
    font-family: 'Manrope', sans-serif;
    font-size: 0.88rem;
  }
</style>
