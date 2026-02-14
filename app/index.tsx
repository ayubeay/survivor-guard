import React, { useState, useRef, useEffect } from 'react'
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Animated, Dimensions, StatusBar } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useMobileWallet } from '@wallet-ui/react-native-kit'
import { evaluatePreflight, evaluateRisk, RISK_COLORS, RiskResult } from '@/features/survivor/risk-engine'
const { width } = Dimensions.get('window')
type Screen = 'home' | 'scanner' | 'result'
export default function HomeScreen() {
  const { account, connect } = useMobileWallet()
  const [screen, setScreen] = useState<Screen>('home')
  const [input, setInput] = useState('')
  const [result, setResult] = useState<RiskResult | null>(null)
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(30)).current
  const pulseAnim = useRef(new Animated.Value(1)).current
  useEffect(() => { Animated.parallel([Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }), Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true })]).start() }, [screen])
  useEffect(() => { if (result?.level === 'HIGH') { Animated.loop(Animated.sequence([Animated.timing(pulseAnim, { toValue: 1.05, duration: 800, useNativeDriver: true }), Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true })])).start() } }, [result])
  const navigateTo = (s: Screen) => { fadeAnim.setValue(0); slideAnim.setValue(30); setScreen(s) }
  const handleScan = () => { const r = evaluatePreflight(input); setResult(r); navigateTo('result') }
  const handleDemoHigh = () => { setResult(evaluateRisk({ programIds: ['FakeProgram1111111111111111111111111111111'], amountLamports: 8000000000, instructionCount: 7, url: 'https://phanton-airdrop.xyz/claim', text: 'Claim your free airdrop now! Verify wallet to receive tokens.' })); navigateTo('result') }
  const handleDemoLow = () => { setResult(evaluateRisk({ programIds: ['JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4'], amountLamports: 50000000, instructionCount: 2 })); navigateTo('result') }
  if (screen === 'result' && result) {
    const rc = RISK_COLORS[result.level]
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: rc.bg }]}>
        <StatusBar barStyle="light-content" />
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Animated.View style={[styles.resultContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }, { scale: result.level === 'HIGH' ? pulseAnim : 1 }] }]}>
            <View style={[styles.shieldCircle, { borderColor: rc.color }]}>
              <Text style={[styles.shieldIcon, { color: rc.color }]}>{result.level === 'HIGH' ? '\u26A0' : result.level === 'MED' ? '\u25D0' : '\u2713'}</Text>
            </View>
            <Text style={[styles.riskLevel, { color: rc.color }]}>{result.level === 'HIGH' ? 'HIGH RISK' : result.level === 'MED' ? 'MEDIUM RISK' : 'LOW RISK'}</Text>
            <View style={styles.scoreBarOuter}><View style={[styles.scoreBarInner, { width: result.score + '%', backgroundColor: rc.color }]} /></View>
            <Text style={styles.scoreText}>{'Risk Score: ' + result.score + '/100'}</Text>
            <View style={[styles.reasonsBox, { borderColor: rc.border }]}>
              <Text style={styles.reasonsTitle}>RISK SIGNALS</Text>
              {result.reasons.map((r, i) => (<View key={i} style={styles.reasonRow}><Text style={[styles.reasonDot, { color: rc.color }]}>{'\u25CF'}</Text><Text style={styles.reasonText}>{r}</Text></View>))}
            </View>
            <Text style={styles.confidence}>{'Confidence: ' + Math.round(result.confidence * 100) + '%'}</Text>
            {result.level === 'HIGH' ? (
              <View style={styles.actionGroup}>
                <TouchableOpacity style={[styles.btn, styles.btnAbort]} onPress={() => navigateTo('home')}><Text style={styles.btnAbortText}>{'\u2715  ABORT TRANSACTION'}</Text></TouchableOpacity>
                <TouchableOpacity style={[styles.btn, styles.btnProceed]} onPress={() => navigateTo('home')}><Text style={styles.btnProceedText}>{'Proceed Anyway \u2192'}</Text></TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={[styles.btn, { backgroundColor: rc.color }]} onPress={() => navigateTo('home')}><Text style={[styles.btnText, { color: '#000' }]}>{result.level === 'LOW' ? '\u2713  LOOKS SAFE' : '\u2192  REVIEW & PROCEED'}</Text></TouchableOpacity>
            )}
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    )
  }
  if (screen === 'scanner') {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <Animated.View style={[styles.scannerContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <TouchableOpacity onPress={() => navigateTo('home')} style={styles.backBtn}><Text style={styles.backText}>{'\u2190 Back'}</Text></TouchableOpacity>
          <Text style={styles.scannerTitle}>Preflight Scanner</Text>
          <Text style={styles.scannerSub}>Paste a URL, contract address, or message to analyze</Text>
          <TextInput style={styles.input} value={input} onChangeText={setInput} placeholder="https://... or address or text" placeholderTextColor="#555" multiline autoFocus />
          <TouchableOpacity style={[styles.btn, styles.btnScan, !input.trim() && styles.btnDisabled]} onPress={handleScan} disabled={!input.trim()}><Text style={styles.btnText}>{'\u2B21  SCAN NOW'}</Text></TouchableOpacity>
        </Animated.View>
      </SafeAreaView>
    )
  }
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Animated.View style={[styles.homeContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.logoContainer}>
            <View style={styles.logoShield}><Text style={styles.logoIcon}>{'\u2B21'}</Text></View>
            <Text style={styles.logoTitle}>SURVIVOR</Text>
            <Text style={styles.logoSub}>GUARD</Text>
          </View>
          <Text style={styles.tagline}>Transaction Risk Intelligence for Solana Mobile</Text>
          <View style={styles.statusCard}>
            <View style={styles.statusRow}>
              <View style={[styles.statusDot, { backgroundColor: account ? '#14e09e' : '#555' }]} />
              <Text style={styles.statusText}>{account ? 'Connected: ' + account.address.toString().slice(0, 4) + '...' + account.address.toString().slice(-4) : 'Wallet not connected'}</Text>
            </View>
            {!account && (<TouchableOpacity style={[styles.btn, styles.btnConnect]} onPress={connect}><Text style={styles.btnText}>CONNECT WALLET</Text></TouchableOpacity>)}
          </View>
          <TouchableOpacity style={[styles.btn, styles.btnPrimary]} onPress={() => navigateTo('scanner')}><Text style={styles.btnText}>{'\u2B21  PREFLIGHT SCANNER'}</Text></TouchableOpacity>
          <View style={styles.demoSection}>
            <Text style={styles.demoTitle}>DEMO SCENARIOS</Text>
            <TouchableOpacity style={[styles.btn, styles.btnDemo]} onPress={handleDemoHigh}><Text style={styles.btnDemoText}>{'\uD83D\uDD34  Phishing Attack (HIGH)'}</Text></TouchableOpacity>
            <TouchableOpacity style={[styles.btn, styles.btnDemo]} onPress={handleDemoLow}><Text style={styles.btnDemoText}>{'\uD83D\uDFE2  Jupiter Swap (LOW)'}</Text></TouchableOpacity>
          </View>
          <View style={styles.footer}>
            <Text style={styles.footerText}>MONOLITH {'\u00B7'} SURVIVOR GUARD v0.1</Text>
            <Text style={styles.footerSub}>Deterministic Risk Engine {'\u00B7'} No AI {'\u00B7'} No Black Boxes</Text>
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  )
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0e17' },
  scrollContent: { flexGrow: 1, paddingHorizontal: 20, paddingBottom: 40 },
  homeContainer: { flex: 1, gap: 20, paddingTop: 20 },
  logoContainer: { alignItems: 'center', marginTop: 20, marginBottom: 8 },
  logoShield: { width: 80, height: 80, borderRadius: 40, borderWidth: 2, borderColor: '#14e09e', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  logoIcon: { fontSize: 36, color: '#14e09e' },
  logoTitle: { fontSize: 32, fontWeight: '800', color: '#ffffff', letterSpacing: 6 },
  logoSub: { fontSize: 14, color: '#14e09e', letterSpacing: 8, marginTop: 2 },
  tagline: { textAlign: 'center', color: '#8892a4', fontSize: 14, lineHeight: 20 },
  statusCard: { backgroundColor: '#111827', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#1e293b', gap: 12 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { color: '#c8d1e0', fontSize: 13, fontFamily: 'monospace' },
  btn: { borderRadius: 10, paddingVertical: 14, paddingHorizontal: 20, alignItems: 'center' },
  btnPrimary: { backgroundColor: '#14e09e' },
  btnConnect: { backgroundColor: '#3b82f6' },
  btnScan: { backgroundColor: '#14e09e', marginTop: 16 },
  btnDisabled: { opacity: 0.4 },
  btnText: { color: '#0a0e17', fontWeight: '700', fontSize: 16, letterSpacing: 1 },
  btnAbort: { backgroundColor: '#ff3b4f' },
  btnAbortText: { color: '#fff', fontWeight: '700', fontSize: 16, letterSpacing: 1 },
  btnProceed: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#555' },
  btnProceedText: { color: '#888', fontWeight: '600', fontSize: 14 },
  demoSection: { gap: 8, marginTop: 8 },
  demoTitle: { color: '#555', fontSize: 11, letterSpacing: 2, marginBottom: 4 },
  btnDemo: { backgroundColor: '#111827', borderWidth: 1, borderColor: '#1e293b' },
  btnDemoText: { color: '#c8d1e0', fontWeight: '600', fontSize: 14 },
  scannerContainer: { flex: 1, paddingHorizontal: 20, paddingTop: 12, gap: 16 },
  backBtn: { paddingVertical: 8 },
  backText: { color: '#14e09e', fontSize: 16 },
  scannerTitle: { fontSize: 24, fontWeight: '800', color: '#ffffff', letterSpacing: 1 },
  scannerSub: { color: '#8892a4', fontSize: 14, lineHeight: 20 },
  input: { backgroundColor: '#111827', borderRadius: 12, borderWidth: 1, borderColor: '#1e293b', color: '#ffffff', padding: 16, fontSize: 15, minHeight: 120, textAlignVertical: 'top', fontFamily: 'monospace' },
  resultContainer: { flex: 1, alignItems: 'center', gap: 16, paddingTop: 40 },
  shieldCircle: { width: 100, height: 100, borderRadius: 50, borderWidth: 3, justifyContent: 'center', alignItems: 'center' },
  shieldIcon: { fontSize: 44 },
  riskLevel: { fontSize: 28, fontWeight: '800', letterSpacing: 3 },
  scoreBarOuter: { width: width - 80, height: 8, backgroundColor: '#1e293b', borderRadius: 4 },
  scoreBarInner: { height: 8, borderRadius: 4 },
  scoreText: { color: '#8892a4', fontSize: 13, fontFamily: 'monospace' },
  reasonsBox: { width: width - 60, backgroundColor: '#111827', borderRadius: 12, borderWidth: 1, padding: 16, gap: 10 },
  reasonsTitle: { color: '#555', fontSize: 11, letterSpacing: 2, marginBottom: 4 },
  reasonRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  reasonDot: { fontSize: 10, marginTop: 3 },
  reasonText: { color: '#c8d1e0', fontSize: 14, lineHeight: 20, flex: 1 },
  confidence: { color: '#555', fontSize: 12, fontFamily: 'monospace' },
  actionGroup: { width: '100%', gap: 10, marginTop: 8 },
  footer: { alignItems: 'center', marginTop: 20, gap: 4 },
  footerText: { color: '#333', fontSize: 11, letterSpacing: 2 },
  footerSub: { color: '#2a2a2a', fontSize: 10 },
})
