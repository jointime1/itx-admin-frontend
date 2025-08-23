import { useToast } from '@/components/ui/toast'
import router from '@/router'
import { isAuthenticated, logout, refreshToken } from '@/services/authService'
import ky from 'ky'

// Флаг для отслеживания процесса обновления токена
let isRefreshing = false
// Промис для хранения текущего процесса обновления
let refreshPromise: Promise<string | null> | null = null

const api = ky.create({
  prefixUrl: '/api/admin/',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  hooks: {
    beforeRequest: [
      (request) => {
        const token = localStorage.getItem('token')
        if (token) {
          request.headers.set('Authorization', `Bearer ${token}`)
        }
      },
    ],
    afterResponse: [
      async (request, options, response) => {
        if (response.ok)
          return response

        if (response.status === 401) {
          try {
            if (isAuthenticated.value) {
              try {
                const token = localStorage.getItem('token')
                if (!token)
                  throw new Error('Токен не найден')

                if (isRefreshing && refreshPromise) {
                  await refreshPromise.catch(() => null)
                }
                else {
                  isRefreshing = true
                  refreshPromise = refreshToken(token).finally(() => {
                    isRefreshing = false
                    refreshPromise = null
                  })
                  await refreshPromise
                }

                // Повторяем исходный запрос через тот же ky-клиент, чтобы сработали хуки и заголовки
                return api(request)
              }
              catch (error) {
                console.error('Не удалось обновить токен:', error)
                logout()
                router.push('/login')

                const { toast } = useToast()
                toast({
                  title: 'Сессия истекла',
                  description: 'Пожалуйста, войдите снова',
                  variant: 'destructive',
                })
              }
            }
            else {
              router.push('/login')
            }
          }
          catch (error) {
            console.error('Ошибка при обработке ответа:', error)
          }
        }

        return response
      },
    ],
  },
})

export default api
