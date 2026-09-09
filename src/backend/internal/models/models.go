package models

import (
	"time"

	"github.com/google/uuid"
)

type User struct {
	ID           uuid.UUID `json:"id"`
	Email        string    `json:"email"`
	PasswordHash string    `json:"-"`
	CreatedAt    time.Time `json:"created_at"`
}

type File struct {
	ID          uuid.UUID `json:"id"`
	OwnerID     uuid.UUID `json:"owner_id"`
	Filename    string    `json:"filename"`
	SizeBytes   int64     `json:"size_bytes"` // plaintext size
	ContentType string    `json:"content_type"`
	StoragePath string    `json:"-"`
	Nonce       string    `json:"-"` // hex-encoded 16-byte CTR IV
	EncAlg      string    `json:"-"`
	SHA256      string    `json:"sha256"` // hex of plaintext
	CreatedAt   time.Time `json:"created_at"`
}

type Share struct {
	ID        uuid.UUID  `json:"id"`
	FileID    uuid.UUID  `json:"file_id"`
	Token     string     `json:"-"` // stores SHA-256 hex of the raw token, never the raw token
	ExpiresAt *time.Time `json:"expires_at,omitempty"`
	Revoked   bool       `json:"revoked"`
	CreatedAt time.Time  `json:"created_at"`
}