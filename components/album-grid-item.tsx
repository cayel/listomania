'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, X } from 'lucide-react'
import Image from 'next/image'

interface Album {
  id: string
  discogsId: string
  title: string
  artist: string
  year?: number
  coverImage?: string
}

interface AlbumGridItemProps {
  listAlbumId: string
  album: Album
  position: number
  onRemove: (listAlbumId: string, albumTitle?: string, artist?: string) => void
  showArtist: boolean
  showTitle: boolean
  showYear: boolean
  showRank: boolean
  isOwner: boolean
}

export function AlbumGridItem({
  listAlbumId,
  album,
  position,
  onRemove,
  showArtist,
  showTitle,
  showYear,
  showRank,
  isOwner
}: AlbumGridItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: listAlbumId })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group relative bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow"
    >
      {/* Rank Badge - discret en haut à gauche */}
      {showRank && (
        <div className="absolute top-2 left-2 z-10 bg-black/60 text-white text-xs font-medium px-2 py-0.5 rounded backdrop-blur-sm">
          #{position + 1}
        </div>
      )}
      
      {isOwner && (
        <>
          <button
            {...attributes}
            {...listeners}
            className="absolute top-2 right-12 z-10 p-1 bg-white/90 dark:bg-gray-800/90 rounded opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
            aria-label="Déplacer"
          >
            <GripVertical className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          </button>
          <button
            onClick={() => onRemove(listAlbumId, album.title, album.artist)}
            className="absolute top-2 right-2 z-10 p-1 bg-red-500/90 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
            aria-label="Retirer"
          >
            <X className="h-4 w-4" />
          </button>
        </>
      )}
      
      {/* Position Badge - removed, now using showRank above */}

      {/* Album Cover */}
      <div className="aspect-square relative bg-gray-200 dark:bg-gray-700">
        {album.coverImage ? (
          <Image
            src={album.coverImage}
            alt={`${album.artist} - ${album.title}`}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 p-4 text-center">
            <span className="text-4xl mb-2">🎵</span>
            {album.discogsId.startsWith('unknown-') && (
              <span className="text-xs text-red-500 dark:text-red-400 font-medium">
                ID Discogs non trouvé
              </span>
            )}
          </div>
        )}
      </div>

      {/* Album Info */}
      {(showArtist || showTitle || showYear) && (
        <div className="p-3 space-y-1">
          {showArtist && (
            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
              {album.artist}
            </p>
          )}
          {showTitle && (
            <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
              {album.title}
            </p>
          )}
          {showYear && album.year && (
            <p className="text-xs text-gray-500 dark:text-gray-500">
              {album.year}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
