import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Image,
  StyleSheet, Alert, ScrollView, KeyboardAvoidingView, Platform, StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { api } from '../../api/client';
import { Colors, Spacing, Radius, FontSize, FontWeight, Shadow } from '../../constants/theme';

export default function LoginScreen() {
  const [mobile, setMobile] = useState('');
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);
  const router = useRouter();

  async function handleSendOtp() {
    if (!/^\d{10}$/.test(mobile)) {
      Alert.alert('Invalid Number', 'Please enter a valid 10-digit mobile number.');
      return;
    }
    setLoading(true);
    const res = await api.sendOtp(mobile);
    setLoading(false);
    if (res.success) {
      router.push({ pathname: '/(auth)/otp', params: { mobile } });
    } else {
      Alert.alert('Error', res.message ?? 'Failed to send OTP. Try again.');
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="light-content" />
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Logo + branding */}
        <View style={styles.brand}>
          <Image
            source={require('../../assets/images/logo.png')}
            style={styles.logo}
            resizeMode="cover"
          />
          <Text style={styles.heroTitle}>Find Your{'\n'}Perfect Match</Text>
          <Text style={styles.heroSub}>Connect with compatible partners near you</Text>
        </View>

        {/* Form card */}
        <View style={styles.card}>
          <Text style={styles.formTitle}>Welcome</Text>
          <Text style={styles.formSub}>Enter your mobile number to get started</Text>

          <View style={[styles.inputWrapper, focused && styles.inputWrapperFocused]}>
            <View style={styles.prefix}>
              <Text style={styles.prefixText}>+91</Text>
            </View>
            <TextInput
              style={styles.input}
              placeholder="Mobile number"
              placeholderTextColor={Colors.textMuted}
              keyboardType="phone-pad"
              maxLength={10}
              value={mobile}
              onChangeText={setMobile}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
            />
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSendOtp}
            disabled={loading}
            activeOpacity={0.85}
          >
            <Text style={styles.buttonText}>{loading ? 'Sending OTP…' : 'Send OTP'}</Text>
          </TouchableOpacity>

          <Text style={styles.terms}>
            By continuing, you agree to our{' '}
            <Text style={styles.termsLink}>Terms of Service</Text>
            {' & '}
            <Text style={styles.termsLink}>Privacy Policy</Text>
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.primary },

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
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  heroTitle: {
    fontSize: FontSize.xxxl,
    fontWeight: FontWeight.extrabold,
    color: '#fff',
    textAlign: 'center',
    lineHeight: 42,
    marginBottom: Spacing.sm,
  },
  heroSub: {
    fontSize: FontSize.md,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },

  card: {
    backgroundColor: Colors.surface,
    borderRadius: 24,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.xl,
    ...Shadow.md,
  },
  formTitle: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  formSub: { fontSize: FontSize.sm, color: Colors.textMuted, marginBottom: Spacing.lg },

  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    marginBottom: Spacing.md,
    overflow: 'hidden',
  },
  inputWrapperFocused: { borderColor: Colors.primary },
  prefix: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 15,
    backgroundColor: Colors.surfaceAlt,
    borderRightWidth: 1.5,
    borderRightColor: Colors.border,
  },
  prefixText: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    fontWeight: FontWeight.medium,
  },
  input: {
    flex: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: 15,
    fontSize: FontSize.lg,
    color: Colors.textPrimary,
  },

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

  terms: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
  termsLink: { color: Colors.primary, fontWeight: FontWeight.medium },
});
