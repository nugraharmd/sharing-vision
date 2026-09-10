APP_NAME := post-article-be
GO := go

.PHONY: help tidy build build-article build-gateway run-article run-gateway migrate-up migrate-down docker-build docker-up docker-down

help:
	@echo "Available targets:"
	@echo "  tidy           - go mod tidy"
	@echo "  build          - build both services to bin/"
	@echo "  build-article  - build article-service to bin/server"
	@echo "  build-gateway  - build api-gateway to bin/gateway"
	@echo "  run-article    - run article-service locally (needs MySQL + .env)"
	@echo "  run-gateway    - run api-gateway locally (needs article-service up)"
	@echo "  migrate-up     - apply migrations/000001_create_posts_up.sql"
	@echo "  migrate-down   - apply migrations/000001_create_posts_down.sql"
	@echo "  docker-build   - docker build both service images"
	@echo "  docker-up      - docker compose up --build -d"
	@echo "  docker-down    - docker compose down"

tidy:
	$(GO) mod tidy

build: build-article build-gateway

build-article:
	$(GO) build -o bin/server ./cmd/api

build-gateway:
	$(GO) build -o bin/gateway ./gateway/cmd

run-article:
	$(GO) run ./cmd/api

run-gateway:
	$(GO) run ./gateway/cmd

# Requires: mysql client in PATH and .env values (DB_*). Example:
#   make migrate-up DB_PASS=root
DB_HOST ?= localhost
DB_PORT ?= 3306
DB_USER ?= root
DB_PASS ?=
DB_NAME ?= article

migrate-up:
	mysql -h$(DB_HOST) -P$(DB_PORT) -u$(DB_USER) -p$(DB_PASS) < migrations/000001_create_posts_up.sql

migrate-down:
	mysql -h$(DB_HOST) -P$(DB_PORT) -u$(DB_USER) -p$(DB_PASS) < migrations/000001_create_posts_down.sql

docker-build:
	docker build -t $(APP_NAME)-article .
	docker build -t $(APP_NAME)-gateway -f gateway/Dockerfile .

docker-up:
	docker compose up --build -d

docker-down:
	docker compose down
