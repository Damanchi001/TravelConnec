import { View, type ViewProps } from 'react-native';


export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
};

export function ThemedView({ style, lightColor, darkColor, ...otherProps }: ThemedViewProps) {
  // Force white background for the entire app
  const backgroundColor = '#fff';

  return <View style={[{ backgroundColor }, style]} {...otherProps} />;
}
