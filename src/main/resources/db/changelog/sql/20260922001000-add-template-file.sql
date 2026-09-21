ALTER TABLE presentation.templates
    ADD COLUMN IF NOT EXISTS file_name VARCHAR(255);

ALTER TABLE presentation.templates
    ADD COLUMN IF NOT EXISTS file_bytes BYTEA;
