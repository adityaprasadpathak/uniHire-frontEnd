import { Redirect } from 'expo-router';

export default function Index() {
  // The _layout.tsx handles the actual authentication routing based on SecureStore, 
  // but Expo requires a default index route to avoid the "Unmatched Route" error at the root (/).
  // We'll redirect to the login screen by default, and if they are actually authenticated, 
  // the _layout.tsx will intercept it and route them to their proper dashboard.
  return <Redirect href="/(auth)/login" />;
}
