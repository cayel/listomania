'use client'

import { useState, useEffect } from 'react'
import { PeriodType, formatPeriod, parsePeriod, getCurrentYear, getYearRange } from '@/lib/periods'

interface PeriodSelectorProps {
  value: string
  onChange: (period: string) => void
}

export function PeriodSelector({ value, onChange }: PeriodSelectorProps) {
  const currentYear = getCurrentYear()
  const years = getYearRange(1950, currentYear)
  
  const parsedPeriod = parsePeriod(value)
  const [periodType, setPeriodType] = useState<PeriodType>(parsedPeriod?.type || 'single-year')
  const [startYear, setStartYear] = useState<number>(parsedPeriod?.startYear || currentYear)
  const [endYear, setEndYear] = useState<number>(parsedPeriod?.endYear || currentYear)

  useEffect(() => {
    let newPeriod = ''
    
    switch (periodType) {
      case 'all-time':
        newPeriod = formatPeriod({ type: 'all-time' })
        break
      case 'single-year':
        newPeriod = formatPeriod({ type: 'single-year', startYear })
        break
      case 'year-range':
        newPeriod = formatPeriod({ type: 'year-range', startYear, endYear })
        break
    }
    
    onChange(newPeriod)
  }, [periodType, startYear, endYear])

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Type de période
        </label>
        <div className="flex gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setPeriodType('all-time')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              periodType === 'all-time'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Tous les temps
          </button>
          <button
            type="button"
            onClick={() => setPeriodType('single-year')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              periodType === 'single-year'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Une année
          </button>
          <button
            type="button"
            onClick={() => setPeriodType('year-range')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              periodType === 'year-range'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Période
          </button>
        </div>
      </div>

      {periodType === 'single-year' && (
        <div>
          <label htmlFor="year" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Année
          </label>
          <select
            id="year"
            value={startYear}
            onChange={(e) => setStartYear(parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          >
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      )}

      {periodType === 'year-range' && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="startYear" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Année de début
            </label>
            <select
              id="startYear"
              value={startYear}
              onChange={(e) => {
                const newStart = parseInt(e.target.value)
                setStartYear(newStart)
                if (newStart > endYear) {
                  setEndYear(newStart)
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="endYear" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Année de fin
            </label>
            <select
              id="endYear"
              value={endYear}
              onChange={(e) => {
                const newEnd = parseInt(e.target.value)
                setEndYear(newEnd)
                if (newEnd < startYear) {
                  setStartYear(newEnd)
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {periodType === 'all-time' && (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Cette liste inclura les albums de toutes les époques.
        </p>
      )}

      <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          <span className="font-medium">Période sélectionnée :</span>{' '}
          <span className="text-blue-600 dark:text-blue-400">
            {formatPeriod({ type: periodType, startYear, endYear })}
          </span>
        </p>
      </div>
    </div>
  )
}
