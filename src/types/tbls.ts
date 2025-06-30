/**
 * tbls JSON Schema TypeScript definitions
 * Based on: https://github.com/k1LoW/tbls/schema/schema
 */

export interface TblsSchema {
  name?: string
  desc?: string
  tables: Table[]
  relations?: Relation[]
  functions?: Function[]
  enums?: Enum[]
  driver?: Driver
  labels?: Labels
  viewpoints?: Viewpoints
}

export interface Table {
  name: string
  type: string
  comment?: string
  columns: Column[]
  indexes?: Index[]
  constraints?: Constraint[]
  triggers?: Trigger[]
  def?: string
  labels?: Labels
  referenced_tables?: string[]
}

export interface Column {
  name: string
  type: string
  nullable: boolean
  default?: string | null
  extra_def?: string
  labels?: Labels
  comment?: string
}

export interface Constraint {
  name: string
  type: string
  def: string
  table: string
  referenced_table?: string
  columns: string[]
  referenced_columns?: string[]
  comment?: string
}

export interface Index {
  name: string
  def: string
  table: string
  columns: string[]
  comment?: string
}

export interface Trigger {
  name: string
  def: string
  comment?: string
}

export interface Relation {
  table: string
  columns: string[]
  cardinality?: 'zero_or_one' | 'exactly_one' | 'zero_or_more' | 'one_or_more' | ''
  parent_table: string
  parent_columns: string[]
  parent_cardinality?: 'zero_or_one' | 'exactly_one' | 'zero_or_more' | 'one_or_more' | ''
  def: string
  virtual?: boolean
}

export interface Function {
  name: string
  return_type: string
  arguments: string
  type: string
}

export interface Enum {
  name: string
  values: string[]
}

export interface Driver {
  name: string
  database_version?: string
  meta?: DriverMeta
}

export interface DriverMeta {
  current_schema?: string
  search_paths?: string[]
  dict?: Record<string, string>
}

export interface Label {
  name: string
  virtual?: boolean
}

export type Labels = Label[]

export interface Viewpoint {
  name: string
  desc: string
  labels?: string[]
  tables?: string[]
  distance?: number
  groups?: ViewpointGroup[]
}

export interface ViewpointGroup {
  name: string
  desc: string
  labels?: string[]
  tables?: string[]
  color?: string
}

export type Viewpoints = Viewpoint[]