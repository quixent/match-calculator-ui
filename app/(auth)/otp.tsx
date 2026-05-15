import { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Image, StyleSheet,
  Alert, KeyboardAvoidingView, Platform, StatusBar, ScrollView,
  NativeSyntheticEvent, TextInputKeyPressEventData,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { setItem } from '../../utils/storage';
import { api } from '../../api/client';
import { useAuth } from '../../context/auth';
import { Colors, Spacing, Radius, FontSize, FontWeight, Shadow } from '../../constants/theme';

const OTP_LENGTH = 6;

export default function OtpScreen() {
  const { mobile } = useLocalSearchParams<{ mobile: string }>();
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [loading, setLoading] = useState(false);
  const inputs = useRef<(TextInput | null)[]>([]);
  const router = useRouter();
  const { setToken, setUser } = useAuth();

  async function verify(digits: string[]) {
    const code = digits.join('');
    if (code.length !== OTP_LENGTH) {
      Alert.alert('Incomplete OTP', 'Please enter all 6 digits.');
      return;
    }
    setLoading(true);
    const res = await api.verifyOtp(mobile, code);
    setLoading(false);
    if (res.success && res.data) {
      await setItem('token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      router.replace(res.data.profileComplete ? '/(main)/home' : '/(auth)/profile');
    } else {
      Alert.alert('Incorrect OTP', res.message ?? 'Invalid or expired OTP. Try again.');
      setOtp(Array(OTP_LENGTH).fill(''));
      inputs.current[0]?.focus();
    }
  }

  function handleChange(value: string, index: number) {
    const cleaned = value.replace(/[^0-9]/g, '');

    if (cleaned.length > 1) {
      const filled = cleaned.slice(0, OTP_LENGTH).split('');
      const next = Array(OTP_LENGTH).fill('');
      filled.forEach((d, i) => { next[i] = d; });
      setOtp(next);
      inputs.current[Math.min(filled.length - 1, OTP_LENGTH - 1)]?.focus();
      if (filled.length === OTP_LENGTH) verify(next);
      return;
    }

    const digit = cleaned.slice(-1);
    const next = [...otp];
    next[index] = digit;
    setOtp(next);

    if (digit && index < OTP_LENGTH - 1) {
      inputs.current[index + 1]?.focus();
    } else if (digit && index === OTP_LENGTH - 1) {
      inputs.current[index]?.blur();
      verify(next);
    }
  }

  function handleKeyPress(e: NativeSyntheticEvent<TextInputKeyPressEventData>, index: number) {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  }

  async function handleResend() {
    const res = await api.sendOtp(mobile);
    if (res.success) {
      setOtp(Array(OTP_LENGTH).fill(''));
      inputs.current[0]?.focus();
      Alert.alert('OTP Resent', 'Check your server console for the new OTP.');
    } else {
      Alert.alert('Error', res.message ?? 'Failed to resend OTP.');
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="dark-content" />
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Logo + branding — same as login */}
        <View style={styles.brand}>
          <Image
            source={require('../../assets/images/logo.png')}
            style={styles.logo}
            resizeMode="cover"
          />
          <Text style={styles.heroTitle}>Understand Each{'\n'}Other Better</Text>
          <Text style={styles.heroSub}>A private space for two people to discover their compatibility</Text>
        </View>

        {/* OTP card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Verify Your Number</Text>
          <Text style={styles.cardSub}>
            We sent a 6-digit code to{' '}
            <Text style={styles.mobileText}>+91 {mobile}</Text>
          </Text>

          <View style={styles.otpRow}>
            {otp.map((digit, i) => (
              <TextInput
                key={i}
                ref={(ref) => { inputs.current[i] = ref; }}
                style={[styles.otpBox, digit ? styles.otpBoxFilled : null]}
                value={digit}
                onChangeText={(v) => handleChange(v, i)}
                onKeyPress={(e) => handleKeyPress(e, i)}
                keyboardType="number-pad"
                maxLength={i === 0 ? OTP_LENGTH : 1}
                selectTextOnFocus
                textAlign="center"
              />
            ))}
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={() => verify(otp)}
            disabled={loading}
            activeOpacity={0.85}
          >
            <Text style={styles.buttonText}>{loading ? 'Verifying…' : 'Verify OTP'}</Text>
          </TouchableOpacity>

          <View style={styles.resendRow}>
            <Text style={styles.resendLabel}>Didn't receive the code? </Text>
            <TouchableOpacity onPress={handleResend}>
              <Text style={styles.resendBtn}>Resend</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },

  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingTop: Platform.OS === 'ios' ? 40 : 28,
    paddingBottom: 32,
    paddingHorizontal: Spacing.xl,
  },

  brand: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  logo: {
    width: 104,
    height: 104,
    borderRadius: 20,
    marginBottom: Spacing.lg,
  },
  heroTitle: {
    fontSize: FontSize.xxxl,
    fontWeight: FontWeight.extrabold,
    color: Colors.primary,
    textAlign: 'center',
    lineHeight: 42,
    marginBottom: Spacing.sm,
  },
  heroSub: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
  },

  card: {
    backgroundColor: Colors.surfaceAlt,
    borderRadius: 24,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.xl,
  },
  cardTitle: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
  cardSub: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing.lg,
  },
  mobileText: { color: Colors.primary, fontWeight: FontWeight.bold },

  otpRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
  },
  otpBox: {
    width: 48, height: 58, borderRadius: Radius.md,
    borderWidth: 2, borderColor: '#BDBDBD',
    backgroundColor: '#FFFFFF',
    fontSize: FontSize.xxl, fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    textAlign: 'center',
    textAlignVertical: 'center',
    includeFontPadding: false,
    padding: 0,
    marginHorizontal: 5,
    ...Shadow.sm,
  },
  otpBoxFilled: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },

  button: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: Spacing.lg,
    ...Shadow.lg,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontSize: FontSize.lg, fontWeight: FontWeight.bold },

  resendRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  resendLabel: { fontSize: FontSize.sm, color: Colors.textMuted },
  resendBtn: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: FontWeight.bold },
});
