package models

import "time"

// Post maps to table `posts`.
// NOTE on spec: "title: varchar(20), min 20 chars" is contradictory
// (a VARCHAR(20) column cannot hold more than 20 chars). To satisfy the
// min-20-chars validation, the column is created as VARCHAR(255).
// Validation (min 20) is enforced at the DTO/service layer.
type Post struct {
	ID          uint      `gorm:"primaryKey;autoIncrement" json:"id"`
	Title       string    `gorm:"type:varchar(255);not null" json:"title"`
	Content     string    `gorm:"type:text;not null" json:"content"`
	Category    string    `gorm:"type:varchar(100);not null" json:"category"`
	Status      string    `gorm:"type:varchar(100);not null" json:"status"`
	CreatedDate time.Time `gorm:"column:created_date;autoCreateTime" json:"created_date"`
	UpdatedDate time.Time `gorm:"column:updated_date;autoUpdateTime" json:"updated_date"`
}

func (Post) TableName() string {
	return "posts"
}
