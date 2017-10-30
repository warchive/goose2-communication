package wbinary

import (
	"math"
	"testing"
)

func TestReadBit(t *testing.T) {
	var buf = []byte{3, 12, 128, 99}
	if ReadBit(buf, 0) < 1 {
		t.Fail()
	}
	if ReadBit(buf, 1) < 1 {
		t.Fail()
	}
	if ReadBit(buf, 7) != 0 {
		t.Fail()
	}
	if ReadBit(buf, 9) != 0 {
		t.Fail()
	}
	if ReadBit(buf, 10) < 1 {
		t.Fail()
	}
	if ReadBit(buf, 23) < 1 {
		t.Fail()
	}
	if ReadBit(buf, 25) < 1 {
		t.Fail()
	}
	if ReadBit(buf, 31) != 0 {
		t.Fail()
	}
}

func TestSetBit(t *testing.T) {
	var buf = []byte{255, 255, 255, 255}
	SetBits(buf, 629, 10, 10)
	if ReadBits(buf, 10, 19) != 629 {
		t.Fail()
	}
	buf = []byte{0, 0, 0, 0}
	SetBits(buf, 629, 10, 10)
	if ReadBits(buf, 10, 19) != 629 {
		t.Fail()
	}
}

func TestReadBits(t *testing.T) {
	var buf = []byte{3, 172, 128, 99}
	for i := 1; i < 8; i++ {
		if ReadBits(buf, 0, uint(i)) != 3 {
			t.Fail()
		}
	}
	if ReadBits(buf, 0, 0) != 1 {
		t.Fail()
	}
	if ReadBits(buf, 1, 1) != 1 {
		t.Fail()
	}
	if ReadBits(buf, 1, 7) != 1 {
		t.Fail()
	}
	if ReadBits(buf, 1, 10) != 513 {
		t.Fail()
	}
	if ReadBits(buf, 0, 13) != 11267 {
		t.Fail()
	}
	if ReadBits(buf, 5, 15) != 1376 {
		t.Fail()
	}
	if ReadBits(buf, 0, 31) != 1669377027 {
		t.Fail()
	}
	if ReadBits(buf, 13, 30) != 203781 {
		t.Fail()
	}
	if ReadBits(buf, 30, 13) != 203781 {
		t.Fail()
	}
	if ReadBits(buf, 50, 51) != 0 {
		t.Fail()
	}
	if ReadBits(buf, 28, 50) != 6 {
		t.Fail()
	}
}

func TestReadSegments(t *testing.T) {
	var buf = []byte{218, 73, 85, 117}
	var shape = []uint{1, 5, 6, 6, 12, 2}
	var result = ReadSegments(buf, shape)
	var expected = []uint32{0, 13, 39, 20, 3413, 1}
	if len(expected) != len(result) {
		t.Errorf("Expected length %d but got %d", len(expected), len(result))
		t.Fail()
	}
	for i := 0; i < 6; i++ {
		if result[i] != expected[i] {
			t.Errorf("Expected %d but got %d", expected[i], result[i])
			t.Fail()
		}
	}
}

func TestReadSegmentsUnderFlow(t *testing.T) {
	var buf = []byte{218, 73, 85, 117}
	var shape = []uint{1, 5, 6, 6, 9}
	var result = ReadSegments(buf, shape)
	var expected = []uint32{0, 13, 39, 20, 341}
	if len(expected) != len(result) {
		t.Errorf("Expected length %d but got %d", len(expected), len(result))
		t.Fail()
	}
	for i := 0; i < 5; i++ {
		if result[i] != expected[i] {
			t.Errorf("Expected %d but got %d", expected[i], result[i])
			t.Fail()
		}
	}
}

