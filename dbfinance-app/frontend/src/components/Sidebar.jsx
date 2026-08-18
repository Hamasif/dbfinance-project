import { useState, useEffect } from 'react';
import fotoSaya from '../assets/foto-saya.jpg';

export default function Sidebar({
  onHomeClick,
  onOfficeClick,
  onLaporanClick,
  onLaporanKantorClick, // <-- 1. Menerima prop baru untuk Laporan Kantor
  onBukuBesarClick,
  onLabaRugiClick,
  onNeracaClick,
  onLogoutClick,
  activePage,
  userRole
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobileView = window.innerWidth <= 768;
      setIsMobile(mobileView);
      if (!mobileView) setIsOpen(false);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleMenuClick = (callback) => {
    callback();
    if (isMobile) setIsOpen(false);
  };

  // Palet biru turunan dari logo: navy dalam untuk background,
  // biru cerah untuk aksen/aktif state, dan biru pucat untuk hover halus.
  const colors = {
    navyDeep: '#0B2E4E',
    navyMid: '#123A63',
    navySoft: '#164A7D',
    accent: '#3B82F6',
    accentSoft: 'rgba(59, 130, 246, 0.18)',
    textMuted: '#8FAFD1',
    textLabel: '#5C82AE',
    hoverBg: 'rgba(255, 255, 255, 0.06)',
    border: 'rgba(255, 255, 255, 0.08)'
  };

  const menuItem = (label, emoji, page, onClick) => {
    const isActive = activePage === page;
    return (
      <div
        onClick={() => handleMenuClick(onClick)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '10px 12px',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '13.5px',
          fontWeight: isActive ? '600' : '400',
          background: isActive
            ? 'linear-gradient(90deg, rgba(59,130,246,0.22) 0%, rgba(59,130,246,0.06) 100%)'
            : 'transparent',
          color: isActive ? '#EAF2FF' : '#C3D6EE',
          borderLeft: isActive ? `3px solid ${colors.accent}` : '3px solid transparent',
          boxShadow: isActive ? 'inset 0 0 0 1px rgba(59,130,246,0.15)' : 'none',
          transition: 'background 0.15s, color 0.15s, border-color 0.15s',
          marginBottom: '4px'
        }}
        onMouseOver={(e) => {
          if (!isActive) {
            e.currentTarget.style.background = colors.hoverBg;
            e.currentTarget.style.color = '#EAF2FF';
          }
        }}
        onMouseOut={(e) => {
          if (!isActive) {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = '#C3D6EE';
          }
        }}
      >
        <span style={{ fontSize: '16px', filter: isActive ? 'none' : 'grayscale(15%) opacity(0.9)' }}>
          {emoji}
        </span>{' '}
        {label}
      </div>
    );
  };

  return (
    <>
      {/* Header Khusus Mobile */}
      {isMobile && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, height: '60px',
          background: `linear-gradient(90deg, ${colors.navyDeep} 0%, ${colors.navyMid} 100%)`,
          borderBottom: `1px solid ${colors.border}`,
          display: 'flex', alignItems: 'center', padding: '0 16px',
          justifyContent: 'space-between', zIndex: 99,
          boxShadow: '0 2px 12px rgba(11, 46, 78, 0.25)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <img
              src={fotoSaya}
              alt="Foto Profil"
              style={{
                width: '34px', height: '34px', borderRadius: '50%', objectFit: 'cover',
                border: `2px solid ${colors.accent}`
              }}
            />
            <span style={{ fontSize: '15px', fontWeight: '600', color: '#fff' }}>DBFinance</span>
          </div>
          <button
            onClick={() => setIsOpen(!isOpen)}
            style={{
              background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '6px',
              fontSize: '20px', cursor: 'pointer', padding: '6px 10px', color: '#EAF2FF'
            }}
          >
            {isOpen ? '✕' : '☰'}
          </button>
        </div>
      )}

      {/* Backdrop */}
      {isMobile && isOpen && (
        <div onClick={() => setIsOpen(false)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(6, 20, 36, 0.55)', zIndex: 98 }} />
      )}

      {/* Utama Sidebar */}
      <div style={{
        width: '220px',
        minHeight: '100vh',
        height: isMobile ? '100vh' : 'auto',
        background: `linear-gradient(180deg, ${colors.navyDeep} 0%, ${colors.navyMid} 55%, ${colors.navySoft} 100%)`,
        borderRight: `1px solid ${colors.border}`,
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        position: isMobile ? 'fixed' : 'relative',
        top: 0,
        left: isMobile ? (isOpen ? '0' : '-220px') : '0',
        zIndex: 100,
        transition: 'left 0.3s ease-in-out',
        boxShadow: isMobile && isOpen ? '4px 0 24px rgba(0,0,0,0.35)' : '2px 0 0 rgba(0,0,0,0.02)'
      }}>

        {/* Logo Section Desktop */}
        <div style={{
          padding: '22px 20px',
          borderBottom: `1px solid ${colors.border}`,
          display: isMobile ? 'none' : 'block',
          background: 'rgba(255,255,255,0.02)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img
              src={fotoSaya}
              alt="Foto Logo"
              style={{
                width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover',
                border: `2px solid ${colors.accent}`,
                boxShadow: '0 0 0 3px rgba(59,130,246,0.15)'
              }}
            />
            <div>
              <div style={{ fontSize: '15px', fontWeight: '700', color: '#FFFFFF', letterSpacing: '0.2px' }}>
                DBFinance
              </div>
              <div style={{ fontSize: '11px', color: colors.textMuted }}>Finance Management</div>
            </div>
          </div>
        </div>

        {isOpen && isMobile && (
          <div style={{ padding: '18px 20px', borderBottom: `1px solid ${colors.border}`, background: 'rgba(255,255,255,0.03)' }}>
            <div style={{ fontSize: '14px', fontWeight: '600', color: '#EAF2FF' }}>Menu Navigasi</div>
          </div>
        )}

        {/* Nav Links */}
        <nav style={{ padding: '18px 12px', flex: 1 }}>
          <div style={{ fontSize: '10px', color: colors.textLabel, padding: '0 8px', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '600' }}>
            Main
          </div>

          {/* Menu Home (Admin & Operator) */}
          {menuItem('Home', '🏠', 'home', onHomeClick)}

          {/* Menu Finansial Kantor (Khusus Admin) */}
          {userRole === 'admin' && menuItem('Kas Kantor', '🏢', 'office', onOfficeClick)}
          {userRole === 'admin' && menuItem('Buku Besar', '📖', 'buku_besar', onBukuBesarClick)}

          <div style={{ fontSize: '10px', color: colors.textLabel, padding: '0 8px', marginTop: '20px', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '600' }}>
            Laporan Rekap
          </div>

          {/* 2. Pemisahan Menu Laporan */}
          {/* Laporan Project selalu bisa dilihat Staff Operator & Admin */}
          {menuItem('Laporan Project', '📊', 'laporan', onLaporanClick)}

          {/* Laporan Kantor dikunci khusus Admin saja */}
          {userRole === 'admin' && menuItem('Laporan Kantor', '📉', 'laporan_kantor', onLaporanKantorClick)}

          {userRole === 'admin' && menuItem('Laba Rugi', '📈', 'laba_rugi', onLabaRugiClick)}
          {userRole === 'admin' && menuItem('Neraca', '⚖️', 'neraca', onNeracaClick)}
        </nav>

        {/* User Info & Fitur Keluar */}
        <div style={{
          padding: '14px 10px',
          borderTop: `1px solid ${colors.border}`,
          background: 'rgba(0,0,0,0.12)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <img
                src={fotoSaya}
                alt="Avatar Pengguna"
                style={{
                  width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover',
                  border: `2px solid ${colors.accent}`
                }}
              />
              <div>
                <div style={{ fontSize: '13px', fontWeight: '600', textTransform: 'capitalize', color: '#FFFFFF' }}>
                  {userRole || 'User'}
                </div>
                <div style={{ fontSize: '10.5px', color: colors.textMuted }}>
                  {userRole === 'admin' ? 'Administrator' : 'Staff Operator'}
                </div>
              </div>
            </div>

            <button
              onClick={onLogoutClick}
              title="Keluar Aplikasi"
              style={{
                background: 'rgba(255,255,255,0.06)', border: 'none', fontSize: '15px', cursor: 'pointer',
                padding: '6px', borderRadius: '6px', display: 'flex', alignItems: 'center',
                justifyContent: 'center', color: colors.textMuted, transition: 'all 0.15s'
              }}
              onMouseOver={e => {
                e.currentTarget.style.color = '#FCA5A5';
                e.currentTarget.style.background = 'rgba(220, 38, 38, 0.15)';
              }}
              onMouseOut={e => {
                e.currentTarget.style.color = colors.textMuted;
                e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
              }}
            >
              🚪
            </button>
          </div>
        </div>
      </div>

      {isMobile && <div style={{ height: '60px', width: '100%' }} />}
    </>
  );
}