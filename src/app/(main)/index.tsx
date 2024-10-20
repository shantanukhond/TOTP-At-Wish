import { Text, StyleSheet, View, Modal, TextInput, TouchableOpacity, Button, Alert, FlatList } from 'react-native';
import React, { Component, useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import Entypo from '@expo/vector-icons/Entypo';
import { router } from 'expo-router';
import * as SQLite from 'expo-sqlite';
const STRINGS = require('../../constants/strings');
import { TOTP } from 'otpauth';


interface totp {
  name: string
  secret: string
  algorithm: string
  created_date: string
  digits: number
  id: number
  issuer: string
  last_modified_date: string
  logo: string
  user_identifier: string
}

var totp_list: totp[] = []
// Define the state interface
interface State {
  modalVisible: boolean;
  keyInput: string;
  currentTime: string
}

export default class Main extends Component<{}, State> {
  private intervalId: NodeJS.Timeout | null = null; // Store the interval ID
  
  private seconds = "30"

  constructor(props: any) {
    super(props);
    // Initialize state with the defined types
    const now = new Date();
    const currentTime = now.toLocaleTimeString(); // Get the current time as a string
    const secondTimer = now.getSeconds()
    this.seconds = (30 -(secondTimer%30)).toString()
    

    this.state = {
      modalVisible: false,
      keyInput: '',
      currentTime:''
    };

    this.getAllList()
    this.initTimer()
    
  }

  initTimer(){
    this.intervalId = setInterval(() => {

      const now = new Date();
      const currentTime = now.toLocaleTimeString(); // Get the current time as a string
      const secondTimer = now.getSeconds()
      this.seconds = (30 -(secondTimer%30)).toString()
      
      // if (now.getSeconds() === 30) {
        this.setState({currentTime:currentTime}) // Note: Directly calling render is not recommended; consider using setState
      // }
    }, 1000); // Check every second
  }

  getAllList() {
    const db = SQLite.openDatabaseSync(STRINGS.DB_NAME);
    totp_list = db.getAllSync("SELECT * FROM totp");
    console.log(totp_list)
  }

  toggleModal = () => {
    this.setState({ modalVisible: !this.state.modalVisible });
  };

  handleButtonPress = () => {
    Alert.alert('Input Text:', this.state.keyInput);
  };

  handlePressCamera = () => {
    router.push("/qrScannerModal")
  };

  getTotp(secret: string) {
    const totp = new TOTP({
      secret,
      digits: 6, // Length of the generated OTP
      // algorithm: 'SHA-256', // You can also use 'SHA-256' or 'SHA-512'
      period: 30, // Time period in seconds
    });

    var totp_val = ""
    try {
      totp_val = String(totp.generate())
    } catch (ex) {
      console.log(ex)
    }
    
    return totp_val
  }

  render() {
    return (
      <View style={styles.Container}>
        <View style={styles.ListViewContainer}>
          <FlatList
            data={totp_list}
            style={styles.ListView}
            keyExtractor={item => item.id.toString()}
            renderItem={({ item }) => (
              <View style={styles.ListItem}>
                <Text style={styles.itemText}>{item.name}</Text>
                <Text>{this.getTotp(item.secret)}  {this.seconds}</Text>
              </View>
            )}
          />
        </View>

        {/* Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={this.state.modalVisible}
          onRequestClose={this.toggleModal}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>

              <View>
                <TouchableOpacity style={styles.ContainerAlignCenter} onPress={this.handlePressCamera}>
                  <Entypo name="camera" size={24} color="black" />
                  <Text>Scan QR Code</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.containerLine}>
                <View style={styles.line} />
                <Text style={styles.orText}>OR</Text>
                <View style={styles.line} />
              </View>

              <TextInput
                style={styles.input}
                placeholder="Enter text"
                value={this.state.keyInput}
                onChangeText={(text) => this.setState({ keyInput: text })}
              />
              <Button title="Submit" onPress={this.handleButtonPress} />
              <TouchableOpacity onPress={this.toggleModal} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Floating Action Button */}
        <TouchableOpacity style={styles.fab} onPress={this.toggleModal}>
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>
    );
  }


  componentWillUnmount() {
    // Cleanup the interval when the component unmounts
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }
}



const styles = StyleSheet.create({
  Container: {
    height: '100%',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#03A9F4',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
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
  closeButton: {
    marginTop: 10,
  },
  closeButtonText: {
    color: '#03A9F4',
    fontSize: 16,
  },

  ContainerAlignCenter: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  containerLine: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: 'black',
  },
  orText: {
    marginHorizontal: 10,
    fontSize: 16,
    fontWeight: 'bold',
  },

  ListViewContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    width: "100%"
  },
  ListItem: {
    backgroundColor: '#f9c2ff',
    padding: 20,
    marginVertical: 8,
    borderRadius: 10,
    width: "100%"
  },
  itemText: {
    fontSize: 16,
  },
  ListView: {
    width: "100%"
  }
});
