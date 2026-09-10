package repositories

import (
	"github.com/nugraharmd/sharing-vision/post-article-be/internal/models"
	"gorm.io/gorm"
)

type PostRepository struct {
	db *gorm.DB
}

func NewPostRepository(db *gorm.DB) *PostRepository {
	return &PostRepository{db: db}
}

func (r *PostRepository) Create(p *models.Post) error {
	return r.db.Create(p).Error
}

func (r *PostRepository) FindAll(limit, offset int, status string) ([]models.Post, error) {
	var posts []models.Post
	q := r.db.Order("created_date DESC").Limit(limit).Offset(offset)
	if status != "" {
		q = q.Where("status = ?", status)
	}
	err := q.Find(&posts).Error
	return posts, err
}

func (r *PostRepository) FindByID(id uint) (*models.Post, error) {
	var p models.Post
	if err := r.db.First(&p, id).Error; err != nil {
		return nil, err
	}
	return &p, nil
}

func (r *PostRepository) Update(p *models.Post) error {
	return r.db.Save(p).Error
}

func (r *PostRepository) Delete(id uint) error {
	return r.db.Delete(&models.Post{}, id).Error
}
