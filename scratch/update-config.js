const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('Updating SiteConfig social links...')
  try {
    const result = await prisma.siteConfig.update({
      where: { id: 'singleton' },
      data: {
        socialLinks: {
          github: 'https://github.com/farhankhan101',
          linkedin: 'https://www.linkedin.com/mynetwork/grow/',
          whatsapp: 'https://wa.me/923079971295',
        }
      }
    })
    console.log('✅ Updated config:', result)
  } catch (error) {
    console.error('❌ Failed to update config:', error)
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
  })
