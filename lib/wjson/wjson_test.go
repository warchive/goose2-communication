package wjson

import (
	"testing"
	"github.com/mogball/wcomms/wbinary"
)

func TestPacketDecodeJson(t *testing.T) {
	packet := &wbinary.CommPacket{
		PacketType: wbinary.State,
		PacketName: "sensor12",
		Data1: 556.67,
		Data2: 420.69,
		Data3: -123.45,
	}
	encoded, err := PacketEncodeJson(packet)
	if err != nil {
		panic(err)
	}
	npacket, err := PacketDecodeJson(encoded)
	if err != nil {
		panic(err)
	}
	if *packet != *npacket {
		t.Fail()
	}
}
