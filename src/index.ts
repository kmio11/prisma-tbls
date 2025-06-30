import { parsePrismaSchema } from './parser/prisma.js'
import { convertSchemaToTbls } from './converter/schema.js'
import type { TblsSchema } from './types/tbls.js'

/**
 * Main entry point for converting Prisma schema to tbls JSON format
 * @param prismaSchemaContent - The Prisma schema file content as string
 * @returns Promise<TblsSchema> - The converted tbls JSON schema
 */
export async function convertPrismaToTbls(prismaSchemaContent: string): Promise<TblsSchema> {
  // Parse the Prisma schema
  const prismaAst = parsePrismaSchema(prismaSchemaContent)
  
  // Convert to tbls format
  const tblsSchema = convertSchemaToTbls(prismaAst)
  
  return tblsSchema
}

// Re-export types for library usage
export type { TblsSchema } from './types/tbls.js'
export type { PrismaAst } from './parser/types.js'