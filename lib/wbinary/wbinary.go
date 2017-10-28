package wbinary

import (
	"strconv"
	"math"
)

// Packet type
type PacketType uint8

// Packet type enums
const (
	Sensor  PacketType = iota // 00
	Command                   // 01
	State                     // 10
	Log                       // 11
)

func TypeToString(pType PacketType) string {
	switch pType {
	case Sensor:
		return "sensor"
	case Command:
		return "command"
	case State:
		return "state"
	case Log:
		return "log"
	default:
		return "unknown"
	}
}

func StringToType(pStr string) PacketType {
	switch pStr {
	case "sensor":
		return Sensor
	case "command":
		return Command
	case "state":
		return State
	case "log":
		return Log
	default:
		return Command
	}
}

// Packet specification:
// [start:1][type:2][name:6][data1:18][data2:18][data3:18][end:1]
var packetStructure = []uint{1, 2, 6, 18, 18, 18, 1}

// Communication packet type
type CommPacket struct {
	integrity  bool
	PacketType PacketType
	PacketName string
	Data1      float32
	Data2      float32
	Data3      float32
}

// Return the bit at position i in a byte array.
// Returns 0 or a value greater than 0
func ReadBit(buf []byte, i uint) byte {
	return buf[i/8] & (1 << (i % 8))
}

func SetBit(buf []byte, i uint, bit byte) {
	if bit > 0 {
		buf[i/8] |= 1 << (i % 8)
	} else {
		buf[i/8] &= ^(1 << (i % 8))
	}
}

// Reads no more than 32 bits at a time from
// a byte buffer between the start position i
// and end position j, inclusive
func ReadBits(buf []byte, i uint, j uint) uint32 {
	if i > j {
		j, i = i, j
	}
	var iStart = i / 8
	var jStart = j / 8
	var iMod = i % 8
	var jMod = j % 8
	if iStart >= uint(len(buf)) {
		return 0
	}
	if jStart >= uint(len(buf)) {
		jStart = uint(len(buf) - 1)
		jMod = 7
	}
	if iStart == jStart {
		return uint32((buf[iStart] >> iMod) & (0xff >> (7 - jMod + iMod)))
	}
	var res uint32 = 0
	var ptr = 8 - iMod
	res |= uint32(buf[iStart] >> iMod)
	iStart++
	for ; iStart < jStart; iStart++ {
		res |= uint32(buf[iStart]) << ptr
		ptr += 8
	}
	res |= uint32(buf[jStart]&(0xff>>(7-jMod))) << ptr
	return res
}

func SetBits(buf []byte, bits uint32, i uint, length uint) {
	bits &= 0xffffffff >> (0x20 - length)
	var j = i + length - 1
	var iStart = i / 8
	var jStart = j / 8
	var iMod = i % 8
	var jMod = j % 8
	// Assume that the provided index and length are valid
	if iStart == jStart {
		val := byte(bits)
		buf[iStart] &= ^((0xff >> (7 - jMod)) & (0xff << iMod))
		buf[iStart] |= val << iMod
		return
	}
	var slice = byte(bits)
	buf[iStart] &= ^(0xff >> iMod << iMod)
	buf[iStart] |= slice << iMod
	var bitPtr = 8 - iMod
	iStart++
	for ; iStart < jStart; iStart++ {
		slice = byte(bits >> bitPtr)
		buf[iStart] = slice
		bitPtr += 8
	}
	buf[jStart] &= 0xff >> jMod << jMod
	buf[jStart] |= byte(bits >> bitPtr)
}

// Read segments of bits, no larger than
// 32 bits as defined by shape
func ReadSegments(buf []byte, shape []uint) []uint32 {
	var shapeLen = uint(len(shape))
	var bufLen = uint(len(buf))
	var i uint = 0
	var k uint = 0
	var result = make([]uint32, shapeLen, shapeLen)
	for i < bufLen*8 && k < shapeLen {
		result[k] = ReadBits(buf, i, i+shape[k]-1)
		i += shape[k]
		k++
	}
	return result
}

func WriteSegments(buf []byte, shape []uint, values []uint32) {
	var shapeLen = uint(len(shape))
	var bufLen = uint(len(buf))
	var k uint = 0
	var i uint = 0
	for i < bufLen*8 && k < shapeLen {
		SetBits(buf, values[k], i, shape[k])
		i += shape[k]
		k++
	}
}

// Floating point specifications:
// [decimalPart:7][integerPart:10][sign:1]
func DecodeFloat18(bits uint32) float32 {
	var decimalPart = uint8(bits & 0x7f)
	var integerPart = uint16(bits & 0x01ff80 >> 7)
	if decimalPart > 99 {
		decimalPart = 99 // truncate decimal part
	}
	var result float32 = 0.0
	result += float32(decimalPart) / 100.0
	result += float32(integerPart)
	if bits&0x020000 > 0 {
		result *= -1
	}
	return result
}

func EncodeFloat18(val float32) uint32 {
	var sign uint32 = 0
	if val < 0 {
		sign = 1
		val *= -1
	}
	var integerPartF = float32(math.Floor(float64(val)))
	var decimalPartF = math.Floor(float64((val - integerPartF) * 100) + 0.5)
	var integerPart = uint32(integerPartF)
	var decimalPart = uint32(decimalPartF)
	return (sign << 17) | (integerPart << 7) | decimalPart
}

// Returns the packet name given a number
// between 0 and 63
func GetPacketName(bits uint32) string {
	// TODO implement the name mapping
	return "sensor" + strconv.Itoa(int(bits))
}

func EncodePacketName(packetName string) uint32 {
	val, err := strconv.Atoi(packetName[6:])
	if err != nil {
		return 0
	}
	return uint32(val)
}

// Read the packet data as defined by the packet
// structure. Function will try to read as much
// data as possible.
func ReadPacket(buf []byte) *CommPacket {
	var bitSegments = ReadSegments(buf, packetStructure)
	var nSegments = len(bitSegments)
	var packet CommPacket
	packet.integrity = (len(buf) == 8) && (ReadBit(buf, 0) > 0) && (ReadBit(buf, 63) > 0)
	if nSegments > 1 {
		packet.PacketType = PacketType(bitSegments[1])
	}
	if nSegments > 2 {
		packet.PacketName = GetPacketName(bitSegments[2])
	}
	if nSegments > 3 {
		packet.Data1 = DecodeFloat18(bitSegments[3])
	}
	if nSegments > 4 {
		packet.Data2 = DecodeFloat18(bitSegments[4])
	}
	if nSegments > 5 {
		packet.Data3 = DecodeFloat18(bitSegments[5])
	}
	return &packet
}

func WritePacket(packet *CommPacket) []byte {
	var bitSegments = make([]uint32, 7, 7)
	bitSegments[0] = 1
	bitSegments[6] = 1
	bitSegments[1] = uint32(packet.PacketType)
	bitSegments[2] = uint32(EncodePacketName(packet.PacketName))
	bitSegments[3] = EncodeFloat18(packet.Data1)
	bitSegments[4] = EncodeFloat18(packet.Data2)
	bitSegments[5] = EncodeFloat18(packet.Data3)
	var buf = make([]byte, 8, 8)
	WriteSegments(buf, packetStructure, bitSegments)
	return buf
}
