import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { PostComposer } from '../../src/components/social/post-composer';
import { PostContent } from '../../src/types';

export default function PostComposerModal() {
  const handlePost = async (content: PostContent) => {
    // Close the modal after successful post
    router.back();
  };

  return (
    <View style={styles.container}>
      <PostComposer onPost={handlePost} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
});

export { PostComposerModal };
