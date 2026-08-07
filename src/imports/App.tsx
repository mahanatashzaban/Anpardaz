import { useState, useEffect, useCallback } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────
type Screen =
  | 'splash' | 'login' | 'otp' | 'home' | 'transfer' | 'receive'
  | 'transactions' | 'internet' | 'bills' | 'settings' | 'addcard' | 'contact'

type Currency = 'rial' | 'usdt'
type DestType = 'kelid' | 'card' | 'crypto'

interface Transaction {
  id: number; type: 'in' | 'out'; title: string; subtitle: string
  amount: string; currency: Currency; date: string
}

// ─── Mock Data ────────────────────────────────────────────────────────────────
const TRANSACTIONS: Transaction[] = [
  { id: 1, type: 'in', title: 'واریز از کلید', subtitle: 'علی رضایی', amount: '۲,۵۰۰,۰۰۰', currency: 'rial', date: '۱۴۰۳/۰۴/۱۵' },
  { id: 2, type: 'out', title: 'انتقال تتر', subtitle: 'TRC20: TJkx...3mN', amount: '۱۲۰', currency: 'usdt', date: '۱۴۰۳/۰۴/۱۴' },
  { id: 3, type: 'out', title: 'انتقال ریال', subtitle: 'سارا محمدی', amount: '۸۰۰,۰۰۰', currency: 'rial', date: '۱۴۰۳/۰۴/۱۲' },
  { id: 4, type: 'in', title: 'دریافت تتر', subtitle: 'TRC20: TGm2...9xP', amount: '۵۰۰', currency: 'usdt', date: '۱۴۰۳/۰۴/۱۰' },
  { id: 5, type: 'out', title: 'پرداخت قبض برق', subtitle: 'شرکت توزیع برق', amount: '۳۴۰,۰۰۰', currency: 'rial', date: '۱۴۰۳/۰۴/۰۸' },
  { id: 6, type: 'out', title: 'انتقال ریال', subtitle: 'محمد احمدی', amount: '۵۰۰,۰۰۰', currency: 'rial', date: '۱۴۰۳/۰۴/۰۶' },
  { id: 7, type: 'in', title: 'واریز حقوق', subtitle: 'شرکت آپتو', amount: '۸,۵۰۰,۰۰۰', currency: 'rial', date: '۱۴۰۳/۰۴/۰۱' },
]

// Fake Kelid users DB
const KELID_USERS = ['09137654321', '09051826963', '09054050154', '09375437106']

function fmtRial(n: number) {
  return n.toLocaleString('fa-IR')
}

// ─── SVG Icons ────────────────────────────────────────────────────────────────
const Icons = {
  key: (size = 28, color = '#00c896') => (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <circle cx="11" cy="13" r="6" stroke={color} strokeWidth="2.5"/>
      <circle cx="11" cy="13" r="2.5" fill={color}/>
      <path d="M16 13h10M22 13v3M26 13v3" stroke={color} strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  ),
  home: (c = '#888') => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8"><path d="M3 9.5L12 3l9 6.5V21a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/><path d="M9 22V12h6v10"/></svg>,
  settings: (c = '#888') => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06-.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>,
  phone: (c = '#888') => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 012 1.22 2 2 0 014 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92z"/></svg>,
  arrowRight: (c = '#888') => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>,
  arrowLeft: (c = '#888') => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>,
  menu: (c = '#888') => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
  bell: (c = '#888') => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/></svg>,
  eye: (c = '#888') => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  eyeOff: (c = '#888') => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22"/></svg>,
  copy: (c = '#888') => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>,
  check: (c = '#00c896') => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>,
  transfer: (c = '#888') => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8"><path d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4"/></svg>,
  receive: (c = '#888') => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8"><path d="M12 2v13M8 11l4 4 4-4M3 19h18"/></svg>,
  creditCard: (c = '#888') => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>,
  internet: (c = '#888') => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>,
  bill: (c = '#888') => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
  car: (c = '#888') => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8"><path d="M5 17H3a2 2 0 01-2-2V9a2 2 0 012-2h1l2-4h12l2 4h1a2 2 0 012 2v6a2 2 0 01-2 2h-2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/></svg>,
  scale: (c = '#888') => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8"><path d="M12 3v18M3 9l9-6 9 6M5 21h14"/><path d="M5 9l-2 6h4L5 9zM19 9l-2 6h4L19 9z"/></svg>,
  heart: (c = '#888') => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>,
  robot: (c = '#888') => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M12 2v4M8 11V9a4 4 0 018 0v2"/><circle cx="9" cy="16" r="1" fill={c}/><circle cx="15" cy="16" r="1" fill={c}/></svg>,
  shield: (c = '#888') => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  logout: (c = '#e85c5c') => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>,
  user: (c = '#888') => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z"/></svg>,
  plus: (c = '#888') => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  info: (c = '#888') => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>,
  warn: (c = '#f7c325') => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01"/></svg>,
  mobile: (c = '#888') => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>,
  wallet: (c = '#888') => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8"><path d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z"/><path d="M16 14a1 1 0 110-2 1 1 0 010 2zM16 7V4a2 2 0 00-2-2H6a2 2 0 00-2 2v3"/></svg>,
}

// ─── Theme helpers ────────────────────────────────────────────────────────────
function useTheme(theme: 'dark' | 'light') {
  return {
    bg: theme === 'dark' ? '#0f0f0f' : '#f2f4f7',
    surface: theme === 'dark' ? '#1a1a1a' : '#ffffff',
    card: theme === 'dark' ? '#222222' : '#ffffff',
    border: theme === 'dark' ? '#2e2e2e' : '#e2e6ea',
    text: theme === 'dark' ? '#f0f0f0' : '#111827',
    muted: theme === 'dark' ? '#888888' : '#6b7280',
    sub: theme === 'dark' ? '#555' : '#9ca3af',
  }
}

// ─── Header ───────────────────────────────────────────────────────────────────
function Header({
  title, onBack, onMenu, showBell, theme, notif
}: {
  title?: string; onBack?: () => void; onMenu?: () => void
  showBell?: boolean; theme: 'dark' | 'light'; notif?: boolean
}) {
  const t = useTheme(theme)
  return (
    <div className="flex items-center justify-between px-5 pt-5 pb-3 flex-shrink-0">
      <div className="flex items-center gap-2">
        {showBell && (
          <button className="w-9 h-9 rounded-xl flex items-center justify-center relative"
            style={{ background: t.surface }}>
            {Icons.bell(t.muted)}
            {notif && <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#e8512a]" />}
          </button>
        )}
        {onMenu && (
          <button onClick={onMenu} className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: t.surface }}>
            {Icons.menu(t.muted)}
          </button>
        )}
      </div>
      {title ? (
        <span className="text-base font-bold" style={{ color: t.text }}>{title}</span>
      ) : (
        <div className="flex items-center gap-1.5">
          {Icons.key(22, '#00c896')}
          <span className="text-lg font-bold" style={{ color: t.text }}>کلید</span>
        </div>
      )}
      {onBack ? (
        <button onClick={onBack} className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: t.surface }}>
          {Icons.arrowRight(t.muted)}
        </button>
      ) : <div className="w-9" />}
    </div>
  )
}

