# Prisma to tbls JSON Converter - Implementation Tasks

## Project Overview
Create an npx-executable command-line tool that converts Prisma schema files to tbls JSON format for database documentation generation.

## Implementation Phases

### Phase 1: Project Setup and Infrastructure
- [ ] **1.1** Set up TypeScript configuration for ES modules
- [ ] **1.2** Configure package.json for npx execution (bin field)
- [ ] **1.3** Set up build system (tsup/rollup for bundling)
- [ ] **1.4** Create basic CLI structure with argument parsing
- [ ] **1.5** Set up testing framework (vitest)
- [ ] **1.6** Create project directory structure

### Phase 2: Type Definitions
- [ ] **2.1** Define tbls JSON schema TypeScript interfaces
- [ ] **2.2** Define Prisma AST TypeScript interfaces
- [ ] **2.3** Create utility types for conversion mapping
- [ ] **2.4** Set up validation schemas

### Phase 3: Prisma Schema Parser
- [ ] **3.1** Implement Prisma schema file reader
- [ ] **3.2** Create Prisma schema lexer/tokenizer
- [ ] **3.3** Build Prisma AST parser for models
- [ ] **3.4** Parse Prisma field definitions and attributes
- [ ] **3.5** Parse Prisma enum definitions
- [ ] **3.6** Parse Prisma relation definitions
- [ ] **3.7** Handle Prisma comments and documentation

### Phase 4: Core Conversion Engine
- [ ] **4.1** Create main schema converter class
- [ ] **4.2** Implement model-to-table conversion
- [ ] **4.3** Implement field-to-column conversion with data type mapping
- [ ] **4.4** Handle nullable fields and default values
- [ ] **4.5** Convert Prisma attributes to tbls properties
- [ ] **4.6** Process table comments from Prisma documentation

### Phase 5: Relation Conversion
- [ ] **5.1** Detect and parse Prisma @relation attributes
- [ ] **5.2** Convert one-to-one relationships
- [ ] **5.3** Convert one-to-many relationships
- [ ] **5.4** Convert many-to-many relationships (through junction tables)
- [ ] **5.5** Handle self-referential relationships
- [ ] **5.6** Generate foreign key constraints
- [ ] **5.7** Determine cardinality mappings

### Phase 6: Advanced Features
- [ ] **6.1** Convert Prisma enums to tbls enums
- [ ] **6.2** Handle Prisma indexes (@index, @@index)
- [ ] **6.3** Convert Prisma unique constraints (@unique, @@unique)
- [ ] **6.4** Process Prisma @@map() for custom table names
- [ ] **6.5** Process Prisma @map() for custom column names
- [ ] **6.6** Handle Prisma @@id() compound primary keys

### Phase 7: Data Type Mapping
- [ ] **7.1** Map Prisma String to SQL VARCHAR/TEXT
- [ ] **7.2** Map Prisma Int to SQL INTEGER
- [ ] **7.3** Map Prisma BigInt to SQL BIGINT
- [ ] **7.4** Map Prisma Float to SQL FLOAT/DOUBLE
- [ ] **7.5** Map Prisma Decimal to SQL DECIMAL
- [ ] **7.6** Map Prisma DateTime to SQL DATETIME/TIMESTAMP
- [ ] **7.7** Map Prisma Boolean to SQL BOOLEAN
- [ ] **7.8** Map Prisma Json to SQL JSON
- [ ] **7.9** Handle Prisma Bytes type
- [ ] **7.10** Support database-specific type variations

### Phase 8: CLI Interface
- [ ] **8.1** Implement command-line argument parsing
- [ ] **8.2** Add input file path validation
- [ ] **8.3** Add output file path options
- [ ] **8.4** Create help and usage messages
- [ ] **8.5** Add verbose/debug logging options
- [ ] **8.6** Handle error messages and exit codes
- [ ] **8.7** Add JSON formatting options (pretty print)

### Phase 9: Validation and Error Handling
- [ ] **9.1** Validate Prisma schema syntax
- [ ] **9.2** Validate generated tbls JSON against schema
- [ ] **9.3** Add comprehensive error messages
- [ ] **9.4** Handle missing or invalid input files
- [ ] **9.5** Validate data type compatibility
- [ ] **9.6** Handle edge cases in schema parsing

### Phase 10: Testing
- [ ] **10.1** Create unit tests for parser components
- [ ] **10.2** Create unit tests for converter components
- [ ] **10.3** Create integration tests with sample Prisma schemas
- [ ] **10.4** Test CLI interface with various arguments
- [ ] **10.5** Test error handling and edge cases
- [ ] **10.6** Create test fixtures and golden files
- [ ] **10.7** Performance testing with large schemas

### Phase 11: Documentation and Polish
- [ ] **11.1** Write comprehensive README with usage examples
- [ ] **11.2** Add JSDoc comments to all functions
- [ ] **11.3** Create example Prisma schemas and outputs
- [ ] **11.4** Set up automated testing in CI
- [ ] **11.5** Configure code formatting and linting
- [ ] **11.6** Optimize bundle size for npx usage

### Phase 12: Advanced Features (Optional)
- [ ] **12.1** Support for multiple Prisma schema files
- [ ] **12.2** Configuration file support
- [ ] **12.3** Custom data type mapping configuration
- [ ] **12.4** Integration with tbls CLI for direct documentation generation
- [ ] **12.5** Watch mode for development
- [ ] **12.6** Support for Prisma schema URLs/remote schemas

## Data Type Mapping Reference

| Prisma Type | tbls JSON Type | SQL Equivalent |
|-------------|----------------|----------------|
| String      | string         | VARCHAR/TEXT   |
| Int         | integer        | INTEGER        |
| BigInt      | bigint         | BIGINT         |
| Float       | float          | FLOAT/DOUBLE   |
| Decimal     | decimal        | DECIMAL        |
| DateTime    | datetime       | DATETIME       |
| Boolean     | boolean        | BOOLEAN        |
| Json        | json           | JSON           |
| Bytes       | bytes          | BLOB           |

## Cardinality Mapping Reference

| Prisma Relation | tbls Cardinality |
|-----------------|------------------|
| 1:1 required    | exactly_one      |
| 1:1 optional    | zero_or_one      |
| 1:many          | zero_or_more     |
| many:many       | zero_or_more     |

## Project Structure
```
src/
├── cli.ts              # CLI entry point
├── parser/
│   ├── prisma.ts       # Prisma schema parser
│   ├── lexer.ts        # Tokenizer for Prisma syntax
│   └── types.ts        # Prisma AST types
├── converter/
│   ├── schema.ts       # Main schema converter
│   ├── table.ts        # Table conversion logic
│   ├── column.ts       # Column conversion logic
│   ├── relation.ts     # Relation conversion logic
│   ├── enum.ts         # Enum conversion logic
│   └── mapping.ts      # Data type mapping utilities
├── types/
│   ├── tbls.ts         # tbls JSON schema types
│   └── config.ts       # Configuration types
├── utils/
│   ├── file.ts         # File I/O utilities
│   ├── validation.ts   # Schema validation
│   └── logger.ts       # Logging utilities
└── __tests__/
    ├── parser/         # Parser tests
    ├── converter/      # Converter tests
    ├── integration/    # Integration tests
    └── fixtures/       # Test data
```

## Current Status
- [x] Project planning and task breakdown
- [ ] Implementation in progress

## Notes
- Follow TDD approach: write tests first, then implement
- Use strict TypeScript configuration
- Ensure all code is properly typed (no `any` types)
- Follow the coding standards defined in CLAUDE.md
- Run `npm run build` and `npm run lint` before completing tasks