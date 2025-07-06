import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '@/constants/theme';
import { ModificationStage } from '@/types';

type StageBadgeProps = {
  stage: ModificationStage;
  small?: boolean;
};

export default function StageBadge({ stage, small = false }: StageBadgeProps) {
  let backgroundColor;
  
  switch (stage) {
    case 0:
      backgroundColor = theme.colors.border;
      break;
    case 1:
      backgroundColor = theme.colors.tint;
      break;
    case 2:
      backgroundColor = theme.colors.warning;
      break;
    case 3:
      backgroundColor = theme.colors.error;
      break;
    default:
      backgroundColor = theme.colors.border;
  }
  
  return (
    <View style={[styles.badge, { backgroundColor }, small ? styles.small : {}]}>
      <Text style={[styles.text, small ? styles.smallText : {}]}>
        Stage {stage}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  small: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  smallText: {
    fontSize: 10,
  },
});