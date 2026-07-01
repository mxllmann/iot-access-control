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
  SlideInRight,
  SlideInLeft,
  SlideOutLeft,
  SlideOutRight,
  Easing,
} from 'react-native-reanimated';

import CardsScreen from './src/screens/CardsScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import RegisterScreen from './src/screens/RegisterScreen';

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
  const iconScale = useSharedValue(isActive ? 1.2 : 1);

  iconScale.value = withSpring(isActive ? 1.2 : 1, SPRING_CONFIG);

  const pressStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale.value }],
  }));

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => { scale.value = withSpring(0.85, SPRING_CONFIG); }}
      onPressOut={() => { scale.value = withSpring(1, SPRING_CONFIG); }}
      style={styles.tabItem}
    >
      <Animated.View style={[styles.tabContent, pressStyle]}>
        <Animated.View style={[styles.iconContainer, iconStyle]}>
          <MaterialCommunityIcons
            name={tab.icon}
            size={24}
            color={isActive ? '#FFFFFF' : '#666'}
          />
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
}

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('cards');
  const prevIndexRef = useRef(0);
  const indicatorX = useSharedValue(0);

  const getIndex = (s: Screen) => TABS.findIndex((t) => t.key === s);

  const handleNavigate = useCallback(
    (screen: Screen) => {
      if (screen === currentScreen) return;
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      prevIndexRef.current = getIndex(currentScreen);
      const newIndex = getIndex(screen);
      indicatorX.value = withSpring(newIndex * TAB_WIDTH, SPRING_CONFIG);
      setCurrentScreen(screen);
    },
    [currentScreen],
  );

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorX.value }],
  }));

  const goingRight = getIndex(currentScreen) > prevIndexRef.current;

  const entering = goingRight
    ? SlideInRight.duration(300).easing(Easing.out(Easing.cubic))
    : SlideInLeft.duration(300).easing(Easing.out(Easing.cubic));

  const exiting = goingRight
    ? SlideOutLeft.duration(200).easing(Easing.in(Easing.cubic))
    : SlideOutRight.duration(200).easing(Easing.in(Easing.cubic));

  const renderScreen = () => {
    switch (currentScreen) {
      case 'cards':
        return <CardsScreen />;
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
        <Animated.View
          key={currentScreen}
          entering={entering}
          exiting={exiting}
          style={StyleSheet.absoluteFill}
        >
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
