import { useCallback, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Image,
  ActivityIndicator, RefreshControl, TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import axios from 'axios';
import { useRouter, useFocusEffect } from 'expo-router';
import { COLORS, GRADIENTS } from '../../constants/theme-colors';
import { getStoredUser, getProfile, User } from '../../services/auth';
import { api, API_ENDPOINTS } from '../../constants/api';

type Announcement = {
  id: number;
  title: string;
  body: string;
  posted_by_name: string | null;
  created_at: string;
};

export default function HomeScreen() {
  const [user, setUser] = useState<User | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const fetchData = useCallback(async (signal?: AbortSignal) => {
    try {
      const cachedUser = await getStoredUser();
      if (cachedUser && !signal?.aborted) setUser(cachedUser);

      if (cachedUser?.id) {
        const profileRes = await getProfile(cachedUser.id);
        if (!signal?.aborted && profileRes.success && profileRes.user) {
          setUser(profileRes.user);
        }
      }

      const res = await api.get(API_ENDPOINTS.announcements);
      if (!signal?.aborted && res.data.success) setAnnouncements(res.data.data);
    } catch (err) {
      if (axios.isAxiosError(err)) console.log('Home fetch error:', err.message);
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      const controller = new AbortController();
      setLoading(true);
      fetchData(controller.signal);
      return () => controller.abort();
    }, [fetchData])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) +
      ' · ' + d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 40 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.accent} />}
      showsVerticalScrollIndicator={false}
    >
      <LinearGradient colors={GRADIENTS.hero} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
        <View style={styles.heroTop}>
          <View style={styles.heroUserRow}>
            <Image
              source={{
                uri: user?.has_avatar
                  ? API_ENDPOINTS.avatarUrl(user.id)
                  : `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.first_name || 'Guest'}`,
              }}
              style={styles.heroAvatar}
            />
            <View>
              <Text style={styles.heroGreeting}>Hi, {user?.first_name || '...'}</Text>
              <Text style={styles.heroSub}>{user?.role === 'student' ? 'Student' : 'Instructor'} · {user?.course || 'Trackademic'}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.heroLabel}>Enrolled Classes</Text>
        <Text style={styles.heroValue}>{loading ? '—' : '2 Active'}</Text>

        <View style={styles.quickActionsRow}>
          <QuickAction icon="home-outline" label="Home" onPress={() => {}} />
          <QuickAction icon="list-outline" label="Class" onPress={() => router.push('/(drawer)/classes')} />
          <QuickAction icon="bar-chart-outline" label="Grades" onPress={() => router.push('/(drawer)/performance')} />
          <QuickAction icon="person-outline" label="Profile" onPress={() => router.push('/profile')} />
        </View>
      </LinearGradient>

      <View style={{ paddingHorizontal: 16 }}>
        <LinearGradient colors={GRADIENTS.promo} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.promoCard}>
          <View style={{ flex: 1 }}>
            <Text style={styles.promoTag}>TRACKADEMIC</Text>
            <Text style={styles.promoTitle}>Stay on top of{'\n'}your academics</Text>
            <TouchableOpacity style={styles.promoButton} onPress={() => router.push('/(drawer)/classes')}>
              <Text style={styles.promoButtonText}>View Classes</Text>
            </TouchableOpacity>
          </View>
          <Ionicons name="school" size={70} color="rgba(255,255,255,0.18)" style={styles.promoIcon} />
        </LinearGradient>

        <View style={styles.sectionHeader}>
          <Ionicons name="megaphone" size={17} color={COLORS.pink} />
          <Text style={styles.sectionTitle}>Announcements</Text>
        </View>

        {loading ? (
          <ActivityIndicator style={{ marginTop: 30 }} color={COLORS.accent} />
        ) : announcements.length === 0 ? (
          <Text style={styles.emptyText}>No announcements yet.</Text>
        ) : (
          announcements.map((a) => (
            <View key={a.id} style={styles.announcementCard}>
              <View style={styles.announcementDot} />
              <View style={{ flex: 1 }}>
                <Text style={styles.announcementTitle}>{a.title}</Text>
                <Text style={styles.announcementDate}>{formatDate(a.created_at)}</Text>
                <Text style={styles.announcementBody} numberOfLines={3}>{a.body}</Text>
              </View>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

function QuickAction({ icon, label, onPress }: { icon: any; label: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.quickAction} onPress={onPress}>
      <View style={styles.quickActionCircle}>
        <Ionicons name={icon} size={18} color={COLORS.white} />
      </View>
      <Text style={styles.quickActionLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  hero: {
    paddingTop: 20, paddingBottom: 26, paddingHorizontal: 20,
    borderBottomLeftRadius: 28, borderBottomRightRadius: 28, marginBottom: 20,
  },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 },
  heroUserRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  heroAvatar: { width: 42, height: 42, borderRadius: 21, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.4)' },
  heroGreeting: { color: COLORS.white, fontSize: 30, fontWeight: '700' },
  heroSub: { color: 'rgba(255,255,255,0.7)', fontSize: 14, marginTop: 2 },
  heroBell: {
    width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center', justifyContent: 'center',
  },
  heroLabel: { color: 'rgba(255,255,255,0.65)', fontSize: 14 },
  heroValue: { color: COLORS.white, fontSize: 30, fontWeight: '800', marginTop: 4, marginBottom: 22 },
  quickActionsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  quickAction: { alignItems: 'center', gap: 6 },
  quickActionCircle: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center', justifyContent: 'center',
  },
  quickActionLabel: { color: 'rgba(255,255,255,0.85)', fontSize: 14, fontWeight: '600' },
  promoCard: {
    borderRadius: 20, padding: 20, marginTop: -34, marginBottom: 22,
    flexDirection: 'row', alignItems: 'center', overflow: 'hidden',
  },
  promoTag: { color: 'rgba(255,255,255,0.75)', fontSize: 12, fontWeight: '800', letterSpacing: 1 },
  promoTitle: { color: COLORS.white, fontSize: 18, fontWeight: '800', marginTop: 6, marginBottom: 14, lineHeight: 22 },
  promoButton: {
    backgroundColor: COLORS.white, borderRadius: 10, paddingVertical: 8, paddingHorizontal: 16,
    alignSelf: 'flex-start',
  },
  promoButtonText: { color: COLORS.primary, fontWeight: '700', fontSize: 13 },
  promoIcon: { position: 'absolute', right: -6, bottom: -10 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: COLORS.text },
  emptyText: { color: COLORS.subtext, textAlign: 'center', marginTop: 20 },
  announcementCard: {
    flexDirection: 'row', backgroundColor: COLORS.card, borderRadius: 16,
    padding: 14, marginBottom: 12, gap: 10,
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 }, elevation: 1,
  },
  announcementDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.accent, marginTop: 6 },
  announcementTitle: { fontSize: 14, fontWeight: '700', color: COLORS.text },
  announcementDate: { fontSize: 11, color: COLORS.subtext, marginTop: 2, marginBottom: 6 },
  announcementBody: { fontSize: 12.5, color: COLORS.text, lineHeight: 18, opacity: 0.85 },
});