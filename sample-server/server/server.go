package main

import (
	"fmt"
	"net"
	"os"

	"./wloop/message"
	"./wloop/parsers"

	kcp "github.com/xtaci/kcp-go"
)

func main() {

	listener, err := kcp.ListenWithOptions(":10000", nil, 10, 3)
	checkError(err)

	for {
		conn, err := listener.Accept()
		if err != nil {
			continue
		}
		go handleClient(conn)
	}
}

func handleClient(conn net.Conn) {
	defer conn.Close()

	buf := make([]byte, 1024)
	for {
		invalid := false
		n, err := conn.Read(buf)
		if err != nil {
			fmt.Println("Error: ", err)
			invalid = true
		} else {
			msg := message.ClientMessage{}
			err2 := parsers.JSONByteArrayToMessage(buf[0:n], &msg)
			if err2 != nil {
				invalid = true
			}
			fmt.Printf("%#v\n", msg)
		}
		if !invalid {
			/*_, err2 := conn.Write(buf[0:n])
			if err2 != nil {
				return
			}*/
		}
	}
}

func checkError(err error) {
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error: %s", err.Error())
		os.Exit(1)
	}
}
