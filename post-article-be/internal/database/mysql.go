package database

import (
	"fmt"

	"github.com/nugraharmd/sharing-vision/post-article-be/internal/config"
	"github.com/nugraharmd/sharing-vision/post-article-be/internal/models"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

func Connect(cfg *config.Config) (*gorm.DB, error) {
	// Connect without DB first to ensure `article` database exists (migration requirement).
	rootDSN := fmt.Sprintf("%s:%s@tcp(%s:%s)/?charset=utf8mb4&parseTime=True&loc=Local",
		cfg.DBUser, cfg.DBPass, cfg.DBHost, cfg.DBPort)
	rootDB, err := gorm.Open(mysql.Open(rootDSN), &gorm.Config{})
	if err != nil {
		return nil, fmt.Errorf("connect mysql server: %w", err)
	}
	// CREATE DATABASE IF NOT EXISTS article
	if err := rootDB.Exec(fmt.Sprintf("CREATE DATABASE IF NOT EXISTS `%s` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci", cfg.DBName)).Error; err != nil {
		return nil, fmt.Errorf("create database: %w", err)
	}

	dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local",
		cfg.DBUser, cfg.DBPass, cfg.DBHost, cfg.DBPort, cfg.DBName)
	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		return nil, fmt.Errorf("connect database %s: %w", cfg.DBName, err)
	}

	// ORM auto-migration (kept in sync with migrations/*.sql).
	if err := db.AutoMigrate(&models.Post{}); err != nil {
		return nil, fmt.Errorf("auto migrate: %w", err)
	}
	return db, nil
}
