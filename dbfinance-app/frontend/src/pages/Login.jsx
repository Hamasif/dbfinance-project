import { useState, useEffect } from 'react';
import fotoSaya from '../assets/foto-saya.jpg';
import bgImage from '../assets/bg.webp'; // Import gambar lokal bg.webp

export default function Login({ onLoginSuccess }) {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError('Email dan password wajib diisi!');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Simulasi Akun Akun sesuai permintaan:
      if (form.email === 'admin@dbfinance.com' && form.password === 'admin123') {
        if (onLoginSuccess) onLoginSuccess({ email: form.email, role: 'admin' });
      } else if (form.email === 'operator@dbfinance.com' && form.password === 'operator123') {
        if (onLoginSuccess) onLoginSuccess({ email: form.email, role: 'operator' });
      } else {
        setError('Email atau password salah. Silakan coba kembali.');
      }
    } catch (err) {
      console.error(err);
      setError('Terjadi kesalahan sistem.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      width: '100vw',
      // Menggunakan gambar bg.webp sebagai background utama halaman login saja
      backgroundImage: `url(${bgImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      padding: isMobile ? '16px' : '24px',
      boxSizing: 'border-box',
      fontFamily: 'sans-serif',
      position: 'relative',
      overflow: 'hidden'
    }}>

      {/* Lapisan overlay gelap tipis agar gambar background tidak terlalu terang */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(15, 23, 42, 0.3)',
        zIndex: 0
      }} />

      <div style={{
        // Memakai efek frosted glass abu-abu semi transparan agar menyatu dengan background gambar
        background: 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid rgba(255, 255, 255, 0.4)',
        borderRadius: '16px',
        padding: isMobile ? '28px 20px' : '40px',
        width: '100%',
        maxWidth: '420px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
        boxSizing: 'border-box',
        zIndex: 1
      }}>

        {/* LOGO & TITLE */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            marginBottom: '8px'
          }}>
            <span style={{ display: 'flex', alignItems: 'center' }}>
              <img
                src={fotoSaya}
                alt="Foto Profil"
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '2px solid rgba(30, 41, 59, 0.2)'
                }}
              />
            </span>
            <span style={{
              fontSize: '24px',
              fontWeight: '700',
              letterSpacing: '0.5px',
              color: '#0f172a'
            }}>
              DBFinance
            </span>
          </div>
          <p style={{ fontSize: '13px', color: '#475569', margin: 0, fontWeight: '600' }}>
            Cloud Management & Financial Analytics
          </p>
        </div>

        {/* INFO AKUN UNTUK TESTING */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.06)',
          border: '1px solid rgba(15, 23, 42, 0.08)',
          borderRadius: '8px',
          padding: '10px 12px',
          marginBottom: '20px',
          fontSize: '11px',
          color: '#334155',
          lineHeight: '1.5',
          fontWeight: '500'
        }}>
          💡 <strong>Petunjuk Demo Login:</strong><br />
          • Admin: <code>admin@dbfinance.com</code> (pass: <code>admin123</code>)<br />
          • Operator: <code>operator@dbfinance.com</code> (pass: <code>operator123</code>)
        </div>

        {/* ERROR MESSAGE BADGE */}
        {error && (
          <div style={{
            background: '#FFF7F7',
            border: '1px solid #fecaca',
            color: '#dc2626',
            padding: '10px 12px',
            borderRadius: '8px',
            fontSize: '12.5px',
            fontWeight: '600',
            marginBottom: '16px',
            lineHeight: '1.4'
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* LOGIN FORM */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>

          {/* EMAIL FIELD */}
          <div>
            <label style={{
              fontSize: '12px',
              fontWeight: '700',
              color: '#1e293b',
              display: 'block',
              marginBottom: '6px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Alamat Email
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="nama@dbfinance.com"
              style={{
                width: '100%',
                padding: '11px 14px',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'all 0.2s',
                background: 'rgba(255, 255, 255, 0.9)'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#185FA5';
                e.target.style.boxShadow = '0 0 0 3px rgba(24, 95, 165, 0.15)';
                e.target.style.background = '#fff';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#cbd5e1';
                e.target.style.boxShadow = 'none';
                e.target.style.background = 'rgba(255, 255, 255, 0.9)';
              }}
            />
          </div>

          {/* PASSWORD FIELD */}
          <div>
            <label style={{
              fontSize: '12px',
              fontWeight: '700',
              color: '#1e293b',
              display: 'block',
              marginBottom: '6px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Kata Sandi
            </label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              style={{
                width: '100%',
                padding: '11px 14px',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'all 0.2s',
                background: 'rgba(255, 255, 255, 0.9)'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#185FA5';
                e.target.style.boxShadow = '0 0 0 3px rgba(24, 95, 165, 0.15)';
                e.target.style.background = '#fff';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#cbd5e1';
                e.target.style.boxShadow = 'none';
                e.target.style.background = 'rgba(255, 255, 255, 0.9)';
              }}
            />
          </div>

          {/* SIGN IN BUTTON */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              background: loading ? '#94a3b8' : '#2563eb', // Menggunakan aksen biru cerah agar pop-out di background gelap
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              marginTop: '6px',
              transition: 'background 0.2s',
              textAlign: 'center',
              boxSizing: 'border-box',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)'
            }}
            onMouseOver={e => { if (!loading) e.currentTarget.style.background = '#1d4ed8'; }}
            onMouseOut={e => { if (!loading) e.currentTarget.style.background = '#2563eb'; }}
          >
            {loading ? 'Memverifikasi...' : 'Masuk Aplikasi'}
          </button>

        </form>

        <div style={{ textAlign: 'center', marginTop: '28px', fontSize: '11px', color: '#6b7280', fontWeight: '500' }}>
          Secured System Connectivity © 2026
        </div>

      </div>
    </div>
  );
}