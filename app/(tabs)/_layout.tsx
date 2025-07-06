import React from "react";
import { Tabs } from "expo-router";
import { theme } from "@/constants/theme";
import { useCarStore } from "@/store/carStore";
import { 
  Gauge, 
  Wrench, 
  Car, 
  Cog, 
  Fuel, 
  Image, 
  Lightbulb, 
  FileText,
  Clock,
  Volume2,
  Shield,
  Ruler
} from "lucide-react-native";

export default function TabLayout() {
  const { profile } = useCarStore();
  const currentMode = profile.currentMode;
  
  // Set accent color based on car mode
  const accentColor = currentMode === 'daily' 
    ? theme.colors.tint 
    : theme.colors.accent;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: accentColor,
        tabBarInactiveTintColor: theme.colors.tabIconDefault,
        tabBarStyle: {
          backgroundColor: theme.colors.background,
          borderTopColor: theme.colors.border,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '500',
        },
        headerStyle: {
          backgroundColor: theme.colors.background,
        },
        headerTintColor: theme.colors.text,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color }) => <Gauge size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="maintenance"
        options={{
          title: "Maintenance",
          tabBarIcon: ({ color }) => <Wrench size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="modifications"
        options={{
          title: "Mods",
          tabBarIcon: ({ color }) => <Car size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="diagnostics"
        options={{
          title: "Diagnostics",
          tabBarIcon: ({ color }) => <Cog size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="fuel"
        options={{
          title: "Fuel",
          tabBarIcon: ({ color }) => <Fuel size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="gallery"
        options={{
          title: "Gallery",
          tabBarIcon: ({ color }) => <Image size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="lighting"
        options={{
          title: "Lighting",
          tabBarIcon: ({ color }) => <Lightbulb size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="notes"
        options={{
          title: "Notes",
          tabBarIcon: ({ color }) => <FileText size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="reminders"
        options={{
          title: "Reminders",
          tabBarIcon: ({ color }) => <Clock size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="audio"
        options={{
          title: "Audio",
          tabBarIcon: ({ color }) => <Volume2 size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="crash"
        options={{
          title: "Crash",
          tabBarIcon: ({ color }) => <Shield size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="blueprint"
        options={{
          title: "Blueprint",
          tabBarIcon: ({ color }) => <Ruler size={22} color={color} />,
        }}
      />
    </Tabs>
  );
}