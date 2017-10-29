package main

import (
	"crypto/rand"
	"crypto/rsa"
	"crypto/tls"
	"crypto/x509"
	"encoding/json"
	"encoding/pem"
	"fmt"
	"math/big"
	"os"
	"time"

	"github.com/buger/jsonparser"
	"github.com/lucas-clemente/quic-go"
)

const addr = ":10000"

var i int

func main() {
	// Choose port to listen from
	config := quic.Config{IdleTimeout: 0}
	listener, err := quic.ListenAddr(addr, generateTLSConfig(), &config)
	checkError(err)
	fmt.Println("Server started")
	for {
		session, err := listener.Accept() // Wait for call and return a Conn
		if err != nil {
			break
		}
		go handleClient(session)
	}
}

func handleClient(session quic.Session) {
	defer session.Close(nil)
	for {
		stream, err := session.AcceptStream()
		if err != nil {
			fmt.Println(err)
			break
		} else {
			go handleStream(stream)
		}
	}
}

func handleStream(stream quic.Stream) {
	start := time.Now()
	buf := make([]byte, 1024)
	for {
		success := true
		var id string
		var iderr error
		n, err := stream.Read(buf)
		if err != nil {
			fmt.Println("Error: ", err)
			break
		} else {
			i++
			data := buf[0:n]
			if i%100 == 0 {
				fmt.Println(time.Duration(int64(time.Since(start)) / int64(i)))
				fmt.Printf("%s\n", string(data))
			}
			id, iderr = jsonparser.GetString(data, "id")
		}
		if iderr == nil {
			acknowledgeMessage(stream, id, success)
		}
	}
}

// Let client know message was recieved
func acknowledgeMessage(stream quic.Stream, id string, success bool) {
	msg := map[string]interface{}{"id": id, "type": "recieved", "success": success}
	bytes, err := json.Marshal(msg)
	checkError(err)
	if err == nil {
		_, err2 := stream.Write(bytes)
		checkError(err2)
	}
}

// Check and print errors
func checkError(err error) {
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error: %s", err.Error())
	}
}

// Setup a bare-bones TLS config for the server
func generateTLSConfig() *tls.Config {
	key, err := rsa.GenerateKey(rand.Reader, 1024)
	if err != nil {
		panic(err)
	}
	template := x509.Certificate{SerialNumber: big.NewInt(1)}
	certDER, err := x509.CreateCertificate(rand.Reader, &template, &template, &key.PublicKey, key)
	if err != nil {
		panic(err)
	}
	keyPEM := pem.EncodeToMemory(&pem.Block{Type: "RSA PRIVATE KEY", Bytes: x509.MarshalPKCS1PrivateKey(key)})
	certPEM := pem.EncodeToMemory(&pem.Block{Type: "CERTIFICATE", Bytes: certDER})

	tlsCert, err := tls.X509KeyPair(certPEM, keyPEM)
	if err != nil {
		panic(err)
	}
	return &tls.Config{Certificates: []tls.Certificate{tlsCert}}
}
