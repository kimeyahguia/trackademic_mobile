import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, ActivityIndicator,
  RefreshControl, TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, getScoreColor } from '../../constants/theme-colors';
import { getPerformance, PerformanceItem } from '../../services/performance';
import { getStoredUser } from '../../services/auth';
import StatusModal from '../../components/StatusModal';
import { useStatusModal } from '../../hooks/useStatusModal';

export default function PerformanceScreen() {
  const [items, setItems] = useState<PerformanceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [yearFilter, setYearFilter] = useState('All School Years');
  const [semFilter, setSemFilter] = useState('All Semesters');
  const { modal, showError, hideModal } = useStatusModal();

  const fetchData = useCallback(async () => {
    const user = await getStoredUser();
    if (!user) return;
    const res = await getPerformance(user.id);
    if (res.success) {
      setItems(res.data);
    } else {
      showError('Failed to Load', res.message || 'Could not fetch your performance records.');
    }
    setLoading(false);
    setRefreshing(false);
  }, [showError]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const years = useMemo(() => ['All School Years', ...Array.from(new Set(items.map((i) => i.school_year)))], [items]);
  const semesters = useMemo(() => ['All Semesters', ...Array.from(new Set(items.map((i) => i.semester)))], [items]);

  const filtered = items.filter(
    (i) =>
      (yearFilter === 'All School Years' || i.school_year === yearFilter) &&
      (semFilter === 'All Semesters' || i.semester === semFilter)
  );

  const overallAvg = useMemo(() => {
    if (filtered.length === 0) return 0;
    const totalPct = filtered.reduce((sum, i) => sum + (i.total_items > 0 ? (i.score / i.total_items) * 100 : 0), 0);
    return Math.round(totalPct / filtered.length);
  }, [filtered]);

  const cycleFilter = (current: string, options: string[], setter: (v: string) => void) => {
    const idx = options.indexOf(current);
    setter(options[(idx + 1) % options.length]);
  };

  return (
    <>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.accent} />}
      >
        <Text style={TYPOGRAPHY.heading}>My Performance</Text>

        <View style={styles.summaryCard}>
          <View>
            <Text style={styles.summaryLabel}>Overall Average</Text>
            <Text style={styles.summaryValue}>{filtered.length === 0 ? '—' : `${overallAvg}%`}</Text>
          </View>
          <View style={[styles.summaryIcon, { backgroundColor: getScoreColor(overallAvg, 100) + '20' }]}>
            <Ionicons name="trending-up" size={22} color={getScoreColor(overallAvg, 100)} />
          </View>
        </View>

        <View style={styles.filterRow}>
          <TouchableOpacity style={styles.filterChip} onPress={() => cycleFilter(yearFilter, years, setYearFilter)}>
            <Text style={styles.filterText} numberOfLines={1}>{yearFilter}</Text>
            <Ionicons name="chevron-down" size={14} color={COLORS.subtext} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterChip} onPress={() => cycleFilter(semFilter, semesters, setSemFilter)}>
            <Text style={styles.filterText} numberOfLines={1}>{semFilter}</Text>
            <Ionicons name="chevron-down" size={14} color={COLORS.subtext} />
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator style={{ marginTop: 30 }} color={COLORS.accent} />
        ) : filtered.length === 0 ? (
          <Text style={styles.emptyText}>No performance records found.</Text>
        ) : (
          Object.entries(
            filtered.reduce<Record<string, PerformanceItem[]>>((acc, item) => {
              acc[item.class_code] = acc[item.class_code] || [];
              acc[item.class_code].push(item);
              return acc;
            }, {})
          ).map(([classCode, records]) => (
            <View key={classCode} style={styles.classGroup}>
              <Text style={styles.classTitle}>{records[0].subject_name}</Text>
              <Text style={styles.classCode}>{classCode}</Text>

              {records.map((r) => {
                const color = getScoreColor(r.score, r.total_items);
                const pct = r.total_items > 0 ? Math.round((r.score / r.total_items) * 100) : 0;
                return (
                  <View key={r.id} style={styles.row}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.rowTitle}>{r.classwork_title}</Text>
                      <View style={styles.progressBarBg}>
                        <View style={[styles.progressBarFill, { width: `${pct}%`, backgroundColor: color }]} />
                      </View>
                    </View>
                    <View style={[styles.scoreBadge, { backgroundColor: color + '18' }]}>
                      <Text style={[styles.scoreText, { color }]}>{r.score}/{r.total_items}</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          ))
        )}
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  summaryCard: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: COLORS.card, borderRadius: 16, padding: 18, marginTop: 16,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  summaryLabel: { fontSize: 12, color: COLORS.subtext },
  summaryValue: { fontSize: 26, fontWeight: '800', color: COLORS.text, marginTop: 4 },
  summaryIcon: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center' },

  filterRow: { flexDirection: 'row', gap: 10, marginTop: 16, marginBottom: 18 },
  filterChip: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border,
    borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10,
  },
  filterText: { fontSize: 12, color: COLORS.text, flexShrink: 1 },
  emptyText: { color: COLORS.subtext, textAlign: 'center', marginTop: 30 },

  classGroup: {
    backgroundColor: COLORS.card, borderRadius: 16, padding: 16, marginBottom: 16,
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 }, elevation: 1,
  },
  classTitle: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  classCode: { fontSize: 11, color: COLORS.subtext, marginBottom: 12 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderTopWidth: 1, borderTopColor: COLORS.border, gap: 10 },
  rowTitle: { fontSize: 12.5, fontWeight: '600', color: COLORS.text, marginBottom: 6 },
  progressBarBg: { height: 5, backgroundColor: COLORS.border, borderRadius: 3, overflow: 'hidden' },
  progressBarFill: { height: 5, borderRadius: 3 },
  scoreBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 },
  scoreText: { fontSize: 12, fontWeight: '700' },
});