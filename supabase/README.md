# Supabase Policies

This folder contains SQL snippets for row level security (RLS) configuration.

Run these statements in your Supabase project to apply the policies.

## Policies

The `policies.sql` file contains statements to enable RLS and define rules for the new tables added in this release:

- `ProducerAdmin`
- `Strain`

### Strain
- Producer admins can insert, update and delete strains that belong to their producer via the `ProducerAdmin` join table.
- Support or admin roles can read all strains.

Execute the SQL file after deploying migrations:

```bash
psql $SUPABASE_DB < supabase/policies.sql
```
