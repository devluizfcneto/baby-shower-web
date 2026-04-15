<template>
  <section class="admin-signup">
    <v-container class="admin-signup__content py-8 py-md-14" max-width="980">
      <v-row align="stretch" class="ga-0" justify="center">
        <v-col cols="12" md="6">
          <v-sheet class="admin-signup__showcase pa-6 pa-md-8 h-100" rounded="xl">
            <p class="admin-signup__eyebrow">CRIAR CONTA ADMIN</p>
            <h1 class="admin-signup__title">Comece a gerenciar seu evento em poucos minutos.</h1>
            <p class="admin-signup__text">
              Cadastre sua conta para acompanhar convidados, presentes e doações em um único painel.
            </p>
            <div class="admin-signup__chips">
              <v-chip color="primary" variant="tonal">Cadastro rápido</v-chip>
              <v-chip color="secondary" variant="tonal">Fluxo seguro</v-chip>
              <v-chip color="success" variant="tonal">UX clara</v-chip>
            </div>
          </v-sheet>
        </v-col>

        <v-col cols="12" md="6">
          <v-sheet class="admin-signup__form pa-6 pa-md-8 h-100" rounded="xl">
            <p class="admin-signup__form-label">Cadastro</p>
            <h2 class="admin-signup__form-title">Crie seu acesso administrativo</h2>

            <v-form ref="formRef" class="mt-6" @submit.prevent="handleSignup">
              <v-text-field
                v-model="form.name"
                autocomplete="name"
                clearable
                density="comfortable"
                label="Nome"
                :rules="nameRules"
                variant="outlined"
              />

              <v-text-field
                v-model="form.email"
                autocomplete="email"
                class="mt-2"
                clearable
                density="comfortable"
                label="E-mail"
                :rules="emailRules"
                type="email"
                variant="outlined"
              />

              <v-text-field
                v-model="form.password"
                autocomplete="new-password"
                class="mt-2"
                clearable
                density="comfortable"
                label="Senha"
                :rules="passwordRules"
                :type="showPassword ? 'text' : 'password'"
                variant="outlined"
              >
                <template #append-inner>
                  <v-btn
                    :icon="showPassword ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"
                    size="small"
                    variant="text"
                    @click="showPassword = !showPassword"
                  />
                </template>
              </v-text-field>

              <v-btn
                block
                class="mt-4"
                color="primary"
                :loading="isLoading"
                rounded="pill"
                size="large"
                type="submit"
              >
                Criar conta
              </v-btn>
            </v-form>

            <div class="text-center mt-4">
              <p class="text-sm text-grey-600 mb-0">
                Já tem conta?
                <router-link class="text-primary text-weight-500 text-decoration-none" to="/admin/login">
                  Entrar no painel
                </router-link>
              </p>
            </div>

            <v-btn class="mt-4" variant="text" @click="router.push('/')">
              Voltar para a home
            </v-btn>
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
  import type { AdminSignupPayload } from '@/types/admin'
  import { reactive, ref } from 'vue'
  import { useRouter } from 'vue-router'
  import { adminSignup } from '@/api/adminApi'
  import { useAppToast } from '@/composables/useAppToast'
  import { ApiError } from '@/services/http'

  const router = useRouter()
  const { toast, toastLocation, showToast } = useAppToast()

  const formRef = ref<{ validate: () => Promise<{ valid: boolean }> } | null>(null)
  const isLoading = ref(false)
  const showPassword = ref(false)

  const form = reactive({
    name: '',
    email: '',
    password: '',
  })

  const nameRules = [
    (value: string) => !!value.trim() || 'Informe seu nome',
    (value: string) => value.trim().length >= 3 || 'Nome deve ter ao menos 3 caracteres',
  ]

  const emailRules = [
    (value: string) => !!value.trim() || 'Informe seu e-mail',
    (value: string) => /\S+@\S+\.\S+/.test(value) || 'Informe um e-mail válido',
  ]

  const passwordRules = [
    (value: string) => !!value.trim() || 'Informe sua senha',
    (value: string) => value.trim().length >= 8 || 'Senha deve ter ao menos 8 caracteres',
  ]

  async function handleSignup (): Promise<void> {
    const validation = await formRef.value?.validate()

    if (!validation?.valid) {
      showToast('Revise os campos obrigatórios.', 'warning')
      return
    }

    isLoading.value = true

    try {
      const payload: AdminSignupPayload = {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
      }

      await adminSignup(payload)
      showToast('Conta criada com sucesso! Redirecionando para o login.', 'success')

      setTimeout(() => {
        router.push('/admin/login')
      }, 2000)
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 409) {
          showToast('Este e-mail já está cadastrado.', 'error')
          return
        }

        if (error.status === 400 || error.status === 422) {
          showToast('Dados inválidos. Verifique e tente novamente.', 'error')
          return
        }

        if (error.status && error.status >= 500) {
          showToast('Erro no servidor. Tente novamente.', 'error')
          return
        }
      }

      showToast('Não foi possível concluir o cadastro.', 'error')
    } finally {
      isLoading.value = false
    }
  }
</script>

<style scoped>
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=Manrope:wght@400;500;700&display=swap');

  .admin-signup {
    min-height: 100vh;
    background:
      radial-gradient(circle at 10% 12%, rgba(68, 96, 129, 0.16), transparent 35%),
      radial-gradient(circle at 90% 18%, rgba(219, 119, 66, 0.15), transparent 30%),
      linear-gradient(150deg, #f5f8fb, #edf2f6 56%, #e8eef4 100%);
  }

  .admin-signup__content {
    position: relative;
  }

  .admin-signup__showcase {
    border: 1px solid rgba(19, 33, 58, 0.1);
    background: linear-gradient(155deg, rgba(255, 255, 255, 0.96), rgba(237, 243, 247, 0.91));
    box-shadow: 0 20px 48px rgba(19, 33, 58, 0.11);
  }

  .admin-signup__eyebrow {
    margin: 0;
    color: #3c4d6e;
    font-family: 'Manrope', sans-serif;
    font-size: 0.74rem;
    font-weight: 700;
    letter-spacing: 0.18em;
  }

  .admin-signup__title {
    margin: 14px 0 10px;
    color: #151f36;
    font-family: 'Cormorant Garamond', serif;
    font-size: clamp(2rem, 3.5vw, 3rem);
    line-height: 1.08;
    text-wrap: balance;
  }

  .admin-signup__text {
    margin: 0;
    color: #425273;
    font-family: 'Manrope', sans-serif;
    font-size: 0.95rem;
    line-height: 1.65;
  }

  .admin-signup__chips {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 22px;
  }

  .admin-signup__form {
    border: 1px solid rgba(19, 33, 58, 0.1);
    background: rgba(255, 255, 255, 0.96);
    box-shadow: 0 14px 36px rgba(19, 33, 58, 0.09);
  }

  .admin-signup__form-label {
    margin: 0;
    color: #3c4d6e;
    font-family: 'Manrope', sans-serif;
    font-size: 0.82rem;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  .admin-signup__form-title {
    margin-top: 10px;
    margin-bottom: 0;
    color: #151f36;
    font-family: 'Cormorant Garamond', serif;
    font-size: clamp(1.8rem, 3.2vw, 2.5rem);
    line-height: 1.1;
  }

  .text-sm {
    font-size: 0.875rem;
  }

  .text-grey-600 {
    color: #757575;
  }

  .text-center {
    text-align: center;
  }

  .mb-0 {
    margin-bottom: 0;
  }

  .text-decoration-none {
    text-decoration: none;
  }

  .text-weight-500 {
    font-weight: 500;
  }
</style>
