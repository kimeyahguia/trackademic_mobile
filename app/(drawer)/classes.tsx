import { useCallback, useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, RefreshControl, Modal, TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY } from '../../constants/theme-colors';
import { getMyClasses, joinClass, ClassItem } from '../../services/classes';
import { getStoredUser } from '../../services/auth';
import StatusModal from '../../components/StatusModal';
import { useStatusModal } from '../../hooks/useStatusModal';

export default function ClassesScreen() {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [classCode, setClassCode] = useState('');
  const [joining, setJoining] = useState(false);
  const [studentId, setStudentId] = useState<number | null>(null);
  const router = useRouter();
  const { modal, showSuccess, showError, hideModal } = useStatusModal();

  const fetchClasses = useCallback(async () => {
    const user = await getStoredUser();
    if (!user) return;
    setStudentId(user.id);

    const res = await getMyClasses(user.id);
    if (res.success) setClasses(res.data);
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchClasses();
  };

  const handleJoin = async () => {
    if (!classCode.trim()) {
      showError('Missing Code', 'Please enter a class code.');
      return;
    }
    if (!studentId) return;

    setJoining(true);
    const res = await joinClass(studentId, classCode.trim());
    setJoining(false);

    if (res.success) {
      setModalVisible(false);
      setClassCode('');
      fetchClasses();
      showSuccess('Joined!', 'You have successfully joined the class.');
    } else {
      showError('Join Failed', res.message || 'Invalid class code.');
    }
  };

  const formatSchedule = (schedule: ClassItem['schedule']) => {
    const formatTime = (t: string) => {
      const [h, m] = t.split(':');
      const hour = parseInt(h, 10);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const hour12 = hour % 12 === 0 ? 12 : hour % 12;
      return `${hour12}:${m} ${ampm}`;
    };
    return schedule.map(
      (s) => `${s.day}: ${formatTime(s.start_time)} - ${formatTime(s.end_time)}`
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.headerRow}>
          <Text style={TYPOGRAPHY.heading}>My Classes</Text>
          <TouchableOpacity style={styles.joinButton} onPress={() => setModalVisible(true)}>
            <Ionicons name="add" size={16} color={COLORS.white} />
            <Text style={styles.joinButtonText}>Join Class</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator style={{ marginTop: 30 }} color={COLORS.primary} />
        ) : classes.length === 0 ? (
          <Text style={styles.emptyText}>You haven't joined any classes yet.</Text>
        ) : (
          classes.map((c) => (
            <View
              key={c.id}
              style={[
                styles.classCard,
                { backgroundColor: c.status === 'archived' ? COLORS.subtext : COLORS.primary },
              ]}
            >
              <Text style={styles.classTitle}>{c.subject_name.toUpperCase()}</Text>
              <Text style={styles.classSection}>{c.section}</Text>

              <View style={styles.classInfoBox}>
                <InfoLine label="Instructor" value={c.instructor_name} />
                <InfoLine label="S.Y / Semester" value={`${c.school_year} | ${c.semester}`} />
                <InfoLine
                  label="Class Status"
                  value={c.status === 'active' ? 'Active' : 'Archived'}
                />

                {c.schedule.length > 0 && (
                  <>
                    <Text style={styles.scheduleLabel}>Schedule:</Text>
                    {formatSchedule(c.schedule).map((line, idx) => (
                      <Text key={idx} style={styles.scheduleLine}>{line}</Text>
                    ))}
                  </>
                )}
              </View>

              <TouchableOpacity
                style={styles.viewClassButton}
                onPress={() => router.push(`/class/${c.id}`)}
              >
                <Text style={styles.viewClassButtonText}>View Class</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>

      {/* Join Class Modal */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Join your respective class!</Text>
            <Text style={styles.modalLabel}>Class Code</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Enter Class Code"
              value={classCode}
              onChangeText={setClassCode}
              autoCapitalize="none"
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => {
                  setModalVisible(false);
                  setClassCode('');
                }}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmJoinButton} onPress={handleJoin} disabled={joining}>
                {joining ? (
                  <ActivityIndicator color={COLORS.white} size="small" />
                ) : (
                  <Text style={styles.confirmJoinText}>Join</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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
    </View>
  );
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <Text style={styles.infoLine}>
      <Text style={styles.infoLineLabel}>{label}: </Text>
      {value}
    </Text>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  headerRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 16,
    marginTop: 10,
  },
  joinButton: {
    flexDirection: 'row', backgroundColor: COLORS.accent, borderRadius: 8,
    paddingVertical: 8, paddingHorizontal: 12, alignItems: 'center', gap: 4,
  },
  joinButtonText: { color: COLORS.white, fontWeight: '700', fontSize: 12 },
  emptyText: { color: COLORS.subtext, textAlign: 'center', marginTop: 30 },

  classCard: { borderRadius: 16, padding: 16, marginBottom: 16 },
  classTitle: { color: COLORS.white, fontSize: 15, fontWeight: '800' },
  classSection: { color: COLORS.white, fontSize: 12, opacity: 0.9, marginBottom: 12 },
  classInfoBox: {
    backgroundColor: COLORS.white, borderRadius: 10, padding: 12, marginBottom: 12,
  },
  infoLine: { fontSize: 12, color: COLORS.text, marginBottom: 4 },
  infoLineLabel: { fontWeight: '700', color: COLORS.subtext },
  scheduleLabel: { fontSize: 12, fontWeight: '700', color: COLORS.text, marginTop: 6 },
  scheduleLine: { fontSize: 11, color: COLORS.subtext, marginTop: 2 },
  viewClassButton: {
    backgroundColor: COLORS.white, borderRadius: 8, paddingVertical: 10,
    alignItems: 'center',
  },
  viewClassButtonText: { color: COLORS.primary, fontWeight: '700', fontSize: 13 },

  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center', alignItems: 'center',
  },
  modalCard: {
    backgroundColor: COLORS.white, borderRadius: 14, padding: 20, width: '85%',
  },
  modalTitle: { fontSize: 15, fontWeight: '700', color: COLORS.text, marginBottom: 16 },
  modalLabel: { fontSize: 12, color: COLORS.subtext, marginBottom: 6 },
  modalInput: {
    borderWidth: 1, borderColor: COLORS.border, borderRadius: 8,
    padding: 12, fontSize: 14, marginBottom: 20,
  },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10 },
  closeButton: {
    backgroundColor: COLORS.subtext, borderRadius: 8, paddingVertical: 9, paddingHorizontal: 18,
  },
  closeButtonText: { color: COLORS.white, fontWeight: '600', fontSize: 13 },
  confirmJoinButton: {
    backgroundColor: COLORS.accent, borderRadius: 8, paddingVertical: 9, paddingHorizontal: 18,
    minWidth: 60, alignItems: 'center',
  },
  confirmJoinText: { color: COLORS.white, fontWeight: '600', fontSize: 13 },
});