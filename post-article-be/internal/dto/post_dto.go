package dto

import "time"

// Allowed statuses per spec.
const (
	StatusPublish = "publish"
	StatusDraft   = "draft"
	StatusThrash  = "thrash" // spec spelling ("thrash"); treated as "trash" alias
)

type CreatePostRequest struct {
	Title    string `json:"title" validate:"required,min=20,max=255"`
	Content  string `json:"content" validate:"required,min=200"`
	Category string `json:"category" validate:"required,min=3,max=100"`
	Status   string `json:"status" validate:"required,oneof=publish draft thrash"`
}

type UpdatePostRequest struct {
	Title    string `json:"title" validate:"required,min=20,max=255"`
	Content  string `json:"content" validate:"required,min=200"`
	Category string `json:"category" validate:"required,min=3,max=100"`
	Status   string `json:"status" validate:"required,oneof=publish draft thrash"`
}

type PostResponse struct {
	ID          uint      `json:"id"`
	Title       string    `json:"title"`
	Content     string    `json:"content"`
	Category    string    `json:"category"`
	Status      string    `json:"status"`
	CreatedDate time.Time `json:"created_date"`
	UpdatedDate time.Time `json:"updated_date"`
}
