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

const addr = "10.173.212.248:10000"

func main() {
	// Server address to send packets
	config := quic.Config{RequestConnectionIDOmission: false}
	session, err := quic.DialAddr(addr, &tls.Config{InsecureSkipVerify: true}, &config)
	if err != nil {
		fmt.Println(err)
	}
	for j := 0; j < 50; j++ {
		stream, err := session.OpenStream()
		if err != nil {
			fmt.Println(err)
		}
		//CheckError(err)

		buf2 := make([]byte, 1024) //allocating memory for each integer
		go func(j int) {
			for i := 0; i < 1000; i++ {
				sendPacket(j*1000+i, &stream, buf2)
			}
		}(j)
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
