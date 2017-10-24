package main

import (
	"fmt"
	"net"
	"strconv"
)

func main() {

	// connect to this socket
	conn, _ := net.Dial("tcp", "localhost:8000")
	buf2 := make([]byte, 1024)
	defer conn.Close()
	for i := 0; i < 1000000; i++ {
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
			_ = n
			//fmt.Printf("%s\n", buf2[0:n])
		}

		if err != nil {
			fmt.Println(msg, err)
		}
		//fmt.Print("Message from server: " + message)
	}
}
