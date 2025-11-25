import { Tabs } from 'expo-router';
import { Home, Compass, Library, MapPin } from 'lucide-react-native';
import { AudioProvider } from '../contexts/AudioContext';
import { ProgressProvider } from '../contexts/ProgressContext';
import { PremiumProvider } from '../contexts/PremiumContext';
import "../global.css";

export default function Layout() {
  return (
    <PremiumProvider>
      <ProgressProvider>
        <AudioProvider>
          <Tabs
            screenOptions={{
              headerShown: false,
              tabBarStyle: {
                backgroundColor: '#191121',
                borderTopColor: 'rgba(255,255,255,0.1)',
                height: 80,
                paddingBottom: 20,
                paddingTop: 10,
              },
              tabBarActiveTintColor: '#B388FF',
              tabBarInactiveTintColor: 'rgba(255,255,255,0.5)',
            }}
          >
            <Tabs.Screen
              name="index"
              options={{
                title: 'Home',
                tabBarIcon: ({ color }) => <Home size={24} color={color} />,
              }}
            />
            <Tabs.Screen
              name="sessions"
              options={{
                title: 'Sessions',
                tabBarIcon: ({ color }) => <Compass size={24} color={color} />,
              }}
            />
            <Tabs.Screen
              name="library"
              options={{
                title: 'Library',
                tabBarIcon: ({ color }) => <Library size={24} color={color} />,
              }}
            />
            <Tabs.Screen
              name="lounge"
              options={{
                title: 'Lounge',
                tabBarIcon: ({ color }) => <MapPin size={24} color={color} />,
              }}
            />
            <Tabs.Screen
              name="explore"
              options={{
                href: null, // Hide from tab bar
              }}
            />
            <Tabs.Screen
              name="profile"
              options={{
                href: null, // Hide from tab bar
              }}
            />
            <Tabs.Screen
              name="now-playing"
              options={{
                href: null, // Hide from tab bar
              }}
            />
            <Tabs.Screen
              name="upgrade"
              options={{
                href: null, // Hide from tab bar
              }}
            />
            <Tabs.Screen
              name="feedback"
              options={{
                href: null, // Hide from tab bar
              }}
            />
          </Tabs>
        </AudioProvider>
      </ProgressProvider>
    </PremiumProvider>
  );
}
