<template>
  <section class="confirm-page">
    <div
      class="confirm-page__wallpaper"
      :class="{
        'confirm-page__wallpaper--custom': hasCustomCover,
        'confirm-page__wallpaper--default': !hasCustomCover,
      }"
      :style="wallpaperStyle"
    />

    <v-container class="confirm-page__content py-8 py-md-12" max-width="980">
      <v-sheet class="hero pa-5 pa-md-8 mb-4" rounded="xl">
        <div class="hero__badge">CONFIRMACAO DE PRESENCA</div>
        <h1 class="hero__title">{{ eventTitle }}</h1>
        <p class="hero__meta">{{ eventDateLabel }}<span v-if="venueAddress"> • {{ venueAddress }}</span></p>
      </v-sheet>

      <v-sheet class="form-shell pa-5 pa-md-8" rounded="xl">
        <v-form ref="formRef" @submit.prevent="onSubmit">
          <v-row dense>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.fullName"
                class="mb-2"
                clearable
                density="comfortable"
                :disabled="hasConfirmed"
                label="Seu nome completo"
                :rules="fullNameRules"
                variant="outlined"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.email"
                class="mb-2"
                clearable
                density="comfortable"
                :disabled="hasConfirmed"
                label="Seu e-mail"
                :rules="emailRules"
                type="email"
                variant="outlined"
              />
            </v-col>
          </v-row>

          <div class="companions mt-4">
            <div class="companions__header">
              <p class="companions__title">Acompanhantes (opcional)</p>
              <p class="companions__subtitle">Voce pode adicionar ate 2 acompanhantes. O nome e obrigatorio e o e-mail e opcional.</p>
            </div>

            <v-row dense>
              <v-col v-for="(companion, index) in form.companions" :key="`companion-${index}`" cols="12">
                <div class="d-flex ga-2 align-center flex-wrap flex-sm-nowrap">
                  <v-text-field
                    v-model="companion.fullName"
                    density="comfortable"
                    :disabled="hasConfirmed"
                    :label="`Nome do acompanhante ${index + 1}`"
                    :rules="companionNameRules"
                    variant="outlined"
                  />

                  <v-text-field
                    v-model="companion.email"
                    density="comfortable"
                    :disabled="hasConfirmed"
                    :label="`E-mail do acompanhante ${index + 1} (opcional)`"
                    :rules="companionEmailRules"
                    type="email"
                    variant="outlined"
                  />

                  <v-btn
                    color="error"
                    :disabled="hasConfirmed"
                    icon="mdi-delete-outline"
                    variant="tonal"
                    @click="removeCompanion(index)"
                  />
                </div>
              </v-col>
            </v-row>

            <v-btn
              class="mt-2"
              color="primary"
              :disabled="hasConfirmed || form.companions.length >= 2"
              prepend-icon="mdi-account-plus-outline"
              variant="outlined"
              @click="addCompanion"
            >
              Adicionar acompanhante
            </v-btn>
          </div>

          <div class="d-flex flex-wrap ga-3 mt-6">
            <v-btn
              class="submit-btn"
              color="primary"
              :disabled="hasConfirmed"
              :loading="isSubmitting"
              rounded="pill"
              size="large"
              type="submit"
            >
              {{ submitButtonLabel }}
            </v-btn>

            <v-btn
              rounded="pill"
              size="large"
              variant="text"
              @click="router.push(`/evento/${eventCode}`)"
            >
              Voltar para o evento
            </v-btn>
          </div>
        </v-form>
      </v-sheet>

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
  import type { RSVPCompanionPayload } from '@/types/rsvp'
  import { computed, onBeforeUnmount, reactive, ref, watch } from 'vue'
  import { useRouter } from 'vue-router'
  import { useDisplay } from 'vuetify'
  import { submitRsvp } from '@/api/rsvpApi'
  import { useEventCode } from '@/composables/useEventCode'
  import { ApiError } from '@/services/http'
  import { useEventStore } from '@/stores/useEventStore'

  const router = useRouter()
  const eventStore = useEventStore()
  const { eventCode } = useEventCode()
  const { smAndDown } = useDisplay()

  const formRef = ref<{ validate: () => Promise<{ valid: boolean }> } | null>(null)
  const isSubmitting = ref(false)
  const hasConfirmed = ref(false)
  const redirectTimeout = ref<ReturnType<typeof setTimeout> | null>(null)

  const toast = reactive({
    visible: false,
    message: '',
    color: 'success',
  })

  const form = reactive({
    fullName: '',
    email: '',
    companions: [] as RSVPCompanionPayload[],
  })

  const resolvedEventCode = computed(() => eventCode.value)
  const eventTitle = computed(() => eventStore.current?.name || 'Evento')
  const venueAddress = computed(() => eventStore.current?.venueAddress || '')
  const eventDateLabel = computed(() => formatDate(eventStore.current?.date || ''))
  const coverImageUrl = computed(() => eventStore.current?.coverImageUrl?.trim() || '')
  const hasCustomCover = computed(() => Boolean(coverImageUrl.value))
  const submitButtonLabel = computed(() => (hasConfirmed.value ? 'Confirmado!' : 'Confirmar presenca'))
  const toastLocation = computed(() => (smAndDown.value ? 'top' : 'bottom end'))
  const wallpaperStyle = computed(() => {
    const source = coverImageUrl.value || '/background_mail.jpg'

    return {
      backgroundImage: `url("${source}")`,
    }
  })

  const fullNameRules = [
    (value: string) => !!value.trim() || 'Informe seu nome completo',
    (value: string) => value.trim().length >= 3 || 'Nome deve ter ao menos 3 caracteres',
  ]

  const emailRules = [
    (value: string) => !!value.trim() || 'Informe seu e-mail',
    (value: string) => /\S+@\S+\.\S+/.test(value) || 'Informe um e-mail valido',
  ]

  const companionNameRules = [
    (value: string) => !!value.trim() || 'Informe o nome completo do acompanhante',
    (value: string) => value.trim().length >= 3 || 'Nome deve ter ao menos 3 caracteres',
  ]

  const companionEmailRules = [
    (value: string) => !value.trim() || /\S+@\S+\.\S+/.test(value) || 'Informe um e-mail valido',
  ]

  function addCompanion (): void {
    if (form.companions.length >= 2) return
    form.companions.push({ fullName: '', email: '' })
  }

  function removeCompanion (index: number): void {
    form.companions.splice(index, 1)
  }

  function showToast (message: string, color: 'success' | 'error' = 'success'): void {
    toast.visible = false
    toast.message = message
    toast.color = color

    setTimeout(() => {
      toast.visible = true
    }, 0)
  }

  function getLoadEventErrorMessage (message: string): string {
    const normalizedMessage = message.toLowerCase()

    if (normalizedMessage.includes('nao foi encontrado')) {
      return 'Evento nao encontrado.'
    }

    if (normalizedMessage.includes('encerrado')) {
      return 'Este evento foi encerrado.'
    }

    return 'Nao foi possivel carregar o evento.'
  }

  function getConfirmationStorageKey (code: string): string {
    return `rsvp-confirmed:${code}`
  }

  function getFormStorageKey (code: string): string {
    return `rsvp-form:${code}`
  }

  function persistFormData (): void {
    if (!resolvedEventCode.value) return

    const normalizedCompanions = form.companions
      .map(companion => ({
        fullName: companion.fullName,
        email: companion.email,
      }))
      .slice(0, 2)

    localStorage.setItem(getFormStorageKey(resolvedEventCode.value), JSON.stringify({
      fullName: form.fullName,
      email: form.email,
      companions: normalizedCompanions,
    }))
  }

  function restoreFormData (): void {
    if (!resolvedEventCode.value) return

    const raw = localStorage.getItem(getFormStorageKey(resolvedEventCode.value))
    if (!raw) return

    try {
      const parsed = JSON.parse(raw) as {
        fullName?: string
        email?: string
        companions?: RSVPCompanionPayload[]
      }

      form.fullName = parsed.fullName || ''
      form.email = parsed.email || ''
      form.companions = (parsed.companions || []).slice(0, 2).map(companion => ({
        fullName: companion.fullName || '',
        email: companion.email || '',
      }))
    } catch {
      localStorage.removeItem(getFormStorageKey(resolvedEventCode.value))
    }
  }

  async function onSubmit (): Promise<void> {
    if (hasConfirmed.value) {
      showToast('Verifique sua caixa de email, sua confirmacao foi efetuada com sucesso!', 'success')
      return
    }

    if (!resolvedEventCode.value) {
      showToast('Codigo do evento invalido.', 'error')
      return
    }

    const validation = await formRef.value?.validate()
    if (!validation?.valid) return

    const companions = form.companions
      .map(companion => ({
        fullName: companion.fullName.trim(),
        email: companion.email?.trim() || '',
      }))
      .filter(companion => companion.fullName || companion.email)

    if (companions.length > 2) {
      showToast('Limite maximo: 2 acompanhantes.', 'error')
      return
    }

    const hasInvalidCompanion = companions.some(companion => {
      return companion.fullName.length < 3 || (Boolean(companion.email) && !/\S+@\S+\.\S+/.test(companion.email))
    })

    if (hasInvalidCompanion) {
      showToast('Cada acompanhante precisa de nome valido e e-mail valido quando informado.', 'error')
      return
    }

    isSubmitting.value = true

    try {
      await submitRsvp(resolvedEventCode.value, {
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        companions: companions.length > 0
          ? companions.map(companion => ({
            fullName: companion.fullName,
            ...(companion.email ? { email: companion.email } : {}),
          }))
          : undefined,
      })

      form.fullName = form.fullName.trim()
      form.email = form.email.trim()
      form.companions = companions.map(companion => ({
        fullName: companion.fullName,
        email: companion.email,
      }))
      persistFormData()

      hasConfirmed.value = true
      showToast('Verifique sua caixa de email, sua confirmacao foi efetuada com sucesso!', 'success')

      if (resolvedEventCode.value) {
        localStorage.setItem(getConfirmationStorageKey(resolvedEventCode.value), 'true')
      }

      redirectTimeout.value = setTimeout(() => {
        router.push(`/evento/${resolvedEventCode.value}`)
      }, 1000)
    } catch (error) {
      if (error instanceof ApiError) {
        switch (error.status) {
          case 404: {
            showToast('Evento nao encontrado.', 'error')
            break
          }
          case 409: {
            showToast('Presenca ja confirmada para este e-mail.', 'error')
            break
          }
          case 410: {
            showToast('Este evento foi encerrado.', 'error')
            break
          }
          case 422: {
            showToast('Dados invalidos. Revise o formulario.', 'error')
            break
          }
          case 429: {
            showToast('Muitas tentativas. Tente novamente em instantes.', 'error')
            break
          }
          default: {
            if (error.status && error.status >= 500) {
              showToast('Erro no servidor. Tente novamente.', 'error')
            } else {
              showToast('Nao foi possivel confirmar sua presenca.', 'error')
            }
          }
        }
      } else {
        showToast('Falha de conexao. Verifique sua internet.', 'error')
      }
    } finally {
      isSubmitting.value = false
    }
  }

  async function loadEvent (): Promise<void> {
    if (!resolvedEventCode.value) return
    await eventStore.fetchEventByCode(resolvedEventCode.value)
  }

  function syncConfirmationState (): void {
    if (!resolvedEventCode.value) return

    const isAlreadyConfirmed = localStorage.getItem(getConfirmationStorageKey(resolvedEventCode.value)) === 'true'
    hasConfirmed.value = isAlreadyConfirmed

    if (isAlreadyConfirmed) {
      showToast('Verifique sua caixa de email, sua confirmacao foi efetuada com sucesso!', 'success')
    }
  }

  function formatDate (value: string): string {
    if (!value) return 'Data sera divulgada em breve'

    const parsed = new Date(value)
    if (Number.isNaN(parsed.getTime())) return value

    return new Intl.DateTimeFormat('pt-BR', {
      dateStyle: 'full',
      timeStyle: 'short',
    }).format(parsed)
  }

  watch(resolvedEventCode, async () => {
    await loadEvent()
    restoreFormData()
    syncConfirmationState()
  }, { immediate: true })

  watch(() => eventStore.errorMessage, message => {
    if (message) {
      showToast(getLoadEventErrorMessage(message), 'error')
    }
  })

  watch(form, () => {
    persistFormData()
  }, { deep: true })

  onBeforeUnmount(() => {
    if (redirectTimeout.value) {
      clearTimeout(redirectTimeout.value)
    }
  })
