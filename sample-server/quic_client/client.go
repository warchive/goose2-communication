package main

import (
	"crypto/tls"
	"fmt"
	"strconv"
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

func main() {
	// Server address to send packets
	session, err := quic.DialAddr("localhost:10000", &tls.Config{InsecureSkipVerify: true}, nil)
	if err != nil {
		return
	}

	stream, err := session.OpenStreamSync()
	if err != nil {
		return
	}
	//CheckError(err)

	buf2 := make([]byte, 1024) //allocating memory for each integer
	for i := 0; i < 1000000; i++ {
		// TODO send actual pod data to test

		msg := `{"id": "12313", type": "hello", "data": { "n": ` + strconv.Itoa(i) + `}}`

		buf := []byte(msg)
		_, err := stream.Write(buf) // Write a message to the server

		n, err := stream.Read(buf2) // Read a message from the server
		if err != nil {
			fmt.Println("Error:", err)
		} else {
			_ = n
			//fmt.Printf("%s\n", buf2[0:n])
		}
		// time.Sleep(time.Millisecond * 1000) // Send a packet every second
	}
}
