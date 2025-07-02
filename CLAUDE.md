# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This project is a **Prisma to tbls JSON converter** that uses official Prisma tools for schema parsing. It provides two usage modes:
1. **Standalone CLI tool**: `npx prisma-tbls --schema schema.prisma --out output.json`
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

# Test CLI locally
npm run build
./dist/cli.js --schema sample/sample.prisma --out test.json

# Test with npm link for global install
npm link
prisma-tbls --schema schema.prisma --out output.json
```

## Implementation Approach

### Parsing Strategy
- **Single Approach**: Use `@prisma/generator-helper` DMMF for all parsing

### Conversion Pipeline
1. **Parse**: Prisma schema → DMMF via `@prisma/generator-helper`
2. **Convert**: DMMF → tbls JSON format
3. **Output**: JSON compatible with tbls documentation tools

### Data Type Mapping
- Prisma types → SQL equivalents (String→VARCHAR, Int→INTEGER, etc.)
- Arrays → JSON type
- Relations → Foreign key constraints with cardinality

## Testing Strategy

- **Integration Tests**: Full schema conversion tests
- **Unit Tests**: Individual converter components.
- **Reference Schemas**: Simple and complex test cases
- **Sample Documentation**: Comprehensive real-world schema example

### Unit tests
- Use `vitest` for unit tests
- `*.test.ts` files in the same directory as the code being tested.

## Quality Gates

All commits must pass:
- `npm run build` - TypeScript compilation
- `npm run lint` - ESLint validation  
- `npm run test` - Test suite
- No TypeScript `any` types
- ES Module `.js` import extensions

## Coding Standards

### Development Principles
- **Zero Tolerance Quality**: All commits must pass quality gates
- **No Mock/Hardcoded Data**: Remove all mocks and hardcoded data from production code
- **Build-First Verification**: Never declare completion without successful build
- **TDD Approach**: Write tests first, then implement

### General Principles
- **Single Responsibility**: Each function/component has one clear purpose
- **Type-First Development**: Define interfaces before implementation
- **Functional Programming**: Pure functions and immutable data patterns
- **Self-Documenting Code**: Clear naming conventions over excessive comments

### TypeScript Standards
- File naming: `src/<lower-snake-case>.ts`
- **ES Module Support**: All imports use `.js` extensions for ESM compatibility
- **Node.js Imports**: Use `node:` prefix (e.g., `import fs from 'node:fs'`)
- **Zero Any Types**: All `any` types replaced with proper type definitions
- **Strict TypeScript**: All compiler warnings treated as errors

### Project-Specific Principles
- **Official Tools**: Use only Prisma official packages for parsing
- **DMMF-First**: All schema parsing goes through official DMMF
- **Single Source**: No custom parsers or fallback implementations
- **Go Integration**: Use Go toolchain for tbls dependency management
- **Sample-Driven**: Maintain comprehensive sample documentation

## Development Loop

Follow this Test-Driven Development cycle for all features:

1. **Red**: Write a failing test first
   - Clearly define expected behavior
   - Test should fail initially (no implementation yet)
   - Use descriptive test names and assertions

2. **Green**: Write minimal code to make test pass
   - Implement only what's needed for the test
   - Don't optimize or add extra features
   - Focus on making the test pass quickly

3. **Refactor**: Clean up and improve code
   - Maintain all tests passing
   - Improve code structure and readability
   - Remove all hardcoded data and mocks
   - Remove duplication and improve design

4. **Verify**: Run quality checks
   - `npm run lint` - Fix code style issues
   - `npm run build` - Ensure compilation succeeds
   - `npm run typecheck` - Verify TypeScript types
   - `npm test` - Run full test suite

**Key TDD Principles**:
- Never write production code without a failing test
- Write the simplest test that could possibly fail
- Write the simplest code that could possibly pass
- Refactor ruthlessly while keeping tests green