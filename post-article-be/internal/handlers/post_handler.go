package handlers

import (
	"errors"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/nugraharmd/sharing-vision/post-article-be/internal/dto"
	"github.com/nugraharmd/sharing-vision/post-article-be/internal/services"
	"github.com/nugraharmd/sharing-vision/post-article-be/pkg/response"
)

type PostHandler struct {
	svc *services.PostService
}

func NewPostHandler(svc *services.PostService) *PostHandler {
	return &PostHandler{svc: svc}
}

// POST /article
func (h *PostHandler) Create(c *gin.Context) {
	var req dto.CreatePostRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Fail(c, http.StatusBadRequest, err.Error())
		return
	}
	res, err := h.svc.Create(req)
	if err != nil {
		response.Fail(c, http.StatusBadRequest, err.Error())
		return
	}
	response.Success(c, http.StatusCreated, "article created", res)
}

// GET /article/:limit/:offset
func (h *PostHandler) List(c *gin.Context) {
	limit, err1 := strconv.Atoi(c.Param("limit"))
	offset, err2 := strconv.Atoi(c.Param("offset"))
	if err1 != nil || err2 != nil {
		response.Fail(c, http.StatusBadRequest, "limit and offset must be integers")
		return
	}
	res, err := h.svc.List(limit, offset)
	if err != nil {
		response.Fail(c, http.StatusInternalServerError, err.Error())
		return
	}
	response.Paginated(c, "articles retrieved", res, limit, offset, len(res))
}

// GET /article/:id
func (h *PostHandler) GetByID(c *gin.Context) {
	id64, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		response.Fail(c, http.StatusBadRequest, "id must be an integer")
		return
	}
	res, err := h.svc.GetByID(uint(id64))
	if err != nil {
		if errors.Is(err, services.ErrNotFound) {
			response.Fail(c, http.StatusNotFound, "post not found")
			return
		}
		response.Fail(c, http.StatusInternalServerError, err.Error())
		return
	}
	response.Success(c, http.StatusOK, "article retrieved", res)
}

// PUT /article/:id  and  PATCH /article/:id
func (h *PostHandler) Update(c *gin.Context) {
	id64, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		response.Fail(c, http.StatusBadRequest, "id must be an integer")
		return
	}
	var req dto.UpdatePostRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Fail(c, http.StatusBadRequest, err.Error())
		return
	}
	res, err := h.svc.Update(uint(id64), req)
	if err != nil {
		if errors.Is(err, services.ErrNotFound) {
			response.Fail(c, http.StatusNotFound, "post not found")
			return
		}
		response.Fail(c, http.StatusBadRequest, err.Error())
		return
	}
	response.Success(c, http.StatusOK, "article updated", res)
}

// DELETE /article/:id
func (h *PostHandler) Delete(c *gin.Context) {
	id64, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		response.Fail(c, http.StatusBadRequest, "id must be an integer")
		return
	}
	if err := h.svc.Delete(uint(id64)); err != nil {
		if errors.Is(err, services.ErrNotFound) {
			response.Fail(c, http.StatusNotFound, "post not found")
			return
		}
		response.Fail(c, http.StatusInternalServerError, err.Error())
		return
	}
	response.Success(c, http.StatusOK, "article deleted", gin.H{"id": id64})
}
