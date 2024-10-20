import React, { useState, useEffect } from 'react';
import { Text, View, Button, StyleSheet, Dimensions, Alert, Modal, TextInput } from 'react-native';
import { Camera } from 'expo-camera'; // Ensure this import is correct
import { BarcodeScanningResult, CameraView } from 'expo-camera'; // Import the type for barcodes
const STRINGS = require('../../constants/strings');
import * as SQLite from 'expo-sqlite';
import { useNavigation } from '@react-navigation/native';


interface TOTP_URI {
  type: string;
  account: string;
  secret: string;
  issuer?: string;
  algorithm?: string;
  digits?: number;
  period?: number;
}



const isBase32 = (str: string): boolean => {
  // Regex to match a Base32-encoded string (A-Z, 2-7, no padding or with padding).
  const base32Regex = /^[A-Z2-7]+=*$/;
  return base32Regex.test(str);
};

const parseTOTP_URI = (uri: string): TOTP_URI | null => {
  try {
    // Check that the URI starts with 'otpauth://totp/'
    const totpRegex = /^otpauth:\/\/totp\/(.+)\?(.+)/;
    const matches = uri.match(totpRegex);

    if (!matches) {
      throw new Error("Invalid TOTP URI format");
    }

    // Extract the account (user info) and query parameters.
    const account = matches[1];
    const queryParams = matches[2];

    // Parse query parameters into an object.
    const params = new URLSearchParams(queryParams);

    // Check if the secret exists and is a valid Base32 string.
    const secret = params.get('secret');
    if (!secret || !isBase32(secret)) {
      throw new Error('Invalid or missing secret parameter (must be Base32)');
    }

    // Extract the issuer, algorithm, digits, and period if provided.
    const issuer = params.get('issuer') || undefined;
    const algorithm = params.get('algorithm') || 'SHA-1'; // Defaults to 'SHA-1'
    const digits = parseInt(params.get('digits') || '6', 10); // Defaults to 6 digits
    const period = parseInt(params.get('period') || '30', 10); // Defaults to 30 seconds

    // Validate algorithm, digits, and period
    if (!['SHA1', 'SHA256', 'SHA512'].includes(algorithm)) {
      throw new Error('Invalid algorithm (must be SHA-1, SHA-256, or SHA-512)');
    }
    if (![6, 8].includes(digits)) {
      throw new Error('Invalid digits (must be 6 or 8)');
    }
    if (period <= 0) {
      throw new Error('Invalid period (must be a positive number)');
    }

    // Return the parsed and validated TOTP URI object.
    return {
      type: 'totp',
      account,
      secret,
      issuer,
      algorithm,
      digits,
      period,
    };
  } catch (error) {
    console.error('Error parsing TOTP URI:', error);
    return null;
  }
};

export default function App() {

  // Set the type to allow 'null' and 'boolean'
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [scannedData, setScannedData] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [name, setName] = useState<string | null>(null); // Store username@appname
  const [cameraRef, setCameraRef] = useState<CameraView | null>(null);
  const [modalVisible, setModalVisible] = useState(false); // Use useState for modal visibility
  const [appNameInput,setAppNameInput] = useState<string>(""); // Use useState for modal visibility
  const [totpParsedObj, setTotpParsedObj] = useState<TOTP_URI | null>(null); // Use useState for modal visibility
  const navigation = useNavigation();

  // Get the screen width to make the innerContainer square
  const screenWidth = Dimensions.get('window').width;

  


  // Request camera permission
  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  // Function to handle barcode scanning
  const handleBarCodeScanned = ({ type, data }: BarcodeScanningResult) => {
    setScanned(true);
    setScannedData(data);

    //otpauth://totp/{issuer}:{account}?secret={secret}&issuer={issuer}&algorithm={algorithm}&digits={digits}&period={period}

    // Extract the secret and name (username@appname) from the scanned data
    if (data) {
      // Extract the secret
      const parsedURI = parseTOTP_URI(data);

      if (parsedURI) {
        // console.log('Valid TOTP URI:', parsedURI);
       
        setTotpParsedObj(parsedURI)
        setAppNameInput(parsedURI.account||"")
        setModalVisible(true);
        
      } else {
        console.log('Invalid TOTP URI');
      }
    }
  };


  const toggleModal = () => {
    setModalVisible(!modalVisible);
  };

  const setTextVar = (text:string)=>{
    // useState({ keyInput: text })
    // appNameInput = text
    setAppNameInput(text)
  }
  
  // Simulated function to save name and secret to the database
  const saveToDatabase = async () => {
    //Writing to db
    const db = SQLite.openDatabaseSync(STRINGS.DB_NAME);
    try {
      await db.execAsync(
        `
           INSERT INTO totp (name, logo, secret, created_date, last_modified_date, issuer, user_identifier, algorithm, digits)
      VALUES ('${totpParsedObj?.account}',null, '${totpParsedObj?.secret}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, '${totpParsedObj?.issuer}',null, '${totpParsedObj?.algorithm}', ${totpParsedObj?.digits});
        `,
      );
      console.log(`Inserted into DB ${name}`)
      toggleModal()
      navigation.goBack()
    } catch (ex) {
      console.log(ex)
    }
    
  }

  if (hasPermission === null) {
    return <Text>Requesting for camera permission</Text>;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <View style={styles.container}>
      <View style={[styles.innerContainer, { width: screenWidth * 0.8, height: screenWidth * 0.8 }]}>
        <CameraView
          ref={(ref) => setCameraRef(ref)}
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          style={StyleSheet.absoluteFillObject}
        />
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={toggleModal}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View>
              <Text>{totpParsedObj?.issuer}</Text>
            </View>
            <TextInput
              style={styles.input}
              placeholder="Enter Account Name"
              value={appNameInput}
              onChangeText={(text) => setTextVar(text)}
            />
            <Button 
              title='SAVE'
              onPress={saveToDatabase}
             />
          </View>
        </View>

      </Modal>

      {scanned && (
        <Button
          title={'Tap to Scan Again'}
          onPress={() => setScanned(false)}
        />
      )}

      {scannedData && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultText}>Scanned Data: {scannedData}</Text>
        </View>
      )}

      {secret && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultText}>Extracted Secret: {secret}</Text>
        </View>
      )}

      {name && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultText}>Extracted Name: {name}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 10,
    overflow: 'hidden',
  },
  resultContainer: {
    position: 'absolute',
    bottom: 50,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
  },
  resultText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: 300,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
  },
  input: {
    width: '100%',
    borderBottomWidth: 1,
    borderColor: '#ccc',
    marginBottom: 20,
    paddingHorizontal: 5,
  },
});
