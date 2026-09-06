include .env
export

migrate-up:
	migrate -path src/backend/migrations -database "$(DATABASE_URL)" up

migrate-down:
	migrate -path src/backend/migrations -database "$(DATABASE_URL)" down 1