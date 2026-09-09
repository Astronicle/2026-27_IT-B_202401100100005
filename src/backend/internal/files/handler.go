package files

import (
	"crypto/cipher"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"path"
	"strconv"
	"strings"
	"time"

	"github.com/google/uuid"

	"github.com/Astronicle/poryflux/backend/internal/auth"
	"github.com/Astronicle/poryflux/backend/internal/crypto"
	"github.com/Astronicle/poryflux/backend/internal/models"
)

const (
	// MaxUploadBytes caps a single upload (ciphertext == plaintext size for CTR).
	MaxUploadBytes = 500 << 20 // 500MB
	// maxMemory is the multipart memory buffer; the rest spills to disk.
	maxMemory = 32 << 20 // 32MB
)

type Handler struct {
	svc  *Service
	repo *Repository
}

func NewHandler(svc *Service, repo *Repository) *Handler {
	return &Handler{svc: svc, repo: repo}
}

// publicFile hides storage internals (path, nonce) from API responses.
type publicFile struct {
	ID          uuid.UUID `json:"id"`
	OwnerID     uuid.UUID `json:"owner_id"`
	Filename    string    `json:"filename"`
	SizeBytes   int64     `json:"size_bytes"`
	ContentType string    `json:"content_type"`
	SHA256      string    `json:"sha256"`
	CreatedAt   time.Time `json:"created_at"`
}

func toPublicFile(f *models.File) publicFile {
	return publicFile{
		ID: f.ID, OwnerID: f.OwnerID, Filename: f.Filename,
		SizeBytes: f.SizeBytes, ContentType: f.ContentType,
		SHA256: f.SHA256, CreatedAt: f.CreatedAt,
	}
}

type createShareRequest struct {
	ExpiresInSeconds *int64 `json:"expires_in_seconds"`
}

type createShareResponse struct {
	ID        uuid.UUID  `json:"id"`
	FileID    uuid.UUID  `json:"file_id"`
	Token     string     `json:"token"` // raw token, shown exactly once
	URL       string     `json:"url"`
	ExpiresAt *time.Time `json:"expires_at,omitempty"`
	Revoked   bool       `json:"revoked"`
	CreatedAt time.Time  `json:"created_at"`
}

// POST /files — multipart form field "file". Streams encrypted to disk.
func (h *Handler) Upload(w http.ResponseWriter, r *http.Request) {
	ownerID, ok := auth.UserIDFromContext(r.Context())
	if !ok {
		writeError(w, http.StatusUnauthorized, "not authenticated")
		return
	}

	r.Body = http.MaxBytesReader(w, r.Body, MaxUploadBytes+(10<<20))
	if err := r.ParseMultipartForm(maxMemory); err != nil {
		writeError(w, http.StatusBadRequest, "invalid multipart body (max 500MB)")
		return
	}
	defer r.MultipartForm.RemoveAll()

	src, hdr, err := r.FormFile("file")
	if err != nil {
		writeError(w, http.StatusBadRequest, "form field 'file' is required")
		return
	}
	defer src.Close()

	filename := sanitizeFilename(hdr.Filename)
	contentType := hdr.Header.Get("Content-Type")
	if contentType == "" {
		contentType = "application/octet-stream"
	}

	f, err := h.svc.Upload(r.Context(), ownerID, filename, contentType, src)
	if err != nil {
		if r.Context().Err() != nil {
			writeError(w, http.StatusRequestTimeout, "upload canceled")
			return
		}
		writeError(w, http.StatusInternalServerError, "could not store file")
		return
	}

	writeJSON(w, http.StatusCreated, toPublicFile(f))
}

// GET /files — list caller's files.
func (h *Handler) List(w http.ResponseWriter, r *http.Request) {
	ownerID, ok := auth.UserIDFromContext(r.Context())
	if !ok {
		writeError(w, http.StatusUnauthorized, "not authenticated")
		return
	}
	files, err := h.repo.ListFilesByOwner(r.Context(), ownerID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "could not list files")
		return
	}
	out := make([]publicFile, 0, len(files))
	for i := range files {
		out = append(out, toPublicFile(&files[i]))
	}
	writeJSON(w, http.StatusOK, out)
}

// GET /files/{id} — owner download with Range support, streaming decrypt.
func (h *Handler) Download(w http.ResponseWriter, r *http.Request) {
	ownerID, ok := auth.UserIDFromContext(r.Context())
	if !ok {
		writeError(w, http.StatusUnauthorized, "not authenticated")
		return
	}
	id, err := uuid.Parse(r.PathValue("id"))
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid file id")
		return
	}
	f, err := h.repo.GetFileByID(r.Context(), id)
	if err != nil {
		if errors.Is(err, ErrFileNotFound) {
			writeError(w, http.StatusNotFound, "file not found")
			return
		}
		writeError(w, http.StatusInternalServerError, "could not fetch file")
		return
	}
	if f.OwnerID != ownerID {
		writeError(w, http.StatusNotFound, "file not found")
		return
	}
	h.serveDecrypted(w, r, f)
}

