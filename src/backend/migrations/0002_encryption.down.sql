-- 0002_encryption.down.sql
-- Reverses 0002_encryption.up.sql

ALTER TABLE files
    DROP COLUMN IF EXISTS enc_alg,
    DROP COLUMN IF EXISTS nonce;
