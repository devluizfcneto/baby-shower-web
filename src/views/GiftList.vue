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
        <h1 class="hero__title">Escolha um carinho para o bebe</h1>
        <p class="hero__subtitle">
          Todos os presentes aqui foram selecionados com carinho. Escolha o que desejar e, quando finalizar no marketplace,
          confirme sua compra para atualizarmos a lista.
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
        headline="Lista ainda em preparacao"
        icon="mdi-gift-off-outline"
        text="Em breve novos presentes serao adicionados."
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

            <div class="d-flex flex-wrap ga-3 mb-5">
              <v-btn
                color="secondary"
                prepend-icon="mdi-open-in-new"
                rounded="pill"
                variant="tonal"
                @click="openMarketplace(selectedGift.marketplaceUrl)"
              >
                Ir para o marketplace
              </v-btn>
            </div>

            <v-form ref="purchaseFormRef" @submit.prevent="submitPurchaseConfirmation">
              <v-row dense>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="purchaseForm.guestName"
                    clearable
                    density="comfortable"
                    label="Seu nome completo"
                    :rules="guestNameRules"
                    variant="outlined"
                  />
                </v-col>

                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="purchaseForm.guestEmail"
                    clearable
                    density="comfortable"
                    label="Seu e-mail"
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
                  Confirmar compra
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

  const REFRESH_COOLDOWN_MS = 2 * 60 * 1000

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
    (value: string) => !!value.trim() || 'Informe seu e-mail',
    (value: string) => /\S+@\S+\.\S+/.test(value) || 'Informe um e-mail valido',
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

    await giftStore.fetchPublicGifts(resolvedEventCode.value)

    if (giftStore.errorMessage) {
      showToast(giftStore.errorMessage, 'error')
    }
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
        guestEmail: purchaseForm.guestEmail.trim(),
        quantity: normalizedQuantity,
        notes: purchaseForm.notes.trim() || undefined,
      })

      giftStore.applyPurchaseConfirmation(selectedGift.value.id, normalizedQuantity)
      showToast('Compra confirmada com sucesso. Obrigado!', 'success')
      closePurchaseDialog()
    } catch (error) {
      if (error instanceof ApiError) {
        switch (error.status) {
          case 404: {
            showToast('Presente ou evento nao encontrado.', 'error')
            break
          }
          case 409: {
            showToast('Este presente nao esta mais disponivel.', 'error')
            break
          }
          case 410: {
            showToast('Este evento foi encerrado.', 'error')
            break
          }
          case 422: {
            showToast('Dados invalidos. Revise os campos.', 'error')
            break
          }
          case 429: {
            showToast('Muitas tentativas. Aguarde e tente novamente.', 'error')
            break
          }
          default: {
            if (error.status && error.status >= 500) {
              showToast('Erro no servidor. Tente novamente.', 'error')
            } else {
              showToast('Nao foi possivel confirmar sua compra.', 'error')
            }
            break
          }
        }
      } else {
        showToast('Falha de conexao. Verifique sua internet.', 'error')
      }
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
    if (refreshTickInterval.value) {
      clearInterval(refreshTickInterval.value)
    }
  })

  watch(resolvedEventCode, () => {
    hydrateManualRefreshState()
    loadEventContext()
    loadGifts()
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
