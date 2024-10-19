import React, { useState, useEffect } from 'react';
import { Text, View, Button, StyleSheet, Dimensions, Alert } from 'react-native';
import { Camera } from 'expo-camera'; // Ensure this import is correct
import { BarcodeScanningResult, CameraView } from 'expo-camera'; // Import the type for barcodes
const STRINGS = require('../../constants/strings');
import * as SQLite from 'expo-sqlite';


export default function App() {
  // Set the type to allow 'null' and 'boolean'
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [scannedData, setScannedData] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [name, setName] = useState<string | null>(null); // Store username@appname
  const [cameraRef, setCameraRef] = useState<CameraView | null>(null);

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

    // Extract the secret and name (username@appname) from the scanned data
    if (data) {
      // Extract the secret
      const secretMatch = data.match(/secret=([^&]*)/);
      if (secretMatch) {
        setSecret(secretMatch[1]);
        Alert.alert("Secret Extracted", `Secret: ${secretMatch[1]}`);
      } else {
        Alert.alert("Error", "Could not extract secret from QR code.");
      }

      // Extract the username@appname
      const nameMatch = data.match(/otpauth:\/\/totp\/([^?]*)/);
      if (nameMatch) {
        const [appName, username] = nameMatch[1].split(':'); // Split 'AppName:username'
        const extractedName = `${username}@${appName}`; // Combine to 'username@appname'
        setName(extractedName);
        Alert.alert("Name Extracted", `Name: ${extractedName}\nScanned secret:${secretMatch?.[0]}`);

        // Simulate saving to database (you can replace this with actual database code)
        saveToDatabase(extractedName, secretMatch ? secretMatch[1] : null);
      } else {
        Alert.alert("Error", "Could not extract name from QR code.");
      }
    }
  };



  // Simulated function to save name and secret to the database
  const saveToDatabase = async (name: string, secret: string | null) => {
    //Writing to db
    const db = SQLite.openDatabaseSync(STRINGS.DB_NAME);
    try {
      await db.execAsync(
        `
           INSERT INTO totp (name, logo, secret, created_date, last_modified_date, issuer, user_identifier, algorithm, digits)
      VALUES ('${name}',null, '${secret}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, null, null, 'SHA-1', 6);
        `,
      );
      console.log(`Inserted into DB ${name}`)
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
});
