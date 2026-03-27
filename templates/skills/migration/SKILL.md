---
name: migration
description: Plan and execute database or framework migrations with rollback strategies
license: MIT
compatibility: opencode
metadata:
  audience: developers
  workflow: general
---

## What I do

- Analyze current schema or framework version
- Plan migration steps with proper ordering
- Generate migration files in the project's format
- Create rollback strategies for each step
- Validate data integrity considerations

## When to use me

Use this skill when you need to:
- Create database migrations (schema changes, data migrations)
- Upgrade a framework or library to a new major version
- Migrate from one technology to another (e.g., ORM switch)

## Database Migration Process

1. **Analyze**: Read current schema and understand relationships
2. **Plan**: List all changes needed, order by dependencies
3. **Generate**: Create migration files in the project's format:
   - Prisma: `prisma/migrations/`
   - TypeORM: `src/migrations/`
   - Django: `app/migrations/`
   - Flyway: `db/migration/`
   - Liquibase: `db/changelog/`
4. **Rollback**: For each migration, create the inverse operation
5. **Validate**: Check for data loss risks and foreign key constraints

## Framework Migration Process

1. **Inventory**: List all breaking changes from changelog
2. **Assess**: Identify affected code in the project
3. **Plan**: Create ordered list of changes
4. **Execute**: Make changes incrementally
5. **Test**: Verify after each step

## Migration File Template

```sql
-- Migration: description
-- Created: YYYY-MM-DD
-- Author: [generated]

-- UP
ALTER TABLE ...;

-- DOWN (rollback)
ALTER TABLE ...;
```

## Rules

- Always include rollback/down migrations
- Never drop columns without data backup strategy
- Consider zero-downtime migration patterns for production
- Test migrations on a copy of production data
- Document any manual steps required
