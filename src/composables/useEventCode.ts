import { computed } from 'vue'
import { useRoute } from 'vue-router'

export function useEventCode () {
  const route = useRoute()

  const eventCode = computed(() => String(route.params.event_code || ''))

  return {
    eventCode,
  }
}
