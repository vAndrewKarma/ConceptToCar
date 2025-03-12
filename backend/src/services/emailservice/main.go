package main

import (
	"encoding/json"
	"log"
	"net/smtp"

	"github.com/rabbitmq/amqp091-go"
)

type EmailMessage struct {
	Body    string `json:"body"`
	Subject string `json:"subject"` 
	To      string `json:"to"`
}

func sendEmail(to, subject, body string) error {
	log.Printf("sending email to %s", to)
	username := "87d0cc001@smtp-brevo.com"
	password := "rC9ROQyGXdKFT0Yh"
	smtpHost := "smtp-relay.brevo.com"
	smtpPort := "587"

	msg := []byte("From: admin <admin@conceptocar.xyz>\r\n" +
		"To: " + to + "\r\n" +
		"Subject: " + subject + "\r\n" +
		"\r\n" +
		body + "\r\n")

	auth := smtp.PlainAuth("", username, password, smtpHost)

	err := smtp.SendMail(smtpHost+":"+smtpPort, auth, "admin@conceptocar.xyz", []string{to}, msg)
	return err
}

func main() {
	conn, err := amqp091.Dial("amqp://guest:guest@localhost:5672/")
	if err != nil {
		log.Fatalf("failed to connect to RabbitMQ: %v", err)
	}
	defer conn.Close()

	ch, err := conn.Channel()
	if err != nil {
		log.Fatalf("failed to open a channel: %v", err)
	}
	defer ch.Close()

	q, err := ch.QueueDeclare(
		"auth.sendEmail", 
		true,             
		false,
		false,
		false,
		amqp091.Table{
			"x-message-ttl": int32(60000 * 60 * 24),
			"x-expires":     int32(3600000),
		},
	)
	if err != nil {
		log.Fatalf("failed to declare a queue: %v", err)
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
		log.Fatalf("failed to register a consumer: %v", err)
	}

	forever := make(chan bool)

	go func() {
		for d := range msgs {
			var emailMsg EmailMessage
			if err := json.Unmarshal(d.Body, &emailMsg); err != nil {
				log.Printf("error decoding message: %v", err)
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
