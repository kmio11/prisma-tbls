import { convertDMMFToTbls } from './converter/dmmf-converter.js'
import type { TblsSchema } from './types/tbls.js'
import type { DMMF } from '@prisma/generator-helper'

/**
 * Convert DMMF to tbls JSON format
 * This is the main library function for programmatic usage
 * @param dmmf - DMMF datamodel from @prisma/generator-helper
 * @returns TblsSchema - The converted tbls JSON schema
 */
export function convertDMMFToTblsJSON(dmmf: DMMF.Datamodel): TblsSchema {
  return convertDMMFToTbls(dmmf)
}

// Re-export types for library usage
export type { TblsSchema } from './types/tbls.js'
export type { DMMF } from '@prisma/generator-helper'
