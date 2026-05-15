import { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, KeyboardAvoidingView, Platform, StatusBar,
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

    // Paste: received multiple digits at once
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

  function handleVerify() { verify(otp); }

  async function handleResend() {
    await api.sendOtp(mobile);
    setOtp(Array(OTP_LENGTH).fill(''));
    inputs.current[0]?.focus();
    Alert.alert('OTP Resent', 'Check your server console for the new OTP.');
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="dark-content" />

      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <View style={styles.content}>
        <View style={styles.iconWrap}>
          <Text style={styles.iconText}>OTP</Text>
        </View>

        <Text style={styles.title}>Verify Your Number</Text>
        <Text style={styles.subtitle}>
          We sent a 6-digit code to{'\n'}
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
          onPress={handleVerify}
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
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  backBtn: { paddingTop: 56, paddingHorizontal: Spacing.xl, paddingBottom: Spacing.md },
  backText: { color: Colors.primary, fontSize: FontSize.md, fontWeight: FontWeight.semibold },

  content: {
    flex: 1, paddingHorizontal: Spacing.xl,
    alignItems: 'center', justifyContent: 'center', paddingBottom: Spacing.xxl,
  },

  iconWrap: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  iconText: { fontSize: FontSize.xs, fontWeight: FontWeight.bold, color: Colors.primary, letterSpacing: 1 },

  title: {
    fontSize: FontSize.xxl, fontWeight: FontWeight.bold,
    color: Colors.textPrimary, marginBottom: Spacing.sm, textAlign: 'center',
  },
  subtitle: {
    fontSize: FontSize.md, color: Colors.textSecondary,
    textAlign: 'center', lineHeight: 24, marginBottom: Spacing.xl,
  },
  mobileText: { color: Colors.primary, fontWeight: FontWeight.bold },

  otpRow: { flexDirection: 'row', gap: 10, marginBottom: Spacing.xl },
  otpBox: {
    width: 48, height: 56, borderRadius: Radius.md,
    borderWidth: 1.5, borderColor: Colors.border,
    backgroundColor: Colors.surface,
    fontSize: FontSize.xxl, fontWeight: FontWeight.bold,
    color: Colors.textPrimary, ...Shadow.sm,
  },
  otpBoxFilled: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },

  button: {
    width: '100%', backgroundColor: Colors.primary,
    borderRadius: Radius.md, paddingVertical: 16,
    alignItems: 'center', ...Shadow.lg,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontSize: FontSize.lg, fontWeight: FontWeight.bold },

  resendRow: { flexDirection: 'row', alignItems: 'center', marginTop: Spacing.lg },
  resendLabel: { fontSize: FontSize.sm, color: Colors.textMuted },
  resendBtn: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: FontWeight.bold },
});
