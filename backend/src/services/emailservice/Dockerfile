FROM golang:1.24-alpine AS builder

WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN go build -o main .

FROM alpine:latest

# Copy the built binary into a standard location (e.g., /usr/local/bin)
COPY --from=builder /app/main /usr/local/bin/main

# Ensure the binary has execute permissions
RUN chmod +x /usr/local/bin/main

# Use an absolute path in CMD
CMD ["/usr/local/bin/main"]
