import React, { useCallback } from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';

const BottomSheetCmp = () => {
  // Define the snap points (closed, halfway, fully opened)
  const snapPoints = ["10%", "50%", "90%"];

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        {/* Background Content */}
        <Text style={styles.backgroundText}>This is the background</Text>

        {/* Bottom Sheet */}
        <BottomSheet
          index={0} // Initial snap point
          snapPoints={snapPoints}
          enablePanDownToClose={true}
        >
          <BottomSheetScrollView contentContainerStyle={styles.scrollContainer}>
            <Text style={styles.formHeader}>Collapsible Form</Text>
            {/* Example Form Content */}
            {Array(20)
              .fill(0)
              .map((_, index) => (
                <Text style={styles.formItem} key={index}>
                  Item {index + 1}
                </Text>
              ))}
          </BottomSheetScrollView>
        </BottomSheet>
      </View>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  backgroundText: {
    fontSize: 24,
    textAlign: "center",
    marginVertical: 20,
    color: "#333",
  },
  scrollContainer: {
    padding: 16,
    backgroundColor: "white",
  },
  formHeader: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  formItem: {
    padding: 10,
    fontSize: 16,
    backgroundColor: "#e9ecef",
    marginVertical: 5,
    borderRadius: 5,
  },
});

export default BottomSheetCmp;