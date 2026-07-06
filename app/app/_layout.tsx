import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider, useAuth } from '../src/auth';

function AuthGate({ children }: { children: React.ReactNode }) {
  const auth = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (auth.status === 'loading') return;

    const inAuthScreen = segments[0] === 'login';

    if (auth.status === 'unauthenticated' && !inAuthScreen) {
      router.replace('/login');
    } else if (auth.status === 'authenticated' && inAuthScreen) {
      router.replace('/(tabs)');
    }
  }, [auth.status, segments]);

  if (auth.status === 'loading') {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0D0D0D' }}>
        <ActivityIndicator color="#FFFFFF" size="large" />
      </View>
    );
  }

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="light" />
      <AuthProvider>
        <AuthGate>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: '#0D0D0D' },
              animation: 'fade',
            }}
          />
        </AuthGate>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