// ─── Bottom Nav ───────────────────────────────────────────────────────────────
function BottomNav({ active, onNav, theme }: { active: Screen; onNav: (s: Screen) => void; theme: 'dark' | 'light' }) {
  const t = useTheme(theme)
  const tabs = [
    { s: 'contact' as Screen, label: 'تماس با ما', icon: (a: boolean) => Icons.phone(a ? '#00c896' : t.muted) },
    { s: 'settings' as Screen, label: 'تنظیمات', icon: (a: boolean) => Icons.settings(a ? '#00c896' : t.muted) },
    { s: 'home' as Screen, label: 'صفحه اصلی', icon: (a: boolean) => Icons.home(a ? '#00c896' : t.muted) },
  ]
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40"
      style={{ background: t.surface, borderTop: `1px solid ${t.border}` }}>
      <div className="flex items-center justify-around py-2.5 px-4 max-w-sm mx-auto">
        {tabs.map(tab => (
          <button key={tab.s} onClick={() => onNav(tab.s)}
            className="flex flex-col items-center gap-1 px-4 py-1.5 rounded-xl transition-all">
            {tab.icon(active === tab.s)}
            <span className="text-[10px] font-medium"
              style={{ color: active === tab.s ? '#00c896' : t.muted }}>
              {tab.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Splash ───────────────────────────────────────────────────────────────────
function SplashScreen({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState(0)
  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 300)
    const t2 = setTimeout(() => setPhase(2), 1100)
    const t3 = setTimeout(() => setPhase(3), 1900)
    const t4 = setTimeout(() => onDone(), 2700)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4) }
  }, [onDone])

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #061510 0%, #0a0a0a 60%, #140800 100%)' }}>
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="absolute rounded-full border border-[#00c896]"
            style={{
              width: `${i * 140}px`, height: `${i * 140}px`,
              opacity: phase >= 1 ? (0.18 - i * 0.04) : 0,
              transform: phase >= 1 ? 'scale(1)' : 'scale(0.4)',
              transition: `all ${0.5 + i * 0.15}s cubic-bezier(0.34,1.56,0.64,1)`,
            }} />
        ))}
      </div>
      <div className="relative z-10 flex flex-col items-center gap-5">
        <div style={{ opacity: phase >= 1 ? 1 : 0, transform: phase >= 1 ? 'scale(1)' : 'scale(0.3)', transition: 'all 0.8s cubic-bezier(0.34,1.56,0.64,1)' }}>
          <div className="w-28 h-28 rounded-3xl flex items-center justify-center animate-pulse-glow"
            style={{ background: 'linear-gradient(135deg, #00c896 0%, #007a5e 100%)' }}>
            {Icons.key(56, 'white')}
          </div>
        </div>
        <div style={{ opacity: phase >= 2 ? 1 : 0, transform: phase >= 2 ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.5s ease' }}
          className="flex flex-col items-center gap-1.5">
          <h1 className="text-4xl font-bold text-white tracking-wider">کلید</h1>
          <p className="text-[#00c896] text-sm font-medium tracking-wide">کیف پول دیجیتال شما</p>
        </div>
      </div>
      <div className="absolute bottom-14 flex flex-col items-center gap-3"
        style={{ opacity: phase >= 3 ? 1 : 0, transition: 'all 0.4s ease' }}>
        <div className="flex gap-1.5">
          {[0, 1, 2].map(i => (
            <div key={i} className="rounded-full bg-[#00c896]"
              style={{ width: i === 1 ? '20px' : '6px', height: '6px', opacity: 0.5 + i * 0.25 }} />
          ))}
        </div>
        <p className="text-[#555] text-xs tracking-wide">ریال · تتر · ترون</p>
      </div>
    </div>
  )
}

// ─── Login ────────────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }: { onLogin: (p: string) => void }) {
  const [phone, setPhone] = useState('')
  const [focused, setFocused] = useState(false)
  const t = useTheme('dark')

  return (
    <div className="flex flex-col min-h-screen" style={{ background: t.bg }}>
      <div className="flex flex-col items-center pt-16 pb-8 px-6">
        <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-4"
          style={{ background: 'linear-gradient(135deg, #00c896, #007a5e)' }}>
          {Icons.key(40, 'white')}
        </div>
        <h1 className="text-2xl font-bold text-white mb-1">کلید</h1>
        <p className="text-[#555] text-sm">ورود یا ثبت‌نام</p>
      </div>
      <div className="flex-1 flex flex-col px-5">
        <h2 className="text-white text-lg font-semibold text-right mb-6">شماره همراه خود را وارد کنید</h2>
        <div className="relative mb-3">
          <div className="flex items-center gap-3 px-4 rounded-2xl h-14 transition-all"
            style={{ background: t.surface, border: `2px solid ${focused ? '#00c896' : t.border}`, boxShadow: focused ? '0 0 0 4px rgba(0,200,150,0.1)' : 'none' }}>
            <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#1e3030' }}>
              {Icons.mobile('#00c896')}
            </div>
            <input type="tel" value={phone}
              onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
              onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
              placeholder="09xxxxxxxxx" dir="ltr"
              className="flex-1 bg-transparent text-white placeholder-[#444] text-base outline-none text-right"
              style={{ fontFamily: 'Vazirmatn, sans-serif' }} />
          </div>
        </div>
        <div className="flex items-center gap-2 p-3.5 rounded-xl mb-8" style={{ background: '#1a2420', border: '1px solid #1e3530' }}>
          {Icons.info('#00c896')}
          <p className="text-[#6b9e8e] text-xs text-right flex-1">با خط فعال اینترنت، ورود خودکار انجام می‌شود</p>
        </div>
        <div className="flex-1" />
        <p className="text-[#444] text-xs text-center mb-4 leading-relaxed">
          ورود به معنای پذیرش <span className="text-[#00c896]">قوانین</span> و <span className="text-[#00c896]">حریم خصوصی</span> کلید است
        </p>
        <button onClick={() => phone.length >= 10 && onLogin(phone)}
          disabled={phone.length < 10}
          className="w-full h-14 rounded-2xl text-white font-bold text-base mb-8 transition-all"
          style={{ background: phone.length >= 10 ? 'linear-gradient(135deg, #e8512a, #c93e1a)' : '#1e1e1e', color: phone.length >= 10 ? 'white' : '#444' }}>
          ادامه
        </button>
      </div>
    </div>
  )
}

// ─── OTP ──────────────────────────────────────────────────────────────────────
function OtpScreen({ phone, onVerify }: { phone: string; onVerify: () => void }) {
  const [otp, setOtp] = useState(['', '', '', '', ''])
  const [timer, setTimer] = useState(90)
  const refs = Array.from({ length: 5 }, () => ({ current: null as HTMLInputElement | null }))
  const t = useTheme('dark')

  useEffect(() => {
    const iv = setInterval(() => setTimer(x => x > 0 ? x - 1 : 0), 1000)
    return () => clearInterval(iv)
  }, [])

  const handleChange = (i: number, v: string) => {
    if (!/^\d*$/.test(v)) return
    const next = [...otp]; next[i] = v.slice(-1); setOtp(next)
    if (v && i < 4) refs[i + 1].current?.focus()
    if (next.every(d => d)) setTimeout(onVerify, 300)
  }

  return (
    <div className="flex flex-col min-h-screen" style={{ background: t.bg }}>
      <Header title="تایید شماره" onBack={() => {}} theme="dark" />
      <div className="flex-1 flex flex-col px-5 pt-6 animate-fadein">
        <div className="flex flex-col items-center mb-10">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
            style={{ background: '#1a2420' }}>
            {Icons.phone('#00c896')}
          </div>
          <h2 className="text-white text-lg font-bold mb-1">کد تایید ارسال شد</h2>
          <p className="text-[#555] text-sm text-center">
            کد ۵ رقمی به <span className="text-[#00c896]" dir="ltr">{phone}</span> ارسال شد
          </p>
        </div>
        <div className="flex gap-3 justify-center mb-6 flex-row-reverse" dir="ltr">
          {otp.map((d, i) => (
            <input key={i} ref={r => { refs[i].current = r }} type="tel" value={d}
              onChange={e => handleChange(i, e.target.value)} maxLength={1}
              className="w-12 h-14 rounded-xl text-center text-xl font-bold text-white outline-none transition-all"
              style={{ background: t.surface, border: `2px solid ${d ? '#00c896' : t.border}`, boxShadow: d ? '0 0 0 3px rgba(0,200,150,0.15)' : 'none' }} />
          ))}
        </div>
        <div className="flex justify-center mb-8">
          {timer > 0 ? (
            <span className="text-[#555] text-sm">
              <span className="text-[#00c896] font-mono font-bold">{String(Math.floor(timer / 60)).padStart(2, '0')}:{String(timer % 60).padStart(2, '0')}</span>
              {' '}تا ارسال مجدد
            </span>
          ) : (
            <button className="text-[#00c896] text-sm font-medium" onClick={() => setTimer(90)}>ارسال مجدد کد</button>
          )}
        </div>
        <div className="flex-1" />
        <button onClick={onVerify}
          className="w-full h-14 rounded-2xl text-white font-bold text-base mb-8"
          style={{ background: 'linear-gradient(135deg, #e8512a, #c93e1a)' }}>
          تایید و ورود
        </button>
      </div>
    </div>
  )
}

