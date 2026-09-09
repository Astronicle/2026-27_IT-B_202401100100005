package middleware

import (
	"net/http"

	"github.com/Astronicle/poryflux/backend/internal/auth"
)

func RequireAuth(service *auth.Service) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			cookie, err := r.Cookie(auth.CookieName)
			if err != nil {
				unauthorized(w)
				return
			}

			userID, err := service.VerifyToken(cookie.Value)
			if err != nil {
				unauthorized(w)
				return
			}

			ctx := auth.WithUserID(r.Context(), userID)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

func unauthorized(w http.ResponseWriter) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusUnauthorized)
	_, _ = w.Write([]byte(`{"error":"not authenticated"}`))
}
