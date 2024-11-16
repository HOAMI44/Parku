import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router"; // Importiere den Router
import { supabase } from '../lib/supabase'; // Make sure you have this configured

const SignInDetail = () => {
  const router = useRouter(); // Router initialisieren

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");

  const createUser = async () => {
    try {
      // Get the current user's ID from Supabase Auth
      const { data: { user } } = await supabase.auth.getUser();
      console.log(user);
      if (!user) {
        console.error('No authenticated user found');
        return;
      }

      const { data, error } = await supabase
        .from('users')
        .insert([
          {
            id: user.id,
            first_name: firstName,
            last_name: lastName,
            phone_number: phone,
            role: 'individual'
          }
        ])
        .select();

      if (error) {
        console.error('Error creating user:', error);
        return;
      }

      router.dismissAll();
      router.push("/(tabs)");
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Complete Your Profile</Text>
        <Text style={styles.subtitle}>Enter your details to continue</Text>
      </View>

      {/* First Name Input */}
      <View style={styles.inputContainer}>
        <Ionicons name="person-outline" size={20} color="gray" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="First Name"
          value={firstName}
          onChangeText={setFirstName}
        />
      </View>

      {/* Last Name Input */}
      <View style={styles.inputContainer}>
        <Ionicons name="person-outline" size={20} color="gray" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Last Name"
          value={lastName}
          onChangeText={setLastName}
        />
      </View>

      {/* Phone Input */}
      <View style={styles.inputContainer}>
        <Ionicons name="call-outline" size={20} color="gray" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Phone Number"
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
        />
      </View>

      {/* Continue Button */}
      <TouchableOpacity
        style={styles.continueButton}
        onPress={createUser}
      >
        <LinearGradient
          colors={["#82DFF1", "#82DFF1"]}
          style={styles.gradient}
        >
          <Text style={styles.continueText}>Continue</Text>
          <Ionicons name="arrow-forward-outline" size={20} color="white" />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

export default SignInDetail;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 30,
    backgroundColor: "#f8f8f8",
  },
  header: {
    marginBottom: 50,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "black",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "gray",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 12,
    marginBottom: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  continueButton: {
    marginTop: 20,
  },
  gradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    borderRadius: 25,
  },
  continueText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginRight: 5,
  },
});
