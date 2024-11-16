import React, { useState } from "react";
import {
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  View,
  Image,
  Text,
} from "react-native";

type Props = {
  id: number;
  name: string;
  time: string;
  type: string;
  width: number;
  length: number;
  rating: number;
  price: number;
};

export default function CardMap({
  id,
  name,
  time,
  type,
  width,
  length,
  rating,
  price,
}: Props) {
  const [saved, setSaved] = useState([]);

  return (
    <SafeAreaView style={{ flex: 1, }}>
      <ScrollView contentContainerStyle={styles.content}>
        <TouchableOpacity
          key={id}
          onPress={() => {
            // handle onPress
          }}
        >
          <View style={styles.card}>
            <View style={styles.cardLikeWrapper}>
              <TouchableOpacity>
                <View style={styles.cardLike}></View>
              </TouchableOpacity>
            </View>

            <View style={styles.cardTop}>
              <Image
                alt=""
                resizeMode="cover"
                style={styles.cardImg}
                source={require("@/assets/images/page-parking-lot.png")}
              />
            </View>

            <View style={styles.cardBody}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{name}</Text>

                <Text style={styles.cardStars}>{rating}</Text>

                <Text style={{ color: "#595a63" }}>
                  ({rating} reviews)
                </Text>
              </View>

              <Text style={styles.cardDates}>{time}</Text>

              <Text style={styles.cardPrice}>
                <Text style={{ fontWeight: "600" }}>${price}</Text> / night
              </Text>
            </View>
            <View>
            <TouchableOpacity><Text>Yes</Text></TouchableOpacity>
            <TouchableOpacity><Text>No</Text></TouchableOpacity>
            </View>
            
          </View>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: 8,
    paddingHorizontal: 16,
  },
  /** Header */
  header: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  headerTop: {
    marginHorizontal: -6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerAction: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "700",
    color: "#1d1d1d",
  },
  /** Card */
  card: {
    position: "relative",
    borderRadius: 8,
    backgroundColor: "#fff",
    marginBottom: 2,
    shadowColor: "rgba(0, 0, 0, 0.5)",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  cardLikeWrapper: {
    position: "absolute",
    zIndex: 1,
    top: 12,
    right: 12,
  },
  cardLike: {
    width: 40,
    height: 40,
    borderRadius: 9999,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  cardTop: {
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  cardImg: {
    width: "100%",
    height: 100,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  cardBody: {
    padding: 12,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "500",
    color: "#232425",
    marginRight: "auto",
  },
  cardStars: {
    marginLeft: 2,
    marginRight: 4,
    fontSize: 15,
    fontWeight: "500",
    color: "#232425",
  },
  cardDates: {
    marginTop: 4,
    fontSize: 16,
    color: "#595a63",
  },
  cardPrice: {
    marginTop: 6,
    fontSize: 16,
    color: "#232425",
  },
});