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

  const menuItem = (label, emoji, page, onClick) => (
    <div
      onClick={() => handleMenuClick(onClick)}
      style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        padding: '10px 12px', borderRadius: '8px', cursor: 'pointer',
        fontSize: '13.5px', fontWeight: activePage === page ? '500' : '400',
        background: activePage === page ? '#EFF6FF' : 'transparent',
        color: activePage === page ? '#185FA5' : '#374151',
        transition: 'background 0.15s',
        marginBottom: '4px'
      }}
    >
      <span style={{ fontSize: '16px' }}>{emoji}</span> {label}
    </div>
  );

  return (
    <>
      {/* Header Khusus Mobile */}
      {isMobile && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, height: '60px',
          background: '#fff', borderBottom: '1px solid #e5e7eb',
          display: 'flex', alignItems: 'center', padding: '0 16px',
          justifyContent: 'space-between', zIndex: 99
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <img
              src={fotoSaya}
              alt="Foto Profil"
              style={{ width: '34px', height: '34px', borderRadius: '50%', objectFit: 'cover' }}
            />
            <span style={{ fontSize: '15px', fontWeight: '600' }}>DBFinance</span>
          </div>
          <button onClick={() => setIsOpen(!isOpen)} style={{ background: 'transparent', border: 'none', fontSize: '22px', cursor: 'pointer', padding: '4px 8px', color: '#374151' }}>
            {isOpen ? '✕' : '☰'}
          </button>
        </div>
      )}

      {/* Backdrop */}
      {isMobile && isOpen && (
        <div onClick={() => setIsOpen(false)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0, 0, 0, 0.4)', zIndex: 98 }} />
      )}

      {/* Utama Sidebar */}
      <div style={{
        width: '220px',
        minHeight: '100vh',
        height: isMobile ? '100vh' : 'auto',
        background: '#fff',
        borderRight: '1px solid #e5e7eb',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        position: isMobile ? 'fixed' : 'relative',
        top: 0,
        left: isMobile ? (isOpen ? '0' : '-220px') : '0',
        zIndex: 100,
        transition: 'left 0.3s ease-in-out',
        boxShadow: isMobile && isOpen ? '4px 0 24px rgba(0,0,0,0.15)' : 'none'
      }}>

        {/* Logo Section Desktop */}
        <div style={{ padding: '20px', borderBottom: '1px solid #e5e7eb', display: isMobile ? 'none' : 'block' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img
              src={fotoSaya}
              alt="Foto Logo"
              style={{ width: '34px', height: '34px', borderRadius: '50%', objectFit: 'cover' }}
            />
            <div>
              <div style={{ fontSize: '15px', fontWeight: '600' }}>DBFinance</div>
              <div style={{ fontSize: '11px', color: '#6b7280' }}>Finance Management</div>
            </div>
          </div>
        </div>

        {isOpen && isMobile && (
          <div style={{ padding: '20px', borderBottom: '1px solid #e5e7eb', background: '#f9fafb' }}>
            <div style={{ fontSize: '14px', fontWeight: '600', color: '#185FA5' }}>Menu Navigasi</div>
          </div>
        )}

        {/* Nav Links */}
        <nav style={{ padding: '16px 12px', flex: 1 }}>
          <div style={{ fontSize: '10px', color: '#9ca3af', padding: '0 8px', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
            Main
          </div>
          
          {/* Menu Home (Admin & Operator) */}
          {menuItem('Home', '🏠', 'home', onHomeClick)}
          
          {/* Menu Finansial Kantor (Khusus Admin) */}
          {userRole === 'admin' && menuItem('Kas Kantor', '🏢', 'office', onOfficeClick)}
          {userRole === 'admin' && menuItem('Buku Besar', '📖', 'buku_besar', onBukuBesarClick)}
          
          <div style={{ fontSize: '10px', color: '#9ca3af', padding: '0 8px', marginTop: '16px', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
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
        <div style={{ padding: '12px 10px', borderTop: '1px solid #e5e7eb', background: '#fff' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <img
                src={fotoSaya}
                alt="Avatar Pengguna"
                style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }}
              />
              <div>
                <div style={{ fontSize: '13px', fontWeight: '600', textTransform: 'capitalize', color: '#1f2937' }}>
                  {userRole || 'User'}
                </div>
                <div style={{ fontSize: '10.5px', color: '#6b7280' }}>
                  {userRole === 'admin' ? 'Administrator' : 'Staff Operator'}
                </div>
              </div>
            </div>

            <button 
              onClick={onLogoutClick}
              title="Keluar Aplikasi"
              style={{
                background: 'transparent', border: 'none', fontSize: '15px', cursor: 'pointer',
                padding: '6px', borderRadius: '6px', display: 'flex', alignItems: 'center',
                justifyContent: 'center', color: '#9ca3af', transition: 'all 0.15s'
              }}
              onMouseOver={e => {
                e.currentTarget.style.color = '#dc2626';
                e.currentTarget.style.background = '#FFF7F7';
              }}
              onMouseOut={e => {
                e.currentTarget.style.color = '#9ca3af';
                e.currentTarget.style.background = 'transparent';
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