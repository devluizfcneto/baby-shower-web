<template>
  <v-container class="py-10" max-width="1440">
    <!-- Header -->
    <div class="d-flex align-center justify-space-between mb-6">
      <div>
        <v-btn
          class="mr-3"
          icon="mdi-arrow-left"
          variant="tonal"
          @click="$router.back()"
        />
        <h1 class="text-h4 d-inline-block font-serif">Confirmações de Compra</h1>
      </div>
    </div>

    <div>
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
        class="mt-6 pa-5 purchase-summary"
        rounded="lg"
      >
        <div class="summary-grid">
          <div class="summary-item">
            <p class="summary-item__label">Total de Confirmações</p>
            <p class="summary-item__value">{{ purchases.length }}</p>
          </div>
          <div class="summary-item">
            <p class="summary-item__label">Total de Itens Comprados</p>
            <p class="summary-item__value">{{ totalPurchasedQuantity }}</p>
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
    </div>
  </v-container>
</template>

<script setup lang="ts">
  import type { ApiError } from '@/services/http'
  import type { AdminPurchase } from '@/types/admin'
  import { computed, onMounted, ref } from 'vue'
  import { useRoute } from 'vue-router'
  import {
    exportAdminPurchasesCsv,
    listAdminEventPurchases,
  } from '@/api/adminApi'
  import { useAppToast } from '@/composables/useAppToast'

  const route = useRoute()
  const { toast, toastLocation, showToast } = useAppToast()

  const purchases = ref<AdminPurchase[]>([])

  const isLoadingPurchases = ref(false)
  const isExportingPurchases = ref(false)

  const eventId = computed(() => route.params.event_id as string)

  const totalPurchasedQuantity = computed(() =>
    purchases.value.reduce((sum, p) => sum + p.quantity, 0),
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

  onMounted(() => {
    loadPurchases()
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

.purchase-summary {
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

.border-b {
  border-bottom: 1px solid #e0e0e0;
}

.color-pink-50 {
  background-color: #fce4ec;
}
</style>
