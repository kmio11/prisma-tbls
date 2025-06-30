import type { PrismaModel } from '../parser/types.js'
import type { Table } from '../types/tbls.js'
import { convertFieldToColumn } from './column.js'

/**
 * Convert a Prisma model to a tbls table
 * @param model - Prisma model definition
 * @returns Table - tbls table definition
 */
export function convertModelToTable(model: PrismaModel): Table {
  // Convert fields to columns
  const columns = model.fields
    .filter(field => field.type.kind === 'scalar' || field.type.kind === 'enum')
    .map(field => convertFieldToColumn(field))
  
  // Get table name (use @@map if available, otherwise model name)
  const tableName = getTableName(model)
  
  // Get table comment from documentation
  const comment = model.documentation
  
  // Generate basic constraints for primary keys
  const constraints = generateConstraints(model)
  
  // Generate indexes
  const indexes = generateIndexes(model)
  
  return {
    name: tableName,
    type: 'table',
    comment,
    columns,
    constraints,
    indexes,
  }
}

/**
 * Get the actual table name from a Prisma model
 * @param model - Prisma model
 * @returns string - table name
 */
function getTableName(model: PrismaModel): string {
  // Check for @@map attribute
  const mapAttribute = model.attributes.find(attr => attr.name === 'map')
  if (mapAttribute && mapAttribute.args.length > 0) {
    return mapAttribute.args[0].value as string
  }
  
  // Default to model name (convert to snake_case)
  return camelToSnakeCase(model.name)
}

/**
 * Generate constraints for a model
 * @param model - Prisma model
 * @returns Constraint[] - array of constraints
 */
function generateConstraints(model: PrismaModel): any[] {
  const constraints: any[] = []
  
  // Find primary key fields
  const idFields = model.fields.filter(field => field.isId)
  
  if (idFields.length > 0) {
    constraints.push({
      name: `${getTableName(model)}_pkey`,
      type: 'PRIMARY KEY',
      def: `PRIMARY KEY (${idFields.map(f => f.name).join(', ')})`,
      table: getTableName(model),
      columns: idFields.map(f => f.name)
    })
  }
  
  // Find unique constraints
  const uniqueFields = model.fields.filter(field => field.isUnique)
  uniqueFields.forEach(field => {
    constraints.push({
      name: `${getTableName(model)}_${field.name}_unique`,
      type: 'UNIQUE',
      def: `UNIQUE (${field.name})`,
      table: getTableName(model),
      columns: [field.name]
    })
  })
  
  // Handle @@unique and @@id constraints
  model.attributes.forEach(attr => {
    if (attr.name === 'unique') {
      const fields = attr.args.find(arg => arg.name === 'fields')?.value as string[]
      if (fields) {
        constraints.push({
          name: `${getTableName(model)}_${fields.join('_')}_unique`,
          type: 'UNIQUE',
          def: `UNIQUE (${fields.join(', ')})`,
          table: getTableName(model),
          columns: fields
        })
      }
    }
    
    if (attr.name === 'id') {
      const fields = attr.args.find(arg => arg.name === 'fields')?.value as string[]
      if (fields) {
        constraints.push({
          name: `${getTableName(model)}_pkey`,
          type: 'PRIMARY KEY',
          def: `PRIMARY KEY (${fields.join(', ')})`,
          table: getTableName(model),
          columns: fields
        })
      }
    }
  })
  
  return constraints
}

/**
 * Generate indexes for a model
 * @param model - Prisma model
 * @returns Index[] - array of indexes
 */
function generateIndexes(model: PrismaModel): any[] {
  const indexes: any[] = []
  
  // Handle @@index attributes
  model.attributes.forEach(attr => {
    if (attr.name === 'index') {
      const fields = attr.args.find(arg => arg.name === 'fields')?.value as string[]
      const name = attr.args.find(arg => arg.name === 'name')?.value as string
      
      if (fields) {
        const indexName = name || `${getTableName(model)}_${fields.join('_')}_idx`
        indexes.push({
          name: indexName,
          def: `CREATE INDEX ${indexName} ON ${getTableName(model)} (${fields.join(', ')})`,
          table: getTableName(model),
          columns: fields
        })
      }
    }
  })
  
  return indexes
}

/**
 * Convert camelCase to snake_case
 * @param str - camelCase string
 * @returns string - snake_case string
 */
function camelToSnakeCase(str: string): string {
  return str.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase()
}