import { describe, test, expect } from 'vitest'
import { convertDMMFToTblsJSON } from '../../index.js'
import type { DMMF } from '@prisma/generator-helper'

describe('Basic DMMF to tbls conversion', () => {
  test('should convert a simple DMMF datamodel', () => {
    const mockDMMF: DMMF.Datamodel = {
      models: [
        {
          name: 'User',
          dbName: null,
          schema: null,
          fields: [
            {
              name: 'id',
              type: 'Int',
              kind: 'scalar',
              isRequired: true,
              isList: false,
              isUnique: false,
              isId: true,
              isReadOnly: false,
              hasDefaultValue: true,
              default: { name: 'autoincrement', args: [] },
              relationName: undefined,
              relationFromFields: undefined,
              relationToFields: undefined,
              documentation: undefined
            },
            {
              name: 'email',
              type: 'String',
              kind: 'scalar',
              isRequired: true,
              isList: false,
              isUnique: true,
              isId: false,
              isReadOnly: false,
              hasDefaultValue: false,
              relationName: undefined,
              relationFromFields: undefined,
              relationToFields: undefined,
              documentation: undefined
            }
          ],
          primaryKey: null,
          uniqueFields: [],
          uniqueIndexes: [],
          documentation: undefined
        }
      ],
      enums: [
        {
          name: 'Status',
          values: [
            { name: 'DRAFT', documentation: undefined, dbName: null },
            { name: 'PUBLISHED', documentation: undefined, dbName: null }
          ],
          dbName: null,
          documentation: undefined
        }
      ],
      types: []
    }

    const result = convertDMMFToTblsJSON(mockDMMF)
    
    expect(result).toBeDefined()
    expect(result.tables).toHaveLength(1)
    expect(result.enums).toHaveLength(1)
    
    // Check User table
    const userTable = result.tables[0]
    expect(userTable.name).toBe('user')
    expect(userTable.columns).toHaveLength(2) // id, email
    
    // Check Status enum
    const statusEnum = result.enums?.[0]
    expect(statusEnum?.name).toBe('status')
    expect(statusEnum?.values).toEqual(['DRAFT', 'PUBLISHED'])
  })
  
  test('should handle empty datamodel', () => {
    const emptyDMMF: DMMF.Datamodel = {
      models: [],
      enums: [],
      types: []
    }
    
    const result = convertDMMFToTblsJSON(emptyDMMF)
    
    expect(result).toBeDefined()
    expect(result.tables).toHaveLength(0)
    expect(result.enums).toHaveLength(0)
    expect(result.relations).toHaveLength(0)
  })
})