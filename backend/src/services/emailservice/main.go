package main

import (
	"encoding/json"
	"log"
	"net/smtp"

	"github.com/rabbitmq/amqp091-go"
	amqp "github.com/rabbitmq/amqp091-go"
)


type EmailMessage struct {
	Body string `json:"body"`
    Subject string `json:subject`
	To   string `json:"to"`
}


func sendEmail(to, subject, body string) error {
	from := "monserrat.senger@ethereal.email"
	password := "qyMKDV4uUcTHQd8aTs"
	smtpHost := "smtp.ethereal.email"
	smtpPort := "587"

	
	msg := []byte("To: " + to + "\r\n" +
	"Subject: " + subject + "\r\n" +
	"\r\n" +  
	body + "\r\n")

		
	auth := smtp.PlainAuth("", from, password, smtpHost)

	
	err := smtp.SendMail(smtpHost+":"+smtpPort, auth, from, []string{to}, msg)
	return err
}

func main() {
	conn, err := amqp091.Dial("amqp://guest:guest@localhost:5672/")
	if err != nil {
		log.Fatalf("failed: %v", err)
	}
	defer conn.Close()

	ch, err := conn.Channel()
	if err != nil {
		log.Fatalf("failed:  %v", err)
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
		log.Fatalf("failed: %v", err)
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
		log.Fatalf("failed: %v", err)
	}

	forever := make(chan bool)

	go func() {
		for d := range msgs {
			var emailMsg EmailMessage
			if err := json.Unmarshal(d.Body, &emailMsg); err != nil {
				log.Printf("error: %v", err)
				continue
			}

			if err := sendEmail(emailMsg.To, emailMsg.Subject,emailMsg.Body); err != nil {
				log.Printf("error sending email to %s: %v", emailMsg.To, err)
			} else {
				log.Printf("email sent to %s successfully", emailMsg.To)
			}
		}
	}()

	log.Println("Waiting for messages. To exit press CTRL+C")
	<-forever
}
