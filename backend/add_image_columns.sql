-- Add cover image to vendors (logo_url already exists)
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS cover_url VARCHAR(255);

-- Ensure menu_items has an image column (it had image_url in the earlier schema dump)
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS image_url VARCHAR(255);
