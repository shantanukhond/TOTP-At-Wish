import { Text, StyleSheet, View, Modal, TextInput, TouchableOpacity, Button, Alert, FlatList } from 'react-native';
import React, { Component } from 'react';
import { Ionicons } from '@expo/vector-icons';
import Entypo from '@expo/vector-icons/Entypo';
import { router } from 'expo-router';
import * as SQLite from 'expo-sqlite';
const STRINGS = require('../../constants/strings');
import { TOTP } from 'otpauth';
import { Row, Col } from 'react-native-flex-grid';
import Fontisto from '@expo/vector-icons/Fontisto';
import AntDesign from '@expo/vector-icons/AntDesign';
import {validateTotpSecret} from '../helpers/SecretHelper'
import { showToast } from '../helpers/GenHelper'
import SecretModel from '../helpers/SecretModel';

// interface totp {
//   name: string;
//   secret: string;
//   algorithm: string;
//   created_date: string;
//   digits: number;
//   id: number;
//   issuer: string;
//   last_modified_date: string;
//   logo: string;
//   user_identifier: string;
// }

var totp_list: SecretModel[] = [];

// Define the state interface
interface State {
  modalVisible: boolean;
  secretInput: string;
  appNameInput: string;
  
  currentTime: string;
  dropdownVisible: number | null; // Track which item's dropdown is visible
}

export default class Main extends Component<{}, State> {
  private intervalId: NodeJS.Timeout | null = null;
  private seconds = '30';

  
    
  constructor(props: any) {
    super(props);
    const now = new Date();
    // const currentTime = now.toLocaleTimeString();
    const secondTimer = now.getSeconds();
    this.seconds = (30 - (secondTimer % 30)).toString();
    

    this.state = {
      modalVisible: false,
      secretInput: '',
      appNameInput:'',
      currentTime: '',
      dropdownVisible: null, // No dropdown is visible initially
    };

    this.getAllList();
    this.initTimer();
    this.redirectToInputAppName = this.redirectToInputAppName.bind(this);

  }


  initTimer() {
    this.intervalId = setInterval(() => {
      const now = new Date();
      const currentTime = now.toLocaleTimeString();
      const secondTimer = now.getSeconds();
      this.seconds = (30 - (secondTimer % 30)).toString();

      this.setState({ currentTime: currentTime });
    }, 1000);
  }


  onScreenFocus = () => {
    // Your logic when the screen comes into focus
    console.log("Perform necessary actions when screen is focused!");
  };


  getAllList() {
    const db = SQLite.openDatabaseSync(STRINGS.DB_NAME);
    totp_list = db.getAllSync('SELECT * FROM totp');
  }


  toggleModal = () => {
    this.setState({ modalVisible: !this.state.modalVisible });
  };


  handleButtonPress = () => {
    //Save the Secret to db
    if(this.state.appNameInput.length < 3){

    }else if(this.state.secretInput.length < 3){
     
    }else{
      const saveToDatabase = async () => {
        //Writing to db
        const db = SQLite.openDatabaseSync(STRINGS.DB_NAME);
        try {
          await db.execAsync(
            `
               INSERT INTO totp (name, logo, secret, created_date, last_modified_date, issuer, user_identifier, algorithm, digits)
          VALUES ('${this.state.appNameInput}',null, '${this.state.secretInput}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, null ,null, 'SHA1', 8);
            `,
          );
          
        } catch (ex) {
          console.log(ex)
        }
    
      }

      saveToDatabase()
    
    }
  };


  handlePressCamera = () => {
    router.push('/QrCodeScannerCam');
  };


  getTotp(secret: string) {
    const totp = new TOTP({
      secret,
      digits: 6,
      period: 30,
    });

    let totp_val = '';
    try {
      totp_val = String(totp.generate());
    } catch (ex) {
      console.log(ex);
    }

    return totp_val;
  }


