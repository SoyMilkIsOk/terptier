-- Enable RLS on new tables
alter table "public"."ProducerAdmin" enable row level security;
alter table "public"."Strain" enable row level security;
alter table "public"."Notification" enable row level security;
alter table "public"."NotificationJob" enable row level security;
alter table "public"."NotificationPreference" enable row level security;

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

-- Notification policies
create policy "support-admin-read-notifications" on "public"."Notification"
  for select using (auth.role() in ('ADMIN','SUPPORT'));

create policy "support-admin-read-notification-jobs" on "public"."NotificationJob"
  for select using (auth.role() in ('ADMIN','SUPPORT'));

-- NotificationPreference policies
create policy "user-update-own-preference" on "public"."NotificationPreference"
  for update
  using ((select auth.uid()) = "NotificationPreference"."userId"::uuid)
  with check ((select auth.uid()) = "NotificationPreference"."userId"::uuid);