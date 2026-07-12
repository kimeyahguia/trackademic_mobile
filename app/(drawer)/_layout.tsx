import { useState, useEffect } from 'react';
import { Drawer } from 'expo-router/drawer';
import { Ionicons } from '@expo/vector-icons';
import {
  TouchableOpacity, View, Text, StyleSheet, Image, Modal, Pressable, FlatList, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { DrawerToggleButton } from '@react-navigation/drawer';
import { COLORS } from '../../constants/theme-colors';
import { getStoredUser, User } from '../../services/auth';
import { getNotifications, markNotificationsRead, NotificationItem } from '../../services/notification';
import { API_ENDPOINTS } from '../../constants/api';

function TrackademicLogo() {
  return (
    <View style={styles.logoRow}>
      <Image
        source={require('../../assets/images/logo.png')}
        style={styles.logoImage}
        resizeMode="contain"
      />
      <Text style={styles.logoText}>Trackademic</Text>
    </View>
  );
}

function timeAgo(dateString: string) {
  const diffMs = Date.now() - new Date(dateString).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function HeaderRight() {
  const [menuVisible, setMenuVisible] = useState(false);
  const [notifVisible, setNotifVisible] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loadingNotifs, setLoadingNotifs] = useState(false);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const u = await getStoredUser();
      setUser(u);
    })();
  }, [menuVisible]);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const openNotifications = async () => {
    setNotifVisible(true);
    if (!user) return;
    setLoadingNotifs(true);
    const res = await getNotifications(user.id);
    setNotifications(res.notifications);
    setLoadingNotifs(false);

    if (res.notifications.some((n) => !n.is_read)) {
      markNotificationsRead(user.id);
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: 1 })));
    }
  };

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 12, gap: 14 }}>
      {/* Bell icon */}
      <TouchableOpacity onPress={openNotifications} style={styles.notifIconCircle}>
        <Ionicons name="notifications-outline" size={18} color={COLORS.primary} />
        {unreadCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{unreadCount > 99 ? '99+' : unreadCount}</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Ellipsis / profile menu */}
      <TouchableOpacity onPress={() => setMenuVisible(true)}>
        <Ionicons name="ellipsis-horizontal" size={22} color={COLORS.text} />
      </TouchableOpacity>

      {/* Profile dropdown modal */}
      <Modal visible={menuVisible} transparent animationType="fade">
        <Pressable style={styles.overlay} onPress={() => setMenuVisible(false)}>
          <View style={styles.dropdown}>
            <TouchableOpacity
              style={styles.userChip}
              onPress={() => {
                setMenuVisible(false);
                router.push('/profile');
              }}
            >
              <Image
                source={{
                  uri: user?.has_avatar
                    ? API_ENDPOINTS.avatarUrl(user.id)
                    : `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.first_name || 'Guest'}`,
                }}
                style={styles.userAvatar}
              />
              <View>
                <Text style={styles.userName} numberOfLines={1}>
                  {user ? `${user.first_name} ${user.last_name}` : '...'}
                </Text>
                <Text style={styles.userRole}>
                  ({user?.role === 'student' ? 'Student' : 'Instructor'})
                </Text>
              </View>
              <Ionicons name="chevron-down" size={14} color={COLORS.subtext} />
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      {/* Notifications popup modal */}
      <Modal visible={notifVisible} transparent animationType="fade">
        <Pressable style={styles.overlay} onPress={() => setNotifVisible(false)}>
          <Pressable style={styles.notifPanel} onPress={() => {}}>
            <View style={styles.notifHeader}>
              <Text style={styles.notifHeaderText}>Notifications</Text>
              <TouchableOpacity onPress={() => setNotifVisible(false)}>
                <Ionicons name="close" size={20} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            {loadingNotifs ? (
              <ActivityIndicator color={COLORS.primary} style={{ marginVertical: 24 }} />
            ) : notifications.length === 0 ? (
              <Text style={styles.emptyText}>No notifications yet.</Text>
            ) : (
              <FlatList
                data={notifications}
                keyExtractor={(item) => String(item.id)}
                style={{ maxHeight: 320 }}
                renderItem={({ item }) => (
                  <View style={styles.notifItem}>
                    <View style={styles.notifDot} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.notifTitle}>{item.title}</Text>
                      <Text style={styles.notifBody} numberOfLines={2}>{item.body}</Text>
                      <Text style={styles.notifTime}>{timeAgo(item.created_at)}</Text>
                    </View>
                  </View>
                )}
              />
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

export default function DrawerLayout() {
  return (
    <Drawer
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.card, elevation: 1, shadowOpacity: 0.05 },
        headerTintColor: COLORS.text,
        headerTitle: () => <TrackademicLogo />,
        headerTitleAlign: 'center',
        headerLeft: () => <DrawerToggleButton tintColor={COLORS.text} />,
        drawerActiveTintColor: COLORS.white,
        drawerActiveBackgroundColor: COLORS.primary,
        drawerInactiveTintColor: COLORS.text,
        drawerStyle: { backgroundColor: COLORS.card },
        headerRight: () => <HeaderRight />,
      }}
    >
      <Drawer.Screen
        name="index"
        options={{
          drawerLabel: 'Home',
          drawerIcon: ({ color, size }) => <Ionicons name="home-outline" size={size} color={color} />,
        }}
      />
      <Drawer.Screen
        name="classes"
        options={{
          drawerLabel: 'Class',
          drawerIcon: ({ color, size }) => <Ionicons name="list-outline" size={size} color={color} />,
        }}
      />
      <Drawer.Screen
        name="performance"
        options={{
          drawerLabel: 'My Performance',
          drawerIcon: ({ color, size }) => <Ionicons name="bar-chart-outline" size={size} color={color} />,
        }}
      />
    </Drawer>
  );
}

const styles = StyleSheet.create({
    logoRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    logoImage: { width: 24, height: 24 },
    logoText: { fontSize: 20, fontWeight: '800', color: COLORS.text },


  overlay: { flex: 1, backgroundColor: 'rgba(14,42,34,0.25)' },

  dropdown: {
    position: 'absolute',
    top: 60,
    right: 12,
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 14,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
    minWidth: 210,
  },
  userChip: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  userAvatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.border },
  userName: { fontSize: 16, fontWeight: '700', color: COLORS.text, maxWidth: 110 },
  userRole: { fontSize: 10, color: COLORS.subtext },

  notifIconCircle: {
    width: 34, height: 34, borderRadius: 17, backgroundColor: COLORS.accentSoft,
    alignItems: 'center', justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: COLORS.pink,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: { color: COLORS.white, fontSize: 10, fontWeight: '700' },

  notifPanel: {
    position: 'absolute',
    top: 60,
    right: 12,
    left: 12,
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 14,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  notifHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 10, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  notifHeaderText: { fontSize: 14, fontWeight: '800', color: COLORS.text },
  emptyText: { textAlign: 'center', color: COLORS.subtext, fontSize: 12, paddingVertical: 20 },

  notifItem: {
    flexDirection: 'row', gap: 8, paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  notifDot: {
    width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.primary, marginTop: 5,
  },
  notifTitle: { fontSize: 13, fontWeight: '700', color: COLORS.text },
  notifBody: { fontSize: 12, color: COLORS.subtext, marginTop: 2 },
  notifTime: { fontSize: 10, color: COLORS.subtext, marginTop: 4 },
});