  toggleDropdown = (id: number) => {
    if (this.state.dropdownVisible === id) {
      this.setState({ dropdownVisible: null });
    } else {
      this.setState({ dropdownVisible: id });
    }
  };


  deleteItem(id: number, name: string): void {


    Alert.alert(
      `Do you really want to delete ${name}?`,
      "This action is permanent and cannot be undone!",
      [
        {
          text: "Cancel",
          onPress: () => console.log("Deletion cancelled"),
          style: "cancel",
        },
        {
          text: "Delete",
          onPress: () => {
            const db = SQLite.openDatabaseSync(STRINGS.DB_NAME);
            const delete_result = db.getAllSync(`DELETE FROM totp where id=${id}`);
            console.log(delete_result)
            totp_list = db.getAllSync('SELECT * FROM totp');
            const now = new Date();
            const currentTime = now.toLocaleTimeString();

            this.setState({ currentTime: currentTime });
          },
          style: "destructive", // optional, makes the delete button red on iOS
        },
      ],
      { cancelable: false } // ensures the dialog won't be dismissed by tapping outside
    );
  };


  redirectToInputAppName(){
    const appKey = this.state.secretInput;
    // 
    if (!appKey || !validateTotpSecret(appKey)) {
      showToast("Please enter valid secret")
      return
    }

    router.push({
      pathname: "/InputAppName",
      params: { data: JSON.stringify({"secret":appKey}) }
    });
    
  }
  

  render() {


    return (
      <View style={styles.Container}>
        <View style={styles.ListViewContainer}>
          <FlatList
            data={totp_list}
            style={styles.ListView}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <View style={styles.ListItem}>
                <TouchableOpacity
                  onLongPress={() => this.toggleDropdown(item.id)}
                >
                  <Row>
                    <Col sm={2} style={styles.ColIcon}>
                      <Fontisto name="app-store" size={30} color="black" />
                    </Col>
                    <Col sm={10}>
                      <Text style={styles.itemText}>{item.name}</Text>
                      <Text>
                        {this.getTotp(item.secret)} {this.seconds}
                      </Text>
                    </Col>
                  </Row>
                </TouchableOpacity>

                {/* Dropdown menu */}
                {this.state.dropdownVisible === item.id && (
                  <View style={styles.dropdownMenu}>
                    <TouchableOpacity
                      style={styles.dropdownItem}
                      onPress={() => Alert.alert('Edit', `Edit ${item.name}`)}
                    >
                      <AntDesign name="edit" size={24} color="black" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.dropdownItem}
                      onPress={() => this.deleteItem(item.id, item.name)}
                    >
                      <Text><AntDesign name="delete" size={24} color="black" /></Text>
                    </TouchableOpacity>
                  </View>
                )}
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
                <TouchableOpacity
                  style={styles.ContainerAlignCenter}
                  onPress={this.handlePressCamera}
                >
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
                placeholder="Enter Key"
                value={this.state.secretInput}
                onChangeText={(text) => this.setState({ secretInput: text })}
              />
              <Button title="Submit" onPress={this.redirectToInputAppName} />
              <TouchableOpacity
                onPress={this.toggleModal}
                style={styles.closeButton}
              >
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
    width: '100%',
  },
  ListItem: {
    flex: 12,
    marginHorizontal: 'auto',
    backgroundColor: '#f9c2ff',
    padding: 20,
    marginVertical: 8,
    borderRadius: 10,
    width: '100%',
  },
  itemText: {
    fontSize: 16,
  },
  ListView: {
    width: '100%',
  },
  dropdownMenu: {
    position: 'absolute',
    top: 0,
    right: 0,
    borderRadius: 5,
    padding: 10,
    zIndex: 1000,
  },
  dropdownItem: {
    paddingVertical: 4,
  },
  ColIcon: {
    alignItems: "center",
    alignContent: "center",
    height: "100%",
    textAlign: "center"
  }
});


