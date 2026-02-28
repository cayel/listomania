// Vérifier les données en production
import { PrismaClient } from '@prisma/client'

// ⚠️ IMPORTANT: Définir DATABASE_URL dans les variables d'environnement
// Ne JAMAIS hardcoder les credentials de production dans le code
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL_PRODUCTION
    }
  }
})

async function checkProductionData() {
  if (!process.env.DATABASE_URL_PRODUCTION) {
    console.error('❌ Erreur: DATABASE_URL_PRODUCTION non définie')
    console.log('💡 Définir: export DATABASE_URL_PRODUCTION="..."')
    process.exit(1)
  }

  try {
    const users = await prisma.user.count()
    const lists = await prisma.list.count()
    const albums = await prisma.album.count()
    
    console.log('📊 DONNÉES EN PRODUCTION:')
    console.log(`  👤 Utilisateurs: ${users}`)
    console.log(`  📋 Listes: ${lists}`)
    console.log(`  💿 Albums: ${albums}`)
    
    if (lists > 0) {
      console.log('\n✅ VOS DONNÉES SONT TOUJOURS EN PRODUCTION !')
      const allLists = await prisma.list.findMany({
        select: {
          id: true,
          title: true,
          userId: true,
          _count: {
            select: { listAlbums: true }
          }
        },
        take: 10
      })
      console.log('\n📋 Premières listes:')
      allLists.forEach(list => {
        console.log(`  - ${list.title} (${list._count.listAlbums} albums)`)
      })
    }
  } catch (error) {
    console.error('❌ Erreur:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkProductionData()
