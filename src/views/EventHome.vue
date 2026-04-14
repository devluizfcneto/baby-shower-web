<template>
  <section class="event-home">
    <div class="event-home__wallpaper" />
    <div class="event-home__noise" />

    <v-container class="event-home__content py-8 py-md-12" max-width="1120">
      <v-alert
        v-if="eventStore.errorMessage"
        class="mb-6"
        closable
        type="error"
        variant="tonal"
      >
        {{ eventStore.errorMessage }}
      </v-alert>

      <v-skeleton-loader
        v-if="eventStore.isLoading"
        class="event-home__loading"
        type="image, article, actions"
      />

      <template v-else>
        <v-sheet class="hero pa-5 pa-md-8" rounded="xl">
          <div class="hero__badge">WE LOVE YOU</div>

          <h1 class="hero__title">
            {{ eventTitle }}
          </h1>

          <p class="hero__subtitle">Um convite especial para celebrar este momento com muito carinho.</p>

          <p class="hero__meta">
            {{ eventDateLabel }}
            <span v-if="venueAddress"> • {{ venueAddress }}</span>
          </p>

          <p v-if="hasPixInfo" class="hero__note">Contribuicao via Pix disponivel para este evento.</p>

          <div class="hero__actions">
            <v-btn
              class="hero__button"
              color="primary"
              rounded="pill"
              size="large"
              @click="router.push(`/evento/${eventCode}/confirmar`)"
            >
              Confirmar presença
            </v-btn>

            <v-btn
              class="hero__button"
              color="secondary"
              rounded="pill"
              size="large"
              @click="router.push(`/evento/${eventCode}/presentes`)"
            >
              Ver presentes
            </v-btn>

            <v-btn
              class="hero__button hero__button--light"
              rounded="pill"
              size="large"
              variant="outlined"
              @click="router.push(`/evento/${eventCode}/doar`)"
            >
              Fazer doacao
            </v-btn>
          </div>

          <div aria-hidden="true" class="hero__planets">
            <span class="planet planet--blue" />
            <span class="planet planet--moon" />
            <span class="planet planet--saturn" />
          </div>
        </v-sheet>

        <v-row class="mt-4 mt-md-6" dense>
          <v-col cols="12" md="4">
            <v-sheet class="info-card pa-4 pa-md-5" rounded="xl">
              <p class="info-card__label">Codigo do evento</p>
              <p class="info-card__value">{{ eventCode }}</p>
            </v-sheet>
          </v-col>

          <v-col cols="12" md="4">
            <v-sheet class="info-card pa-4 pa-md-5" rounded="xl">
              <p class="info-card__label">Data e horario</p>
              <p class="info-card__value">{{ eventDateLabel }}</p>
            </v-sheet>
          </v-col>

          <v-col cols="12" md="4">
            <v-sheet class="info-card pa-4 pa-md-5" rounded="xl">
              <p class="info-card__label">Local</p>
              <p class="info-card__value">{{ venueAddress || 'Em breve' }}</p>
            </v-sheet>
          </v-col>
        </v-row>

        <v-sheet class="details mt-4 mt-md-6 pa-5 pa-md-8" rounded="xl">
          <h2 class="details__title">Detalhes do evento</h2>

          <v-row class="mt-1" dense>
            <v-col cols="12" md="7">
              <p class="details__text">
                Estamos preparando uma celebracao especial e ficaremos muito felizes com sua presenca.
                Confirme sua participacao e explore nossa lista de presentes.
              </p>

              <p v-if="deliveryAddress" class="details__text mt-4">
                Endereco para entrega de presentes: {{ deliveryAddress }}
              </p>

              <div class="details__pix mt-4">
                <p class="info-card__label">Pix</p>
                <p v-if="dadPixKey || momPixKey" class="details__text">
                  <span v-if="dadPixKey">Responsavel 1: {{ dadPixKey }}</span>
                  <br v-if="dadPixKey && momPixKey">
                  <span v-if="momPixKey">Responsavel 2: {{ momPixKey }}</span>
                </p>
                <p v-else class="details__text">As chaves Pix ainda nao foram informadas.</p>
              </div>
            </v-col>

            <v-col class="d-flex justify-md-end align-end" cols="12" md="5">
              <v-sheet v-if="coverImageUrl" class="details__cover mb-4" rounded="lg">
                <v-img class="details__cover-image" cover height="190" :src="coverImageUrl" />
              </v-sheet>

              <v-btn
                v-if="mapsLink"
                class="details__map"
                color="primary"
                :href="mapsLink"
                prepend-icon="mdi-map-marker"
                rel="noopener noreferrer"
                rounded="pill"
                size="large"
                target="_blank"
                variant="flat"
              >
                Abrir local no mapa
              </v-btn>
            </v-col>
          </v-row>
        </v-sheet>
      </template>
    </v-container>
  </section>
