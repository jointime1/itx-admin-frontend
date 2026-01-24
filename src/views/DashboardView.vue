<script setup lang="ts">
import { ref, watchEffect } from 'vue'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { usePermissions } from '@/composables/usePermissions'
import { memberService } from '@/services/memberService'
import { mentorService } from '@/services/mentorService'

const mentorsCount = ref(0)
const membersCount = ref(0)

const { hasPermission, isLoading } = usePermissions()

watchEffect(async () => {
  if (!isLoading.value && hasPermission.value('can_view_admin_mentors')) {
    mentorsCount.value = (await mentorService.getAll()).total
  }

  if (!isLoading.value) {
    membersCount.value = (await memberService.getAll()).total
  }
})
</script>

<template>
  <AdminLayout>
    <div class="space-y-6">
      <h1 class="text-3xl font-bold">
        Дашборд
      </h1>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card v-permission="'can_view_admin_mentors'">
          <CardHeader>
            <CardTitle>Менторы</CardTitle>
            <CardDescription>Общее количество менторов в системе</CardDescription>
          </CardHeader>
          <CardContent>
            <p class="text-4xl font-bold">
              {{ mentorsCount }}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Участники</CardTitle>
            <CardDescription>Общее количество участников сообщества</CardDescription>
          </CardHeader>
          <CardContent>
            <p class="text-4xl font-bold">
              {{ membersCount }}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  </AdminLayout>
</template>
