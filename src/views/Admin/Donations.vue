<template>
  <v-container class="py-10" max-width="1200">
    <!-- Header -->
    <div class="d-flex align-center justify-space-between mb-6">
      <div>
        <v-btn
          class="mr-3"
          icon="mdi-arrow-left"
          variant="tonal"
          @click="$router.back()"
        />
        <h1 class="text-h4 d-inline-block font-serif">Compras & Doações</h1>
      </div>
    </div>

    <!-- Tabs -->
    <v-tabs v-model="activeTab" class="mb-6">
      <v-tab value="purchases">
        <v-icon start>mdi-gift-outline</v-icon>
        Confirmações de Compra
      </v-tab>
      <v-tab value="donations">
        <v-icon start>mdi-heart-outline</v-icon>
        Doações PIX
      </v-tab>
    </v-tabs>

    <!-- PURCHASES TAB -->
    <div v-show="activeTab === 'purchases'">
      <!-- Export Button -->
      <div class="mb-4 d-flex justify-end">
        <v-btn
          color="success"
          :disabled="purchases.length === 0"
          :loading="isExportingPurchases"
          prepend-icon="mdi-download"
          @click="downloadPurchasesCsv"
        >
          Exportar CSV
        </v-btn>
      </div>

      <!-- Loading State -->
      <v-progress-linear
        v-if="isLoadingPurchases"
        class="mb-4"
        color="primary"
        indeterminate
      />

      <!-- Purchases Table -->
      <v-card v-if="!isLoadingPurchases" class="overflow-auto" rounded="lg">
        <v-table v-if="purchases.length > 0" class="text-sm">
          <thead>
            <tr class="bg-grey-100">
              <th class="text-left pa-4">Presente</th>
              <th class="text-left pa-4">Convidado</th>
              <th class="text-left pa-4">E-mail</th>
              <th class="text-center pa-4">Quantidade</th>
              <th class="text-left pa-4">Número do Pedido</th>
              <th class="text-left pa-4">Data de Confirmação</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="purchase in purchases"
              :key="purchase.id"
              class="border-b"
            >
              <td class="pa-4">
                <v-chip color="primary" size="small" variant="tonal">
                  {{ purchase.giftName }}
                </v-chip>
              </td>
              <td class="pa-4 font-weight-500">{{ purchase.guestName }}</td>
              <td class="pa-4">{{ purchase.guestEmail }}</td>
              <td class="text-center pa-4 font-weight-500">
                {{ purchase.quantity }}
              </td>
              <td class="pa-4 font-mono text-grey-700">
                {{ purchase.orderNumber || "—" }}
              </td>
              <td class="pa-4 text-grey-700">
                {{ formatDate(purchase.confirmedAt) }}
              </td>
            </tr>
          </tbody>
        </v-table>

        <!-- Empty State -->
        <div v-else class="pa-8 text-center">
          <v-icon class="text-grey-400 mb-4" size="48">mdi-gift-outline</v-icon>
          <p class="text-h6 mb-2">Nenhuma confirmação de compra</p>
          <p class="text-grey-600">
            As confirmações de compra dos presentes aparecerão aqui.
          </p>
        </div>
      </v-card>

      <!-- Purchase Summary -->
      <v-card
        v-if="purchases.length > 0 && !isLoadingPurchases"
        class="mt-6 pa-6"
        color="blue-50"
        rounded="lg"
      >
        <div class="d-flex gap-6 flex-wrap">
          <div>
            <p class="text-grey-700 text-sm">Total de Confirmações</p>
            <p class="text-h6 font-weight-bold">{{ purchases.length }}</p>
          </div>
          <div>
            <p class="text-grey-700 text-sm">Total de Itens Comprados</p>
            <p class="text-h6 font-weight-bold">{{ totalPurchasedQuantity }}</p>
          </div>
        </div>
      </v-card>
    </div>

    <!-- DONATIONS TAB -->
    <div v-show="activeTab === 'donations'">
      <!-- Search & Filters -->
      <v-card class="pa-4 mb-6" rounded="lg">
        <div class="d-flex gap-3 flex-wrap">
          <v-select
            v-model="donationFilter"
            density="compact"
            :items="[
              { value: 'all', title: 'Todas as doações' },
              { value: 'dad', title: 'Doações para Papai' },
              { value: 'mom', title: 'Doações para Mamãe' },
            ]"
            style="max-width: 250px"
          />
          <v-btn
            class="align-self-center"
            variant="tonal"
            @click="donationFilter = 'all'"
          >
            Limpar Filtro
          </v-btn>
        </div>
      </v-card>

      <!-- Export Button -->
      <div class="mb-4 d-flex justify-end">
        <v-btn
          color="success"
          :disabled="donations.length === 0"
          :loading="isExportingDonations"
          prepend-icon="mdi-download"
          @click="downloadDonationsCsv"
        >
          Exportar CSV
        </v-btn>
      </div>

      <!-- Loading State -->
      <v-progress-linear
        v-if="isLoadingDonations"
        class="mb-4"
        color="primary"
        indeterminate
      />

      <!-- Donations Table -->
      <v-card v-if="!isLoadingDonations" class="overflow-auto" rounded="lg">
        <v-table v-if="filteredDonations.length > 0" class="text-sm">
          <thead>
            <tr class="bg-grey-100">
              <th class="text-left pa-4">Doador</th>
              <th class="text-left pa-4">E-mail</th>
              <th class="text-right pa-4">Valor</th>
              <th class="text-center pa-4">Destino</th>
              <th class="text-left pa-4">Data da Doação</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="donation in filteredDonations"
              :key="donation.id"
              class="border-b"
            >
              <td class="pa-4 font-weight-500">
                {{ donation.donorName || "—" }}
              </td>
              <td class="pa-4">{{ donation.donorEmail || "—" }}</td>
              <td class="text-right pa-4 font-weight-500">
                {{ formatCurrency(donation.amount) }}
              </td>
              <td class="text-center pa-4">
                <v-chip
                  v-if="donation.pixDestination"
                  :color="donation.pixDestination === 'dad' ? 'blue' : 'pink'"
                  size="small"
                  variant="tonal"
                >
                  {{ donation.pixDestination === "dad" ? "Papai" : "Mamãe" }}
                </v-chip>
                <span v-else class="text-grey-600">—</span>
              </td>
              <td class="pa-4 text-grey-700">
                {{ formatDate(donation.donatedAt) }}
              </td>
            </tr>
          </tbody>
        </v-table>

        <!-- Empty State -->
        <div v-else class="pa-8 text-center">
          <v-icon
            class="text-grey-400 mb-4"
            size="48"
          >mdi-heart-outline</v-icon>
          <p class="text-h6 mb-2">Nenhuma doação registrada</p>
          <p class="text-grey-600">As doações via PIX aparecerão aqui.</p>
        </div>
      </v-card>

      <!-- Donations Summary -->
      <v-card
        v-if="donations.length > 0 && !isLoadingDonations"
        class="mt-6 pa-6"
        color="pink-50"
        rounded="lg"
      >
        <div class="d-flex gap-6 flex-wrap">
          <div>
            <p class="text-grey-700 text-sm">Total de Doações</p>
            <p class="text-h6 font-weight-bold">{{ donations.length }}</p>
          </div>
          <div>
            <p class="text-grey-700 text-sm">Valor Total Arrecadado</p>
            <p class="text-h6 font-weight-bold">
              {{ formatCurrency(totalDonationAmount) }}
            </p>
          </div>
          <div>
            <p class="text-grey-700 text-sm">Para Papai</p>
            <p class="text-h6 font-weight-bold">
              {{ formatCurrency(totalDadDonations) }}
            </p>
          </div>
          <div>
            <p class="text-grey-700 text-sm">Para Mamãe</p>
            <p class="text-h6 font-weight-bold">
              {{ formatCurrency(totalMomDonations) }}
            </p>
          </div>
        </div>
      </v-card>
    </div>
  </v-container>
