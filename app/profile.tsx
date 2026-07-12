import { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, Image, TouchableOpacity,
  ScrollView, TextInput, ActivityIndicator,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { COLORS, GRADIENTS, TYPOGRAPHY } from '../constants/theme-colors';
import { API_ENDPOINTS } from '../constants/api';
import { getStoredUser, logout, User } from '../services/auth';
import { updateProfile, uploadAvatar } from '../services/profile';
import StatusModal from '../components/StatusModal';
import { useStatusModal } from '../hooks/useStatusModal';

type TabKey = 'info' | 'qr';

export default function ProfileScreen() {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>('info');
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarKey, setAvatarKey] = useState(Date.now());
  const [avatarFailed, setAvatarFailed] = useState(false);

  const [firstName, setFirstName] = useState('');
  const [middleInitial, setMiddleInitial] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [course, setCourse] = useState('');

  const router = useRouter();
  const { modal, showSuccess, showError, showConfirm, hideModal } = useStatusModal();

  useEffect(() => {
    (async () => {
      const u = await getStoredUser();
      setUser(u);
      if (u) {
        setFirstName(u.first_name);
        setLastName(u.last_name);
        setEmail(u.email);
        setCourse(u.course || '');
      }
    })();
  }, []);

  const handleGoBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(drawer)');
    }
  };

  const handleLogout = () => {
    showConfirm(
      'Log Out',
      'Are you sure you want to log out?',
      async () => {
        await logout();
        router.replace('/(auth)/login');
      },
      'Log Out',
      'Cancel'
    );
  };

    const handleSave = async () => {
      if (!user) return;
      if (!firstName.trim() || !lastName.trim() || !email.trim()) {
        showError('Missing Fields', 'First name, last name, and email are required.');
        return;
      }

      showConfirm(
        'Save Changes',
        'Are you sure you want to save these changes to your profile?',
        async () => {
          setSaving(true);
          const res = await updateProfile({
            id: user.id,
            first_name: firstName.trim(),
            middle_initial: middleInitial.trim(),
            last_name: lastName.trim(),
            email: email.trim(),
            course: course.trim(),
          });
          setSaving(false);

          if (res.success && res.user) {
            setUser(res.user);
            setEditing(false);
            showSuccess('Saved!', 'Your profile has been updated.');
          } else {
            showError('Update Failed', res.message || 'Something went wrong.');
          }
        },
        'Save',
        'Cancel'
      );
    };

  const handlePickAvatar = async () => {
    if (!user) return;

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      showError('Permission Needed', 'Please allow photo library access to update your picture.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (result.canceled || !result.assets?.[0]) return;

    const asset = result.assets[0];
    const mimeType = asset.mimeType || 'image/jpeg';

    setUploadingAvatar(true);
    const res = await uploadAvatar(user.id, asset.uri, mimeType);
    setUploadingAvatar(false);

    if (res.success) {
      setAvatarFailed(false);
      setAvatarKey(Date.now());
      showSuccess('Success!', 'Profile picture updated.');
    } else {
      showError('Upload Failed', res.message || 'Could not update picture.');
    }
  };

  if (!user) return null;

  const avatarSource = avatarFailed
    ? { uri: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.first_name}` }
    : { uri: `${API_ENDPOINTS.avatarUrl(user.id)}&k=${avatarKey}` };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
        <LinearGradient colors={GRADIENTS.hero} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.cover} />

        <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
          <Ionicons name="arrow-back" size={20} color={COLORS.white} />
        </TouchableOpacity>

        <View style={styles.avatarCard}>
          <View style={styles.avatarWrap}>
            <Image source={avatarSource} style={styles.avatar} onError={() => setAvatarFailed(true)} />
            {uploadingAvatar && (
              <View style={styles.avatarLoadingOverlay}>
                <ActivityIndicator color={COLORS.white} size="small" />
              </View>
            )}
          </View>
          <Text style={styles.name}>{user.first_name} {user.last_name}</Text>
          <Text style={styles.course}>{user.course || '—'}</Text>

          <TouchableOpacity style={styles.uploadButton} onPress={handlePickAvatar} disabled={uploadingAvatar}>
            <Ionicons name="camera-outline" size={15} color={COLORS.white} />
            <Text style={styles.uploadButtonText}>
              {uploadingAvatar ? 'Uploading...' : 'Update Profile Picture'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.tabBar}>
          <TouchableOpacity style={styles.tabItem} onPress={() => setActiveTab('info')}>
            <Text style={[styles.tabLabel, activeTab === 'info' && styles.tabLabelActive]}>Personal Info</Text>
            {activeTab === 'info' && <View style={styles.tabIndicator} />}
          </TouchableOpacity>
          <TouchableOpacity style={styles.tabItem} onPress={() => setActiveTab('qr')}>
            <Text style={[styles.tabLabel, activeTab === 'qr' && styles.tabLabelActive]}>Download Qr Code</Text>
            {activeTab === 'qr' && <View style={styles.tabIndicator} />}
          </TouchableOpacity>
        </View>

        <View style={{ padding: 16 }}>
          {activeTab === 'info' ? (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>About Me</Text>
                <TouchableOpacity
                  style={styles.editToggle}
                  onPress={() => (editing ? handleSave() : setEditing(true))}
                  disabled={saving}
                >
                  {saving ? (
                    <ActivityIndicator size="small" color={COLORS.white} />
                  ) : (
                    <Ionicons name={editing ? 'checkmark' : 'create-outline'} size={16} color={COLORS.white} />
                  )}
                </TouchableOpacity>
              </View>

              <Field label="Sr-Code" value={user.sr_code || '—'} editable={false} />
              <Field label="Firstname" value={firstName} onChangeText={setFirstName} editable={editing} />
              <Field label="Middle Initial" value={middleInitial} onChangeText={setMiddleInitial} editable={editing} />
              <Field label="Lastname" value={lastName} onChangeText={setLastName} editable={editing} />
              <Field label="Email" value={email} onChangeText={setEmail} editable={editing} keyboardType="email-address" />
              <Field label="Course" value={course} onChangeText={setCourse} editable={editing} />

              {editing && (
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => {
                    setFirstName(user.first_name);
                    setLastName(user.last_name);
                    setEmail(user.email);
                    setCourse(user.course || '');
                    setEditing(false);
                  }}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <View style={[styles.card, { alignItems: 'center', paddingVertical: 30 }]}>
              <Ionicons name="qr-code-outline" size={64} color={COLORS.border} />
              <Text style={styles.qrText}>Your QR Code will appear here.</Text>
              <TouchableOpacity style={styles.uploadButton}>
                <Ionicons name="download-outline" size={15} color={COLORS.white} />
                <Text style={styles.uploadButtonText}>Download QR Code</Text>
              </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={18} color={COLORS.white} />
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>
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
    </>
  );
}

function Field({
  label, value, onChangeText, editable, keyboardType,
}: {
  label: string; value: string; onChangeText?: (v: string) => void;
  editable: boolean; keyboardType?: 'default' | 'email-address';
}) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={[styles.fieldInput, !editable && styles.fieldInputDisabled]}
        value={value}
        onChangeText={onChangeText}
        editable={editable}
        keyboardType={keyboardType || 'default'}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  cover: { width: '100%', height: 130 },
  backButton: {
    position: 'absolute',
    top: 46,
    left: 16,
    width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center', justifyContent: 'center',
    zIndex: 20,
    elevation: 20,
  },
  avatarCard: {
    backgroundColor: COLORS.card, alignItems: 'center', paddingBottom: 18,
    marginHorizontal: 16, marginTop: -40, borderRadius: 20,
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  avatarWrap: { marginTop: -45 },
  avatar: {
    width: 90, height: 90, borderRadius: 45, backgroundColor: COLORS.border,
    borderWidth: 3, borderColor: COLORS.card,
  },
  avatarLoadingOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    borderRadius: 45, backgroundColor: 'rgba(14,42,34,0.5)',
    alignItems: 'center', justifyContent: 'center',
  },
  name: { ...TYPOGRAPHY.heading, fontSize: 17, marginTop: 10 },
  course: { ...TYPOGRAPHY.caption, marginTop: 2, marginBottom: 12 },
  uploadButton: {
    flexDirection: 'row', backgroundColor: COLORS.accent, borderRadius: 10,
    paddingVertical: 9, paddingHorizontal: 16, alignItems: 'center', gap: 6, marginTop: 6,
  },
  uploadButtonText: { color: COLORS.white, fontWeight: '700', fontSize: 12 },

  tabBar: {
    flexDirection: 'row', backgroundColor: COLORS.card, marginTop: 16,
    marginHorizontal: 16, borderRadius: 12, overflow: 'hidden',
  },
  tabItem: { flex: 1, alignItems: 'center', paddingVertical: 12 },
  tabLabel: { fontSize: 12, color: COLORS.subtext, fontWeight: '600' },
  tabLabelActive: { color: COLORS.primary },
  tabIndicator: { height: 2, width: '70%', backgroundColor: COLORS.primary, marginTop: 6, borderRadius: 2 },

  card: {
    backgroundColor: COLORS.card, borderRadius: 16, padding: 16,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 }, elevation: 2, marginBottom: 20,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  editToggle: {
    backgroundColor: COLORS.accent, width: 28, height: 28, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
  },

  fieldGroup: { marginBottom: 12 },
  fieldLabel: { fontSize: 11, color: COLORS.subtext, marginBottom: 5, fontWeight: '600' },
  fieldInput: {
    borderWidth: 1, borderColor: COLORS.border, borderRadius: 10,
    paddingVertical: 10, paddingHorizontal: 12, fontSize: 13, color: COLORS.text,
  },
  fieldInputDisabled: { backgroundColor: COLORS.bg, color: COLORS.subtext },

  cancelButton: { alignItems: 'center', marginTop: 6, paddingVertical: 6 },
  cancelButtonText: { color: COLORS.subtext, fontSize: 12, fontWeight: '600' },

  qrText: { color: COLORS.subtext, fontSize: 12, marginTop: 10, marginBottom: 14 },

  logoutButton: {
    flexDirection: 'row', backgroundColor: COLORS.danger, borderRadius: 12,
    padding: 14, alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  logoutText: { color: COLORS.white, fontWeight: '700', fontSize: 14 },
});