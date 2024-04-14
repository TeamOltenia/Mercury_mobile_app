import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { RNCamera } from 'react-native-camera';

const QRScanner = () => {
  const [scanned, setScanned] = useState(false);

  const onBarCodeRead = (event) => {
    if (!scanned) {
      setScanned(true);
      alert(`Scanned QR code: ${event.data}`);
    }
  };

  return (
    <View style={styles.container}>
      <RNCamera
        style={styles.camera}
        type={RNCamera.Constants.Type.back}
        onBarCodeRead={onBarCodeRead}
        captureAudio={false}
      >
        <View style={styles.overlay} />
      </RNCamera>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  camera: {
    flex: 1,
    width: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
});

export default QRScanner;
