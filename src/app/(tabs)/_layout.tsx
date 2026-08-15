import { Tabs } from 'expo-router';
import { Image } from 'react-native';
import { Home, Search, PlusSquare, User } from 'lucide-react-native';
import { colors } from '../../theme';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.secondary,
        tabBarShowLabel: false,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          tabBarIcon: ({ color, size }) => <Search color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: 'Create',
          tabBarIcon: ({ color, size }) => <PlusSquare color={colors.accent} size={size + 4} />,
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="about"
        options={{
          title: 'Studio',
          tabBarIcon: ({ color, size }) => (
            <Image 
              source={require('../../../assets/images/nylarion_logo.png')} 
              style={{ width: size, height: size, borderRadius: size / 2, opacity: color === colors.primary ? 1 : 0.6 }} 
              resizeMode="contain" 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile/[username]"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
