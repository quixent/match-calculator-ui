import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, FontWeight } from '../../constants/theme';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

export default function MainLayout() {
  function tabIcon(name: IoniconName, focused: boolean) {
    return <Ionicons name={name} size={24} color={focused ? Colors.primary : Colors.textMuted} />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopColor: Colors.border,
          borderTopWidth: 1,
          paddingBottom: 12,
          paddingTop: 8,
          height: 72,
        },
        tabBarLabelStyle: {
          fontSize: FontSize.xs,
          fontWeight: FontWeight.semibold as '600',
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Connect',
          tabBarIcon: ({ focused }) => tabIcon(focused ? 'link' : 'link-outline', focused),
        }}
      />
      <Tabs.Screen
        name="matches"
        options={{
          title: 'Match',
          tabBarIcon: ({ focused }) => tabIcon(focused ? 'heart' : 'heart-outline', focused),
        }}
      />
      <Tabs.Screen
        name="edit-profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused }) => tabIcon(focused ? 'person' : 'person-outline', focused),
        }}
      />
      {/* Hidden screens — navigated to via router.push */}
      <Tabs.Screen name="requests"   options={{ href: null }} />
      <Tabs.Screen name="questions"  options={{ href: null }} />
      <Tabs.Screen name="score"      options={{ href: null }} />
      <Tabs.Screen name="chat"       options={{ href: null }} />
      <Tabs.Screen name="user-detail" options={{ href: null }} />
    </Tabs>
  );
}
