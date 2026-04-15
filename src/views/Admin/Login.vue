<template>
  <section class="admin-login">
    <v-container class="admin-login__content py-8 py-md-14" max-width="980">
      <v-row align="stretch" class="ga-0" justify="center">
        <v-col cols="12" md="6">
          <v-sheet class="admin-login__showcase pa-6 pa-md-8 h-100" rounded="xl">
            <p class="admin-login__eyebrow">PAINEL ADMINISTRATIVO</p>
            <h1 class="admin-login__title">Gerencie seu evento com praticidade.</h1>
            <p class="admin-login__text">
              Acesse seus eventos, acompanhe confirmacoes de presenca, compras declaradas e doacoes em tempo real.
            </p>
            <div class="admin-login__chips">
              <v-chip color="primary" variant="tonal">UC-06</v-chip>
              <v-chip color="secondary" variant="tonal">Sessao segura</v-chip>
              <v-chip color="success" variant="tonal">Fluxo rapido</v-chip>
            </div>
          </v-sheet>
        </v-col>

        <v-col cols="12" md="6">
          <v-sheet class="admin-login__form pa-6 pa-md-8 h-100" rounded="xl">
            <p class="admin-login__form-label">Entrar</p>
            <h2 class="admin-login__form-title">Bem-vindo de volta</h2>

            <v-form ref="formRef" class="mt-6" @submit.prevent="onSubmit">
              <v-text-field
                v-model="form.email"
                autocomplete="email"
                clearable
                density="comfortable"
                label="E-mail"
                :rules="emailRules"
                type="email"
                variant="outlined"
              />

              <v-text-field
                v-model="form.password"
                autocomplete="current-password"
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
                :loading="authStore.isLoading"
                rounded="pill"
                size="large"
                type="submit"
              >
                Entrar no painel
              </v-btn>
            </v-form>

            <div class="text-center mt-4">
              <p class="text-sm text-grey-600 mb-0">
                Não tem conta?
                <router-link class="text-primary text-weight-500 text-decoration-none" to="/admin/signup">
                  Cadastre-se aqui
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
  import { onMounted, reactive, ref } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { useAppToast } from '@/composables/useAppToast'
  import { ApiError } from '@/services/http'
  import { useAdminAuthStore } from '@/stores/useAdminAuthStore'

  const router = useRouter()
  const route = useRoute()
  const authStore = useAdminAuthStore()
  const { toast, toastLocation, showToast } = useAppToast()

  const formRef = ref<{ validate: () => Promise<{ valid: boolean }> } | null>(null)
  const showPassword = ref(false)

  const form = reactive({
    email: '',
    password: '',
  })

  const emailRules = [
    (value: string) => !!value.trim() || 'Informe seu e-mail',
    (value: string) => /\S+@\S+\.\S+/.test(value) || 'Informe um e-mail valido',
  ]

  const passwordRules = [
    (value: string) => !!value.trim() || 'Informe sua senha',
    (value: string) => value.trim().length >= 6 || 'Senha deve ter ao menos 6 caracteres',
  ]

  async function onSubmit (): Promise<void> {
    const validation = await formRef.value?.validate()

    if (!validation?.valid) {
      return
    }

    try {
      await authStore.login({
        email: form.email.trim(),
        password: form.password,
      })

      showToast('Login realizado com sucesso.', 'success')

      const redirectPath = typeof route.query.redirect === 'string' ? route.query.redirect : '/admin/eventos'

      setTimeout(() => {
        router.push(redirectPath)
      }, 250)
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 401 || error.status === 403) {
          showToast('Credenciais invalidas.', 'error')
          return
        }

        if (error.status === 429) {
          showToast('Muitas tentativas. Aguarde e tente novamente.', 'error')
          return
        }

        if (error.status && error.status >= 500) {
          showToast('Erro no servidor. Tente novamente.', 'error')
          return
        }
      }

      showToast('Nao foi possivel realizar login.', 'error')
    }
  }

  onMounted(async () => {
    const isAuthenticated = await authStore.ensureSession()

    if (isAuthenticated) {
      router.replace('/admin/eventos')
    }
  })
</script>

<style scoped>
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=Manrope:wght@400;500;700&display=swap');

  .admin-login {
    min-height: 100vh;
    background:
      radial-gradient(circle at 15% 10%, rgba(68, 96, 129, 0.14), transparent 34%),
      radial-gradient(circle at 85% 20%, rgba(219, 119, 66, 0.17), transparent 30%),
      linear-gradient(145deg, #f5f8fb, #edf2f6 56%, #e8eef4 100%);
  }

  .admin-login__content {
    position: relative;
  }

  .admin-login__showcase {
    border: 1px solid rgba(19, 33, 58, 0.1);
    background: linear-gradient(155deg, rgba(255, 255, 255, 0.95), rgba(237, 243, 247, 0.9));
    box-shadow: 0 20px 48px rgba(19, 33, 58, 0.11);
  }

  .admin-login__eyebrow {
    margin: 0;
    color: #3c4d6e;
    font-family: 'Manrope', sans-serif;
    font-size: 0.74rem;
    font-weight: 700;
    letter-spacing: 0.18em;
  }

  .admin-login__title {
    margin: 14px 0 10px;
    color: #151f36;
    font-family: 'Cormorant Garamond', serif;
    font-size: clamp(2rem, 3.5vw, 3rem);
    line-height: 1.08;
    text-wrap: balance;
  }

  .admin-login__text {
    margin: 0;
    color: #425273;
    font-family: 'Manrope', sans-serif;
    font-size: 0.95rem;
    line-height: 1.65;
  }

  .admin-login__chips {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 22px;
  }

  .admin-login__form {
    border: 1px solid rgba(19, 33, 58, 0.1);
    background: rgba(255, 255, 255, 0.95);
    box-shadow: 0 14px 36px rgba(19, 33, 58, 0.09);
  }

  .admin-login__form-label {
    margin: 0;
    color: #3c4d6e;
    font-family: 'Manrope', sans-serif;
    font-size: 0.82rem;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  .admin-login__form-title {
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
