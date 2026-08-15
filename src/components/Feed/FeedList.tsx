import React, { useState, useCallback } from 'react';
import { FlatList, ViewabilityConfig, ViewToken, Dimensions } from 'react-native';
import VideoItem from './VideoItem';
import StoryFeed from '../Story/StoryFeed';

const { height: WINDOW_HEIGHT } = Dimensions.get('window');

interface FeedListProps {
  data: any[];
}

export default function FeedList({ data }: FeedListProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const [viewabilityConfig] = useState<ViewabilityConfig>({
    itemVisiblePercentThreshold: 80,
  });

  const onViewableItemsChanged = useCallback(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0) {
      setActiveIndex(viewableItems[0].index || 0);
    }
  }, []);

  const HEADER_HEIGHT = 100;
  const ITEM_HEIGHT = WINDOW_HEIGHT - 49;
  
  // Calculate snap offsets: first snap is 0 (header + first item visible?), wait, if they snap to 0 they see header. 
  // Next snap is HEADER_HEIGHT (hides header, shows first item perfectly).
  const snapToOffsets = [0, HEADER_HEIGHT, ...data.map((_, i) => HEADER_HEIGHT + (i + 1) * ITEM_HEIGHT)];

  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item._id}
      renderItem={({ item, index }) => (
        <VideoItem item={item} isActive={index === activeIndex} />
      )}
      pagingEnabled
      showsVerticalScrollIndicator={false}
      snapToOffsets={snapToOffsets}
      snapToAlignment="start"
      decelerationRate="fast"
      onViewableItemsChanged={onViewableItemsChanged}
      viewabilityConfig={viewabilityConfig}
      removeClippedSubviews
      initialNumToRender={3}
      maxToRenderPerBatch={3}
      windowSize={5}
      ListHeaderComponent={<StoryFeed />}
    />
  );
}
