import type { PrismaAst } from '../parser/types.js'
import type { TblsSchema } from '../types/tbls.js'
import { convertModelToTable } from './table.js'
import { convertEnumToTblsEnum } from './enum.js'
import { extractRelations } from './relation.js'

/**
 * Convert a Prisma AST to tbls JSON schema format
 * @param prismaAst - Parsed Prisma schema
 * @returns TblsSchema - tbls-compatible JSON schema
 */
export function convertSchemaToTbls(prismaAst: PrismaAst): TblsSchema {
  // Convert models to tables
  const tables = prismaAst.models.map(model => convertModelToTable(model))
  
  // Convert enums
  const enums = prismaAst.enums.map(enumDef => convertEnumToTblsEnum(enumDef))
  
  // Extract relations from models
  const relations = extractRelations(prismaAst.models)
  
  return {
    name: 'Database Schema',
    desc: 'Generated from Prisma schema',
    tables,
    relations,
    enums,
    driver: {
      name: 'prisma',
      database_version: '1.0.0'
    }
  }
}