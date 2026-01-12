// Types partagés dans l'application

export interface Album {
  id: string
  discogsId: string
  discogsArtistId?: string
  title: string
  artist: string
  year?: number
  coverImage?: string
}

export interface ListAlbum {
  id: string
  position: number
  album: Album
}

export interface List {
  id: string
  title: string
  description?: string
  period?: string
  sourceUrl?: string
  shareToken?: string
  isPublic: boolean
  userId: string
  listAlbums: ListAlbum[]
  user?: {
    id: string
    name: string
    email?: string
  }
  createdAt?: Date
  updatedAt?: Date
}

export interface DiscogsAlbum {
  id: string
  title: string
  artist: string
  artistId?: string
  year?: number
  coverImage?: string
}

export interface User {
  id: string
  name: string
  email: string
  image?: string
}

export type NotificationType = 'success' | 'error' | 'info'

export interface Notification {
  type: NotificationType
  message: string
}
