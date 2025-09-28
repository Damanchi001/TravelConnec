// Fallback for using Ionicons on Android and web.

import { Ionicons } from '@expo/vector-icons';
import { SymbolViewProps, SymbolWeight } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

type IconMapping = Record<SymbolViewProps['name'], ComponentProps<typeof Ionicons>['name']>;
export type IconSymbolName = keyof typeof MAPPING | SymbolViewProps['name'];

/**
 * Add your SF Symbols to Ionicons mappings here.
 * - see Ionicons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING = {
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code-slash',
  'chevron.right': 'chevron-forward',
  'plus': 'add',
  'person.fill': 'person',
  'star.fill': 'star',
  'bag.fill': 'bag',
  'magnifyingglass': 'search',
  'map.fill': 'map',
  'sparkles': 'sparkles',
  'book.fill': 'book',
  'fork.knife': 'restaurant',
  'figure.climbing': 'fitness',
  'heart.fill': 'heart',
  'arrow.right': 'arrow-forward',
  'message.fill': 'chatbubble',
} as IconMapping;

/**
 * An icon component that uses native SF Symbols on iOS, and Ionicons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Ionicons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return <Ionicons color={color} size={size} name={MAPPING[name]} style={style} />;
}
