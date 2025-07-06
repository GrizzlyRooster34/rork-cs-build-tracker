import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { theme } from '@/constants/theme';
import { CarMode } from '@/types';

type ModeToggleProps = {
  currentMode: CarMode;
  onToggle: () => void;
};

export default function ModeToggle({ currentMode, onToggle }: ModeToggleProps) {
  return (
    <Pressable onPress={onToggle}>
      <View style={styles.container}>
        <View style={[
          styles.toggle,
          currentMode === 'show' ? styles.showMode : styles.dailyMode
        ]}>
          <View style={[
            styles.option,
            currentMode === 'daily' ? styles.activeOption : {}
          ]}>
            <Text style={[
              styles.optionText,
              currentMode === 'daily' ? styles.activeText : {}
            ]}>
              Daily
            </Text>
          </View>
          <View style={[
            styles.option,
            currentMode === 'show' ? styles.activeOption : {}
          ]}>
            <Text style={[
              styles.optionText,
              currentMode === 'show' ? styles.activeText : {}
            ]}>
              Show
            </Text>
          </View>
          <View style={[
            styles.indicator,
            currentMode === 'show' ? styles.indicatorRight : styles.indicatorLeft
          ]} />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
  },
  toggle: {
    flexDirection: 'row',
    backgroundColor: theme.colors.card,
    borderRadius: 20,
    padding: 4,
    position: 'relative',
    width: 180,
  },
  dailyMode: {
    borderColor: theme.colors.tint,
    borderWidth: 1,
  },
  showMode: {
    borderColor: theme.colors.accent,
    borderWidth: 1,
  },
  option: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    zIndex: 1,
  },
  activeOption: {
    // Styles for the active option
  },
  optionText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.subtext,
  },
  activeText: {
    color: theme.colors.text,
    fontWeight: 'bold',
  },
  indicator: {
    position: 'absolute',
    width: '50%',
    height: '100%',
    borderRadius: 16,
    top: 0,
    zIndex: 0,
  },
  indicatorLeft: {
    left: 0,
    backgroundColor: theme.colors.tint + '33', // Adding transparency
  },
  indicatorRight: {
    right: 0,
    backgroundColor: theme.colors.accent + '33', // Adding transparency
  },
});