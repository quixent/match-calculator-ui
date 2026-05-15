import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ActivityIndicator, FlatList, Alert, RefreshControl, StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { api } from '../../api/client';
import { useBadge } from '../../context/badge';
import { MatchRequest } from '../../types';
import { Colors, Spacing, Radius, FontSize, FontWeight, Shadow } from '../../constants/theme';

export default function RequestsScreen() {
  const [requests, setRequests] = useState<MatchRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const router = useRouter();
  const { refreshBadge } = useBadge();

  const fetchRequests = useCallback(async () => {
    const res = await api.getRequests();
    if (res.success && res.data) setRequests(res.data.requests);
  }, []);

  useEffect(() => {
    (async () => { await fetchRequests(); setLoading(false); })();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchRequests();
    setRefreshing(false);
  }, []);

  async function handleAccept(matchId: string) {
    setActionLoading(matchId);
    const res = await api.acceptRequest(matchId);
    setActionLoading(null);
    if (res.success) {
      setRequests((prev) => prev.filter((r) => r._id !== matchId));
      refreshBadge();
      Alert.alert('Matched', 'You are now connected. Start the compatibility quiz!', [
        { text: 'Start Quiz', onPress: () => router.replace('/(main)/questions') },
        { text: 'Later', onPress: () => router.replace('/(main)/home') },
      ]);
    } else {
      Alert.alert('Error', res.message ?? 'Could not accept request');
    }
  }

  async function handleReject(matchId: string) {
    setActionLoading(matchId);
    const res = await api.rejectRequest(matchId);
    setActionLoading(null);
    if (res.success) {
      setRequests((prev) => prev.filter((r) => r._id !== matchId));
      refreshBadge();
    } else Alert.alert('Error', res.message ?? 'Could not decline request');
  }

  if (loading) {
    return <View style={styles.loaderWrap}><ActivityIndicator size="large" color={Colors.primary} /></View>;
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Inbox</Text>
          <Text style={styles.headerSub}>
            {requests.length > 0 ? `${requests.length} pending request${requests.length > 1 ? 's' : ''}` : 'No pending requests'}
          </Text>
        </View>
        {requests.length > 0 && (
          <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}>{requests.length} new</Text>
          </View>
        )}
      </View>

      <FlatList
        data={requests}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} colors={[Colors.primary]} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <View style={styles.emptyIconWrap}>
              <Text style={styles.emptyIconText}>0</Text>
            </View>
            <Text style={styles.emptyTitle}>No Requests Yet</Text>
            <Text style={styles.emptySubText}>
              When someone sends you an interest,{'\n'}it will appear here.
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const sender = item.senderId;
          const isActing = actionLoading === item._id;
          const initials = sender.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
          const avatarBg = sender.gender === 'female' ? Colors.primary : Colors.secondary;

          return (
            <View style={styles.card}>
              <View style={[styles.avatar, { backgroundColor: avatarBg }]}>
                <Text style={styles.avatarText}>{initials}</Text>
              </View>
              <View style={styles.info}>
                <Text style={styles.name}>{sender.name}</Text>
                <View style={styles.metaRow}>
                  <View style={styles.chip}>
                    <Text style={styles.chipText}>{sender.gender === 'male' ? 'Man' : 'Woman'}</Text>
                  </View>
                  <View style={styles.chip}>
                    <Text style={styles.chipText}>{sender.age} yrs</Text>
                  </View>
                </View>
                <Text style={styles.interestLabel}>Sent you an interest</Text>
              </View>

              {isActing ? (
                <ActivityIndicator color={Colors.primary} />
              ) : (
                <View style={styles.actions}>
                  <TouchableOpacity
                    style={styles.acceptBtn}
                    onPress={() => handleAccept(item._id)}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.acceptText}>Accept</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.rejectBtn}
                    onPress={() => handleReject(item._id)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.rejectText}>Decline</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  loaderWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 52, paddingBottom: 16, paddingHorizontal: Spacing.lg,
    backgroundColor: Colors.primary,
  },
  headerTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: '#fff' },
  headerSub: { fontSize: FontSize.xs, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  countBadge: {
    backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: Radius.full,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  countBadgeText: { color: '#fff', fontSize: FontSize.xs, fontWeight: FontWeight.bold },

  list: { padding: Spacing.lg, gap: 12, paddingBottom: 40 },
  card: {
    backgroundColor: Colors.surface, borderRadius: Radius.lg,
    padding: Spacing.md, flexDirection: 'row', alignItems: 'center', gap: 12, ...Shadow.sm,
  },
  avatar: { width: 52, height: 52, borderRadius: 26, justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  avatarText: { color: '#fff', fontSize: FontSize.lg, fontWeight: FontWeight.bold },
  info: { flex: 1 },
  name: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.textPrimary, marginBottom: 5 },
  metaRow: { flexDirection: 'row', gap: 6, marginBottom: 5 },
  chip: {
    backgroundColor: Colors.surfaceAlt, borderRadius: Radius.full,
    paddingHorizontal: 8, paddingVertical: 2,
  },
  chipText: { fontSize: FontSize.xs, color: Colors.textSecondary, fontWeight: FontWeight.medium },
  interestLabel: { fontSize: FontSize.xs, color: Colors.primary, fontWeight: FontWeight.medium },

  actions: { gap: 8, alignItems: 'stretch' },
  acceptBtn: {
    backgroundColor: Colors.primary, borderRadius: Radius.md,
    paddingHorizontal: 16, paddingVertical: 8, alignItems: 'center',
  },
  acceptText: { color: '#fff', fontSize: FontSize.sm, fontWeight: FontWeight.bold },
  rejectBtn: {
    backgroundColor: Colors.surfaceAlt, borderRadius: Radius.md,
    paddingHorizontal: 16, paddingVertical: 8, alignItems: 'center',
  },
  rejectText: { color: Colors.textMuted, fontSize: FontSize.sm, fontWeight: FontWeight.semibold },

  empty: { paddingTop: 80, alignItems: 'center', gap: 12 },
  emptyIconWrap: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: Colors.primaryLight, justifyContent: 'center', alignItems: 'center',
  },
  emptyIconText: { fontSize: FontSize.xl, fontWeight: FontWeight.extrabold, color: Colors.primary },
  emptyTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.textSecondary },
  emptySubText: { fontSize: FontSize.sm, color: Colors.textMuted, textAlign: 'center', lineHeight: 22 },
});
