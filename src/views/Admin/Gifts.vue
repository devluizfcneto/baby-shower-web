<template>
  <section class="admin-gifts">
    <v-container class="py-8 py-md-12" max-width="1160">
      <v-sheet class="gifts__hero pa-5 pa-md-7 mb-5" rounded="xl">
        <div class="d-flex flex-wrap align-center justify-space-between ga-3">
          <div>
            <p class="gifts__eyebrow">UC-08</p>
            <h1 class="gifts__title">Gerenciar lista de presentes</h1>
            <p class="gifts__subtitle">Crie, edite, bloqueie e organize os presentes do seu evento.</p>
          </div>

          <div class="d-flex flex-wrap ga-2">
            <v-btn rounded="pill" variant="tonal" @click="goBack">Voltar ao dashboard</v-btn>
            <v-btn
              color="primary"
              prepend-icon="mdi-refresh"
              rounded="pill"
              variant="text"
              @click="loadGifts"
            >
              Atualizar
            </v-btn>
          </div>
        </div>
      </v-sheet>

      <v-row dense>
        <v-col cols="12" lg="4">
          <v-sheet class="gift-form pa-4 pa-md-5" rounded="xl">
            <h2 class="gift-form__title">{{ editingGiftId ? 'Editar presente' : 'Novo presente' }}</h2>

            <v-form ref="formRef" @submit.prevent="submitGift">
              <v-text-field
                v-model="form.name"
                density="comfortable"
                label="Nome do presente"
                :rules="nameRules"
                variant="outlined"
              />

              <v-textarea
                v-model="form.description"
                auto-grow
                density="comfortable"
                label="Descricao"
                rows="2"
                variant="outlined"
              />

              <v-row dense>
                <v-col cols="12" lg="12" md="6">
                  <v-select
                    v-model="form.marketplace"
                    density="comfortable"
                    item-title="title"
                    item-value="value"
                    :items="marketplaceItems"
                    label="Marketplace"
                    variant="outlined"
                  />
                </v-col>
                <v-col cols="12" lg="12" md="6">
                  <v-text-field
                    v-model.number="form.maxQuantity"
                    density="comfortable"
                    label="Quantidade maxima"
                    min="1"
                    :rules="maxQuantityRules"
                    type="number"
                    variant="outlined"
                  />
                </v-col>
              </v-row>

              <v-text-field
                v-model="form.marketplaceUrl"
                density="comfortable"
                label="URL do produto"
                :rules="urlRules"
                variant="outlined"
              />

              <v-text-field
                v-model="form.imageUrl"
                density="comfortable"
                label="URL da imagem"
                variant="outlined"
              />

              <v-row dense>
                <v-col cols="12" lg="12" md="6">
                  <v-text-field
                    v-model="form.asin"
                    density="comfortable"
                    label="ASIN (Amazon)"
                    variant="outlined"
                  />
                </v-col>
                <v-col cols="12" lg="12" md="6">
                  <v-text-field
                    v-model.number="form.sortOrder"
                    density="comfortable"
                    label="Ordem"
                    type="number"
                    variant="outlined"
                  />
                </v-col>
              </v-row>

              <v-text-field
                v-model="form.affiliateLinkAmazon"
                density="comfortable"
                label="Link afiliado Amazon"
                variant="outlined"
              />

              <v-text-field
                v-model="form.affiliateLinkMl"
                density="comfortable"
                label="Link afiliado Mercado Livre"
                variant="outlined"
              />

              <v-text-field
                v-model="form.affiliateLinkShopee"
                density="comfortable"
                label="Link afiliado Shopee"
                variant="outlined"
              />

              <div class="d-flex flex-wrap ga-2 mt-2">
                <v-btn
                  color="primary"
                  :loading="isSaving"
                  rounded="pill"
                  type="submit"
                >
                  {{ editingGiftId ? 'Salvar alteracoes' : 'Criar presente' }}
                </v-btn>
                <v-btn rounded="pill" variant="text" @click="resetForm">
                  Limpar
                </v-btn>
              </div>
            </v-form>
          </v-sheet>
        </v-col>

        <v-col cols="12" lg="8">
          <v-sheet class="gift-list pa-4 pa-md-5" rounded="xl">
            <v-progress-linear v-if="isLoading" class="mb-4" color="primary" indeterminate />

            <v-table v-if="gifts.length > 0" density="comfortable" hover>
              <thead>
                <tr>
                  <th>Presente</th>
                  <th>Marketplace</th>
                  <th>Quantidade</th>
                  <th>Status</th>
                  <th class="text-right">Acoes</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="gift in gifts" :key="gift.id">
                  <td>
                    <p class="mb-0 font-weight-bold">{{ gift.name }}</p>
                    <p class="mb-0 text-caption">Ordem {{ gift.sortOrder }}</p>
                  </td>
                  <td>{{ marketplaceLabel(gift.marketplace) }}</td>
                  <td>{{ gift.confirmedQuantity }} / {{ gift.maxQuantity }}</td>
                  <td>
                    <v-chip
                      :color="gift.isBlocked ? 'error' : 'success'"
                      size="small"
                      variant="tonal"
                    >
                      {{ gift.isBlocked ? 'Bloqueado' : 'Ativo' }}
                    </v-chip>
                  </td>
                  <td class="text-right">
                    <div class="d-flex justify-end ga-1 flex-wrap">
                      <v-btn size="x-small" variant="tonal" @click="editGift(gift)">Editar</v-btn>
                      <v-btn
                        :color="gift.isBlocked ? 'success' : 'warning'"
                        size="x-small"
                        variant="text"
                        @click="toggleBlock(gift)"
                      >
                        {{ gift.isBlocked ? 'Desbloquear' : 'Bloquear' }}
                      </v-btn>
                      <v-btn color="error" size="x-small" variant="text" @click="removeGift(gift.id)">
                        Excluir
                      </v-btn>
                    </div>
                  </td>
                </tr>
              </tbody>
            </v-table>

            <v-empty-state
              v-else-if="!isLoading"
              headline="Nenhum presente cadastrado"
              icon="mdi-gift-off-outline"
              text="Adicione o primeiro presente para liberar a lista publica."
            />
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
  import type { AdminGift } from '@/types/admin'
  import { computed, onMounted, reactive, ref } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import {
    createAdminEventGift,
    deleteAdminEventGift,
    listAdminEventGifts,
    toggleAdminEventGiftBlock,
    updateAdminEventGift,
  } from '@/api/adminApi'
  import { useAppToast } from '@/composables/useAppToast'
  import { ApiError } from '@/services/http'
  import { useAdminAuthStore } from '@/stores/useAdminAuthStore'

  const route = useRoute()
  const router = useRouter()
  const authStore = useAdminAuthStore()
  const { toast, toastLocation, showToast } = useAppToast()

  const formRef = ref<{ validate: () => Promise<{ valid: boolean }> } | null>(null)
  const gifts = ref<AdminGift[]>([])
  const isLoading = ref(false)
  const isSaving = ref(false)
  const editingGiftId = ref('')

  const form = reactive({
    name: '',
    description: '',
    imageUrl: '',
    marketplace: 'amazon' as 'amazon' | 'mercadolivre' | 'shopee',
    marketplaceUrl: '',
    affiliateLinkAmazon: '',
    affiliateLinkMl: '',
    affiliateLinkShopee: '',
    asin: '',
    maxQuantity: 1,
    sortOrder: 0,
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

  const marketplaceItems = [
    { title: 'Amazon', value: 'amazon' },
    { title: 'Mercado Livre', value: 'mercadolivre' },
    { title: 'Shopee', value: 'shopee' },
  ]

  const nameRules = [
    (value: string) => !!value.trim() || 'Informe o nome do presente',
  ]

  const maxQuantityRules = [
    (value: number) => Number(value) >= 1 || 'Quantidade minima: 1',
  ]

  const urlRules = [
    (value: string) => !!value.trim() || 'Informe a URL do produto',
    (value: string) => {
      try {
        new URL(value)
        return true
      } catch {
        return 'Informe uma URL valida'
      }
    },
  ]

  function marketplaceLabel (value: AdminGift['marketplace']): string {
    if (value === 'mercadolivre') return 'Mercado Livre'
    if (value === 'shopee') return 'Shopee'
    return 'Amazon'
  }

  function buildPayload () {
    return {
      name: form.name.trim(),
      description: form.description.trim() || null,
      imageUrl: form.imageUrl.trim() || null,
      marketplace: form.marketplace,
      marketplaceUrl: form.marketplaceUrl.trim(),
      affiliateLinkAmazon: form.affiliateLinkAmazon.trim() || null,
      affiliateLinkMl: form.affiliateLinkMl.trim() || null,
      affiliateLinkShopee: form.affiliateLinkShopee.trim() || null,
      asin: form.asin.trim() || null,
      maxQuantity: Number(form.maxQuantity),
      sortOrder: Number(form.sortOrder) || 0,
    }
  }

  async function loadGifts (): Promise<void> {
    if (!eventId.value) {
      showToast('Evento invalido.', 'error')
      return
    }

    isLoading.value = true

    try {
      gifts.value = await listAdminEventGifts(eventId.value)
      // eslint-disable-next-line unicorn/no-array-sort
      gifts.value = [...gifts.value].sort((a, b) => a.sortOrder - b.sortOrder)
    } catch (error) {
      handleApiError(error, 'Nao foi possivel carregar os presentes.')
    } finally {
      isLoading.value = false
    }
  }

  async function submitGift (): Promise<void> {
    const validation = await formRef.value?.validate()

    if (!validation?.valid) {
      return
    }

    isSaving.value = true

    try {
      if (editingGiftId.value) {
        await updateAdminEventGift(eventId.value, editingGiftId.value, buildPayload())
        showToast('Presente atualizado com sucesso.', 'success')
      } else {
        await createAdminEventGift(eventId.value, buildPayload())
        showToast('Presente criado com sucesso.', 'success')
      }

      resetForm()
      await loadGifts()
    } catch (error) {
      handleApiError(error, 'Nao foi possivel salvar o presente.')
    } finally {
      isSaving.value = false
    }
  }

  function editGift (gift: AdminGift): void {
    editingGiftId.value = gift.id
    form.name = gift.name
    form.description = gift.description || ''
    form.imageUrl = gift.imageUrl || ''
    form.marketplace = gift.marketplace
    form.marketplaceUrl = gift.marketplaceUrl
    form.affiliateLinkAmazon = gift.affiliateLinkAmazon || ''
    form.affiliateLinkMl = gift.affiliateLinkMl || ''
    form.affiliateLinkShopee = gift.affiliateLinkShopee || ''
    form.asin = gift.asin || ''
    form.maxQuantity = gift.maxQuantity
    form.sortOrder = gift.sortOrder
  }

  async function toggleBlock (gift: AdminGift): Promise<void> {
    try {
      await toggleAdminEventGiftBlock(eventId.value, gift.id, !gift.isBlocked)
      showToast('Status do presente atualizado.', 'success')
      await loadGifts()
    } catch (error) {
      handleApiError(error, 'Nao foi possivel atualizar o status.')
    }
  }

  async function removeGift (giftId: string): Promise<void> {
    try {
      await deleteAdminEventGift(eventId.value, giftId)
      showToast('Presente excluido com sucesso.', 'success')
      await loadGifts()
    } catch (error) {
      handleApiError(error, 'Nao foi possivel excluir o presente.')
    }
  }

  function resetForm (): void {
    editingGiftId.value = ''
    form.name = ''
    form.description = ''
    form.imageUrl = ''
    form.marketplace = 'amazon'
    form.marketplaceUrl = ''
    form.affiliateLinkAmazon = ''
    form.affiliateLinkMl = ''
    form.affiliateLinkShopee = ''
    form.asin = ''
    form.maxQuantity = 1
    form.sortOrder = 0
  }

  function goBack (): void {
    const query = eventCode.value ? { event_code: eventCode.value } : undefined
    router.push({ path: `/admin/eventos/${eventId.value}/dashboard`, query })
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
        showToast('Recurso nao encontrado.', 'error')
        return
      }

      if (error.status === 422) {
        showToast('Dados invalidos. Revise os campos.', 'error')
        return
      }
    }

    showToast(fallbackMessage, 'error')
  }

  onMounted(() => {
    loadGifts()
  })
