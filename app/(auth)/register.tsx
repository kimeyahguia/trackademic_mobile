import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { useRouter, Link } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { register } from '../../services/auth';
import { COLORS, GRADIENTS } from '../../constants/theme-colors';
import StatusModal from '../../components/StatusModal';
import { useStatusModal } from '../../hooks/useStatusModal';

export default function RegisterScreen() {
  const [srCode, setSrCode] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { modal, showSuccess, showError, hideModal } = useStatusModal();

  const handleRegister = async () => {
    if (!firstName || !lastName || !email || !password) {
      showError('Missing Fields', 'Please fill in all required fields.');
      return;
    }
    if (password.length < 8) {
      showError('Weak Password', 'Password must be at least 8 characters.');
      return;
    }
    setLoading(true);
    try {
      const res = await register({
        sr_code: srCode.trim(),
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim(),
        password,
      });
      if (res.success) {
        showSuccess('Account Created!', 'Please log in to continue.', () => {
          router.replace('/(auth)/login');
        });
      } else {
        showError('Registration Failed', res.message || 'Something went wrong.');
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
            <Ionicons name="school" size={26} color={COLORS.white} />
            <Text style={styles.logoText}>Trackademic</Text>
          </View>
          <Text style={styles.heroTitle}>Create Account</Text>
          <Text style={styles.heroSubtitle}>Join Trackademic and start tracking your progress.</Text>
        </LinearGradient>

        <View style={styles.formCard}>
          <Field icon="id-card-outline" label="SR-Code" placeholder="e.g. 23-79219" value={srCode} onChangeText={setSrCode} />
          <Field icon="person-outline" label="First Name" placeholder="Juan" value={firstName} onChangeText={setFirstName} />
          <Field icon="person-outline" label="Last Name" placeholder="Dela Cruz" value={lastName} onChangeText={setLastName} />
          <Field icon="mail-outline" label="Email" placeholder="you@example.com" value={email} onChangeText={setEmail} keyboardType="email-address" />

          <Text style={styles.label}>Password</Text>
          <View style={styles.inputWrap}>
            <Ionicons name="lock-closed-outline" size={18} color={COLORS.subtext} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Min. 8 characters"
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

          <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
            {loading ? <ActivityIndicator color={COLORS.white} /> : <Text style={styles.buttonText}>Register</Text>}
          </TouchableOpacity>

          <Link href="/(auth)/login" asChild>
            <TouchableOpacity>
              <Text style={styles.link}>Already have an account? <Text style={styles.linkAccent}>Log In</Text></Text>
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

function Field({
  icon, label, placeholder, value, onChangeText, keyboardType,
}: {
  icon: any; label: string; placeholder: string; value: string;
  onChangeText: (v: string) => void; keyboardType?: 'default' | 'email-address';
}) {
  return (
    <>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputWrap}>
        <Ionicons name={icon} size={18} color={COLORS.subtext} style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={COLORS.subtext}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType || 'default'}
          autoCapitalize={keyboardType === 'email-address' ? 'none' : 'words'}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  hero: {
    paddingTop: 60, paddingBottom: 46, paddingHorizontal: 28,
    borderBottomLeftRadius: 32, borderBottomRightRadius: 32,
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