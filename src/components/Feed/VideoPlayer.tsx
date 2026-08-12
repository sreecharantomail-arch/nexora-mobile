import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';

interface VideoPlayerProps {
  url: string;
  isActive: boolean;
}

export default function VideoPlayer({ url, isActive }: VideoPlayerProps) {
  const player = useVideoPlayer(url, player => {
    player.loop = true;
    player.play(); // Auto-play if ready, but we will control it via isActive
  });

  useEffect(() => {
    if (isActive) {
      player.play();
    } else {
      player.pause();
    }
  }, [isActive, player]);

  return (
    <View style={styles.container}>
      <VideoView
        style={styles.video}
        player={player}

        allowsPictureInPicture
        contentFit="cover"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  video: {
    width: '100%',
    height: '100%',
  },
});
