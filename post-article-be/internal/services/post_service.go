package services

import (
	"errors"

	"github.com/go-playground/validator/v10"
	"github.com/nugraharmd/sharing-vision/post-article-be/internal/dto"
	"github.com/nugraharmd/sharing-vision/post-article-be/internal/models"
	"github.com/nugraharmd/sharing-vision/post-article-be/internal/repositories"
	"gorm.io/gorm"
)

var (
	ErrNotFound = errors.New("post not found")
	validate    = validator.New()
)

func formatValidationError(err error) error {
	if ve, ok := err.(validator.ValidationErrors); ok {
		// Return first human-readable error; handler maps to 400.
		for _, fe := range ve {
			return errors.New("field '" + fe.Field() + "' failed '" + fe.Tag() + "' validation")
		}
	}
	return err
}

type PostService struct {
	repo *repositories.PostRepository
}

func NewPostService(repo *repositories.PostRepository) *PostService {
	return &PostService{repo: repo}
}

func toResponse(p *models.Post) dto.PostResponse {
	return dto.PostResponse{
		ID:          p.ID,
		Title:       p.Title,
		Content:     p.Content,
		Category:    p.Category,
		Status:      p.Status,
		CreatedDate: p.CreatedDate,
		UpdatedDate: p.UpdatedDate,
	}
}

func (s *PostService) Create(req dto.CreatePostRequest) (*dto.PostResponse, error) {
	if err := validate.Struct(req); err != nil {
		return nil, formatValidationError(err)
	}
	p := &models.Post{
		Title:    req.Title,
		Content:  req.Content,
		Category: req.Category,
		Status:   req.Status,
	}
	if err := s.repo.Create(p); err != nil {
		return nil, err
	}
	res := toResponse(p)
	return &res, nil
}

func (s *PostService) List(limit, offset int) ([]dto.PostResponse, error) {
	if limit <= 0 {
		limit = 10
	}
	if limit > 100 {
		limit = 100
	}
	if offset < 0 {
		offset = 0
	}
	posts, err := s.repo.FindAll(limit, offset)
	if err != nil {
		return nil, err
	}
	out := make([]dto.PostResponse, 0, len(posts))
	for i := range posts {
		out = append(out, toResponse(&posts[i]))
	}
	return out, nil
}

func (s *PostService) GetByID(id uint) (*dto.PostResponse, error) {
	p, err := s.repo.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrNotFound
		}
		return nil, err
	}
	res := toResponse(p)
	return &res, nil
}

func (s *PostService) Update(id uint, req dto.UpdatePostRequest) (*dto.PostResponse, error) {
	if err := validate.Struct(req); err != nil {
		return nil, formatValidationError(err)
	}
	p, err := s.repo.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrNotFound
		}
		return nil, err
	}
	p.Title = req.Title
	p.Content = req.Content
	p.Category = req.Category
	p.Status = req.Status
	if err := s.repo.Update(p); err != nil {
		return nil, err
	}
	res := toResponse(p)
	return &res, nil
}

func (s *PostService) Delete(id uint) error {
	if _, err := s.repo.FindByID(id); err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return ErrNotFound
		}
		return err
	}
	return s.repo.Delete(id)
}
