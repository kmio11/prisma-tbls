import type { PrismaModel, PrismaField } from '../parser/types.js'
import type { Relation } from '../types/tbls.js'

/**
 * Extract relations from Prisma models
 * @param models - Array of Prisma models
 * @returns Relation[] - Array of tbls relations
 */
export function extractRelations(models: PrismaModel[]): Relation[] {
  const relations: Relation[] = []
  
  for (const model of models) {
    const relationFields = model.fields.filter(field => field.type.kind === 'object')
    
    for (const field of relationFields) {
      const relation = extractRelationFromField(model, field, models)
      if (relation) {
        relations.push(relation)
      }
    }
  }
  
  return relations
}

/**
 * Extract a relation from a relation field
 * @param model - The model containing the field
 * @param field - The relation field
 * @param allModels - All models for reference
 * @returns Relation | null - tbls relation or null if not a foreign key relation
 */
function extractRelationFromField(
  model: PrismaModel, 
  field: PrismaField, 
  allModels: PrismaModel[]
): Relation | null {
  // Find @relation attribute
  const relationAttribute = field.attributes.find(attr => attr.name === 'relation')
  
  if (!relationAttribute) {
    return null // Not an explicit relation
  }
  
  // Get relation configuration
  const fieldsArg = relationAttribute.args.find(arg => arg.name === 'fields')
  const referencesArg = relationAttribute.args.find(arg => arg.name === 'references')
  
  if (!fieldsArg || !referencesArg) {
    return null // Invalid relation configuration
  }
  
  const fields = fieldsArg.value as string[]
  const references = referencesArg.value as string[]
  
  if (!fields || !references || fields.length !== references.length) {
    return null // Invalid relation
  }
  
  // Find the target model
  const targetModel = allModels.find(m => m.name === field.type.name)
  if (!targetModel) {
    return null
  }
  
  const tableName = getTableName(model)
  const parentTableName = getTableName(targetModel)
  
  // Determine cardinality
  const cardinality = determineCardinality(field, model, targetModel, allModels)
  const parentCardinality = determineParentCardinality(field, model, targetModel, allModels)
  
  return {
    table: tableName,
    columns: fields.map(f => getColumnName(f, model)),
    cardinality,
    parent_table: parentTableName,
    parent_columns: references.map(r => getColumnName(r, targetModel)),
    parent_cardinality: parentCardinality,
    def: `FOREIGN KEY (${fields.join(', ')}) REFERENCES ${parentTableName}(${references.join(', ')})`
  }
}

/**
 * Determine the cardinality from the child side
 * @param field - Relation field
 * @param model - Current model
 * @param targetModel - Target model
 * @param allModels - All models
 * @returns string - Cardinality
 */
function determineCardinality(
  field: PrismaField, 
  model: PrismaModel, 
  targetModel: PrismaModel, 
  allModels: PrismaModel[]
): 'zero_or_one' | 'exactly_one' | 'zero_or_more' | 'one_or_more' | '' {
  if (field.isList) {
    return 'zero_or_more' // One-to-many or many-to-many
  }
  
  if (field.isOptional) {
    return 'zero_or_one' // Optional one-to-one
  }
  
  return 'exactly_one' // Required one-to-one
}

/**
 * Determine the parent cardinality
 * @param field - Relation field
 * @param model - Current model
 * @param targetModel - Target model
 * @param allModels - All models
 * @returns string - Parent cardinality
 */
function determineParentCardinality(
  field: PrismaField, 
  model: PrismaModel, 
  targetModel: PrismaModel, 
  allModels: PrismaModel[]
): 'zero_or_one' | 'exactly_one' | 'zero_or_more' | 'one_or_more' | '' {
  // Find the reverse relation in the target model
  const reverseField = targetModel.fields.find(f => 
    f.type.kind === 'object' && f.type.name === model.name
  )
  
  if (!reverseField) {
    return 'exactly_one' // Default assumption
  }
  
  if (reverseField.isList) {
    return 'zero_or_more' // Parent can have multiple children
  }
  
  if (reverseField.isOptional) {
    return 'zero_or_one' // Optional parent
  }
  
  return 'exactly_one' // Required parent
}

/**
 * Get table name for a model
 * @param model - Prisma model
 * @returns string - table name
 */
function getTableName(model: PrismaModel): string {
  const mapAttribute = model.attributes.find(attr => attr.name === 'map')
  if (mapAttribute && mapAttribute.args.length > 0) {
    return mapAttribute.args[0].value as string
  }
  return camelToSnakeCase(model.name)
}

/**
 * Get column name for a field
 * @param fieldName - Field name
 * @param model - Model containing the field
 * @returns string - column name
 */
function getColumnName(fieldName: string, model: PrismaModel): string {
  const field = model.fields.find(f => f.name === fieldName)
  if (!field) {
    return camelToSnakeCase(fieldName)
  }
  
  const mapAttribute = field.attributes.find(attr => attr.name === 'map')
  if (mapAttribute && mapAttribute.args.length > 0) {
    return mapAttribute.args[0].value as string
  }
  
  return camelToSnakeCase(fieldName)
}

/**
 * Convert camelCase to snake_case
 * @param str - camelCase string
 * @returns string - snake_case string
 */
function camelToSnakeCase(str: string): string {
  return str.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase()
}