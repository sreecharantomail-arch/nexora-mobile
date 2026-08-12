import { View, ActivityIndicator } from 'react-native';
import { colors } from '../theme';

export default function Index() {
  // The layout's useEffect handles redirection based on auth state
  return (
    <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color={colors.accent} />
    </View>
  );
}
