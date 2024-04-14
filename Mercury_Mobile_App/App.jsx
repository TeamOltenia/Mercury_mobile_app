// import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';

export default function App() {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [qrData, setQRData] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [lastReceivedData, setLastReceivedData] = useState(null);

  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  useEffect(() => {
    if (qrData && !errorMessage) {
      const pollingInterval = setInterval(pollData, 15000); // Poll every 5 seconds
      return () => clearInterval(pollingInterval);
    }
  }, [qrData, errorMessage]);

  const handleBarCodeScanned = async ({ type, data }) => {
    setScanned(true);
    try {
      const response = await fetch(data);
      const jsonData = await response.json();
      setQRData(jsonData);
      setLastReceivedData(jsonData);
      if (jsonData.is_fraud) {
        setErrorMessage(`Error: Fraud detected - Amount: ${jsonData.amt}, Time: ${jsonData.unix_time}`);
      } else {
        setErrorMessage(null);
      }
    } catch (error) {
      console.error('Error fetching QR data:', error);
      setErrorMessage('Error fetching QR data');
    }
  };

  const pollData = async () => {
    try {
      const response = await fetch(qrData.url);
      const jsonData = await response.json();
      if (!jsonData.is_fraud && JSON.stringify(jsonData) === JSON.stringify(lastReceivedData)) {
        // Data is not fraudulent and same as last received, do nothing
        return;
      }
      setLastReceivedData(jsonData);
      if (jsonData.is_fraud) {
        setErrorMessage(`Error: Fraud detected - Amount: ${jsonData.amt}, Time: ${jsonData.unix_time}`);
      } else {
        setErrorMessage(null);
      }
    } catch (error) {
      console.error('Error polling QR data:', error);
    }
  };

  if (hasPermission === null) {
    return <View />;
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Camera permission not granted</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to the Barcode Scanner App!</Text>
      <Text style={styles.paragraph}>Scan a barcode to start your job.</Text>
      <View style={styles.cameraContainer}>
        <BarCodeScanner
          onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
          style={styles.camera}
        />
      </View>
      {errorMessage && <Text style={styles.error}>{errorMessage}</Text>}
      {qrData && !errorMessage && (
        <View style={styles.dashboard}>
          <Text style={styles.dashboardText}>Dashboard Menu</Text>
          {/* Display other dashboard components here */}
        </View>
      )}
      <TouchableOpacity
        style={[styles.button, scanned && styles.disabledButton]}
        onPress={() => setScanned(false)}
        disabled={scanned}
      >
        <Text style={styles.buttonText}>Scan QR to Start your job</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  paragraph: {
    fontSize: 16,
    marginBottom: 40,
  },
  cameraContainer: {
    width: '80%',
    aspectRatio: 1,
    overflow: 'hidden',
    borderRadius: 10,
    marginBottom: 40,
  },
  camera: {
    flex: 1,
  },
  button: {
    backgroundColor: 'blue',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: 'gray',
  },
  dashboard: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#eee',
    borderRadius: 5,
  },
  dashboardText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  error: {
    color: 'red',
    fontSize: 16,
    marginBottom: 10,
  },
});
