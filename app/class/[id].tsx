import { useCallback, useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Image, Linking, RefreshControl,
} from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, GRADIENTS, STATUS_COLORS } from '../../constants/theme-colors';
import {
  getClassDetails, getMaterials, getClassmates, getAttendance,
  ClassDetails, LearningMaterial, Classmate, AttendanceRecord,
} from '../../services/classes';
import { getStoredUser } from '../../services/auth';

type TabKey = 'stream' | 'materials' | 'classmates' | 'attendance';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'stream', label: 'Stream' },
  { key: 'materials', label: 'Learning Materials' },
  { key: 'classmates', label: 'My Classmates' },
  { key: 'attendance', label: 'Attendance' },
];

const FILE_ICONS: Record<string, any> = {
  pdf: 'document-text-outline',
  ppt: 'easel-outline',
  doc: 'document-outline',
  other: 'document-attach-outline',
};

export default function ClassDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const classId = Number(id);
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<TabKey>('stream');
  const [details, setDetails] = useState<ClassDetails | null>(null);
  const [materials, setMaterials] = useState<LearningMaterial[]>([]);
  const [classmates, setClassmates] = useState<Classmate[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [studentInfo, setStudentInfo] = useState<{ sr_code: string; name: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAll = useCallback(async () => {
    const user = await getStoredUser();
    if (!user || !classId) return;

    const [detailsRes, materialsRes, classmatesRes, attendanceRes] = await Promise.all([
      getClassDetails(classId),
      getMaterials(classId),
      getClassmates(classId),
      getAttendance(classId, user.id),
    ]);

    if (detailsRes.success) setDetails(detailsRes.data);
    if (materialsRes.success) setMaterials(materialsRes.data);
    if (classmatesRes.success) setClassmates(classmatesRes.data);
    if (attendanceRes.success) {
      setAttendance(attendanceRes.data);
      setStudentInfo(attendanceRes.student);
    }

    setLoading(false);
    setRefreshing(false);
  }, [classId]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchAll();
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.accent} />
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        {/* Custom header */}
        <LinearGradient colors={GRADIENTS.hero} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={20} color={COLORS.white} />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {details ? details.subject_name : 'Class Details'}
            </Text>
            <Text style={styles.headerSub} numberOfLines={1}>{details?.section}</Text>
          </View>
        </LinearGradient>

        {/* Tab bar */}
        <View style={styles.tabBar}>
          {TABS.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={styles.tabItem}
              onPress={() => setActiveTab(tab.key)}
            >
              <Text style={[styles.tabLabel, activeTab === tab.key && styles.tabLabelActive]}>
                {tab.label}
              </Text>
              {activeTab === tab.key && <View style={styles.tabIndicator} />}
            </TouchableOpacity>
          ))}
        </View>

        <ScrollView
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.accent} />}
        >
          {activeTab === 'stream' && <StreamTab details={details} />}
          {activeTab === 'materials' && <MaterialsTab materials={materials} />}
          {activeTab === 'classmates' && <ClassmatesTab classmates={classmates} />}
          {activeTab === 'attendance' && (
            <AttendanceTab studentInfo={studentInfo} records={attendance} />
          )}
        </ScrollView>
      </View>
    </>
  );
}

// ---------------- STREAM TAB ----------------
function StreamTab({ details }: { details: ClassDetails | null }) {
  return (
    <View>
      <LinearGradient colors={GRADIENTS.promo} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.codeCard}>
        <Text style={styles.codeLabel}>Class Code</Text>
        <Text style={styles.codeValue}>{details?.class_code}</Text>
        {details?.meet_link && (
          <TouchableOpacity
            style={styles.meetButton}
            onPress={() => Linking.openURL(details.meet_link!)}
          >
            <Ionicons name="videocam" size={16} color={COLORS.primary} />
            <Text style={styles.meetButtonText}>Join Meet</Text>
          </TouchableOpacity>
        )}
      </LinearGradient>

      <TouchableOpacity style={styles.addPostButton} disabled>
        <Ionicons name="add-circle-outline" size={16} color={COLORS.accent} />
        <Text style={styles.addPostText}>Add Post (Available Soon)</Text>
      </TouchableOpacity>

      <View style={styles.emptyStream}>
        <Ionicons name="chatbubbles-outline" size={36} color={COLORS.border} />
        <Text style={styles.emptyStreamText}>No posts yet. Be the first to share something with your class!</Text>
      </View>
    </View>
  );
}

