import { useState, useEffect } from 'react';
import axios from 'axios';

// URL API Backend Laravel Anda
const API_BASE_URL = 'http://66.96.229.251:20527/api';

export default function TimelineProject() {
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [timelines, setTimelines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const [formData, setFormData] = useState({
    step_name: '',
    description: '',
    start_date: '',
    end_date: '',
    status: 'pending'
  });

  const [isMobile, setIsMobile] = useState(false);

  // Helper: Menghitung sisa hari menuju tanggal mulai
  const getDaysRemaining = (startDateStr) => {
    if (!startDateStr) return 999;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const targetDate = new Date(startDateStr);
    targetDate.setHours(0, 0, 0, 0);
    const diffTime = targetDate - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // 1. Deteksi ukuran layar responsif
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 2. Ambil daftar project saat pertama kali dimuat
  useEffect(() => {
    let isMounted = true;
    const fetchProjects = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/projects`);
        
        let projectList = [];
        if (Array.isArray(res.data)) {
          projectList = res.data;
        } else if (res.data && Array.isArray(res.data.data)) {
          projectList = res.data.data;
        }

        if (isMounted) {
          setProjects(projectList);
          if (projectList.length > 0) {
            setSelectedProjectId(projectList[0].id);
          }
        }
      } catch (err) {
        console.error('Gagal mengambil daftar project:', err);
      }
    };

    fetchProjects();

    return () => {
      isMounted = false;
    };
  }, []);

  // 3. Fungsi memuat ulang timeline setelah simpan / hapus
  const loadTimelines = async (projectId) => {
    if (!projectId) return;
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/projects/${projectId}/timelines`);
      const timelineData = Array.isArray(res.data) ? res.data : (res.data.data || []);
      setTimelines(timelineData);
    } catch (err) {
      console.error('Gagal mengambil timeline:', err);
    } finally {
      setLoading(false);
    }
  };

  // 4. Effect untuk mengambil data timeline saat selectedProjectId berubah
  useEffect(() => {
    if (!selectedProjectId) return;

    let isMounted = true;
    const fetchTimelinesData = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API_BASE_URL}/projects/${selectedProjectId}/timelines`);
        const timelineData = Array.isArray(res.data) ? res.data : (res.data.data || []);
        if (isMounted) {
          setTimelines(timelineData);
        }
      } catch (err) {
        console.error('Gagal mengambil timeline:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchTimelinesData();

    return () => {
      isMounted = false;
    };
  }, [selectedProjectId]);

  // 5. Update Notifikasi Pengingat H-7 saat data timelines diperbarui
  useEffect(() => {
    let isMounted = true;

    const loadNotifications = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/project-timelines/notifications`);
        const notifData = Array.isArray(res.data) ? res.data : (res.data.data || []);
        if (isMounted) {
          setNotifications(notifData);
        }
      } catch {
        // Fallback: Jika endpoint di backend belum di-deploy, hitung langsung dari state timelines
        if (isMounted) {
          const upcomingNotifs = timelines.filter(item => {
            if (item.status === 'completed') return false;
            const daysLeft = getDaysRemaining(item.start_date);
            return daysLeft >= 0 && daysLeft <= 7;
          });
          setNotifications(upcomingNotifs);
        }
      }
    };

    loadNotifications();

    return () => {
      isMounted = false;
    };
  }, [timelines]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!formData.step_name || !formData.start_date || !selectedProjectId) {
      alert('Nama tahapan dan tanggal mulai wajib diisi!');
      return;
    }

    try {
      await axios.post(`${API_BASE_URL}/project-timelines`, {
        ...formData,
        project_id: selectedProjectId,
      });
      setFormData({ step_name: '', description: '', start_date: '', end_date: '', status: 'pending' });
      setShowForm(false);
      loadTimelines(selectedProjectId);
    } catch (err) {
      console.error('Gagal menambah timeline:', err);
      alert('Terjadi kesalahan sistem saat menyimpan tahapan timeline.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus tahapan ini dari database?')) {
      try {
        await axios.delete(`${API_BASE_URL}/project-timelines/${id}`);
        loadTimelines(selectedProjectId);
      } catch (err) {
        console.error('Gagal menghapus timeline:', err);
        alert('Gagal menghapus tahapan timeline dari database!');
      }
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return (
          <span style={{ fontSize: '10px', background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: '4px', fontWeight: '600' }}>
            Selesai
          </span>
        );
      case 'in_progress':
        return (
          <span style={{ fontSize: '10px', background: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: '4px', fontWeight: '600' }}>
            Berjalan
          </span>
        );
      case 'delayed':
        return (
          <span style={{ fontSize: '10px', background: '#fee2e2', color: '#991b1b', padding: '2px 8px', borderRadius: '4px', fontWeight: '600' }}>
            Tertunda
          </span>
        );
      default:
        return (
          <span style={{ fontSize: '10px', background: '#f3f4f6', color: '#4b5563', padding: '2px 8px', borderRadius: '4px', fontWeight: '600' }}>
            Pending
          </span>
        );
    }
  };

  // Mengambil objek project yang sedang dipilih
  const currentProject = projects.find(p => String(p.id) === String(selectedProjectId));

  return (
    <div style={{ flex: 1, padding: isMobile ? '16px' : '24px', overflowY: 'auto', boxSizing: 'border-box' }}>
      
      {/* Header */}
      <div style={{
        display: 'flex', 
        flexDirection: isMobile ? 'column' : 'row',
        justifyContent: 'space-between',
        alignItems: isMobile ? 'flex-start' : 'center', 
        gap: '16px',
        marginBottom: '24px'
      }}>
        <div>
          <h1 style={{ fontSize: '18px', fontWeight: '600', margin: 0 }}>Timeline Project</h1>
          <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px', marginBottom: 0 }}>
            Kelola dan pantau tahapan pengerjaan project secara berurutan
          </p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)} 
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '10px 16px', background: '#185FA5', color: '#fff',
            border: 'none', borderRadius: '8px', fontSize: '13px',
            cursor: 'pointer', fontWeight: '500',
            width: isMobile ? '100%' : 'auto', justifyContent: 'center',
            boxSizing: 'border-box'
          }}
        >
          {showForm ? '✕ Tutup Form' : '+ Tambah Tahapan'}
        </button>
      </div>

      {/* Banner Alert Notifikasi Pengingat H-7 */}
      {notifications.length > 0 && (
        <div style={{
          background: '#FFFBEB',
          border: '1px solid #FCD34D',
          borderRadius: '12px',
          padding: '14px 18px',
          marginBottom: '24px',
          boxSizing: 'border-box',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{ fontSize: '16px' }}>🔔</span>
            <div style={{ fontSize: '13.5px', fontWeight: '700', color: '#92400E' }}>
              Peringatan Jadwal H-7 ({notifications.length} Tahapan Mendekati Tenggat)
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', paddingLeft: '24px' }}>
            {notifications.map((notif) => {
              const daysLeft = getDaysRemaining(notif.start_date);
              return (
                <div key={notif.id} style={{ fontSize: '12.5px', color: '#78350F', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontWeight: '600' }}>• {notif.step_name}</span>
                  <span style={{ color: '#B45309' }}>
                    ({notif.start_date})
                  </span>
                  <span style={{
                    fontSize: '10px',
                    background: daysLeft <= 1 ? '#FEE2E2' : '#FEF3C7',
                    color: daysLeft <= 1 ? '#991B1B' : '#92400E',
                    padding: '1px 6px',
                    borderRadius: '4px',
                    fontWeight: '700'
                  }}>
                    {daysLeft === 0 ? 'Mulai Hari Ini!' : daysLeft === 1 ? 'Besok!' : `${daysLeft} Hari Lagi`}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Stats & Project Picker */}
      <div style={{
        display: 'grid', 
        gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
        gap: '12px', 
        marginBottom: '24px'
      }}>
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '14px 16px', boxSizing: 'border-box' }}>
          <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Pilih Project
          </div>
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            style={{
              width: '100%', padding: '6px 0', border: 'none', background: 'transparent',
              fontSize: '15px', fontWeight: '600', outline: 'none', cursor: 'pointer', color: '#185FA5'
            }}
          >
            {Array.isArray(projects) && projects.map((proj) => (
              <option key={proj.id} value={proj.id}>
                {proj.display_name || proj.project_name || proj.nama}
              </option>
            ))}
          </select>
        </div>

        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '14px 16px', boxSizing: 'border-box' }}>
          <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Total Tahapan
          </div>
          <div style={{ fontSize: '20px', fontWeight: '600' }}>{loading ? '...' : timelines.length} Step</div>
        </div>

        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '14px 16px', boxSizing: 'border-box' }}>
          <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Penanggung Jawab
          </div>
          <div style={{ fontSize: '18px', fontWeight: '600', color: '#374151', wordBreak: 'break-all' }}>
            {currentProject?.person_in_charge || currentProject?.sub_label || '-'}
          </div>
        </div>
      </div>

      {/* Form Tambah Tahapan Baru */}
      {showForm && (
        <div style={{
          background: '#fff', border: '1px solid #e5e7eb',
          borderRadius: '12px', padding: '20px', marginBottom: '24px',
          boxSizing: 'border-box'
        }}>
          <h2 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px', marginTop: 0 }}>
            Tambah Step / Tahapan Baru
          </h2>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', 
            gap: '14px' 
          }}>
            <div style={{ gridColumn: isMobile ? 'auto' : '1 / -1' }}>
              <label style={{ fontSize: '12px', fontWeight: '500', color: '#374151', display: 'block', marginBottom: '5px' }}>
                Nama Tahapan / Step *
              </label>
              <input 
                name="step_name" 
                value={formData.step_name}
                onChange={handleInputChange} 
                placeholder="Contoh: Analisis & Perencanaan Desain"
                style={{
                  width: '100%', padding: '10px 12px', border: '1px solid #d1d5db',
                  borderRadius: '8px', fontSize: '13.5px', outline: 'none', boxSizing: 'border-box'
                }} 
              />
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: '500', color: '#374151', display: 'block', marginBottom: '5px' }}>
                Tanggal Mulai *
              </label>
              <input 
                name="start_date" 
                type="date"
                value={formData.start_date}
                onChange={handleInputChange} 
                style={{
                  width: '100%', padding: '10px 12px', border: '1px solid #d1d5db',
                  borderRadius: '8px', fontSize: '13.5px', outline: 'none', boxSizing: 'border-box'
                }} 
              />
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: '500', color: '#374151', display: 'block', marginBottom: '5px' }}>
                Tanggal Selesai
              </label>
              <input 
                name="end_date" 
                type="date"
                value={formData.end_date}
                onChange={handleInputChange} 
                style={{
                  width: '100%', padding: '10px 12px', border: '1px solid #d1d5db',
                  borderRadius: '8px', fontSize: '13.5px', outline: 'none', boxSizing: 'border-box'
                }} 
              />
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: '500', color: '#374151', display: 'block', marginBottom: '5px' }}>
                Status Tahapan *
              </label>
              <select 
                name="status" 
                value={formData.status} 
                onChange={handleInputChange} 
                style={{
                  width: '100%', padding: '10px 12px', border: '1px solid #d1d5db',
                  borderRadius: '8px', fontSize: '13.5px', outline: 'none', background: '#fff', boxSizing: 'border-box'
                }}
              >
                <option value="pending">Pending</option>
                <option value="in_progress">Berjalan</option>
                <option value="completed">Selesai</option>
                <option value="delayed">Tertunda</option>
              </select>
            </div>

            <div style={{ gridColumn: isMobile ? 'auto' : '1 / -1' }}>
              <label style={{ fontSize: '12px', fontWeight: '500', color: '#374151', display: 'block', marginBottom: '5px' }}>
                Keterangan / Detail Pengerjaan
              </label>
              <textarea 
                name="description" 
                rows="3"
                value={formData.description}
                onChange={handleInputChange} 
                placeholder="Rincian poin pengerjaan pada tahapan ini..."
                style={{
                  width: '100%', padding: '10px 12px', border: '1px solid #d1d5db',
                  borderRadius: '8px', fontSize: '13.5px', outline: 'none', boxSizing: 'border-box'
                }} 
              />
            </div>
          </div>

          <div style={{
            display: 'flex', 
            flexDirection: isMobile ? 'column-reverse' : 'row',
            justifyContent: 'flex-end',
            gap: '8px', marginTop: '16px', paddingTop: '14px',
            borderTop: '1px solid #e5e7eb'
          }}>
            <button onClick={() => setShowForm(false)} style={{
              padding: '10px 16px', border: '1px solid #d1d5db', borderRadius: '8px',
              background: '#fff', fontSize: '13px', cursor: 'pointer',
              textAlign: 'center', width: isMobile ? '100%' : 'auto'
            }}>
              Batal
            </button>
            <button onClick={handleSubmit} style={{
              padding: '10px 16px', background: '#185FA5', color: '#fff',
              border: 'none', borderRadius: '8px', fontSize: '13px',
              cursor: 'pointer', fontWeight: '500', textAlign: 'center',
              width: isMobile ? '100%' : 'auto'
            }}>
              Simpan Tahapan
            </button>
          </div>
        </div>
      )}

      {/* Area Tabel Utama */}
      <div style={{ 
        background: '#fff', 
        border: '1px solid #e5e7eb', 
        borderRadius: '12px', 
        overflowX: 'auto', 
        width: '100%'
      }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '32px', color: '#6b7280', fontSize: '13px' }}>
            Memuat data timeline dari database...
          </div>
        ) : !Array.isArray(timelines) || timelines.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px', color: '#9ca3af', boxSizing: 'border-box' }}>
            <div style={{ fontSize: '36px', marginBottom: '10px' }}>📅</div>
            <div style={{ fontWeight: '500' }}>Belum ada tahapan timeline untuk project ini</div>
            <div style={{ fontSize: '13px', marginTop: '4px' }}>
              Klik "+ Tambah Tahapan" untuk menyusun jadwal pengerjaan pertama
            </div>
          </div>
        ) : (
          <table style={{ width: '100%', minWidth: '650px', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e5e7eb', background: '#f9fafb' }}>
                {['#', 'Nama Tahapan', 'Jadwal Pengerjaan', 'Status', 'Keterangan', 'Aksi'].map(h => (
                  <th key={h} style={{
                    padding: '12px 16px', textAlign: 'left',
                    fontSize: '11px', fontWeight: '600', color: '#6b7280',
                    textTransform: 'uppercase', letterSpacing: '0.5px'
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {timelines.map((item, i) => {
                const daysLeft = getDaysRemaining(item.start_date);
                const isH7 = item.status !== 'completed' && daysLeft >= 0 && daysLeft <= 7;

                return (
                  <tr key={item.id} style={{
                    borderBottom: '1px solid #f3f4f6',
                    background: isH7 ? '#FFFBEB' : 'transparent'
                  }}>
                    <td style={{ padding: '14px 16px', color: '#9ca3af' }}>
                      {String(i + 1).padStart(2, '0')}
                    </td>

                    <td style={{ padding: '14px 16px', fontWeight: '600', color: '#111827' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {item.step_name}
                        {isH7 && (
                          <span style={{
                            fontSize: '9.5px',
                            background: '#FEF3C7',
                            color: '#92400E',
                            border: '1px solid #FCD34D',
                            padding: '1px 5px',
                            borderRadius: '4px',
                            fontWeight: '700'
                          }}>
                            H-{daysLeft}
                          </span>
                        )}
                      </div>
                    </td>

                    <td style={{ padding: '14px 16px', color: '#4b5563', whiteSpace: 'nowrap' }}>
                      📅 {item.start_date} {item.end_date ? `s/d ${item.end_date}` : ''}
                    </td>

                    <td style={{ padding: '14px 16px' }}>
                      {getStatusBadge(item.status)}
                    </td>

                    <td style={{ padding: '14px 16px', color: '#6b7280', fontSize: '12.5px', maxWidth: '280px' }}>
                      {item.description || '-'}
                    </td>

                    <td style={{ padding: '14px 16px' }}>
                      <button onClick={() => handleDelete(item.id)} style={{
                        padding: '6px 12px', border: '1px solid #fca5a5',
                        background: '#fff', color: '#ef4444', borderRadius: '6px',
                        fontSize: '12px', cursor: 'pointer'
                      }}>
                        Hapus
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}