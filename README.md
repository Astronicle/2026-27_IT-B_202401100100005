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

* TBD

### Security

* File Encryption
* Secure Authentication
* Access Control

## Project Structure

```text
PoryFlux/
│
├── README.md
│
├── docs/
│   ├── SRS/
│   └── UML/
│
├── src/
│   ├── frontend/
│   └── backend/
│
├── test/
│
└── .gitignore
```

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
