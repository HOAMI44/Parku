import {
  Adapt,
  Button,
  Label,
  Popover,
  PopoverProps,
  XStack,
  YStack,
} from "tamagui";
import Slider from "@react-native-community/slider";
import { Text } from "react-native";

export function TamaPopover({
  Icon,
  Name,
  shouldAdapt,
  distance,
  handleDistance,
  ...props
}: PopoverProps & {
  Icon?: any;
  Name?: string;
  shouldAdapt?: boolean;
  distance?: number;
  handleDistance: any;
}) {
  return (
    <Popover size="$5" allowFlip {...props}>
      <Popover.Trigger asChild>
        <Button icon={Icon} />
      </Popover.Trigger>

      {shouldAdapt && (
        <Adapt when="sm" platform="touch">
          <Popover.Sheet modal dismissOnSnapToBottom>
            <Popover.Sheet.Frame padding="$4">
              <Adapt.Contents />
            </Popover.Sheet.Frame>
            <Popover.Sheet.Overlay
              animation="lazy"
              enterStyle={{ opacity: 0 }}
              exitStyle={{ opacity: 0 }}
            />
          </Popover.Sheet>
        </Adapt>
      )}

      <Popover.Content
        borderWidth={1}
        borderColor="$borderColor"
        enterStyle={{ y: -10, opacity: 0 }}
        exitStyle={{ y: -10, opacity: 0 }}
        elevate
        animation={[
          "quick",
          {
            opacity: {
              overshootClamping: true,
            },
          },
        ]}
      >
        <Popover.Arrow borderWidth={1} borderColor="$borderColor" />

        <YStack gap="$3">
          <XStack gap="$3">
            <Label size="$8" htmlFor={Name}>
              Filter Options
            </Label>
          </XStack>
          <Text>Distance: {distance.toString()} m</Text>
          <Slider
            value={distance}
            maximumValue={5000}
            minimumValue={10}
            step={10}
            onValueChange={(value) => handleDistance(value)}
          />

          <Popover.Close asChild>
            <Button
              size="$3"
              onPress={() => {
                /* Custom code goes here, does not interfere with popover closure */
              }}
            >
              Close
            </Button>
          </Popover.Close>
        </YStack>
      </Popover.Content>
    </Popover>
  );
}
