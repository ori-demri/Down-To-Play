/**
 * Login Modal Component
 * Modal wrapper for LoginScreen used when protecting actions
 */

import React from 'react';
import { Modal } from 'react-native';
import { LoginScreen } from '@/screens/LoginScreen';

interface LoginModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function LoginModal({ visible, onClose, onSuccess }: LoginModalProps) {
  const handleSuccess = () => {
    onClose();
    onSuccess?.();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <LoginScreen onSkip={onClose} onSuccess={handleSuccess} showSkip={true} />
    </Modal>
  );
}
