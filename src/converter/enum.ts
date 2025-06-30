import type { PrismaEnum } from '../parser/types.js'
import type { Enum } from '../types/tbls.js'

/**
 * Convert a Prisma enum to a tbls enum
 * @param enumDef - Prisma enum definition
 * @returns Enum - tbls enum definition
 */
export function convertEnumToTblsEnum(enumDef: PrismaEnum): Enum {
  return {
    name: getEnumName(enumDef),
    values: enumDef.values.map(value => getEnumValueName(value))
  }
}

/**
 * Get the actual enum name
 * @param enumDef - Prisma enum
 * @returns string - enum name
 */
function getEnumName(enumDef: PrismaEnum): string {
  // Check for @@map attribute (though rare for enums)
  const mapAttribute = enumDef.attributes.find(attr => attr.name === 'map')
  if (mapAttribute && mapAttribute.args.length > 0) {
    return mapAttribute.args[0].value as string
  }
  
  // Default to enum name (convert to snake_case)
  return camelToSnakeCase(enumDef.name)
}

/**
 * Get the actual enum value name
 * @param value - Prisma enum value
 * @returns string - enum value name
 */
function getEnumValueName(value: { name: string; attributes?: any[] }): string {
  // Check for @map attribute on enum value
  if (value.attributes) {
    const mapAttribute = value.attributes.find(attr => attr.name === 'map')
    if (mapAttribute && mapAttribute.args && mapAttribute.args.length > 0) {
      return mapAttribute.args[0].value as string
    }
  }
  
  return value.name
}

/**
 * Convert camelCase to snake_case
 * @param str - camelCase string
 * @returns string - snake_case string
 */
function camelToSnakeCase(str: string): string {
  return str.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase()
}