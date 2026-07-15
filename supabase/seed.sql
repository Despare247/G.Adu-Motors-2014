-- Optional: sample inventory so the storefront isn't empty after setup.
-- Run this in the Supabase SQL Editor after schema.sql, or skip it and
-- add real parts from the Admin Dashboard instead.

insert into public.products (name, origin, make, model, year, condition, retail_price, floor_price, image_url)
values
  ('Toyota Corolla Headlight Assembly', 'Japanese', 'Toyota', 'Corolla', 2016, 'Used', 220, 180, null),
  ('Honda Civic Brake Pad Set', 'Japanese', 'Honda', 'Civic', 2018, 'New', 60, 45, null),
  ('Nissan Almera Alternator', 'Japanese', 'Nissan', 'Almera', 2015, 'Used', 250, 200, null),
  ('Hyundai Elantra Rear Bumper', 'Korean', 'Hyundai', 'Elantra', 2019, 'Used', 300, 240, null),
  ('Kia Sportage Side Mirror', 'Korean', 'Kia', 'Sportage', 2020, 'New', 150, 120, null),
  ('Mazda 3 Clutch Kit', 'Japanese', 'Mazda', '3', 2017, 'New', 210, 170, null),
  ('Hyundai Sonata Front Shock Absorber Pair', 'Korean', 'Hyundai', 'Sonata', 2016, 'Used', 180, 140, null),
  ('Kia Picanto Complete Engine', 'Korean', 'Kia', 'Picanto', 2018, 'Used', 900, 750, null);
