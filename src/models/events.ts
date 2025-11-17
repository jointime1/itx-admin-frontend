import type { Member } from './members'

export interface CommunityEvent {
  id: number
  title: string
  description: string
  date: string
  placeType: PlaceType
  place: string
  customPlaceType: string
  eventType: string
  open: boolean
  videoLink: string
  hosts: Member[]
  eventTags: EventTag[]
}

export interface EventTag {
  id: number
  name: string
}

export type PlaceType = 'ONLINE' | 'OFFLINE' | 'HYBRID'
