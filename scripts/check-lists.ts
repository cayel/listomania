// Script pour vérifier les listes dans la base de données
import { prisma } from '../lib/prisma'

async function checkLists() {
  try {
    const lists = await prisma.list.findMany({
      include: {
        _count: {
          select: {
            listAlbums: true
          }
        }
      }
    })
    
    console.log(`📊 Nombre total de listes : ${lists.length}`)
    
    if (lists.length > 0) {
      console.log('\n✅ Les listes existent toujours dans la base :')
      lists.forEach((list, index) => {
        console.log(`  ${index + 1}. ${list.title} (${list._count.listAlbums} albums) - User: ${list.userId}`)
      })
    } else {
      console.log('\n⚠️  Aucune liste trouvée dans la base de données')
    }
    
    // Vérifier aussi les utilisateurs
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true
      }
    })
    
    console.log(`\n👤 Nombre d'utilisateurs : ${users.length}`)
    users.forEach((user, index) => {
      console.log(`  ${index + 1}. ${user.name} (${user.email})`)
    })
    
  } catch (error) {
    console.error('❌ Erreur:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkLists()
