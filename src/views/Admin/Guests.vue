<template>
  <v-container class="py-10" max-width="1440">
    <!-- Header -->
    <div class="d-flex align-center justify-space-between mb-6">
      <div>
        <v-btn class="mr-3" icon="mdi-arrow-left" variant="tonal" @click="$router.back()" />
        <h1 class="text-h4 d-inline-block font-serif">Convidados</h1>
      </div>
      <v-btn
        color="success"
        :disabled="guests.length === 0"
        :loading="isExporting"
        prepend-icon="mdi-download"
        @click="downloadCsv"
      >
        Exportar CSV
      </v-btn>
    </div>

    <!-- Search & Filters -->
    <v-card class="pa-4 mb-6" rounded="lg">
      <v-row class="align-center" dense>
        <v-col class="d-flex" cols="12" lg="9" md="8">
          <v-text-field
            v-model="searchQuery"
            class="flex-grow-1"
            clearable
            density="comfortable"
            label="Buscar por nome ou e-mail"
            prepend-inner-icon="mdi-magnify"
            variant="outlined"
          />
        </v-col>
        <v-col class="d-flex" cols="12" lg="3" md="4">
          <v-btn
            block
            :disabled="!searchQuery"
            height="56"
            variant="tonal"
            @click="searchQuery = ''"
          >
            Limpar
          </v-btn>
        </v-col>
      </v-row>
    </v-card>

    <!-- Loading State -->
    <v-progress-linear
      v-if="isLoading"
      class="mb-4"
      color="primary"
      indeterminate
    />

    <!-- Guests Table -->
    <v-card v-if="!isLoading" class="overflow-auto" rounded="lg">
      <v-table v-if="filteredGuests.length > 0" class="text-sm">
        <thead>
          <tr class="bg-grey-100">
            <th class="text-center pa-4">#</th>
            <th class="text-left pa-4">Nome</th>
            <th class="text-left pa-4">Tipo</th>
            <th class="text-left pa-4">E-mail</th>
            <th class="text-left pa-4">Data de Confirmação</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="guest in numberedGuests" :key="guest.id" class="border-b">
            <td class="text-center pa-4 font-weight-bold">{{ guest.position }}</td>
            <td class="pa-4 font-weight-500">{{ guest.fullName }}</td>
            <td class="pa-4">
              <v-chip
                :color="guest.rowType === 'guest' ? 'primary' : 'secondary'"
                size="small"
                variant="tonal"
              >
                {{ guest.rowType === 'guest' ? 'Convidado' : 'Acompanhante' }}
              </v-chip>
            </td>
            <td class="pa-4">{{ guest.email || '—' }}</td>
            <td class="pa-4 text-grey-700">
              {{ formatDate(guest.confirmedAt) }}
            </td>
          </tr>
        </tbody>
      </v-table>

      <!-- Empty State -->
      <div v-else class="pa-8 text-center">
        <v-icon class="text-grey-400 mb-4" size="48">mdi-account-multiple-outline</v-icon>
        <p class="text-h6 mb-2">Nenhum convidado confirmado</p>
        <p class="text-grey-600">Os convidados que confirmarem presença aparecerão aqui.</p>
      </div>
    </v-card>

    <!-- Summary Stats -->
    <v-card v-if="guests.length > 0 && !isLoading" class="mt-6 pa-5 guests-summary" rounded="lg">
      <div class="summary-grid">
        <div class="summary-item">
          <p class="summary-item__label">Total de Convidados</p>
          <p class="summary-item__value">{{ guestsSummary.guests }}</p>
        </div>
        <div class="summary-item">
          <p class="summary-item__label">Total de Acompanhantes</p>
          <p class="summary-item__value">{{ guestsSummary.companions }}</p>
        </div>
        <div class="summary-item">
          <p class="summary-item__label">Total de Pessoas</p>
          <p class="summary-item__value">{{ guestsSummary.totalPeople }}</p>
        </div>
      </div>
    </v-card>

    <v-snackbar
      v-model="toast.visible"
      :color="toast.color"
      :location="toastLocation"
      :timeout="2000"
    >
      {{ toast.message }}
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
  import type { ApiError } from '@/services/http'
  import type { AdminGuest, AdminGuestsSummary } from '@/types/admin'
  import { computed, onMounted, ref } from 'vue'
  import { useRoute } from 'vue-router'
  import { listAdminEventGuests } from '@/api/adminApi'
  import { useAppToast } from '@/composables/useAppToast'

  const route = useRoute()
  const { toast, toastLocation, showToast } = useAppToast()

  const guests = ref<AdminGuest[]>([])
  const guestsSummary = ref<AdminGuestsSummary>({
    guests: 0,
    companions: 0,
    totalPeople: 0,
  })
  const searchQuery = ref('')
  const isLoading = ref(false)
  const isExporting = ref(false)

  const eventId = computed(() => route.params.event_id as string)

  const filteredGuests = computed<AdminGuest[]>(() => {
    if (!searchQuery.value) return guests.value

    const query = searchQuery.value.toLowerCase()
    return guests.value.filter(
      g =>
        g.fullName.toLowerCase().includes(query)
        || (g.email || '').toLowerCase().includes(query),
    )
  })

  const numberedGuests = computed(() =>
    filteredGuests.value.map((guest, index) => ({
      ...guest,
      position: index + 1,
    })),
  )

  function escapeCsvValue (value: string | number): string {
    const normalized = String(value).replaceAll('"', '""')
    return `"${normalized}"`
  }

  function formatDate (dateString: string): string {
    try {
      const date = new Date(dateString)
      return new Intl.DateTimeFormat('pt-BR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }).format(date)
    } catch {
      return dateString
    }
  }

  async function loadGuests () {
    isLoading.value = true
    try {
      const response = await listAdminEventGuests(eventId.value)
      guests.value = response.data
      guestsSummary.value = response.summary
    } catch (error) {
      const apiError = error as ApiError
      const message
        = apiError.status === 404
          ? 'Evento não encontrado'
          : 'Erro ao carregar convidados'
      showToast(message, 'error')
    } finally {
      isLoading.value = false
    }
  }

  async function downloadCsv () {
    isExporting.value = true
    try {
      const header = ['#', 'Nome', 'Tipo', 'E-mail', 'Confirmado em']
      const lines = numberedGuests.value.map(guest => {
        return [
          guest.position,
          guest.fullName,
          guest.rowType === 'guest' ? 'Convidado' : 'Acompanhante',
          guest.email || '',
          formatDate(guest.confirmedAt),
        ].map(value => escapeCsvValue(value)).join(',')
      })

      const csv = [header.map(value => escapeCsvValue(value)).join(','), ...lines].join('\n')
      const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `convidados-${new Date().toISOString().split('T')[0]}.csv`
      document.body.append(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
      showToast('Arquivo exportado com sucesso', 'success')
    } catch {
      showToast('Erro ao exportar CSV', 'error')
    } finally {
      isExporting.value = false
    }
  }

  onMounted(() => {
    loadGuests()
  })
</script>

<style scoped lang="scss">
::v-deep(.v-table) {
  tbody tr:hover {
    background-color: rgba(0, 0, 0, 0.02);
  }
}

.bg-grey-100 {
  background-color: #f5f5f5;
}

.text-grey-600 {
  color: #757575;
}

.text-grey-700 {
  color: #616161;
}

.text-grey-400 {
  color: #bdbdbd;
}

.font-serif {
  font-family: 'Cormorant Garamond', serif;
  font-size: 2.5rem;
  font-weight: 500;
}

.guests-summary {
  border: 1px solid rgba(16, 64, 126, 0.14);
  background: linear-gradient(145deg, #f8fbff, #eaf3ff 56%, #e1ecff);
}

.summary-grid {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}

.summary-item {
  padding: 12px 14px;
  border: 1px solid rgba(16, 64, 126, 0.16);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.9);
}

.summary-item__label {
  margin: 0;
  color: #4d5e7c;
  font-size: 0.82rem;
  font-weight: 600;
}

.summary-item__value {
  margin: 4px 0 0;
  color: #14213a;
  font-size: 1.55rem;
  font-weight: 700;
}
</style>
