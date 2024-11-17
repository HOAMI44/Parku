import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useState } from "react";
import { supabase } from "../lib/supabase";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

// Add type for the params
type VerifyParams = {
  email: string;
  password: string;
};

export default function Verify() {
  // Type the params
  const { email, password } = useLocalSearchParams<VerifyParams>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkVerification = async () => {
    try {
      setLoading(true);
      setError(null);

      // Try to sign in with the credentials
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email as string,
        password: password as string,
      });

      if (error) {
        if (error.message.includes("Email not confirmed")) {
          setError("Please verify your email before continuing");
          return;
        }
        throw error;
      }

      // If we get here, the email is verified and the user is signed in
      router.replace("/SignUpDetail");
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Ionicons name="mail-outline" size={64} color="#ff9d00" />

        <Text style={styles.title}>Verify your email</Text>

        <Text style={styles.description}>
          We've sent a verification link to:
        </Text>

        <Text style={styles.email}>{email}</Text>

        <Text style={styles.instruction}>
          Please check your email and click the verification link to continue.
        </Text>

        {error && <Text style={styles.errorText}>{error}</Text>}

        <TouchableOpacity
          style={styles.button}
          onPress={checkVerification}
          disabled={loading}
        >
          <LinearGradient
            colors={["#ff9d00", "#ffb347"]}
            style={styles.gradient}
          >
            <Text style={styles.buttonText}>
              {loading ? "Checking..." : "I've verified my email"}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.replace("/Login")}
          style={styles.signInLink}
        >
          <Text style={styles.signInText}>
            Already have an account? Sign in
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 10,
  },
  email: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#ff9d00",
    marginBottom: 20,
  },
  instruction: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 30,
  },
  button: {
    width: "100%",
    marginBottom: 20,
  },
  gradient: {
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  errorText: {
    color: "red",
    marginBottom: 20,
    textAlign: "center",
  },
  signInLink: {
    marginTop: 20,
  },
  signInText: {
    color: "#ff9d00",
    fontSize: 16,
  },
});
