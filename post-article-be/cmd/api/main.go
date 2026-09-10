package main

import (
	"log"

	"github.com/nugraharmd/sharing-vision/post-article-be/internal/config"
	"github.com/nugraharmd/sharing-vision/post-article-be/internal/database"
	"github.com/nugraharmd/sharing-vision/post-article-be/internal/handlers"
	"github.com/nugraharmd/sharing-vision/post-article-be/internal/repositories"
	"github.com/nugraharmd/sharing-vision/post-article-be/internal/routes"
	"github.com/nugraharmd/sharing-vision/post-article-be/internal/services"
)

func main() {
	cfg := config.Load()

	db, err := database.Connect(cfg)
	if err != nil {
		log.Fatalf("database: %v", err)
	}

	repo := repositories.NewPostRepository(db)
	svc := services.NewPostService(repo)
	h := handlers.NewPostHandler(svc)

	r := routes.SetupRouter(h)
	log.Printf("listening on :%s", cfg.AppPort)
	if err := r.Run(":" + cfg.AppPort); err != nil {
		log.Fatalf("server: %v", err)
	}
}
