package main

import (
	"log"
	"net/http"
	"os"

	"github.com/Astronicle/poryflux/backend/internal/auth"
	"github.com/Astronicle/poryflux/backend/internal/db"
	"github.com/Astronicle/poryflux/backend/internal/middleware"
	"github.com/joho/godotenv"
)

func main() {
	_ = godotenv.Load()

	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		log.Fatal("DATABASE_URL not set")
	}

	jwtSecret := os.Getenv("JWT_SECRET")
	if jwtSecret == "" {
		log.Fatal("JWT_SECRET not set")
	}

	conn, err := db.Connect(dbURL)
	if err != nil {
		log.Fatalf("db connect failed: %v", err)
	}
	defer conn.Close()

	log.Println("connected to postgres")

	authRepo := auth.NewRepository(conn)
	authService := auth.NewService(jwtSecret)
	authHandler := auth.NewHandler(authService, authRepo)
	requireAuth := middleware.RequireAuth(authService)

	mux := http.NewServeMux()
	mux.HandleFunc("GET /healthz", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("ok"))
	})

	mux.HandleFunc("POST /register", authHandler.Register)
	mux.HandleFunc("POST /login", authHandler.Login)
	mux.HandleFunc("POST /logout", authHandler.Logout)

	mux.Handle("GET /me", requireAuth(http.HandlerFunc(authHandler.Me)))

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	log.Printf("listening on :%s", port)
	log.Fatal(http.ListenAndServe(":"+port, mux))
}