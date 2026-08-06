import React from 'react';
import { View, StyleSheet, ActivityIndicator, Modal } from 'react-native';
import { COLORS } from '../../theme/colors';

interface LoadingOverlayProps {
  visible: boolean;
}

export const LoadingOverlay = ({ visible }: LoadingOverlayProps) => {
  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.container}>
        <View style={styles.box}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  box: {
    padding: 24,
    backgroundColor: COLORS.background,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
