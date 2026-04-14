<template>
  <v-container class="py-10" max-width="1000">
    <v-alert v-if="eventStore.errorMessage" class="mb-6" type="error" variant="tonal">
      {{ eventStore.errorMessage }}
    </v-alert>

    <v-skeleton-loader v-if="eventStore.isLoading" type="article" />

    <v-card v-else class="pa-6" rounded="lg">
      <v-card-title class="text-h5 mb-2">{{ eventStore.current?.name || 'Evento' }}</v-card-title>
      <v-card-subtitle class="mb-6">Código: {{ eventCode }}</v-card-subtitle>

      <v-row>
        <v-col cols="12" md="4">
          <v-btn block color="primary" @click="router.push(`/evento/${eventCode}/confirmar`)">
            Confirmar Presença
          </v-btn>
        </v-col>
        <v-col cols="12" md="4">
          <v-btn block color="secondary" @click="router.push(`/evento/${eventCode}/presentes`)">
            Ver Presentes
          </v-btn>
        </v-col>
        <v-col cols="12" md="4">
          <v-btn block variant="outlined" @click="router.push(`/evento/${eventCode}/doar`)">
            Fazer Doação
          </v-btn>
        </v-col>
      </v-row>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
  import { computed, onMounted, watch } from 'vue'
  import { useRouter } from 'vue-router'
  import { useEventCode } from '@/composables/useEventCode'
  import { useEventStore } from '@/stores/useEventStore'

  const router = useRouter()
  const { eventCode } = useEventCode()
  const eventStore = useEventStore()

  const resolvedEventCode = computed(() => eventCode.value)

  async function loadEvent () {
    if (!resolvedEventCode.value) return
    await eventStore.fetchEventByCode(resolvedEventCode.value)
  }

  onMounted(loadEvent)
  watch(resolvedEventCode, loadEvent)
</script>
