# ---- build ----
FROM golang:1.23-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o /gateway ./gateway/cmd

# ---- run ----
FROM alpine:3.20
WORKDIR /app
COPY --from=builder /gateway /app/gateway
EXPOSE 8080
CMD ["/app/gateway"]
