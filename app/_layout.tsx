import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { AuthProvider } from '@/app/AuthContext'; // Importe o AuthProvider
import { useAuth } from '@/hooks/useAuth';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });
  const { isAuthenticated, loading } = useAuth(); 
  const router = useRouter();
  useEffect(() => {
   
    if (loaded && !loading) {
      if (!isAuthenticated) {
        router.replace('/login');
      } else {
        SplashScreen.hideAsync();
      }
    }
  }, [loaded, loading, isAuthenticated, router]);


  if (!loaded || loading) {
    return null;
  }

  return (
    <AuthProvider>
      <ThemeProvider value={ DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false, gestureEnabled: false }} />
          <Stack.Screen name="person" options={{ headerShown: false }} />
          <Stack.Screen name="login" options={{ headerShown: false, gestureEnabled: false }} /> 
          <Stack.Screen name="register" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
      </ThemeProvider>
    </AuthProvider>
  );
}
