/**
 * Simple lexer for Prisma schema syntax
 */

export enum TokenType {
  // Literals
  IDENTIFIER = 'IDENTIFIER',
  STRING = 'STRING',
  NUMBER = 'NUMBER',
  BOOLEAN = 'BOOLEAN',
  
  // Keywords
  MODEL = 'MODEL',
  ENUM = 'ENUM',
  DATASOURCE = 'DATASOURCE',
  GENERATOR = 'GENERATOR',
  
  // Symbols
  LBRACE = 'LBRACE',      // {
  RBRACE = 'RBRACE',      // }
  LPAREN = 'LPAREN',      // (
  RPAREN = 'RPAREN',      // )
  LBRACKET = 'LBRACKET',  // [
  RBRACKET = 'RBRACKET',  // ]
  AT = 'AT',              // @
  ATAT = 'ATAT',          // @@
  QUESTION = 'QUESTION',  // ?
  COLON = 'COLON',        // :
  COMMA = 'COMMA',        // ,
  EQUALS = 'EQUALS',      // =
  
  // Special
  NEWLINE = 'NEWLINE',
  COMMENT = 'COMMENT',
  DOC_COMMENT = 'DOC_COMMENT',
  EOF = 'EOF',
  WHITESPACE = 'WHITESPACE',
}

export interface Token {
  type: TokenType
  value: string
  line: number
  column: number
}

export class PrismaLexer {
  private input: string
  private position: number = 0
  private line: number = 1
  private column: number = 1

  constructor(input: string) {
    this.input = input
  }

  private current(): string {
    return this.input[this.position] || ''
  }

  private peek(offset: number = 1): string {
    return this.input[this.position + offset] || ''
  }

  private advance(): void {
    if (this.current() === '\\n') {
      this.line++
      this.column = 1
    } else {
      this.column++
    }
    this.position++
  }

  private skipWhitespace(): void {
    while (this.position < this.input.length && /\\s/.test(this.current()) && this.current() !== '\\n') {
      this.advance()
    }
  }

  private readString(): string {
    let value = ''
    const quote = this.current()
    this.advance() // Skip opening quote
    
    while (this.position < this.input.length && this.current() !== quote) {
      if (this.current() === '\\\\') {
        this.advance()
        if (this.position < this.input.length) {
          value += this.current()
          this.advance()
        }
      } else {
        value += this.current()
        this.advance()
      }
    }
    
    if (this.current() === quote) {
      this.advance() // Skip closing quote
    }
    
    return value
  }

  private readNumber(): string {
    let value = ''
    
    while (this.position < this.input.length && /[0-9.]/.test(this.current())) {
      value += this.current()
      this.advance()
    }
    
    return value
  }

  private readIdentifier(): string {
    let value = ''
    
    while (this.position < this.input.length && 
           (/[a-zA-Z0-9_]/.test(this.current()) || this.current() === '_')) {
      value += this.current()
      this.advance()
    }
    
    return value
  }

  private readComment(): string {
    let value = ''
    
    if (this.current() === '/' && this.peek() === '/') {
      // Single line comment
      this.advance() // Skip first /
      this.advance() // Skip second /
      
      while (this.position < this.input.length && this.current() !== '\\n') {
        value += this.current()
        this.advance()
      }
    }
    
    return value.trim()
  }

  private readDocComment(): string {
    let value = ''
    
    if (this.current() === '/' && this.peek() === '/' && this.peek(2) === '/') {
      // Doc comment
      this.advance() // Skip first /
      this.advance() // Skip second /
      this.advance() // Skip third /
      
      while (this.position < this.input.length && this.current() !== '\\n') {
        value += this.current()
        this.advance()
      }
    }
    
    return value.trim()
  }

