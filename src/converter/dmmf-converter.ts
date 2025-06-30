import type { DMMF } from '@prisma/generator-helper'
import type { TblsSchema, Constraint, Index, Relation } from '../types/tbls.js'

/**
 * Convert DMMF datamodel directly to tbls JSON format
 * This approach follows the prisma-markdown reference implementation
 * @param datamodel - DMMF Datamodel from @prisma/generator-helper
 * @returns TblsSchema - tbls-compatible JSON schema
 */
export function convertDMMFToTbls(datamodel: DMMF.Datamodel): TblsSchema {
  // Convert models to tables
  const tables = datamodel.models.map(model => ({
    name: getTableName(model),
    type: 'table' as const,
    comment: model.documentation ?? '',
    columns: model.fields
      .filter(field => field.kind === 'scalar' || field.kind === 'enum')
      .map(field => ({
        name: getColumnName(field),
        type: mapFieldTypeToSql(field),
        nullable: !field.isRequired,
        default: getDefaultValue(field),
        comment: field.documentation ?? '',
      })),
    constraints: generateConstraints(model),
    indexes: generateIndexes(model),
  }))

  // Convert enums
  const enums = datamodel.enums.map(enumDef => ({
    name: getEnumName(enumDef),
    values: enumDef.values.map(value => value.name),
  }))

  // Extract relations
  const relations = extractRelationsFromModels([...datamodel.models])

  return {
    name: 'Database Schema',
    desc: 'Generated from Prisma schema using @prisma/generator-helper',
    tables,
    relations,
    enums,
    driver: {
      name: 'prisma',
      database_version: '1.0.0',
    },
  }
}

/**
 * Get table name from model
 */
function getTableName(model: DMMF.Model): string {
  return model.dbName || camelToSnakeCase(model.name)
}

/**
 * Get column name from field
 */
function getColumnName(field: DMMF.Field): string {
  // Type-safe access to dbName - it exists but isn't in DMMF types
  const fieldWithDbName = field as DMMF.Field & { dbName?: string }
  return fieldWithDbName.dbName || camelToSnakeCase(field.name)
}

/**
 * Get enum name
 */
function getEnumName(enumDef: DMMF.DatamodelEnum): string {
  return enumDef.dbName || camelToSnakeCase(enumDef.name)
}

/**
 * Map DMMF field type to SQL type
 */
function mapFieldTypeToSql(field: DMMF.Field): string {
  if (field.isList) {
    return 'JSON' // Arrays stored as JSON
  }

  switch (field.type) {
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
      // For enums and other types
      return field.type
  }
}

/**
 * Get default value from field
 */
function getDefaultValue(field: DMMF.Field): string | null {
  if (!field.hasDefaultValue || !field.default) {
    return null
  }

  // Handle different default value types
  if (typeof field.default === 'object' && field.default !== null) {
    // Function calls like autoincrement(), now(), etc.
    const defaultObj = field.default as { name: string }
    return `${defaultObj.name}()`
  }

  if (typeof field.default === 'string') {
    return `'${field.default}'`
  }

  return String(field.default)
}

/**
 * Generate constraints for a model
 */
function generateConstraints(model: DMMF.Model): Constraint[] {
  const constraints: Constraint[] = []
  const tableName = getTableName(model)

  // Primary key constraints
  if (model.primaryKey) {
    constraints.push({
      name: `${tableName}_pkey`,
      type: 'PRIMARY KEY',
      def: `PRIMARY KEY (${model.primaryKey.fields.join(', ')})`,
      table: tableName,
      columns: [...model.primaryKey.fields],
    })
  } else {
    // Find @id fields
    const idFields = model.fields.filter(field => field.isId)
    if (idFields.length > 0) {
      constraints.push({
        name: `${tableName}_pkey`,
        type: 'PRIMARY KEY',
        def: `PRIMARY KEY (${idFields.map(f => getColumnName(f)).join(', ')})`,
        table: tableName,
        columns: idFields.map(f => getColumnName(f)),
      })
    }
  }

  // Unique constraints
  const uniqueFields = model.fields.filter(field => field.isUnique)
  uniqueFields.forEach(field => {
    const columnName = getColumnName(field)
    constraints.push({
      name: `${tableName}_${columnName}_unique`,
      type: 'UNIQUE',
      def: `UNIQUE (${columnName})`,
      table: tableName,
      columns: [columnName],
    })
  })

  // Unique field combinations
  model.uniqueFields.forEach(uniqueFieldSet => {
    constraints.push({
      name: `${tableName}_${uniqueFieldSet.join('_')}_unique`,
      type: 'UNIQUE',
      def: `UNIQUE (${uniqueFieldSet.join(', ')})`,
      table: tableName,
      columns: [...uniqueFieldSet],
    })
  })

  return constraints
}

/**
 * Generate indexes for a model
 */
function generateIndexes(_model: DMMF.Model): Index[] {
  // DMMF doesn't directly expose @@index information
  // Would need to parse from model attributes if available
  return []
}

/**
 * Extract relations from models
 */
function extractRelationsFromModels(models: DMMF.Model[]): Relation[] {
  const relations: Relation[] = []

  for (const model of models) {
    const relationFields = model.fields.filter(field => field.kind === 'object')

    for (const field of relationFields) {
      // Only process fields that have actual foreign key relations
      if (
        field.relationFromFields &&
        field.relationFromFields.length > 0 &&
        field.relationToFields &&
        field.relationToFields.length > 0
      ) {
        const targetModel = models.find(m => m.name === field.type)
        if (!targetModel) continue

        relations.push({
          table: getTableName(model),
          columns: field.relationFromFields.map(f => camelToSnakeCase(f)),
          cardinality: determineCardinality(field),
          parent_table: getTableName(targetModel),
          parent_columns: field.relationToFields.map(f => camelToSnakeCase(f)),
          parent_cardinality: 'exactly_one', // Default assumption
          def: `FOREIGN KEY (${field.relationFromFields.join(', ')}) REFERENCES ${getTableName(targetModel)}(${field.relationToFields.join(', ')})`,
        })
      }
    }
  }

  return relations
}

/**
 * Determine cardinality from field
 */
function determineCardinality(
  field: DMMF.Field
): 'zero_or_one' | 'exactly_one' | 'zero_or_more' | 'one_or_more' {
  if (field.isList) {
    return 'zero_or_more'
  }

  if (!field.isRequired) {
    return 'zero_or_one'
  }

  return 'exactly_one'
}

/**
 * Convert camelCase to snake_case
 */
function camelToSnakeCase(str: string): string {
  return str.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase()
}
