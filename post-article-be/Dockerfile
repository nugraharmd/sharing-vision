# article-service image (see gateway/Dockerfile for the api-gateway image)
# ---- build ----
FROM golang:1.23-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o /server ./cmd/api

# ---- run ----
FROM alpine:3.20
WORKDIR /app
COPY --from=builder /server /app/server
COPY migrations /app/migrations
EXPOSE 8080
CMD ["/app/server"]
