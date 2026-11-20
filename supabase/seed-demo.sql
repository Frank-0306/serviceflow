-- OPTIONAL demo data so the dashboard charts have something to show.
-- Every row is fictional, uses example.com addresses and 555-01xx numbers,
-- and is tagged source = 'demo-seed' so you can remove it later:
--   delete from public.service_requests where source = 'demo-seed';
--
-- Run in the SQL Editor AFTER the migration. Safe to skip.

with names(first_name, last_name, city) as (
  values
    ('Avery', 'Morgan', 'Springfield'), ('Jordan', 'Reyes', 'Fairview'), ('Casey', 'Nguyen', 'Riverside'),
    ('Riley', 'Brooks', 'Springfield'), ('Taylor', 'Patel', 'Greenville'), ('Morgan', 'Kim', 'Fairview'),
    ('Quinn', 'Foster', 'Madison'), ('Drew', 'Alvarez', 'Riverside'), ('Jamie', 'Coleman', 'Franklin'),
    ('Parker', 'Hayes', 'Greenville'), ('Rowan', 'Bennett', 'Madison'), ('Skyler', 'Ortiz', 'Franklin'),
    ('Emerson', 'Price', 'Springfield'), ('Reese', 'Ward', 'Fairview'), ('Hayden', 'Ross', 'Riverside'),
    ('Sawyer', 'Long', 'Madison'), ('Finley', 'Diaz', 'Greenville'), ('Kendall', 'James', 'Franklin'),
    ('Logan', 'Perry', 'Springfield'), ('Blake', 'Russell', 'Fairview'), ('Cameron', 'Sanders', 'Riverside'),
    ('Peyton', 'Hughes', 'Madison'), ('Dakota', 'Flores', 'Greenville'), ('Harper', 'Butler', 'Franklin')
),
numbered as (
  select n.*, row_number() over () as i from names n
),
base_rows as (
  select
    i,
    first_name, last_name, city,
    (array['regular','regular','deep','move','office','regular','deep'])[1 + (i % 7)]::public.service_type as service,
    (array['new','new','contacted','scheduled','completed','completed','cancelled','scheduled'])[1 + (i % 8)]::public.request_status as status,
    now() - ((i * 29) % 30) * interval '1 day' - (i * 37 % 600) * interval '1 minute' as created_at,
    (1 + i % 4) as bedrooms,
    (1 + i % 3) as bathrooms,
    (900 + (i * 173) % 2400) as sqft
  from numbered
)
insert into public.service_requests (
  reference, created_at, status, source,
  first_name, last_name, email, phone,
  street, city, zip, preferred_date, time_window,
  service, frequency, quote_input, quote_lines,
  subtotal_cents, discount_cents, total_cents, labor_hours_min, labor_hours_max
)
select
  'BN-' || to_char(created_at, 'YYMMDD') || '-' || upper(substr(md5(i::text || 'seed'), 1, 4)),
  created_at,
  status,
  'demo-seed',
  first_name,
  last_name,
  lower(first_name || '.' || last_name) || '@example.com',
  '(555) 010-' || lpad((100 + i)::text, 4, '0'),
  (100 + i * 7) || ' Demo Street',
  city,
  lpad((10000 + i * 311)::text, 5, '0'),
  (created_at + interval '5 days')::date,
  (array['morning','midday','afternoon'])[1 + (i % 3)]::public.time_window,
  service,
  case when service in ('regular', 'office') then 'biweekly' else 'one-time' end,
  jsonb_build_object('service', service, 'bedrooms', bedrooms, 'bathrooms', bathrooms, 'sqft', sqft, 'note', 'demo seed'),
  jsonb_build_array(jsonb_build_object('id', 'base', 'label', 'Demo seed estimate', 'amount', 0)),
  base_cents,
  case when service in ('regular', 'office') then round(base_cents * 0.15 / 100) * 100 else 0 end,
  base_cents - case when service in ('regular', 'office') then round(base_cents * 0.15 / 100) * 100 else 0 end,
  2.5 + bedrooms * 0.5,
  3.5 + bedrooms * 0.5
from (
  select r.*,
    (case r.service
       when 'regular' then 9500 + r.bedrooms * 1500 + r.bathrooms * 2000
       when 'deep'    then 17500 + r.bedrooms * 2500 + r.bathrooms * 3500
       when 'move'    then 21000 + r.bedrooms * 3000 + r.bathrooms * 4000
       else 13000 + r.bathrooms * 2500
     end
     + greatest(0, ceil((r.sqft - 1000) / 500.0))::int * 2000)::int as base_cents
  from base_rows r
) s;
