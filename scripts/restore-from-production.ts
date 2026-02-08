// Restaurer les données de production vers local
import { PrismaClient } from '@prisma/client'

const prodPrisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgres://e091f79065acb83ecab43844cca57c9a47bba956122f74c5ac578f6a6b66ee28:sk_NCePNYQif9fBFDl5SX4Rb@db.prisma.io:5432/postgres?sslmode=require"
    }
  }
})

const localPrisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres:Jarvis71$@localhost:5432/ranklist"
    }
  }
})

async function restoreFromProduction() {
  try {
    console.log('🔄 Récupération des données de production...\n')
    
    // 1. Récupérer les utilisateurs
    const users = await prodPrisma.user.findMany()
    console.log(`📥 ${users.length} utilisateurs trouvés`)
    
    // 2. Récupérer les albums
    const albums = await prodPrisma.album.findMany()
    console.log(`📥 ${albums.length} albums trouvés`)
    
    // 3. Récupérer les listes avec leurs albums
    const lists = await prodPrisma.list.findMany({
      include: {
        listAlbums: true
      }
    })
    console.log(`📥 ${lists.length} listes trouvées\n`)
    
    console.log('💾 Restauration en local...\n')
    
    // 4. Créer les utilisateurs en local
    for (const user of users) {
      const { createdAt, updatedAt, ...userData } = user
      await localPrisma.user.upsert({
        where: { id: user.id },
        update: userData,
        create: { ...userData, id: user.id, createdAt, updatedAt }
      })
    }
    console.log(`✅ ${users.length} utilisateurs restaurés`)
    
    // 5. Créer les albums en local
    for (const album of albums) {
      const { createdAt, ...albumData } = album
      await localPrisma.album.upsert({
        where: { id: album.id },
        update: albumData,
        create: { ...albumData, id: album.id, createdAt }
      })
    }
    console.log(`✅ ${albums.length} albums restaurés`)
    
    // 6. Créer les listes et leurs relations
    for (const list of lists) {
      const { listAlbums, createdAt, updatedAt, ...listData } = list
      
      // Créer la liste
      await localPrisma.list.upsert({
        where: { id: list.id },
        update: listData,
        create: { ...listData, id: list.id, createdAt, updatedAt }
      })
      
      // Créer les relations liste-album
      for (const listAlbum of listAlbums) {
        const { createdAt: laCreatedAt, ...listAlbumData } = listAlbum
        await localPrisma.listAlbum.upsert({
          where: { id: listAlbum.id },
          update: listAlbumData,
          create: { ...listAlbumData, id: listAlbum.id, createdAt: laCreatedAt }
        })
      }
    }
    console.log(`✅ ${lists.length} listes restaurées avec leurs albums`)
    
    console.log('\n🎉 RESTAURATION TERMINÉE !')
    console.log('\n📊 Vérification:')
    const localUsers = await localPrisma.user.count()
    const localLists = await localPrisma.list.count()
    const localAlbums = await localPrisma.album.count()
    console.log(`  👤 Utilisateurs: ${localUsers}`)
    console.log(`  📋 Listes: ${localLists}`)
    console.log(`  💿 Albums: ${localAlbums}`)
    
  } catch (error) {
    console.error('❌ Erreur:', error)
  } finally {
    await prodPrisma.$disconnect()
    await localPrisma.$disconnect()
  }
}

restoreFromProduction()
