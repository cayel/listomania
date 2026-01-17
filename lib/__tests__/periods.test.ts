import { parsePeriod, formatPeriod } from '../periods'

describe('Periods Utilities', () => {
  describe('parsePeriod', () => {
    it('should parse single year', () => {
      const result = parsePeriod('2020')
      expect(result).toEqual({
        type: 'single-year',
        startYear: 2020
      })
    })

    it('should parse year range', () => {
      const result = parsePeriod('2015-2020')
      expect(result).toEqual({
        type: 'year-range',
        startYear: 2015,
        endYear: 2020
      })
    })

    it('should parse all-time period', () => {
      const result = parsePeriod('Tous les temps')
      expect(result).toEqual({
        type: 'all-time'
      })
    })

    it('should return null for non-standard format', () => {
      const result = parsePeriod('Custom Period')
      expect(result).toBeNull()
    })

    it('should return null for empty string', () => {
      const result = parsePeriod('')
      expect(result).toBeNull()
    })
  })

  describe('formatPeriod', () => {
    it('should format single year', () => {
      expect(formatPeriod({ type: 'single-year', startYear: 2020 })).toBe('2020')
    })

    it('should format year range', () => {
      expect(formatPeriod({ type: 'year-range', startYear: 2015, endYear: 2020 })).toBe('2015-2020')
    })

    it('should format all-time', () => {
      expect(formatPeriod({ type: 'all-time' })).toBe('Tous les temps')
    })

    it('should handle missing years in single-year', () => {
      expect(formatPeriod({ type: 'single-year' })).toBe('')
    })
  })
})
