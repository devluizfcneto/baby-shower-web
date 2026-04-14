<template>
  <v-container class="py-10" max-width="800">
    <v-card class="pa-6" rounded="lg">
      <v-card-title class="text-h5 mb-2">Confirmar Presença</v-card-title>
      <v-card-subtitle class="mb-6">Evento: {{ eventCode }}</v-card-subtitle>

      <v-alert type="info" variant="tonal">
        Formulário RSVP será implementado aqui com limite de até 2 acompanhantes.
      </v-alert>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
  import { useEventCode } from '@/composables/useEventCode'

  const { eventCode } = useEventCode()
</script>
