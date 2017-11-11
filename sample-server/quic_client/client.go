package main

import (
	"crypto/tls"
	"fmt"
	"strconv"
	"sync"
	// "time"
	"github.com/lucas-clemente/quic-go"
)

// Simple error verification
func CheckError(err error) 	{
	if err != nil {
		fmt.Println("Error: ", err)
	}
}

const addr1 = "10.173.212.248:10000"
const addr2 = "10.173.212.248:12345"

func main() {
	// Open sessions to send packets
	config := quic.Config{RequestConnectionIDOmission: false}

	var sessions [2]quic.Session

	session1, err := quic.DialAddr(addr1, &tls.Config{InsecureSkipVerify: true}, &config)
	CheckError(err)
	session2, err := quic.DialAddr(addr2, &tls.Config{InsecureSkipVerify: true}, &config)
	CheckError(err)

	sessions[0] = session1
	sessions[1] = session2

	// Open multiple streams with waitgroup so main doesn't close before the streams finish sending
	var wg sync.WaitGroup
	for i := 0; i < 2; i++ {
			wg.Add(1)
			defer wg.Done()
			go OpenStream(i, &sessions[i]);
	}
	wg.Wait()
}

// Open a new stream to send data over
func OpenStream(j int, session *quic.Session) {
	buf2 := make([]byte, 1024) //allocating memory
	stream, err := (*session).OpenStream()
	CheckError(err)
	for i := 0; i < 1000; i++ {
		SendPacket(j*1000+i, &stream, buf2)
		fmt.Println("hello " + strconv.Itoa(i))
	}
}

func SendPacket(i int, stream *quic.Stream, buf2 []byte) {
	msg := `{"id": "1234567890", "type": "hello", "data": { "n": ` + strconv.Itoa(i) + `}}`

	buf := []byte(msg)
	_, err := (*stream).Write(buf) // Write a message to the server
	CheckError(err)

	n, err := (*stream).Read(buf2) // Read a message from the server
	if err != nil {
		fmt.Println("Error:", err)
	} else {
		fmt.Printf("%s\n", buf2[0:n])
	}
}
