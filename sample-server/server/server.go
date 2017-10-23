package main

import (
	"encoding/json"
	"fmt"
	"net"
	"os"

	"github.com/buger/jsonparser"
	"github.com/xtaci/kcp-go"
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
		success := true
		var id string
		var iderr error
		n, err := conn.Read(buf)
		if err != nil {
			fmt.Println("Error: ", err)
			success = false
		} else {
			data := buf[0:n]
			fmt.Printf("%s\n", string(data))
			id, iderr = jsonparser.GetString(data, "id")
		}
		if iderr == nil {
			acknowledgeMessage(conn, id, success)
		}
	}
}

func acknowledgeMessage(conn net.Conn, id string, success bool) {
	msg := map[string]interface{}{"id": id, "type": "recieved", "success": success}
	bytes, err := json.Marshal(msg)
	checkError(err)
	if err == nil {
		_, err2 := conn.Write(bytes)
		checkError(err2)
	}
}

func checkError(err error) {
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error: %s", err.Error())
	}
}
