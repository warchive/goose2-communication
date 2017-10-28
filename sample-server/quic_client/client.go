package main

import (
	"crypto/tls"
	"fmt"
	"strconv"
	"time"
	// "time"
	"github.com/lucas-clemente/quic-go"
	// import kcp package
)

// Simple error verification
/*func CheckError(err error) 	{
	if err != nil {
		fmt.Println("Error: ", err)

	}
}*/

const addr = "162.243.171.232:10000"

func main() {
	// Server address to send packets
	config := quic.Config{RequestConnectionIDOmission: false}
	session, err := quic.DialAddr("localhost:10000", &tls.Config{InsecureSkipVerify: true}, &config)
	if err != nil {
		fmt.Println(err)
	}

	stream, err := session.OpenStreamSync()
	if err != nil {
		fmt.Println(err)
	}
	//CheckError(err)

	buf2 := make([]byte, 1024) //allocating memory for each integer
	for i := 0; i < 10000; i++ {
		// TODO send actual pod data to test
		/*msg := `{"id": "12313", type": "hello", "data": { "n": ` + strconv.Itoa(i) + `}}`

		buf := []byte(msg)
		_, err := (stream).Write(buf) // Write a message to the server
		if err != nil {
			fmt.Println("Error:", err)
		}

		n, err := (stream).Read(buf2) // Read a message from the server
		if err != nil {
			fmt.Println("Error:", err)
		} else {
			_ = n
			fmt.Printf("%s\n", buf2[0:n])
		}*/
		time.Sleep(time.Millisecond)
		go sendPacket(i, &stream, buf2)
		//time.Sleep(time.Millisecond * 1000) // Send a packet every second
	}
	for {
		time.Sleep(time.Millisecond * 1000)
	}
}

func sendPacket(i int, stream *quic.Stream, buf2 []byte) {
	msg := `{"id": "12313", type": "hello", "data": { "n": ` + strconv.Itoa(i) + `}}`

	buf := []byte(msg)
	_, err := (*stream).Write(buf) // Write a message to the server
	if err != nil {
		fmt.Println("Error:", err)
	}

	n, err := (*stream).Read(buf2) // Read a message from the server
	if err != nil {
		fmt.Println("Error:", err)
	} else {
		_ = n
		//mt.Printf("%s\n", buf2[0:n])
	}
}
