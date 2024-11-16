import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Link, router, Stack } from "expo-router";
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

const LoginScreen = () => {
  const { session } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (session) {
      router.replace('/(tabs)');
    }
  }, [session]);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        Alert.alert("Error", error.message);
        return;
      }

      if (data.user) {
        router.dismissAll();
        router.push("/(tabs)");
      }
    } catch (error) {
      Alert.alert("Error", "Something went wrong. Please try again.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerTitle: "Login" }} />
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Login</Text>
          <Text style={styles.subtitle}>Please sign in to continue.</Text>
        </View>

        <View style={styles.inputContainer}>
          <Ionicons
            name="mail-outline"
            size={20}
            color="gray"
            style={styles.icon}
          />
          <TextInput
            style={styles.input}
            placeholder="Email"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputContainer}>
          <Ionicons
            name="lock-closed-outline"
            size={20}
            color="gray"
            style={styles.icon}
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity>
            <Text style={styles.forgotText}>Forgot</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.loginButton}
          onPress={handleLogin}
          disabled={isLoading}
        >
          <LinearGradient
            colors={["#ff9d00", "#ffb347"]}
            style={styles.gradient}
          >
            <Text style={styles.loginText}>
              {isLoading ? "Logging in..." : "Login"}
            </Text>
            <Ionicons name="arrow-forward-outline" size={20} color="white" />
          </LinearGradient>
        </TouchableOpacity>

        <Text style={styles.signUpText}>
          Don’t have an account?{" "}
          <Link href={"/signUp"}>
            <Text style={styles.signUpLink}>Sign up</Text>
          </Link>
        </Text>
      </View>
    </>
  );
};

export default LoginScreen;

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
  forgotText: {
    color: "#ff9d00",
    fontWeight: "600",
  },
  loginButton: {
    marginTop: 20,
  },
  gradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    borderRadius: 25,
  },
  loginText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginRight: 5,
  },
  signUpText: {
    textAlign: "center",
    marginTop: 30,
    fontSize: 14,
    color: "gray",
  },
  signUpLink: {
    color: "#ff9d00",
    fontWeight: "600",
  },
});
