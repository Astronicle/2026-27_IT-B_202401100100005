FROM golang:1.27 AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o server ./cmd/server
#from here bro the runtime changes to less heavy image to save time and memory-->
FROM debian:bookworm-slim
WORKDIR /app
COPY --from=builder /app/server .
EXPOSE 8080
CMD ["./server"]
