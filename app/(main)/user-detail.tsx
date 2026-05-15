import { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Alert, StatusBar, ScrollView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { api } from '../../api/client';
import { Colors, Spacing, Radius, FontSize, FontWeight, Shadow } from '../../constants/theme';

export default function UserDetailScreen() {
  const router = useRouter();
  const { id, name, age, gender, alreadySent, city, bio } = useLocalSearchParams<{
    id: string;
    name: string;
    age: string;
    gender: string;
    alreadySent: string;
    city: string;
    bio: string;
  }>();

  const [sent, setSent] = useState(alreadySent === 'true');
  const [sending, setSending] = useState(false);

  const isFemale = gender === 'female';
  const avatarColor = isFemale ? Colors.primary : Colors.secondary;
  const initials = name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) ?? '?';

  async function handleSendInterest() {
    setSending(true);
    const res = await api.sendInterest(id);
    setSending(false);
    if (res.success) {
      setSent(true);
    } else {
      Alert.alert('Error', res.message ?? 'Could not send interest');
    }
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: avatarColor }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Hero section */}
        <View style={[styles.hero, { backgroundColor: avatarColor }]}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={styles.heroName}>{name}</Text>
          <View style={styles.heroBadgeRow}>
            <View style={styles.heroBadge}>
              <Text style={styles.heroBadgeText}>{isFemale ? 'Woman' : 'Man'}</Text>
            </View>
            <View style={styles.heroBadge}>
              <Text style={styles.heroBadgeText}>{age} yrs</Text>
            </View>
            {!!city && (
              <View style={styles.heroBadge}>
                <Text style={styles.heroBadgeText}>{city}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Bio card */}
        {!!bio && (
          <View style={styles.bioCard}>
            <Text style={styles.sectionLabel}>About</Text>
            <Text style={styles.bioText}>{bio}</Text>
          </View>
        )}

        {/* Details card */}
        <View style={styles.detailCard}>
          <Text style={styles.sectionLabel}>Basic Information</Text>

          <View style={styles.detailRow}>
            <Text style={styles.detailKey}>Full Name</Text>
            <Text style={styles.detailValue}>{name}</Text>
          </View>
          <View style={styles.divider} />

          <View style={styles.detailRow}>
            <Text style={styles.detailKey}>Gender</Text>
            <View style={styles.detailValueRow}>
              <View style={[styles.genderDot, { backgroundColor: avatarColor }]} />
              <Text style={styles.detailValue}>{isFemale ? 'Female' : 'Male'}</Text>
            </View>
          </View>
          <View style={styles.divider} />

          <View style={styles.detailRow}>
            <Text style={styles.detailKey}>Age</Text>
            <Text style={styles.detailValue}>{age} years</Text>
          </View>
          {!!city && (
            <>
              <View style={styles.divider} />
              <View style={styles.detailRow}>
                <Text style={styles.detailKey}>City</Text>
                <Text style={styles.detailValue}>{city}</Text>
              </View>
            </>
          )}
        </View>

        {/* Action */}
        <View style={styles.actionWrap}>
          {sent ? (
            <View style={styles.sentBox}>
              <Text style={styles.sentCheckmark}>✓</Text>
              <Text style={styles.sentText}>Interest Sent</Text>
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.interestBtn, sending && styles.interestBtnDisabled]}
              onPress={handleSendInterest}
              disabled={sending}
              activeOpacity={0.85}
            >
              <Text style={styles.interestBtnText}>
                {sending ? 'Sending…' : 'Send Interest'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingTop: 52, paddingBottom: 14, paddingHorizontal: Spacing.lg,
  },
  backBtn: { width: 60, paddingVertical: 4 },
  backText: { color: 'rgba(255,255,255,0.9)', fontSize: FontSize.md, fontWeight: FontWeight.semibold },
  headerTitle: {
    flex: 1, textAlign: 'center',
    fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: '#fff',
  },

  scroll: { flexGrow: 1, paddingBottom: 40 },

  hero: {
    alignItems: 'center',
    paddingTop: 16, paddingBottom: 40, paddingHorizontal: Spacing.xl,
  },
  avatarCircle: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderWidth: 3, borderColor: 'rgba(255,255,255,0.6)',
    justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.md,
  },
  avatarText: { color: '#fff', fontSize: FontSize.xxxl, fontWeight: FontWeight.bold },
  heroName: {
    fontSize: FontSize.xxl, fontWeight: FontWeight.bold,
    color: '#fff', marginBottom: Spacing.sm,
  },
  heroBadgeRow: { flexDirection: 'row', gap: 10 },
  heroBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: Radius.full, paddingHorizontal: 14, paddingVertical: 5,
  },
  heroBadgeText: { color: '#fff', fontSize: FontSize.sm, fontWeight: FontWeight.semibold },

  bioCard: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    marginTop: -20,
    paddingHorizontal: Spacing.xl, paddingTop: Spacing.xl, paddingBottom: Spacing.lg,
    marginBottom: 2, ...Shadow.sm,
  },
  bioText: {
    fontSize: FontSize.md, color: Colors.textSecondary,
    lineHeight: 22,
  },
  detailCard: {
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.xl, paddingTop: Spacing.lg, paddingBottom: Spacing.lg,
    marginTop: 2, ...Shadow.sm,
  },
  sectionLabel: {
    fontSize: FontSize.xs, fontWeight: FontWeight.bold,
    color: Colors.textMuted, textTransform: 'uppercase',
    letterSpacing: 1, marginBottom: Spacing.md,
  },
  detailRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingVertical: Spacing.md,
  },
  detailKey: { fontSize: FontSize.sm, color: Colors.textMuted, fontWeight: FontWeight.medium },
  detailValueRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  genderDot: { width: 8, height: 8, borderRadius: 4 },
  detailValue: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.textPrimary },
  divider: { height: 1, backgroundColor: Colors.border },

  actionWrap: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.lg },
  interestBtn: {
    backgroundColor: Colors.primary, borderRadius: Radius.md,
    paddingVertical: 17, alignItems: 'center', ...Shadow.lg,
  },
  interestBtnDisabled: { opacity: 0.6 },
  interestBtnText: { color: '#fff', fontSize: FontSize.lg, fontWeight: FontWeight.bold },
  sentBox: {
    backgroundColor: Colors.successLight, borderRadius: Radius.md,
    paddingVertical: 17, alignItems: 'center',
    flexDirection: 'row', justifyContent: 'center', gap: 10,
  },
  sentCheckmark: { fontSize: FontSize.lg, color: Colors.success, fontWeight: FontWeight.bold },
  sentText: { fontSize: FontSize.lg, color: Colors.success, fontWeight: FontWeight.bold },
});
