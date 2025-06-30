import type { PrismaAst, PrismaModel, PrismaEnum, PrismaField, PrismaAttribute, PrismaAttributeArg, PrismaFieldType } from './types.js'
import { PrismaLexer, TokenType, type Token } from './lexer.js'

/**
 * Parser for Prisma schema syntax
 */
export class PrismaParser {
  private tokens: Token[]
  private position: number = 0

  constructor(tokens: Token[]) {
    this.tokens = tokens.filter(token => 
      token.type !== TokenType.WHITESPACE && 
      token.type !== TokenType.COMMENT &&
      token.type !== TokenType.NEWLINE
    ) // Filter out whitespace and comments for parsing
  }

  private current(): Token {
    return this.tokens[this.position] || { type: TokenType.EOF, value: '', line: 0, column: 0 }
  }

  private peek(offset: number = 1): Token {
    return this.tokens[this.position + offset] || { type: TokenType.EOF, value: '', line: 0, column: 0 }
  }

  private advance(): Token {
    const token = this.current()
    this.position++
    return token
  }

  private expect(type: TokenType): Token {
    const token = this.current()
    if (token.type !== type) {
      throw new Error(`Expected ${type} but got ${token.type} at line ${token.line}:${token.column}`)
    }
    return this.advance()
  }

  private match(...types: TokenType[]): boolean {
    return types.includes(this.current().type)
  }

  private parseAttribute(): PrismaAttribute {
    // Skip @ or @@
    const isBlockAttribute = this.current().type === TokenType.ATAT
    this.advance()

    const name = this.expect(TokenType.IDENTIFIER).value
    const args: PrismaAttributeArg[] = []

    // Parse arguments if present
    if (this.match(TokenType.LPAREN)) {
      this.advance() // Skip (

      while (!this.match(TokenType.RPAREN, TokenType.EOF)) {
        // Parse named or positional argument
        let argName: string | undefined
        
        if (this.match(TokenType.IDENTIFIER) && this.peek().type === TokenType.COLON) {
          argName = this.advance().value
          this.advance() // Skip :
        }

        // Parse value
        let value: any
        if (this.match(TokenType.STRING)) {
          value = this.advance().value
        } else if (this.match(TokenType.NUMBER)) {
          value = parseFloat(this.advance().value)
        } else if (this.match(TokenType.BOOLEAN)) {
          value = this.advance().value === 'true'
        } else if (this.match(TokenType.LBRACKET)) {
          // Handle arrays like [authorId, id]
          this.advance() // Skip [
          const arrayValues: string[] = []
          
          while (!this.match(TokenType.RBRACKET, TokenType.EOF)) {
            if (this.match(TokenType.IDENTIFIER)) {
              arrayValues.push(this.advance().value)
            } else {
              this.advance() // Skip other tokens like commas
            }
          }
          
          if (this.match(TokenType.RBRACKET)) {
            this.advance() // Skip ]
          }
          
          value = arrayValues
        } else if (this.match(TokenType.IDENTIFIER)) {
          // Handle function calls like autoincrement()
          const identifier = this.advance().value
          if (this.match(TokenType.LPAREN)) {
            this.advance() // Skip (
            // Skip everything until )
            while (!this.match(TokenType.RPAREN, TokenType.EOF)) {
              this.advance()
            }
            if (this.match(TokenType.RPAREN)) {
              this.advance() // Skip )
            }
            value = `${identifier}()` // Function call
          } else {
            value = identifier
          }
        } else {
          throw new Error(`Unexpected token in attribute argument: ${this.current().type}`)
        }

        args.push({ name: argName, value })

        if (this.match(TokenType.COMMA)) {
          this.advance()
        }
      }

      this.expect(TokenType.RPAREN)
    }

    return { name, args }
  }

  private parseField(): PrismaField {
    const name = this.expect(TokenType.IDENTIFIER).value
    
    // Parse type
    const typeName = this.expect(TokenType.IDENTIFIER).value
    const isList = this.match(TokenType.LBRACKET)
    if (isList) {
      this.expect(TokenType.LBRACKET)
      this.expect(TokenType.RBRACKET)
    }

    const isOptional = this.match(TokenType.QUESTION)
    if (isOptional) {
      this.advance()
    }

    // Parse attributes
    const attributes: PrismaAttribute[] = []
    while (this.match(TokenType.AT)) {
      attributes.push(this.parseAttribute())
    }

    // Determine field type
    const fieldType: PrismaFieldType = {
      kind: this.isScalarType(typeName) ? 'scalar' : 'object',
      name: typeName
    }

    // Check for special field types
    let isId = false
    let isUnique = false

    attributes.forEach(attr => {
      if (attr.name === 'id') isId = true
      if (attr.name === 'unique') isUnique = true
    })

    return {
      name,
      type: fieldType,
      isOptional,
      isList,
      isId,
      isUnique,
      attributes,
    }
  }

