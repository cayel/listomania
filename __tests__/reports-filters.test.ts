import { describe, it, expect } from '@jest/globals'

describe('Filtres et Tri - Rapports', () => {
  const mockLists = [
    {
      id: '1',
      title: 'Rock des années 80',
      period: '1980-1989',
      isPublic: true,
      categories: [{ category: { name: 'Rock' } }],
      _count: { listAlbums: 50 },
      updatedAt: '2026-01-15T00:00:00Z'
    },
    {
      id: '2',
      title: 'Jazz moderne',
      period: '2020-2024',
      isPublic: false,
      categories: [{ category: { name: 'Jazz' } }],
      _count: { listAlbums: 30 },
      updatedAt: '2026-02-20T00:00:00Z'
    },
    {
      id: '3',
      title: 'Hip-Hop classique',
      period: '1990-1999',
      isPublic: true,
      categories: [{ category: { name: 'Hip-Hop' } }],
      _count: { listAlbums: 40 },
      updatedAt: '2026-02-10T00:00:00Z'
    },
    {
      id: '4',
      title: 'Rock alternatif',
      period: '2000-2009',
      isPublic: true,
      categories: [{ category: { name: 'Rock' } }],
      _count: { listAlbums: 25 },
      updatedAt: '2026-01-25T00:00:00Z'
    }
  ]

  describe('Filtrage par visibilité', () => {
    it('devrait filtrer uniquement les listes publiques', () => {
      const result = mockLists.filter(l => l.isPublic)
      expect(result).toHaveLength(3)
      expect(result.every(l => l.isPublic)).toBe(true)
    })

    it('devrait filtrer uniquement les listes privées', () => {
      const result = mockLists.filter(l => !l.isPublic)
      expect(result).toHaveLength(1)
      expect(result[0].title).toBe('Jazz moderne')
    })
  })

  describe('Filtrage par catégorie', () => {
    it('devrait filtrer les listes de Rock', () => {
      const result = mockLists.filter(l => 
        l.categories.some((lc: any) => lc.category.name === 'Rock')
      )
      expect(result).toHaveLength(2)
      expect(result.map(l => l.title)).toEqual(['Rock des années 80', 'Rock alternatif'])
    })

    it('devrait filtrer les listes de Jazz', () => {
      const result = mockLists.filter(l => 
        l.categories.some((lc: any) => lc.category.name === 'Jazz')
      )
      expect(result).toHaveLength(1)
      expect(result[0].title).toBe('Jazz moderne')
    })
  })

  describe('Filtrage par période', () => {
    it('devrait filtrer les listes des années 90', () => {
      const result = mockLists.filter(l => l.period === '1990-1999')
      expect(result).toHaveLength(1)
      expect(result[0].title).toBe('Hip-Hop classique')
    })

    it('devrait filtrer les listes des années 80', () => {
      const result = mockLists.filter(l => l.period === '1980-1989')
      expect(result).toHaveLength(1)
      expect(result[0].title).toBe('Rock des années 80')
    })
  })

  describe('Tri par titre', () => {
    it('devrait trier par titre en ordre croissant', () => {
      const result = [...mockLists].sort((a, b) => 
        a.title.localeCompare(b.title)
      )
      expect(result[0].title).toBe('Hip-Hop classique')
      expect(result[1].title).toBe('Jazz moderne')
      expect(result[2].title).toBe('Rock alternatif')
      expect(result[3].title).toBe('Rock des années 80')
    })

    it('devrait trier par titre en ordre décroissant', () => {
      const result = [...mockLists].sort((a, b) => 
        b.title.localeCompare(a.title)
      )
      expect(result[0].title).toBe('Rock des années 80')
      expect(result[3].title).toBe('Hip-Hop classique')
    })
  })

  describe('Tri par date de modification', () => {
    it('devrait trier par date en ordre décroissant (plus récent en premier)', () => {
      const result = [...mockLists].sort((a, b) => 
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      )
      expect(result[0].title).toBe('Jazz moderne') // 20 fév
      expect(result[1].title).toBe('Hip-Hop classique') // 10 fév
      expect(result[2].title).toBe('Rock alternatif') // 25 jan
      expect(result[3].title).toBe('Rock des années 80') // 15 jan
    })
  })

  describe('Tri par nombre d\'albums', () => {
    it('devrait trier par nombre d\'albums en ordre croissant', () => {
      const result = [...mockLists].sort((a, b) => 
        a._count.listAlbums - b._count.listAlbums
      )
      expect(result[0]._count.listAlbums).toBe(25)
      expect(result[1]._count.listAlbums).toBe(30)
      expect(result[2]._count.listAlbums).toBe(40)
      expect(result[3]._count.listAlbums).toBe(50)
    })

    it('devrait trier par nombre d\'albums en ordre décroissant', () => {
      const result = [...mockLists].sort((a, b) => 
        b._count.listAlbums - a._count.listAlbums
      )
      expect(result[0]._count.listAlbums).toBe(50)
      expect(result[3]._count.listAlbums).toBe(25)
    })
  })

  describe('Tri par période', () => {
    it('devrait trier par période en ordre croissant', () => {
      const result = [...mockLists].sort((a, b) => 
        (a.period || '').localeCompare(b.period || '')
      )
      expect(result[0].period).toBe('1980-1989')
      expect(result[1].period).toBe('1990-1999')
      expect(result[2].period).toBe('2000-2009')
      expect(result[3].period).toBe('2020-2024')
    })
  })

  describe('Combinaison de filtres', () => {
    it('devrait filtrer les listes publiques de Rock', () => {
      const result = mockLists.filter(l => 
        l.isPublic && l.categories.some((lc: any) => lc.category.name === 'Rock')
      )
      expect(result).toHaveLength(2)
      expect(result.every(l => l.isPublic)).toBe(true)
      expect(result.every(l => l.categories.some((lc: any) => lc.category.name === 'Rock'))).toBe(true)
    })

    it('devrait filtrer les listes privées de Jazz des années 2020', () => {
      const result = mockLists.filter(l => 
        !l.isPublic && 
        l.categories.some((lc: any) => lc.category.name === 'Jazz') &&
        l.period === '2020-2024'
      )
      expect(result).toHaveLength(1)
      expect(result[0].title).toBe('Jazz moderne')
    })
  })

  describe('Extraction de catégories uniques', () => {
    it('devrait extraire toutes les catégories uniques', () => {
      const categories = new Set<string>()
      mockLists.forEach(list => {
        list.categories.forEach((lc: any) => categories.add(lc.category.name))
      })
      const categoriesArray = Array.from(categories).sort()
      
      expect(categoriesArray).toEqual(['Hip-Hop', 'Jazz', 'Rock'])
      expect(categoriesArray).toHaveLength(3)
    })
  })

  describe('Extraction de périodes uniques', () => {
    it('devrait extraire toutes les périodes uniques', () => {
      const periods = new Set<string>()
      mockLists.forEach(list => {
        if (list.period) periods.add(list.period)
      })
      const periodsArray = Array.from(periods).sort()
      
      expect(periodsArray).toEqual(['1980-1989', '1990-1999', '2000-2009', '2020-2024'])
      expect(periodsArray).toHaveLength(4)
    })
  })

  describe('Comptage avec filtres actifs', () => {
    it('devrait compter correctement le nombre de filtres actifs', () => {
      const filterVisibility = 'public'
      const filterCategory = 'Rock'
      const filterPeriod = 'all'
      
      const activeFilters = [
        filterVisibility !== 'all',
        filterCategory !== 'all',
        filterPeriod !== 'all'
      ].filter(Boolean).length
      
      expect(activeFilters).toBe(2)
    })

    it('devrait retourner 0 quand aucun filtre n\'est actif', () => {
      const filterVisibility = 'all'
      const filterCategory = 'all'
      const filterPeriod = 'all'
      
      const activeFilters = [
        filterVisibility !== 'all',
        filterCategory !== 'all',
        filterPeriod !== 'all'
      ].filter(Boolean).length
      
      expect(activeFilters).toBe(0)
    })
  })
})
