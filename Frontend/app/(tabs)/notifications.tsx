import React, { useCallback, useMemo, useRef } from 'react';
import { StyleSheet, View, Text, Button } from 'react-native';
import BottomSheet, { BottomSheetBackdrop } from '@gorhom/bottom-sheet';

export default function TabOneScreen() {
  const snapPoints = useMemo(() => ['25%', '50%', '70%'], []);
  const bottomSheetRef = useRef<BottomSheet>(null);

  const handleClosePress = () => bottomSheetRef.current?.close();
  const handleOpenPress = () => bottomSheetRef.current?.expand();
  const handleCollapsePress = () => bottomSheetRef.current?.collapse();
  const snapToIndex = (index: number) => bottomSheetRef.current?.snapToIndex(index);

  const renderBackdrop = useCallback(
    //@ts-ignore
    (props) => <BottomSheetBackdrop appearsOnIndex={0} disappearsOnIndex={-1} {...props} />,
    []
  );

  return (
    <View style={styles.container}>
      <View style={styles.buttonContainer}>
        <Button title="Open" onPress={handleOpenPress} />
        <Button title="Close" onPress={handleClosePress} />
        <Button title="Collapse" onPress={handleCollapsePress} />
        <Button title="Snap To 0" onPress={() => snapToIndex(0)} />
        <Button title="Snap To 1" onPress={() => snapToIndex(1)} />
        <Button title="Snap To 2" onPress={() => snapToIndex(2)} />
      </View>

      <BottomSheet
        ref={bottomSheetRef}
        index={0}
        snapPoints={snapPoints}
        enablePanDownToClose={true}
        backdropComponent={renderBackdrop}
        handleIndicatorStyle={{ backgroundColor: '#fff' }}
        backgroundStyle={{ backgroundColor: '#1d0f4e' }}
      >
        <View style={styles.contentContainer}>
          <Text style={styles.containerHeadline}>Awesome Bottom Sheet 🎉</Text>
          <Button title="Close" onPress={handleClosePress} />
        </View>
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#f0f0f0',
  },
  buttonContainer: {
    position: 'absolute',
    top: 20,
    alignSelf: 'center',
    zIndex: 10, // Ensure buttons stay on top of the bottom sheet
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#1d0f4e', // Match background for better visibility
  },
  containerHeadline: {
    fontSize: 24,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 20,
  },
});