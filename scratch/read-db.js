const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const projects = await prisma.project.findMany({
    select: {
      id: true,
      title: true,
      slug: true,
      category: true,
      duration: true,
      liveUrl: true,
      images: true
    }
  })
  console.log('Projects in DB:', JSON.stringify(projects, null, 2))
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e)
    prisma.$disconnect()
  })