</script>

<style scoped>
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=Manrope:wght@400;500;700&display=swap');

  .admin-gifts {
    min-height: calc(100vh - 64px);
    background:
      radial-gradient(circle at 14% 10%, rgba(69, 95, 126, 0.14), transparent 34%),
      radial-gradient(circle at 84% 22%, rgba(223, 121, 66, 0.16), transparent 30%),
      linear-gradient(145deg, #f6f9fb, #edf2f6 56%, #e8eef4 100%);
  }

  .gifts__hero,
  .gift-form,
  .gift-list {
    border: 1px solid rgba(20, 33, 57, 0.1);
    background: rgba(255, 255, 255, 0.95);
    box-shadow: 0 12px 28px rgba(20, 33, 57, 0.08);
  }

  .gifts__eyebrow {
    margin: 0;
    color: #3d4f71;
    font-family: 'Manrope', sans-serif;
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.18em;
  }

  .gifts__title {
    margin: 10px 0 8px;
    color: #151f36;
    font-family: 'Cormorant Garamond', serif;
    font-size: clamp(2rem, 4vw, 3rem);
    line-height: 1.05;
  }

  .gifts__subtitle,
  .gift-form__title {
    margin: 0;
    color: #425273;
    font-family: 'Manrope', sans-serif;
  }

  .gift-form__title {
    margin-bottom: 14px;
    color: #151f36;
    font-family: 'Cormorant Garamond', serif;
    font-size: 1.9rem;
  }
</style>
