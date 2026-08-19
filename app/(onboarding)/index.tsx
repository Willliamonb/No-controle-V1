import React, { useRef, useState } from "react";
import { Dimensions, FlatList, Pressable, Text, View, ViewToken } from "react-native";
import { useRouter } from "expo-router";
import { Button } from "@/components/ui/Button";
import { ONBOARDING_SLIDES } from "@/features/onboarding/content";
import { markOnboardingSeen } from "@/lib/onboarding";

const { width } = Dimensions.get("window");

export default function OnboardingScreen() {
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(0);
  const listRef = useRef<FlatList>(null);

  const isLastSlide = activeIndex === ONBOARDING_SLIDES.length - 1;

  async function handleFinish() {
    await markOnboardingSeen();
    router.replace("/(auth)/login");
  }

  function handleNext() {
    if (isLastSlide) {
      handleFinish();
      return;
    }
    listRef.current?.scrollToIndex({ index: activeIndex + 1 });
  }

  const onViewableItemsChanged = useRef((info: { viewableItems: ViewToken[] }) => {
    const first = info.viewableItems[0];
    if (first?.index !== null && first?.index !== undefined) {
      setActiveIndex(first.index);
    }
  }).current;

  return (
    <View className="flex-1 bg-background">
      <View className="flex-row justify-end px-5 pt-14">
        <Pressable onPress={handleFinish}>
          <Text className="text-muted font-medium">Pular</Text>
        </Pressable>
      </View>

      <FlatList
        ref={listRef}
        data={ONBOARDING_SLIDES}
        keyExtractor={(item) => item.title}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ itemVisiblePercentThreshold: 60 }}
        renderItem={({ item }) => (
          <View style={{ width }} className="items-center justify-center px-8">
            <Text style={{ fontSize: 96 }} className="mb-8">
              {item.emoji}
            </Text>
            <Text className="text-ink text-2xl font-bold text-center mb-3">{item.title}</Text>
            <Text className="text-muted text-base text-center leading-6">{item.description}</Text>
          </View>
        )}
      />

      <View className="flex-row justify-center mb-6">
        {ONBOARDING_SLIDES.map((slide, index) => (
          <View
            key={slide.title}
            className={`h-2 rounded-full mx-1 ${index === activeIndex ? "w-6 bg-primary" : "w-2 bg-primary/20"}`}
          />
        ))}
      </View>

      <View className="px-6 pb-10">
        <Button label={isLastSlide ? "Começar" : "Próximo"} onPress={handleNext} />
      </View>
    </View>
  );
}
