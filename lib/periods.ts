// Types de périodes pour les listes d'albums
export type PeriodType = 'all-time' | 'single-year' | 'year-range'

export interface PeriodConfig {
  type: PeriodType
  startYear?: number
  endYear?: number
}

export function formatPeriod(config: PeriodConfig): string {
  switch (config.type) {
    case 'all-time':
      return 'Tous les temps'
    case 'single-year':
      return config.startYear?.toString() || ''
    case 'year-range':
      return `${config.startYear}-${config.endYear}`
    default:
      return ''
  }
}

export function parsePeriod(periodString: string): PeriodConfig | null {
  if (!periodString) return null
  
  if (periodString === 'Tous les temps') {
    return { type: 'all-time' }
  }
  
  if (periodString.includes('-')) {
    const [start, end] = periodString.split('-').map(y => parseInt(y.trim()))
    if (!isNaN(start) && !isNaN(end)) {
      return { type: 'year-range', startYear: start, endYear: end }
    }
  }
  
  const year = parseInt(periodString)
  if (!isNaN(year)) {
    return { type: 'single-year', startYear: year }
  }
  
  return null
}

export function getCurrentYear(): number {
  return new Date().getFullYear()
}

export function getYearRange(startYear: number = 1950, endYear?: number): number[] {
  const end = endYear || getCurrentYear()
  const years: number[] = []
  for (let year = end; year >= startYear; year--) {
    years.push(year)
  }
  return years
}