// ─── Home ─────────────────────────────────────────────────────────────────────
function HomeScreen({
  phone, onNav, theme, notif
}: { phone: string; onNav: (s: Screen) => void; theme: 'dark' | 'light'; notif: boolean }) {
  const t = useTheme(theme)
  const [menuOpen, setMenuOpen] = useState(false)
  const [hideRial, setHideRial] = useState(false)
  const [hideUsdt, setHideUsdt] = useState(false)
  const [hideTotal, setHideTotal] = useState(false)

  const services = [
    { label: 'انتقال وجه', icon: Icons.transfer, color: '#e8512a', s: 'transfer' as Screen },
    { label: 'دریافت', icon: Icons.receive, color: '#00c896', s: 'receive' as Screen },
    { label: 'کارت به کارت', icon: Icons.creditCard, color: '#5b8dee', s: 'bills' as Screen },
    { label: 'خرید شارژ', icon: Icons.mobile, color: '#f7c325', s: 'internet' as Screen },
    { label: 'بسته اینترنت', icon: Icons.internet, color: '#a78bfa', s: 'internet' as Screen },
    { label: 'قبوض', icon: Icons.bill, color: '#34d399', s: 'bills' as Screen },
    { label: 'بیمه', icon: Icons.shield, color: '#60a5fa', s: 'bills' as Screen },
    { label: 'ربات تریدر', icon: Icons.robot, color: '#f472b6', s: 'bills' as Screen },
    { label: 'خدمات خودرو', icon: Icons.car, color: '#fb923c', s: 'bills' as Screen },
    { label: 'خدمات قضایی', icon: Icons.scale, color: '#a3e635', s: 'bills' as Screen },
    { label: 'نیکوکاری', icon: Icons.heart, color: '#f87171', s: 'bills' as Screen },
    { label: 'تراکنش‌ها', icon: Icons.wallet, color: '#00c896', s: 'transactions' as Screen },
  ]

  return (
    <div className="flex flex-col min-h-screen" style={{ background: t.bg }}>
      <div className="flex items-center justify-between px-5 pt-5 pb-3 flex-shrink-0">
        <div className="flex items-center gap-2">
          {notif && (
            <button className="w-9 h-9 rounded-xl flex items-center justify-center relative"
              style={{ background: t.surface }}>
              {Icons.bell(t.muted)}
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#e8512a]" />
            </button>
          )}
          <button onClick={() => setMenuOpen(true)}
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: t.surface }}>
            {Icons.menu(t.muted)}
          </button>
        </div>
        <div className="flex items-center gap-1.5">
          {Icons.key(22, '#00c896')}
          <span className="text-lg font-bold" style={{ color: t.text }}>کلید</span>
        </div>
        <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold"
          style={{ background: 'linear-gradient(135deg, #00c896, #007a5e)' }}>
          {phone.slice(-2)}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-24 px-4">
        {/* Balance Card */}
        <div className="rounded-3xl p-5 mb-4 animate-fadein card-shadow relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #003828 0%, #005a44 50%, #007a5e 100%)' }}>
          <div className="absolute -top-10 -left-10 w-40 h-40 rounded-full opacity-10 bg-[#00ffc0]" />
          <div className="absolute -bottom-8 -right-8 w-28 h-28 rounded-full opacity-10 bg-[#00c896]" />
          <div className="flex items-center justify-between mb-3 relative">
            <button onClick={() => setHideTotal(!hideTotal)} className="p-1.5 rounded-lg"
              style={{ background: 'rgba(255,255,255,0.1)' }}>
              {hideTotal ? Icons.eyeOff('white') : Icons.eye('white')}
            </button>
            <p className="text-white/70 text-xs font-medium">موجودی کل</p>
          </div>
          <div className="flex flex-col gap-3 relative">
            <div className="flex items-center justify-between p-3 rounded-2xl"
              style={{ background: 'rgba(0,0,0,0.2)' }}>
              <button onClick={() => setHideRial(!hideRial)}>
                {hideRial ? Icons.eyeOff('rgba(255,255,255,0.5)') : Icons.eye('rgba(255,255,255,0.5)')}
              </button>
              <div className="text-right">
                <p className="text-white/60 text-xs mb-0.5">موجودی ریالی</p>
                <p className="text-white font-bold text-xl" dir="ltr">
                  {hideRial ? '***,***,***' : '۱۲,۳۴۵,۶۰۰'} <span className="text-sm font-normal opacity-70">ریال</span>
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 rounded-2xl"
              style={{ background: 'rgba(0,0,0,0.2)' }}>
              <button onClick={() => setHideUsdt(!hideUsdt)}>
                {hideUsdt ? Icons.eyeOff('rgba(255,255,255,0.5)') : Icons.eye('rgba(255,255,255,0.5)')}
              </button>
              <div className="text-right">
                <p className="text-white/60 text-xs mb-0.5">موجودی تتر (TRC20)</p>
                <p className="text-white font-bold text-xl" dir="ltr">
                  {hideUsdt ? '***.** ' : '۲۳۵.۵۰'} <span className="text-sm font-normal opacity-70">USDT</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-4 gap-2.5 animate-fadein" style={{ animationDelay: '0.1s' }}>
          {services.map(svc => (
            <button key={svc.label} onClick={() => onNav(svc.s)}
              className="flex flex-col items-center gap-2 p-3 rounded-2xl transition-all active:scale-95"
              style={{ background: t.surface, border: `1px solid ${t.border}` }}>
              <div className="w-11 h-11 rounded-xl flex items-center justify-center"
                style={{ background: svc.color + '22' }}>
                {svc.icon(svc.color)}
              </div>
              <span className="text-[10px] font-medium text-center leading-tight" style={{ color: t.muted }}>
                {svc.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      <BottomNav active="home" onNav={onNav} theme={theme} />

      {menuOpen && (
        <DropdownMenu onClose={() => setMenuOpen(false)}
          onNav={s => { setMenuOpen(false); onNav(s) }} theme={theme} />
      )}
    </div>
  )
}

// ─── Dropdown Menu ────────────────────────────────────────────────────────────
function DropdownMenu({ onClose, onNav, theme }: { onClose: () => void; onNav: (s: Screen) => void; theme: 'dark' | 'light' }) {
  const t = useTheme(theme)
  const items = [
    { label: 'پروفایل', icon: Icons.user(t.muted), s: 'home' as Screen },
    { label: 'افزودن کارت بانکی', icon: Icons.creditCard(t.muted), s: 'addcard' as Screen },
    { label: 'تراکنش‌ها', icon: Icons.wallet(t.muted), s: 'transactions' as Screen },
    { label: 'تنظیمات', icon: Icons.settings(t.muted), s: 'settings' as Screen },
    { label: 'تماس با ما', icon: Icons.phone(t.muted), s: 'contact' as Screen },
  ]

  return (
    <div className="fixed inset-0 z-50" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60" />
      <div
        className="absolute rounded-2xl overflow-hidden animate-scalein card-shadow"
        style={{
          background: t.surface,
          border: `1px solid ${t.border}`,
          top: '70px', right: '16px',
          width: '200px',
          transformOrigin: 'top right',
          maxWidth: 'calc(100vw - 32px)',
        }}
        onClick={e => e.stopPropagation()}>
        {items.map((item, i) => (
          <div key={item.label}>
            {i > 0 && <div className="h-px mx-3" style={{ background: t.border }} />}
            <button className="w-full flex items-center justify-end gap-3 px-4 py-3.5 text-right transition-all hover:bg-white/5"
              onClick={() => onNav(item.s)}>
              <span className="text-sm" style={{ color: t.text }}>{item.label}</span>
              {item.icon}
            </button>
          </div>
        ))}
        <div className="h-px mx-3" style={{ background: t.border }} />
        <button className="w-full flex items-center justify-end gap-3 px-4 py-3.5 text-right"
          onClick={onClose}>
          <span className="text-sm text-[#e85c5c]">خروج از حساب</span>
          {Icons.logout()}
        </button>
      </div>
    </div>
  )
}

// ─── Receive Screen ───────────────────────────────────────────────────────────
function ReceiveScreen({ phone, onNav, theme }: { phone: string; onNav: (s: Screen) => void; theme: 'dark' | 'light' }) {
  const t = useTheme(theme)
  const [copied, setCopied] = useState<string | null>(null)
  const WALLET = 'TJkxL8mN3qR7pW2vA9cK4fE6dS1bU5hY'
  const CARD = '6219-8610-3456-7891'
  const KELID_ID = '۴۸۲-۹۱۳-۶'

  const copy = (val: string, key: string) => {
    navigator.clipboard.writeText(val).catch(() => {})
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  const Row = ({ label, value, copyKey }: { label: string; value: string; copyKey: string }) => (
    <div className="p-4 rounded-2xl mb-3" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
      <p className="text-xs mb-1.5 text-right" style={{ color: t.muted }}>{label}</p>
      <div className="flex items-center justify-between gap-3">
        <button onClick={() => copy(value, copyKey)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all"
          style={{ background: copied === copyKey ? 'rgba(0,200,150,0.15)' : t.card }}>
          {copied === copyKey ? Icons.check() : Icons.copy(t.muted)}
          <span className="text-xs" style={{ color: copied === copyKey ? '#00c896' : t.muted }}>
            {copied === copyKey ? 'کپی شد' : 'کپی'}
          </span>
        </button>
        <p className="text-sm font-medium text-right break-all" style={{ color: t.text }} dir="ltr">{value}</p>
      </div>
    </div>
  )

  return (
    <div className="flex flex-col min-h-screen" style={{ background: t.bg }}>
      <Header title="دریافت وجه" onBack={() => onNav('home')} theme={theme} />
      <div className="flex-1 overflow-y-auto px-4 pb-24 animate-fadein">
        <div className="flex items-center gap-2 p-3.5 rounded-xl mb-5 mt-2"
          style={{ background: theme === 'dark' ? '#1a2420' : '#e8f8f3', border: '1px solid #1e3530' }}>
          {Icons.info('#00c896')}
          <p className="text-xs text-right flex-1" style={{ color: '#5ba88a' }}>
            برای دریافت وجه، اطلاعات زیر را با فرستنده به اشتراک بگذارید
          </p>
        </div>

        <Row label="شناسه کلید (برای انتقال درون‌برنامه)" value={`KELID-${KELID_ID}`} copyKey="kelid" />
        <Row label="شماره موبایل" value={phone || '09137654321'} copyKey="phone" />
        <Row label="شماره کارت بانکی" value={CARD} copyKey="card" />
        <Row label="آدرس کیف تتر (TRC20)" value={WALLET} copyKey="wallet" />

        <div className="p-4 rounded-2xl mt-2"
          style={{ background: t.surface, border: `1px solid ${t.border}` }}>
          <p className="text-xs text-right mb-3" style={{ color: t.muted }}>آدرس کیف تتر (QR)</p>
          <div className="flex justify-center">
            <div className="w-36 h-36 rounded-xl flex items-center justify-center"
              style={{ background: theme === 'dark' ? '#2a2a2a' : '#f0f0f0' }}>
              <div className="grid grid-cols-8 gap-0.5 p-2">
                {Array.from({ length: 64 }, (_, i) => (
                  <div key={i} className="w-3 h-3 rounded-[1px]"
                    style={{ background: (i * 17 + i % 7) % 3 === 0 ? (theme === 'dark' ? '#f0f0f0' : '#111') : 'transparent' }} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <BottomNav active="home" onNav={onNav} theme={theme} />
    </div>
  )
}

// ─── Transfer Screen (comprehensive) ─────────────────────────────────────────
function TransferScreen({ onNav, theme, usdtPrice }: { onNav: (s: Screen) => void; theme: 'dark' | 'light'; usdtPrice: number }) {
  const t = useTheme(theme)
  const [step, setStep] = useState(1)
  const [srcCurrency, setSrcCurrency] = useState<Currency>('rial')
  const [destType, setDestType] = useState<DestType>('kelid')
  const [destValue, setDestValue] = useState('')
  const [amount, setAmount] = useState('')
  const [destCurrency, setDestCurrency] = useState<Currency>('rial')
  const [kelidStatus, setKelidStatus] = useState<'idle' | 'checking' | 'found' | 'notfound'>('idle')
  const [warnAccepted, setWarnAccepted] = useState(false)
  const [paymentId] = useState(() => Math.floor(1000000 + Math.random() * 9000000).toString())
  const [done, setDone] = useState(false)

  const COMMISSION = 0.003
  const NET_FEE_USDT = 1

  const amountNum = parseFloat(amount.replace(/[^0-9.]/g, '')) || 0

  const computeFees = () => {
    if (srcCurrency === 'rial' && destCurrency === 'rial') {
      const fee = Math.round(amountNum * COMMISSION)
      return { deductRial: amountNum + fee, depositRial: amountNum, depositUsdt: 0, feeRial: fee, feeUsdt: 0, netFee: 0 }
    }
    if (srcCurrency === 'usdt' && destCurrency === 'usdt') {
      const fee = amountNum * COMMISSION
      const net = NET_FEE_USDT
      return { deductRial: 0, depositRial: 0, depositUsdt: amountNum - fee - net, feeRial: 0, feeUsdt: fee, netFee: net }
    }
    if (srcCurrency === 'rial' && destCurrency === 'usdt') {
      const usdt = amountNum / usdtPrice
      const fee = usdt * COMMISSION
      const net = NET_FEE_USDT
      return { deductRial: amountNum, depositRial: 0, depositUsdt: usdt - fee - net, feeRial: 0, feeUsdt: fee, netFee: net }
    }
    // usdt -> rial
    const rial = amountNum * usdtPrice
    const fee = rial * COMMISSION
    return { deductRial: 0, depositRial: rial - fee, depositUsdt: 0, feeRial: fee, feeUsdt: 0, netFee: 0 }
  }

  const fees = computeFees()

  const checkKelid = useCallback(() => {
    if (destType !== 'kelid' || !destValue) return
    setKelidStatus('checking')
    setTimeout(() => {
      setKelidStatus(KELID_USERS.includes(destValue) ? 'found' : 'notfound')
    }, 900)
  }, [destType, destValue])

  if (done) return (
    <div className="flex flex-col min-h-screen items-center justify-center px-5 animate-scalein" style={{ background: t.bg }}>
      <div className="w-24 h-24 rounded-full flex items-center justify-center mb-6"
        style={{ background: 'rgba(0,200,150,0.12)' }}>
        {Icons.check('#00c896')}
      </div>
      <h2 className="text-2xl font-bold mb-2" style={{ color: t.text }}>انتقال موفق</h2>
      <p className="text-center text-sm mb-2" style={{ color: t.muted }}>
        {srcCurrency === 'rial' ? `${fmtRial(amountNum)} ریال` : `${amountNum} USDT`} منتقل شد
      </p>
      {destType === 'kelid' && kelidStatus === 'found' && (
        <div className="p-4 rounded-2xl text-center mt-2 mb-4"
          style={{ background: t.surface, border: `1px solid ${t.border}` }}>
          <p className="text-xs mb-1" style={{ color: t.muted }}>شناسه پرداخت</p>
          <p className="text-[#00c896] font-mono text-xl font-bold">{paymentId}</p>
          <p className="text-xs mt-1" style={{ color: t.muted }}>گیرنده این کد را از کلید دریافت می‌کند</p>
        </div>
      )}
      <button onClick={() => onNav('home')} className="w-full h-14 rounded-2xl text-white font-bold mt-4"
        style={{ background: 'linear-gradient(135deg, #e8512a, #c93e1a)' }}>
        بازگشت به خانه
      </button>
    </div>
  )

  return (
    <div className="flex flex-col min-h-screen" style={{ background: t.bg }}>
      <Header title="انتقال وجه" onBack={() => step > 1 ? setStep(s => s - 1) : onNav('home')} theme={theme} />

      {/* Step progress */}
      <div className="flex gap-1.5 px-5 mb-5">
        {[1, 2, 3].map(s => (
          <div key={s} className="flex-1 h-1 rounded-full transition-all"
            style={{ background: step >= s ? '#00c896' : (theme === 'dark' ? '#2a2a2a' : '#ddd') }} />
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-28 animate-fadein">

        {/* Step 1: Source + Destination currency & type */}
        {step === 1 && (
          <>
            <h2 className="text-base font-bold mb-4 text-right" style={{ color: t.text }}>
              حساب مبدأ را انتخاب کنید
            </h2>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {([['rial', 'حساب ریالی', '۱۲,۳۴۵,۶۰۰ ریال'], ['usdt', 'کیف تتر (TRC20)', '۲۳۵.۵۰ USDT']] as const).map(([cur, label, bal]) => (
                <button key={cur} onClick={() => setSrcCurrency(cur)}
                  className="p-4 rounded-2xl text-right transition-all"
                  style={{
                    background: srcCurrency === cur ? 'rgba(0,200,150,0.12)' : t.surface,
                    border: `2px solid ${srcCurrency === cur ? '#00c896' : t.border}`,
                  }}>
                  <div className="flex items-center justify-end gap-2 mb-2">
                    <p className="text-xs font-medium" style={{ color: t.text }}>{label}</p>
                    {srcCurrency === cur ? Icons.check('#00c896') : <div className="w-4" />}
                  </div>
                  <p className="text-[10px]" style={{ color: t.muted }}>{bal}</p>
                </button>
              ))}
            </div>

            <h2 className="text-base font-bold mb-4 text-right" style={{ color: t.text }}>
              نوع انتقال
            </h2>
            <div className="flex flex-col gap-2 mb-6">
              {([
                ['kelid', 'کاربر کلید (شماره موبایل)', 'سریع‌ترین روش'],
                ['card', 'شماره کارت بانکی', 'کارت به کارت'],
                ['crypto', 'آدرس کیف تتر (TRC20)', 'شبکه ترون'],
              ] as const).map(([type, label, sub]) => (
                <button key={type} onClick={() => { setDestType(type); setDestValue(''); setKelidStatus('idle') }}
                  className="flex items-center justify-between p-4 rounded-2xl transition-all"
                  style={{
                    background: destType === type ? 'rgba(0,200,150,0.1)' : t.surface,
                    border: `1.5px solid ${destType === type ? '#00c896' : t.border}`,
                  }}>
                  <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center"
                    style={{ borderColor: destType === type ? '#00c896' : t.sub }}>
                    {destType === type && <div className="w-2.5 h-2.5 rounded-full bg-[#00c896]" />}
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium" style={{ color: t.text }}>{label}</p>
                    <p className="text-xs" style={{ color: t.muted }}>{sub}</p>
                  </div>
                </button>
              ))}
            </div>

            {/* Also pick dest currency if src is rial or usdt */}
            <h2 className="text-base font-bold mb-3 text-right" style={{ color: t.text }}>
              ارز مقصد
            </h2>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {(['rial', 'usdt'] as const).map(cur => (
                <button key={cur} onClick={() => setDestCurrency(cur)}
                  className="p-3.5 rounded-2xl text-center transition-all"
                  style={{
                    background: destCurrency === cur ? 'rgba(0,200,150,0.12)' : t.surface,
                    border: `2px solid ${destCurrency === cur ? '#00c896' : t.border}`,
                  }}>
                  <p className="text-sm font-medium" style={{ color: t.text }}>
                    {cur === 'rial' ? 'ریال' : 'تتر (USDT)'}
                  </p>
                </button>
              ))}
            </div>

            <button onClick={() => setStep(2)}
              className="w-full h-14 rounded-2xl text-white font-bold text-base"
              style={{ background: 'linear-gradient(135deg, #e8512a, #c93e1a)' }}>
              ادامه
            </button>
          </>
        )}

        {/* Step 2: Destination address */}
        {step === 2 && (
          <>
            <h2 className="text-base font-bold mb-4 text-right" style={{ color: t.text }}>
              {destType === 'kelid' ? 'شماره موبایل گیرنده'
                : destType === 'card' ? 'شماره کارت گیرنده'
                : 'آدرس کیف تتر مقصد (TRC20)'}
            </h2>

            {/* Info for crypto */}
            {destType === 'crypto' && (
              <div className="flex items-start gap-2 p-3.5 rounded-xl mb-4"
                style={{ background: theme === 'dark' ? '#1a1a10' : '#fffbeb', border: '1px solid #3a3a10' }}>
                {Icons.warn()}
                <p className="text-xs text-right flex-1" style={{ color: '#c9a422' }}>
                  برای انتقال تتر به آدرس خارجی، نیازی به نصب کلید ندارد. کارمزد شبکه ۱ USDT کسر می‌شود.
                </p>
              </div>
            )}

            <div className="mb-4">
              <input
                type={destType === 'kelid' ? 'tel' : 'text'}
                value={destValue}
                onChange={e => { setDestValue(e.target.value); setKelidStatus('idle'); setWarnAccepted(false) }}
                onBlur={destType === 'kelid' ? checkKelid : undefined}
                placeholder={
                  destType === 'kelid' ? '09xxxxxxxxx'
                  : destType === 'card' ? '6219-xxxx-xxxx-xxxx'
                  : 'TJkx...'
                }
                dir={destType === 'kelid' ? 'ltr' : 'ltr'}
                className="w-full h-14 rounded-2xl px-4 text-base outline-none text-right font-mono"
                style={{
                  background: t.surface, color: t.text,
                  border: `1.5px solid ${kelidStatus === 'notfound' ? '#f7c325' : kelidStatus === 'found' ? '#00c896' : t.border}`,
                  fontFamily: 'Vazirmatn, monospace',
                }}
              />
              {kelidStatus === 'checking' && (
                <p className="text-xs mt-2 text-right" style={{ color: t.muted }}>در حال بررسی...</p>
              )}
              {kelidStatus === 'found' && (
                <div className="flex items-center justify-end gap-1.5 mt-2">
                  {Icons.check('#00c896')}
                  <p className="text-xs text-[#00c896]">کاربر کلید شناسایی شد</p>
                </div>
              )}
              {kelidStatus === 'notfound' && !warnAccepted && (
                <div className="mt-3 p-3.5 rounded-xl" style={{ background: theme === 'dark' ? '#1a1a10' : '#fffbeb', border: '1px solid #3a3a10' }}>
                  <div className="flex items-start gap-2 mb-3">
                    {Icons.warn()}
                    <p className="text-xs text-right flex-1" style={{ color: '#c9a422' }}>
                      این شماره در کلید ثبت‌نام نکرده است. می‌توانید با تایید، وجه را انتقال دهید.
                    </p>
                  </div>
                  <button onClick={() => setWarnAccepted(true)}
                    className="w-full py-2.5 rounded-xl text-sm font-medium"
                    style={{ background: '#c9a422', color: '#000' }}>
                    تایید و ادامه
                  </button>
                </div>
              )}
              {kelidStatus === 'notfound' && warnAccepted && (
                <div className="flex items-center justify-end gap-1.5 mt-2">
                  {Icons.check('#c9a422')}
                  <p className="text-xs" style={{ color: '#c9a422' }}>تایید شد - کاربر خارج از کلید</p>
                </div>
              )}
            </div>

            <button
              onClick={() => {
                if (!destValue) return
                if (destType === 'kelid' && kelidStatus === 'idle') { checkKelid(); return }
                if (destType === 'kelid' && kelidStatus === 'notfound' && !warnAccepted) return
                setStep(3)
              }}
              disabled={!destValue || (destType === 'kelid' && kelidStatus === 'notfound' && !warnAccepted)}
              className="w-full h-14 rounded-2xl text-white font-bold text-base transition-all"
              style={{
                background: (!destValue || (destType === 'kelid' && kelidStatus === 'notfound' && !warnAccepted))
                  ? (theme === 'dark' ? '#1e1e1e' : '#ddd')
                  : 'linear-gradient(135deg, #e8512a, #c93e1a)',
                color: (!destValue || (destType === 'kelid' && kelidStatus === 'notfound' && !warnAccepted)) ? t.muted : 'white',
              }}>
              ادامه
            </button>
          </>
        )}

        {/* Step 3: Amount + Fee summary */}
        {step === 3 && (
          <>
            <h2 className="text-base font-bold mb-4 text-right" style={{ color: t.text }}>مبلغ انتقال</h2>

            {/* Amount input */}
            <div className="p-5 rounded-2xl mb-4 text-center"
              style={{ background: t.surface, border: `1px solid ${t.border}` }}>
              <input
                type="number" value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="۰"
                className="w-full bg-transparent text-4xl font-bold outline-none text-center"
                style={{ color: '#00c896', fontFamily: 'Vazirmatn, sans-serif' }}
              />
              <p className="text-sm mt-1" style={{ color: t.muted }}>
                {srcCurrency === 'rial' ? 'ریال' : 'USDT'}
              </p>
            </div>

            {/* Quick amounts */}
            {srcCurrency === 'rial' ? (
              <div className="grid grid-cols-4 gap-2 mb-5">
                {['100000', '500000', '1000000', '5000000'].map(q => (
                  <button key={q} onClick={() => setAmount(q)}
                    className="py-2.5 rounded-xl text-xs font-medium transition-all"
                    style={{ background: t.surface, color: t.muted, border: `1px solid ${t.border}` }}>
                    {(Number(q) / 1000).toLocaleString('fa-IR')}K
                  </button>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-2 mb-5">
                {['10', '50', '100', '500'].map(q => (
                  <button key={q} onClick={() => setAmount(q)}
                    className="py-2.5 rounded-xl text-xs font-medium transition-all"
                    style={{ background: t.surface, color: t.muted, border: `1px solid ${t.border}` }}>
                    {q} USDT
                  </button>
                ))}
              </div>
            )}

            {/* Fee summary */}
            {amountNum > 0 && (
              <div className="p-4 rounded-2xl mb-5"
                style={{ background: theme === 'dark' ? '#1a2420' : '#e8f8f3', border: '1px solid #1e3530' }}>
                <p className="text-sm font-semibold text-right mb-3" style={{ color: '#00c896' }}>
                  خلاصه تراکنش
                </p>
                <div className="flex flex-col gap-2">
                  {fees.deductRial > 0 && (
                    <div className="flex justify-between">
                      <span className="text-[#5ba88a] text-xs">{fees.deductRial.toLocaleString('fa-IR')} ریال</span>
                      <span className="text-xs" style={{ color: t.muted }}>کسر از حساب ریالی</span>
                    </div>
                  )}
                  {fees.depositUsdt > 0 && (
                    <div className="flex justify-between">
                      <span className="text-[#5ba88a] text-xs">{fees.depositUsdt.toFixed(2)} USDT</span>
                      <span className="text-xs" style={{ color: t.muted }}>واریز به مقصد</span>
                    </div>
                  )}
                  {fees.depositRial > 0 && (
                    <div className="flex justify-between">
                      <span className="text-[#5ba88a] text-xs">{fees.depositRial.toLocaleString('fa-IR')} ریال</span>
                      <span className="text-xs" style={{ color: t.muted }}>واریز به مقصد</span>
                    </div>
                  )}
                  {fees.feeRial > 0 && (
                    <div className="flex justify-between">
                      <span className="text-[#c9a422] text-xs">{fees.feeRial.toLocaleString('fa-IR')} ریال</span>
                      <span className="text-xs" style={{ color: t.muted }}>کارمزد کلید (۰.۳٪)</span>
                    </div>
                  )}
                  {fees.feeUsdt > 0 && (
                    <div className="flex justify-between">
                      <span className="text-[#c9a422] text-xs">{fees.feeUsdt.toFixed(4)} USDT</span>
                      <span className="text-xs" style={{ color: t.muted }}>کارمزد کلید (۰.۳٪)</span>
                    </div>
                  )}
                  {fees.netFee > 0 && (
                    <div className="flex justify-between">
                      <span className="text-[#c9a422] text-xs">{fees.netFee} USDT</span>
                      <span className="text-xs" style={{ color: t.muted }}>کارمزد شبکه ترون</span>
                    </div>
                  )}
                  <div className="h-px mt-1" style={{ background: '#1e3530' }} />
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-medium text-[#00c896]">
                      نرخ تتر: {usdtPrice.toLocaleString('fa-IR')} ریال
                    </span>
                    <span className="text-xs" style={{ color: t.muted }}>قیمت لحظه‌ای (نوبیتکس)</span>
                  </div>
                </div>
              </div>
            )}

            {/* Payment ID for Kelid users */}
            {destType === 'kelid' && kelidStatus === 'found' && (
              <div className="p-4 rounded-2xl mb-5"
                style={{ background: t.surface, border: `1px solid ${t.border}` }}>
                <p className="text-xs text-right mb-1" style={{ color: t.muted }}>شناسه پرداخت (خودکار)</p>
                <p className="text-[#00c896] font-mono text-center text-lg font-bold">{paymentId}</p>
              </div>
            )}

            <button onClick={() => amountNum > 0 && setDone(true)}
              disabled={!amountNum}
              className="w-full h-14 rounded-2xl text-white font-bold text-base transition-all"
              style={{
                background: amountNum > 0 ? 'linear-gradient(135deg, #e8512a, #c93e1a)' : (theme === 'dark' ? '#1e1e1e' : '#ddd'),
                color: amountNum > 0 ? 'white' : t.muted,
              }}>
              تایید و انتقال
            </button>
          </>
        )}
      </div>

      <BottomNav active="home" onNav={onNav} theme={theme} />
    </div>
  )
}

// ─── Transactions ──────────────────────────────────────────────────────────────
function TransactionsScreen({ onNav, theme }: { onNav: (s: Screen) => void; theme: 'dark' | 'light' }) {
  const [filter, setFilter] = useState<'all' | 'in' | 'out'>('all')
  const t = useTheme(theme)
  const filtered = TRANSACTIONS.filter(tx => filter === 'all' || tx.type === filter)

  return (
    <div className="flex flex-col min-h-screen" style={{ background: t.bg }}>
      <Header title="تراکنش‌ها" onBack={() => onNav('home')} theme={theme} />
      <div className="flex gap-2 px-4 mb-4">
        {[['all', 'همه'], ['in', 'دریافتی'], ['out', 'پرداختی']].map(([k, l]) => (
          <button key={k} onClick={() => setFilter(k as typeof filter)}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all"
            style={{ background: filter === k ? '#00c896' : t.surface, color: filter === k ? 'white' : t.muted, border: `1px solid ${t.border}` }}>
            {l}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto px-4 pb-24">
        {filtered.map(tx => (
          <div key={tx.id} className="flex items-center gap-3 p-4 rounded-2xl mb-2"
            style={{ background: t.surface, border: `1px solid ${t.border}` }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: tx.type === 'in' ? 'rgba(0,200,150,0.12)' : 'rgba(232,81,42,0.12)' }}>
              {tx.type === 'in' ? Icons.receive('#00c896') : Icons.transfer('#e8512a')}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate text-right" style={{ color: t.text }}>{tx.title}</p>
              <p className="text-xs truncate text-right mt-0.5" style={{ color: t.muted }}>{tx.subtitle}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-sm font-bold" style={{ color: tx.type === 'in' ? '#00c896' : '#e8512a' }}>
                {tx.type === 'in' ? '+' : '-'}{tx.amount} {tx.currency === 'usdt' ? 'USDT' : 'ریال'}
              </p>
              <p className="text-xs" style={{ color: t.muted }}>{tx.date}</p>
            </div>
          </div>
        ))}
      </div>
      <BottomNav active="home" onNav={onNav} theme={theme} />
    </div>
  )
}

// ─── Internet ─────────────────────────────────────────────────────────────────
function InternetScreen({ onNav, theme }: { onNav: (s: Screen) => void; theme: 'dark' | 'light' }) {
  const t = useTheme(theme)
  const [tab, setTab] = useState<'direct' | 'code'>('direct')
  const [phone, setPhone] = useState('')
  const [selected, setSelected] = useState('')
  const pkgs = [
    { id: '1', name: 'ماهانه ۶ گیگ', price: '۵۲۳,۹۰۰', op: 'ایرانسل' },
    { id: '2', name: 'هفتگی ۴ گیگ', price: '۳۰۴,۴۰۰', op: 'ایرانسل' },
    { id: '3', name: 'ماهانه ۱۰ گیگ', price: '۸۵۰,۰۰۰', op: 'همراه اول' },
    { id: '4', name: 'روزانه ۱ گیگ', price: '۸۵,۰۰۰', op: 'رایتل' },
  ]
  return (
    <div className="flex flex-col min-h-screen" style={{ background: t.bg }}>
      <Header title="بسته اینترنت" onBack={() => onNav('home')} theme={theme} />
      <div className="flex mx-4 mb-5 rounded-2xl p-1" style={{ background: t.surface }}>
        {[['direct', 'شارژ مستقیم'], ['code', 'رمز شارژ']].map(([k, l]) => (
          <button key={k} onClick={() => setTab(k as typeof tab)}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all"
            style={{ background: tab === k ? '#e8512a' : 'transparent', color: tab === k ? 'white' : t.muted }}>
            {l}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto px-4 pb-28">
        <input type="tel" value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
          placeholder="شماره موبایل" dir="ltr"
          className="w-full h-13 rounded-2xl px-4 text-base outline-none text-right mb-4"
          style={{ background: t.surface, color: t.text, border: `1px solid ${t.border}`, height: '52px', fontFamily: 'Vazirmatn, sans-serif' }} />
        {pkgs.map(p => (
          <button key={p.id} onClick={() => setSelected(p.id)}
            className="w-full flex items-center justify-between p-4 rounded-2xl mb-2 transition-all"
            style={{ background: selected === p.id ? 'rgba(0,200,150,0.1)' : t.surface, border: `1.5px solid ${selected === p.id ? '#00c896' : t.border}` }}>
            <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center"
              style={{ borderColor: selected === p.id ? '#00c896' : t.sub }}>
              {selected === p.id && <div className="w-2.5 h-2.5 rounded-full bg-[#00c896]" />}
            </div>
            <div className="text-right">
              <p className="text-sm font-medium" style={{ color: t.text }}>{p.op} — {p.name}</p>
              <p className="text-xs text-[#00c896]">{p.price} ریال</p>
            </div>
          </button>
        ))}
        <button className="w-full h-14 rounded-2xl text-white font-bold mt-4"
          style={{ background: 'linear-gradient(135deg, #e8512a, #c93e1a)' }}>
          تایید و خرید
        </button>
      </div>
      <BottomNav active="home" onNav={onNav} theme={theme} />
    </div>
  )
}

// ─── Bills ────────────────────────────────────────────────────────────────────
function BillsScreen({ onNav, theme }: { onNav: (s: Screen) => void; theme: 'dark' | 'light' }) {
  const t = useTheme(theme)
  const bills = [
    { label: 'برق', icon: Icons.bill, color: '#f7c325' },
    { label: 'آب', icon: Icons.bill, color: '#5b8dee' },
    { label: 'گاز', icon: Icons.bill, color: '#e8512a' },
    { label: 'تلفن ثابت', icon: Icons.phone, color: '#00c896' },
    { label: 'اینترنت', icon: Icons.internet, color: '#a78bfa' },
    { label: 'موبایل', icon: Icons.mobile, color: '#34d399' },
  ]
  return (
    <div className="flex flex-col min-h-screen" style={{ background: t.bg }}>
      <Header title="پرداخت قبوض" onBack={() => onNav('home')} theme={theme} />
      <div className="flex-1 px-4 pb-24">
        <div className="grid grid-cols-3 gap-3 mt-2">
          {bills.map(b => (
            <button key={b.label}
              className="flex flex-col items-center gap-3 p-5 rounded-2xl transition-all active:scale-95"
              style={{ background: t.surface, border: `1px solid ${t.border}` }}>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{ background: b.color + '22' }}>
                {b.icon(b.color)}
              </div>
              <span className="text-xs font-medium" style={{ color: t.text }}>{b.label}</span>
            </button>
          ))}
        </div>
      </div>
      <BottomNav active="home" onNav={onNav} theme={theme} />
    </div>
  )
}

// ─── Add Bank Card ────────────────────────────────────────────────────────────
function AddCardScreen({ onNav, theme }: { onNav: (s: Screen) => void; theme: 'dark' | 'light' }) {
  const t = useTheme(theme)
  const [card, setCard] = useState('')
  const [name, setName] = useState('')

  const formatCard = (v: string) => v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1-').replace(/-$/, '')

  return (
    <div className="flex flex-col min-h-screen" style={{ background: t.bg }}>
      <Header title="افزودن کارت بانکی" onBack={() => onNav('home')} theme={theme} />
      <div className="px-4 pb-24 flex-1">
        {/* Card preview */}
        <div className="rounded-2xl p-5 mb-6 relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #1a3a5c, #2d6a9f)', minHeight: '160px' }}>
          <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full opacity-10 bg-white" />
          <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full opacity-10 bg-white" />
          <p className="text-white/60 text-xs mb-8">کارت بانکی</p>
          <p className="text-white font-mono text-lg tracking-widest text-center mb-4" dir="ltr">
            {card || '---- ---- ---- ----'}
          </p>
          <p className="text-white/80 text-sm text-right">{name || 'نام دارنده کارت'}</p>
        </div>
        <div className="flex flex-col gap-3">
          <div className="h-14 rounded-2xl px-4 flex items-center"
            style={{ background: t.surface, border: `1px solid ${t.border}` }}>
            <input type="tel" value={card} onChange={e => setCard(formatCard(e.target.value))}
              placeholder="شماره کارت" dir="ltr"
              className="w-full bg-transparent outline-none text-right font-mono text-base"
              style={{ color: t.text, fontFamily: 'Vazirmatn, monospace' }} />
          </div>
          <div className="h-14 rounded-2xl px-4 flex items-center"
            style={{ background: t.surface, border: `1px solid ${t.border}` }}>
            <input type="text" value={name} onChange={e => setName(e.target.value)}
              placeholder="نام صاحب کارت"
              className="w-full bg-transparent outline-none text-right text-base"
              style={{ color: t.text, fontFamily: 'Vazirmatn, sans-serif' }} />
          </div>
          <button className="w-full h-14 rounded-2xl text-white font-bold mt-2"
            style={{ background: 'linear-gradient(135deg, #e8512a, #c93e1a)' }}>
            افزودن کارت
          </button>
        </div>
      </div>
      <BottomNav active="home" onNav={onNav} theme={theme} />
    </div>
  )
}

// ─── Settings ──────────────────────────────────────────────────────────────────
function SettingsScreen({
  onNav, theme, setTheme, notif, setNotif
}: { onNav: (s: Screen) => void; theme: 'dark' | 'light'; setTheme: (t: 'dark' | 'light') => void; notif: boolean; setNotif: (v: boolean) => void }) {
  const t = useTheme(theme)

  const Toggle = ({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) => (
    <button onClick={() => onChange(!value)}
      className="w-12 h-6 rounded-full transition-all relative flex-shrink-0"
      style={{ background: value ? '#00c896' : (theme === 'dark' ? '#333' : '#ccc') }}>
      <div className="w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all"
        style={{ left: value ? '26px' : '2px', boxShadow: '0 1px 4px rgba(0,0,0,0.3)' }} />
    </button>
  )

  const Row = ({ label: lbl, sub, value, onChange, icon }: { label: string; sub: string; value: boolean; onChange: (v: boolean) => void; icon: React.ReactNode }) => (
    <div className="flex items-center justify-between px-4 py-4">
      <Toggle value={value} onChange={onChange} />
      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-sm font-medium" style={{ color: t.text }}>{lbl}</p>
          <p className="text-xs" style={{ color: t.muted }}>{sub}</p>
        </div>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: theme === 'dark' ? '#2a2a2a' : '#f0f0f0' }}>{icon}</div>
      </div>
    </div>
  )

  return (
    <div className="flex flex-col min-h-screen" style={{ background: t.bg }}>
      <Header title="تنظیمات" onBack={() => onNav('home')} theme={theme} />
      <div className="flex-1 overflow-y-auto px-4 pb-24">
        <p className="text-xs font-medium mb-2 text-right" style={{ color: t.muted }}>ظاهر</p>
        <div className="rounded-2xl overflow-hidden mb-4" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
          <Row label="تم تاریک" sub={theme === 'dark' ? 'فعال' : 'غیرفعال'}
            value={theme === 'dark'} onChange={v => setTheme(v ? 'dark' : 'light')}
            icon={<span style={{ fontSize: '18px' }}>{theme === 'dark' ? '🌙' : '☀️'}</span>} />
        </div>
        <p className="text-xs font-medium mb-2 text-right" style={{ color: t.muted }}>اعلان‌ها</p>
        <div className="rounded-2xl overflow-hidden mb-4" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
          <Row label="اعلان‌های تراکنش" sub={notif ? 'فعال' : 'غیرفعال'} value={notif} onChange={setNotif}
            icon={Icons.bell(t.muted)} />
          <div className="h-px mx-4" style={{ background: t.border }} />
          <Row label="اعلان‌های سیستمی" sub={notif ? 'فعال' : 'غیرفعال'} value={notif} onChange={setNotif}
            icon={Icons.bell(t.muted)} />
        </div>
        <p className="text-xs font-medium mb-2 text-right" style={{ color: t.muted }}>امنیت</p>
        <div className="rounded-2xl overflow-hidden" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
          {[{ label: 'رمز عبور', sub: 'تغییر رمز عبور', icon: Icons.shield(t.muted) },
            { label: 'احراز هویت دو مرحله‌ای', sub: 'غیرفعال', icon: Icons.shield(t.muted) }].map((item, i) => (
            <div key={item.label}>
              {i > 0 && <div className="h-px mx-4" style={{ background: t.border }} />}
              <button className="w-full flex items-center justify-end gap-3 px-4 py-4">
                <div className="text-right">
                  <p className="text-sm font-medium" style={{ color: t.text }}>{item.label}</p>
                  <p className="text-xs" style={{ color: t.muted }}>{item.sub}</p>
                </div>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: theme === 'dark' ? '#2a2a2a' : '#f0f0f0' }}>{item.icon}</div>
                {Icons.arrowLeft(t.muted)}
              </button>
            </div>
          ))}
        </div>
      </div>
      <BottomNav active="settings" onNav={onNav} theme={theme} />
    </div>
  )
}

// ─── Contact ──────────────────────────────────────────────────────────────────
function ContactScreen({ onNav, theme }: { onNav: (s: Screen) => void; theme: 'dark' | 'light' }) {
  const t = useTheme(theme)
  return (
    <div className="flex flex-col min-h-screen" style={{ background: t.bg }}>
      <Header title="تماس با ما" onBack={() => onNav('home')} theme={theme} />
      <div className="flex-1 px-4 pb-24">
        <div className="flex flex-col items-center py-8 mb-6">
          <div className="w-20 h-20 rounded-3xl flex items-center justify-center mb-4"
            style={{ background: 'linear-gradient(135deg, #00c896, #007a5e)' }}>
            {Icons.key(40, 'white')}
          </div>
          <h2 className="text-xl font-bold mb-1" style={{ color: t.text }}>کلید</h2>
          <p className="text-sm" style={{ color: t.muted }}>پشتیبانی ۲۴ ساعته</p>
        </div>
        {[
          { label: 'تلفن پشتیبانی', value: '۰۲۱-۱۲۳۴-۵۶۷۸', icon: Icons.phone(t.muted) },
          { label: 'ایمیل', value: 'support@kelid.app', icon: Icons.info(t.muted) },
          { label: 'تلگرام', value: '@KelidSupport', icon: Icons.mobile(t.muted) },
        ].map(c => (
          <div key={c.label} className="flex items-center justify-between p-4 rounded-2xl mb-3"
            style={{ background: t.surface, border: `1px solid ${t.border}` }}>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: theme === 'dark' ? '#2a2a2a' : '#f0f0f0' }}>
              {c.icon}
            </div>
            <div className="text-right">
              <p className="text-xs" style={{ color: t.muted }}>{c.label}</p>
              <p className="text-sm font-medium" style={{ color: t.text }} dir="ltr">{c.value}</p>
            </div>
          </div>
        ))}
      </div>
      <BottomNav active="contact" onNav={onNav} theme={theme} />
    </div>
  )
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState<Screen>('splash')
  const [phone, setPhone] = useState('')
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const [notif, setNotif] = useState(true)
  const [usdtPrice, setUsdtPrice] = useState(75000000) // 75,000 Tomans in Rials (mock)

  useEffect(() => {
    // Try to fetch USDT price from Nobitex
    fetch('https://api.nobitex.ir/market/stats?srcCurrency=usdt&dstCurrency=rls')
      .then(r => r.json())
      .then(d => {
        const price = d?.stats?.['usdt-rls']?.lastTradePrice
        if (price) setUsdtPrice(parseFloat(price))
      })
      .catch(() => {})
  }, [])

  const nav = (s: Screen) => setScreen(s)

  return (
    <div className="max-w-sm mx-auto relative" style={{ minHeight: '100vh', overflow: 'hidden' }}>
      {screen === 'splash' && <SplashScreen onDone={() => nav('login')} />}
      {screen === 'login' && <LoginScreen onLogin={p => { setPhone(p); nav('otp') }} />}
      {screen === 'otp' && <OtpScreen phone={phone} onVerify={() => nav('home')} />}
      {screen === 'home' && <HomeScreen phone={phone || '09137654321'} onNav={nav} theme={theme} notif={notif} />}
      {screen === 'transfer' && <TransferScreen onNav={nav} theme={theme} usdtPrice={usdtPrice} />}
      {screen === 'receive' && <ReceiveScreen phone={phone || '09137654321'} onNav={nav} theme={theme} />}
      {screen === 'transactions' && <TransactionsScreen onNav={nav} theme={theme} />}
      {screen === 'internet' && <InternetScreen onNav={nav} theme={theme} />}
      {screen === 'bills' && <BillsScreen onNav={nav} theme={theme} />}
      {screen === 'settings' && <SettingsScreen onNav={nav} theme={theme} setTheme={setTheme} notif={notif} setNotif={setNotif} />}
      {screen === 'addcard' && <AddCardScreen onNav={nav} theme={theme} />}
      {screen === 'contact' && <ContactScreen onNav={nav} theme={theme} />}
    </div>
  )
}
