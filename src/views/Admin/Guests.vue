<template>
  <v-container class="py-10" max-width="1200">
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
      <div class="d-flex gap-3 flex-wrap">
        <v-text-field
          v-model="searchQuery"
          class="flex-grow-1"
          clearable
          density="compact"
          label="Buscar por nome ou e-mail"
          prepend-inner-icon="mdi-magnify"
          style="max-width: 300px"
        />
        <v-btn
          class="align-self-center"
          :disabled="!searchQuery"
          variant="tonal"
          @click="searchQuery = ''"
        >
          Limpar
        </v-btn>
      </div>
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
            <th class="text-left pa-4">Nome</th>
            <th class="text-left pa-4">E-mail</th>
            <th class="text-center pa-4">Acompanhantes</th>
            <th class="text-center pa-4">Total de Pessoas</th>
            <th class="text-left pa-4">Data de Confirmação</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="guest in filteredGuests" :key="guest.id" class="border-b">
            <td class="pa-4 font-weight-500">{{ guest.fullName }}</td>
            <td class="pa-4">{{ guest.email }}</td>
            <td class="text-center pa-4">
              <v-chip
                v-if="guest.companions.length > 0"
                color="info"
                size="small"
                variant="tonal"
              >
                {{ guest.companions.length }}
              </v-chip>
              <span v-else class="text-grey-600">—</span>
            </td>
            <td class="text-center pa-4 font-weight-500">
              <v-chip color="primary" size="small" variant="tonal">
                {{ guest.totalPeople }}
              </v-chip>
            </td>
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
    <v-card v-if="guests.length > 0 && !isLoading" class="mt-6 pa-6" color="blue-50" rounded="lg">
      <div class="d-flex gap-6 flex-wrap">
        <div>
          <p class="text-grey-700 text-sm">Total de Convidados</p>
          <p class="text-h6 font-weight-bold">{{ guests.length }}</p>
        </div>
        <div>
          <p class="text-grey-700 text-sm">Total de Pessoas (com acompanhantes)</p>
          <p class="text-h6 font-weight-bold">{{ totalPeople }}</p>
        </div>
        <div>
          <p class="text-grey-700 text-sm">Taxa de Confirmação</p>
          <p class="text-h6 font-weight-bold">100%</p>
        </div>
      </div>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
  import type { ApiError } from '@/services/http'
  import type { AdminGuest } from '@/types/admin'
  import { computed, onMounted, ref } from 'vue'
  import { useRoute } from 'vue-router'
  import { exportAdminGuestsCsv, listAdminEventGuests } from '@/api/adminApi'
  import { useAppToast } from '@/composables/useAppToast'

  const route = useRoute()
  const { showToast } = useAppToast()

  const guests = ref<AdminGuest[]>([])
  const searchQuery = ref('')
  const isLoading = ref(false)
  const isExporting = ref(false)

  const eventId = computed(() => route.params.event_id as string)

  const filteredGuests = computed(() => {
    if (!searchQuery.value) return guests.value

    const query = searchQuery.value.toLowerCase()
    return guests.value.filter(
      g =>
        g.fullName.toLowerCase().includes(query)
        || g.email.toLowerCase().includes(query),
    )
  })

  const totalPeople = computed(() =>
    guests.value.reduce((sum, g) => sum + g.totalPeople, 0),
  )

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
      guests.value = await listAdminEventGuests(eventId.value)
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
      const blob = await exportAdminGuestsCsv(eventId.value)
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
</style>
