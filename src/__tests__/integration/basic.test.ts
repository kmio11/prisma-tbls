import { describe, test, expect } from 'vitest'
import { convertPrismaToTbls } from '../../index.js'

describe('Basic Prisma to tbls conversion', () => {
  test('should convert a simple Prisma schema', async () => {
    const prismaSchema = `
model User {
  id    Int     @id @default(autoincrement())
  email String  @unique
  name  String?
  posts Post[]
}

model Post {
  id       Int    @id @default(autoincrement())
  title    String
  content  String?
  authorId Int
  author   User   @relation(fields: [authorId], references: [id])
}

enum Status {
  DRAFT
  PUBLISHED
}
`

    const result = await convertPrismaToTbls(prismaSchema)
    
    expect(result).toBeDefined()
    expect(result.tables).toHaveLength(2)
    expect(result.enums).toHaveLength(1)
    expect(result.relations).toBeDefined()
    
    // Check User table
    const userTable = result.tables.find(t => t.name === 'user')
    expect(userTable).toBeDefined()
    expect(userTable?.columns).toHaveLength(3) // id, email, name
    
    // Check Post table
    const postTable = result.tables.find(t => t.name === 'post')
    expect(postTable).toBeDefined()
    expect(postTable?.columns).toHaveLength(4) // id, title, content, authorId
    
    // Check Status enum
    const statusEnum = result.enums?.find(e => e.name === 'status')
    expect(statusEnum).toBeDefined()
    expect(statusEnum?.values).toEqual(['DRAFT', 'PUBLISHED'])
  })
  
  test('should handle empty schema', async () => {
    const result = await convertPrismaToTbls('')
    
    expect(result).toBeDefined()
    expect(result.tables).toHaveLength(0)
    expect(result.enums).toHaveLength(0)
    expect(result.relations).toHaveLength(0)
  })
})