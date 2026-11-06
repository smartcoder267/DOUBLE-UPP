import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '../../theme/tokens';

export function SuccessAnimation() {
  const scale = useRef(new Animated.Value(0.45)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const ringScale = useRef(new Animated.Value(0.7)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, friction: 5, tension: 70, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: 280, useNativeDriver: true }),
      Animated.spring(ringScale, { toValue: 1, friction: 7, tension: 55, useNativeDriver: true }),
    ]).start();
  }, [opacity, ringScale, scale]);

  return (
    <View style={styles.stage}>
      <Animated.View style={[styles.outerRing, { opacity, transform: [{ scale: ringScale }] }]} />
      <Animated.View style={[styles.circle, { opacity, transform: [{ scale }] }]}>
        <Feather name="check" size={42} color={colors.white} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  stage: { width: 150, height: 150, alignItems: 'center', justifyContent: 'center' },
  outerRing: { position: 'absolute', width: 144, height: 144, borderRadius: 72, backgroundColor: colors.red[50] },
  circle: { width: 94, height: 94, borderRadius: 47, backgroundColor: colors.red[600], alignItems: 'center', justifyContent: 'center' },
});