</script>

<style scoped>
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;700&family=Manrope:wght@400;500;700&display=swap');

  .confirm-page {
    position: relative;
    overflow: hidden;
    min-height: calc(100vh - 64px);
    background:
      radial-gradient(circle at 14% 10%, rgba(81, 106, 138, 0.14), transparent 33%),
      radial-gradient(circle at 84% 24%, rgba(241, 137, 57, 0.16), transparent 28%),
      linear-gradient(140deg, #f7f9fb, #f0f3f6 55%, #edf1f4 100%);
  }

  .confirm-page__wallpaper {
    position: absolute;
    inset: 0;
    background-repeat: no-repeat;
    transition: opacity 220ms ease;
    pointer-events: none;
  }

  .confirm-page__wallpaper--default {
    background-size: 540px;
    background-position: right -170px top -62px;
    opacity: 0.14;
    mix-blend-mode: multiply;
  }

  .confirm-page__wallpaper--custom {
    background-size: cover;
    background-position: center center;
    opacity: 0.22;
    filter: saturate(0.92) contrast(1.06);
    mask-image: linear-gradient(
      to bottom,
      rgba(0, 0, 0, 0.84) 0%,
      rgba(0, 0, 0, 0.66) 44%,
      rgba(0, 0, 0, 0.36) 74%,
      rgba(0, 0, 0, 0.18) 100%
    );
  }

  .confirm-page__content {
    position: relative;
    z-index: 1;
  }

  .hero {
    border: 1px solid rgba(21, 31, 54, 0.1);
    background: linear-gradient(155deg, rgba(255, 255, 255, 0.96), rgba(236, 242, 246, 0.9));
    box-shadow: 0 20px 44px rgba(21, 31, 54, 0.14);
  }

  .hero__badge {
    display: inline-flex;
    padding: 6px 14px;
    border-radius: 999px;
    background: rgba(21, 31, 54, 0.08);
    color: #3b4866;
    font-family: 'Manrope', sans-serif;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.2em;
  }

  .hero__title {
    margin-top: 16px;
    margin-bottom: 4px;
    color: #151f36;
    font-family: 'Cormorant Garamond', serif;
    font-size: clamp(2rem, 5vw, 3rem);
    line-height: 1.05;
    text-wrap: balance;
  }

  .hero__meta {
    margin: 0;
    color: #3b4866;
    font-family: 'Manrope', sans-serif;
    font-size: 0.95rem;
  }

  .form-shell {
    border: 1px solid rgba(21, 31, 54, 0.1);
    background: rgba(255, 255, 255, 0.92);
    box-shadow: 0 16px 34px rgba(21, 31, 54, 0.1);
  }

  .companions {
    border-top: 1px dashed rgba(21, 31, 54, 0.18);
    padding-top: 14px;
  }

  .companions__title {
    margin: 0;
    color: #151f36;
    font-family: 'Manrope', sans-serif;
    font-size: 1rem;
    font-weight: 700;
  }

  .companions__subtitle {
    margin-top: 2px;
    margin-bottom: 10px;
    color: #4b5e82;
    font-family: 'Manrope', sans-serif;
    font-size: 0.9rem;
  }

  .submit-btn {
    min-width: 220px;
    text-transform: none;
    letter-spacing: 0.01em;
    font-family: 'Manrope', sans-serif;
    font-weight: 700;
  }

  @media (max-width: 680px) {
    .confirm-page__wallpaper--default {
      background-size: 420px;
      background-position: right -175px top -56px;
      opacity: 0.12;
    }

    .confirm-page__wallpaper--custom {
      background-position: center top;
      opacity: 0.2;
    }

    .submit-btn {
      width: 100%;
    }
  }
</style>
