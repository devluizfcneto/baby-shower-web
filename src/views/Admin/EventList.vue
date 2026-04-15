<template>
  <section class="admin-events">
    <v-container class="py-8 py-md-12" max-width="1160">
      <v-sheet class="admin-events__hero pa-5 pa-md-7 mb-5" rounded="xl">
        <div class="d-flex flex-wrap align-center justify-space-between ga-3">
          <div>
            <p class="admin-events__eyebrow">PAINEL ADMIN</p>
            <h1 class="admin-events__title">Seus eventos</h1>
            <p class="admin-events__subtitle">Gerencie status, acompanhe numeros e navegue para os paineis de cada evento.</p>
          </div>

          <div class="d-flex flex-wrap ga-2">
            <v-chip color="primary" variant="tonal">{{ totalEventsLabel }}</v-chip>
            <v-btn
              color="error"
              prepend-icon="mdi-logout"
              rounded="pill"
              variant="tonal"
              @click="handleLogout"
            >
              Sair
            </v-btn>
          </div>
        </div>

        <v-row class="mt-2" dense>
          <v-col cols="12" md="5">
            <v-text-field
              v-model="filters.search"
              clearable
              density="comfortable"
              hide-details
              label="Buscar por nome"
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
            />
          </v-col>

          <v-col cols="12" md="3">
            <v-select
              v-model="filters.status"
              density="comfortable"
              hide-details
              :items="statusItems"
              label="Status"
              variant="outlined"
            />
          </v-col>

          <v-col cols="12" md="2">
            <v-select
              v-model="filters.perPage"
              density="comfortable"
              hide-details
              :items="perPageItems"
              label="Por pagina"
              variant="outlined"
            />
          </v-col>

          <v-col class="d-flex" cols="12" md="2">
            <v-btn
              block
              color="primary"
              :loading="isLoading"
              prepend-icon="mdi-refresh"
              rounded="pill"
              @click="fetchEvents"
            >
              Atualizar
            </v-btn>
          </v-col>
        </v-row>
      </v-sheet>

      <v-progress-linear
        v-if="isLoading"
        class="mb-4"
        color="primary"
        indeterminate
      />

      <v-row v-if="events.length > 0" dense>
        <v-col
          v-for="eventItem in events"
          :key="eventItem.id"
          cols="12"
          md="6"
        >
          <v-sheet class="event-card pa-4 pa-md-5" rounded="xl">
            <div class="d-flex align-start justify-space-between ga-3 mb-3">
              <div>
                <h2 class="event-card__title">{{ eventItem.name }}</h2>
                <p class="event-card__meta">{{ formatDate(eventItem.date) }}</p>
              </div>

              <v-chip
                :color="eventItem.isArchived ? 'warning' : 'success'"
                size="small"
                variant="flat"
              >
                {{ eventItem.isArchived ? 'Arquivado' : 'Ativo' }}
              </v-chip>
            </div>

            <div class="d-flex flex-wrap ga-2 mb-3">
              <v-chip color="primary" size="small" variant="tonal">
                Convidados: {{ eventItem.guestsCount }}
              </v-chip>
              <v-chip color="secondary" size="small" variant="tonal">
                Presentes: {{ eventItem.giftsCount }}
              </v-chip>
              <v-chip color="success" size="small" variant="tonal">
                Doacoes: {{ eventItem.donationsCount }}
              </v-chip>
            </div>

            <p class="event-card__code">
              Codigo publico: <strong>{{ eventItem.eventCode }}</strong>
            </p>

            <div class="d-flex flex-wrap ga-2 mt-4">
              <v-btn
                color="primary"
                rounded="pill"
                size="small"
                @click="openDashboard(eventItem.id, eventItem.eventCode)"
              >
                Abrir painel
              </v-btn>

              <v-btn
                rounded="pill"
                size="small"
                variant="outlined"
                @click="openEventConfig(eventItem.id, eventItem.eventCode)"
              >
                Editar
              </v-btn>

              <v-btn
                rounded="pill"
                size="small"
                variant="text"
                @click="copyPublicLink(eventItem.eventCode)"
              >
                Copiar link
              </v-btn>

              <v-btn
                :color="eventItem.isArchived ? 'success' : 'warning'"
                rounded="pill"
                size="small"
                variant="tonal"
                @click="toggleArchive(eventItem.eventCode, !eventItem.isArchived)"
              >
                {{ eventItem.isArchived ? 'Desarquivar' : 'Arquivar' }}
              </v-btn>

              <v-btn
                color="error"
                rounded="pill"
                size="small"
                variant="text"
                @click="openDeleteDialog(eventItem)"
              >
                Excluir
              </v-btn>
            </div>
          </v-sheet>
        </v-col>
      </v-row>

      <v-empty-state
        v-else-if="!isLoading"
        headline="Nenhum evento encontrado"
        icon="mdi-calendar-remove-outline"
        text="Ajuste seus filtros ou crie seu primeiro evento no backend para visualizar aqui."
      />

      <div v-if="events.length > 0" class="d-flex justify-end mt-4">
        <v-pagination
          v-model="filters.page"
          :length="paginationLength"
          rounded="circle"
          @update:model-value="fetchEvents"
        />
      </div>

      <v-dialog v-model="deleteDialog.visible" max-width="560">
        <v-card rounded="xl">
          <v-card-title class="text-h6">Excluir evento</v-card-title>
          <v-card-text>
            <p class="mb-3">
              Esta acao e irreversivel. Para confirmar, digite o nome do evento exatamente como abaixo.
            </p>
            <p class="mb-3"><strong>{{ deleteDialog.event?.name }}</strong></p>

            <v-text-field
              v-model="deleteDialog.confirmName"
              density="comfortable"
              label="Nome do evento"
              variant="outlined"
            />
          </v-card-text>
          <v-card-actions class="pb-4 px-4 d-flex ga-2">
            <v-btn
              color="error"
              :disabled="!canDelete"
              :loading="isDeleting"
              rounded="pill"
              @click="confirmDelete"
            >
              Excluir definitivamente
            </v-btn>
            <v-btn rounded="pill" variant="text" @click="closeDeleteDialog">
              Cancelar
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

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
  import type { AdminEventSummary } from '@/types/admin'
  import { computed, onMounted, reactive, ref, watch } from 'vue'
  import { useRouter } from 'vue-router'
  import {
    archiveAdminEventByCode,
    deleteAdminEventByCode,
    listAdminEvents,
  } from '@/api/adminApi'
  import { useAppToast } from '@/composables/useAppToast'
  import { ApiError } from '@/services/http'
  import { useAdminAuthStore } from '@/stores/useAdminAuthStore'

  const router = useRouter()
  const authStore = useAdminAuthStore()
  const { toast, toastLocation, showToast } = useAppToast()

  const events = ref<AdminEventSummary[]>([])
  const totalEvents = ref(0)
  const isLoading = ref(false)
  const isDeleting = ref(false)

  const filters = reactive({
    search: '',
    status: 'all',
    page: 1,
    perPage: 6,
  })

  const deleteDialog = reactive({
    visible: false,
    event: null as AdminEventSummary | null,
    confirmName: '',
  })

  const statusItems = [
    { title: 'Todos', value: 'all' },
    { title: 'Ativos', value: 'active' },
    { title: 'Arquivados', value: 'archived' },
  ]

  const perPageItems = [6, 12, 24]

  const paginationLength = computed(() => {
    return Math.max(1, Math.ceil(totalEvents.value / filters.perPage))
  })

  const totalEventsLabel = computed(() => `Total: ${totalEvents.value}`)

  const canDelete = computed(() => {
    const eventName = deleteDialog.event?.name || ''
    return deleteDialog.confirmName.trim().toLowerCase() === eventName.trim().toLowerCase()
  })

  function rememberEventMapping (eventId: string, eventCode: string) {
    localStorage.setItem(`admin:event-code:${eventId}`, eventCode)
  }

  function formatDate (value: string): string {
    if (!value) return 'Data nao informada'

    const parsed = new Date(value)
    if (Number.isNaN(parsed.getTime())) return value

    return new Intl.DateTimeFormat('pt-BR', {
      dateStyle: 'full',
      timeStyle: 'short',
    }).format(parsed)
  }

  async function fetchEvents (): Promise<void> {
    isLoading.value = true

    try {
      const response = await listAdminEvents({
        search: filters.search.trim() || undefined,
        status: filters.status === 'all' ? undefined : (filters.status as 'active' | 'archived'),
        page: filters.page,
        perPage: filters.perPage,
      })

      events.value = response.data
      totalEvents.value = response.total

      for (const item of events.value) {
        rememberEventMapping(item.id, item.eventCode)
      }
    } catch (error) {
      handleApiError(error, 'Nao foi possivel carregar seus eventos.')
    } finally {
      isLoading.value = false
    }
  }

  async function handleLogout (): Promise<void> {
    try {
      await authStore.logout()
      showToast('Sessao encerrada.', 'success')
      setTimeout(() => {
        router.push('/admin/login')
      }, 180)
    } catch {
      showToast('Nao foi possivel encerrar a sessao.', 'error')
    }
  }

  function openDashboard (eventId: string, eventCode: string): void {
    rememberEventMapping(eventId, eventCode)
    router.push({
      path: `/admin/eventos/${eventId}/dashboard`,
      query: { event_code: eventCode },
    })
  }

  function openEventConfig (eventId: string, eventCode: string): void {
    rememberEventMapping(eventId, eventCode)
    router.push({
      path: `/admin/eventos/${eventId}/configuracoes`,
      query: { event_code: eventCode },
    })
  }

  async function copyPublicLink (eventCode: string): Promise<void> {
    const publicUrl = `${window.location.origin}/evento/${eventCode}`

    try {
      await navigator.clipboard.writeText(publicUrl)
      showToast('Link publico copiado com sucesso.', 'success')
    } catch {
      showToast('Nao foi possivel copiar o link.', 'error')
    }
  }

  async function toggleArchive (eventCode: string, isArchived: boolean): Promise<void> {
    try {
      await archiveAdminEventByCode(eventCode, isArchived)
      showToast(isArchived ? 'Evento arquivado com sucesso.' : 'Evento reativado com sucesso.', 'success')
      await fetchEvents()
    } catch (error) {
      handleApiError(error, 'Nao foi possivel atualizar o status do evento.')
    }
  }

  function openDeleteDialog (eventItem: AdminEventSummary): void {
    deleteDialog.visible = true
    deleteDialog.event = eventItem
    deleteDialog.confirmName = ''
  }

  function closeDeleteDialog (): void {
    deleteDialog.visible = false
    deleteDialog.event = null
    deleteDialog.confirmName = ''
  }

  async function confirmDelete (): Promise<void> {
    if (!deleteDialog.event || !canDelete.value) return

    isDeleting.value = true

    try {
      await deleteAdminEventByCode(deleteDialog.event.eventCode, deleteDialog.confirmName.trim())
      showToast('Evento excluido com sucesso.', 'success')
      closeDeleteDialog()
      await fetchEvents()
    } catch (error) {
      handleApiError(error, 'Nao foi possivel excluir o evento.')
    } finally {
      isDeleting.value = false
    }
  }

  function handleApiError (error: unknown, fallbackMessage: string): void {
    if (error instanceof ApiError) {
      if (error.status === 401 || error.status === 403) {
        showToast('Sessao expirada. Faca login novamente.', 'error')
        authStore.logout()
        router.push('/admin/login')
        return
      }

      if (error.status === 404) {
        showToast('Evento nao encontrado.', 'error')
        return
      }

      if (error.status === 422) {
        showToast('Dados invalidos. Revise e tente novamente.', 'error')
        return
      }
    }

    showToast(fallbackMessage, 'error')
  }

  watch(() => filters.perPage, () => {
    filters.page = 1
    fetchEvents()
  })

  watch(() => filters.status, () => {
    filters.page = 1
    fetchEvents()
  })

  onMounted(() => {
    fetchEvents()
  })
