import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Home from './pages/Home';
import PengeluaranKantor from './pages/PengeluaranKantor';
import ProjectDetail from './pages/ProjectDetail';
import Laporan from './pages/Laporan';
import LaporanKantor from './pages/LaporanKantor';
import BukuBesar from './pages/BukuBesar';
import TimelineProject from './pages/TimelineProject'; // Import Komponen Timeline
import LabaRugi from './pages/LabaRugi';
import Neraca from './pages/Neraca';
import './index.css';

export default function App() {
  // State Autentikasi Login & Role Pengguna ('admin' atau 'operator')
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);

  // State Navigasi Halaman
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedProject, setSelectedProject] = useState(null);
  const [backTarget, setBackTarget] = useState('home');

  const [isMobile, setIsMobile] = useState(false);

  // Deteksi ukuran layar responsif
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handler Sukses Login menerima objek user dari komponen Login
  const handleLoginSuccess = (userData) => {
    setIsAuthenticated(true);
    setUserRole(userData.role); // menyimpan role: 'admin' atau 'operator'
    setCurrentPage('home');     // default halaman awal setelah masuk
  };

  // Fungsi Navigasi Alur Aplikasi
  const goToDetail = (project, source = 'home') => {
    setSelectedProject(project);
    setBackTarget(source);
    setCurrentPage('detail');
  };

  const goToHome = () => {
    setCurrentPage('home');
    setSelectedProject(null);
  };

  const goToOffice = () => {
    if (userRole !== 'admin') return;
    setCurrentPage('office');
    setSelectedProject(null);
  };

  const goToBukuBesar = () => {
    if (userRole === 'operator') return;
    setCurrentPage('buku_besar');
    setSelectedProject(null);
  };

  // --- Fungsi Navigasi Timeline Project ---
  const goToTimeline = () => {
    setCurrentPage('timeline');
    setSelectedProject(null);
  };

  const goToLaporan = () => {
    setCurrentPage('laporan');
    setSelectedProject(null);
  };

  const goToLaporanKantor = () => {
    if (userRole !== 'admin') return;
    setCurrentPage('laporan_kantor');
    setSelectedProject(null);
  };

  const goToLabaRugi = () => {
    if (userRole === 'operator') return;
    setCurrentPage('laba_rugi');
    setSelectedProject(null);
  };

  const goToNeraca = () => {
    if (userRole === 'operator') return;
    setCurrentPage('neraca');
    setSelectedProject(null);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserRole(null);
    setCurrentPage('home');
    setSelectedProject(null);
  };

  // --- GERBANG LOGIN ---
  if (!isAuthenticated) {
    return (
      <Login onLoginSuccess={handleLoginSuccess} />
    );
  }

  // --- DASHBOARD UTAMA (SETELAH BERHASIL LOGIN) ---
  return (
    <div className="app-container" style={{
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      minHeight: '100vh',
      background: '#f8fafc',
      width: '100%'
    }}>
      <Sidebar
        onHomeClick={goToHome}
        onOfficeClick={goToOffice}
        onBukuBesarClick={goToBukuBesar}
        onTimelineClick={goToTimeline} // <-- Pass fungsi handler ke Sidebar
        onLaporanClick={goToLaporan}
        onLaporanKantorClick={goToLaporanKantor}
        onLabaRugiClick={goToLabaRugi}
        onNeracaClick={goToNeraca}
        onLogoutClick={handleLogout}
        activePage={currentPage}
        userRole={userRole}
      />

      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        boxSizing: 'border-box'
      }}>
        {currentPage === 'home' && (
          <Home onSelectProject={(p) => goToDetail(p, 'home')} userRole={userRole} />
        )}

        {currentPage === 'office' && userRole === 'admin' && (
          <PengeluaranKantor onSelectCategory={(c) => goToDetail(c, 'office')} />
        )}

        {currentPage === 'detail' && (
          <ProjectDetail
            project={selectedProject}
            onBack={backTarget === 'office' ? goToOffice : goToHome}
            userRole={userRole}
          />
        )}

        {currentPage === 'buku_besar' && (userRole === 'admin' || userRole === 'hrd') && (
          <BukuBesar />
        )}

        {/* --- Render Halaman Timeline Project --- */}
        {currentPage === 'timeline' && (
          <TimelineProject />
        )}

        {currentPage === 'laporan' && (
          <Laporan />
        )}

        {currentPage === 'laporan_kantor' && userRole === 'admin' && (
          <LaporanKantor />
        )}

        {currentPage === 'laba_rugi' && (userRole === 'admin' || userRole === 'hrd') && (
          <LabaRugi />
        )}

        {currentPage === 'neraca' && (userRole === 'admin' || userRole === 'hrd') && (
          <Neraca />
        )}
      </div>
    </div>
  );
}