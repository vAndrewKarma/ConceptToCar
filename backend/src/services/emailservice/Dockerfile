FROM golang:1.24-alpine AS builder

WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN go build -o main .

FROM alpine:latest
 
COPY --from=builder /app/main /usr/local/bin/main
 
RUN chmod +x /usr/local/bin/main
 
CMD ["/usr/local/bin/main"]