</template>

<script setup lang="ts">
  import { computed, watch } from 'vue'
  import { useRouter } from 'vue-router'
  import { useEventCode } from '@/composables/useEventCode'
  import { useEventStore } from '@/stores/useEventStore'

  type EventLike = Record<string, unknown>

  const router = useRouter()
  const { eventCode } = useEventCode()
  const eventStore = useEventStore()

  const resolvedEventCode = computed(() => eventCode.value)
  const eventData = computed<EventLike>(() => (eventStore.current ?? {}) as EventLike)

  const eventTitle = computed(() => readField(['name', 'event_name']) || 'Baby Shower')
  const eventDateLabel = computed(() => formatDate(readField(['date', 'event_date'])))
  const venueAddress = computed(() => readField(['venueAddress', 'venue_address']))
  const deliveryAddress = computed(() => readField(['deliveryAddress', 'delivery_address']))
  const mapsLink = computed(() => readField(['mapsLink', 'maps_link']))
  const coverImageUrl = computed(() => readField(['coverImageUrl', 'cover_image_url']))
  const dadPixKey = computed(() => readField(['pix.dadKey', 'pix.dad_key']))
  const momPixKey = computed(() => readField(['pix.momKey', 'pix.mom_key']))
  const hasPixInfo = computed(() => Boolean(dadPixKey.value || momPixKey.value))

  async function loadEvent (): Promise<void> {
    if (!resolvedEventCode.value) return
    await eventStore.fetchEventByCode(resolvedEventCode.value)
  }

  function readField (candidates: string[]): string {
    for (const key of candidates) {
      const value = key.includes('.') ? readPath(eventData.value, key) : eventData.value[key]
      if (typeof value === 'string' && value.trim()) return value
    }

    return ''
  }

  function readPath (data: EventLike, path: string): unknown {
    return path
      .split('.')
      .reduce<unknown>((acc, item) => (typeof acc === 'object' && acc !== null ? (acc as EventLike)[item] : undefined), data)
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

  watch(resolvedEventCode, loadEvent, { immediate: true })
</script>

<style scoped>
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;700&family=Dancing+Script:wght@500;700&family=Manrope:wght@400;500;700&display=swap');

  .event-home {
    --ink: #151f36;
    --ink-soft: #3b4866;
    --moon: #d9cfd6;
    --sky: #eaf2f5;
    --paper: #f6f7f8;
    --saturn: #f18939;
    --blue-planet: #516a8a;
    --card-shadow: 0 24px 70px rgba(21, 31, 54, 0.14);

    position: relative;
    overflow: hidden;
    min-height: calc(100vh - 64px);
    background:
      radial-gradient(circle at 14% 10%, rgba(81, 106, 138, 0.14), transparent 33%),
      radial-gradient(circle at 84% 24%, rgba(241, 137, 57, 0.16), transparent 28%),
      linear-gradient(140deg, #f7f9fb, #f0f3f6 55%, #edf1f4 100%);
  }

  .event-home__wallpaper {
    position: absolute;
    inset: 0;
    background-image: url('/background_mail.jpg');
    background-repeat: no-repeat;
    background-size: 560px;
    background-position: right -150px top -86px;
    opacity: 0.18;
    mix-blend-mode: multiply;
    mask-image: linear-gradient(
      to bottom,
      transparent 0,
      transparent 20%,
      #000 33%,
      #000 63%,
      transparent 78%,
      transparent 100%
    );
    pointer-events: none;
  }

  .event-home__noise {
    position: absolute;
    inset: 0;
    background-image: radial-gradient(rgba(12, 22, 48, 0.06) 0.6px, transparent 0.6px);
    background-size: 10px 10px;
    opacity: 0.35;
    pointer-events: none;
  }

  .event-home__content {
    position: relative;
    z-index: 1;
  }

  .event-home__loading {
    border-radius: 28px;
    box-shadow: var(--card-shadow);
  }

  .hero {
    position: relative;
    border: 1px solid rgba(21, 31, 54, 0.1);
    background:
      linear-gradient(155deg, rgba(255, 255, 255, 0.95), rgba(236, 242, 246, 0.9)),
      radial-gradient(circle at 80% 12%, rgba(241, 137, 57, 0.2), transparent 45%);
    box-shadow: var(--card-shadow);
    overflow: hidden;
    animation: rise 650ms ease;
    backdrop-filter: blur(2px);
  }

  .hero__badge {
    display: inline-flex;
    padding: 6px 14px;
    border-radius: 999px;
    background: rgba(21, 31, 54, 0.08);
    color: var(--ink-soft);
    font-family: 'Manrope', sans-serif;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.24em;
  }

  .hero__title {
    margin-top: 18px;
    margin-bottom: 0;
    color: var(--ink);
    font-family: 'Cormorant Garamond', serif;
    font-size: clamp(2rem, 5vw, 3.4rem);
    line-height: 1.05;
    letter-spacing: 0.012em;
    text-transform: none;
    text-wrap: balance;
    max-width: 13ch;
  }

  .hero__subtitle {
    margin-top: 18px;
    margin-bottom: 8px;
    color: var(--ink);
    font-family: 'Manrope', sans-serif;
    font-size: clamp(1.1rem, 2vw, 1.5rem);
    font-weight: 700;
  }

  .hero__note {
    margin-top: 10px;
    margin-bottom: 0;
    color: #4b5e82;
    font-family: 'Manrope', sans-serif;
    font-size: 0.9rem;
    font-weight: 500;
  }

  .hero__meta {
    max-width: 780px;
    color: var(--ink-soft);
    font-family: 'Manrope', sans-serif;
    font-size: 0.95rem;
    line-height: 1.6;
  }

  .hero__actions {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 20px;
  }

  .hero__button {
    min-width: 180px;
    text-transform: none;
    letter-spacing: 0.01em;
    font-family: 'Manrope', sans-serif;
    font-weight: 700;
  }

  .hero__button--light {
    border-color: rgba(21, 31, 54, 0.25) !important;
    color: var(--ink) !important;
    background: rgba(255, 255, 255, 0.72);
  }

  .hero__planets {
    position: absolute;
    right: clamp(16px, 4vw, 36px);
    top: 18px;
    width: min(32vw, 280px);
    height: 150px;
    pointer-events: none;
    z-index: 0;
  }

  .planet {
    position: absolute;
    border-radius: 50%;
    box-shadow: inset -10px -10px 24px rgba(0, 0, 0, 0.12);
    animation: float var(--float-time, 5.4s) ease-in-out infinite;
    will-change: transform;
  }

  .planet--blue {
    width: 76px;
    height: 76px;
    left: 20px;
    top: 32px;
    background: radial-gradient(circle at 28% 22%, #98adca, var(--blue-planet));
    --float-time: 6.2s;
  }

  .planet--moon {
    width: 88px;
    height: 88px;
    left: 96px;
    top: 8px;
    background: radial-gradient(circle at 28% 22%, #eee6eb, var(--moon));
    --float-time: 5.1s;
    animation-delay: 340ms;
  }

  .planet--saturn {
    width: 82px;
    height: 82px;
    right: 8px;
    top: 28px;
    background: radial-gradient(circle at 26% 24%, #ffc089, var(--saturn));
    --float-time: 6.8s;
    animation-delay: 700ms;
  }

  .planet--saturn::before {
    content: '';
    position: absolute;
    inset: 30px -16px;
    border: 3px solid rgba(241, 137, 57, 0.82);
    border-radius: 50%;
    transform: rotate(-18deg);
  }

  .info-card {
    height: 100%;
    border: 1px solid rgba(21, 31, 54, 0.1);
    background: rgba(255, 255, 255, 0.88);
    box-shadow: 0 14px 28px rgba(21, 31, 54, 0.08);
    animation: rise 650ms ease;
  }

  .info-card__label {
    margin: 0;
    color: var(--ink-soft);
    font-family: 'Manrope', sans-serif;
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  .info-card__value {
    margin-top: 8px;
    margin-bottom: 0;
    color: var(--ink);
    font-family: 'Manrope', sans-serif;
    font-size: 1rem;
    font-weight: 600;
    line-height: 1.45;
  }

  .details {
    border: 1px solid rgba(21, 31, 54, 0.1);
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.92), rgba(239, 245, 248, 0.86));
    box-shadow: 0 16px 34px rgba(21, 31, 54, 0.1);
    animation: rise 650ms ease;
  }

  .details__title {
    margin: 0;
    color: var(--ink);
    font-family: 'Cormorant Garamond', serif;
    font-size: clamp(1.8rem, 4.2vw, 2.5rem);
    text-transform: uppercase;
    letter-spacing: 0.03em;
  }

  .details__text {
    margin: 0;
    color: var(--ink-soft);
    font-family: 'Manrope', sans-serif;
    font-size: 1rem;
    line-height: 1.75;
  }

  .details__map {
    text-transform: none;
    font-family: 'Manrope', sans-serif;
    font-weight: 700;
  }

  .details__pix {
    border-top: 1px dashed rgba(21, 31, 54, 0.2);
    padding-top: 12px;
  }

  .details__cover {
    overflow: hidden;
    width: 100%;
    max-width: 290px;
    border: 1px solid rgba(21, 31, 54, 0.1);
    box-shadow: 0 12px 22px rgba(21, 31, 54, 0.12);
  }

  .details__cover-image {
    filter: saturate(0.95) contrast(1.05);
  }

  @keyframes float {
    0%,
    100% {
      transform: translate3d(0, 0, 0);
    }
    50% {
      transform: translate3d(0, -10px, 0);
    }
  }

  @keyframes rise {
    from {
      opacity: 0;
      transform: translateY(12px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @media (max-width: 960px) {
    .hero {
      padding-right: 18px !important;
      padding-left: 18px !important;
    }

    .hero__planets {
      opacity: 0.82;
      transform: scale(0.74);
      transform-origin: top right;
      right: 6px;
      top: 10px;
    }

    .hero__title {
      max-width: 100%;
    }
  }

  @media (max-width: 680px) {
    .event-home__wallpaper {
      background-size: 420px;
      background-position: right -160px top -78px;
      opacity: 0.15;
    }

    .hero__actions {
      flex-direction: column;
    }

    .hero__button {
      width: 100%;
    }

    .hero__planets {
      display: block;
      width: 160px;
      height: 112px;
      top: 8px;
      right: 4px;
      transform: none;
      opacity: 0.55;
    }

    .planet--blue {
      width: 44px;
      height: 44px;
      left: 8px;
      top: 34px;
    }

    .planet--moon {
      width: 52px;
      height: 52px;
      left: 56px;
      top: 16px;
    }

    .planet--saturn {
      width: 50px;
      height: 50px;
      right: 0;
      top: 38px;
    }

    .planet--saturn::before {
      inset: 16px -10px;
      border-width: 2px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .hero,
    .info-card,
    .details,
    .planet {
      animation: none !important;
    }
  }
</style>
