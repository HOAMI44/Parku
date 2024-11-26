declare module 'react-native-gesture-bottom-sheet' {
  import { ReactNode } from 'react';
  import { ViewStyle } from 'react-native';

  interface BottomSheetProps {
    hasDraggableIcon?: boolean;
    dragIconColor?: string;
    dragIconStyle?: ViewStyle;
    draggable?: boolean;
    height?: number;
    backgroundColor?: string;
    ref?: any;
    children?: ReactNode;
  }

  export default class BottomSheet extends React.Component<BottomSheetProps> {
    show(): void;
    close(): void;
  }
} 