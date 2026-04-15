<template>
  <section class="donate-page">
    <div class="donate-page__bg" />

    <v-container class="donate-page__content py-8 py-md-12" max-width="1020">
      <v-sheet class="hero pa-6 pa-md-8 mb-6" rounded="xl">
        <p class="hero__eyebrow">DOACAO VIA PIX</p>
        <h1 class="hero__title">Contribua com carinho para este momento especial</h1>
        <p class="hero__subtitle">
          Escolha uma chave Pix e realize a transferencia direto pelo app do seu banco.
        </p>

        <div class="d-flex ga-3 mt-4 flex-wrap">
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
            prepend-icon="mdi-refresh"
            rounded="pill"
            variant="text"
            @click="loadEvent"
          >
            Atualizar dados
          </v-btn>
        </div>
      </v-sheet>

      <v-progress-linear
        v-if="eventStore.isLoading"
        class="mb-6"
        color="primary"
        indeterminate
      />

      <template v-else>
        <v-empty-state
          v-if="!hasPixInfo"
          class="empty-state"
          headline="Doacao indisponivel no momento"
          icon="mdi-cash-remove"
          text="As chaves Pix ainda nao foram configuradas para este evento."
        />

        <template v-else>
          <v-row class="mb-6" dense>
            <v-col v-if="dadPixKey || dadPixQr" cols="12" md="6">
              <v-card class="pix-card h-100" rounded="xl" variant="elevated">
                <v-card-title class="pix-card__title">Pix do papai</v-card-title>
                <v-card-text>
                  <v-img
                    v-if="dadPixQr"
                    class="pix-card__qr mb-4"
                    contain
                    height="210"
                    :src="dadPixQr"
                  />

                  <p class="pix-card__label">Chave Pix</p>
                  <p class="pix-card__key">{{ dadPixKey || 'Chave Pix indisponivel.' }}</p>

                  <v-btn
                    color="primary"
                    :disabled="!dadPixKey"
                    prepend-icon="mdi-content-copy"
                    rounded="pill"
                    variant="tonal"
                    @click="copyPixKey(dadPixKey)"
                  >
                    Copiar chave
                  </v-btn>
                </v-card-text>
              </v-card>
            </v-col>

            <v-col v-if="momPixKey || momPixQr" cols="12" md="6">
              <v-card class="pix-card h-100" rounded="xl" variant="elevated">
                <v-card-title class="pix-card__title">Pix da mamae</v-card-title>
                <v-card-text>
                  <v-img
                    v-if="momPixQr"
                    class="pix-card__qr mb-4"
                    contain
                    height="210"
                    :src="momPixQr"
                  />

                  <p class="pix-card__label">Chave Pix</p>
                  <p class="pix-card__key">{{ momPixKey || 'Chave Pix indisponivel.' }}</p>

                  <v-btn
                    color="primary"
                    :disabled="!momPixKey"
                    prepend-icon="mdi-content-copy"
                    rounded="pill"
                    variant="tonal"
                    @click="copyPixKey(momPixKey)"
                  >
                    Copiar chave
                  </v-btn>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </template>
      </template>

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
  import { computed, reactive, watch } from 'vue'
  import { useRouter } from 'vue-router'
  import { useDisplay } from 'vuetify'
  import { useEventCode } from '@/composables/useEventCode'
  import { useEventStore } from '@/stores/useEventStore'

  const router = useRouter()
  const { smAndDown } = useDisplay()
  const eventStore = useEventStore()
  const { eventCode } = useEventCode()

  const toast = reactive({
    visible: false,
    message: '',
    color: 'success',
  })

  const resolvedEventCode = computed(() => eventCode.value)
  const toastLocation = computed(() => (smAndDown.value ? 'top' : 'bottom end'))

  const dadPixKey = computed(() => eventStore.current?.pix.dadKey || '')
  const momPixKey = computed(() => eventStore.current?.pix.momKey || '')
  const dadPixQr = computed(() => normalizeQrSource(eventStore.current?.pix.dadQrCode || ''))
  const momPixQr = computed(() => normalizeQrSource(eventStore.current?.pix.momQrCode || ''))
  const hasPixInfo = computed(() => Boolean(dadPixKey.value || momPixKey.value || dadPixQr.value || momPixQr.value))

  function normalizeQrSource (value: string): string {
    const trimmed = value.trim()

    if (!trimmed) {
      return ''
    }

    if (trimmed.startsWith('data:') || trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      return trimmed
    }

    return `data:image/png;base64,${trimmed}`
  }

  function showToast (message: string, color: 'success' | 'error' = 'success'): void {
    toast.visible = false
    toast.message = message
    toast.color = color

    setTimeout(() => {
      toast.visible = true
    }, 0)
  }

  async function copyPixKey (key: string): Promise<void> {
    if (!key) {
      showToast('Chave Pix indisponivel.', 'error')
      return
    }

    try {
      await navigator.clipboard.writeText(key)
      showToast('Chave Pix copiada.', 'success')
    } catch {
      showToast('Nao foi possivel copiar a chave Pix.', 'error')
    }
  }

  async function loadEvent (): Promise<void> {
    if (!resolvedEventCode.value) {
      showToast('Codigo do evento invalido.', 'error')
      return
    }

    await eventStore.fetchEventByCode(resolvedEventCode.value)
  }

  watch(resolvedEventCode, async () => {
    await loadEvent()
  }, { immediate: true })

  watch(() => eventStore.errorMessage, message => {
    if (!message) {
      return
    }

    if (message.toLowerCase().includes('nao foi encontrado')) {
      showToast('Evento nao encontrado.', 'error')
      return
    }

    if (message.toLowerCase().includes('encerrado')) {
      showToast('Este evento foi encerrado.', 'error')
      return
    }

    showToast('Nao foi possivel carregar o evento.', 'error')
  })
