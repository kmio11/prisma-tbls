# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This project is a **Prisma Generator** that integrates with **tbls** (table documentation tool) to automatically generate database documentation from Prisma schemas. The generator creates `.tbls.yml` configuration files and runs tbls to produce comprehensive database documentation in various formats (Markdown, ER diagrams, etc.).

## Key Technologies

- **Prisma**: Database toolkit and ORM for TypeScript/JavaScript
- **tbls**: CI-friendly tool for documenting databases, written in Go
- **@prisma/generator-helper**: Official Prisma package for building custom generators

## Development Commands

```bash
# Install dependencies
npm install

# Run tests (when implemented)
npm test

# Lint code
npm run lint

# Format code
npm run format

# Build/compile
npm run build
```

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
- **React 17+ JSX**: No React imports needed for JSX (properly configured)
- **Zero Any Types**: All `any` types replaced with proper type definitions
- **Strict TypeScript**: All compiler warnings treated as errors
- **Environment Types**: Proper `import.meta.env` type definitions created

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

## Testing Strategy
- **Unit Tests**: Vitest for component/function testing