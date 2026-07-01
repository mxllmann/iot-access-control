import { useCallback, useRef, useState } from 'react';
import { Dimensions, StyleSheet, View, Pressable } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as Haptics from 'expo-haptics';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  runOnJS,
  Easing,
} from 'react-native-reanimated';

import CardsScreen from './src/screens/CardsScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import CredentialDetailScreen from './src/screens/CredentialDetailScreen';
import { Credential } from './src/api';

type Screen = 'cards' | 'history' | 'register';

const TABS: { key: Screen; icon: keyof typeof MaterialCommunityIcons.glyphMap }[] = [
  { key: 'cards', icon: 'credit-card-outline' },
  { key: 'history', icon: 'history' },
  { key: 'register', icon: 'card-plus-outline' },
];

const SCREEN_WIDTH = Dimensions.get('window').width;
const TAB_WIDTH = (SCREEN_WIDTH - 32) / TABS.length;

const SPRING_CONFIG = { damping: 18, stiffness: 200, mass: 0.8 };

function TabBarItem({
  tab,
  isActive,
  onPress,
}: {
  tab: (typeof TABS)[number];
  isActive: boolean;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);

  const pressStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => { scale.value = withSpring(0.85, SPRING_CONFIG); }}
      onPressOut={() => { scale.value = withSpring(1, SPRING_CONFIG); }}
      style={styles.tabItem}
    >
      <Animated.View style={[styles.tabContent, pressStyle]}>
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons
            name={tab.icon}
            size={isActive ? 28 : 24}
            color={isActive ? '#FFFFFF' : '#666'}
          />
        </View>
      </Animated.View>
    </Pressable>
  );
}

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('cards');
  const [detailCredential, setDetailCredential] = useState<Credential | null>(null);
  const prevIndexRef = useRef(0);
  const indicatorX = useSharedValue(0);

  const getIndex = (s: Screen) => TABS.findIndex((t) => t.key === s);

  const screenOpacity = useSharedValue(1);
  const pendingScreenRef = useRef<Screen | null>(null);

  const applyNewScreen = useCallback((screen: Screen) => {
    pendingScreenRef.current = null;
    setCurrentScreen(screen);
    screenOpacity.value = withTiming(1, { duration: 150, easing: Easing.out(Easing.cubic) });
  }, []);

  const handleNavigate = useCallback(
    (screen: Screen) => {
      if (screen === currentScreen || pendingScreenRef.current) return;
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      prevIndexRef.current = getIndex(currentScreen);
      const newIndex = getIndex(screen);
      indicatorX.value = withSpring(newIndex * TAB_WIDTH, SPRING_CONFIG);

      pendingScreenRef.current = screen;
      screenOpacity.value = withTiming(0, { duration: 120, easing: Easing.in(Easing.cubic) }, () => {
        runOnJS(applyNewScreen)(screen);
      });
    },
    [currentScreen, applyNewScreen],
  );

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorX.value }],
  }));

  const screenAnimStyle = useAnimatedStyle(() => ({
    opacity: screenOpacity.value,
  }));

  const renderScreen = () => {
    if (detailCredential) {
      return (
        <CredentialDetailScreen
          credential={detailCredential}
          onBack={() => setDetailCredential(null)}
          onUpdated={(updated) => setDetailCredential(updated)}
          onDeleted={() => setDetailCredential(null)}
        />
      );
    }

    switch (currentScreen) {
      case 'cards':
        return <CardsScreen onSelectCredential={setDetailCredential} />;
      case 'history':
        return <HistoryScreen />;
      case 'register':
        return <RegisterScreen />;
    }
  };

  return (
    <GestureHandlerRootView style={styles.root}>
      <StatusBar style="light" />

      <View style={styles.screenContainer}>
        <Animated.View style={[StyleSheet.absoluteFill, screenAnimStyle]}>
          {renderScreen()}
        </Animated.View>
      </View>

      <View style={styles.tabBar}>
        <Animated.View style={[styles.indicator, indicatorStyle]} />
        {TABS.map((tab) => (
          <TabBarItem
            key={tab.key}
            tab={tab}
            isActive={currentScreen === tab.key}
            onPress={() => handleNavigate(tab.key)}
          />
        ))}
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0D0D0D' },
  screenContainer: { flex: 1, overflow: 'hidden' },

  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#1A1A1A',
    borderTopWidth: 1,
    borderTopColor: '#2A2A2A',
    paddingBottom: 28,
    paddingTop: 10,
    paddingHorizontal: 16,
    position: 'relative',
  },

  indicator: {
    position: 'absolute',
    top: 10,
    left: 16,
    width: TAB_WIDTH,
    height: 40,
    borderRadius: 16,
    backgroundColor: '#2A2A2A',
  },

  tabItem: { flex: 1, alignItems: 'center', zIndex: 1 },
  tabContent: { alignItems: 'center' },

  iconContainer: {
    width: 44,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
