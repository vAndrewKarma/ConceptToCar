package main

import (
    "encoding/json"
    "fmt"
    "log"
    "net/smtp"
    "os"
    "time"

    amqp "github.com/rabbitmq/amqp091-go"
)

// EmailMessage holds the email data.
type EmailMessage struct {
    Body    string `json:"body"`
    Subject string `json:"subject"`
    To      string `json:"to"`
}

// sendEmail sends an email using SMTP.
func sendEmail(to, subject, body string) error {
    from := os.Getenv("EMAIL_FROM")
    password := os.Getenv("EMAIL_PASSWORD")
    smtpHost := os.Getenv("SMTP_HOST")
    smtpPort := os.Getenv("SMTP_PORT")
    if from == "" || password == "" || smtpHost == "" || smtpPort == "" {
        return fmt.Errorf("missing one or more required email environment variables")
    }

    msg := []byte("To: " + to + "\r\n" +
        "Subject: " + subject + "\r\n" +
        "\r\n" +
        body + "\r\n")

    auth := smtp.PlainAuth("", from, password, smtpHost)
    return smtp.SendMail(smtpHost+":"+smtpPort, auth, from, []string{to}, msg)
}

// connectRabbitMQ attempts to connect to RabbitMQ with retries.
func connectRabbitMQ(amqpURL string) (*amqp.Connection, error) {
    var conn *amqp.Connection
    var err error
    for i := 0; i < 5; i++ {
        conn, err = amqp.Dial(amqpURL)
        if err == nil {
            return conn, nil
        }
        log.Printf("Failed to connect to RabbitMQ: %v. Retrying in 5 seconds...", err)
        time.Sleep(5 * time.Second)
    }
    return nil, err 
}

func main() {
    // Read RabbitMQ connection URL from env var (with a default fallback)
    amqpURL := os.Getenv("RabbitMQ")
    if amqpURL == "" {
        amqpURL = "amqp://guest:guest@localhost:5672/"
    }

    conn, err := connectRabbitMQ(amqpURL)
    if err != nil {
        log.Fatalf("Could not connect to RabbitMQ after several attempts: %v", err)
    }
    defer conn.Close()

    ch, err := conn.Channel()
    if err != nil {
        log.Fatalf("failed to open channel: %v", err)
    }
    defer ch.Close()

    q, err := ch.QueueDeclare(
        "auth.sendEmail",
        true,
        false,
        false,
        false,
        amqp.Table{
            "x-message-ttl": int32(60000 * 60 * 24),
            "x-expires":     int32(3600000),
        },
    )
    if err != nil {
        log.Fatalf("failed to declare queue: %v", err)
    }

    msgs, err := ch.Consume(
        q.Name,
        "",
        true,
        false,
        false,
        false,
        nil,
    )
    if err != nil {
        log.Fatalf("failed to register consumer: %v", err)
    }

    forever := make(chan bool)
    go func() {
        for d := range msgs {
            var emailMsg EmailMessage
            if err := json.Unmarshal(d.Body, &emailMsg); err != nil {
                log.Printf("error parsing message: %v", err)
                continue
            }
            if err := sendEmail(emailMsg.To, emailMsg.Subject, emailMsg.Body); err != nil {
                log.Printf("error sending email to %s: %v", emailMsg.To, err)
            } else {
                log.Printf("email sent to %s successfully", emailMsg.To)
            }
        }
    }()

    log.Println("Waiting for messages. To exit press CTRL+C")
    <-forever
}
