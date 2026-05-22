import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    console.log('Connecting to database...')
    const users = await prisma.user.findMany()
    console.log('Connected! Total users:', users.length)
    const projects = await prisma.project.findMany()
    console.log('Total projects:', projects.length)
  } catch (err) {
    console.error('Database connection failed:', err)
  } finally {
    await prisma.$disconnect()
  }
}

main()
