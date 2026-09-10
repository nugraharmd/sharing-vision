package routes

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/nugraharmd/sharing-vision/post-article-be/internal/handlers"
	"github.com/nugraharmd/sharing-vision/post-article-be/pkg/response"
)

func SetupRouter(h *handlers.PostHandler) *gin.Engine {
	r := gin.Default()

	r.GET("/health", func(c *gin.Context) {
		response.Success(c, http.StatusOK, "ok", gin.H{"status": "ok", "service": "article-service"})
	})

	// Spec endpoints. Note: GET /article/:limit/:offset (2 segments) does not
	// clash with GET /article/:id (1 segment) in Gin.
	r.POST("/article", h.Create)
	r.GET("/article/:limit/:offset", h.List)
	r.GET("/article/:id", h.GetByID)
	r.PUT("/article/:id", h.Update)
	r.PATCH("/article/:id", h.Update)
	r.DELETE("/article/:id", h.Delete)

	return r
}
