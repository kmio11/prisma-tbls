# Sample Prisma Schema

This directory contains a comprehensive sample Prisma schema for testing and demonstration purposes.

## File

### `sample.prisma`
A comprehensive schema demonstrating all major Prisma features:

**Data Types**: All Prisma scalar types including BigInt, Json, DateTime
**Constraints**: Primary keys, unique constraints, foreign keys
**Indexes**: Single column and composite indexes
**Relations**: 
- One-to-one (User ↔ UserProfile)
- One-to-many (User → Posts, Category → Posts)
- Many-to-many (Post ↔ Category, Post ↔ Tag)
- Self-referential (Category hierarchy, Comment replies)

**Advanced Features**:
- Composite unique constraints (`@@unique`)
- Composite primary keys (`@@id`)
- Custom column names (`@map`)
- Custom table names (`@@map`)
- Database-specific types (`@db.VarChar`, `@db.Text`)
- Default values and auto-increment
- Cascade delete relationships
- Multiple enum types

## Testing Usage

### Generator Mode
```bash
cd sample
npx prisma generate --schema=sample.prisma
```

This will generate `generated-schema.json` with the tbls JSON output.

### Manual Testing
Use this schema to test the converter with various Prisma features:
```bash
# Test with the comprehensive schema
node ../dist/generator.js sample.prisma
```

## Schema Features Coverage

| Feature | Coverage |
|---------|----------|
| Primary Keys | ✅ |
| Foreign Keys | ✅ |
| Unique Constraints | ✅ |
| Composite Constraints | ✅ |
| Indexes | ✅ |
| Enums | ✅ |
| Self-References | ✅ |
| Many-to-Many | ✅ |
| JSON Fields | ✅ |
| Custom Mapping | ✅ |
| Cascade Deletes | ✅ |
| BigInt Support | ✅ |
| Database Types | ✅ |