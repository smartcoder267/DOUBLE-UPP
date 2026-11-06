import React, { useRef, useState } from 'react';
import {
  FlatList,
  Image,
  ImageSourcePropType,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  StatusBar,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, radii, spacing } from '../../theme/tokens';

type OnboardingSlide = {
  id: string;
  image: ImageSourcePropType;
  eyebrow: string;
  title: string;
  description: string;
};

type DoubleUpOnboardingScreenProps = {
  onFinish: () => void;
  onSignIn: () => void;
};

const slides: OnboardingSlide[] = [
  {
    id: 'send-receive',
    image: require('../../../assets/onboarding-send-receive.png'),
    eyebrow: 'MOVE MONEY SIMPLY',
    title: 'Send and receive with confidence.',
    description: 'Use a registered phone number to move test funds between people with clear confirmation and receipts.',
  },
  {
    id: 'pay',
    image: require('../../../assets/onboarding-pay.png'),
    eyebrow: 'PAY YOUR WAY',
    title: 'Scan a QR or enter a payment PIN.',
    description: 'Pay a person or business through a secure request while seeing who you are paying before you confirm.',
  },
  {
    id: 'agent',
    image: require('../../../assets/onboarding-agent.png'),
    eyebrow: 'ACCESS WHEN YOU NEED IT',
    title: 'Deposit or withdraw through an agent.',
    description: 'Approved agents help customers access their wallet through controlled, traceable test fund transactions.',
  },
];

export function DoubleUpOnboardingScreen({ onFinish, onSignIn }: DoubleUpOnboardingScreenProps) {
  const { width } = useWindowDimensions();
  const listRef = useRef<FlatList<OnboardingSlide>>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleMomentumEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    setCurrentIndex(Math.round(event.nativeEvent.contentOffset.x / width));
  };

  const handleNext = () => {
    if (currentIndex === slides.length - 1) {
      onFinish();
      return;
    }

    const nextIndex = currentIndex + 1;
    listRef.current?.scrollToIndex({ index: nextIndex, animated: true });
    setCurrentIndex(nextIndex);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.topBar}>
        <View style={styles.brandRow}>
          <Image source={require('../../../assets/app-icon.png')} style={styles.brandIcon} />
          <Text style={styles.brandName}>Double Up</Text>
        </View>
        <Pressable accessibilityRole="button" accessibilityLabel="Skip onboarding" onPress={onFinish} hitSlop={12}>
          <Text style={styles.skipText}>Skip</Text>
        </Pressable>
      </View>

      <FlatList
        ref={listRef}
        data={slides}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onMomentumScrollEnd={handleMomentumEnd}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width }]}>
            <View style={styles.illustrationStage}>
              <Image source={item.image} resizeMode="contain" style={styles.illustration} />
            </View>
            <View style={styles.copyBlock}>
              <Text style={styles.eyebrow}>{item.eyebrow}</Text>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.description}>{item.description}</Text>
            </View>
          </View>
        )}
      />

      <View style={styles.footer}>
        <View style={styles.progressRow}>
          {slides.map((slide, index) => (
            <View key={slide.id} style={[styles.progressDot, index === currentIndex && styles.progressDotActive]} />
          ))}
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={currentIndex === slides.length - 1 ? 'Get started' : 'Next'}
          onPress={handleNext}
          style={({ pressed }) => [styles.nextButton, pressed && styles.nextButtonPressed]}
        >
          <Text style={styles.nextButtonText}>{currentIndex === slides.length - 1 ? 'Get started' : 'Next'}</Text>
          <Feather name="arrow-right" size={18} color={colors.white} />
        </Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel="Sign in" onPress={onSignIn} style={styles.signInButton}>
          <Text style={styles.signInText}>Already have an account? <Text style={styles.signInStrong}>Sign in</Text></Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.white },
  topBar: {
    minHeight: 64,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) + spacing.sm : spacing.sm,
    paddingBottom: spacing.sm,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  brandIcon: { width: 32, height: 32, borderRadius: 9 },
  brandName: { color: colors.black[950], fontSize: 17, fontWeight: '900', letterSpacing: -0.4 },
  skipText: { color: colors.black[500], fontSize: 14, fontWeight: '700' },
  slide: { flex: 1, paddingHorizontal: spacing.lg },
  illustrationStage: { flex: 1.18, alignItems: 'center', justifyContent: 'center', paddingTop: spacing.sm },
  illustration: { width: '100%', height: '100%', maxHeight: 390 },
  copyBlock: { flex: 0.82, paddingTop: spacing.sm },
  eyebrow: { color: colors.red[600], fontSize: 11, fontWeight: '900', letterSpacing: 1.5, marginBottom: spacing.sm },
  title: { color: colors.black[950], fontSize: 32, lineHeight: 38, fontWeight: '900', letterSpacing: -1.1 },
  description: { color: colors.black[500], fontSize: 15, lineHeight: 23, marginTop: spacing.md, maxWidth: 360 },
  footer: { paddingHorizontal: spacing.lg, paddingBottom: spacing.md },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: spacing.lg },
  progressDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.black[100] },
  progressDotActive: { width: 24, backgroundColor: colors.red[600] },
  nextButton: {
    minHeight: 54,
    borderRadius: radii.lg,
    backgroundColor: colors.red[600],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  nextButtonPressed: { opacity: 0.9, transform: [{ scale: 0.99 }] },
  nextButtonText: { color: colors.white, fontSize: 15, fontWeight: '900' },
  signInButton: { alignItems: 'center', paddingTop: spacing.md, minHeight: 42 },
  signInText: { color: colors.black[500], fontSize: 13, fontWeight: '600' },
  signInStrong: { color: colors.black[950], fontWeight: '900' },
});