  public tokenize(): Token[] {
    const tokens: Token[] = []
    
    while (this.position < this.input.length) {
      const startLine = this.line
      const startColumn = this.column
      
      this.skipWhitespace()
      
      if (this.position >= this.input.length) {
        break
      }
      
      const char = this.current()
      
      // Handle newlines
      if (char === '\\n') {
        tokens.push({
          type: TokenType.NEWLINE,
          value: char,
          line: startLine,
          column: startColumn
        })
        this.advance()
        continue
      }
      
      // Handle doc comments (///)
      if (char === '/' && this.peek() === '/' && this.peek(2) === '/') {
        const value = this.readDocComment()
        tokens.push({
          type: TokenType.DOC_COMMENT,
          value,
          line: startLine,
          column: startColumn
        })
        continue
      }
      
      // Handle comments (//)
      if (char === '/' && this.peek() === '/') {
        const value = this.readComment()
        tokens.push({
          type: TokenType.COMMENT,
          value,
          line: startLine,
          column: startColumn
        })
        continue
      }
      
      // Handle strings
      if (char === '"' || char === "'") {
        const value = this.readString()
        tokens.push({
          type: TokenType.STRING,
          value,
          line: startLine,
          column: startColumn
        })
        continue
      }
      
      // Handle numbers
      if (/[0-9]/.test(char)) {
        const value = this.readNumber()
        tokens.push({
          type: TokenType.NUMBER,
          value,
          line: startLine,
          column: startColumn
        })
        continue
      }
      
      // Handle symbols
      switch (char) {
        case '{':
          tokens.push({ type: TokenType.LBRACE, value: char, line: startLine, column: startColumn })
          this.advance()
          continue
        case '}':
          tokens.push({ type: TokenType.RBRACE, value: char, line: startLine, column: startColumn })
          this.advance()
          continue
        case '(':
          tokens.push({ type: TokenType.LPAREN, value: char, line: startLine, column: startColumn })
          this.advance()
          continue
        case ')':
          tokens.push({ type: TokenType.RPAREN, value: char, line: startLine, column: startColumn })
          this.advance()
          continue
        case '[':
          tokens.push({ type: TokenType.LBRACKET, value: char, line: startLine, column: startColumn })
          this.advance()
          continue
        case ']':
          tokens.push({ type: TokenType.RBRACKET, value: char, line: startLine, column: startColumn })
          this.advance()
          continue
        case '@':
          if (this.peek() === '@') {
            tokens.push({ type: TokenType.ATAT, value: '@@', line: startLine, column: startColumn })
            this.advance()
            this.advance()
          } else {
            tokens.push({ type: TokenType.AT, value: char, line: startLine, column: startColumn })
            this.advance()
          }
          continue
        case '?':
          tokens.push({ type: TokenType.QUESTION, value: char, line: startLine, column: startColumn })
          this.advance()
          continue
        case ':':
          tokens.push({ type: TokenType.COLON, value: char, line: startLine, column: startColumn })
          this.advance()
          continue
        case ',':
          tokens.push({ type: TokenType.COMMA, value: char, line: startLine, column: startColumn })
          this.advance()
          continue
        case '=':
          tokens.push({ type: TokenType.EQUALS, value: char, line: startLine, column: startColumn })
          this.advance()
          continue
      }
      
      // Handle identifiers and keywords
      if (/[a-zA-Z_]/.test(char)) {
        const value = this.readIdentifier()
        let type = TokenType.IDENTIFIER
        
        // Check for keywords
        switch (value.toLowerCase()) {
          case 'model':
            type = TokenType.MODEL
            break
          case 'enum':
            type = TokenType.ENUM
            break
          case 'datasource':
            type = TokenType.DATASOURCE
            break
          case 'generator':
            type = TokenType.GENERATOR
            break
          case 'true':
          case 'false':
            type = TokenType.BOOLEAN
            break
        }
        
        tokens.push({
          type,
          value,
          line: startLine,
          column: startColumn
        })
        continue
      }
      
      // Skip unknown characters
      this.advance()
    }
    
    tokens.push({
      type: TokenType.EOF,
      value: '',
      line: this.line,
      column: this.column
    })
    
    return tokens
  }
}