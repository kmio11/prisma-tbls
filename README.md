# prisma-tbls

Generate beautiful database documentation from your Prisma schema using [tbls](https://github.com/k1LoW/tbls).

This Prisma generator automatically converts your Prisma schema to tbls JSON format, allowing you to create comprehensive database documentation with diagrams, tables, and relationship visualization.

## Quick Start

### 1. Install the generator

```bash
npm install prisma-tbls
```

### 2. Add the generator to your schema

Add this to your `schema.prisma` file:

```prisma
generator tbls {
  provider = "prisma-tbls-generator" 
  output   = "./docs/schema.json"
}

// Your existing datasource and models
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
  
  @@index([authorId])
  @@index([title, authorId])
}
```

### 3. Generate the documentation schema

```bash
npx prisma generate
```

This creates a `docs/schema.json` file compatible with tbls.

### 4. Create documentation with tbls

Install tbls following the [tbls installation guide](https://github.com/k1LoW/tbls), then generate your documentation:

```bash
# Generate HTML documentation
tbls doc json://docs/schema.json
```

The `json://` prefix tells tbls to use the file as a JSON Datasource, allowing you to generate documentation without connecting to a live database.

## Examples

See the [sample/](sample/) directory for a comprehensive example with:
- Complex Prisma schema demonstrating all features
- Generated tbls JSON output
- Complete documentation generated with tbls

A sample tbls configuration is provided in [tbls.sample.yaml](tbls.sample.yaml), which uses the generated JSON file as a datasource.
For complete tbls documentation, visit [tbls documentation](https://github.com/k1LoW/tbls).

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
      ],
      "indexes": [
        {
          "name": "post_author_id_idx",
          "def": "CREATE INDEX post_author_id_idx ON post (author_id)",
          "table": "post",
          "columns": ["author_id"],
          "comment": ""
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
- ✅ @@index → Database indexes

### Indexes
- ✅ @@index([field]) → Single field indexes
- ✅ @@index([field1, field2]) → Composite indexes
- ✅ Custom index names
- ✅ Index definitions in tbls format

### Relations
- ✅ One-to-one relations
- ✅ One-to-many relations  
- ✅ Many-to-many relations
- ✅ Self-referential relations
- ✅ Cardinality detection
