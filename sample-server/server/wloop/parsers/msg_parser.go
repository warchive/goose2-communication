package parsers

import "encoding/json"

// MessageToJSONByteArray converts message to JSON byte array to be sent
func MessageToJSONByteArray(msgObject interface{}) ([]byte, error) {
	result, err := json.Marshal(msgObject)
	return result, err
}

// JSONByteArrayToMessage converts recieved JSON byte array to Message object
func JSONByteArrayToMessage(byteArray []byte, msg interface{}) error {
	err := json.Unmarshal(byteArray, &msg)
	return err
}
