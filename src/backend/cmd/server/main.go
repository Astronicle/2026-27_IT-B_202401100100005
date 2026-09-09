package main

import (
	"log"
	"net/http"
	"os"

	"github.com/Astronicle/poryflux/backend/internal/auth"
	"github.com/Astronicle/poryflux/backend/internal/crypto"
	"github.com/Astronicle/poryflux/backend/internal/db"
	"github.com/Astronicle/poryflux/backend/internal/files"
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

	masterKey, err := crypto.ParseMasterKey(os.Getenv("MASTER_KEY"))
	if err != nil {
		log.Fatalf("invalid MASTER_KEY: %v", err)
	}

	storageDir := os.Getenv("STORAGE_DIR")
	if storageDir == "" {
		storageDir = "./storage"
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

	fileRepo := files.NewRepository(conn)
	fileService := files.NewService(fileRepo, masterKey, storageDir)
	if err := fileService.EnsureStorageDir(); err != nil {
		log.Fatalf("storage dir: %v", err)
	}
	fileHandler := files.NewHandler(fileService, fileRepo)

	mux := http.NewServeMux()
	mux.HandleFunc("GET /healthz", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("ok"))
	})

	mux.HandleFunc("POST /register", authHandler.Register)
	mux.HandleFunc("POST /login", authHandler.Login)
	mux.HandleFunc("POST /logout", authHandler.Logout)

	mux.Handle("GET /me", requireAuth(http.HandlerFunc(authHandler.Me)))

	// Encrypted file sharing: uploads are AES-256-CTR encrypted streaming
	// to disk (constant memory, concurrent-safe), downloads stream-decrypt
	// with HTTP Range support.
	mux.Handle("POST /files", requireAuth(http.HandlerFunc(fileHandler.Upload)))
	mux.Handle("GET /files", requireAuth(http.HandlerFunc(fileHandler.List)))
	mux.Handle("GET /files/{id}", requireAuth(http.HandlerFunc(fileHandler.Download)))
	mux.Handle("DELETE /files/{id}", requireAuth(http.HandlerFunc(fileHandler.Delete)))

	mux.Handle("POST /files/{id}/shares", requireAuth(http.HandlerFunc(fileHandler.CreateShare)))
	mux.Handle("GET /files/{id}/shares", requireAuth(http.HandlerFunc(fileHandler.ListShares)))
	mux.Handle("DELETE /shares/{id}", requireAuth(http.HandlerFunc(fileHandler.RevokeShare)))

	// Public share link (no auth; token is unguessable, hashed in DB,
	// expiry + revocation enforced).
	mux.HandleFunc("GET /s/{token}", fileHandler.PublicDownload)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	log.Printf("listening on :%s", port)
	log.Fatal(http.ListenAndServe(":"+port, mux))
}
