# PoryFlux

## Project Description

**PoryFlux** is a secure file-sharing system designed for fast, reliable, and privacy-focused file transfers.

The system allows users to securely upload, share, and access files while protecting their data through **encryption**. It supports **file streaming** for efficient access to large files and **concurrent uploads** to improve performance when multiple files are uploaded simultaneously.

PoryFlux focuses on **security, performance, concurrency, and scalability**.

## Key Features

* **Secure File Sharing** — Share files while enforcing controlled access.
* **File Encryption** — Protect files against unauthorized access.
* **Concurrent Uploads** — Handle multiple uploads efficiently using Go's concurrency capabilities.
* **File Streaming** — Stream large files without requiring the entire file to be loaded into memory.
* **User Authentication** — Securely authenticate users and manage access.
* **File Management** — Upload, access, and manage shared files.
* **High Performance** — Use Go for efficient backend processing and concurrent operations.
* **Scalable Architecture** — Designed to support multiple users and large files.

## Team Members

1. Abdul Rehman
2. Mohd Yavar
3. Keshav Gopalka
4. Parth Pathak

## Technologies

### Frontend

* Next.js
* TypeScript
* Tailwind CSS

### Backend

* Go (Golang)
* Go HTTP Server / REST API
* Go Concurrency

### Database

* PostgreSQL

### Security

* File Encryption
* Secure Authentication
* Access Control
## Requirements

The following tools are required to run the project:

* Docker
* Docker Compose
* Git

For local development without Docker, the following may also be required:

* Go
* Node.js
* pnpm
* PostgreSQL

## Project Structure
```
PoryFlux/
│
├── README.md
├── Makefile
├── docker-compose.yaml
│
├── docs/
│   ├── SRS/
│   └── UML/
│
├── src/
│   ├── frontend/
│   └── backend/
│       ├── migrations/
│       ├── .env.example
│       └── Dockerfile
│
├── test/
│
└── .gitignore
```
## Docker Compose Usage

The project uses Docker Compose to run the complete application stack:

Frontend
   ↓
Backend
   ↓
PostgreSQL

From the project root, build and start all services:

* docker compose up --build

To run the services in the background:

* docker compose up --build -d

To stop the services:

* docker compose down

To stop the services without removing the PostgreSQL data volume:

* docker compose down

The PostgreSQL data is stored in a named Docker volume so that database data persists when containers are recreated.
## Useful Tips-->

The applications can be accessed locally at:

Frontend: http://localhost:3000
Backend:  http://localhost:8080
PostgreSQL: localhost:5432
## Database Migrations

PoryFlux uses database migration files to manage changes to the PostgreSQL database.

The current migration structure is intentionally kept unchanged. The existing 0001_init migration creates the required database tables.

Migration commands are provided through the project Makefile.

* Apply pending migrations:

make migrate-up

* Rollback the most recent migration:

make migrate-down

* Migration files are located at:

src/backend/migrations/

## Fresh Clone Flow -->

A new developer can set up the project using the following steps:

git clone <repo>
cd 2026-27_IT-B_202401100100005

cp src/backend/.env.example src/backend/.env

Update the required secrets in:

src/backend/.env

Then start the complete application:

docker compose up --build

After the containers start:

Frontend → http://localhost:3000
Backend  → http://localhost:8080
Database → localhost:5432
## Troubleshooting
* Check running containers
docker compose ps
* View service logs
docker compose logs

* View backend logs:

docker compose logs backend

* View PostgreSQL logs:

docker compose logs postgres
* Rebuild containers
If Docker changes are not reflected:

docker compose up --build

* PostgreSQL is not ready
Check PostgreSQL health/status:

docker compose ps

The backend depends on PostgreSQL being healthy before starting.

* Stop and recreate containers
docker compose down
docker compose up --build

( If you need to completely reset the development database, the PostgreSQL Docker volume can be removed. This permanently deletes the stored database data, so use this only when a database reset is intended.)
## Why We Use Docker Compose

Dockerfiles define how individual container images are built, but they do not manage multiple containers together.

PoryFlux has three services:

* PostgreSQL
* Go Backend
* Next.js Frontend

Without Docker Compose, we would have to manually create networks, run containers, configure environment variables, ports, volumes, and service connections.

With Docker Compose, everything is defined in one `docker-compose.yaml` file and started with:

```bash
docker compose up --build
```


**Dockerfile = builds one image**

**Docker Compose = runs and connects multiple services**

## Goals

The primary goals of PoryFlux are to:

1. Provide a **secure platform for file sharing**.
2. Protect user files using **encryption**.
3. Support **efficient streaming of large files**.
4. Handle multiple uploads using **concurrent processing**.
5. Provide a **high-performance Go backend**.
6. Build a system capable of scaling to multiple users and large files.

## Status

**Under Development**
