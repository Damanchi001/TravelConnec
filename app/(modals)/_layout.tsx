import { Stack } from 'expo-router';

export default function ModalLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="post-composer"
        options={{
          title: 'New Post',
          presentation: 'modal',
          headerShown: false, // We handle our own header
        }}
      />
    </Stack>
  );
}