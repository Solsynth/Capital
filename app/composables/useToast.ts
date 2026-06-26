export function useToast() {
  const toast = inject<{ addToast: (opts: { title?: string; message: string; type?: 'success' | 'error' | 'info' }) => void }>('toast')

  return {
    success(message: string, title?: string) {
      toast?.addToast({ message, title, type: 'success' })
    },
    error(message: string, title?: string) {
      toast?.addToast({ message, title, type: 'error' })
    },
    info(message: string, title?: string) {
      toast?.addToast({ message, title, type: 'info' })
    },
  }
}
