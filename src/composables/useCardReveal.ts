import type { Ref } from 'vue'
import { onMounted, onUnmounted, ref } from 'vue'

export function useCardReveal(containerRef: Ref<HTMLElement | null>) {
  const observer = ref<IntersectionObserver | null>(null)

  onMounted(() => {
    observer.value = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-card-reveal')
            observer.value?.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.1 },
    )

    if (containerRef.value) {
      const cards = containerRef.value.querySelectorAll('[data-reveal]')
      cards.forEach(card => observer.value?.observe(card))
    }
  })

  onUnmounted(() => {
    observer.value?.disconnect()
  })
}