// DELETE /files/{id} — owner only.
func (h *Handler) Delete(w http.ResponseWriter, r *http.Request) {
	ownerID, ok := auth.UserIDFromContext(r.Context())
	if !ok {
		writeError(w, http.StatusUnauthorized, "not authenticated")
		return
	}
	id, err := uuid.Parse(r.PathValue("id"))
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid file id")
		return
	}
	if _, err := h.svc.Delete(r.Context(), id, ownerID); err != nil {
		if errors.Is(err, ErrFileNotFound) {
			writeError(w, http.StatusNotFound, "file not found")
			return
		}
		writeError(w, http.StatusInternalServerError, "could not delete file")
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

// POST /files/{id}/shares — create a public link (raw token returned once).
func (h *Handler) CreateShare(w http.ResponseWriter, r *http.Request) {
	ownerID, ok := auth.UserIDFromContext(r.Context())
	if !ok {
		writeError(w, http.StatusUnauthorized, "not authenticated")
		return
	}
	id, err := uuid.Parse(r.PathValue("id"))
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid file id")
		return
	}
	f, err := h.repo.GetFileByID(r.Context(), id)
	if err != nil {
		if errors.Is(err, ErrFileNotFound) {
			writeError(w, http.StatusNotFound, "file not found")
			return
		}
		writeError(w, http.StatusInternalServerError, "could not fetch file")
		return
	}
	if f.OwnerID != ownerID {
		writeError(w, http.StatusNotFound, "file not found")
		return
	}

	var req createShareRequest
	if r.Body != nil {
		if err := json.NewDecoder(http.MaxBytesReader(w, r.Body, 1<<20)).Decode(&req); err != nil && !errors.Is(err, io.EOF) {
			writeError(w, http.StatusBadRequest, "invalid request body")
			return
		}
	}
	var expiresAt *time.Time
	if req.ExpiresInSeconds != nil {
		if *req.ExpiresInSeconds <= 0 || *req.ExpiresInSeconds > 366*24*3600 {
			writeError(w, http.StatusBadRequest, "expires_in_seconds must be 1..31622400")
			return
		}
		t := time.Now().Add(time.Duration(*req.ExpiresInSeconds) * time.Second)
		expiresAt = &t
	}

	raw, hash, err := crypto.NewShareToken()
	if err != nil {
		writeError(w, http.StatusInternalServerError, "could not create share")
		return
	}
	s, err := h.repo.CreateShare(r.Context(), f.ID, hash, expiresAt)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "could not create share")
		return
	}
	writeJSON(w, http.StatusCreated, createShareResponse{
		ID: s.ID, FileID: s.FileID, Token: raw, URL: "/s/" + raw,
		ExpiresAt: s.ExpiresAt, Revoked: s.Revoked, CreatedAt: s.CreatedAt,
	})
}

// GET /files/{id}/shares — list links for a file (hashes never exposed).
func (h *Handler) ListShares(w http.ResponseWriter, r *http.Request) {
	ownerID, ok := auth.UserIDFromContext(r.Context())
	if !ok {
		writeError(w, http.StatusUnauthorized, "not authenticated")
		return
	}
	id, err := uuid.Parse(r.PathValue("id"))
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid file id")
		return
	}
	shares, err := h.repo.ListSharesByFile(r.Context(), id, ownerID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "could not list shares")
		return
	}
	writeJSON(w, http.StatusOK, shares)
}

