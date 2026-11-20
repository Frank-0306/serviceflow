-- Run once in Supabase SQL Editor if you created the tables before this fix.
grant select, insert on public.service_requests to service_role;
grant select on public.request_status_events, public.admins to service_role;
