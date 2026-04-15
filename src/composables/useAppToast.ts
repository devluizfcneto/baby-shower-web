import { computed, reactive } from 'vue'
import { useDisplay } from 'vuetify'

export type AppToastColor = 'success' | 'error' | 'info' | 'warning'

export function useAppToast () {
  const { smAndDown } = useDisplay()

  const toast = reactive({
    visible: false,
    message: '',
    color: 'success' as AppToastColor,
  })

  const toastLocation = computed(() => (smAndDown.value ? 'top' : 'bottom end'))

  function showToast (message: string, color: AppToastColor = 'success') {
    toast.visible = false
    toast.message = message
    toast.color = color

    setTimeout(() => {
      toast.visible = true
    }, 0)
  }

  return {
    toast,
    toastLocation,
    showToast,
  }
}
