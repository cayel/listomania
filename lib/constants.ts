// Constantes de l'application

export const APP_NAME = 'Ranklist'
export const APP_DESCRIPTION = 'Créez et partagez vos classements d\'albums musicaux'

export const ROUTES = {
  HOME: '/',
  LISTS: '/lists',
  EXPLORE: '/explore',
  PROFILE: '/profile',
  SIGNIN: '/auth/signin',
  SIGNUP: '/auth/signup',
} as const

export const API_ROUTES = {
  AUTH: '/api/auth',
  LISTS: '/api/lists',
  SEARCH: '/api/search',
  PUBLIC_LISTS: '/api/public/lists',
} as const

export const LIMITS = {
  MAX_ALBUMS_PER_LIST: 100,
  MAX_LIST_TITLE_LENGTH: 200,
  MAX_LIST_DESCRIPTION_LENGTH: 1000,
  SEARCH_DEBOUNCE_MS: 300,
} as const

export const MESSAGES = {
  SUCCESS: {
    LIST_CREATED: 'Liste créée avec succès',
    LIST_UPDATED: 'Liste mise à jour',
    LIST_DELETED: 'Liste supprimée',
    ALBUM_ADDED: 'Album ajouté à la liste',
    ALBUM_REMOVED: 'Album retiré de la liste',
    LINK_COPIED: 'Lien copié dans le presse-papiers',
    IMPORT_SUCCESS: 'Liste importée avec succès',
    EXPORT_SUCCESS: 'Liste exportée avec succès',
  },
  ERROR: {
    GENERIC: 'Une erreur est survenue',
    UNAUTHORIZED: 'Vous devez être connecté',
    NOT_FOUND: 'Ressource non trouvée',
    VALIDATION: 'Données invalides',
    IMPORT_FAILED: 'Erreur lors de l\'import',
    EXPORT_FAILED: 'Erreur lors de l\'export',
  },
} as const
