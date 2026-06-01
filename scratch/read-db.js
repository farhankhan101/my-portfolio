const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const config = await prisma.siteConfig.findFirst()
  console.log('SiteConfig:', JSON.stringify(config, null, 2))
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e)
    prisma.$disconnect()
  })
