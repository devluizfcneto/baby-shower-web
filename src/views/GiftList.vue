<template>
  <v-container class="py-10" max-width="1000">
    <v-card class="pa-6" rounded="lg">
      <v-card-title class="text-h5 mb-4">Lista de Presentes</v-card-title>
      <v-card-subtitle class="mb-6">Evento: {{ eventCode }}</v-card-subtitle>

      <v-alert v-if="giftStore.errorMessage" class="mb-4" type="error" variant="tonal">
        {{ giftStore.errorMessage }}
      </v-alert>

      <v-progress-linear v-if="giftStore.isLoading" indeterminate />

      <v-list v-else-if="giftStore.items.length > 0" lines="two">
        <v-list-item v-for="gift in giftStore.items" :key="gift.id" :subtitle="gift.marketplace" :title="gift.name">
          <template #append>
            <v-chip size="small" :text="`${gift.confirmedQuantity}/${gift.maxQuantity}`" />
          </template>
        </v-list-item>
      </v-list>

      <v-alert v-else type="info" variant="tonal">
        Nenhum presente cadastrado para este evento ainda.
      </v-alert>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
  import { computed, onMounted, watch } from 'vue'
  import { useEventCode } from '@/composables/useEventCode'
  import { useGiftStore } from '@/stores/useGiftStore'

  const { eventCode } = useEventCode()
  const giftStore = useGiftStore()

  const resolvedEventCode = computed(() => eventCode.value)

  async function loadGifts () {
    if (!resolvedEventCode.value) return
    await giftStore.fetchPublicGifts(resolvedEventCode.value)
  }

  onMounted(loadGifts)
  watch(resolvedEventCode, loadGifts)
</script>