// ---------------- LEARNING MATERIALS TAB ----------------
function MaterialsTab({ materials }: { materials: LearningMaterial[] }) {
  if (materials.length === 0) {
    return <Text style={styles.emptyText}>No learning materials posted yet.</Text>;
  }

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) +
      ' at ' + d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  return (
    <View>
      {materials.map((m) => (
        <View key={m.id} style={styles.materialCard}>
          <View style={styles.materialIconCircle}>
            <Ionicons name={FILE_ICONS[m.file_type] || FILE_ICONS.other} size={20} color={COLORS.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.materialTitle}>{m.title}</Text>
            {m.description ? <Text style={styles.materialDesc}>{m.description}</Text> : null}
            <Text style={styles.materialDate}>Date Posted: {formatDate(m.posted_at)}</Text>
            <View style={styles.materialActions}>
              <TouchableOpacity style={styles.viewButton}>
                <Text style={styles.viewButtonText}>View File</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.downloadButton}>
                <Text style={styles.downloadButtonText}>Download</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ))}
    </View>
  );
}

// ---------------- CLASSMATES TAB ----------------
function ClassmatesTab({ classmates }: { classmates: Classmate[] }) {
  if (classmates.length === 0) {
    return <Text style={styles.emptyText}>No classmates found.</Text>;
  }

  return (
    <View>
      {classmates.map((c) => (
        <View key={c.id} style={styles.classmateRow}>
          <Image
            source={{ uri: c.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${c.first_name}${c.id}` }}
            style={styles.classmateAvatar}
          />
          <Text style={styles.classmateName}>
            {c.last_name.toUpperCase()}, {c.first_name}
          </Text>
          <TouchableOpacity style={styles.mailButton}>
            <Ionicons name="mail-outline" size={16} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
}

// ---------------- ATTENDANCE TAB ----------------
function AttendanceTab({
  studentInfo,
  records,
}: {
  studentInfo: { sr_code: string; name: string } | null;
  records: AttendanceRecord[];
}) {
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };
  const formatTime = (timeStr: string | null) => {
    if (!timeStr) return '—';
    const [h, m] = timeStr.split(':');
    const hour = parseInt(h, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 === 0 ? 12 : hour % 12;
    return `${hour12}:${m} ${ampm}`;
  };

  return (
    <View>
      {studentInfo && (
        <View style={styles.studentInfoCard}>
          <View style={styles.studentInfoRow}>
            <Text style={styles.studentInfoLabel}>Sr Code</Text>
            <Text style={styles.studentInfoValue}>{studentInfo.sr_code}</Text>
          </View>
          <View style={styles.studentInfoRow}>
            <Text style={styles.studentInfoLabel}>Name</Text>
            <Text style={styles.studentInfoValue}>{studentInfo.name}</Text>
          </View>
        </View>
      )}

      {records.length === 0 ? (
        <Text style={styles.emptyText}>No attendance records yet.</Text>
      ) : (
        <View style={styles.attendanceTable}>
          <View style={styles.attendanceHeaderRow}>
            <Text style={[styles.attendanceHeaderCell, { flex: 1.2 }]}>Date</Text>
            <Text style={styles.attendanceHeaderCell}>Time In</Text>
            <Text style={[styles.attendanceHeaderCell, { flex: 1.3 }]}>Status</Text>
          </View>
          {records.map((r, idx) => (
            <View key={idx} style={styles.attendanceRow}>
              <Text style={[styles.attendanceCell, { flex: 1.2 }]}>{formatDate(r.date)}</Text>
              <Text style={styles.attendanceCell}>{formatTime(r.time_in)}</Text>
              <View style={[styles.statusBadge, { backgroundColor: (STATUS_COLORS[r.status] || COLORS.subtext) + '20', flex: 1.3 }]}>
                <Text style={[styles.statusText, { color: STATUS_COLORS[r.status] || COLORS.subtext }]}>
                  {r.status}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.bg },

  header: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingTop: 50, paddingBottom: 18, paddingHorizontal: 16,
    borderBottomLeftRadius: 24, borderBottomRightRadius: 24,
  },
  backButton: {
    width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { color: COLORS.white, fontSize: 17, fontWeight: '800' },
  headerSub: { color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 2 },

  tabBar: {
    flexDirection: 'row', backgroundColor: COLORS.card,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  tabItem: { flex: 1, alignItems: 'center', paddingVertical: 12 },
  tabLabel: { fontSize: 13, color: COLORS.subtext, fontWeight: '600', textAlign: 'center' },
  tabLabelActive: { color: COLORS.primary },
  tabIndicator: { height: 2, width: '70%', backgroundColor: COLORS.primary, marginTop: 6, borderRadius: 2 },

  // Stream
  codeCard: {
    borderRadius: 18, padding: 22,
    alignItems: 'center', marginBottom: 14,
  },
  codeLabel: { fontSize: 13, color: 'rgba(255,255,255,0.75)' },
  codeValue: { fontSize: 40, fontWeight: '800', color: COLORS.white, marginVertical: 6, letterSpacing: 1 },
  meetButton: {
    flexDirection: 'row', backgroundColor: COLORS.white, borderRadius: 10,
    paddingVertical: 10, paddingHorizontal: 18, alignItems: 'center', gap: 8, marginTop: 10,
  },
  meetButtonText: { color: COLORS.primary, fontWeight: '700', fontSize: 13 },
  addPostButton: {
    flexDirection: 'row', alignSelf: 'center', alignItems: 'center', gap: 6,
    borderWidth: 1, borderColor: COLORS.accent, borderRadius: 10,
    paddingVertical: 8, paddingHorizontal: 14, marginBottom: 14,
  },
  addPostText: { color: COLORS.accent, fontSize: 12, fontWeight: '600' },
  emptyStream: {
    backgroundColor: COLORS.card, borderRadius: 16, padding: 30,
    alignItems: 'center', gap: 10,
  },
  emptyStreamText: { color: COLORS.subtext, fontSize: 13, textAlign: 'center' },

  emptyText: { color: COLORS.subtext, textAlign: 'center', marginTop: 30 },

  // Materials
  materialCard: {
    flexDirection: 'row', backgroundColor: COLORS.card, borderRadius: 14,
    padding: 14, marginBottom: 12,
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 }, elevation: 1,
  },
  materialIconCircle: {
    width: 40, height: 40, borderRadius: 12, backgroundColor: COLORS.accentSoft,
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  materialTitle: { fontSize: 14, fontWeight: '700', color: COLORS.text },
  materialDesc: { fontSize: 12, color: COLORS.subtext, marginTop: 2 },
  materialDate: { fontSize: 11, color: COLORS.subtext, marginTop: 6 },
  materialActions: { flexDirection: 'row', gap: 10, marginTop: 10 },
  viewButton: {
    borderWidth: 1, borderColor: COLORS.accent, borderRadius: 8,
    paddingVertical: 6, paddingHorizontal: 14,
  },
  viewButtonText: { color: COLORS.accent, fontSize: 13, fontWeight: '600' },
  downloadButton: {
    borderWidth: 1, borderColor: COLORS.border, borderRadius: 8,
    paddingVertical: 6, paddingHorizontal: 14,
  },
  downloadButtonText: { color: COLORS.subtext, fontSize: 13, fontWeight: '600' },

  // Classmates
  classmateRow: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.card,
    borderRadius: 12, padding: 10, marginBottom: 8, gap: 10,
  },
  classmateAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.border },
  classmateName: { flex: 1, fontSize: 13, fontWeight: '600', color: COLORS.text },
  mailButton: {
    width: 30, height: 30, borderRadius: 15, backgroundColor: COLORS.accentSoft,
    alignItems: 'center', justifyContent: 'center',
  },

  // Attendance
  studentInfoCard: { backgroundColor: COLORS.card, borderRadius: 14, padding: 14, marginBottom: 14 },
  studentInfoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  studentInfoLabel: { fontSize: 14, color: COLORS.subtext, fontWeight: '600' },
  studentInfoValue: { fontSize: 14, color: COLORS.text, fontWeight: '700' },
  attendanceTable: { backgroundColor: COLORS.card, borderRadius: 14, overflow: 'hidden' },
  attendanceHeaderRow: {
    flexDirection: 'row', backgroundColor: COLORS.bg, padding: 10,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  attendanceHeaderCell: { flex: 1, fontSize: 14, fontWeight: '700', color: COLORS.subtext },
  attendanceRow: {
    flexDirection: 'row', alignItems: 'center', padding: 10,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  attendanceCell: { flex: 1, fontSize: 11, color: COLORS.text },
  statusBadge: { borderRadius: 6, paddingVertical: 4, paddingHorizontal: 6, alignItems: 'center' },
  statusText: { fontSize: 10, fontWeight: '700' },
});