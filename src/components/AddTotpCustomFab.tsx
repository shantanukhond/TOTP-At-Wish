import { router } from "expo-router";
import React, { useState } from "react";
import { TouchableOpacity, StyleSheet, View } from "react-native";

const AddTotpCustomFab = () => {
  const [isFabOpen, setIsFabOpen] = useState(false);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.fab}
        onPress={() => {
          setIsFabOpen(!isFabOpen);
          router.push("/add_totp_modal")
        }}
      >
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 30,
    right: 30,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#f00", // Customize your FAB color
    justifyContent: "center",
    alignItems: "center",
    elevation: 5, // Shadow effect
  },
});

export default AddTotpCustomFab;