</script>

<style scoped>
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=Manrope:wght@400;500;700&display=swap');

  .admin-events {
    min-height: calc(100vh - 64px);
    background:
      radial-gradient(circle at 14% 10%, rgba(69, 95, 126, 0.14), transparent 34%),
      radial-gradient(circle at 84% 22%, rgba(223, 121, 66, 0.16), transparent 30%),
      linear-gradient(145deg, #f6f9fb, #edf2f6 56%, #e8eef4 100%);
  }

  .admin-events__hero {
    border: 1px solid rgba(20, 33, 57, 0.1);
    background: linear-gradient(155deg, rgba(255, 255, 255, 0.96), rgba(236, 243, 247, 0.9));
    box-shadow: 0 18px 40px rgba(20, 33, 57, 0.1);
  }

  .admin-events__eyebrow {
    margin: 0;
    color: #3d4f71;
    font-family: 'Manrope', sans-serif;
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.18em;
  }

  .admin-events__title {
    margin: 10px 0 8px;
    color: #151f36;
    font-family: 'Cormorant Garamond', serif;
    font-size: clamp(2rem, 4vw, 3rem);
    line-height: 1.05;
  }

  .admin-events__subtitle {
    margin: 0;
    color: #425273;
    font-family: 'Manrope', sans-serif;
    font-size: 0.94rem;
  }

  .event-card {
    border: 1px solid rgba(20, 33, 57, 0.1);
    background: rgba(255, 255, 255, 0.95);
    box-shadow: 0 12px 28px rgba(20, 33, 57, 0.08);
    height: 100%;
  }

  .event-card__title {
    margin: 0;
    color: #151f36;
    font-family: 'Cormorant Garamond', serif;
    font-size: 1.7rem;
    line-height: 1.08;
  }

  .event-card__meta,
  .event-card__code {
    margin: 6px 0 0;
    color: #435374;
    font-family: 'Manrope', sans-serif;
    font-size: 0.9rem;
  }
</style>
