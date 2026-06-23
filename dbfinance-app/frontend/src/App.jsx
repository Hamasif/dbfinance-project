import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Home from './pages/Home';
import PengeluaranKantor from './pages/PengeluaranKantor';
import ProjectDetail from './pages/ProjectDetail';
import Laporan from './pages/Laporan';
import LaporanKantor from './pages/LaporanKantor'; // <-- 1. Import halaman Laporan Kantor baru
import BukuBesar from './pages/BukuBesar';
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

  // Fungsi Navigasi Alur Aplikasi dengan Proteksi Role Operator
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
    // Proteksi: Operator tidak boleh membuka Pengeluaran Kantor
    if (userRole === 'operator') return;
    setCurrentPage('office');
    setSelectedProject(null);
  };

  const goToBukuBesar = () => {
    // Proteksi: Operator tidak boleh membuka Buku Besar
    if (userRole === 'operator') return;
    setCurrentPage('buku_besar');
    setSelectedProject(null);
  };

  const goToLaporan = () => {
    setCurrentPage('laporan');
    setSelectedProject(null);
  };

  // 2. Fungsi Navigasi & Proteksi: Operator tidak boleh membuka Laporan Kantor
  const goToLaporanKantor = () => {
    if (userRole === 'operator') return;
    setCurrentPage('laporan_kantor');
    setSelectedProject(null);
  };

  const goToLabaRugi = () => { 
    // Proteksi: Operator tidak boleh membuka Laba Rugi
    if (userRole === 'operator') return;
    setCurrentPage('laba_rugi'); 
    setSelectedProject(null); 
  };

  const goToNeraca = () => { 
    // Fungsi Navigasi & Proteksi: Operator tidak boleh membuka Neraca
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
        onLaporanClick={goToLaporan}
        onLaporanKantorClick={goToLaporanKantor} // <-- 3. Hubungkan fungsi klik Laporan Kantor ke Sidebar
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

        {/* Proteksi Render halaman: hanya tampil jika user adalah admin */}
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

        {currentPage === 'buku_besar' && userRole === 'admin' && (
          <BukuBesar />
        )}
        
        {/* Laporan Khusus Project */}
        {currentPage === 'laporan' && (
          <Laporan />
        )}

        {/* 4. Kondisi Render Halaman Laporan Pengeluaran Kantor (Khusus Admin) */}
        {currentPage === 'laporan_kantor' && userRole === 'admin' && (
          <LaporanKantor />
        )}
        
        {currentPage === 'laba_rugi' && userRole === 'admin' && (
          <LabaRugi />
        )}

        {currentPage === 'neraca' && userRole === 'admin' && (
          <Neraca />
        )}
      </div>
    </div>
  );
}