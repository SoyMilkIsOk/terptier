# Supabase Policies

This folder contains SQL snippets for row level security (RLS) configuration.

Run these statements in your Supabase project to apply the policies.

## Policies

The `policies.sql` file contains statements to enable RLS and define rules for the new tables added in this release:

- `ProducerAdmin`
- `Strain`
- `Notification`
- `NotificationJob`
- `NotificationPreference`

### Strain
- Producer admins can insert, update and delete strains that belong to their producer via the `ProducerAdmin` join table.
- Support or admin roles can read all strains.

### Notifications
- Support or admin roles can read all `Notification` and `NotificationJob` rows.

### NotificationPreference
- Users may update only their own notification preference row.

Execute the SQL file after deploying migrations:

```bash
psql $SUPABASE_DB < supabase/policies.sql
```
