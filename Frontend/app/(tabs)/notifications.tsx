import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import BottomSheet from "@gorhom/bottom-sheet";

const NotificationsScreen = () => {
  const snapPoints = useMemo(() => ["25%", "50%", "70%"], []);

  return (
    <View style={styles.container}>
      <Text>Notifications Screen</Text>
      {/* Bottom Sheet */}
      <BottomSheet
        snapPoints={snapPoints}
        enablePanDownToClose={true}
        backgroundStyle={styles.bottomSheetBackground}
      >
        <View style={styles.sheetContent}>
          <Text>Hello from Bottom Sheet!</Text>
        </View>
      </BottomSheet>
    </View>
  );
};

export default NotificationsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  bottomSheetBackground: {
    backgroundColor: "white",
    borderRadius: 10,
  },
  sheetContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
});