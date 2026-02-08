// Vérifier les données en production
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgres://e091f79065acb83ecab43844cca57c9a47bba956122f74c5ac578f6a6b66ee28:sk_NCePNYQif9fBFDl5SX4Rb@db.prisma.io:5432/postgres?sslmode=require"
    }
  }
})

async function checkProductionData() {
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
