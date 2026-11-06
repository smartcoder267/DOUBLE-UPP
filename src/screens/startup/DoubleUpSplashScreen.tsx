import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, Easing, Image, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme/tokens';

type DoubleUpSplashScreenProps = {
  onFinish: () => void;
};

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const revealScale = Math.ceil(Math.hypot(screenWidth, screenHeight) / 82) + 3;

export function DoubleUpSplashScreen({ onFinish }: DoubleUpSplashScreenProps) {
  const iconOpacity = useRef(new Animated.Value(0)).current;
  const iconScale = useRef(new Animated.Value(0.54)).current;
  const iconTranslateY = useRef(new Animated.Value(18)).current;
  const iconRotation = useRef(new Animated.Value(0)).current;
  const revealOpacity = useRef(new Animated.Value(0)).current;
  const revealScaleValue = useRef(new Animated.Value(0)).current;
  const softRevealOpacity = useRef(new Animated.Value(0)).current;
  const softRevealScale = useRef(new Animated.Value(0)).current;
  const wordmarkOpacity = useRef(new Animated.Value(0)).current;
  const wordmarkScale = useRef(new Animated.Value(0.92)).current;
  const wordmarkTranslateY = useRef(new Animated.Value(12)).current;
  const sceneOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const sequence = Animated.sequence([
      Animated.parallel([
        Animated.timing(iconOpacity, {
          toValue: 1,
          duration: 240,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.spring(iconScale, {
          toValue: 1,
          damping: 12,
          stiffness: 150,
          mass: 0.8,
          useNativeDriver: true,
        }),
        Animated.timing(iconTranslateY, {
          toValue: 0,
          duration: 420,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(170),
      Animated.parallel([
        Animated.timing(iconRotation, {
          toValue: 1,
          duration: 520,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(iconScale, {
            toValue: 1.16,
            duration: 250,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(iconScale, {
            toValue: 0.06,
            duration: 330,
            easing: Easing.inOut(Easing.cubic),
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.delay(350),
          Animated.timing(iconOpacity, { toValue: 0, duration: 180, useNativeDriver: true }),
        ]),
      ]),
      Animated.parallel([
        Animated.timing(revealOpacity, {
          toValue: 1,
          duration: 140,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(revealScaleValue, {
          toValue: revealScale,
          duration: 1120,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.delay(110),
          Animated.parallel([
            Animated.timing(softRevealOpacity, {
              toValue: 0.35,
              duration: 260,
              useNativeDriver: true,
            }),
            Animated.timing(softRevealScale, {
              toValue: revealScale * 1.1,
              duration: 1200,
              easing: Easing.out(Easing.quad),
              useNativeDriver: true,
            }),
          ]),
        ]),
        Animated.sequence([
          Animated.delay(210),
          Animated.parallel([
            Animated.timing(wordmarkOpacity, {
              toValue: 1,
              duration: 430,
              easing: Easing.out(Easing.cubic),
              useNativeDriver: true,
            }),
            Animated.spring(wordmarkTranslateY, {
              toValue: 0,
              damping: 16,
              stiffness: 115,
              useNativeDriver: true,
            }),
            Animated.spring(wordmarkScale, {
              toValue: 1,
              damping: 13,
              stiffness: 110,
              useNativeDriver: true,
            }),
          ]),
        ]),
      ]),
      Animated.timing(softRevealOpacity, {
        toValue: 0,
        duration: 240,
        useNativeDriver: true,
      }),
      Animated.delay(480),
      Animated.parallel([
        Animated.timing(wordmarkScale, {
          toValue: 28,
          duration: 900,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(wordmarkOpacity, {
          toValue: 0,
          duration: 820,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(sceneOpacity, {
          toValue: 0,
          duration: 900,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
    ]);

    sequence.start(({ finished }) => {
      if (finished) onFinish();
    });

    return () => sequence.stop();
  }, [iconOpacity, iconRotation, iconScale, iconTranslateY, onFinish, revealOpacity, revealScaleValue, sceneOpacity, softRevealOpacity, softRevealScale, wordmarkOpacity, wordmarkScale, wordmarkTranslateY]);

  const rotation = iconRotation.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '16deg'] });

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.scene, { opacity: sceneOpacity }]}>
        <Animated.View
          pointerEvents="none"
          style={[styles.reveal, { opacity: revealOpacity, transform: [{ scale: revealScaleValue }] }]}
        />
        <Animated.View
          pointerEvents="none"
          style={[styles.softReveal, { opacity: softRevealOpacity, transform: [{ scale: softRevealScale }] }]}
        />
        <Animated.View
          style={[
            styles.iconWrap,
            {
              opacity: iconOpacity,
              transform: [{ translateY: iconTranslateY }, { rotate: rotation }, { scale: iconScale }],
            },
          ]}
        >
          <Image source={require('../../../assets/app-icon.png')} resizeMode="contain" style={styles.icon} />
        </Animated.View>
        <Animated.View
          style={[
            styles.wordmark,
            {
              opacity: wordmarkOpacity,
              transform: [{ translateY: wordmarkTranslateY }, { scale: wordmarkScale }],
            },
          ]}
        >
          <Text style={styles.wordmarkText}>Double Up</Text>
          <View style={styles.wordmarkDot} />
        </Animated.View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, overflow: 'hidden', backgroundColor: colors.white },
  scene: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.white },
  reveal: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 148,
    height: 148,
    marginTop: -74,
    marginLeft: -74,
    borderRadius: 74,
    backgroundColor: colors.red[600],
  },
  softReveal: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 172,
    height: 172,
    marginTop: -86,
    marginLeft: -86,
    borderRadius: 86,
    backgroundColor: colors.red[400],
  },
  iconWrap: {
    position: 'absolute',
    width: 94,
    height: 94,
    borderRadius: 24,
    shadowColor: colors.black[950],
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 8,
  },
  icon: { width: 94, height: 94, borderRadius: 24 },
  wordmark: { position: 'absolute', flexDirection: 'row', alignItems: 'center' },
  wordmarkText: { color: colors.white, fontSize: 32, fontWeight: '900', letterSpacing: -0.8 },
  wordmarkDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.black[950], marginTop: 15, marginLeft: 7 },
});