func TestReadSegmentsOverFlow(t *testing.T) {
	var buf = []byte{218, 73, 85, 117}
	var shape = []uint{1, 5, 6, 6, 12, 12, 5}
	var result = ReadSegments(buf, shape)
	var expected = []uint32{0, 13, 39, 20, 3413, 1, 0}
	if len(expected) != len(result) {
		t.Errorf("Expected length %d but got %d", len(expected), len(result))
		t.Fail()
	}
	for i := 0; i < 7; i++ {
		if result[i] != expected[i] {
			t.Errorf("Expected %d but got %d", expected[i], result[i])
			t.Fail()
		}
	}
}

func TestWriteSegments(t *testing.T) {
	var buf = []byte{218, 73, 85, 117}
	var shape = []uint{1, 5, 6, 6, 12, 2}
	var result = ReadSegments(buf, shape)
	var nbuf = []byte{0, 0, 0, 0}
	WriteSegments(nbuf, shape, result)
	for i := 0; i < 4; i++ {
		if nbuf[i] != buf[i] {
			t.Error("Expected %d but got %d at %d", buf[i], nbuf[i], i)
			t.Fail()
		}
	}
}

func TestEncodePacketName(t *testing.T) {
	var bits uint32 = 252
	name := GetPacketName(bits)
	if EncodePacketName(name) != bits {
		t.Fail()
	}
}

func TestDecodeFloat18(t *testing.T) {
	var result = DecodeFloat18(223862)
	var expected float32 = -724.99
	if math.Abs(float64(result-expected)) > 0.00001 {
		t.Errorf("Expected %.2f but go %.2f", expected, result)
		t.Fail()
	}
	result = DecodeFloat18(108341)
	expected = 846.53
	if math.Abs(float64(result-expected)) > 0.00001 {
		t.Errorf("Expected %.2f but go %.2f", expected, result)
		t.Fail()
	}
}

func TestEncodeFloat18(t *testing.T) {
	if EncodeFloat18(-724.99) != 223843 {
		t.Fail()
	}
	if EncodeFloat18(846.53) != 108341 {
		t.Fail()
	}
}

func TestReadPacket(t *testing.T) {
	var buf = []byte{181, 237, 212, 174, 57, 109, 167, 155}
	var packet = ReadPacket(buf)
	var expected = CommPacket{
		integrity:  true,
		PacketType: State,
		PacketName: "sensor54",
		Data1:      -724.99,
		Data2:      846.53,
		Data3:      442.59,
	}
	if packet.integrity != expected.integrity {
		t.Errorf("Expected integrity [%b] but got [%b]", expected.integrity, packet.integrity)
		t.Fail()
	}
	if packet.PacketType != expected.PacketType {
		t.Errorf("Expected packet type [%d] but got [%d]", expected.PacketType, packet.PacketType)
		t.Fail()
	}
	if packet.PacketName != expected.PacketName {
		t.Errorf("Expected packet name [%s] but got [%s]", expected.PacketName, packet.PacketName)
		t.Fail()
	}
	if math.Abs(float64(packet.Data1-expected.Data1)) > 0.00001 {
		t.Errorf("Expected Data1 [%.2f] but got [%.2f]", expected.Data1, packet.Data1)
		t.Fail()
	}
	if math.Abs(float64(packet.Data2-expected.Data2)) > 0.00001 {
		t.Errorf("Expected Data2 [%.2f] but got [%.2f]", expected.Data2, packet.Data2)
		t.Fail()
	}
	if math.Abs(float64(packet.Data3-expected.Data3)) > 0.00001 {
		t.Errorf("Expected Data3 [%.2f] but got [%.2f]", expected.Data3, packet.Data3)
		t.Fail()
	}
}

func TestWritePacket(t *testing.T) {
	var buf = []byte{181, 199, 212, 174, 57, 109, 167, 155}
	var packet = ReadPacket(buf)
	var nbuf = WritePacket(packet)
	for i := 0; i < 8; i++ {
		if nbuf[i] != buf[i] {
			t.Errorf("Expected %d but got %d at %d", buf[i], nbuf[i], i)
			t.Fail()
		}
	}
}
