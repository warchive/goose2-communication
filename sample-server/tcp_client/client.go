package main

import (
	"fmt"
	"net"
	"strconv"
)

func main() {

	// connect to this socket
	conn, _ := net.Dial("tcp", "192.168.43.97:8000")
	buf2 := make([]byte, 1024)
	for i := 0; i < 100000; i++ {
		// send to socket

		msg := `{"id": "12313", type": "hello", "data": { "n": ` + strconv.Itoa(i) + `}}`

		buf := []byte(msg)
		_, err := conn.Write(buf) // Write a message to the server
		// listen for reply
		//allocating memory for each integer
		n, err := conn.Read(buf2) // Read a message from the server
		if err != nil {
			fmt.Println("Error:", err)
		} else {
			//fmt.Printf("%s\n", buf2[0:n])
			_ = n
		}
		//fmt.Print("Message from server: " + message)
	}
}