</script>

<style scoped>
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;700&family=Manrope:wght@400;500;700&display=swap');

  .donate-page {
    position: relative;
    min-height: calc(100vh - 64px);
    overflow: hidden;
    background:
      radial-gradient(circle at 12% 12%, rgba(81, 106, 138, 0.14), transparent 32%),
      radial-gradient(circle at 84% 24%, rgba(241, 137, 57, 0.15), transparent 30%),
      linear-gradient(140deg, #f7f9fb, #f0f3f6 55%, #edf1f4 100%);
  }

  .donate-page__bg {
    position: absolute;
    inset: 0;
    background-image: url('/background_mail.jpg');
    background-repeat: no-repeat;
    background-size: 560px;
    background-position: right -160px top -70px;
    opacity: 0.12;
    pointer-events: none;
  }

  .donate-page__content {
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
    font-size: 0.74rem;
    font-weight: 700;
    letter-spacing: 0.14em;
  }

  .hero__title {
    margin: 10px 0 6px;
    color: #151f36;
    font-family: 'Cormorant Garamond', serif;
    font-size: clamp(2rem, 5vw, 2.9rem);
    line-height: 1.05;
  }

  .hero__subtitle {
    margin: 0;
    color: #3b4866;
    font-family: 'Manrope', sans-serif;
    font-size: 0.98rem;
    max-width: 780px;
  }

  .pix-card {
    border: 1px solid rgba(21, 31, 54, 0.1);
    background: rgba(255, 255, 255, 0.95);
    box-shadow: 0 14px 30px rgba(21, 31, 54, 0.08);
  }

  .pix-card__title {
    color: #19243d;
    font-family: 'Manrope', sans-serif;
    font-weight: 700;
  }

  .pix-card__qr {
    border-radius: 12px;
    border: 1px solid rgba(21, 31, 54, 0.08);
    background: #fff;
  }

  .pix-card__label {
    margin: 0;
    color: #4b5e82;
    font-family: 'Manrope', sans-serif;
    font-size: 0.82rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  .pix-card__key {
    margin-top: 6px;
    margin-bottom: 16px;
    color: #19243d;
    font-family: 'Manrope', sans-serif;
    font-size: 0.94rem;
    word-break: break-word;
  }

  .donation-form {
    border: 1px solid rgba(21, 31, 54, 0.1);
    background: rgba(255, 255, 255, 0.94);
    box-shadow: 0 16px 34px rgba(21, 31, 54, 0.1);
  }

  .donation-form__title {
    margin: 0;
    color: #151f36;
    font-family: 'Manrope', sans-serif;
    font-size: 1.2rem;
    font-weight: 700;
  }

  .donation-form__subtitle {
    margin-top: 6px;
    margin-bottom: 0;
    color: #4b5e82;
    font-family: 'Manrope', sans-serif;
    font-size: 0.93rem;
  }

  .empty-state {
    border-radius: 18px;
    border: 1px dashed rgba(21, 31, 54, 0.22);
    background: rgba(255, 255, 255, 0.9);
  }

  @media (max-width: 680px) {
    .donate-page__bg {
      background-size: 430px;
      background-position: right -180px top -52px;
      opacity: 0.1;
    }
  }
</style>
