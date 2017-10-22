package main

import (
	"fmt"
	"net"
	"os"
)

// Simple error verification
func CheckError(err error) {
    if err  != nil {
        fmt.Println("Error: " , err)
        os.Exit(0)
    }
}

func main() {
    // Prepare server address at port 10001
    ServerAddr,err := net.ResolveUDPAddr("udp",":10001")
    CheckError(err)

    // Listen in at the selected port
    ServerConn, err := net.ListenUDP("udp", ServerAddr)
    CheckError(err)
    defer ServerConn.Close()

    buf := make([]byte, 1024) // Allocates an object buf with a size of 1 byte

    // TODO recieve and parse pod data

    for {
        // Read packet from port
        n,addr,err := ServerConn.ReadFromUDP(buf)
        fmt.Println("Received ",string(buf[0:n]), " from ",addr)

        // TODO implement reliability layer for UDP

        if err != nil {
            fmt.Println("Error: ",err)
        }
    }
}
