'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, X } from 'lucide-react'

interface Album {
  id: string
  discogsId: string
  title: string
  artist: string
  year?: number
  coverImage?: string
}

interface SortableAlbumItemProps {
  listAlbumId: string
  album: Album
  position: number
  onRemove: (listAlbumId: string, albumTitle?: string, artist?: string) => void
}

export function SortableAlbumItem({ listAlbumId, album, position, onRemove }: SortableAlbumItemProps) {
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
      className="flex items-center space-x-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
    >
      <button
        className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-6 w-6" />
      </button>

      <div className="flex-shrink-0 text-2xl font-bold text-gray-400 dark:text-gray-500 w-8 text-center">
        {position + 1}
      </div>

      <div className="flex-shrink-0 w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden">
        {album.coverImage ? (
          <img
            src={album.coverImage}
            alt={album.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 text-xs p-1 text-center">
            <span className="text-2xl">🎵</span>
            {album.discogsId.startsWith('unknown-') && (
              <span className="text-[10px] text-red-500 dark:text-red-400 font-medium">
                ID non trouvé
              </span>
            )}
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
          {album.artist}
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
          {album.title}
        </p>
        {album.year && (
          <p className="text-xs text-gray-500 dark:text-gray-500">
            {album.year}
          </p>
        )}
      </div>

      <button
        onClick={() => onRemove(listAlbumId, album.title, album.artist)}
        className="flex-shrink-0 p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
        title="Retirer de la liste"
      >
        <X className="h-5 w-5" />
      </button>
    </div>
  )
}
