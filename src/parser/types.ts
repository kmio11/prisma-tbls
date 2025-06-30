/**
 * Prisma AST TypeScript definitions
 * Represents the parsed structure of a Prisma schema
 */

export interface PrismaAst {
  models: PrismaModel[]
  enums: PrismaEnum[]
  datasource?: PrismaDatasource
  generator?: PrismaGenerator[]
}

export interface PrismaModel {
  name: string
  fields: PrismaField[]
  attributes: PrismaAttribute[]
  documentation?: string
  dbName?: string // from @@map
}

export interface PrismaField {
  name: string
  type: PrismaFieldType
  isOptional: boolean
  isList: boolean
  isId: boolean
  isUnique: boolean
  attributes: PrismaAttribute[]
  documentation?: string
  dbName?: string // from @map
}

export interface PrismaFieldType {
  kind: 'scalar' | 'object' | 'enum' | 'unsupported'
  name: string
}

export interface PrismaAttribute {
  name: string
  args: PrismaAttributeArg[]
}

export interface PrismaAttributeArg {
  name?: string
  value: PrismaAttributeValue
}

export type PrismaAttributeValue = 
  | string
  | number
  | boolean
  | PrismaAttributeValue[]
  | { [key: string]: PrismaAttributeValue }

export interface PrismaEnum {
  name: string
  values: PrismaEnumValue[]
  attributes: PrismaAttribute[]
  documentation?: string
  dbName?: string
}

export interface PrismaEnumValue {
  name: string
  attributes: PrismaAttribute[]
  documentation?: string
  dbName?: string
}

export interface PrismaDatasource {
  name: string
  provider: string
  url: string
  attributes: PrismaAttribute[]
}

export interface PrismaGenerator {
  name: string
  provider: string
  attributes: PrismaAttribute[]
}

export interface PrismaRelation {
  name?: string
  fields: string[]
  references: string[]
  onDelete?: 'CASCADE' | 'RESTRICT' | 'NO ACTION' | 'SET NULL' | 'SET DEFAULT'
  onUpdate?: 'CASCADE' | 'RESTRICT' | 'NO ACTION' | 'SET NULL' | 'SET DEFAULT'
  map?: string
}

// Utility types for better type inference
export type ScalarFieldType = 
  | 'String'
  | 'Boolean'
  | 'Int'
  | 'BigInt'
  | 'Float'
  | 'Decimal'
  | 'DateTime'
  | 'Json'
  | 'Bytes'

export type RelationFieldType = string // Model name

export type PrismaFieldTypeName = ScalarFieldType | RelationFieldType