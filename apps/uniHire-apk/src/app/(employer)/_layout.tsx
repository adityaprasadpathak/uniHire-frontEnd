import { Tabs } from 'expo-router';
import { Home, Users, Building2 } from 'lucide-react-native';

export default function EmployerLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: '#2563eb' }}>
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => <Home color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="candidates"
        options={{
          title: 'Candidates',
          tabBarIcon: ({ color }) => <Users color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Company',
          tabBarIcon: ({ color }) => <Building2 color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="edit-profile"
        options={{ href: null, title: 'Edit Company Profile' }}
      />
      <Tabs.Screen
        name="pipeline"
        options={{ href: null, title: 'Application Pipeline' }}
      />
      <Tabs.Screen
        name="create-job"
        options={{ href: null, title: 'Create Job' }}
      />
      <Tabs.Screen
        name="recommended-candidates"
        options={{ href: null, title: 'AI Matches' }}
      />
    </Tabs>
  );
}