</template>

<script setup lang="ts">
  import type { ApiError } from '@/services/http'
  import type { AdminDonation, AdminPurchase } from '@/types/admin'
  import { computed, onMounted, ref } from 'vue'
  import { useRoute } from 'vue-router'
  import {
    exportAdminPurchasesCsv,
    listAdminEventDonations,
    listAdminEventPurchases,
  } from '@/api/adminApi'
  import { useAppToast } from '@/composables/useAppToast'

  const route = useRoute()
  const { showToast } = useAppToast()

  const activeTab = ref<'purchases' | 'donations'>('purchases')
  const purchases = ref<AdminPurchase[]>([])
  const donations = ref<AdminDonation[]>([])
  const donationFilter = ref<'all' | 'dad' | 'mom'>('all')

  const isLoadingPurchases = ref(false)
  const isLoadingDonations = ref(false)
  const isExportingPurchases = ref(false)
  const isExportingDonations = ref(false)

  const eventId = computed(() => route.params.event_id as string)

  const filteredDonations = computed(() => {
    if (donationFilter.value === 'all') return donations.value
    return donations.value.filter(
      d => d.pixDestination === donationFilter.value,
    )
  })

  const totalPurchasedQuantity = computed(() =>
    purchases.value.reduce((sum, p) => sum + p.quantity, 0),
  )

  const totalDonationAmount = computed(() =>
    donations.value.reduce((sum, d) => sum + (d.amount || 0), 0),
  )

  const totalDadDonations = computed(() =>
    donations.value
      .filter(d => d.pixDestination === 'dad')
      .reduce((sum, d) => sum + (d.amount || 0), 0),
  )

  const totalMomDonations = computed(() =>
    donations.value
      .filter(d => d.pixDestination === 'mom')
      .reduce((sum, d) => sum + (d.amount || 0), 0),
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

  function formatCurrency (value: unknown): string {
    const num = typeof value === 'number' ? value : 0
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(num)
  }

  async function loadPurchases (): Promise<void> {
    isLoadingPurchases.value = true
    try {
      purchases.value = await listAdminEventPurchases(eventId.value)
    } catch (error) {
      const apiError = error as ApiError
      const message
        = apiError.status === 404
          ? 'Evento não encontrado'
          : 'Erro ao carregar confirmações de compra'
      showToast(message, 'error')
    } finally {
      isLoadingPurchases.value = false
    }
  }

  async function loadDonations (): Promise<void> {
    isLoadingDonations.value = true
    try {
      donations.value = await listAdminEventDonations(eventId.value)
    } catch (error) {
      const apiError = error as ApiError
      const message
        = apiError.status === 404
          ? 'Evento não encontrado'
          : 'Erro ao carregar doações'
      showToast(message, 'error')
    } finally {
      isLoadingDonations.value = false
    }
  }

  async function downloadPurchasesCsv (): Promise<void> {
    isExportingPurchases.value = true
    try {
      const blob = await exportAdminPurchasesCsv(eventId.value)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `compras-${new Date().toISOString().split('T')[0]}.csv`
      document.body.append(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
      showToast('Arquivo exportado com sucesso', 'success')
    } catch {
      showToast('Erro ao exportar CSV de compras', 'error')
    } finally {
      isExportingPurchases.value = false
    }
  }

  async function downloadDonationsCsv () {
    isExportingDonations.value = true
    try {
      // Note: API returns purchases via exportPurchasesCsv, but we'll create a download from donations data
      const csv = generateDonationsCsv()
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `doacoes-${new Date().toISOString().split('T')[0]}.csv`
      document.body.append(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
      showToast('Arquivo exportado com sucesso', 'success')
    } catch {
      showToast('Erro ao exportar CSV de doações', 'error')
    } finally {
      isExportingDonations.value = false
    }
  }

  function generateDonationsCsv (): string {
    const headers = [
      'Doador',
      'E-mail',
      'Valor (R$)',
      'Destino',
      'Data da Doação',
    ]
    const rows = donations.value.map(d => [
      d.donorName || '',
      d.donorEmail || '',
      (d.amount || 0).toFixed(2),
      d.pixDestination === 'dad'
        ? 'Papai'
        : (d.pixDestination === 'mom'
          ? 'Mamãe'
          : ''),
      new Date(d.donatedAt).toLocaleString('pt-BR'),
    ])

    const csv = [
      headers.map(h => `"${h}"`).join(','),
      ...rows.map(r => r.map(cell => `"${cell}"`).join(',')),
    ].join('\n')

    return '\uFEFF' + csv // Add BOM for proper UTF-8 encoding in Excel
  }

  onMounted(() => {
    loadPurchases()
    loadDonations()
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
  font-family: "Cormorant Garamond", serif;
  font-size: 2.5rem;
  font-weight: 500;
}

.font-mono {
  font-family: "Courier New", monospace;
}

.border-b {
  border-bottom: 1px solid #e0e0e0;
}

.color-pink-50 {
  background-color: #fce4ec;
}
</style>
