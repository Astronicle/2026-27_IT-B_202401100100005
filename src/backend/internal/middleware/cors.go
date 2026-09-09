package middleware

import (
	"net/http"
	"strconv"
	"strings"
)

// CORS implements cross-origin access for the browser frontend.
//
// The frontend (http://localhost:3000) talks to this API on a different
// origin (http://localhost:8080), so every browser request is cross-site:
//   - Access-Control-Allow-Origin must echo the exact request Origin.
//     ("*" is forbidden together with Allow-Credentials.)
//   - Preflight OPTIONS must be answered here, outside the mux, because
//     the mux only registers GET/POST/DELETE patterns and would 405 them.
//
// allowedOrigins is the exact-match allowlist (scheme+host+port).
func CORS(allowedOrigins []string) func(http.Handler) http.Handler {
	allow := make(map[string]struct{}, len(allowedOrigins))
	for _, o := range allowedOrigins {
		if o = strings.TrimSpace(o); o != "" {
			allow[o] = struct{}{}
		}
	}

	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			origin := r.Header.Get("Origin")
			if origin == "" {
				// Not a browser cross-origin request (curl, healthchecks).
				next.ServeHTTP(w, r)
				return
			}
			if _, ok := allow[origin]; !ok {
				// Unknown origin: let it through without CORS headers;
				// the browser will block it. Never echo arbitrary origins.
				next.ServeHTTP(w, r)
				return
			}

			h := w.Header()
			h.Set("Access-Control-Allow-Origin", origin)
			h.Set("Access-Control-Allow-Credentials", "true")
			h.Set("Vary", "Origin")

			if r.Method == http.MethodOptions {
				h.Set("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS, HEAD")
				h.Set("Access-Control-Allow-Headers", "Content-Type, Authorization, Range")
				h.Set("Access-Control-Max-Age", strconv.Itoa(86400))
				w.WriteHeader(http.StatusNoContent)
				return
			}

			next.ServeHTTP(w, r)
		})
	}
}

// ParseCORSOrigins splits a comma-separated CORS_ORIGINS env value.
func ParseCORSOrigins(raw string) []string {
	if strings.TrimSpace(raw) == "" {
		return []string{"http://localhost:3000"}
	}
	var out []string
	for _, o := range strings.Split(raw, ",") {
		if o = strings.TrimSpace(o); o != "" {
			out = append(out, o)
		}
	}
	if len(out) == 0 {
		return []string{"http://localhost:3000"}
	}
	return out
}
