package config

import (
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	GatewayPort       string
	ArticleServiceURL string
}

func getenv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

func Load() *Config {
	_ = godotenv.Load() // ignore error; env may come from docker/compose
	return &Config{
		GatewayPort:       getenv("GATEWAY_PORT", "8080"),
		ArticleServiceURL: getenv("ARTICLE_SERVICE_URL", "http://localhost:8081"),
	}
}
