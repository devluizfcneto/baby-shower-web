<template>
  <section class="event-home">
    <div
      class="event-home__wallpaper"
      :class="{
        'event-home__wallpaper--custom': hasCustomCover,
        'event-home__wallpaper--default': !hasCustomCover,
      }"
      :style="wallpaperStyle"
    />
    <div class="event-home__noise" />

    <v-container class="event-home__content py-8 py-md-12" max-width="1120">
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

          <v-chip
            v-if="countdownLabel"
            class="hero__countdown mt-3"
            color="primary"
            prepend-icon="mdi-timer-outline"
            size="small"
            variant="tonal"
          >
            {{ countdownLabel }}
          </v-chip>

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

        <v-sheet class="details mt-4 mt-md-6 pa-5 pa-md-8" rounded="xl">
          <h2 class="details__title">Detalhes do evento</h2>

          <v-row class="mt-1" dense>
            <v-col cols="12">
              <div class="details__content">
                <template v-for="(block, blockIndex) in eventDetailBlocks" :key="`event-detail-${blockIndex}`">
                  <h3 v-if="block.type === 'heading'" class="details__heading">
                    <template v-for="(token, tokenIndex) in block.tokens" :key="`heading-token-${blockIndex}-${tokenIndex}`">
                      <strong v-if="token.bold">{{ token.text }}</strong>
                      <span v-else>{{ token.text }}</span>
                    </template>
                  </h3>

                  <ul v-else-if="block.type === 'list'" class="details__list">
                    <li
                      v-for="(item, itemIndex) in block.items"
                      :key="`detail-item-${blockIndex}-${itemIndex}`"
                      class="details__list-item"
                    >
                      <template v-for="(token, tokenIndex) in item" :key="`item-token-${blockIndex}-${itemIndex}-${tokenIndex}`">
                        <strong v-if="token.bold">{{ token.text }}</strong>
                        <span v-else>{{ token.text }}</span>
                      </template>
                    </li>
                  </ul>

                  <p v-else class="details__text details__text--paragraph">
                    <template v-for="(token, tokenIndex) in block.tokens" :key="`paragraph-token-${blockIndex}-${tokenIndex}`">
                      <strong v-if="token.bold">{{ token.text }}</strong>
                      <span v-else>{{ token.text }}</span>
                    </template>
                  </p>
                </template>
              </div>
            </v-col>
          </v-row>
        </v-sheet>

        <v-row class="mt-4 mt-md-6" dense>
          <v-col cols="12">
            <v-sheet class="info-card pa-4 pa-md-5" rounded="xl">
              <p class="info-card__label">Local</p>
              <div class="location-row">
                <p class="info-card__value">{{ venueAddress || 'Em breve' }}</p>
                <v-btn
                  v-if="venueAddress"
                  class="location-copy"
                  density="comfortable"
                  icon="mdi-content-copy"
                  size="small"
                  variant="text"
                  @click="copyVenueAddress"
                />
              </div>

              <div v-if="mapEmbedSrc" class="location-map mt-3">
                <iframe
                  allowfullscreen
                  class="location-map__iframe"
                  loading="lazy"
                  referrerpolicy="no-referrer-when-downgrade"
                  :src="mapEmbedSrc"
                  title="Mapa do local do evento"
                />
              </div>

              <div v-else class="location-empty mt-3">
                <v-icon class="location-empty__icon" icon="mdi-map-marker-off" size="30" />
                <p class="location-empty__title">Nao contem informacao</p>
                <p class="location-empty__text">O link do mapa ainda nao foi informado para este evento.</p>
              </div>

              <v-btn
                v-if="mapsLink"
                class="details__map mt-3"
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
            </v-sheet>
          </v-col>
        </v-row>
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
  import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
  import { useRouter } from 'vue-router'
  import { useAppToast } from '@/composables/useAppToast'
  import { useEventCode } from '@/composables/useEventCode'
  import { useEventStore } from '@/stores/useEventStore'

  type EventLike = Record<string, unknown>
  type DetailInlineToken = {
    text: string
    bold: boolean
  }

  type DetailBlock =
    | {
      type: 'heading'
      tokens: DetailInlineToken[]
    }
    | {
      type: 'paragraph'
      tokens: DetailInlineToken[]
    }
    | {
      type: 'list'
      items: DetailInlineToken[][]
    }

  const router = useRouter()
  const { eventCode } = useEventCode()
  const eventStore = useEventStore()
  const { toast, toastLocation, showToast } = useAppToast()
  const nowTimestamp = ref(Date.now())
  const countdownTicker = ref<ReturnType<typeof setInterval> | null>(null)

  const resolvedEventCode = computed(() => eventCode.value)
  const eventData = computed<EventLike>(() => (eventStore.current ?? {}) as EventLike)

  const eventTitle = computed(() => readField(['name', 'event_name']) || 'Baby Shower')
  const eventDateIso = computed(() => readField(['date', 'event_date']))
  const eventDateLabel = computed(() => formatDate(eventDateIso.value))
  const venueAddress = computed(() => readField(['venueAddress', 'venue_address']))
  const mapsLink = computed(() => readField(['mapsLink', 'maps_link']))
  const coverImageUrl = computed(() => readField(['coverImageUrl', 'cover_image_url']))
  const eventDetailText = computed(() => readField(['eventDetail', 'event_detail']) || 'Estamos preparando uma celebracao especial e ficaremos muito felizes com sua presenca. Confirme sua participacao e explore nossa lista de presentes.')
  const eventDetailBlocks = computed(() => parseEventDetailBlocks(eventDetailText.value))
  const hasCustomCover = computed(() => Boolean(coverImageUrl.value))
  const mapEmbedSrc = computed(() => buildMapEmbedSrc(mapsLink.value))
  const countdownLabel = computed(() => formatCountdown(eventDateIso.value, nowTimestamp.value))
  const wallpaperStyle = computed(() => {
    const source = coverImageUrl.value || '/background_mail.jpg'

    return {
      backgroundImage: `url("${source}")`,
    }
  })

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

  function extractMapQuery (value: string): string {
    if (!value) {
      return ''
    }

    try {
      const url = new URL(value)
      const queryFromSearch = url.searchParams.get('q') || url.searchParams.get('query')

      if (queryFromSearch && queryFromSearch.trim()) {
        return queryFromSearch.trim()
      }

      const path = decodeURIComponent(url.pathname || '')
      if (path.includes('/place/')) {
        const place = path.split('/place/')[1]?.split('/')[0]
        if (place) {
          return place.replaceAll('+', ' ')
        }
      }
    } catch {
      return value
    }

    return value
  }

  function buildMapEmbedSrc (link: string): string {
    const normalizedLink = link.trim()

    if (!normalizedLink) {
      return ''
    }

    if (normalizedLink.includes('google.com/maps/embed')) {
      return normalizedLink
    }

    const query = extractMapQuery(normalizedLink)

    if (!query) {
      return ''
    }

    return `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`
  }

  function formatCountdown (dateValue: string, nowMs: number): string {
    if (!dateValue) {
      return ''
    }

    const eventDate = new Date(dateValue)
    const eventMs = eventDate.getTime()

    if (Number.isNaN(eventMs)) {
      return ''
    }

    const diff = eventMs - nowMs

    if (diff <= 0) {
      return 'Evento iniciado'
    }

    const totalMinutes = Math.floor(diff / 60_000)
    const days = Math.floor(totalMinutes / (60 * 24))
    const hours = Math.floor((totalMinutes % (60 * 24)) / 60)
    const minutes = totalMinutes % 60

    if (days > 0) {
      return `Faltam ${days}d ${hours}h ${minutes}min`
    }

    return `Faltam ${hours}h ${minutes}min`
  }

  async function copyVenueAddress (): Promise<void> {
    if (!venueAddress.value) {
      showToast('Endereco ainda nao informado.', 'error')
      return
    }

    try {
      await navigator.clipboard.writeText(venueAddress.value)
      showToast('Endereco copiado.', 'success')
    } catch {
      showToast('Nao foi possivel copiar o endereco.', 'error')
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

  function parseEventDetailBlocks (value: string): DetailBlock[] {
    const normalized = value.replace(/\r\n/g, '\n').trim()

    if (!normalized) {
      return []
    }

    const blocks: DetailBlock[] = []
    const paragraphLines: string[] = []
    const listItems: string[] = []
    const lines = normalized.split('\n')

    const flushParagraph = () => {
      if (!paragraphLines.length) {
        return
      }

      blocks.push({
        type: 'paragraph',
        tokens: parseInlineTokens(paragraphLines.join(' ')),
      })
      paragraphLines.length = 0
    }

    const flushList = () => {
      if (!listItems.length) {
        return
      }

      blocks.push({
        type: 'list',
        items: listItems.map(item => parseInlineTokens(item)),
      })
      listItems.length = 0
    }

    for (const rawLine of lines) {
      const line = rawLine.trim()

      if (!line) {
        flushParagraph()
        flushList()
        continue
      }

      const markdownHeadingMatch = line.match(/^#{1,3}\s+(.+)$/)
      if (markdownHeadingMatch) {
        flushParagraph()
        flushList()
        blocks.push({
          type: 'heading',
          tokens: parseInlineTokens(markdownHeadingMatch[1].trim()),
        })
        continue
      }

      const listMatch = line.match(/^([-*]|\d+[.)])\s+(.+)$/)
      if (listMatch) {
        flushParagraph()
        listItems.push(listMatch[2].trim())
        continue
      }

      if (isHeadingLike(line)) {
        flushParagraph()
        flushList()
        blocks.push({
          type: 'heading',
          tokens: parseInlineTokens(line),
        })
        continue
      }

      flushList()
      paragraphLines.push(line)
    }

    flushParagraph()
    flushList()

    return blocks
  }

  function isHeadingLike (line: string): boolean {
    return line.length <= 90 && /[?:]$/.test(line)
  }

  function parseInlineTokens (text: string): DetailInlineToken[] {
    const tokens: DetailInlineToken[] = []
    const regex = /\*\*(.+?)\*\*/g
    let cursor = 0

    for (const match of text.matchAll(regex)) {
      const matchedText = match[0]
      const boldText = match[1]
      const start = match.index ?? -1

      if (start < 0) {
        continue
      }

      if (start > cursor) {
        tokens.push({
          text: text.slice(cursor, start),
          bold: false,
        })
      }

      tokens.push({
        text: boldText,
        bold: true,
      })

      cursor = start + matchedText.length
    }

    if (cursor < text.length) {
      tokens.push({
        text: text.slice(cursor),
        bold: false,
      })
    }

    if (!tokens.length) {
      tokens.push({
        text,
        bold: false,
      })
    }

    return tokens
  }

  watch(resolvedEventCode, loadEvent, { immediate: true })

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

  onMounted(() => {
    countdownTicker.value = setInterval(() => {
      nowTimestamp.value = Date.now()
    }, 1000)
  })

  onBeforeUnmount(() => {
    if (countdownTicker.value) {
      clearInterval(countdownTicker.value)
    }
  })
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
    background-repeat: no-repeat;
    transition: opacity 220ms ease;
    pointer-events: none;
  }

  .event-home__wallpaper--default {
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
  }

  .event-home__wallpaper--custom {
    background-size: cover;
    background-position: center center;
    opacity: 0.24;
    filter: saturate(0.9) contrast(1.08);
    mask-image: linear-gradient(
      to bottom,
      rgba(0, 0, 0, 0.88) 0%,
      rgba(0, 0, 0, 0.74) 40%,
      rgba(0, 0, 0, 0.42) 72%,
      rgba(0, 0, 0, 0.2) 100%
    );
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

  .hero__countdown {
    font-weight: 700;
    letter-spacing: 0.01em;
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

  .location-row {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 8px;
  }

  .location-copy {
    margin-top: 4px;
  }

  .location-map {
    overflow: hidden;
    border: 1px solid rgba(21, 31, 54, 0.12);
    border-radius: 12px;
    background: #fff;
    box-shadow: 0 10px 20px rgba(21, 31, 54, 0.08);
  }

  .location-map__iframe {
    display: block;
    width: 100%;
    height: 300px;
    border: 0;
  }

  .location-empty {
    display: grid;
    place-items: center;
    gap: 8px;
    box-sizing: border-box;
    width: 100%;
    max-width: 100%;
    min-width: 0;
    overflow: hidden;
    padding: 18px 14px;
    min-height: 220px;
    border: 1px dashed rgba(21, 31, 54, 0.18);
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.75);
    text-align: center;
  }

  .location-empty__icon {
    color: #5f6f8f;
  }

  .location-empty__title {
    margin: 0;
    color: var(--ink);
    font-family: 'Manrope', sans-serif;
    font-size: 1rem;
    font-weight: 700;
    line-height: 1.35;
    overflow-wrap: anywhere;
  }

  .location-empty__text {
    margin: 0;
    color: var(--ink-soft);
    font-family: 'Manrope', sans-serif;
    font-size: 0.92rem;
    line-height: 1.45;
    max-width: 46ch;
    overflow-wrap: anywhere;
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

  .details__content {
    display: grid;
    gap: 12px;
  }

  .details__heading {
    margin: 2px 0;
    color: var(--ink);
    font-family: 'Manrope', sans-serif;
    font-size: clamp(1.02rem, 2.2vw, 1.18rem);
    font-weight: 700;
    line-height: 1.45;
    letter-spacing: 0.01em;
  }

  .details__list {
    margin: 0;
    padding-left: 1.2rem;
    display: grid;
    gap: 7px;
    color: var(--ink-soft);
  }

  .details__list-item {
    font-family: 'Manrope', sans-serif;
    font-size: 1rem;
    line-height: 1.72;
  }

  .details__text--paragraph {
    margin: 0;
    text-wrap: pretty;
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
    .event-home__wallpaper--default {
      background-size: 420px;
      background-position: right -160px top -78px;
      opacity: 0.15;
    }

    .event-home__wallpaper--custom {
      background-position: center top;
      opacity: 0.2;
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

    .location-map__iframe {
      height: 300px;
    }
  }

  @media (min-width: 960px) {
    .location-map__iframe {
      height: 450px;
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
