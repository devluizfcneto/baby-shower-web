<template>
  <section class="gifts-page">
    <div
      class="gifts-page__bg"
      :class="{
        'gifts-page__bg--custom': hasCustomCover,
        'gifts-page__bg--default': !hasCustomCover,
      }"
      :style="giftsBackgroundStyle"
    />

    <v-container class="gifts-page__content py-8 py-md-12" max-width="1150">
      <v-sheet class="hero pa-6 pa-md-8 mb-6" rounded="xl">
        <p class="hero__eyebrow">LISTA DE PRESENTES</p>
        <h1 class="hero__title">Escolha uma lembrança para o neneco</h1>
        <p class="hero__subtitle">
          Todos os presentes aqui foram selecionados com carinho. Escolha o que desejar e, quando finalizar no marketplace,
          confirme sua compra para atualizarmos a lista.
        </p>
        <p class="hero__subtitle"> OBS: Caso deseje dar alguma outra lembrança que não está presente na lista, informe aos responsáveis do evento
        </p>
      </v-sheet>

      <div class="d-flex align-center justify-space-between mb-4 flex-wrap ga-3">
        <v-btn
          color="primary"
          prepend-icon="mdi-arrow-left"
          rounded="pill"
          variant="tonal"
          @click="router.push(`/evento/${eventCode}`)"
        >
          Voltar ao evento
        </v-btn>

        <v-btn
          :disabled="!canManualRefresh"
          prepend-icon="mdi-refresh"
          rounded="pill"
          variant="text"
          @click="handleManualRefresh"
        >
          {{ refreshButtonLabel }}
        </v-btn>
      </div>

      <v-sheet class="filters pa-4 pa-md-5 mb-5" rounded="xl">
        <div class="filters__head d-flex align-center justify-space-between flex-wrap ga-2 mb-3">
          <p class="filters__title">Buscar e ordenar presentes</p>

          <v-chip
            v-if="activeFilterCount > 0"
            color="secondary"
            prepend-icon="mdi-filter-variant"
            size="small"
            variant="tonal"
          >
            {{ activeFilterCount }} filtro(s) ativo(s)
          </v-chip>
        </div>

        <v-row dense>
          <v-col cols="12" md="5">
            <v-text-field
              v-model="giftFilters.search"
              clearable
              density="comfortable"
              hide-details
              label="Buscar por nome, descricao ou marketplace"
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
            />
          </v-col>

          <v-col cols="12" md="3">
            <v-select
              v-model="giftFilters.marketplace"
              density="comfortable"
              hide-details
              item-title="title"
              item-value="value"
              :items="marketplaceFilterOptions"
              label="Marketplace"
              variant="outlined"
            />
          </v-col>

          <v-col cols="12" md="2">
            <v-select
              v-model="giftFilters.sortBy"
              density="comfortable"
              hide-details
              item-title="title"
              item-value="value"
              :items="sortByOptions"
              label="Ordenar por"
              variant="outlined"
            />
          </v-col>

          <v-col cols="12" md="2">
            <v-select
              v-model="giftFilters.sortDir"
              density="comfortable"
              hide-details
              item-title="title"
              item-value="value"
              :items="sortDirOptions"
              label="Direcao"
              variant="outlined"
            />
          </v-col>
        </v-row>

        <div class="d-flex align-center justify-space-between flex-wrap ga-2 mt-3">
          <p class="filters__hint">Por padrao, presentes desbloqueados aparecem primeiro.</p>

          <v-btn
            :disabled="!hasActiveFilters"
            prepend-icon="mdi-filter-off-outline"
            rounded="pill"
            variant="text"
            @click="clearGiftFilters"
          >
            Limpar filtros
          </v-btn>
        </div>
      </v-sheet>

      <v-progress-linear
        v-if="giftStore.isLoading"
        class="mb-6"
        color="primary"
        indeterminate
      />

      <v-row v-else-if="giftStore.items.length > 0" class="g-4">
        <v-col
          v-for="gift in giftStore.items"
          :key="gift.id"
          cols="12"
          lg="4"
          md="6"
        >
          <v-card class="gift-card h-100 d-flex flex-column" rounded="xl" variant="elevated">
            <div v-if="gift.imageUrl" class="gift-card__media">
              <v-img
                class="gift-card__image"
                contain
                :src="gift.imageUrl"
              />
            </div>

            <div v-else class="gift-card__placeholder d-flex align-center justify-center">
              <v-icon color="primary" icon="mdi-gift-outline" size="48" />
            </div>

            <v-card-text class="d-flex flex-column flex-grow-1">
              <div class="d-flex align-center justify-space-between mb-2 ga-2">
                <v-chip color="secondary" size="small" variant="tonal">
                  {{ marketplaceLabel(gift.marketplace) }}
                </v-chip>

                <v-chip
                  :color="giftStatus(gift).color"
                  size="small"
                  variant="flat"
                >
                  {{ giftStatus(gift).label }}
                </v-chip>
              </div>

              <h2 class="gift-card__title">{{ gift.name }}</h2>
              <p class="gift-card__description">{{ gift.description || 'Presente especial para o bebe.' }}</p>

              <div class="mt-auto">
                <div class="d-flex justify-space-between align-center mb-2 text-caption">
                  <span>{{ gift.confirmedQuantity }} de {{ gift.maxQuantity }} confirmados</span>
                  <span>{{ remainingQuantity(gift) }} disponiveis</span>
                </div>

                <v-progress-linear
                  color="primary"
                  height="8"
                  :model-value="progressValue(gift)"
                  rounded
                />
              </div>
            </v-card-text>

            <v-card-actions class="px-4 pb-4 pt-0 d-flex ga-2">
              <v-btn
                block
                color="primary"
                :disabled="!isGiftAvailable(gift)"
                rounded="pill"
                @click="openPurchaseFlow(gift)"
              >
                Quero dar este presente
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>

      <v-empty-state
        v-else
        class="empty-state"
        :headline="hasActiveFilters ? 'Nenhum presente encontrado' : 'Lista ainda em preparacao'"
        icon="mdi-gift-off-outline"
        :text="hasActiveFilters ? 'Tente ajustar a busca, marketplace ou ordenacao.' : 'Em breve novos presentes serao adicionados.'"
      />

      <v-dialog v-model="purchaseDialog" max-width="680">
        <v-card class="pa-2 pa-md-4" rounded="xl">
          <v-card-title class="text-h6">
            Confirmar compra
          </v-card-title>

          <v-card-text v-if="selectedGift">
            <div class="dialog-product mb-4">
              <p class="dialog-product__name">{{ selectedGift.name }}</p>
              <p class="dialog-product__meta">{{ marketplaceLabel(selectedGift.marketplace) }}</p>
              <p class="dialog-product__meta">Restam {{ remainingQuantity(selectedGift) }} unidades disponiveis.</p>
            </div>

            <div v-if="deliveryAddressOptions.length > 0" class="delivery-panel mb-4">
              <p class="delivery-panel__title">Enderecos para entrega</p>
              <p class="delivery-panel__subtitle">Copie o endereco mais conveniente para finalizar no marketplace.</p>

              <div class="delivery-panel__list">
                <div
                  v-for="option in deliveryAddressOptions"
                  :key="option.label"
                  class="delivery-option"
                >
                  <div class="delivery-option__body">
                    <p class="delivery-option__label">{{ option.label }}</p>
                    <p class="delivery-option__text">{{ option.address }}</p>
                  </div>

                  <v-btn
                    class="delivery-option__copy"
                    color="primary"
                    density="comfortable"
                    prepend-icon="mdi-content-copy"
                    rounded="pill"
                    size="small"
                    variant="tonal"
                    @click="copyDeliveryAddress(option.address, option.label)"
                  >
                    Copiar
                  </v-btn>
                </div>
              </div>
            </div>

            <div class="d-flex flex-wrap ga-3 mb-5">
              <v-btn
                color="secondary"
                prepend-icon="mdi-open-in-new"
                rounded="pill"
                variant="tonal"
                @click="openMarketplace(selectedGift.marketplaceUrl)"
              >
                Comprar na loja {{ marketplaceLabel(selectedGift.marketplace) }}
              </v-btn>
            </div>

            <v-form ref="purchaseFormRef" @submit.prevent="submitPurchaseConfirmation">
              <v-row dense>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="purchaseForm.guestName"
                    clearable
                    density="comfortable"
                    label="Seu nome"
                    :rules="guestNameRules"
                    variant="outlined"
                  />
                </v-col>

                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="purchaseForm.guestEmail"
                    clearable
                    density="comfortable"
                    label="Seu e-mail (opcional)"
                    :rules="guestEmailRules"
                    type="email"
                    variant="outlined"
                  />
                </v-col>
              </v-row>

              <v-row dense>
                <v-col cols="12" md="4">
                  <v-text-field
                    v-model.number="purchaseForm.quantity"
                    density="comfortable"
                    label="Quantidade"
                    :max="selectedGift.maxQuantity"
                    min="1"
                    :rules="quantityRules"
                    type="number"
                    variant="outlined"
                  />
                </v-col>
              </v-row>

              <v-textarea
                v-model="purchaseForm.notes"
                auto-grow
                clearable
                density="comfortable"
                label="Deixe aqui sua mensagem de carinho para o neneco"
                rows="2"
                variant="outlined"
              />

              <div class="d-flex flex-wrap ga-3 mt-2">
                <v-btn
                  color="primary"
                  :loading="isSubmittingPurchase"
                  rounded="pill"
                  type="submit"
                >
                  Comprei o presente na loja {{ marketplaceLabel(selectedGift.marketplace) }} 
                </v-btn>

                <v-btn
                  rounded="pill"
                  variant="text"
                  @click="closePurchaseDialog"
                >
                  Cancelar
                </v-btn>
              </div>
            </v-form>
          </v-card-text>
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
  import type { ListPublicGiftsParams, PublicGiftSortBy } from '@/api/giftApi'
  import type { Gift } from '@/types/gift'
  import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
  import { useRouter } from 'vue-router'
  import { useDisplay } from 'vuetify'
  import { confirmGiftPurchase } from '@/api/giftApi'
  import { useEventCode } from '@/composables/useEventCode'
  import { ApiError } from '@/services/http'
  import { useEventStore } from '@/stores/useEventStore'
  import { useGiftStore } from '@/stores/useGiftStore'

  const router = useRouter()
  const { smAndDown } = useDisplay()
  const { eventCode } = useEventCode()
  const eventStore = useEventStore()
  const giftStore = useGiftStore()

  const purchaseFormRef = ref<{ validate: () => Promise<{ valid: boolean }> } | null>(null)
  const purchaseDialog = ref(false)
  const selectedGift = ref<Gift | null>(null)
  const isSubmittingPurchase = ref(false)
  const lastManualRefreshAt = ref(0)
  const nowTimestamp = ref(Date.now())
  const refreshTickInterval = ref<ReturnType<typeof setInterval> | null>(null)
  const listReloadTimer = ref<ReturnType<typeof setTimeout> | null>(null)

  const REFRESH_COOLDOWN_MS = 2 * 60 * 1000
  const SEARCH_DEBOUNCE_MS = 350

  const marketplaceFilterOptions = [
    { title: 'Todos os marketplaces', value: 'all' },
    { title: 'Amazon', value: 'amazon' },
    { title: 'Mercado Livre', value: 'mercadolivre' },
    { title: 'Shopee', value: 'shopee' },
  ]

  const sortByOptions = [
    { title: 'Ordem da lista', value: 'sortOrder' },
    { title: 'Nome do produto', value: 'name' },
    { title: 'Quantidade confirmada', value: 'confirmedQuantity' },
  ]

  const sortDirOptions = [
    { title: 'Crescente', value: 'asc' },
    { title: 'Decrescente', value: 'desc' },
  ]

  const toast = reactive({
    visible: false,
    message: '',
    color: 'success',
  })

  const purchaseForm = reactive({
    guestName: '',
    guestEmail: '',
    quantity: 1,
    notes: '',
  })

  const giftFilters = reactive({
    search: '',
    marketplace: 'all' as 'all' | Gift['marketplace'],
    sortBy: 'sortOrder' as PublicGiftSortBy,
    sortDir: 'asc' as 'asc' | 'desc',
  })

  const resolvedEventCode = computed(() => eventCode.value)
  const coverImageUrl = computed(() => eventStore.current?.coverImageUrl?.trim() || '')
  const hasCustomCover = computed(() => Boolean(coverImageUrl.value))
  const toastLocation = computed(() => (smAndDown.value ? 'top' : 'bottom end'))
  const giftsBackgroundStyle = computed(() => {
    const source = coverImageUrl.value || '/background_mail.jpg'

    return {
      backgroundImage: `url("${source}")`,
    }
  })
  const manualRefreshRemainingMs = computed(() => {
    const elapsed = nowTimestamp.value - lastManualRefreshAt.value
    return Math.max(0, REFRESH_COOLDOWN_MS - elapsed)
  })
  const canManualRefresh = computed(() => manualRefreshRemainingMs.value === 0 && !giftStore.isLoading)
  const deliveryAddressOptions = computed(() => {
    const source = [
      { label: 'Endereco principal', value: eventStore.current?.deliveryAddress },
      { label: 'Endereco secundario', value: eventStore.current?.deliveryAddress2 },
      { label: 'Endereco reserva', value: eventStore.current?.deliveryAddress3 },
    ]

    const options: Array<{ label: string, address: string }> = []
    const usedAddresses = new Set<string>()

    for (const item of source) {
      const normalized = (item.value || '').trim()

      if (!normalized || usedAddresses.has(normalized)) {
        continue
      }

      usedAddresses.add(normalized)
      options.push({
        label: item.label,
        address: normalized,
      })
    }

    return options
  })
  const activeFilterCount = computed(() => {
    let count = 0

    if (giftFilters.search.trim()) {
      count += 1
    }

    if (giftFilters.marketplace !== 'all') {
      count += 1
    }

    if (giftFilters.sortBy !== 'sortOrder') {
      count += 1
    }

    if (giftFilters.sortDir !== 'asc') {
      count += 1
    }

    return count
  })
  const hasActiveFilters = computed(() => activeFilterCount.value > 0)
  const giftQueryParams = computed<ListPublicGiftsParams>(() => ({
    search: giftFilters.search.trim() || undefined,
    marketplace: giftFilters.marketplace === 'all' ? undefined : giftFilters.marketplace,
    sortBy: giftFilters.sortBy,
    sortDir: giftFilters.sortDir,
  }))
  const refreshButtonLabel = computed(() => {
    if (canManualRefresh.value) {
      return 'Atualizar lista'
    }

    return `Atualizar em ${formatDuration(manualRefreshRemainingMs.value)}`
  })

  const guestNameRules = [
    (value: string) => !!value.trim() || 'Informe seu nome completo',
    (value: string) => value.trim().length >= 3 || 'Nome deve ter ao menos 3 caracteres',
  ]

  const guestEmailRules = [
    (value: string) => {
      if (!value.trim()) return true
      return /\S+@\S+\.\S+/.test(value) || 'Informe um e-mail valido'
    },
  ]

  const quantityRules = [
    (value: number) => value >= 1 || 'Quantidade minima: 1',
    (value: number) => Number.isInteger(Number(value)) || 'Informe um numero inteiro',
    (value: number) => {
      if (!selectedGift.value) return true
      return value <= remainingQuantity(selectedGift.value) || 'Quantidade acima do disponivel'
    },
  ]

  function showToast (message: string, color: 'success' | 'error' = 'success'): void {
    toast.visible = false
    toast.message = message
    toast.color = color

    setTimeout(() => {
      toast.visible = true
    }, 0)
  }

  function resolveApiErrorMessage (error: ApiError, fallback: string): string {
    const details = error.details as { message?: unknown } | undefined

    if (typeof details?.message === 'string' && details.message.trim()) {
      return details.message.trim()
    }

    if (error.message && error.message.trim()) {
      return error.message.trim()
    }

    return fallback
  }

  function formatDuration (durationMs: number): string {
    const totalSeconds = Math.ceil(durationMs / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60

    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  }

  function getRefreshCooldownStorageKey (code: string): string {
    return `gifts-refresh-last:${code}`
  }

  function hydrateManualRefreshState (): void {
    if (!resolvedEventCode.value) {
      lastManualRefreshAt.value = 0
      return
    }

    const rawValue = localStorage.getItem(getRefreshCooldownStorageKey(resolvedEventCode.value))
    if (!rawValue) {
      lastManualRefreshAt.value = 0
      return
    }

    const parsed = Number(rawValue)
    if (Number.isNaN(parsed) || parsed <= 0) {
      localStorage.removeItem(getRefreshCooldownStorageKey(resolvedEventCode.value))
      lastManualRefreshAt.value = 0
      return
    }

    lastManualRefreshAt.value = parsed
  }

  function marketplaceLabel (value: Gift['marketplace']): string {
    const labels: Record<Gift['marketplace'], string> = {
      amazon: 'Amazon',
      mercadolivre: 'Mercado Livre',
      shopee: 'Shopee',
    }

    return labels[value]
  }

  function progressValue (gift: Gift): number {
    if (gift.maxQuantity <= 0) return 0
    return Math.min(100, Math.round((gift.confirmedQuantity / gift.maxQuantity) * 100))
  }

  function remainingQuantity (gift: Gift): number {
    return Math.max(0, gift.maxQuantity - gift.confirmedQuantity)
  }

  function isGiftAvailable (gift: Gift): boolean {
    return !gift.isBlocked && remainingQuantity(gift) > 0
  }

  function giftStatus (gift: Gift): { label: string, color: string } {
    if (gift.isBlocked) {
      return { label: 'Indisponivel', color: 'error' }
    }

    if (remainingQuantity(gift) <= 0) {
      return { label: 'Esgotado', color: 'warning' }
    }

    return { label: 'Disponivel', color: 'success' }
  }

  async function loadGifts (): Promise<void> {
    if (!resolvedEventCode.value) {
      showToast('Codigo do evento invalido.', 'error')
      return
    }

    await giftStore.fetchPublicGifts(resolvedEventCode.value, giftQueryParams.value)

    if (giftStore.errorMessage) {
      showToast(giftStore.errorMessage, 'error')
    }
  }

  function scheduleGiftReload (delayMs = 0): void {
    if (listReloadTimer.value) {
      clearTimeout(listReloadTimer.value)
    }

    listReloadTimer.value = setTimeout(() => {
      listReloadTimer.value = null
      void loadGifts()
    }, delayMs)
  }

  async function loadEventContext (): Promise<void> {
    if (!resolvedEventCode.value) {
      return
    }

    await eventStore.fetchEventByCode(resolvedEventCode.value)
  }

  async function handleManualRefresh (): Promise<void> {
    if (!canManualRefresh.value) {
      return
    }

    lastManualRefreshAt.value = Date.now()

    if (resolvedEventCode.value) {
      localStorage.setItem(getRefreshCooldownStorageKey(resolvedEventCode.value), String(lastManualRefreshAt.value))
    }

    await loadGifts()
  }

  function clearGiftFilters (): void {
    giftFilters.search = ''
    giftFilters.marketplace = 'all'
    giftFilters.sortBy = 'sortOrder'
    giftFilters.sortDir = 'asc'
    scheduleGiftReload()
  }

  function openPurchaseFlow (gift: Gift): void {
    selectedGift.value = gift
    hydratePurchaseContactFromRsvp()
    purchaseForm.quantity = 1
    purchaseDialog.value = true
  }

  function closePurchaseDialog (): void {
    purchaseDialog.value = false
    selectedGift.value = null
    purchaseForm.guestName = ''
    purchaseForm.guestEmail = ''
    purchaseForm.quantity = 1
    purchaseForm.notes = ''
  }

  function getRsvpFormStorageKey (code: string): string {
    return `rsvp-form:${code}`
  }

  function hydratePurchaseContactFromRsvp (): void {
    if (!resolvedEventCode.value) {
      return
    }

    const raw = localStorage.getItem(getRsvpFormStorageKey(resolvedEventCode.value))
    if (!raw) {
      return
    }

    try {
      const parsed = JSON.parse(raw) as {
        fullName?: string
        email?: string
      }

      purchaseForm.guestName = (parsed.fullName || '').trim()
      purchaseForm.guestEmail = (parsed.email || '').trim()
    } catch {
      localStorage.removeItem(getRsvpFormStorageKey(resolvedEventCode.value))
    }
  }

  function openMarketplace (url: string): void {
    if (!url) {
      showToast('Link do marketplace indisponivel para este presente.', 'error')
      return
    }

    window.open(url, '_blank', 'noopener,noreferrer')
  }

  async function copyDeliveryAddress (address: string, label: string): Promise<void> {
    if (!address) {
      showToast('Endereco indisponivel para copia.', 'error')
      return
    }

    try {
      await navigator.clipboard.writeText(address)
      showToast(`${label} copiado.`, 'success')
    } catch {
      showToast('Nao foi possivel copiar o endereco.', 'error')
    }
  }

  async function submitPurchaseConfirmation (): Promise<void> {
    if (!resolvedEventCode.value || !selectedGift.value) {
      showToast('Nao foi possivel identificar o presente.', 'error')
      return
    }

    const validation = await purchaseFormRef.value?.validate()
    if (!validation?.valid) {
      return
    }

    const normalizedQuantity = Number(purchaseForm.quantity)
    if (!Number.isInteger(normalizedQuantity) || normalizedQuantity < 1) {
      showToast('Informe uma quantidade valida.', 'error')
      return
    }

    if (normalizedQuantity > remainingQuantity(selectedGift.value)) {
      showToast('Quantidade maior que o disponivel.', 'error')
      return
    }

    isSubmittingPurchase.value = true

    try {
      await confirmGiftPurchase(resolvedEventCode.value, selectedGift.value.id, {
        guestName: purchaseForm.guestName.trim(),
        guestEmail: purchaseForm.guestEmail.trim() || undefined,
        quantity: normalizedQuantity,
        notes: purchaseForm.notes.trim() || undefined,
      })

      giftStore.applyPurchaseConfirmation(selectedGift.value.id, normalizedQuantity)
      showToast('Compra confirmada com sucesso. Obrigado!', 'success')
      closePurchaseDialog()
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status && error.status >= 500) {
          showToast('Aguarde um instante e tente novamente mais tarde', 'error')
          return
        }

        showToast(resolveApiErrorMessage(error, 'Nao foi possivel confirmar sua compra.'), 'error')
        return
      }

      showToast('Aguarde um instante e tente novamente mais tarde', 'error')
    } finally {
      isSubmittingPurchase.value = false
    }
  }

  onMounted(() => {
    refreshTickInterval.value = setInterval(() => {
      nowTimestamp.value = Date.now()
    }, 1000)

    hydrateManualRefreshState()
    loadEventContext()
    loadGifts()
  })

  onBeforeUnmount(() => {
    if (listReloadTimer.value) {
      clearTimeout(listReloadTimer.value)
    }

    if (refreshTickInterval.value) {
      clearInterval(refreshTickInterval.value)
    }
  })

  watch(resolvedEventCode, () => {
    hydrateManualRefreshState()
    loadEventContext()
    loadGifts()
  })

  watch(() => giftFilters.search, () => {
    scheduleGiftReload(SEARCH_DEBOUNCE_MS)
  })

  watch(() => [giftFilters.marketplace, giftFilters.sortBy, giftFilters.sortDir], () => {
    scheduleGiftReload()
  })
