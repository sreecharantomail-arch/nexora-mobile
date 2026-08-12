import React, { useState, useCallback } from 'react';
import { FlatList, ViewabilityConfig, ViewToken, Dimensions } from 'react-native';
import VideoItem from './VideoItem';

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

  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item._id}
      renderItem={({ item, index }) => (
        <VideoItem item={item} isActive={index === activeIndex} />
      )}
      pagingEnabled
      showsVerticalScrollIndicator={false}
      snapToInterval={WINDOW_HEIGHT - 49} // height of item
      snapToAlignment="start"
      decelerationRate="fast"
      onViewableItemsChanged={onViewableItemsChanged}
      viewabilityConfig={viewabilityConfig}
      removeClippedSubviews
      initialNumToRender={3}
      maxToRenderPerBatch={3}
      windowSize={5}
    />
  );
}
