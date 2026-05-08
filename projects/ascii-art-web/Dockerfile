# Build stage
FROM golang:1.21-alpine AS builder

LABEL stage=build

WORKDIR /build

COPY . .

RUN CGO_ENABLED=0 GOOS=linux go build -o server .

# Runtime stage
FROM alpine:latest

LABEL org.opencontainers.image.title="ascii-art-web"
LABEL org.opencontainers.image.description="Web application for generating ASCII art"
LABEL org.opencontainers.image.version="1.0.0"
LABEL org.opencontainers.image.authors="Zone01 students: gkoutzos, cktistak, ikountour"
LABEL stage=runtime

WORKDIR /app

COPY --from=builder /build/server .
COPY --from=builder /build/templates ./templates
COPY --from=builder /build/banners ./banners
COPY --from=builder /build/static ./static

RUN apk --no-cache add curl

RUN adduser -D appuser && chown -R appuser /app
USER appuser

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8080/ || exit 1

CMD ["./server"]