</script>

<style scoped>
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;700&family=Manrope:wght@400;500;700&display=swap');

  .gifts-page {
    position: relative;
    min-height: calc(100vh - 64px);
    overflow: hidden;
    background:
      radial-gradient(circle at 8% 12%, rgba(81, 106, 138, 0.13), transparent 32%),
      radial-gradient(circle at 88% 25%, rgba(241, 137, 57, 0.14), transparent 30%),
      linear-gradient(140deg, #f7f9fb, #f0f3f6 55%, #edf1f4 100%);
  }

  .gifts-page__bg {
    position: absolute;
    inset: 0;
    background-repeat: no-repeat;
    transition: opacity 220ms ease;
    pointer-events: none;
  }

  .gifts-page__bg--default {
    background-size: 580px;
    background-position: right -170px top -62px;
    opacity: 0.13;
    mix-blend-mode: multiply;
  }

  .gifts-page__bg--custom {
    background-size: cover;
    background-position: center center;
    opacity: 0.22;
    filter: saturate(0.92) contrast(1.05);
    mask-image: linear-gradient(
      to bottom,
      rgba(0, 0, 0, 0.86) 0%,
      rgba(0, 0, 0, 0.66) 44%,
      rgba(0, 0, 0, 0.38) 74%,
      rgba(0, 0, 0, 0.2) 100%
    );
  }

  .gifts-page__content {
    position: relative;
    z-index: 1;
  }

  .hero {
    border: 1px solid rgba(21, 31, 54, 0.1);
    background: linear-gradient(155deg, rgba(255, 255, 255, 0.96), rgba(236, 242, 246, 0.9));
    box-shadow: 0 20px 44px rgba(21, 31, 54, 0.14);
  }

  .hero__eyebrow {
    margin: 0;
    color: #3b4866;
    font-family: 'Manrope', sans-serif;
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.15em;
  }

  .hero__title {
    margin: 10px 0 4px;
    color: #151f36;
    font-family: 'Cormorant Garamond', serif;
    font-size: clamp(2rem, 5vw, 2.9rem);
    line-height: 1.05;
  }

  .hero__subtitle {
    margin: 0;
    max-width: 780px;
    color: #3b4866;
    font-family: 'Manrope', sans-serif;
    font-size: 0.98rem;
  }

  .filters {
    border: 1px solid rgba(21, 31, 54, 0.11);
    background: linear-gradient(160deg, rgba(255, 255, 255, 0.95), rgba(240, 245, 249, 0.92));
    box-shadow: 0 14px 30px rgba(21, 31, 54, 0.08);
  }

  .filters__title {
    margin: 0;
    color: #1a2943;
    font-family: 'Manrope', sans-serif;
    font-size: 0.96rem;
    font-weight: 700;
    letter-spacing: 0.01em;
  }

  .filters__hint {
    margin: 0;
    color: #4f6287;
    font-family: 'Manrope', sans-serif;
    font-size: 0.84rem;
    font-weight: 500;
  }

  .gift-card {
    border: 1px solid rgba(21, 31, 54, 0.09);
    background: rgba(255, 255, 255, 0.95);
    box-shadow: 0 14px 30px rgba(21, 31, 54, 0.08);
    transition: transform 180ms ease, box-shadow 180ms ease;
  }

  .gift-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 18px 36px rgba(21, 31, 54, 0.12);
  }

  .gift-card__media {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 210px;
    aspect-ratio: 16 / 10;
    padding: 14px;
    overflow: hidden;
    background:
      radial-gradient(circle at 16% 14%, rgba(81, 106, 138, 0.1), transparent 40%),
      linear-gradient(145deg, rgba(252, 253, 255, 0.95), rgba(235, 241, 247, 0.86));
    border-bottom: 1px solid rgba(21, 31, 54, 0.08);
  }

  .gift-card__media::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(to bottom, rgba(255, 255, 255, 0) 62%, rgba(21, 31, 54, 0.05) 100%);
    pointer-events: none;
  }

  .gift-card__image {
    width: 100%;
    height: 100%;
  }

  .gift-card__image :deep(.v-img__img) {
    object-fit: contain !important;
    object-position: center center !important;
    filter: drop-shadow(0 6px 12px rgba(21, 31, 54, 0.14));
  }

  .gift-card__placeholder {
    min-height: 210px;
    aspect-ratio: 16 / 10;
    background: linear-gradient(140deg, rgba(255, 255, 255, 0.72), rgba(224, 232, 239, 0.8));
    border-bottom: 1px solid rgba(21, 31, 54, 0.08);
  }

  .gift-card__title {
    margin: 0;
    color: #19243d;
    font-family: 'Manrope', sans-serif;
    font-size: 1.05rem;
    font-weight: 700;
    line-height: 1.35;
  }

  .gift-card__description {
    margin-top: 8px;
    margin-bottom: 16px;
    color: #4b5e82;
    font-family: 'Manrope', sans-serif;
    font-size: 0.92rem;
    line-height: 1.45;
  }

  .dialog-product {
    border-radius: 14px;
    border: 1px solid rgba(21, 31, 54, 0.09);
    background: rgba(247, 250, 253, 0.95);
    padding: 14px;
  }

  .dialog-product__name {
    margin: 0;
    color: #19243d;
    font-family: 'Manrope', sans-serif;
    font-size: 1rem;
    font-weight: 700;
  }

  .dialog-product__meta {
    margin: 4px 0 0;
    color: #4b5e82;
    font-family: 'Manrope', sans-serif;
    font-size: 0.9rem;
  }

  .delivery-panel {
    border-radius: 14px;
    border: 1px solid rgba(21, 31, 54, 0.09);
    background: rgba(248, 251, 255, 0.94);
    padding: 12px;
  }

  .delivery-panel__title {
    margin: 0;
    color: #1a2943;
    font-family: 'Manrope', sans-serif;
    font-size: 0.93rem;
    font-weight: 700;
  }

  .delivery-panel__subtitle {
    margin: 4px 0 0;
    color: #53668b;
    font-family: 'Manrope', sans-serif;
    font-size: 0.82rem;
    font-weight: 500;
  }

  .delivery-panel__list {
    display: grid;
    gap: 8px;
    margin-top: 10px;
  }

  .delivery-option {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    border-radius: 12px;
    border: 1px solid rgba(21, 31, 54, 0.1);
    background: #fff;
    padding: 10px;
  }

  .delivery-option__body {
    min-width: 0;
  }

  .delivery-option__label {
    margin: 0;
    color: #2b3b59;
    font-family: 'Manrope', sans-serif;
    font-size: 0.76rem;
    font-weight: 700;
    letter-spacing: 0.03em;
    text-transform: uppercase;
  }

  .delivery-option__text {
    margin: 3px 0 0;
    color: #3f5278;
    font-family: 'Manrope', sans-serif;
    font-size: 0.88rem;
    line-height: 1.4;
    overflow-wrap: anywhere;
  }

  .delivery-option__copy {
    flex-shrink: 0;
  }

  .empty-state {
    border-radius: 18px;
    border: 1px dashed rgba(21, 31, 54, 0.2);
    background: rgba(255, 255, 255, 0.9);
  }

  @media (max-width: 680px) {
    .gifts-page__bg--default {
      background-size: 430px;
      background-position: right -185px top -50px;
      opacity: 0.11;
    }

    .gifts-page__bg--custom {
      background-position: center top;
      opacity: 0.2;
    }

    .gift-card__media,
    .gift-card__placeholder {
      min-height: 190px;
      padding: 12px;
    }
  }
</style>
