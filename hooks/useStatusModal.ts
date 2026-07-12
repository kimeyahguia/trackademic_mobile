import { useState, useCallback } from 'react';
import { ModalType } from '../components/StatusModal';

type ModalState = {
  visible: boolean;
  type: ModalType;
  title: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
};

const initialState: ModalState = {
  visible: false,
  type: 'success',
  title: '',
};

export function useStatusModal() {
  const [modal, setModal] = useState<ModalState>(initialState);

  const showSuccess = useCallback((title: string, message?: string, onConfirm?: () => void) => {
    setModal({ visible: true, type: 'success', title, message, onConfirm });
  }, []);

  const showError = useCallback((title: string, message?: string) => {
    setModal({ visible: true, type: 'error', title, message });
  }, []);

  const showConfirm = useCallback((
    title: string,
    message: string,
    onConfirm: () => void,
    confirmText?: string,
    cancelText?: string
  ) => {
    setModal({ visible: true, type: 'confirm', title, message, onConfirm, confirmText, cancelText });
  }, []);

  const hideModal = useCallback(() => {
    setModal((prev) => ({ ...prev, visible: false }));
  }, []);

  return { modal, showSuccess, showError, showConfirm, hideModal };
}