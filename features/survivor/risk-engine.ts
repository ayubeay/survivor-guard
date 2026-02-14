// Survivor Guard — Risk Engine
export type RiskLevel = 'LOW' | 'MED' | 'HIGH'
export interface RiskResult { level: RiskLevel; score: number; reasons: string[]; confidence: number }
function classify(score: number): RiskLevel { if (score >= 55) return 'HIGH'; if (score >= 25) return 'MED'; return 'LOW' }
const VERIFIED_PROGRAMS = new Set(['11111111111111111111111111111111','TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA','TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb','ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL','JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4','whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc','675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8','CAMMCzo5YL8w4VFF8KVHrK22GGUsp5VTaW7grrKgrWqK','MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr','metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s','ComputeBudget111111111111111111111111111111'])
const TRUSTED_DOMAINS = new Set(['jup.ag','jupiter.ag','birdeye.so','solscan.io','solana.com','raydium.io','phantom.app','solflare.com','orca.so','marinade.finance','tensor.trade','magiceden.io','dexscreener.com','defined.fi','step.finance','drift.trade','marginfi.com','kamino.finance','meteora.ag','sanctum.so'])
export interface RiskContext { programIds?: string[]; amountLamports?: number; instructionCount?: number; targetAddress?: string; url?: string; text?: string; tokenAgeMinutes?: number; lpSolAmount?: number; deployerPreviousExits?: number }
export function evaluateRisk(ctx: RiskContext = {}): RiskResult {
  const reasons: string[] = []; let score = 0
  const unverified = (ctx.programIds || []).filter(id => !VERIFIED_PROGRAMS.has(id))
  if (unverified.length > 0) { score += 20; reasons.push('Interacting with ' + unverified.length + ' unverified program' + (unverified.length > 1 ? 's' : '')) }
  if (ctx.amountLamports && ctx.amountLamports > 5000000000) { score += 15; reasons.push('Large transfer: ' + (ctx.amountLamports / 1000000000).toFixed(2) + ' SOL') }
  else if (ctx.amountLamports && ctx.amountLamports > 1000000000) { score += 8; reasons.push('Transfer exceeds 1 SOL') }
  if (ctx.instructionCount && ctx.instructionCount > 5) { score += 15; reasons.push('Complex transaction with ' + ctx.instructionCount + ' instructions') }
  if (ctx.url) { try { const url = new URL(ctx.url); const host = url.host.toLowerCase(); const isTrusted = Array.from(TRUSTED_DOMAINS).some(d => host === d || host.endsWith('.' + d)); if (!isTrusted) { const brands = ['phantom','solana','jupiter','raydium','solflare','orca']; const isLookalike = brands.some(b => host.includes(b) && !isTrusted); if (isLookalike) { score += 45; reasons.push('Domain ' + host + ' resembles a known brand (possible impersonation)') } else { score += 25; reasons.push('Untrusted domain: ' + host) } } } catch {} }
  if (ctx.text) { const lower = ctx.text.toLowerCase(); const lures = [{word:'claim',weight:25,label:'claim language'},{word:'airdrop',weight:20,label:'airdrop lure'},{word:'free mint',weight:30,label:'free mint language'},{word:'verify wallet',weight:35,label:'wallet verification request'},{word:'urgent',weight:15,label:'urgency pressure'},{word:'connect wallet',weight:20,label:'wallet connection request'}]; const hit = lures.find(l => lower.includes(l.word)); if (hit) { score += hit.weight; reasons.push('Detected ' + hit.label + ' pattern') } }
  if (ctx.targetAddress && /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(ctx.targetAddress)) { if (ctx.targetAddress.toLowerCase().startsWith('pump')) { score += 15; reasons.push('Address pattern suggests pump.fun token') } }
  if (ctx.tokenAgeMinutes !== undefined && ctx.tokenAgeMinutes < 30) { score += 30; reasons.push('Token created ' + ctx.tokenAgeMinutes + ' minutes ago') }
  if (ctx.lpSolAmount !== undefined && ctx.lpSolAmount < 5) { score += 25; reasons.push('Low liquidity: ' + ctx.lpSolAmount.toFixed(1) + ' SOL') }
  if (ctx.deployerPreviousExits !== undefined && ctx.deployerPreviousExits > 0) { score += 35; reasons.push('Deployer exited ' + ctx.deployerPreviousExits + ' similar token' + (ctx.deployerPreviousExits > 1 ? 's' : '')) }
  if (reasons.length === 0) { reasons.push('No risk signals detected') }
  const level = classify(Math.min(score, 100))
  const confidence = Math.min(0.99, 0.3 + reasons.length * 0.12 + (score > 50 ? 0.2 : 0))
  return { level, score: Math.min(score, 100), reasons: reasons.slice(0, 3), confidence: parseFloat(confidence.toFixed(2)) }
}
export function evaluatePreflight(input: string): RiskResult {
  const s = (input || '').trim()
  if (!s) return { level: 'LOW', score: 0, reasons: ['No input provided'], confidence: 0 }
  return evaluateRisk({ url: s, text: s, targetAddress: /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(s) ? s : undefined })
}
export const RISK_COLORS = { HIGH: { color: '#ff3b4f', bg: '#1a0a0d', border: '#3d1520' }, MED: { color: '#ffb020', bg: '#1a150a', border: '#3d2d10' }, LOW: { color: '#14e09e', bg: '#0a1a14', border: '#103d28' } }
