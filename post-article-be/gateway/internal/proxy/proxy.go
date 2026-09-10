package proxy

import (
	"net/http"
	"net/http/httputil"
	"net/url"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/nugraharmd/sharing-vision/post-article-be/pkg/response"
)

// NewReverseProxy forwards /article* to article-service, preserving path
// and query string, and wraps transport failures in the base response.
func NewReverseProxy(target string) gin.HandlerFunc {
	u, err := url.Parse(target)
	if err != nil {
		panic("invalid ARTICLE_SERVICE_URL: " + target)
	}
	rp := httputil.NewSingleHostReverseProxy(u)
	rp.ErrorHandler = func(w http.ResponseWriter, r *http.Request, err error) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadGateway)
		_, _ = w.Write([]byte(`{"success":false,"error":"article-service unavailable: ` + err.Error() + `"}`))
	}
	return func(c *gin.Context) {
		rp.ServeHTTP(c.Writer, c.Request)
	}
}

// Health reports gateway liveness plus downstream article-service status.
func Health(articleServiceURL string) gin.HandlerFunc {
	client := &http.Client{Timeout: 3 * time.Second}
	return func(c *gin.Context) {
		downstream := "up"
		if res, err := client.Get(articleServiceURL + "/health"); err != nil {
			downstream = "down: " + err.Error()
		} else {
			res.Body.Close()
			if res.StatusCode != http.StatusOK {
				downstream = "degraded: status " + res.Status
			}
		}
		response.Success(c, http.StatusOK, "ok", gin.H{
			"status":          "ok",
			"service":         "api-gateway",
			"article_service": downstream,
		})
	}
}
