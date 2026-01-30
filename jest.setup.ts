import '@testing-library/jest-dom'

// Mock environment variables
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test'
process.env.NEXTAUTH_SECRET = 'test-secret'
process.env.NEXTAUTH_URL = 'http://localhost:3000'
process.env.DISCOGS_TOKEN = 'test-discogs-token'

// Polyfill Request et Response pour les tests d'API Next.js
if (typeof Request === 'undefined') {
  global.Request = class Request {
    constructor(public url: string, public init?: any) {}
  } as any
}

if (typeof Response === 'undefined') {
  global.Response = class Response {
    constructor(public body: any, public init?: any) {}
  } as any
}
