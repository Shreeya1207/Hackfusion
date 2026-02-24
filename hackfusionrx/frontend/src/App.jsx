import { useState, useRef, useEffect, useCallback } from 'react';
import axios from 'axios';

const API = 'http://localhost:3001/api';

// ─── Icons ─────────────────────────────────────────────────────────────────────
const Icon = {
  Mic: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" /></svg>,
  MicOff: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="1" y1="1" x2="23" y2="23" /><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" /><path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" /></svg>,
  Send: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>,
  Check: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>,
  Alert: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>,
  Dashboard: () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>,
  Inventory: () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /></svg>,
  Customers: () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>,
  Reports: () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>,
  Bot: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="10" rx="2" /><circle cx="12" cy="5" r="2" /><path d="M12 7v4" /><line x1="8" y1="16" x2="8" y2="16" /><line x1="16" y1="16" x2="16" y2="16" /></svg>,
  Bell: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>,
  Logout: () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>,
  Pill: () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z" /><path d="m8.5 8.5 7 7" /></svg>,
  AI: () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2M7.5 13a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3m9 0a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3" /></svg>,
  UserPlus: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" /><line x1="20" y1="8" x2="20" y2="14" /><line x1="23" y1="11" x2="17" y2="11" /></svg>,
  ArrowRight: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>,
};

