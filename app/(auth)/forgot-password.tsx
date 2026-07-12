import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { useRouter, Link } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { resetPassword } from '../../services/auth';
import { COLORS, GRADIENTS } from '../../constants/theme-colors';
import StatusModal from '../../components/StatusModal';
import { useStatusModal } from '../../hooks/useStatusModal';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { modal, showSuccess, showError, hideModal } = useStatusModal();

  const handleReset = async () => {
    if (!email.trim() || !newPassword || !confirmPassword) {
      showError('Missing Fields', 'Please fill in all fields.');
      return;
    }
    if (newPassword.length < 8) {
      showError('Weak Password', 'Password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      showError('Password Mismatch', 'Passwords do not match.');
      return;
    }

    setLoading(true);
    const res = await resetPassword(email.trim(), newPassword);
    setLoading(false);

    if (res.success) {
      showSuccess('Password Reset!', 'You can now log in with your new password.', () => {
        router.replace('/(auth)/login');
      });
    } else {
      showError('Reset Failed', res.message || 'Something went wrong.');
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <LinearGradient colors={GRADIENTS.hero} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={20} color={COLORS.white} />
          </TouchableOpacity>
          <View style={styles.logoRow}>
            <Ionicons name="lock-open-outline" size={26} color={COLORS.white} />
            <Text style={styles.logoText}>Trackademic</Text>
          </View>
          <Text style={styles.heroTitle}>Reset Password</Text>
          <Text style={styles.heroSubtitle}>Enter your email and set a new password.</Text>
        </LinearGradient>

        <View style={styles.formCard}>
          <Text style={styles.label}>Email</Text>
          <View style={styles.inputWrap}>
            <Ionicons name="mail-outline" size={18} color={COLORS.subtext} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="you@example.com"
              placeholderTextColor={COLORS.subtext}
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <Text style={styles.label}>New Password</Text>
          <View style={styles.inputWrap}>
            <Ionicons name="lock-closed-outline" size={18} color={COLORS.subtext} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Min. 8 characters"
              placeholderTextColor={COLORS.subtext}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
              value={newPassword}
              onChangeText={setNewPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword((v) => !v)}>
              <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color={COLORS.subtext} />
            </TouchableOpacity>
          </View>


          <Text style={styles.label}>Confirm New Password</Text>
          <View style={styles.inputWrap}>
            <Ionicons name="lock-closed-outline" size={18} color={COLORS.subtext} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Re-enter new password"
              placeholderTextColor={COLORS.subtext}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
          </View>

          <TouchableOpacity style={styles.button} onPress={handleReset} disabled={loading}>
            {loading ? <ActivityIndicator color={COLORS.white} /> : <Text style={styles.buttonText}>Reset Password</Text>}
          </TouchableOpacity>

          <Link href="/(auth)/login" asChild>
            <TouchableOpacity>
              <Text style={styles.link}>Back to <Text style={styles.linkAccent}>Log In</Text></Text>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>

      <StatusModal
        visible={modal.visible}
        type={modal.type}
        title={modal.title}
        message={modal.message}
        confirmText={modal.confirmText}
        cancelText={modal.cancelText}
        onConfirm={modal.onConfirm}
        onCancel={modal.onCancel}
        onClose={hideModal}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  hero: {
    paddingTop: 60, paddingBottom: 46, paddingHorizontal: 28,
    borderBottomLeftRadius: 32, borderBottomRightRadius: 32,
  },
  backButton: {
    width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center', justifyContent: 'center', marginBottom: 16,
  },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 20 },
  logoText: { color: COLORS.white, fontSize: 16, fontWeight: '800' },
  heroTitle: { color: COLORS.white, fontSize: 24, fontWeight: '800', marginBottom: 6 },
  heroSubtitle: { color: 'rgba(255,255,255,0.75)', fontSize: 13, lineHeight: 19 },

  formCard: {
    flex: 1, backgroundColor: COLORS.bg, marginTop: -24,
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    paddingHorizontal: 24, paddingTop: 28,
  },
  label: { fontSize: 12, fontWeight: '700', color: COLORS.text, marginBottom: 8 },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.card,
    borderWidth: 1, borderColor: COLORS.border, borderRadius: 12,
    paddingHorizontal: 14, marginBottom: 16, gap: 10,
  },
  inputIcon: { marginRight: 2 },
  input: { flex: 1, paddingVertical: 13, fontSize: 14, color: COLORS.text },
  button: {
    backgroundColor: COLORS.primary, borderRadius: 12, paddingVertical: 15,
    alignItems: 'center', marginTop: 8, marginBottom: 20,
  },
  buttonText: { color: COLORS.white, fontWeight: '700', fontSize: 15 },
  link: { color: COLORS.subtext, textAlign: 'center', fontSize: 13, marginBottom: 30 },
  linkAccent: { color: COLORS.primary, fontWeight: '700' },
});