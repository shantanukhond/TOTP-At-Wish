import React, { useState } from "react";
import { useLocalSearchParams } from "expo-router/build/hooks";
import { View, Text, TextInput, Button, StyleSheet, Image } from "react-native";
import { saveToDatabase } from '../helpers/DbHandler'
import { CommonActions, useNavigation } from '@react-navigation/native';
import { router } from "expo-router";

export default function InputAppName() {
  const item = useLocalSearchParams().data;
  const app_data = JSON.parse(item as string);
  const navigation = useNavigation();


  const [accountName, setAccountName] = useState(app_data.account || "");

  const handleSave = () => {
    console.log("Saved account name:", accountName);
    app_data['account'] = accountName
    saveToDatabase(app_data)

    navigation.dispatch( CommonActions.reset({
      index: 0,
      routes: [{ name: 'index' }],
    })
  );
    // navigation.goBack()
    // Add your save logic here
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {/* App Icon */}
        <View style={styles.iconContainer}>
          <Image
            source={{
              uri: "https://via.placeholder.com/100", // Replace with app_data.icon if available
            }}
            style={styles.icon}
          />
        </View>

        {/* Account Name Field */}
        <Text style={styles.label}>Enter Account Name:</Text>
        <TextInput
          style={styles.input}
          placeholder="Account Name"
          value={accountName}
          onChangeText={setAccountName}
        />

        {/* Save Button */}
        <View style={styles.buttonContainer}>
          <Button title="Save" onPress={handleSave} color="#6200EE" />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  card: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    width: "90%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#e0e0e0",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  icon: {
    width: 90,
    height: 90,
    borderRadius: 45,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  input: {
    width: "100%",
    height: 50,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  buttonContainer: {
    width: "100%",
    marginTop: 10,
  },
});
