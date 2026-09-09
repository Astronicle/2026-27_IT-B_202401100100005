package files

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"time"

	"github.com/google/uuid"

	"github.com/Astronicle/poryflux/backend/internal/models"
)

var (
	ErrFileNotFound  = errors.New("file not found")
	ErrShareNotFound = errors.New("share not found")
)

type Repository struct {
	db *sql.DB
}

func NewRepository(db *sql.DB) *Repository {
	return &Repository{db: db}
}

func scanFile(row interface {
	Scan(dest ...any) error
}) (*models.File, error) {
	var f models.File
	err := row.Scan(
		&f.ID,
		&f.OwnerID,
		&f.Filename,
		&f.SizeBytes,
		&f.ContentType,
		&f.StoragePath,
		&f.Nonce,
		&f.EncAlg,
		&f.SHA256,
		&f.CreatedAt,
	)
	if err != nil {
		return nil, err
	}
	return &f, nil
}

const fileColumns = `id, owner_id, filename, size_bytes, content_type, storage_path, nonce, enc_alg, sha256, created_at`

func (r *Repository) CreateFile(ctx context.Context, f *models.File) (*models.File, error) {
	const q = `
		INSERT INTO files (id, owner_id, filename, size_bytes, content_type, storage_path, nonce, enc_alg, sha256)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
		RETURNING ` + fileColumns

	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	out, err := scanFile(r.db.QueryRowContext(ctx, q,
		f.ID, f.OwnerID, f.Filename, f.SizeBytes, f.ContentType,
		f.StoragePath, f.Nonce, f.EncAlg, f.SHA256,
	))
	if err != nil {
		return nil, fmt.Errorf("insert file: %w", err)
	}
	return out, nil
}

func (r *Repository) GetFileByID(ctx context.Context, id uuid.UUID) (*models.File, error) {
	const q = `SELECT ` + fileColumns + ` FROM files WHERE id = $1`

	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	f, err := scanFile(r.db.QueryRowContext(ctx, q, id))
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrFileNotFound
		}
		return nil, fmt.Errorf("query file: %w", err)
	}
	return f, nil
}

func (r *Repository) ListFilesByOwner(ctx context.Context, ownerID uuid.UUID) ([]models.File, error) {
	const q = `SELECT ` + fileColumns + ` FROM files WHERE owner_id = $1 ORDER BY created_at DESC`

	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	rows, err := r.db.QueryContext(ctx, q, ownerID)
	if err != nil {
		return nil, fmt.Errorf("list files: %w", err)
	}
	defer rows.Close()

	out := []models.File{}
	for rows.Next() {
		var f models.File
		if err := rows.Scan(
			&f.ID, &f.OwnerID, &f.Filename, &f.SizeBytes, &f.ContentType,
			&f.StoragePath, &f.Nonce, &f.EncAlg, &f.SHA256, &f.CreatedAt,
		); err != nil {
			return nil, fmt.Errorf("scan file: %w", err)
		}
		out = append(out, f)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterate files: %w", err)
	}
	return out, nil
}

// DeleteFile deletes only when the owner matches; returns ErrFileNotFound otherwise.
func (r *Repository) DeleteFile(ctx context.Context, id, ownerID uuid.UUID) error {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	res, err := r.db.ExecContext(ctx, `DELETE FROM files WHERE id = $1 AND owner_id = $2`, id, ownerID)
	if err != nil {
		return fmt.Errorf("delete file: %w", err)
	}
	n, err := res.RowsAffected()
	if err != nil {
		return fmt.Errorf("delete file rows: %w", err)
	}
	if n == 0 {
		return ErrFileNotFound
	}
	return nil
}

func scanShare(row interface {
	Scan(dest ...any) error
}) (*models.Share, error) {
	var s models.Share
	err := row.Scan(&s.ID, &s.FileID, &s.Token, &s.ExpiresAt, &s.Revoked, &s.CreatedAt)
	if err != nil {
		return nil, err
	}
	return &s, nil
}

const shareColumns = `id, file_id, token, expires_at, revoked, created_at`

func (r *Repository) CreateShare(ctx context.Context, fileID uuid.UUID, tokenHash string, expiresAt *time.Time) (*models.Share, error) {
	const q = `
		INSERT INTO shares (file_id, token, expires_at)
		VALUES ($1, $2, $3)
		RETURNING ` + shareColumns

	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	s, err := scanShare(r.db.QueryRowContext(ctx, q, fileID, tokenHash, expiresAt))
	if err != nil {
		return nil, fmt.Errorf("insert share: %w", err)
	}
	return s, nil
}

func (r *Repository) GetShareByTokenHash(ctx context.Context, tokenHash string) (*models.Share, error) {
	const q = `SELECT ` + shareColumns + ` FROM shares WHERE token = $1`

	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	s, err := scanShare(r.db.QueryRowContext(ctx, q, tokenHash))
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrShareNotFound
		}
		return nil, fmt.Errorf("query share: %w", err)
	}
	return s, nil
}

func (r *Repository) ListSharesByFile(ctx context.Context, fileID, ownerID uuid.UUID) ([]models.Share, error) {
	const q = `
		SELECT s.id, s.file_id, s.token, s.expires_at, s.revoked, s.created_at
		FROM shares s
		JOIN files f ON f.id = s.file_id
		WHERE s.file_id = $1 AND f.owner_id = $2
		ORDER BY s.created_at DESC
	`

	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	rows, err := r.db.QueryContext(ctx, q, fileID, ownerID)
	if err != nil {
		return nil, fmt.Errorf("list shares: %w", err)
	}
	defer rows.Close()

	out := []models.Share{}
	for rows.Next() {
		var s models.Share
		if err := rows.Scan(&s.ID, &s.FileID, &s.Token, &s.ExpiresAt, &s.Revoked, &s.CreatedAt); err != nil {
			return nil, fmt.Errorf("scan share: %w", err)
		}
		out = append(out, s)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterate shares: %w", err)
	}
	return out, nil
}

// RevokeShare marks revoked=true only when the share's file belongs to ownerID.
func (r *Repository) RevokeShare(ctx context.Context, shareID, ownerID uuid.UUID) error {
	const q = `
		UPDATE shares s
		SET revoked = TRUE
		FROM files f
		WHERE s.file_id = f.id AND s.id = $1 AND f.owner_id = $2
	`

	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	res, err := r.db.ExecContext(ctx, q, shareID, ownerID)
	if err != nil {
		return fmt.Errorf("revoke share: %w", err)
	}
	n, err := res.RowsAffected()
	if err != nil {
		return fmt.Errorf("revoke share rows: %w", err)
	}
	if n == 0 {
		return ErrShareNotFound
	}
	return nil
}
