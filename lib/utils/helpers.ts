// Fonctions utilitaires pour la gestion des notifications

export function showNotification(
  message: string,
  type: 'success' | 'error' | 'info' = 'info',
  duration = 3000
): { message: string; type: 'success' | 'error' | 'info' } {
  return { message, type }
}

export function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text)
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(d)
}

export function pluralize(count: number, singular: string, plural?: string): string {
  if (count <= 1) return singular
  return plural || `${singular}s`
}
