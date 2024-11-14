import {
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  
} from "react-native";
import React from "react";
import { Link, Stack } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated'

type Props = {};

const WelcomeScreen = (props: Props) => {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ImageBackground
        source={require("@/assets/images/page-parking-lot.png")}
        style={{ flex: 1 }}
        resizeMode="cover"
      >
        <View style={styles.container}>
          <LinearGradient
            colors={[
              "transparent",
              "rgba(255,255,255,0.9)",
              "rgba(255,255,255,1)",
            ]}
            style={styles.background}
          >
            <View style={styles.wrapper}>
              <Animated.Text style={styles.title} entering={FadeInRight.delay(500).duration(300)}>Parku</Animated.Text>
              <Animated.Text style={styles.description} entering={FadeInRight.delay(300).duration(300)}>Park anywhere with Parku!</Animated.Text>
              <View style={styles.socialLoginWrappers}>
                <Animated.View entering={FadeInDown.delay(500).duration(300)}>
                <Link href={"/signUp"} asChild>
                  <TouchableOpacity style={styles.btn}>
                    <Ionicons name="mail-outline" size={20} color="black" />
                    <Text style={styles.btnText}>Continue with Email</Text>
                  </TouchableOpacity>
                </Link>
                </Animated.View>
              </View>
              <View style={styles.socialLoginWrappers}>
                <Animated.View entering={FadeInDown.delay(700).duration(300)}>
                <Link href={"/signUp"} asChild>
                  <TouchableOpacity style={styles.btn}>
                    <Ionicons name="logo-google" size={20} color="black" />
                    <Text style={styles.btnText}>Continue with Google</Text>
                  </TouchableOpacity>
                </Link>
                </Animated.View>
              </View>
              <View style={styles.socialLoginWrappers}>
                <Animated.View entering={FadeInDown.delay(1100).duration(300)}>   
                <Link href={"/signUp"} asChild>
                  <TouchableOpacity style={styles.btn}>
                    <Ionicons name="logo-apple" size={20} color="black" />
                    <Text style={styles.btnText}>Continue with Apple</Text>
                  </TouchableOpacity>
                </Link>
                </Animated.View>
              </View>
              <Text style={styles.loginText}>
                Already have an account? {""}
                <Link href={"/signIn"} asChild>
                  <TouchableOpacity>
                    <Text style={styles.loginTextSpan}> Sign In</Text>
                  </TouchableOpacity>
                </Link>
              </Text>
            </View>
          </LinearGradient>
        </View>
      </ImageBackground>
    </>
  );
};

export default WelcomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  background: {
    flex: 1,
    position: "absolute",
    top: 0,
    bottom: 0,
    right: 0,
    left: 0,
    justifyContent: "flex-end",
  },
  wrapper: {
    paddingBottom: 50,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 22,
    color: "#ff9d00",
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: 5,
  },
  description: {
    fontSize: 14,
    color: "gray",
    letterSpacing: 1.2,
    lineHeight: 20,
    marginBottom: 20,
  },
  socialLoginWrappers: {
    alignSelf: "stretch",
  },
  btn: {
    flexDirection: "row",
    padding: 10,
    borderColor: "gray",
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    marginBottom: 15,
  },
  btnText: { fontSize: 14, fontWeight: '600', color: "black" },
  loginText: {marginTop: 30, fontSize: 14, color: "black",lineHeight: 24,},
  loginTextSpan: {color:'#ff9d00',fontWeight:'600'},
});
