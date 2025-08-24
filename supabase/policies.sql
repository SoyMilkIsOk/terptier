-- Enable RLS on new tables
alter table "public"."ProducerAdmin" enable row level security;
alter table "public"."Strain" enable row level security;

-- Strain policies
create policy "producer-admin-manage-strains" on "public"."Strain"
  for all
  using (
    exists (
      select 1 from "public"."ProducerAdmin" pa
      where pa."userId"::uuid = (select auth.uid())
        and pa."producerId" = "Strain"."producerId"
    )
  )
  with check (
    exists (
      select 1 from "public"."ProducerAdmin" pa
      where pa."userId"::uuid = (select auth.uid())
        and pa."producerId" = "Strain"."producerId"
    )
  );

create policy "support-admin-read-strains" on "public"."Strain"
  for select using (auth.role() in ('ADMIN','SUPPORT'));

