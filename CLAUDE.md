# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This project is a **Prisma to tbls JSON converter** that uses official Prisma tools for schema parsing. It provides two usage modes:
1. **Standalone CLI tool**: `prisma-tbls schema.prisma -o output.json`
2. **Prisma Generator**: Add to schema.prisma and run `prisma generate`

The tool converts Prisma schema files to [tbls](https://github.com/k1LoW/tbls) JSON format for database documentation generation.

## Key Technologies & Architecture

- **@prisma/generator-helper**: Official Prisma DMMF parsing for robust schema analysis
- **tbls**: Target JSON schema format for database documentation
- **Dual Build System**: Separate CLI and generator binaries via tsup

## Project Structure

```
src/
├── cli.ts              # Standalone CLI entry point
├── generator.ts        # Prisma generator entry point  
├── index.ts           # Library exports
├── converter/
│   └── dmmf-converter.ts  # DMMF → tbls conversion
└── types/
    └── tbls.ts        # tbls JSON schema types
```

## Development Commands

```bash
# Install dependencies
npm install

# Build both CLI and generator
npm run build

# Run tests
npm test

# Lint and format
npm run lint
npm run format

# Type checking
npm run typecheck
```

## Implementation Approach

### Parsing Strategy
- **Single Approach**: Use `@prisma/generator-helper` DMMF for all parsing
- **Reference**: Follow `references/prisma-markdown/` implementation patterns

### Conversion Pipeline
1. **Parse**: Prisma schema → DMMF via `@prisma/generator-helper`
2. **Convert**: DMMF → tbls JSON format
3. **Output**: JSON compatible with tbls documentation tools

### Data Type Mapping
- Prisma types → SQL equivalents (String→VARCHAR, Int→INTEGER, etc.)
- Arrays → JSON type
- Relations → Foreign key constraints with cardinality

## Build Configuration

- **tsup**: Multiple entry points (cli.ts, generator.ts, index.ts)
- **ES Modules**: `.js` import extensions required
- **Shebang**: CLI binaries get `#!/usr/bin/env node`
- **Dual Binaries**: `prisma-tbls` (CLI) + `prisma-tbls-generator` (generator)

## Testing Strategy

- **Integration Tests**: Full schema conversion tests
- **Unit Tests**: Individual converter components
- **Reference Schemas**: Simple and complex test cases
- **CLI Testing**: Command-line interface validation

## Quality Gates

All commits must pass:
- `npm run build` - TypeScript compilation
- `npm run lint` - ESLint validation  
- `npm run test` - Test suite
- No TypeScript `any` types
- ES Module `.js` import extensions

## Development Principles

- **Type-First**: Define interfaces before implementation
- **TDD**: Write tests before code
- **Single Responsibility**: Clear separation of concerns
- **Official Tools**: Use only Prisma official packages for parsing
- **DMMF-First**: All schema parsing goes through official DMMF