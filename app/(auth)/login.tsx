import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { useRouter, Link } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { login } from '../../services/auth';
import { COLORS, GRADIENTS } from '../../constants/theme-colors';
import StatusModal from '../../components/StatusModal';
import { useStatusModal } from '../../hooks/useStatusModal';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { modal, showError, hideModal } = useStatusModal();

  const handleLogin = async () => {
    if (!email || !password) {
      showError('Missing Fields', 'Please enter email and password.');
      return;
    }
    setLoading(true);
    try {
      const res = await login(email.trim(), password);
      if (res.success) {
        router.replace('/(drawer)');
      } else {
        showError('Login Failed', res.message || 'Invalid credentials.');
      }
    } catch (err) {
      showError('Error', 'Could not connect to server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <LinearGradient colors={GRADIENTS.hero} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
          <View style={styles.logoRow}>
            <Ionicons name="school" size={28} color={COLORS.white} />
            <Text style={styles.logoText}>Trackademic</Text>
          </View>
          <Text style={styles.heroTitle}>Welcome back</Text>
          <Text style={styles.heroSubtitle}>Sign in to check your classes, updates, and performance.</Text>
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

          <Text style={styles.label}>Password</Text>
          <View style={styles.inputWrap}>
            <Ionicons name="lock-closed-outline" size={18} color={COLORS.subtext} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor={COLORS.subtext}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword((v) => !v)}>
              <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color={COLORS.subtext} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
            {loading ? <ActivityIndicator color={COLORS.white} /> : <Text style={styles.buttonText}>Log In</Text>}
          </TouchableOpacity>

          <Link href="/(auth)/forgot-password" asChild>
            <TouchableOpacity>
              <Text style={styles.forgotLink}>Forgot Password?</Text>
            </TouchableOpacity>
          </Link>

          <Link href="/(auth)/register" asChild>
            <TouchableOpacity>
              <Text style={styles.link}>Don't have an account? <Text style={styles.linkAccent}>Register</Text></Text>
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
    paddingTop: 70, paddingBottom: 50, paddingHorizontal: 28,
    borderBottomLeftRadius: 32, borderBottomRightRadius: 32,
  },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 28 },
  logoText: { color: COLORS.white, fontSize: 18, fontWeight: '800' },
  heroTitle: { color: COLORS.white, fontSize: 26, fontWeight: '800', marginBottom: 8 },
  heroSubtitle: { color: 'rgba(255,255,255,0.75)', fontSize: 13, lineHeight: 19 },

  formCard: {
    flex: 1, backgroundColor: COLORS.bg, marginTop: -28,
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    paddingHorizontal: 24, paddingTop: 32,
  },
  forgotLink: {
  color: COLORS.primary, textAlign: 'right', fontSize: 12,
  fontWeight: '600', marginTop: -8, marginBottom: 20,
  },
  label: { fontSize: 12, fontWeight: '700', color: COLORS.text, marginBottom: 8 },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.card,
    borderWidth: 1, borderColor: COLORS.border, borderRadius: 12,
    paddingHorizontal: 14, marginBottom: 18, gap: 10,
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