  private parseModel(): PrismaModel {
    this.expect(TokenType.MODEL)
    const name = this.expect(TokenType.IDENTIFIER).value
    this.expect(TokenType.LBRACE)

    const fields: PrismaField[] = []
    const attributes: PrismaAttribute[] = []

    while (!this.match(TokenType.RBRACE, TokenType.EOF)) {
      if (this.match(TokenType.ATAT)) {
        // Block attribute
        attributes.push(this.parseAttribute())
      } else if (this.match(TokenType.IDENTIFIER)) {
        // Field
        fields.push(this.parseField())
      } else {
        throw new Error(`Unexpected token in model: ${this.current().type}`)
      }
    }

    this.expect(TokenType.RBRACE)

    return {
      name,
      fields,
      attributes,
    }
  }

  private parseEnum(): PrismaEnum {
    this.expect(TokenType.ENUM)
    const name = this.expect(TokenType.IDENTIFIER).value
    this.expect(TokenType.LBRACE)

    const values: Array<{ name: string }> = []
    const attributes: PrismaAttribute[] = []

    while (!this.match(TokenType.RBRACE, TokenType.EOF)) {
      if (this.match(TokenType.IDENTIFIER)) {
        const valueName = this.advance().value
        values.push({ name: valueName, attributes: [], documentation: undefined })
      } else {
        throw new Error(`Unexpected token in enum: ${this.current().type}`)
      }
    }

    this.expect(TokenType.RBRACE)

    return {
      name,
      values,
      attributes,
    }
  }

  private isScalarType(typeName: string): boolean {
    const scalarTypes = ['String', 'Boolean', 'Int', 'BigInt', 'Float', 'Decimal', 'DateTime', 'Json', 'Bytes']
    return scalarTypes.includes(typeName)
  }

  public parse(): PrismaAst {
    const models: PrismaModel[] = []
    const enums: PrismaEnum[] = []

    while (!this.match(TokenType.EOF)) {
      if (this.match(TokenType.MODEL)) {
        models.push(this.parseModel())
      } else if (this.match(TokenType.ENUM)) {
        enums.push(this.parseEnum())
      } else if (this.match(TokenType.DATASOURCE, TokenType.GENERATOR)) {
        // Skip datasource and generator for now - but parse them properly
        this.advance() // Skip keyword
        this.expect(TokenType.IDENTIFIER) // Skip name
        this.expect(TokenType.LBRACE)
        
        // Parse the block content more carefully
        while (!this.match(TokenType.RBRACE, TokenType.EOF)) {
          if (this.match(TokenType.IDENTIFIER)) {
            this.advance() // Property name
            if (this.match(TokenType.EQUALS)) {
              this.advance() // Skip =
              // Skip the value - could be string, function call, etc.
              if (this.match(TokenType.STRING)) {
                this.advance()
              } else if (this.match(TokenType.IDENTIFIER)) {
                this.advance() // Function name
                if (this.match(TokenType.LPAREN)) {
                  this.advance()
                  // Skip function arguments
                  while (!this.match(TokenType.RPAREN, TokenType.EOF)) {
                    this.advance()
                  }
                  if (this.match(TokenType.RPAREN)) {
                    this.advance()
                  }
                }
              } else {
                this.advance() // Skip other value types
              }
            }
          } else {
            this.advance() // Skip other tokens
          }
        }
        
        this.expect(TokenType.RBRACE)
      } else {
        throw new Error(`Unexpected token at top level: ${this.current().type}`)
      }
    }

    return {
      models,
      enums,
      datasource: undefined,
      generator: undefined,
    }
  }
}

/**
 * Parse a Prisma schema string into an AST
 * @param schemaContent - The Prisma schema file content
 * @returns PrismaAst - Parsed representation of the schema
 */
export function parsePrismaSchema(schemaContent: string): PrismaAst {
  const lexer = new PrismaLexer(schemaContent)
  const tokens = lexer.tokenize()
  const parser = new PrismaParser(tokens)
  return parser.parse()
}