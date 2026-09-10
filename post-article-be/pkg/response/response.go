package response

import (
	"github.com/gin-gonic/gin"
)

// Envelope is the standard API response body used by every microservice
// in this repo so clients only ever parse one shape.
type Envelope struct {
	Success bool   `json:"success" example:"true"`
	Message string `json:"message" example:"article created"`
	Data    any    `json:"data,omitempty"`
	Meta    *Meta  `json:"meta,omitempty"`
	Error   string `json:"error,omitempty"`
}

// Meta carries pagination info for list endpoints.
type Meta struct {
	Limit  int `json:"limit" example:"10"`
	Offset int `json:"offset" example:"0"`
	Count  int `json:"count" example:"3"`
}

// Success writes a 2xx envelope: {"success":true,"message":...,"data":...}.
func Success(c *gin.Context, status int, message string, data any) {
	c.JSON(status, Envelope{Success: true, Message: message, Data: data})
}

// Paginated writes a 200 envelope with list + pagination meta.
func Paginated(c *gin.Context, message string, data any, limit, offset, count int) {
	c.JSON(200, Envelope{
		Success: true,
		Message: message,
		Data:    data,
		Meta:    &Meta{Limit: limit, Offset: offset, Count: count},
	})
}

// Fail writes an error envelope: {"success":false,"error":...}.
func Fail(c *gin.Context, status int, message string) {
	c.JSON(status, Envelope{Success: false, Error: message})
}
