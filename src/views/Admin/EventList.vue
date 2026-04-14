<template>
  <v-container class="py-10" max-width="1100">
    <v-card class="pa-6" rounded="lg">
      <v-card-title class="text-h5 mb-4">Admin - Eventos</v-card-title>
      <v-card-text class="text-body-2 mb-4">
        Base inicial pronta para listar eventos do administrador via <strong>GET /api/admin/events</strong>.
      </v-card-text>

      <v-btn color="primary" @click="router.push('/admin/eventos/dashboard')">
        Abrir dashboard inicial
      </v-btn>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
  import { useRouter } from 'vue-router'

  const router = useRouter()
</script>