// ─── Countdown Bar ──────────────────────────────────────────────────────────────
function CountdownBar({ seconds, total, label, color = '#2563eb' }) {
  const pct = (seconds / total) * 100;
  return (
    <div style={{ marginTop: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#64748b', marginBottom: 4 }}>
        <span>{label}</span>
        <span style={{ fontWeight: 700, color }}>{seconds}s</span>
      </div>
      <div style={{ height: 4, background: '#e2e8f0', borderRadius: 2, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 2, transition: 'width 1s linear' }} />
      </div>
    </div>
  );
}

// ─── Voice Input Hook ───────────────────────────────────────────────────────────
function useVoiceInput(onResult) {
  const [recording, setRecording] = useState(false);
  const recognitionRef = useRef(null);
  const silenceRef = useRef(null);

  const start = (fieldHint = '') => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { alert('Use Chrome or Edge for voice input.'); return; }
    const r = new SR();
    r.continuous = true;
    r.interimResults = true;
    r.lang = 'en-US';
    r.onresult = (e) => {
      const text = Array.from(e.results).map(x => x[0].transcript).join('');
      onResult(text, fieldHint);
      if (silenceRef.current) clearTimeout(silenceRef.current);
      silenceRef.current = setTimeout(() => stop(), 2000);
    };
    r.onerror = () => stop();
    r.onend = () => setRecording(false);
    r.start();
    recognitionRef.current = r;
    setRecording(true);
  };

  const stop = () => {
    if (silenceRef.current) clearTimeout(silenceRef.current);
    recognitionRef.current?.stop();
    setRecording(false);
  };

  return { recording, start, stop };
}

// ─── New Patient Registration Page ─────────────────────────────────────────────
function NewPatientPage({ detectedName, onPatientCreated, onSkip }) {
  const [form, setForm] = useState({
    name: detectedName || '',
    age: '',
    gender: '',
    phone: '',
    allergies: 'None',
    email: ''
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [error, setError] = useState('');
  const [voiceInput, setVoiceInput] = useState('');
  const [recording, setRecording] = useState(false);
  const [parsing, setParsing] = useState(false);
  const timerRef = useRef(null);
  const recognitionRef = useRef(null);
  const silenceRef = useRef(null);

  useEffect(() => {
    if (saved) setCountdown(5);
  }, [saved]);

  useEffect(() => {
    if (countdown === null) return;
    if (countdown === 0) { onPatientCreated(); return; }
    timerRef.current = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(timerRef.current);
  }, [countdown]);

  // Parse voice transcript and fill form fields automatically
  const parseAndFill = (text) => {
    setParsing(true);
    const t = text.toLowerCase();

    // Extract age
    const ageMatch = t.match(/age\s+(\d+)|(\d+)\s+years?\s+old/);
    if (ageMatch) setForm(f => ({ ...f, age: ageMatch[1] || ageMatch[2] }));

    // Extract gender
    if (t.includes('female') || t.includes('woman') || t.includes('girl')) setForm(f => ({ ...f, gender: 'Female' }));
    else if (t.includes('male') || t.includes('man') || t.includes('boy')) setForm(f => ({ ...f, gender: 'Male' }));

    // Extract phone (any sequence of 7-15 digits, possibly with spaces/dashes)
    const phoneMatch = text.match(/(?:phone|number|contact|mobile)[\s:]+([0-9\s\-\+]{7,15})/i)
      || text.match(/\b([0-9]{10,15})\b/)
      || text.match(/\b([0-9]{3}[\s\-][0-9]{3,4}[\s\-][0-9]{4})\b/);
    if (phoneMatch) setForm(f => ({ ...f, phone: phoneMatch[1].trim() }));

    // Extract email
    const emailMatch = text.match(/[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/);
    if (emailMatch) setForm(f => ({ ...f, email: emailMatch[0] }));

    // Extract allergies
    const allergyMatch = t.match(/allerg(?:y|ies|ic)\s+(?:to\s+)?([^,\.]+)/i)
      || t.match(/(?:no\s+allergies|none)/i);
    if (allergyMatch) {
      const val = allergyMatch[0].toLowerCase().includes('no allerg') || allergyMatch[0].toLowerCase() === 'none'
        ? 'None' : allergyMatch[1]?.trim() || 'None';
      setForm(f => ({ ...f, allergies: val }));
    }

    setParsing(false);
  };

  const startRecording = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { alert('Use Chrome or Edge for voice input.'); return; }
    const r = new SR();
    r.continuous = true; r.interimResults = true; r.lang = 'en-US';
    r.onresult = (e) => {
      const text = Array.from(e.results).map(x => x[0].transcript).join('');
      setVoiceInput(text);
      if (silenceRef.current) clearTimeout(silenceRef.current);
      silenceRef.current = setTimeout(() => {
        stopRecording();
        parseAndFill(text);
      }, 2000);
    };
    r.onerror = () => stopRecording();
    r.onend = () => setRecording(false);
    r.start();
    recognitionRef.current = r;
    setRecording(true);
  };

  const stopRecording = () => {
    if (silenceRef.current) clearTimeout(silenceRef.current);
    recognitionRef.current?.stop();
    setRecording(false);
  };

  // Auto-start recording when page opens
  useEffect(() => {
    const timer = setTimeout(() => startRecording(), 800);
    return () => { clearTimeout(timer); recognitionRef.current?.stop(); };
  }, []);

  const handleSubmit = async () => {
    if (!form.name.trim()) { setError('Name is required.'); return; }
    setSaving(true); setError('');
    try {
      await axios.post(`${API}/customers`, {
        name: form.name.trim(),
        phone: form.phone.trim(),
        allergies: form.allergies.trim() || 'None',
        email: form.email.trim(),
        age: form.age,
        gender: form.gender,
        last_visit: new Date().toISOString().split('T')[0]
      });
      setSaved(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save patient. Check backend is running.');
    }
    setSaving(false);
  };

  const inputStyle = { width: '100%', padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14, outline: 'none', color: '#0f172a', background: '#fff', boxSizing: 'border-box' };
  const labelStyle = { fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6, display: 'block' };

  return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9', padding: 24 }}>
      <div style={{ background: '#fff', borderRadius: 16, padding: 36, width: '100%', maxWidth: 520, boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb' }}>
            <Icon.UserPlus />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>New Patient Registration</h2>
            <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>Patient not found · Use voice or type details below</p>
          </div>
        </div>

        {/* Detected name banner */}
        {detectedName && !saved && (
          <div style={{ background: '#fef3c7', border: '1px solid #fde68a', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: '#92400e', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Icon.Alert /> Detected name: <strong>{detectedName}</strong>
          </div>
        )}

        {!saved ? (
          <>
            {/* Single voice input bar */}
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: 14, marginBottom: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                🎤 Voice Input — Say everything at once
              </div>
              <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 10 }}>
                Example: <em>"age 28 female phone 9876543210 allergies penicillin"</em>
              </div>

              {/* Voice transcript display */}
              <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, padding: '8px 12px', minHeight: 36, fontSize: 13, color: voiceInput ? '#0f172a' : '#94a3b8', marginBottom: 10, fontStyle: voiceInput ? 'normal' : 'italic' }}>
                {voiceInput || (recording ? '🎤 Listening...' : 'Waiting for voice input...')}
              </div>

              {/* Single mic button */}
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  onClick={recording ? stopRecording : startRecording}
                  style={{
                    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    background: recording ? '#fee2e2' : '#2563eb',
                    color: recording ? '#dc2626' : '#fff',
                    border: recording ? '1px solid #fca5a5' : 'none',
                    borderRadius: 8, padding: '10px 0', fontWeight: 600, fontSize: 14, cursor: 'pointer'
                  }}
                >
                  {recording ? <><Icon.MicOff /> Stop Recording</> : <><Icon.Mic /> Start Voice Input</>}
                </button>
                {voiceInput && (
                  <button onClick={() => setVoiceInput('')} style={{ background: '#f1f5f9', color: '#64748b', border: '1px solid #e2e8f0', borderRadius: 8, padding: '10px 14px', fontSize: 13, cursor: 'pointer' }}>
                    Clear
                  </button>
                )}
              </div>

              {parsing && (
                <div style={{ marginTop: 8, fontSize: 12, color: '#2563eb', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 12, height: 12, border: '2px solid #bfdbfe', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                  Auto-filling fields...
                </div>
              )}

              {recording && (
                <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#dc2626' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#dc2626' }} />
                  Recording... auto-submits after 2s of silence
                </div>
              )}
            </div>

            {/* Form fields (auto-filled by voice, also editable) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>Full Name *</label>
                <input style={inputStyle} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Sarah Collins" />
              </div>
              <div>
                <label style={labelStyle}>Age</label>
                <input style={inputStyle} type="number" value={form.age} onChange={e => setForm(f => ({ ...f, age: e.target.value }))} placeholder="e.g. 32" />
              </div>
              <div>
                <label style={labelStyle}>Gender</label>
                <select style={inputStyle} value={form.gender} onChange={e => setForm(f => ({ ...f, gender: e.target.value }))}>
                  <option value="">Select gender</option>
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Phone Number</label>
                <input style={inputStyle} value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="e.g. 555-0101" />
              </div>
              <div>
                <label style={labelStyle}>Email</label>
                <input style={inputStyle} value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="e.g. sarah@email.com" />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>Known Allergies</label>
                <input style={inputStyle} value={form.allergies} onChange={e => setForm(f => ({ ...f, allergies: e.target.value }))} placeholder="e.g. Penicillin (or None)" />
              </div>
            </div>

            {error && (
              <div style={{ background: '#fef2f2', color: '#dc2626', padding: '10px 14px', borderRadius: 8, fontSize: 13, marginBottom: 16, border: '1px solid #fecaca' }}>
                ❌ {error}
              </div>
            )}

            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={handleSubmit} disabled={saving} style={{ flex: 1, background: saving ? '#94a3b8' : '#2563eb', color: '#fff', border: 'none', borderRadius: 8, padding: '12px 0', fontWeight: 700, fontSize: 15, cursor: saving ? 'not-allowed' : 'pointer' }}>
                {saving ? '⏳ Saving...' : '✅ Register Patient'}
              </button>
              <button onClick={onSkip} style={{ background: '#f8fafc', color: '#64748b', border: '1px solid #e2e8f0', borderRadius: 8, padding: '12px 20px', fontWeight: 500, fontSize: 14, cursor: 'pointer' }}>
                Skip
              </button>
            </div>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: '#16a34a' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
            </div>
            <h3 style={{ margin: '0 0 8px', fontSize: 20, fontWeight: 700, color: '#16a34a' }}>Patient Registered!</h3>
            <p style={{ color: '#475569', fontSize: 14, margin: '0 0 4px' }}><strong>{form.name}</strong> has been added to the database.</p>
            <p style={{ color: '#64748b', fontSize: 13, margin: 0 }}>Redirecting to prescription assistant...</p>
            <CountdownBar seconds={countdown} total={5} label="Redirecting in" color="#16a34a" />
            <button onClick={onPatientCreated} style={{ marginTop: 20, background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 28px', fontWeight: 600, fontSize: 14, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              Go Now <Icon.ArrowRight />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Prescription Card ──────────────────────────────────────────────────────────
function PrescriptionCard({ data, onCreateOrder, onFindAlternatives, orderCreated }) {
  const { patient_name, medicines = [], order_date, order_time, grand_total } = data || {};
  if (!data) return null;
  const hasAnyMedicine = medicines.some(m => m.medicine);

  return (
    <div className="fade-in" style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: 20, maxWidth: 620, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
      <p style={{ color: '#475569', fontSize: 13, marginBottom: 14 }}>I've extracted the prescription details and cross-referenced inventory.</p>
      <div style={{ background: '#f8fafc', borderRadius: 10, padding: '10px 16px', marginBottom: 14, border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 }}>
        <div><span style={{ color: '#64748b' }}>Patient: </span><strong>{patient_name}</strong></div>
        <div style={{ color: '#64748b', fontSize: 12 }}>{order_date} · {order_time}</div>
      </div>
      {medicines.length > 0 ? (
        <div style={{ border: '1px solid #e2e8f0', borderRadius: 10, overflow: 'hidden', marginBottom: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr', background: '#1e293b', padding: '10px 14px', gap: 8 }}>
            {['Medicine', 'Dosage', 'Freq', 'Days', 'Qty', 'Subtotal'].map(h => (
              <div key={h} style={{ color: '#94a3b8', fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}>{h}</div>
            ))}
          </div>
          {medicines.map((med, i) => (
            <div key={i}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr', padding: '11px 14px', gap: 8, background: i % 2 === 0 ? '#fff' : '#fafafa', borderTop: '1px solid #f1f5f9', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{med.medicine_name}</div>
                  {med.medicine ? (
                    <span style={{ fontSize: 10, fontWeight: 700, background: med.stock_status?.sufficient ? '#dcfce7' : '#fee2e2', color: med.stock_status?.sufficient ? '#16a34a' : '#dc2626', padding: '1px 6px', borderRadius: 20, marginTop: 3, display: 'inline-block' }}>
                      {med.stock_status?.sufficient ? `✓ ${med.medicine.stock} in stock` : `⚠ Only ${med.medicine.stock} left`}
                    </span>
                  ) : (
                    <span style={{ fontSize: 10, fontWeight: 700, background: '#fef3c7', color: '#92400e', padding: '1px 6px', borderRadius: 20, marginTop: 3, display: 'inline-block' }}>Not in DB</span>
                  )}
                </div>
                <div style={{ fontSize: 13, color: '#475569' }}>{med.dosage}</div>
                <div style={{ fontSize: 13, color: '#475569' }}>{med.frequency}</div>
                <div style={{ fontSize: 13, color: '#475569' }}>{med.days}d</div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{med.quantity}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: med.total_price ? '#16a34a' : '#94a3b8' }}>{med.total_price ? `$${med.total_price}` : '—'}</div>
              </div>
              {med.medicine && !med.stock_status?.sufficient && (
                <div style={{ background: '#fef2f2', padding: '5px 14px', display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#dc2626', borderTop: '1px solid #fee2e2' }}>
                  <Icon.Alert /> Shortage of {med.stock_status.shortage} pills
                </div>
              )}
            </div>
          ))}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr', padding: '12px 14px', gap: 8, background: '#f8fafc', borderTop: '2px solid #e2e8f0' }}>
            <div style={{ gridColumn: '1 / 6', fontWeight: 700, fontSize: 14 }}>Grand Total ({medicines.length} medicine{medicines.length > 1 ? 's' : ''})</div>
            <div style={{ fontWeight: 800, fontSize: 16, color: '#2563eb' }}>${grand_total}</div>
          </div>
        </div>
      ) : (
        <div style={{ background: '#fef3c7', borderRadius: 10, padding: 14, marginBottom: 14, color: '#92400e', fontSize: 13 }}>⚠️ Could not extract medicine details. Please try again.</div>
      )}
      {!orderCreated ? (
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onCreateOrder} disabled={!hasAnyMedicine} style={{ background: hasAnyMedicine ? '#2563eb' : '#94a3b8', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 22px', cursor: hasAnyMedicine ? 'pointer' : 'not-allowed', fontWeight: 600, fontSize: 14 }}>Create Order</button>
          <button onClick={onFindAlternatives} style={{ background: '#f8fafc', color: '#374151', border: '1px solid #e2e8f0', borderRadius: 8, padding: '10px 22px', cursor: 'pointer', fontWeight: 500, fontSize: 14 }}>Find Alternatives</button>
        </div>
      ) : (
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '10px 14px', color: '#16a34a', fontWeight: 600, fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Icon.Check /> Order created successfully!
        </div>
      )}
    </div>
  );
}

// ─── Live Context Panel ─────────────────────────────────────────────────────────
function LiveContextPanel({ extractedData, loading, onRegisterNewPatient, countdown }) {
  const { customer, medicines = [], patient_name } = extractedData || {};
  return (
    <div style={{ width: 300, borderLeft: '1px solid #e2e8f0', background: '#fff', overflowY: 'auto', flexShrink: 0, padding: 20 }}>
      <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>Live Context</h3>
      <p style={{ color: '#64748b', fontSize: 12, marginBottom: 20, lineHeight: 1.5 }}>This pane updates automatically as the AI processes text/voice input.</p>
      {loading && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#64748b', fontSize: 13 }}>
          <div style={{ width: 16, height: 16, border: '2px solid #e2e8f0', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          Processing with Ollama AI...
        </div>
      )}
      {!loading && extractedData && (
        <>
          <div style={{ background: '#f8fafc', borderRadius: 10, padding: 14, marginBottom: 14, border: '1px solid #f1f5f9' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', letterSpacing: 1.2, marginBottom: 10, textTransform: 'uppercase' }}>Customer Found</div>
            {customer ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#dbeafe', color: '#1d4ed8', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>{customer.name.charAt(0)}</div>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{customer.name}</div>
                </div>
                {customer.allergies && customer.allergies !== 'None' ? (
                  <div style={{ fontSize: 12, color: '#dc2626', marginBottom: 4 }}>⚠️ Allergies: {customer.allergies}</div>
                ) : (
                  <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>No known allergies.</div>
                )}
                {customer.last_visit && <div style={{ fontSize: 12, color: '#64748b' }}>Last visit: {new Date(customer.last_visit).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}</div>}
                {customer.phone && <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>📞 {customer.phone}</div>}
              </>
            ) : (
              <div>
                <div style={{ fontSize: 13, color: '#dc2626', fontWeight: 600, marginBottom: 8 }}>❌ "{patient_name}" not in database</div>
                <div style={{ fontSize: 12, color: '#64748b', marginBottom: 10 }}>This patient needs to be registered.</div>
                <button onClick={() => onRegisterNewPatient(patient_name)} style={{ width: '100%', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  <Icon.UserPlus /> Register New Patient
                </button>
                {countdown !== null && <CountdownBar seconds={countdown} total={5} label="Auto-redirecting in" color="#dc2626" />}
              </div>
            )}
          </div>
          <div style={{ background: '#f8fafc', borderRadius: 10, padding: 14, border: '1px solid #f1f5f9' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', letterSpacing: 1.2, marginBottom: 10, textTransform: 'uppercase' }}>Medicine Validation ({medicines.length})</div>
            {medicines.length === 0 ? <div style={{ fontSize: 13, color: '#f59e0b' }}>⚠️ No medicines detected.</div> : (
              medicines.map((med, i) => (
                <div key={i} style={{ marginBottom: i < medicines.length - 1 ? 12 : 0, paddingBottom: i < medicines.length - 1 ? 12 : 0, borderBottom: i < medicines.length - 1 ? '1px solid #e2e8f0' : 'none' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <div style={{ fontWeight: 700, fontSize: 13 }}>{med.medicine_name}</div>
                    {med.medicine && <span style={{ background: med.stock_status?.sufficient ? '#dcfce7' : '#fee2e2', color: med.stock_status?.sufficient ? '#16a34a' : '#dc2626', fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 20 }}>{med.stock_status?.sufficient ? 'OK' : `LOW (${med.medicine.stock})`}</span>}
                  </div>
                  {med.medicine ? (
                    <div style={{ fontSize: 11, color: '#64748b' }}>${med.medicine.price}/pill · {med.medicine.category}<br />Qty: {med.quantity} · Subtotal: ${med.total_price}</div>
                  ) : (
                    <div style={{ fontSize: 11, color: '#f59e0b' }}>Not found in database</div>
                  )}
                </div>
              ))
            )}
          </div>
        </>
      )}
      {!loading && !extractedData && <div style={{ color: '#94a3b8', fontSize: 13, fontStyle: 'italic', textAlign: 'center', marginTop: 40 }}>Waiting for input...</div>}
    </div>
  );
}

// ─── Ollama Banner ──────────────────────────────────────────────────────────────
function OllamaStatusBanner({ status }) {
  if (!status || status.ok) return null;
  return (
    <div style={{ background: '#fef2f2', borderBottom: '1px solid #fecaca', padding: '10px 24px', fontSize: 13, color: '#dc2626', display: 'flex', alignItems: 'center', gap: 10 }}>
      <Icon.Alert />
      <span><strong>Ollama not detected.</strong> Run: <code style={{ background: '#fee2e2', padding: '2px 6px', borderRadius: 4 }}>ollama serve</code> then <code style={{ background: '#fee2e2', padding: '2px 6px', borderRadius: 4 }}>ollama pull llama3.2</code></span>
    </div>
  );
}

// ─── Purchase History ───────────────────────────────────────────────────────────
function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { axios.get(`${API}/purchase-history`).then(r => { setHistory(r.data); setLoading(false); }); }, []);
  return (
    <div style={{ padding: 24, overflowY: 'auto', flex: 1 }}>
      <h2 style={{ marginBottom: 20, fontSize: 22, fontWeight: 700 }}>Purchase History</h2>
      {loading ? <div style={{ color: '#64748b' }}>Loading...</div> : history.length === 0 ? <div style={{ color: '#94a3b8' }}>No orders yet.</div> : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                {['Order #', 'Patient', 'Medicine', 'Qty', 'Dosage', 'Price', 'Date', 'Time', 'Status'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'left', color: '#64748b', fontWeight: 600, whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {history.map((row, i) => (
                <tr key={row.id} style={{ background: i % 2 === 0 ? '#fff' : '#fafafa', borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '10px 14px', color: '#2563eb', fontWeight: 600 }}>#{row.id}</td>
                  <td style={{ padding: '10px 14px' }}>{row.customer_name}</td>
                  <td style={{ padding: '10px 14px', fontWeight: 500 }}>{row.medicine_name}</td>
                  <td style={{ padding: '10px 14px' }}>{row.quantity}</td>
                  <td style={{ padding: '10px 14px', color: '#64748b' }}>{row.dosage}</td>
                  <td style={{ padding: '10px 14px', fontWeight: 600, color: '#16a34a' }}>${row.total_price}</td>
                  <td style={{ padding: '10px 14px', color: '#64748b', whiteSpace: 'nowrap' }}>{row.order_date}</td>
                  <td style={{ padding: '10px 14px', color: '#64748b' }}>{row.order_time}</td>
                  <td style={{ padding: '10px 14px' }}><span style={{ background: '#dcfce7', color: '#16a34a', padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600 }}>{row.status || 'Completed'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Customers Page ─────────────────────────────────────────────────────────────
function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { axios.get(`${API}/customers`).then(r => { setCustomers(r.data); setLoading(false); }); }, []);
  return (
    <div style={{ padding: 24, overflowY: 'auto', flex: 1 }}>
      <h2 style={{ marginBottom: 20, fontSize: 22, fontWeight: 700 }}>Customers</h2>
      {loading ? <div style={{ color: '#64748b' }}>Loading...</div> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
          {customers.map(c => (
            <div key={c.id} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 18 }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#dbeafe', color: '#1d4ed8', fontWeight: 700, fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>{c.name.charAt(0)}</div>
              <div style={{ fontWeight: 700, marginBottom: 4 }}>{c.name}</div>
              <div style={{ fontSize: 12, color: '#64748b', marginBottom: 2 }}>📞 {c.phone}</div>
              {c.allergies !== 'None' && <div style={{ fontSize: 12, color: '#dc2626', marginBottom: 2 }}>⚠️ Allergies: {c.allergies}</div>}
              {c.last_visit && <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 6 }}>Last visit: {new Date(c.last_visit).toLocaleDateString()}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Inventory Page ─────────────────────────────────────────────────────────────
function InventoryPage() {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { axios.get(`${API}/medicines`).then(r => { setMedicines(r.data); setLoading(false); }); }, []);
  return (
    <div style={{ padding: 24, overflowY: 'auto', flex: 1 }}>
      <h2 style={{ marginBottom: 20, fontSize: 22, fontWeight: 700 }}>Inventory</h2>
      {loading ? <div style={{ color: '#64748b' }}>Loading...</div> : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                {['Medicine', 'Generic Name', 'Category', 'Dosage', 'Price/Unit', 'Stock', 'Status'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'left', color: '#64748b', fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {medicines.map((m, i) => {
                const isLow = m.stock < m.min_stock;
                return (
                  <tr key={m.id} style={{ background: i % 2 === 0 ? '#fff' : '#fafafa', borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '10px 14px', fontWeight: 600 }}>{m.name}</td>
                    <td style={{ padding: '10px 14px', color: '#64748b' }}>{m.generic_name}</td>
                    <td style={{ padding: '10px 14px' }}><span style={{ background: '#f1f5f9', padding: '2px 8px', borderRadius: 20, fontSize: 11 }}>{m.category}</span></td>
                    <td style={{ padding: '10px 14px', color: '#64748b' }}>{m.dosage}</td>
                    <td style={{ padding: '10px 14px', fontWeight: 600 }}>${m.price}</td>
                    <td style={{ padding: '10px 14px', fontWeight: 700, color: isLow ? '#dc2626' : '#0f172a' }}>{m.stock}</td>
                    <td style={{ padding: '10px 14px' }}><span style={{ background: isLow ? '#fee2e2' : '#dcfce7', color: isLow ? '#dc2626' : '#16a34a', padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600 }}>{isLow ? 'LOW STOCK' : 'In Stock'}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}


// ─── AI Assistant Page (Guided Flow) ───────────────────────────────────────────
function AssistantPage({ ollamaStatus, onNavigateToRegister, autoStartMic }) {
  // Flow steps: 'name' → 'medicines' 
  const [step, setStep] = useState('name');
  const [messages, setMessages] = useState([{
    id: 1, role: 'assistant', type: 'text',
    text: '👋 Welcome! Please say or type the patient\'s full name to get started.'
  }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [liveData, setLiveData] = useState(null);
  const [liveLoading, setLiveLoading] = useState(false);
  const [orderCreatedIds, setOrderCreatedIds] = useState(new Set());
  const [patientContext, setPatientContext] = useState(null); // found customer

  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const silenceTimerRef = useRef(null);
  const msgIdRef = useRef(2);
  const autoStarted = useRef(false);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  // Auto-start mic when page loads or when autoStartMic prop changes
  useEffect(() => {
    if (!autoStarted.current) {
      autoStarted.current = true;
      setTimeout(() => startRecording(), 600);
    }
  }, []);

  // If coming back from registration, auto-start mic for medicines
  useEffect(() => {
    if (autoStartMic && step === 'medicines') {
      setTimeout(() => startRecording(), 600);
    }
  }, [autoStartMic, step]);

  const addMessage = (msg) => {
    const id = msgIdRef.current++;
    setMessages(m => [...m, { id, ...msg }]);
    return id;
  };

  // ── Step 1: Look up patient name ──────────────────────────────────────────────
  const lookupPatient = useCallback(async (text) => {
    if (!text.trim() || loading) return;
    addMessage({ role: 'user', type: 'text', text: text.trim() });
    setInput('');
    setLoading(true);

    try {
      const res = await axios.get(`${API}/customers`);
      const all = res.data;
      const nameLower = text.trim().toLowerCase();
      let found = all.find(c => c.name.toLowerCase() === nameLower);
      if (!found) found = all.find(c => {
        const cp = c.name.toLowerCase().split(' ');
        const np = nameLower.split(' ');
        return np.every(p => cp.some(cp2 => cp2.includes(p) || p.includes(cp2)));
      });
      if (!found) found = all.find(c => c.name.toLowerCase().startsWith(nameLower.split(' ')[0]));

      if (found) {
        setPatientContext(found);
        setStep('medicines');
        addMessage({
          role: 'assistant', type: 'text',
          text: `✅ Patient found: **${found.name}**${found.allergies && found.allergies !== 'None' ? `\n⚠️ Allergies: ${found.allergies}` : ''}\n\nNow please say the medicines needed.\n\nExample: "Amoxicillin 250mg 1 pill 3 times a day for 7 days"`
        });
        // Auto-start mic for medicine input
        setTimeout(() => startRecording(), 800);
      } else {
        addMessage({
          role: 'assistant', type: 'text',
          text: `❌ Patient "${text.trim()}" not found in database.\n\nRedirecting to registration in 3 seconds...`
        });
        setTimeout(() => onNavigateToRegister(text.trim()), 3000);
      }
    } catch (err) {
      addMessage({ role: 'assistant', type: 'text', text: `❌ Error looking up patient: ${err.message}` });
    }
    setLoading(false);
  }, [loading]);

  // ── Step 2: Process medicines ─────────────────────────────────────────────────
  const processMedicines = useCallback(async (text) => {
    if (!text.trim() || loading) return;
    const fullText = patientContext
      ? `${patientContext.name} needs ${text.trim()}`
      : text.trim();

    addMessage({ role: 'user', type: 'text', text: text.trim() });
    setInput('');
    setLoading(true);
    setLiveLoading(true);
    setLiveData(null);

    try {
      const res = await axios.post(`${API}/extract-prescription`, { text: fullText });
      const data = res.data.data;
      // Inject known customer back in case Ollama didn't match
      if (patientContext && !data.customer) data.customer = patientContext;
      setLiveData(data);
      setLiveLoading(false);
      addMessage({ role: 'assistant', type: 'prescription', data });
    } catch (err) {
      setLiveLoading(false);
      addMessage({ role: 'assistant', type: 'text', text: `❌ Error: ${err.response?.data?.error || err.message}` });
    }
    setLoading(false);
  }, [loading, patientContext]);

  // ── Route input to correct step ───────────────────────────────────────────────
  const processInput = useCallback((text) => {
    if (step === 'name') lookupPatient(text);
    else processMedicines(text);
  }, [step, lookupPatient, processMedicines]);

  // ── Create order ──────────────────────────────────────────────────────────────
  const handleCreateOrder = useCallback(async (prescriptionData, msgId) => {
    const { patient_name, medicines = [], customer } = prescriptionData;
    const validMeds = medicines.filter(m => m.medicine);
    if (validMeds.length === 0) return;
    try {
      const orderIds = [];
      for (const med of validMeds) {
        const res = await axios.post(`${API}/create-order`, {
          customer_id: customer?.id || null, customer_name: patient_name,
          medicine_id: med.medicine.id, medicine_name: med.medicine.name,
          dosage: `${med.dosage} / ${med.frequency}`, quantity: med.quantity, price_per_unit: med.medicine.price,
        });
        orderIds.push(res.data.order_id);
      }
      setOrderCreatedIds(prev => new Set([...prev, msgId]));
      addMessage({
        role: 'assistant', type: 'text',
        text: `✅ ${orderIds.length} order(s) created! IDs: ${orderIds.map(id => '#' + id).join(', ')}\n💰 Grand Total: $${prescriptionData.grand_total}\n\nSay a new patient name to start another prescription.`
      });
      // Reset for next patient
      setStep('name');
      setPatientContext(null);
      setLiveData(null);
      setTimeout(() => startRecording(), 1000);
    } catch (err) {
      addMessage({ role: 'assistant', type: 'text', text: `❌ Failed: ${err.response?.data?.error || err.message}` });
    }
  }, []);

  const handleFindAlternatives = useCallback(async (prescriptionData) => {
    const { medicines = [] } = prescriptionData;
    if (medicines.length === 0) return;
    try {
      const firstMed = medicines[0];
      const res = await axios.get(`${API}/alternatives/${encodeURIComponent(firstMed.medicine_name)}?exclude=${firstMed.medicine?.id || 0}`);
      if (res.data.length === 0) addMessage({ role: 'assistant', type: 'text', text: 'No alternatives found.' });
      else addMessage({ role: 'assistant', type: 'text', text: `Available alternatives:\n${res.data.map(m => `• ${m.name} — Stock: ${m.stock}, $${m.price}/pill`).join('\n')}` });
    } catch { addMessage({ role: 'assistant', type: 'text', text: 'Could not fetch alternatives.' }); }
  }, []);

  // ── Voice recording ───────────────────────────────────────────────────────────
  const startRecording = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    const recognition = new SR();
    recognition.continuous = true; recognition.interimResults = true; recognition.lang = 'en-US';
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results).map(r => r[0].transcript).join('');
      setInput(transcript);
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = setTimeout(() => {
        stopRecording();
        processInput(transcript);
      }, 2000);
    };
    recognition.onerror = () => stopRecording();
    recognition.onend = () => setRecording(false);
    try { recognition.start(); recognitionRef.current = recognition; setRecording(true); } catch (e) { }
  };

  const stopRecording = () => {
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    recognitionRef.current?.stop();
    setRecording(false);
  };

  const stepLabel = step === 'name'
    ? '🔍 Step 1: Identify Patient'
    : `💊 Step 2: Enter Medicines for ${patientContext?.name || 'Patient'}`;

  return (
    <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 24, overflow: 'hidden' }}>

        {/* Assistant header */}
        <div style={{ background: '#f8fafc', borderRadius: 12, padding: '12px 16px', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 12, border: '1px solid #e2e8f0' }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}><Icon.Bot /></div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 15 }}>HackfusionRX Assistant</div>
            <div style={{ fontSize: 12, color: '#16a34a', display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#16a34a' }} />
              Online · Ollama ({ollamaStatus?.activeModel || 'llama3.2'})
            </div>
          </div>
          {/* Step indicator */}
          <div style={{ background: step === 'name' ? '#dbeafe' : '#dcfce7', color: step === 'name' ? '#1d4ed8' : '#16a34a', fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 20 }}>
            {stepLabel}
          </div>
        </div>

        {/* Recording indicator bar */}
        {recording && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '8px 14px', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#dc2626' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#dc2626', flexShrink: 0 }} />
            <span>🎤 Listening{step === 'name' ? ' for patient name' : ' for medicines'}... auto-submits after 2s silence</span>
          </div>
        )}

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16, paddingRight: 4 }}>
          {messages.map(msg => (
            <div key={msg.id} className="fade-in" style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', gap: 10, alignItems: 'flex-start' }}>
              {msg.role === 'assistant' && <div style={{ width: 34, height: 34, borderRadius: '50%', flexShrink: 0, background: 'linear-gradient(135deg, #3b82f6, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}><Icon.Bot /></div>}
              {msg.type === 'prescription' ? (
                <PrescriptionCard data={msg.data} orderCreated={orderCreatedIds.has(msg.id)} onCreateOrder={() => handleCreateOrder(msg.data, msg.id)} onFindAlternatives={() => handleFindAlternatives(msg.data)} />
              ) : (
                <div style={{ background: msg.role === 'user' ? '#2563eb' : '#fff', color: msg.role === 'user' ? '#fff' : '#0f172a', border: msg.role === 'user' ? 'none' : '1px solid #e2e8f0', borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '4px 18px 18px 18px', padding: '12px 16px', maxWidth: 520, fontSize: 14, lineHeight: 1.65, whiteSpace: 'pre-line' }}>
                  {msg.text}
                </div>
              )}
              {msg.role === 'user' && <div style={{ width: 34, height: 34, borderRadius: '50%', flexShrink: 0, background: '#2563eb', color: '#fff', fontWeight: 700, fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>P</div>}
            </div>
          ))}
          {loading && (
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <div style={{ width: 34, height: 34, borderRadius: '50%', flexShrink: 0, background: 'linear-gradient(135deg, #3b82f6, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}><Icon.Bot /></div>
              <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '4px 18px 18px 18px', padding: '12px 18px', color: '#64748b', fontSize: 13, display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 14, height: 14, border: '2px solid #e2e8f0', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                {step === 'name' ? 'Searching patient database...' : 'Ollama extracting prescription...'}
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input bar */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 16, background: '#fff', border: `2px solid ${recording ? '#fca5a5' : '#e2e8f0'}`, borderRadius: 14, padding: '8px 8px 8px 16px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', transition: 'border-color 0.2s' }}>
          <button onClick={recording ? stopRecording : startRecording} style={{ background: recording ? '#fee2e2' : '#2563eb', border: 'none', borderRadius: '50%', width: 38, height: 38, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: recording ? '#dc2626' : '#fff', flexShrink: 0 }}>
            {recording ? <Icon.MicOff /> : <Icon.Mic />}
          </button>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && processInput(input)}
            placeholder={
              recording
                ? (step === 'name' ? '🎤 Listening for patient name...' : '🎤 Listening for medicines...')
                : (step === 'name' ? 'Type or speak patient name...' : 'Type or speak medicines needed...')
            }
            style={{ flex: 1, border: 'none', outline: 'none', fontSize: 14, color: '#0f172a', background: 'transparent', fontStyle: recording ? 'italic' : 'normal' }}
          />
          <button onClick={() => processInput(input)} disabled={loading || !input.trim()} style={{ background: input.trim() && !loading ? '#2563eb' : '#e2e8f0', color: input.trim() && !loading ? '#fff' : '#94a3b8', border: 'none', borderRadius: 10, width: 40, height: 38, cursor: input.trim() && !loading ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon.Send />
          </button>
        </div>
      </div>

      {/* Live context panel */}
      <LiveContextPanel extractedData={liveData} loading={liveLoading} countdown={null} onRegisterNewPatient={(name) => onNavigateToRegister(name)} />
    </div>
  );
}

// ─── Dashboard ──────────────────────────────────────────────────────────────────
function DashboardPage() {
  const [stats, setStats] = useState(null);
  useEffect(() => { axios.get(`${API}/stats`).then(r => setStats(r.data)); }, []);
  const cards = stats ? [
    { label: "Today's Revenue", value: `$${stats.today_revenue}`, color: '#1d4ed8', icon: '💰' },
    { label: 'Total Orders', value: stats.total_orders, color: '#16a34a', icon: '📋' },
    { label: 'Customers', value: stats.total_customers, color: '#d97706', icon: '👥' },
    { label: 'Low Stock Items', value: stats.low_stock_count, color: '#dc2626', icon: '⚠️' },
  ] : [];
  return (
    <div style={{ padding: 24, overflowY: 'auto', flex: 1 }}>
      <h2 style={{ marginBottom: 20, fontSize: 22, fontWeight: 700 }}>Dashboard</h2>
      {stats ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
          {cards.map(card => (
            <div key={card.label} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 20 }}>
              <div style={{ fontSize: 28, marginBottom: 10 }}>{card.icon}</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: card.color }}>{card.value}</div>
              <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>{card.label}</div>
            </div>
          ))}
        </div>
      ) : <div style={{ color: '#64748b' }}>Loading stats...</div>}
    </div>
  );
}

// ─── Sidebar ────────────────────────────────────────────────────────────────────
function Sidebar({ activePage, onNavigate }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Icon.Dashboard },
    { id: 'inventory', label: 'Inventory', icon: Icon.Inventory },
    { id: 'customers', label: 'Customers', icon: Icon.Customers },
    { id: 'reports', label: 'Reports', icon: Icon.Reports },
    { id: 'assistant', label: 'AI Assistant', icon: Icon.AI },
  ];
  return (
    <div style={{ width: 220, background: '#0f172a', color: '#94a3b8', display: 'flex', flexDirection: 'column', height: '100%', flexShrink: 0 }}>
      <div style={{ padding: '20px 20px 18px', borderBottom: '1px solid #1e293b', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, #3b82f6, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}><Icon.Pill /></div>
        <span style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 16 }}>HackfusionRX</span>
      </div>
      <nav style={{ flex: 1, padding: '12px 0' }}>
        {navItems.map(item => {
          const active = activePage === item.id;
          return (
            <button key={item.id} onClick={() => onNavigate(item.id)} style={{ width: '100%', background: active ? '#1e3a5f' : 'transparent', border: 'none', borderLeft: active ? '3px solid #3b82f6' : '3px solid transparent', color: active ? '#e2e8f0' : '#64748b', cursor: 'pointer', padding: '11px 20px', display: 'flex', alignItems: 'center', gap: 12, fontSize: 14, fontWeight: active ? 600 : 400, textAlign: 'left' }}>
              <item.icon />{item.label}
            </button>
          );
        })}
      </nav>
      <button style={{ background: 'transparent', border: 'none', color: '#475569', padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', fontSize: 14, borderTop: '1px solid #1e293b' }}>
        <Icon.Logout /> Logout
      </button>
    </div>
  );
}

// ─── Root App ───────────────────────────────────────────────────────────────────
export default function App() {
  const [activePage, setActivePage] = useState('assistant');
  const [ollamaStatus, setOllamaStatus] = useState(null);
  const [showRegister, setShowRegister] = useState(false);
  const [newPatientName, setNewPatientName] = useState('');

  useEffect(() => {
    axios.get(`${API}/health`)
      .then(r => setOllamaStatus(r.data.ollama))
      .catch(() => setOllamaStatus({ ok: false, error: 'Backend not running' }));
  }, []);

  const [returnedFromRegister, setReturnedFromRegister] = useState(false);
  const handleNavigateToRegister = (name) => { setNewPatientName(name); setShowRegister(true); setReturnedFromRegister(false); };
  const handlePatientCreated = () => { setShowRegister(false); setActivePage('assistant'); setReturnedFromRegister(true); };

  const pageTitle = { assistant: 'AI Voice & Text Assistant', dashboard: 'Dashboard', inventory: 'Inventory', customers: 'Customers', reports: 'Purchase History' };

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar activePage={activePage} onNavigate={(p) => { setShowRegister(false); setActivePage(p); }} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ borderBottom: '1px solid #e2e8f0', background: '#fff', padding: '14px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>{showRegister ? 'New Patient Registration' : pageTitle[activePage]}</h2>
            {activePage === 'assistant' && !showRegister && <p style={{ margin: 0, color: '#64748b', fontSize: 12, marginTop: 2 }}>Automate prescription extraction and inventory checks using Ollama AI (free, local).</p>}
            {showRegister && <p style={{ margin: 0, color: '#64748b', fontSize: 12, marginTop: 2 }}>Register new patient → auto-redirects back to prescription assistant in 5s</p>}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {ollamaStatus && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: ollamaStatus.ok ? '#16a34a' : '#dc2626', background: ollamaStatus.ok ? '#f0fdf4' : '#fef2f2', padding: '4px 10px', borderRadius: 20, border: `1px solid ${ollamaStatus.ok ? '#bbf7d0' : '#fecaca'}` }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: ollamaStatus.ok ? '#16a34a' : '#dc2626' }} />
                {ollamaStatus.ok ? 'Ollama Online' : 'Ollama Offline'}
              </div>
            )}
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><Icon.Bell /></button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6, #06b6d4)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>A</div>
              <div><div style={{ fontWeight: 600, fontSize: 13 }}>Admin</div><div style={{ color: '#64748b', fontSize: 11 }}>Pharmacist</div></div>
            </div>
          </div>
        </div>
        <OllamaStatusBanner status={ollamaStatus} />
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {showRegister ? (
            <NewPatientPage detectedName={newPatientName} onPatientCreated={handlePatientCreated} onSkip={() => { setShowRegister(false); setActivePage('assistant'); }} />
          ) : activePage === 'assistant' ? (
            <AssistantPage ollamaStatus={ollamaStatus} onNavigateToRegister={handleNavigateToRegister} autoStartMic={returnedFromRegister} />
          ) : activePage === 'dashboard' ? <DashboardPage />
            : activePage === 'inventory' ? <InventoryPage />
              : activePage === 'customers' ? <CustomersPage />
                : <HistoryPage />}
        </div>
      </div>
    </div>
  );
}