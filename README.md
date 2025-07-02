# prisma-tbls

Convert Prisma schema to tbls JSON format for database documentation generation.

## Features

- ✅ Convert Prisma models to tbls tables with columns, constraints, and indexes
- ✅ Extract relations and foreign keys from Prisma schema
- ✅ Convert Prisma enums to tbls enums
- ✅ Support for @id, @unique, @default, @map attributes
- ✅ Automatic snake_case conversion for table/column names
- ✅ Official Prisma DMMF integration for robust parsing

## Installation

```bash
npm install prisma-tbls
```

## Usage

### Prisma Generator
Add the generator to your `schema.prisma`:

```prisma
generator tbls {
  provider = "prisma-tbls-generator"
  output   = "./schema.json"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id    Int     @id @default(autoincrement())
  email String  @unique
  name  String?
  posts Post[]
}

model Post {
  id       Int    @id @default(autoincrement())
  title    String
  content  String?
  authorId Int
  author   User   @relation(fields: [authorId], references: [id])
}
```

Then run:

```bash
npx prisma generate
```

## Output Format

The tool generates tbls-compatible JSON that can be used with [tbls](https://github.com/k1LoW/tbls) for documentation:

```json
{
  "name": "Database Schema",
  "desc": "Generated from Prisma schema using @prisma/generator-helper",
  "tables": [
    {
      "name": "user",
      "type": "table",
      "columns": [
        {
          "name": "id",
          "type": "INTEGER", 
          "nullable": false,
          "default": "autoincrement()"
        }
      ],
      "constraints": [
        {
          "name": "user_pkey",
          "type": "PRIMARY KEY",
          "def": "PRIMARY KEY (id)",
          "table": "user",
          "columns": ["id"]
        }
      ]
    }
  ],
  "relations": [...],
  "enums": [...]
}
```

## Supported Prisma Features

### Data Types
- ✅ String → VARCHAR
- ✅ Int → INTEGER  
- ✅ BigInt → BIGINT
- ✅ Float → FLOAT
- ✅ Decimal → DECIMAL
- ✅ DateTime → DATETIME
- ✅ Boolean → BOOLEAN
- ✅ Json → JSON
- ✅ Bytes → BLOB
- ✅ Enums → Custom enum types
- ✅ Arrays → JSON

### Attributes
- ✅ @id → Primary key constraints
- ✅ @unique → Unique constraints
- ✅ @default → Default values
- ✅ @map → Custom column names
- ✅ @@map → Custom table names
- ✅ @relation → Foreign key relations
- ✅ @@id → Compound primary keys
- ✅ @@unique → Unique field combinations

### Relations
- ✅ One-to-one relations
- ✅ One-to-many relations  
- ✅ Many-to-many relations
- ✅ Self-referential relations
- ✅ Cardinality detection

## Integration with tbls

Use the generated JSON with tbls to create documentation:

```bash
# Generate documentation from JSON
tbls doc json://path/to/schema.json
```

### tbls Configuration

Sample tbls configuration is provided in [tbls.sample.yaml](tbls.sample.yaml).  
For detailed usage, refer to the [tbls documentation](https://github.com/k1LoW/tbls).

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Test
npm test

# Format code
npm run format

# Lint
npm run lint
```

## License

MIT