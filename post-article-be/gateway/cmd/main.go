package main

import (
	"log"

	"github.com/gin-gonic/gin"
	gwconfig "github.com/nugraharmd/sharing-vision/post-article-be/gateway/internal/config"
	"github.com/nugraharmd/sharing-vision/post-article-be/gateway/internal/proxy"
)

// api-gateway: public edge of the microservices. It owns no data; it routes
// client traffic to downstream services (article-service) and reports their
// health in the shared base-response envelope.
func main() {
	cfg := gwconfig.Load()

	r := gin.Default()

	r.GET("/health", proxy.Health(cfg.ArticleServiceURL))

	article := proxy.NewReverseProxy(cfg.ArticleServiceURL)
	r.POST("/article", article)
	r.GET("/article/:limit/:offset", article)
	r.GET("/article/:id", article)
	r.PUT("/article/:id", article)
	r.PATCH("/article/:id", article)
	r.DELETE("/article/:id", article)

	log.Printf("api-gateway listening on :%s -> %s", cfg.GatewayPort, cfg.ArticleServiceURL)
	if err := r.Run(":" + cfg.GatewayPort); err != nil {
		log.Fatalf("gateway: %v", err)
	}
}
