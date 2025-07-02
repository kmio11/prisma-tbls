import { describe, test, expect } from 'vitest'
import { convertDMMFToTblsJSON } from '../../index.js'
import type { DMMF } from '@prisma/generator-helper'

describe('Index Generation', () => {
  test('should convert DMMF indexes to tbls format', () => {
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
              documentation: undefined,
            },
            {
              name: 'email',
              type: 'String',
              kind: 'scalar',
              isRequired: true,
              isList: false,
              isUnique: false,
              isId: false,
              isReadOnly: false,
              hasDefaultValue: false,
              relationName: undefined,
              relationFromFields: undefined,
              relationToFields: undefined,
              documentation: undefined,
            },
            {
              name: 'name',
              type: 'String',
              kind: 'scalar',
              isRequired: true,
              isList: false,
              isUnique: false,
              isId: false,
              isReadOnly: false,
              hasDefaultValue: false,
              relationName: undefined,
              relationFromFields: undefined,
              relationToFields: undefined,
              documentation: undefined,
            },
          ],
          primaryKey: null,
          uniqueFields: [],
          uniqueIndexes: [],
          documentation: undefined,
        },
      ],
      enums: [],
      types: [],
      indexes: [
        {
          model: 'User',
          type: 'normal',
          isDefinedOnField: false,
          name: 'User_email_name_idx',
          fields: [
            { name: 'email' },
            { name: 'name' },
          ],
        },
        {
          model: 'User',
          type: 'normal',
          isDefinedOnField: false,
          name: 'User_email_idx',
          fields: [
            { name: 'email' },
          ],
        },
      ],
    }

    const result = convertDMMFToTblsJSON(mockDMMF)
    const userTable = result.tables[0]
    
    expect(userTable.indexes).toBeDefined()
    expect(userTable.indexes).toHaveLength(2)
    
    // Check composite index
    const compositeIndex = userTable.indexes?.find(idx => idx.name === 'User_email_name_idx')
    expect(compositeIndex).toBeDefined()
    expect(compositeIndex?.table).toBe('user')
    expect(compositeIndex?.columns).toEqual(['email', 'name'])
    expect(compositeIndex?.def).toBe('CREATE INDEX User_email_name_idx ON user (email, name)')
    
    // Check single field index
    const emailIndex = userTable.indexes?.find(idx => idx.name === 'User_email_idx')
    expect(emailIndex).toBeDefined()
    expect(emailIndex?.table).toBe('user')
    expect(emailIndex?.columns).toEqual(['email'])
    expect(emailIndex?.def).toBe('CREATE INDEX User_email_idx ON user (email)')
  })

  test('should handle empty indexes array', () => {
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
              documentation: undefined,
            },
          ],
          primaryKey: null,
          uniqueFields: [],
          uniqueIndexes: [],
          documentation: undefined,
        },
      ],
      enums: [],
      types: [],
      indexes: [],
    }

    const result = convertDMMFToTblsJSON(mockDMMF)
    const userTable = result.tables[0]
    
    expect(userTable.indexes).toBeDefined()
    expect(userTable.indexes).toHaveLength(0)
  })
})