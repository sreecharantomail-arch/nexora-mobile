import React, { useState, useCallback } from 'react';
import { FlatList, ViewabilityConfig, ViewToken, ActivityIndicator, View } from 'react-native';
import VideoItem from './VideoItem';
import StoryFeed from '../Story/StoryFeed';



interface FeedListProps {
  data: any[];
  onEndReached?: () => void;
  loadingMore?: boolean;
}

export default function FeedList({ data, onEndReached, loadingMore }: FeedListProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [containerHeight, setContainerHeight] = useState<number | null>(null);

  const [viewabilityConfig] = useState<ViewabilityConfig>({
    itemVisiblePercentThreshold: 80,
  });

  const onViewableItemsChanged = useCallback(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0) {
      setActiveIndex(viewableItems[0].index || 0);
    }
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <StoryFeed />
      <View 
        style={{ flex: 1 }}
        onLayout={(e) => setContainerHeight(e.nativeEvent.layout.height)}
      >
        <FlatList
          data={data}
          keyExtractor={(item) => item._id}
          renderItem={({ item, index }) => (
            <VideoItem 
              item={item} 
              isActive={index === activeIndex} 
              height={containerHeight || undefined}
            />
          )}
          getItemLayout={containerHeight ? (_, index) => ({
            length: containerHeight,
            offset: containerHeight * index,
            index,
          }) : undefined}
          pagingEnabled
          showsVerticalScrollIndicator={false}
          snapToAlignment="start"
          decelerationRate="fast"
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          removeClippedSubviews
          initialNumToRender={3}
          maxToRenderPerBatch={3}
          windowSize={5}
          onEndReached={onEndReached}
          onEndReachedThreshold={2}
          ListFooterComponent={loadingMore ? <ActivityIndicator size="small" style={{ marginVertical: 20 }} color="#fff" /> : <View style={{ height: 20 }} />}
        />
      </View>
    </View>
  );
}
