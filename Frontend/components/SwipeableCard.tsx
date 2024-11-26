import React, { useEffect } from 'react';
import { StyleSheet, View, Dimensions, Text, TouchableOpacity } from 'react-native';
import { PanGestureHandler } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  interpolate,
  runOnJS,
} from 'react-native-reanimated';
import { ParkingSpaceWithName } from '@/types/types';
import ParkingSpaceCard from './ParkingSpaceCard';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_WIDTH = SCREEN_WIDTH * 0.85;
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;

interface SwipeableCardProps {
  parkingSpace: ParkingSpaceWithName;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  onSwipeUp: () => void;
  distance?: string;
}

const SwipeableCard = ({ 
  parkingSpace, 
  onSwipeLeft, 
  onSwipeRight,
  onSwipeUp,
  distance 
}: SwipeableCardProps) => {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const rotate = useSharedValue(0);

  const SPRING_CONFIG = {
    damping: 15,
    mass: 0.6,
    stiffness: 100,
    overshootClamping: false,
    restSpeedThreshold: 0.3,
    restDisplacementThreshold: 0.3,
  };

  useEffect(() => {
    translateX.value = withSpring(0, SPRING_CONFIG);
    translateY.value = withSpring(0, SPRING_CONFIG);
    rotate.value = withSpring(0, SPRING_CONFIG);
  }, [parkingSpace.id]);

  const gestureHandler = useAnimatedGestureHandler({
    onStart: (_, context: any) => {
      context.startX = translateX.value;
      context.startY = translateY.value;
    },
    onActive: (event, context) => {
      translateX.value = context.startX + event.translationX;
      translateY.value = context.startY + Math.max(Math.min(event.translationY, 0), -50);
      rotate.value = interpolate(
        translateX.value,
        [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
        [-15, 0, 15]
      );
    },
    onEnd: (event) => {
      if (event.translationY < -SWIPE_THRESHOLD) {
        runOnJS(onSwipeUp)();
        translateX.value = withSpring(0, SPRING_CONFIG);
        translateY.value = withSpring(0, SPRING_CONFIG);
        rotate.value = withSpring(0, SPRING_CONFIG);
      } else if (Math.abs(event.translationX) > SWIPE_THRESHOLD) {
        translateX.value = withSpring(
          Math.sign(event.translationX) * SCREEN_WIDTH * 1.5,
          SPRING_CONFIG,
          () => {
            runOnJS(event.translationX > 0 ? onSwipeRight : onSwipeLeft)();
            translateX.value = withSpring(0, SPRING_CONFIG);
            translateY.value = withSpring(0, SPRING_CONFIG);
            rotate.value = withSpring(0, SPRING_CONFIG);
          }
        );
      } else {
        translateX.value = withSpring(0, SPRING_CONFIG);
        translateY.value = withSpring(0, SPRING_CONFIG);
        rotate.value = withSpring(0, SPRING_CONFIG);
      }
    },
  });

  const cardStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate: `${rotate.value}deg` },
      ],
    };
  });

  const likeStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(
        translateX.value,
        [0, SCREEN_WIDTH / 4],
        [0, 1]
      ),
    };
  });

  const nopeStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(
        translateX.value,
        [-SCREEN_WIDTH / 4, 0],
        [1, 0]
      ),
    };
  });

  const upSwipeStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(
        translateY.value,
        [-SCREEN_WIDTH / 4, 0],
        [1, 0]
      ),
    };
  });

  return (
    <View style={styles.container}>
      <PanGestureHandler onGestureEvent={gestureHandler}>
        <Animated.View style={[styles.card, cardStyle]}>
          <Animated.View style={[styles.overlayLabel, styles.likeLabel, likeStyle]}>
            <Text style={styles.overlayText}>BOOK</Text>
          </Animated.View>
          <Animated.View style={[styles.overlayLabel, styles.nopeLabel, nopeStyle]}>
            <Text style={styles.overlayText}>NOPE</Text>
          </Animated.View>
          <Animated.View style={[styles.overlayLabel, styles.listLabel, upSwipeStyle]}>
            <Text style={styles.overlayText}>LIST</Text>
          </Animated.View>
          <ParkingSpaceCard parkingSpace={parkingSpace} distance={distance} />
        </Animated.View>
      </PanGestureHandler>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 10,
  },
  card: {
    width: CARD_WIDTH,
    marginBottom: 40,
    borderRadius: 10,
    backgroundColor: 'white',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  overlayLabel: {
    position: 'absolute',
    padding: 10,
    borderWidth: 3,
    borderRadius: 10,
    zIndex: 100,
    top: 50,
  },
  likeLabel: {
    right: 40,
    borderColor: '#4CAF50',
  },
  nopeLabel: {
    left: 40,
    borderColor: '#FF3B30',
  },
  overlayText: {
    fontSize: 32,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 20,
    marginTop: 10,
    gap: 10,
  },
  listLabel: {
    top: 40,
    alignSelf: 'center',
    borderColor: '#007AFF',
  },
  listButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 5,
  },
  nopeButton: {
    backgroundColor: '#FF3B30',
    padding: 10,
    borderRadius: 5,
  },
  bookButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
});

export default SwipeableCard; 