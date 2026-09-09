package crypto

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"encoding/hex"
	"errors"
	"fmt"
	"strings"
)

// EncAlg is the algorithm label stored in files.enc_alg.
const EncAlg = "aes-256-ctr"

// ParseMasterKey accepts a 32-byte key encoded as hex (64 chars),
// base64 std/URL (with or without padding), or a raw 32-char string.
// It fails fast so misconfiguration never silently weakens encryption.
func ParseMasterKey(s string) ([32]byte, error) {
	var key [32]byte
	t := strings.TrimSpace(s)
	if t == "" {
		return key, errors.New("empty master key")
	}

	if decoded, err := hex.DecodeString(t); err == nil && len(decoded) == 32 {
		copy(key[:], decoded)
		return key, nil
	}

	for _, enc := range []*base64.Encoding{base64.StdEncoding, base64.URLEncoding, base64.RawStdEncoding, base64.RawURLEncoding} {
		if decoded, err := enc.DecodeString(t); err == nil && len(decoded) == 32 {
			copy(key[:], decoded)
			return key, nil
		}
	}

	if len(t) == 32 {
		copy(key[:], t)
		return key, nil
	}

	return key, fmt.Errorf("invalid master key: must decode to 32 bytes (got hex/base64/raw check)")
}

// GenerateIV returns a random 16-byte CTR IV.
func GenerateIV() ([16]byte, error) {
	var iv [16]byte
	if _, err := rand.Read(iv[:]); err != nil {
		return iv, fmt.Errorf("generate iv: %w", err)
	}
	return iv, nil
}

// NewCTRAt returns an AES-CTR stream positioned at plaintext/ciphertext
// byte offset. CTR is seekable (ciphertext[offset] <-> plaintext[offset]),
// which is what makes HTTP Range over encrypted files possible without
// decrypting from byte 0. GCM cannot do this, which is why CTR is used.
func NewCTRAt(key [32]byte, iv [16]byte, offset int64) (cipher.Stream, error) {
	if offset < 0 {
		return nil, fmt.Errorf("negative offset %d", offset)
	}
	block, err := aes.NewCipher(key[:])
	if err != nil {
		return nil, fmt.Errorf("new cipher: %w", err)
	}
	// counter = iv (128-bit big-endian) + offset/16
	ctr := iv
	carry := uint64(offset / int64(aes.BlockSize))
	for i := len(ctr) - 1; i >= 0 && carry > 0; i-- {
		sum := uint64(ctr[i]) + (carry & 0xff)
		ctr[i] = byte(sum & 0xff)
		carry = (carry >> 8) + (sum >> 8)
	}
	stream := cipher.NewCTR(block, ctr[:])
	// Discard keystream for the partial first block.
	if rem := offset % int64(aes.BlockSize); rem != 0 {
		discard := make([]byte, rem)
		zeros := make([]byte, rem)
		stream.XORKeyStream(discard, zeros)
	}
	return stream, nil
}

// NewShareToken returns (rawToken, tokenHashHex). The raw token is shown
// to the creator exactly once; only the SHA-256 hash is stored in
// shares.token so a DB leak does not grant file access.
func NewShareToken() (raw string, hashHex string, err error) {
	var buf [32]byte
	if _, err := rand.Read(buf[:]); err != nil {
		return "", "", fmt.Errorf("generate share token: %w", err)
	}
	raw = base64.RawURLEncoding.EncodeToString(buf[:])
	hashHex = HashToken(raw)
	return raw, hashHex, nil
}

// HashToken hashes a raw share token for DB lookup.
func HashToken(raw string) string {
	sum := sha256.Sum256([]byte(raw))
	return hex.EncodeToString(sum[:])
}
