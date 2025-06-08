import { FontAwesome } from "@expo/vector-icons";
import { Stack, Tabs, useRouter, useSegments } from "expo-router";
import { useEffect, useState } from "react";
import { TouchableOpacity, TouchableOpacityProps } from "react-native";
import { AuthProvider, useAuth } from "./context/AuthContext";
import "./global.css";

function RootLayoutNav() {
  const { isAuthenticated } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (!isReady) return;

    const inAuthGroup = segments[0] === "login" || segments[0] === "signup";
    const isLandingPage = segments[0] === "landing";

    if (isAuthenticated && inAuthGroup) {
      router.replace("/");
    } else if (!isAuthenticated && !inAuthGroup && !isLandingPage) {
      router.replace("/landing");
    }
  }, [isAuthenticated, isReady, segments]);

  if (!isReady || !isAuthenticated) {
    return (
      <Stack>
        <Stack.Screen name="landing" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="signup" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" options={{ headerShown: false }} />
      </Stack>
    );
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#3B82F6",
        tabBarInactiveTintColor: "#6B7280",
        tabBarStyle: {
          backgroundColor: "white",
          borderTopWidth: 1,
          borderTopColor: "#E5E7EB",
          paddingBottom: 5,
          paddingTop: 5,
        },
        headerStyle: {
          backgroundColor: "white",
        },
        headerShadowVisible: false,
        tabBarButton: (props) => {
          const { children, ...rest } = props;
          const touchableProps: TouchableOpacityProps = {
            ...rest,
            activeOpacity: 0.7,
            delayLongPress: rest.delayLongPress || undefined,
            disabled: rest.disabled || undefined,
            onBlur: rest.onBlur || undefined,
            onFocus: rest.onFocus || undefined,
            onLongPress: rest.onLongPress || undefined,
            onPress: rest.onPress || undefined,
            onPressIn: rest.onPressIn || undefined,
            onPressOut: rest.onPressOut || undefined,
            testID: rest.testID || undefined,
          };

          return (
            <TouchableOpacity {...touchableProps}>{children}</TouchableOpacity>
          );
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <FontAwesome name="home" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="doctors"
        options={{
          title: "Doctors",
          tabBarIcon: ({ color }) => (
            <FontAwesome name="user-md" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="my-chats"
        options={{
          title: "My Chats",
          tabBarIcon: ({ color }) => (
            <FontAwesome name="comments" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="appointments"
        options={{
          title: "Appointments",
          tabBarIcon: ({ color }) => (
            <FontAwesome name="calendar" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => (
            <FontAwesome name="user" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen name="login" options={{ href: null }} />
      <Tabs.Screen name="signup" options={{ href: null }} />
      <Tabs.Screen name="landing" options={{ href: null }} />
      <Tabs.Screen name="doctor-profile" options={{ href: null }} />
      <Tabs.Screen name="book-consultation" options={{ href: null }} />
      <Tabs.Screen name="chat-detail" options={{ href: null }} />
    </Tabs>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}
