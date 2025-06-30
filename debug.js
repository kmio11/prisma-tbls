import { readFile } from 'node:fs/promises'
import { convertPrismaToTbls } from './dist/index.js'

const content = await readFile('sample.prisma', 'utf-8')
console.log('Schema content length:', content.length)

try {
  const result = await convertPrismaToTbls(content)
  console.log('Result:', JSON.stringify(result, null, 2))
} catch (error) {
  console.error('Error:', error.message)
  console.error('Stack:', error.stack)
}