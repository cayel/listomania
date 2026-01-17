import { extractArtistFromTitle, extractAlbumTitle, cleanArtistName } from '../discogs'

describe('Discogs Helper Functions', () => {
  describe('extractArtistFromTitle', () => {
    it('should extract artist from "Artist - Album" format', () => {
      expect(extractArtistFromTitle('Pink Floyd - The Dark Side of the Moon')).toBe('Pink Floyd')
    })

    it('should extract artist when title contains multiple dashes', () => {
      expect(extractArtistFromTitle('The Beatles - Abbey Road - Remastered')).toBe('The Beatles')
    })

    it('should return "Unknown Artist" when no dash is present', () => {
      expect(extractArtistFromTitle('Album Title Only')).toBe('Unknown Artist')
    })

    it('should handle empty string', () => {
      expect(extractArtistFromTitle('')).toBe('Unknown Artist')
    })
  })

  describe('extractAlbumTitle', () => {
    it('should extract album title from "Artist - Album" format', () => {
      expect(extractAlbumTitle('Pink Floyd - The Dark Side of the Moon')).toBe('The Dark Side of the Moon')
    })

    it('should preserve multiple dashes in album title', () => {
      expect(extractAlbumTitle('The Beatles - Abbey Road - Remastered')).toBe('Abbey Road - Remastered')
    })

    it('should return full string when no dash is present', () => {
      expect(extractAlbumTitle('Album Title Only')).toBe('Album Title Only')
    })

    it('should handle empty string', () => {
      expect(extractAlbumTitle('')).toBe('')
    })
  })

  describe('cleanArtistName', () => {
    it('should remove number in parentheses at the end', () => {
      expect(cleanArtistName('Mike Davis (2)')).toBe('Mike Davis')
    })

    it('should remove number with whitespace', () => {
      expect(cleanArtistName('John Doe (15)  ')).toBe('John Doe')
    })

    it('should not remove parentheses in the middle', () => {
      expect(cleanArtistName('Artist (The) Name')).toBe('Artist (The) Name')
    })

    it('should not remove non-numeric parentheses', () => {
      expect(cleanArtistName('Artist (US)')).toBe('Artist (US)')
    })

    it('should handle artist without parentheses', () => {
      expect(cleanArtistName('Pink Floyd')).toBe('Pink Floyd')
    })

    it('should trim whitespace', () => {
      expect(cleanArtistName('  Artist Name  ')).toBe('Artist Name')
    })
  })
})
