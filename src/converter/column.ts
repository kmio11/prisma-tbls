import type { PrismaField } from '../parser/types.js'
import type { Column } from '../types/tbls.js'

/**
 * Convert a Prisma field to a tbls column
 * @param field - Prisma field definition
 * @returns Column - tbls column definition
 */
export function convertFieldToColumn(field: PrismaField): Column {
  return {
    name: getColumnName(field),
    type: mapPrismaTypeToSql(field.type.name, field.isList),
    nullable: field.isOptional && !field.isId,
    default: getDefaultValue(field),
    comment: field.documentation,
  }
}

/**
 * Get the actual column name from a Prisma field
 * @param field - Prisma field
 * @returns string - column name
 */
function getColumnName(field: PrismaField): string {
  // Check for @map attribute
  const mapAttribute = field.attributes.find(attr => attr.name === 'map')
  if (mapAttribute && mapAttribute.args.length > 0) {
    return mapAttribute.args[0].value as string
  }
  
  // Default to field name (convert to snake_case)
  return camelToSnakeCase(field.name)
}

/**
 * Map Prisma scalar types to SQL types
 * @param prismaType - Prisma type name
 * @param isList - whether the field is a list
 * @returns string - SQL type
 */
function mapPrismaTypeToSql(prismaType: string, isList: boolean): string {
  if (isList) {
    return 'JSON' // Arrays are typically stored as JSON
  }
  
  switch (prismaType) {
    case 'String':
      return 'VARCHAR'
    case 'Int':
      return 'INTEGER'
    case 'BigInt':
      return 'BIGINT'
    case 'Float':
      return 'FLOAT'
    case 'Decimal':
      return 'DECIMAL'
    case 'DateTime':
      return 'DATETIME'
    case 'Boolean':
      return 'BOOLEAN'
    case 'Json':
      return 'JSON'
    case 'Bytes':
      return 'BLOB'
    default:
      // For enums and unknown types, return the type name
      return prismaType
  }
}

/**
 * Get the default value for a field
 * @param field - Prisma field
 * @returns string | null - default value
 */
function getDefaultValue(field: PrismaField): string | null {
  const defaultAttribute = field.attributes.find(attr => attr.name === 'default')
  
  if (!defaultAttribute || defaultAttribute.args.length === 0) {
    return null
  }
  
  const defaultValue = defaultAttribute.args[0].value
  
  // Handle different default value types
  if (typeof defaultValue === 'string') {
    // Handle function calls like now(), uuid(), etc.
    if (defaultValue.includes('(')) {
      return defaultValue
    }
    // Handle string literals
    return `'${defaultValue}'`
  }
  
  if (typeof defaultValue === 'number' || typeof defaultValue === 'boolean') {
    return String(defaultValue)
  }
  
  return null
}

/**
 * Convert camelCase to snake_case
 * @param str - camelCase string
 * @returns string - snake_case string
 */
function camelToSnakeCase(str: string): string {
  return str.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase()
}