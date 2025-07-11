import { FontAwesome } from "@expo/vector-icons";
import * as NavigationBar from "expo-navigation-bar";
import { Stack, Tabs, useRouter, useSegments } from "expo-router";
import { useEffect, useState } from "react";
import {
  AppState,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
} from "react-native";
import { AuthProvider, useAuth } from "./context/AuthContext";
import "./global.css";

function RootLayoutNav() {
  const { isAuthenticated, user } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  const hideNavigationBar = async () => {
    await NavigationBar.setVisibilityAsync("hidden");
    await NavigationBar.setBackgroundColorAsync("transparent");
  };

  useEffect(() => {
    setIsReady(true);
    hideNavigationBar();

    // Listen for app state changes
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (nextAppState === "active") {
        hideNavigationBar();
      }
    });

    // Cleanup subscription
    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    if (!isReady) return;

    const inAuthGroup = segments[0] === "login" || segments[0] === "signup" || segments[0] === "choose-type" || segments[0] === "doctor-login" || segments[0] === "doctor-signup";
    const isLandingPage = segments[0] === "landing";

    console.log("Navigation debug:", {
      isAuthenticated,
      userType: user?.type,
      currentSegment: segments[0],
      inAuthGroup,
      isLandingPage
    });

    if (isAuthenticated && inAuthGroup) {
      // Redirect based on user type
      if (user?.type === 'doctor') {
        console.log("Redirecting doctor to /doctor-home");
        router.replace("/doctor-home");
      } else {
        console.log("Redirecting patient to /");
        router.replace("/");
      }
    } else if (!isAuthenticated && !inAuthGroup && !isLandingPage) {
      router.replace("/landing");
    }
  }, [isAuthenticated, isReady, segments, user]);

  if (!isReady || !isAuthenticated) {
    return (
      <Stack>
        <Stack.Screen name="landing" options={{ headerShown: false }} />
        <Stack.Screen name="choose-type" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="signup" options={{ headerShown: false }} />
        <Stack.Screen name="context/AhuthContext" options={{ headerShown: false }} />
        <Stack.Screen name="my-chats" options={{ headerShown: false }} />
        <Stack.Screen name="doctor-login" options={{ headerShown: false }} />
        <Stack.Screen name="doctor-signup" options={{ headerShown: false }} />
        <Stack.Screen name="doctor-home" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" options={{ headerShown: false }} />
      </Stack>
    );
  }

  // Doctor-specific navigation
  if (user?.type === 'doctor') {
    return (
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: "#3B82F6",
          tabBarInactiveTintColor: "#6B7280",
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: "600",
            marginTop: 4,
          },
          tabBarStyle: {
            backgroundColor: "white",
            borderTopWidth: 0,
            elevation: 8,
            shadowColor: "#000",
            shadowOffset: {
              width: 0,
              height: -2,
            },
            shadowOpacity: 0.4,
            shadowRadius: 8,
            height: 65,
            paddingBottom: 8,
            paddingTop: 8,
          },
          headerStyle: {
            backgroundColor: "white",
            elevation: 0,
            shadowOpacity: 0,
          },
          headerShadowVisible: false,
          headerTitleStyle: {
            fontSize: 20,
            fontWeight: "700",
            color: "#1F2937",
          },
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
              <TouchableOpacity {...touchableProps}>
                <View style={{ alignItems: "center", justifyContent: "center" }}>
                  {children}
                </View>
              </TouchableOpacity>
            );
          },
        }}
      >
        <Tabs.Screen
          name="doctor-home"
          options={{
            title: "Dashboard",
            tabBarIcon: ({ color }) => (
              <FontAwesome name="home" size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="doctor-appointments"
          options={{
            title: "Appointments",
            tabBarIcon: ({ color }) => (
              <FontAwesome name="calendar" size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="patients"
          options={{
            title: "Patients",
            tabBarIcon: ({ color }) => (
              <FontAwesome name="users" size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="doctor-profile"
          options={{
            title: "Profile",
            tabBarIcon: ({ color }) => (
              <FontAwesome name="user-md" size={24} color={color} />
            ),
          }}
        />
        {/* Hide other screens from doctor navigation */}
        <Tabs.Screen name="index" options={{ href: null }} />
        <Tabs.Screen name="login" options={{ href: null }} />
        <Tabs.Screen name="signup" options={{ href: null }} />
        <Tabs.Screen name="landing" options={{ href: null }} />
        <Tabs.Screen name="choose-type" options={{ href: null }} />
        <Tabs.Screen name="context/AuthContext" options={{ href: null }} />
        <Tabs.Screen name="appointments" options={{ href: null }} />
        <Tabs.Screen name="my-chats" options={{ href: null }} />
        <Tabs.Screen name="profile" options={{ href: null }} />
        <Tabs.Screen name="doctors" options={{ href: null }} />
        <Tabs.Screen name="doctor-login" options={{ href: null }} />
        <Tabs.Screen name="doctor-signup" options={{ href: null }} />
        <Tabs.Screen name="book-consultation" options={{ href: null }} />
        <Tabs.Screen name="chat-detail" options={{ href: null }} />
      </Tabs>
    );
  }

  // Patient navigation (existing)
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#3B82F6",
        tabBarInactiveTintColor: "#6B7280",
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
          marginTop: 4,
        },
        tabBarStyle: {
          backgroundColor: "white",
          borderTopWidth: 0,
          elevation: 8,
          shadowColor: "#000",
          shadowOffset: {
            width: 0,
            height: -2,
          },
          shadowOpacity: 0.4,
          shadowRadius: 8,
          height: 65,
          paddingBottom: 8,
          paddingTop: 8,
        },
        headerStyle: {
          backgroundColor: "white",
          elevation: 0,
          shadowOpacity: 0,
        },
        headerShadowVisible: false,
        headerTitleStyle: {
          fontSize: 20,
          fontWeight: "700",
          color: "#1F2937",
        },
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
            <TouchableOpacity {...touchableProps}>
              <View style={{ alignItems: "center", justifyContent: "center" }}>
                {children}
              </View>
            </TouchableOpacity>
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
          title: "Find Doctors",
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
          title: "My Appointments",
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
      {/* Hide doctor screens from patient navigation */}
      <Tabs.Screen name="doctor-home" options={{ href: null }} />
      <Tabs.Screen name="patients" options={{ href: null }} />
      <Tabs.Screen name="login" options={{ href: null }} />
      <Tabs.Screen name="signup" options={{ href: null }} />
      <Tabs.Screen name="landing" options={{ href: null }} />
      <Tabs.Screen name="choose-type" options={{ href: null }} />
      <Tabs.Screen name="context/AuthContext" options={{ href: null }} />
      <Tabs.Screen name="doctor-login" options={{ href: null }} />
      <Tabs.Screen name="doctor-signup" options={{ href: null }} />
      <Tabs.Screen name="doctor-profile" options={{ href: null }} />
      <Tabs.Screen name="doctor-appointments" options={{ href: null }} />
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
