package config

import (
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	AppPort string
	DBHost  string
	DBPort  string
	DBUser  string
	DBPass  string
	DBName  string
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
		AppPort: getenv("APP_PORT", "8080"),
		DBHost:  getenv("DB_HOST", "localhost"),
		DBPort:  getenv("DB_PORT", "3306"),
		DBUser:  getenv("DB_USER", "root"),
		DBPass:  getenv("DB_PASSWORD", ""),
		DBName:  getenv("DB_NAME", "article"),
	}
}
