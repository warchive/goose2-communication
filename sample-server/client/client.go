package main

import (
	"fmt"
	"strconv"
	"time"

	kcp "github.com/xtaci/kcp-go"
)

// Simple error verification
func CheckError(err error) {
	if err != nil {
		fmt.Println("Error: ", err)

	}
}

func main() {
	// Server address to send packets
	kcpconn, err := kcp.DialWithOptions("localhost:10000", nil, 10, 3)
	CheckError(err)

	defer kcpconn.Close()
	for i := 0; i < 1000; i++ {
		// TODO send actual pod data to test

		msg := `{"type":"hello","data":"` + strconv.Itoa(i) + `"}`

		buf := []byte(msg)
		_, err := kcpconn.Write(buf) // Write a message to the server

		if err != nil {
			fmt.Println(msg, err)
		}
		time.Sleep(time.Millisecond * 1000) // Send a packet every second
	}
}
