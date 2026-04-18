<template>
  <section class="admin-dashboard">
    <v-container class="py-8 py-md-12" max-width="1440">
      <v-sheet class="dashboard__hero pa-5 pa-md-7 mb-5" rounded="xl">
        <div class="d-flex flex-wrap align-center justify-space-between ga-3">
          <div>
            <p class="dashboard__eyebrow">VISAO GERAL</p>
            <h1 class="dashboard__title">Dashboard do evento</h1>
            <p class="dashboard__subtitle">
              Acompanhe em tempo real os principais numeros e todas as configuracoes do seu evento.
            </p>
          </div>

          <div class="d-flex flex-wrap ga-2">
            <v-btn
              color="primary"
              prepend-icon="mdi-arrow-left"
              rounded="pill"
              variant="tonal"
              @click="router.push('/admin/eventos')"
            >
              Voltar para eventos
            </v-btn>

            <v-btn
              v-if="publicEventUrl"
              color="secondary"
              prepend-icon="mdi-open-in-new"
              rounded="pill"
              variant="tonal"
              @click="openPublicEvent"
            >
              Abrir pagina publica
            </v-btn>

            <v-btn
              v-if="eventCode"
              color="primary"
              prepend-icon="mdi-content-copy"
              rounded="pill"
              variant="text"
              @click="copyPublicLink"
            >
              Copiar link publico
            </v-btn>
          </div>
        </div>

        <div class="d-flex flex-wrap ga-2 mt-4">
          <v-btn rounded="pill" variant="text" @click="goToSection('config')">Configuracoes</v-btn>
          <v-btn rounded="pill" variant="text" @click="goToSection('gifts')">Presentes</v-btn>
          <v-btn rounded="pill" variant="text" @click="goToSection('guests')">Convidados</v-btn>
          <v-btn rounded="pill" variant="text" @click="goToSection('donations')">Doacoes</v-btn>
        </div>
      </v-sheet>

      <v-progress-linear v-if="isLoading" class="mb-4" color="primary" indeterminate />

      <v-row v-else-if="event" class="mb-5" dense>
        <v-col cols="12" lg="7">
          <v-sheet class="detail-card pa-5 pa-md-6 h-100" rounded="xl">
            <div class="d-flex flex-wrap align-start justify-space-between ga-3 mb-4">
              <div>
                <p class="detail-card__eyebrow">DETALHES DO EVENTO</p>
                <h2 class="detail-card__title">{{ event.name }}</h2>
                <p class="detail-card__subtitle">
                  Codigo publico: <strong>{{ event.eventCode }}</strong>
                </p>
              </div>

              <v-chip
                :color="event.isArchived ? 'warning' : 'success'"
                size="small"
                variant="flat"
              >
                {{ event.isArchived ? 'Arquivado' : 'Ativo' }}
              </v-chip>
            </div>

            <v-row dense>
              <v-col cols="12" md="6">
                <div class="detail-field">
                  <span class="detail-field__label">Data e horario</span>
                  <strong class="detail-field__value">{{ formatEventDate(event.date) }}</strong>
                </div>
              </v-col>

              <v-col cols="12" md="6">
                <div class="detail-field">
                  <span class="detail-field__label">Codigo publico do evento</span>
                  <strong class="detail-field__value">{{ event.eventCode }}</strong>
                </div>
              </v-col>

              <v-col cols="12">
                <div class="detail-field">
                  <span class="detail-field__label">Endereco do evento</span>
                  <strong class="detail-field__value">{{ event.venueAddress }}</strong>
                </div>
              </v-col>

              <v-col cols="12">
                <div class="detail-field">
                  <span class="detail-field__label">Endereco de entrega principal</span>
                  <strong class="detail-field__value">{{ event.deliveryAddress || 'Nao informado' }}</strong>
                </div>
              </v-col>

              <v-col cols="12">
                <div class="detail-field">
                  <span class="detail-field__label">Endereco de entrega secundario</span>
                  <strong class="detail-field__value">{{ event.deliveryAddress2 || 'Nao informado' }}</strong>
                </div>
              </v-col>

              <v-col cols="12">
                <div class="detail-field">
                  <span class="detail-field__label">Endereco de entrega reserva</span>
                  <strong class="detail-field__value">{{ event.deliveryAddress3 || 'Nao informado' }}</strong>
                </div>
              </v-col>

              <v-col cols="12">
                <div class="detail-field">
                  <span class="detail-field__label">Detalhes do evento</span>
                  <strong class="detail-field__value text-break">{{ event.eventDetail || 'Nao informado' }}</strong>
                </div>
              </v-col>

              <v-col cols="12">
                <div class="detail-field">
                  <span class="detail-field__label">Google Maps</span>
                  <div class="d-flex flex-wrap align-center ga-2">
                    <strong class="detail-field__value text-break">{{ event.mapsLink || 'Nao informado' }}</strong>
                    <v-btn
                      v-if="event.mapsLink"
                      color="primary"
                      density="comfortable"
                      prepend-icon="mdi-open-in-new"
                      rounded="pill"
                      size="small"
                      variant="tonal"
                      @click="openExternal(event.mapsLink)"
                    >
                      Abrir
                    </v-btn>
                  </div>
                </div>
              </v-col>
            </v-row>

            <div v-if="event.coverImageUrl" class="mt-5">
              <p class="detail-card__eyebrow mb-2">IMAGEM DE CAPA</p>
              <v-sheet class="cover-preview" rounded="lg">
                <v-img cover height="240" :src="event.coverImageUrl" />
              </v-sheet>
            </div>
          </v-sheet>
        </v-col>

        <v-col cols="12" lg="5">
          <v-row dense>
            <v-col cols="12" lg="12" md="6">
              <v-sheet class="metric-card pa-4" rounded="xl">
                <p class="metric-card__label">Convidados confirmados</p>
                <h2 class="metric-card__value">{{ metrics.guestsCount }}</h2>
                <p class="metric-card__desc">Total de RSVPs recebidos.</p>
              </v-sheet>
            </v-col>

            <v-col cols="12" lg="12" md="6">
              <v-sheet class="metric-card pa-4" rounded="xl">
                <p class="metric-card__label">Presentes cadastrados</p>
                <h2 class="metric-card__value">{{ metrics.giftsCount }}</h2>
                <p class="metric-card__desc">Itens disponiveis para os convidados.</p>
              </v-sheet>
            </v-col>

            <v-col cols="12" lg="12" md="6">
              <v-sheet class="metric-card pa-4" rounded="xl">
                <p class="metric-card__label">Compras confirmadas / Total possivel</p>
                <h2 class="metric-card__value">{{ metrics.unitsConfirmed }} / {{ metrics.totalPossibleUnits }}</h2>
                <p class="metric-card__desc">Unidades confirmadas em relacao ao limite da lista.</p>
              </v-sheet>
            </v-col>

            <v-col cols="12" lg="12" md="6">
              <v-sheet class="metric-card pa-4" rounded="xl">
                <p class="metric-card__label">Confirmacoes de compra</p>
                <h2 class="metric-card__value">{{ metrics.purchasesCount }}</h2>
                <p class="metric-card__desc">Registros de confirmacao enviados pelos convidados.</p>
              </v-sheet>
            </v-col>

            <v-col cols="12" lg="12" md="6">
              <v-sheet class="metric-card pa-4" rounded="xl">
                <p class="metric-card__label">Compradores unicos</p>
                <h2 class="metric-card__value">{{ metrics.uniqueBuyers }}</h2>
                <p class="metric-card__desc">Pessoas diferentes que confirmaram compras.</p>
              </v-sheet>
            </v-col>
          </v-row>
        </v-col>

        <v-col cols="12">
          <v-sheet class="detail-card pa-5 pa-md-6" rounded="xl">
            <div class="d-flex flex-wrap align-center justify-space-between ga-3 mb-4">
              <div>
                <p class="detail-card__eyebrow">CONFIGURACOES PIX</p>
                <h2 class="detail-card__title detail-card__title--compact">Dados financeiros do evento</h2>
              </div>
              <v-chip color="info" variant="tonal">{{ pixSummary }}</v-chip>
            </div>

            <v-row dense>
              <v-col cols="12" md="6">
                <div class="detail-field">
                  <span class="detail-field__label">Chave Pix do papai</span>
                  <div class="d-flex flex-wrap align-center ga-2">
                    <strong class="detail-field__value text-break">{{ event.pixKeyDad || 'Nao informada' }}</strong>
                    <v-btn
                      v-if="event.pixKeyDad"
                      color="primary"
                      density="comfortable"
                      prepend-icon="mdi-content-copy"
                      rounded="pill"
                      size="small"
                      variant="text"
                      @click="copyText(event.pixKeyDad, 'Chave Pix do papai copiada.')"
                    >
                      Copiar
                    </v-btn>
                  </div>
                </div>
              </v-col>

              <v-col cols="12" md="6">
                <div class="detail-field">
                  <span class="detail-field__label">Chave Pix da mamae</span>
                  <div class="d-flex flex-wrap align-center ga-2">
                    <strong class="detail-field__value text-break">{{ event.pixKeyMom || 'Nao informada' }}</strong>
                    <v-btn
                      v-if="event.pixKeyMom"
                      color="primary"
                      density="comfortable"
                      prepend-icon="mdi-content-copy"
                      rounded="pill"
                      size="small"
                      variant="text"
                      @click="copyText(event.pixKeyMom, 'Chave Pix da mamae copiada.')"
                    >
                      Copiar
                    </v-btn>
                  </div>
                </div>
              </v-col>
            </v-row>
          </v-sheet>
        </v-col>
      </v-row>

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
  import type { AdminEventDetails, AdminEventSummary } from '@/types/admin'
  import { computed, onMounted, ref } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import {
    getAdminEventById,
    getAdminEventPurchaseSummary,
    listAdminEventGifts,
    listAdminEvents,
  } from '@/api/adminApi'
  import { useAppToast } from '@/composables/useAppToast'
  import { ApiError } from '@/services/http'
  import { useAdminAuthStore } from '@/stores/useAdminAuthStore'

  const route = useRoute()
  const router = useRouter()
  const authStore = useAdminAuthStore()
  const { toast, toastLocation, showToast } = useAppToast()

  const isLoading = ref(false)
  const event = ref<AdminEventDetails | null>(null)
  const metrics = ref({
    guestsCount: 0,
    giftsCount: 0,
    purchasesCount: 0,
    unitsConfirmed: 0,
    totalPossibleUnits: 0,
    uniqueBuyers: 0,
  })

  const eventId = computed(() => String(route.params.event_id || ''))
  const storedEventCode = computed(() => {
    const routeCode = typeof route.query.event_code === 'string' ? route.query.event_code : ''

    if (routeCode) {
      localStorage.setItem(`admin:event-code:${eventId.value}`, routeCode)
      return routeCode
    }

    return localStorage.getItem(`admin:event-code:${eventId.value}`) || ''
  })

  const eventCode = computed(() => event.value?.eventCode || storedEventCode.value)

  const publicEventUrl = computed(() => {
    if (!eventCode.value) {
      return ''
    }

    return new URL(`/evento/${eventCode.value}`, window.location.origin).toString()
  })

  const pixSummary = computed(() => {
    const available = [event.value?.pixKeyDad, event.value?.pixKeyMom].filter(Boolean).length

    if (!available) {
      return 'Nenhuma chave Pix configurada'
    }

    return `${available} chave${available > 1 ? 's' : ''} Pix configurada${available > 1 ? 's' : ''}`
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
      title: 'Compras confirmadas / Total possivel',
      value: `${metrics.value.unitsConfirmed} / ${metrics.value.totalPossibleUnits}`,
      description: 'Unidades confirmadas em relacao ao limite da lista.',
    },
    {
      title: 'Confirmacoes de compra',
      value: metrics.value.purchasesCount,
      description: 'Registros de confirmacao enviados pelos convidados.',
    },
    {
      title: 'Compradores unicos',
      value: metrics.value.uniqueBuyers,
      description: 'Pessoas diferentes que confirmaram compras.',
    },
  ])

  function findSummaryByEvent (events: AdminEventSummary[], eventResult: AdminEventDetails): AdminEventSummary | undefined {
    return events.find(item => item.id === eventResult.id || item.eventCode === eventResult.eventCode)
  }

  async function resolveSummary (eventResult: AdminEventDetails): Promise<AdminEventSummary | undefined> {
    const firstBatch = await listAdminEvents({ page: 1, perPage: 100 })
    const directMatch = findSummaryByEvent(firstBatch.data, eventResult)

    if (directMatch) {
      return directMatch
    }

    if (!eventResult.name) {
      return undefined
    }

    const fallbackBatch = await listAdminEvents({ page: 1, perPage: 20, search: eventResult.name })
    return findSummaryByEvent(fallbackBatch.data, eventResult)
  }

  async function loadDashboard (): Promise<void> {
    if (!eventId.value) {
      showToast('Evento invalido.', 'error')
      return
    }

    isLoading.value = true

    try {
      const eventResult = await getAdminEventById(eventId.value)
      event.value = eventResult
      localStorage.setItem(`admin:event-code:${eventId.value}`, eventResult.eventCode)

      const [summary, gifts, purchaseSummary] = await Promise.all([
        resolveSummary(eventResult),
        listAdminEventGifts(eventId.value),
        getAdminEventPurchaseSummary(eventId.value),
      ])

      const totalPossibleUnits = gifts.reduce((sum, gift) => sum + gift.maxQuantity, 0)

      metrics.value = {
        guestsCount: summary?.guestsCount ?? eventResult.guestsCount,
        giftsCount: summary?.giftsCount ?? gifts.length ?? eventResult.giftsCount,
        purchasesCount: purchaseSummary.confirmations,
        unitsConfirmed: purchaseSummary.unitsConfirmed,
        totalPossibleUnits,
        uniqueBuyers: purchaseSummary.buyersUnique,
      }
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

  function formatEventDate (value: string): string {
    if (!value) {
      return 'Data nao informada'
    }

    const parsed = new Date(value)

    if (Number.isNaN(parsed.getTime())) {
      return value
    }

    return new Intl.DateTimeFormat('pt-BR', {
      dateStyle: 'full',
      timeStyle: 'short',
    }).format(parsed)
  }

  async function copyText (text: string, successMessage: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(text)
      showToast(successMessage, 'success')
    } catch {
      showToast('Nao foi possivel copiar o texto.', 'error')
    }
  }

  async function copyPublicLink (): Promise<void> {
    if (!publicEventUrl.value) {
      return
    }

    await copyText(publicEventUrl.value, 'Link publico copiado.')
  }

  function openPublicEvent (): void {
    if (!publicEventUrl.value) {
      return
    }

    window.open(publicEventUrl.value, '_blank', 'noopener,noreferrer')
  }

  function openExternal (url: string): void {
    window.open(url, '_blank', 'noopener,noreferrer')
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

  .detail-card {
    border: 1px solid rgba(20, 33, 57, 0.1);
    background: rgba(255, 255, 255, 0.95);
    box-shadow: 0 16px 34px rgba(20, 33, 57, 0.08);
  }

  .detail-card__eyebrow {
    margin: 0;
    color: #3d4f71;
    font-family: 'Manrope', sans-serif;
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.18em;
  }

  .detail-card__title {
    margin: 8px 0 6px;
    color: #151f36;
    font-family: 'Cormorant Garamond', serif;
    font-size: clamp(2rem, 4vw, 2.75rem);
    line-height: 1.05;
  }

  .detail-card__title--compact {
    font-size: clamp(1.7rem, 3vw, 2.2rem);
  }

  .detail-card__subtitle {
    margin: 0;
    color: #425273;
    font-family: 'Manrope', sans-serif;
    font-size: 0.94rem;
  }

  .detail-field {
    padding: 14px 0;
    border-bottom: 1px solid rgba(20, 33, 57, 0.08);
  }

  .detail-field:last-child {
    border-bottom: 0;
  }

  .detail-field__label {
    display: block;
    margin-bottom: 6px;
    color: #5c6b89;
    font-family: 'Manrope', sans-serif;
    font-size: 0.76rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .detail-field__value {
    color: #151f36;
    font-family: 'Manrope', sans-serif;
    font-size: 0.98rem;
    line-height: 1.5;
  }

  .cover-preview {
    border: 1px solid rgba(20, 33, 57, 0.08);
    overflow: hidden;
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
