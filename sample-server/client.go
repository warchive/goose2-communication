package main

import (
    "fmt"
    "net"
    "time"
    "strconv"
)

// Simple error verification
func CheckError(err error) {
    if err != nil {
        fmt.Println("Error: " , err)
    }
}

func main() {
    // Server address to send packets
    ServerAddr, err := net.ResolveUDPAddr("udp","127.0.0.1:10001")
    CheckError(err)

    // Local address
    LocalAddr, err := net.ResolveUDPAddr("udp", "127.0.0.1:0")
    CheckError(err)

    Conn, err := net.DialUDP("udp", LocalAddr, ServerAddr) // Send UDP packet from local address to server address
    CheckError(err)

    defer Conn.Close()
    i := 0
    for {
        // TODO send actual pod data to test

        msg := "Recieved packet number: " + strconv.Itoa(i) // Create message to be sent
        i++

        buf := []byte(msg)
        _, err := Conn.Write(buf) // Write a message to the server

        if err != nil {
            fmt.Println(msg, err)
        }
        time.Sleep(time.Second * 1) // Send a packet every second
    }
}
