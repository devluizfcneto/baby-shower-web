<template>
  <v-container class="py-12" max-width="900">
    <v-card class="pa-6" rounded="lg" variant="tonal">
      <v-card-title class="text-h4 font-weight-bold mb-4">
        Baby Shower
      </v-card-title>
      <v-card-text class="text-body-1 mb-6">
        Projeto inicial preparado para os fluxos públicos por <strong>event_code</strong> e painel administrativo.
      </v-card-text>

      <v-row>
        <v-col cols="12" md="8">
          <v-text-field
            v-model="eventCode"
            density="comfortable"
            hide-details
            label="Digite o código do evento"
            placeholder="ex: cha-da-luna-2026"
            variant="outlined"
          />
        </v-col>
        <v-col cols="12" md="4">
          <v-btn block color="primary" size="large" @click="goToEvent">
            Acessar Evento
          </v-btn>
        </v-col>
      </v-row>

      <div class="d-flex flex-wrap ga-3 mt-6">
        <v-btn variant="outlined" @click="router.push('/admin/eventos')">
          Ir para painel admin
        </v-btn>
      </div>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import { useRouter } from 'vue-router'

  const router = useRouter()
  const eventCode = ref('')

  function goToEvent () {
    if (!eventCode.value.trim()) return

    router.push(`/evento/${eventCode.value.trim()}`)
  }
</script>
