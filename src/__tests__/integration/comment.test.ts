import { describe, test, expect } from 'vitest'
import { convertDMMFToTblsJSON } from '../../index.js'
import type { DMMF } from '@prisma/generator-helper'

describe('Comment conversion from DMMF to tbls', () => {
  test('should preserve model documentation as table comment', () => {
    const mockDMMF: DMMF.Datamodel = {
      models: [
        {
          name: 'User',
          dbName: null,
          schema: null,
          documentation: 'User account information with authentication details',
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
              documentation: 'Primary key for user identification',
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
              documentation: 'User email address for login and notifications',
            },
          ],
          primaryKey: null,
          uniqueFields: [],
          uniqueIndexes: [],
        },
      ],
      enums: [
        {
          name: 'Status',
          values: [
            { name: 'DRAFT', dbName: null },
            { name: 'PUBLISHED', dbName: null },
          ],
          dbName: null,
          documentation: 'Content publication status enumeration',
        },
      ],
      types: [],
    }

    const result = convertDMMFToTblsJSON(mockDMMF)

    expect(result).toBeDefined()
    expect(result.tables).toHaveLength(1)

    // Check table comment
    const userTable = result.tables[0]
    expect(userTable.name).toBe('user')
    expect(userTable.comment).toBe('User account information with authentication details')

    // Check column comments
    expect(userTable.columns).toHaveLength(2)
    
    const idColumn = userTable.columns.find(col => col.name === 'id')
    expect(idColumn?.comment).toBe('Primary key for user identification')
    
    const emailColumn = userTable.columns.find(col => col.name === 'email')
    expect(emailColumn?.comment).toBe('User email address for login and notifications')
  })

  test('should handle empty comments gracefully', () => {
    const mockDMMF: DMMF.Datamodel = {
      models: [
        {
          name: 'Product',
          dbName: null,
          schema: null,
          documentation: undefined,
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
        },
      ],
      enums: [],
      types: [],
      indexes: [],
    }

    const result = convertDMMFToTblsJSON(mockDMMF)
    
    const productTable = result.tables[0]
    expect(productTable.comment).toBe('')
    expect(productTable.columns[0].comment).toBe('')
  })

  test('should preserve multiline comments', () => {
    const mockDMMF: DMMF.Datamodel = {
      models: [
        {
          name: 'Order',
          dbName: null,
          schema: null,
          documentation: 'Order management table\nStores customer purchase information\nIncluding payment and shipping details',
          fields: [
            {
              name: 'description',
              type: 'String',
              kind: 'scalar',
              isRequired: false,
              isList: false,
              isUnique: false,
              isId: false,
              isReadOnly: false,
              hasDefaultValue: false,
              relationName: undefined,
              relationFromFields: undefined,
              relationToFields: undefined,
              documentation: 'Detailed order description\nCan include special instructions\nFrom the customer',
            },
          ],
          primaryKey: null,
          uniqueFields: [],
          uniqueIndexes: [],
        },
      ],
      enums: [],
      types: [],
      indexes: [],
    }

    const result = convertDMMFToTblsJSON(mockDMMF)
    
    const orderTable = result.tables[0]
    expect(orderTable.comment).toBe('Order management table\nStores customer purchase information\nIncluding payment and shipping details')
    
    const descColumn = orderTable.columns[0]
    expect(descColumn.comment).toBe('Detailed order description\nCan include special instructions\nFrom the customer')
  })
})