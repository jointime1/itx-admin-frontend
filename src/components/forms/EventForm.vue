<script lang="ts" setup>
import type { CommunityEvent } from '@/models/events'
import { onMounted, ref } from 'vue'
import EventHosts from '@/components/forms/event/EventHosts.vue'
import EventTags from '@/components/forms/event/EventTags.vue'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { toast } from '@/components/ui/toast'
import { useDictionary } from '@/composables/useDictionary'
import { requiredRule, useFormValidation } from '@/composables/useFormValidation'
import { toDatetimeLocal } from '@/lib/utils'
import { eventsService } from '@/services/eventsService'

const props = defineProps<{
  eventId?: number
}>()

const emit = defineEmits(['saved', 'cancel'])
const isLoading = ref(false)

const validationRules = {
  title: [requiredRule],
  description: [],
  date: [requiredRule],
  placeType: [requiredRule],
  eventType: [requiredRule],
  place: [requiredRule],
  open: [requiredRule],
  hosts: [requiredRule],
  customPlaceType: [],
  videoLink: [],
  id: [],
  eventTags: [],
}

// Используем composable для валидации формы
const { values, errors, touched, validate, isValid } = useFormValidation<CommunityEvent>({
  date: toDatetimeLocal(new Date().toISOString()),
  description: '',
  title: '',
  placeType: 'ONLINE',
  eventType: 'Созвон',
  place: '',
  open: false,
  hosts: [],
  id: 0,
  customPlaceType: '',
  videoLink: '',
  eventTags: [],
}, validationRules)

// Загрузка данных участника при редактировании
onMounted(async () => {
  if (props.eventId) {
    const event = await eventsService.getById(props.eventId)
    if (event) {
      values.value = {
        ...event,
        date: toDatetimeLocal(event.date),
      }
    }
  }
})

// Обработчик отправки формы
async function handleSubmit(e: Event) {
  e.preventDefault()

  if (!validate()) {
    return
  }

  try {
    if (props.eventId) {
      await eventsService.update(props.eventId, {
        ...values.value,
        date: new Date(values.value.date).toISOString(),
      })
    }
    else {
      await eventsService.create({
        ...values.value,
        date: new Date(values.value.date).toISOString(),
      })
    }

    emit('saved')
  }
  catch (err) {
    console.error(err)
    toast({
      variant: 'destructive',
      title: 'Не удалось сохранить событие.',
    })
  }
}

function handleCancel() {
  emit('cancel')
}

const { placeTypes } = useDictionary(['placeTypes'])
</script>

<template>
  <form class="space-y-6" @submit="handleSubmit">
    <div class="space-y-4">
      <div class="space-y-2">
        <Label for="title">Название встречи</Label>
        <Input id="title" v-model="values.title" type="text" placeholder="Название встречи" />
        <p v-if="touched.title && errors.title" class="text-sm text-destructive">
          {{ errors.title }}
        </p>
      </div>
      <div class="space-y-2">
        <Label for="description">Описание встречи</Label>
        <Textarea id="description" v-model="values.description" placeholder="Описание встречи" />
      </div>
      <div class="space-y-2">
        <Label for="even">Теги встречи</Label>
        <EventTags v-model:event-tags="values.eventTags" />
      </div>
      <div class="space-y-2">
        <Label for="date">Дата встречи</Label>
        <Input id="date" v-model="values.date" type="datetime-local" placeholder="Введите дату встречи" />
        <p v-if="touched.date && errors.date" class="text-sm text-destructive">
          {{ errors.date }}
        </p>
      </div>
      <div class="space-y-2">
        <Label for="placeType">Тип проведения встречи</Label>
        <Select id="placeType" v-model="values.placeType">
          <SelectTrigger>
            <SelectValue placeholder="Тип проведения встречи" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem v-for="option in placeTypes" :key="option.value" :value="option.value">
              {{ option.label }}
            </SelectItem>
          </SelectContent>
        </Select>
        <p v-if="touched.placeType && errors.placeType" class="text-sm text-destructive">
          {{ errors.placeType }}
        </p>
      </div>
      <div v-if="values.placeType !== 'ONLINE'" class="space-y-2">
        <Label for="customPlaceType">Тип проведения встречи (дополнительно)</Label>
        <Input id="customPlaceType" v-model="values.customPlaceType" type="text" placeholder="Укажите город" />
      </div>
      <div class="space-y-2">
        <Label for="place">Место проведения встречи</Label>
        <Textarea id="place" v-model="values.place" placeholder="Ссылка/адрес" />
        <p v-if="touched.place && errors.place" class="text-sm text-destructive">
          {{ errors.place }}
        </p>
      </div>
      <div class="space-y-2">
        <Label for="eventType">Тип встречи</Label>
        <Input
          id="eventType" v-model="values.eventType" type="text"
          placeholder="Тип встречи: созвон/митап/воркшоп и тд"
        />
        <p v-if="touched.eventType && errors.eventType" class="text-sm text-destructive">
          {{ errors.eventType }}
        </p>
      </div>
      <div class="flex items-center space-x-2">
        <Label for="open">Открытая встреча (не только для участников сообщества)</Label>
        <Checkbox id="open" v-model="values.open" />
      </div>
      <div class="space-y-2">
        <Label for="videoLink">Ссылка на запись</Label>
        <Input
          id="videoLink" v-model="values.videoLink" type="text"
          placeholder="Ссылка на ютуб/облако"
        />
      </div>
      <div class="space-y-2">
        <Label for="hosts">Спикеры встречи</Label>
        <EventHosts v-model:hosts="values.hosts" />
      </div>
    </div>

    <div class="flex justify-end space-x-2">
      <Button type="button" variant="outline" @click="handleCancel">
        Отмена
      </Button>
      <Button type="submit" :disabled="isLoading || !isValid">
        {{ isLoading ? 'Сохранение...' : props.eventId ? 'Сохранить' : 'Добавить' }}
      </Button>
    </div>
  </form>
</template>
