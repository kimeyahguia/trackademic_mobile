import { Modal, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme-colors';

export type ModalType = 'success' | 'error' | 'confirm';

type Props = {
  visible: boolean;
  type: ModalType;
  title: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  onClose: () => void;
};

const ICONS: Record<ModalType, { name: any; color: string; bg: string }> = {
  success: { name: 'checkmark-circle', color: COLORS.accent, bg: COLORS.accentSoft },
  error: { name: 'close-circle', color: COLORS.danger, bg: '#FCE8E8' },
  confirm: { name: 'help-circle', color: COLORS.warning, bg: '#FBF1DE' },
};

export default function StatusModal({
  visible, type, title, message, confirmText, cancelText, onConfirm, onCancel, onClose,
}: Props) {
  const icon = ICONS[type];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={[styles.iconCircle, { backgroundColor: icon.bg }]}>
            <Ionicons name={icon.name} size={38} color={icon.color} />
          </View>

          <Text style={styles.title}>{title}</Text>
          {message ? <Text style={styles.message}>{message}</Text> : null}

          {type === 'confirm' ? (
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => { onCancel?.(); onClose(); }}
              >
                <Text style={styles.cancelButtonText}>{cancelText || 'Cancel'}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.confirmButton]}
                onPress={() => { onConfirm?.(); onClose(); }}
              >
                <Text style={styles.confirmButtonText}>{confirmText || 'Confirm'}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={[
                styles.button,
                styles.singleButton,
                { backgroundColor: type === 'success' ? COLORS.accent : COLORS.danger },
              ]}
              onPress={onClose}
            >
              <Text style={styles.confirmButtonText}>{confirmText || 'OK'}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: 'rgba(14,42,34,0.45)',
    alignItems: 'center', justifyContent: 'center', padding: 24,
  },
  card: {
    backgroundColor: COLORS.card, borderRadius: 22, padding: 26,
    alignItems: 'center', width: '100%', maxWidth: 320,
    shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 }, elevation: 10,
  },
  iconCircle: {
    width: 74, height: 74, borderRadius: 37,
    alignItems: 'center', justifyContent: 'center', marginBottom: 16,
  },
  title: { fontSize: 16, fontWeight: '800', color: COLORS.text, textAlign: 'center', marginBottom: 6 },
  message: { fontSize: 13, color: COLORS.subtext, textAlign: 'center', lineHeight: 19, marginBottom: 20 },
  buttonRow: { flexDirection: 'row', gap: 10, width: '100%', marginTop: 4 },
  button: { flex: 1, borderRadius: 12, paddingVertical: 13, alignItems: 'center' },
  singleButton: { width: '100%', marginTop: 4 },
  cancelButton: { backgroundColor: COLORS.bg, borderWidth: 1, borderColor: COLORS.border },
  cancelButtonText: { color: COLORS.subtext, fontWeight: '700', fontSize: 13 },
  confirmButton: { backgroundColor: COLORS.primary },
  confirmButtonText: { color: COLORS.white, fontWeight: '700', fontSize: 13 },
});