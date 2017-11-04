package main

import (
	"fmt"
	"strconv"
	// "time"

	kcp "github.com/xtaci/kcp-go" // import kcp package

)

// Simple error verification
/*func CheckError(err error) 	{
	if err != nil {
		fmt.Println("Error: ", err)

	}
}*/

func main() {
	// Server address to send packets
	kcpconn, _ := kcp.DialWithOptions("10.173.212.248:10000", nil, 10, 3)
	//CheckError(err)

	defer kcpconn.Close()
	buf2 := make([]byte, 1024) //allocating memory for each integer
	for i := 0; i < 2000000; i++ {
		// TODO send actual pod data to test

		msg := `{"id": "12313", type": "hello", "data": { "n": ` + strconv.Itoa(i) + `}}`

		buf := []byte(msg)
		_, err := kcpconn.Write(buf) // Write a message to the server

		n, err := kcpconn.Read(buf2) // Read a message from the server
		if err != nil {
			fmt.Println("Error:", err)
		} else {
			_ = n
			//fmt.Printf("%s\n", buf2[0:n])
		}

		if err != nil {
			fmt.Println(msg, err)
		}
		// time.Sleep(time.Millisecond * 1000) // Send a packet every second
	}
}
