-- 0002_encryption.up.sql
-- Adds at-rest encryption metadata for files.
-- Files are encrypted with AES-256-CTR (seekable, so HTTP Range works over
-- decrypted downloads); nonce holds the hex-encoded 16-byte IV.
-- shares.token stores the SHA-256 hex of the raw share token (never the raw
-- token), so no schema change is needed there.

ALTER TABLE files
    ADD COLUMN IF NOT EXISTS nonce TEXT NOT NULL DEFAULT '',
    ADD COLUMN IF NOT EXISTS enc_alg TEXT NOT NULL DEFAULT 'aes-256-ctr';
