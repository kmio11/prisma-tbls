import type { DMMF } from '@prisma/generator-helper'

/**
 * For standalone usage, we need to create a CLI utility that works
 * as a Prisma generator to get access to the parsed DMMF.
 * This approach follows the prisma-markdown reference implementation.
 */
export function createDMMFParser() {
  // This will be used in the CLI to handle DMMF parsing
  // following the prisma-markdown pattern
  return {
    parseFromDMMF: (dmmf: DMMF.Document) => dmmf
  }
}

/**
 * Convert DMMF to our internal AST format for backward compatibility
 * @param dmmf - DMMF document from Prisma
 * @returns PrismaAst - Our internal representation
 */
export function convertDMMFToAst(dmmf: DMMF.Document): {
  models: Array<{
    name: string
    fields: Array<{
      name: string
      type: { kind: string; name: string }
      isOptional: boolean
      isList: boolean
      isId: boolean
      isUnique: boolean
      attributes: Array<{ name: string; args: Array<{ name?: string; value: any }> }>
      documentation?: string
    }>
    attributes: Array<{ name: string; args: Array<{ name?: string; value: any }> }>
    documentation?: string
  }>
  enums: Array<{
    name: string
    values: Array<{ name: string; attributes?: any[]; documentation?: string }>
    attributes: Array<{ name: string; args: Array<{ name?: string; value: any }> }>
    documentation?: string
  }>
  datasource?: any
  generator?: any
} {
  return {
    models: dmmf.datamodel.models.map(model => ({
      name: model.name,
      documentation: model.documentation,
      fields: model.fields.map(field => ({
        name: field.name,
        type: {
          kind: field.kind,
          name: field.type
        },
        isOptional: !field.isRequired,
        isList: field.isList,
        isId: field.isId,
        isUnique: field.isUnique,
        attributes: convertFieldAttributes(field),
        documentation: field.documentation
      })),
      attributes: convertModelAttributes(model)
    })),
    enums: dmmf.datamodel.enums.map(enumDef => ({
      name: enumDef.name,
      documentation: enumDef.documentation,
      values: enumDef.values.map(value => ({
        name: value.name,
        documentation: value.documentation
      })),
      attributes: []
    })),
    datasource: undefined,
    generator: undefined
  }
}

/**
 * Convert DMMF field to our attribute format
 */
function convertFieldAttributes(field: DMMF.Field): Array<{ name: string; args: Array<{ name?: string; value: any }> }> {
  const attributes: Array<{ name: string; args: Array<{ name?: string; value: any }> }> = []
  
  // Handle @id
  if (field.isId) {
    attributes.push({ name: 'id', args: [] })
  }
  
  // Handle @unique
  if (field.isUnique) {
    attributes.push({ name: 'unique', args: [] })
  }
  
  // Handle @default
  if (field.hasDefaultValue && field.default !== undefined) {
    const defaultValue = typeof field.default === 'object' && field.default !== null 
      ? (field.default as any).name || JSON.stringify(field.default)
      : field.default
    
    attributes.push({
      name: 'default',
      args: [{ value: defaultValue }]
    })
  }
  
  // Handle @relation
  if (field.relationName) {
    const relationArgs: Array<{ name?: string; value: any }> = []
    
    if (field.relationFromFields && field.relationFromFields.length > 0) {
      relationArgs.push({ name: 'fields', value: field.relationFromFields })
    }
    
    if (field.relationToFields && field.relationToFields.length > 0) {
      relationArgs.push({ name: 'references', value: field.relationToFields })
    }
    
    if (field.relationName) {
      relationArgs.push({ name: 'name', value: field.relationName })
    }
    
    if (relationArgs.length > 0) {
      attributes.push({ name: 'relation', args: relationArgs })
    }
  }
  
  return attributes
}

/**
 * Convert DMMF model to our attribute format
 */
function convertModelAttributes(model: DMMF.Model): Array<{ name: string; args: Array<{ name?: string; value: any }> }> {
  const attributes: Array<{ name: string; args: Array<{ name?: string; value: any }> }> = []
  
  // Handle @@id (compound primary key)
  if (model.primaryKey) {
    attributes.push({
      name: 'id',
      args: [{ name: 'fields', value: model.primaryKey.fields }]
    })
  }
  
  // Handle @@unique constraints
  model.uniqueFields.forEach(uniqueField => {
    attributes.push({
      name: 'unique',
      args: [{ name: 'fields', value: uniqueField }]
    })
  })
  
  // Handle @@index
  model.uniqueIndexes.forEach(index => {
    attributes.push({
      name: 'index',
      args: [
        { name: 'fields', value: index.fields },
        ...(index.name ? [{ name: 'name', value: index.name }] : [])
      ]
    })
  })
  
  return attributes
}