// DELETE /shares/{id} — revoke (owner of the underlying file only).
func (h *Handler) RevokeShare(w http.ResponseWriter, r *http.Request) {
	ownerID, ok := auth.UserIDFromContext(r.Context())
	if !ok {
		writeError(w, http.StatusUnauthorized, "not authenticated")
		return
	}
	id, err := uuid.Parse(r.PathValue("id"))
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid share id")
		return
	}
	if err := h.repo.RevokeShare(r.Context(), id, ownerID); err != nil {
		if errors.Is(err, ErrShareNotFound) {
			writeError(w, http.StatusNotFound, "share not found")
			return
		}
		writeError(w, http.StatusInternalServerError, "could not revoke share")
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

// GET /s/{token} — public download via share link, Range supported.
func (h *Handler) PublicDownload(w http.ResponseWriter, r *http.Request) {
	raw := r.PathValue("token")
	if raw == "" {
		writeError(w, http.StatusBadRequest, "missing share token")
		return
	}
	s, err := h.repo.GetShareByTokenHash(r.Context(), crypto.HashToken(raw))
	if err != nil {
		writeError(w, http.StatusNotFound, "share not found")
		return
	}
	if s.Revoked {
		writeError(w, http.StatusGone, "share revoked")
		return
	}
	if s.ExpiresAt != nil && time.Now().After(*s.ExpiresAt) {
		writeError(w, http.StatusGone, "share expired")
		return
	}
	f, err := h.repo.GetFileByID(r.Context(), s.FileID)
	if err != nil {
		writeError(w, http.StatusNotFound, "file not found")
		return
	}
	h.serveDecrypted(w, r, f)
}

// serveDecrypted streams the CTR-decrypted plaintext with single-range
// support, constant memory (32KB buffer via io.CopyN).
func (h *Handler) serveDecrypted(w http.ResponseWriter, r *http.Request, f *models.File) {
	size := f.SizeBytes
	disposition := fmt.Sprintf("attachment; filename=%q", sanitizeFilename(f.Filename))
	w.Header().Set("Content-Type", f.ContentType)
	w.Header().Set("Content-Disposition", disposition)
	w.Header().Set("Accept-Ranges", "bytes")
	w.Header().Set("ETag", fmt.Sprintf("sha256:%s", f.SHA256))

	// Empty files: no body, no range negotiation.
	if size == 0 {
		w.Header().Set("Content-Length", "0")
		w.WriteHeader(http.StatusOK)
		return
	}

	start, length, ok := parseRange(r.Header.Get("Range"), size)
	if !ok {
		w.Header().Set("Content-Range", fmt.Sprintf("bytes */%d", size))
		writeError(w, http.StatusRequestedRangeNotSatisfiable, "invalid range")
		return
	}

	fh, err := h.svc.OpenCiphertext(f)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "could not open file")
		return
	}
	defer fh.Close()

	if _, err := fh.Seek(start, io.SeekStart); err != nil {
		writeError(w, http.StatusInternalServerError, "could not read file")
		return
	}
	stream, err := h.svc.DecryptStream(f, start)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "could not decrypt file")
		return
	}

	w.Header().Set("Content-Length", strconv.FormatInt(length, 10))

	isPartial := r.Header.Get("Range") != ""
	if isPartial {
		w.Header().Set("Content-Range", fmt.Sprintf("bytes %d-%d/%d", start, start+length-1, size))
		w.WriteHeader(http.StatusPartialContent)
	} else {
		w.WriteHeader(http.StatusOK)
	}
	if r.Method == http.MethodHead {
		return
	}
	reader := &decryptReader{stream: stream, src: io.LimitReader(fh, length)}
	_, _ = io.CopyN(w, reader, length)
}

// decryptReader applies the CTR keystream on the fly.
type decryptReader struct {
	stream cipher.Stream
	src    io.Reader
}

func (d *decryptReader) Read(p []byte) (int, error) {
	n, err := d.src.Read(p)
	if n > 0 {
		d.stream.XORKeyStream(p[:n], p[:n])
	}
	return n, err
}

// parseRange handles "bytes=start-", "bytes=start-end", "bytes=-suffix".
// Returns (start, length, valid). No header -> full body.
func parseRange(header string, size int64) (int64, int64, bool) {
	if header == "" {
		return 0, size, true
	}
	if !strings.HasPrefix(header, "bytes=") {
		return 0, 0, false
	}
	spec := strings.TrimPrefix(header, "bytes=")
	// Only single ranges; multipart ranges are rejected as unsatisfiable.
	if strings.Contains(spec, ",") {
		return 0, 0, false
	}
	if strings.HasPrefix(spec, "-") {
		suffix, err := strconv.ParseInt(spec[1:], 10, 64)
		if err != nil || suffix <= 0 {
			return 0, 0, false
		}
		if suffix > size {
			suffix = size
		}
		return size - suffix, suffix, true
	}
	parts := strings.SplitN(spec, "-", 2)
	if len(parts) != 2 {
		return 0, 0, false
	}
	start, err := strconv.ParseInt(strings.TrimSpace(parts[0]), 10, 64)
	if err != nil || start < 0 || start >= size {
		return 0, 0, false
	}
	if strings.TrimSpace(parts[1]) == "" {
		return start, size - start, true
	}
	end, err := strconv.ParseInt(strings.TrimSpace(parts[1]), 10, 64)
	if err != nil || end < start {
		return 0, 0, false
	}
	if end >= size {
		end = size - 1
	}
	return start, end - start + 1, true
}

func sanitizeFilename(name string) string {
	base := path.Base(strings.TrimSpace(name))
	base = strings.ReplaceAll(base, `"`, "_")
	base = strings.ReplaceAll(base, "\n", "_")
	base = strings.ReplaceAll(base, "\r", "_")
	if base == "" || base == "." || base == "/" {
		return "upload.bin"
	}
	if len(base) > 255 {
		base = base[len(base)-255:]
	}
	return base
}

func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(v)
}

func writeError(w http.ResponseWriter, status int, message string) {
	writeJSON(w, status, map[string]string{"error": message})
}
