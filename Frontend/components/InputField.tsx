import { StyleSheet, View, Text } from "react-native";
import React from "react";
import { TextInput } from "react-native-gesture-handler";

type Props = {};

const InputField = (props: React.ComponentProps<typeof TextInput>) => {
  return (
    <View>
      <TextInput
        style={styles.inputField}
        {...props}
      />
    </View>
  );
};

export default InputField;

const styles = StyleSheet.create({
  inputField: {
    backgroundColor: "white",
    paddingVertical: 12,
    paddingHorizontal: 18,
    alignSelf: "stretch",
    borderRadius: 5,
    fontSize: 16,
    color: "black",
    
  },
});
