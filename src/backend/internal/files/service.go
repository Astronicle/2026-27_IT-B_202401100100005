package files

import (
	"context"
	"crypto/aes"
	"crypto/cipher"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"time"

	"github.com/google/uuid"

	"github.com/Astronicle/poryflux/backend/internal/crypto"
	"github.com/Astronicle/poryflux/backend/internal/models"
)

// Service owns the storage directory and the master key.
// Concurrent uploads are safe: net/http runs each request in its own
// goroutine, every upload writes a unique UUID path, and no mutable
// state is shared between requests.
type Service struct {
	repo       *Repository
	masterKey  [32]byte
	storageDir string
}

func NewService(repo *Repository, masterKey [32]byte, storageDir string) *Service {
	return &Service{repo: repo, masterKey: masterKey, storageDir: storageDir}
}

func (s *Service) EnsureStorageDir() error {
	if err := os.MkdirAll(s.storageDir, 0o700); err != nil {
		return fmt.Errorf("create storage dir: %w", err)
	}
	return nil
}

// Upload encrypts src (plaintext) to disk with AES-256-CTR using a fresh
// random IV, streaming in 32KB chunks so large files never sit fully in
// RAM. It hashes plaintext with SHA-256 on the fly for integrity.
func (s *Service) Upload(ctx context.Context, ownerID uuid.UUID, filename, contentType string, src io.Reader) (*models.File, error) {
	iv, err := crypto.GenerateIV()
	if err != nil {
		return nil, err
	}
	block, err := aes.NewCipher(s.masterKey[:])
	if err != nil {
		return nil, fmt.Errorf("new cipher: %w", err)
	}
	stream := cipher.NewCTR(block, iv[:])

	id := uuid.New()
	destPath := filepath.Join(s.storageDir, id.String())

	dst, err := os.OpenFile(destPath, os.O_WRONLY|os.O_CREATE|os.O_EXCL, 0o600)
	if err != nil {
		return nil, fmt.Errorf("create storage file: %w", err)
	}
	// On any failure below, remove the partial ciphertext file.
	succeeded := false
	defer func() {
		_ = dst.Close()
		if !succeeded {
			_ = os.Remove(destPath)
		}
	}()

	hasher := sha256.New()
	buf := make([]byte, 32*1024)
	enc := make([]byte, 32*1024)
	var total int64
	for {
		select {
		case <-ctx.Done():
			return nil, fmt.Errorf("upload canceled: %w", ctx.Err())
		default:
		}
		n, rerr := src.Read(buf)
		if n > 0 {
			chunk := buf[:n]
			_, _ = hasher.Write(chunk)
			stream.XORKeyStream(enc[:n], chunk)
			if _, werr := dst.Write(enc[:n]); werr != nil {
				return nil, fmt.Errorf("write ciphertext: %w", werr)
			}
			total += int64(n)
		}
		if rerr == io.EOF {
			break
		}
		if rerr != nil {
			return nil, fmt.Errorf("read plaintext: %w", rerr)
		}
	}
	if err := dst.Close(); err != nil {
		return nil, fmt.Errorf("close storage file: %w", err)
	}

	f := &models.File{
		ID:          id,
		OwnerID:     ownerID,
		Filename:    filename,
		SizeBytes:   total,
		ContentType: contentType,
		StoragePath: destPath,
		Nonce:       hex.EncodeToString(iv[:]),
		EncAlg:      crypto.EncAlg,
		SHA256:      hex.EncodeToString(hasher.Sum(nil)),
		CreatedAt:   time.Now(),
	}
	stored, err := s.repo.CreateFile(ctx, f)
	if err != nil {
		_ = os.Remove(destPath)
		return nil, err
	}
	succeeded = true
	return stored, nil
}

// OpenCiphertext opens the encrypted blob for reading.
func (s *Service) OpenCiphertext(f *models.File) (*os.File, error) {
	return os.Open(f.StoragePath)
}

// DecryptStream returns a stream decrypting ciphertext starting at offset.
func (s *Service) DecryptStream(f *models.File, offset int64) (cipher.Stream, error) {
	ivBytes, err := hex.DecodeString(f.Nonce)
	if err != nil || len(ivBytes) != 16 {
		return nil, fmt.Errorf("bad file nonce")
	}
	var iv [16]byte
	copy(iv[:], ivBytes)
	return crypto.NewCTRAt(s.masterKey, iv, offset)
}

// Delete removes the DB row (owner-checked) and then the ciphertext file.
func (s *Service) Delete(ctx context.Context, id, ownerID uuid.UUID) (*models.File, error) {
	f, err := s.repo.GetFileByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if f.OwnerID != ownerID {
		return nil, ErrFileNotFound
	}
	if err := s.repo.DeleteFile(ctx, id, ownerID); err != nil {
		return nil, err
	}
	_ = os.Remove(f.StoragePath) // DB row is gone; best-effort disk cleanup
	return f, nil
}
