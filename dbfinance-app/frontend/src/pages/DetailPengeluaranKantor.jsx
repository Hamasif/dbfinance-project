import { useState, useEffect, useCallback } from 'react';

const API_BASE_URL = 'http://66.96.229.251:20527/api';

export default function DetailPengeluaranKantor({ onBack }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    category: '',
  });

  const [isMobile, setIsMobile] = useState(false);

  // 1. Deteksi ukuran layar responsif
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 2. UBAHAN: Ambil Data Transaksi khusus Pengeluaran Kantor dari API Laravel (MySQL)
  const fetchTransactions = useCallback(async (isMounted = true) => {
    try {
      const response = await fetch(`${API_BASE_URL}/office-expenses`);
      if (!response.ok) throw new Error("Gagal mengambil data dari server");
      
      const data = await response.json();
      if (isMounted) {
        setTransactions(data);
      }
    } catch (error) {
      console.error("Gagal mengambil data pengeluaran kantor dari MySQL: ", error);
    } finally {
      if (isMounted) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    const initLoad = async () => {
      if (isMounted) {
        setLoading(true);
        await fetchTransactions(isMounted);
      }
    };
    initLoad();
    return () => {
      isMounted = false;
    };
  }, [fetchTransactions]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // 3. UBAHAN: Simpan Transaksi Pengeluaran Kantor Baru ke API Laravel (MySQL)
  const handleSubmit = async () => {
    if (!form.description || !form.amount || !form.date) {
      alert('Deskripsi, jumlah, dan tanggal wajib diisi!');
      return;
    }
    
    try {
      const payload = {
        project_id: null, // Kosongkan karena ini bukan pengeluaran milik proyek tertentu
        type: 'pengeluaran_kantor', 
        description: form.description,
        amount: Number(form.amount),
        date: form.date,
        category: form.category || null
      };

      const response = await fetch(`${API_BASE_URL}/transactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error("Gagal menyimpan data ke server");
      
      setForm({
        description: '', amount: '',
        date: new Date().toISOString().split('T')[0], category: ''
      });
      setShowForm(false);
      setLoading(true);
      
      await fetchTransactions(true);
    } catch (error) {
      console.error("Gagal menyimpan ke MySQL: ", error);
      alert("Terjadi masalah saat mencoba menyimpan data pengeluaran.");
    }
  };

  // 4. UBAHAN: Hapus Transaksi dari API Laravel (MySQL)
  const handleDelete = async (id) => {
    if (confirm('Apakah Anda yakin ingin menghapus data pengeluaran kantor ini?')) {
      try {
        const response = await fetch(`${API_BASE_URL}/transactions/${id}`, {
          method: 'DELETE',
          headers: {
            'Accept': 'application/json'
          }
        });

        if (!response.ok) throw new Error("Gagal menghapus data di server");

        setLoading(true);
        await fetchTransactions(true);
      } catch (error) {
        console.error("Gagal menghapus dokumen dari MySQL: ", error);
        alert("Gagal menghapus data!");
      }
    }
  };

  const formatRupiah = (n) => 'Rp ' + Number(n).toLocaleString('id-ID');

  const totalPengeluaran = transactions.reduce((s, t) => s + Number(t.amount), 0);

  return (
    <div style={{ flex: 1, padding: isMobile ? '16px' : '24px', overflowY: 'auto', boxSizing: 'border-box' }}>

      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#6b7280', marginBottom: '20px' }}>
        <span onClick={onBack} style={{ cursor: 'pointer', color: '#185FA5', fontWeight: '500' }}>
          ← Kembali
        </span>
        <span>/</span>
        <span style={{ color: '#111827', fontWeight: '500' }}>Pengeluaran Operasional Kantor</span>
      </div>

      {/* Header */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '16px 20px', marginBottom: '20px', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'stretch' : 'center', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '4px', color: '#111827', lineHeight: '1.3' }}>
              Pengeluaran Operasional Kantor
            </h1>
            <p style={{ margin: 0, fontSize: '13px', color: '#6b7280' }}>Pencatatan rutin logistik, utilitas, dan kebutuhan kantor harian.</p>
          </div>
          <button 
            onClick={() => setShowForm(!showForm)} 
            style={{
              padding: '10px 16px', background: '#dc2626', color: '#fff',
              border: 'none', borderRadius: '8px', fontSize: '13px',
              cursor: 'pointer', fontWeight: '500', textAlign: 'center',
              boxSizing: 'border-box', width: isMobile ? '100%' : 'auto'
            }}
          >
            {showForm ? '✕ Tutup Form' : '+ Catat Pengeluaran'}
          </button>
        </div>
      </div>

      {/* Summary card */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px', marginBottom: '20px' }}>
        <div style={{ background: '#FFF7F7', border: '1px solid #fecaca', borderRadius: '10px', padding: '14px 16px', boxSizing: 'border-box' }}>
          <div style={{ fontSize: '10px', color: '#991b1b', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>
            Total Pengeluaran Kantor
          </div>
          <div style={{ fontSize: '20px', fontWeight: '700', color: '#dc2626', wordBreak: 'break-all' }}>
            {formatRupiah(totalPengeluaran)}
          </div>
          <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '2px' }}>
            Terakumulasi dari {transactions.length} laporan pengeluaran
          </div>
        </div>
      </div>

      {/* Form tambah pengeluaran */}
      {showForm && (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '20px', marginBottom: '20px', boxSizing: 'border-box' }}>
          <h2 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px', marginTop: 0 }}>
            Form Pengeluaran Baru
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '14px' }}>
            <div style={{ gridColumn: isMobile ? 'auto' : '1 / -1' }}>
              <label style={{ fontSize: '12px', fontWeight: '500', color: '#374151', display: 'block', marginBottom: '5px' }}>
                Deskripsi Pengeluaran *
              </label>
              <input name="description" value={form.description} onChange={handleChange}
                placeholder="Contoh: Pembayaran Listrik Bulanan, Beli ATK..."
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '13.5px', outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: '500', color: '#374151', display: 'block', marginBottom: '5px' }}>
                Jumlah (IDR) *
              </label>
              <input name="amount" value={form.amount} onChange={handleChange}
                type="number" placeholder="0"
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '13.5px', outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: '500', color: '#374151', display: 'block', marginBottom: '5px' }}>
                Tanggal Pengeluaran *
              </label>
              <input name="date" value={form.date} onChange={handleChange} type="date"
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '13.5px', outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <div style={{ gridColumn: isMobile ? 'auto' : '1 / -1' }}>
              <label style={{ fontSize: '12px', fontWeight: '500', color: '#374151', display: 'block', marginBottom: '5px' }}>
                Kategori Operasional
              </label>
              <select name="category" value={form.category} onChange={handleChange}
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '13.5px', outline: 'none', background: '#fff', boxSizing: 'border-box' }}>
                <option value="">-- Pilih Kategori --</option>
                <option value="Operasional">Operasional Kantor</option>
                <option value="SDM">SDM / Bonus Gaji Karyawan</option>
                <option value="Infrastruktur">Utilitas (Listrik, Wifi, Air)</option>
                <option value="Pengadaan">Pengadaan Logistik / Alat</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: isMobile ? 'column-reverse' : 'row', justifyContent: 'flex-end', gap: '8px', marginTop: '16px', paddingTop: '14px', borderTop: '1px solid #e5e7eb' }}>
            <button type="button" onClick={() => setShowForm(false)} style={{ padding: '10px 16px', border: '1px solid #d1d5db', borderRadius: '8px', background: '#fff', fontSize: '13px', cursor: 'pointer', textAlign: 'center', width: isMobile ? '100%' : 'auto' }}>
              Batal
            </button>
            <button type="button" onClick={handleSubmit} style={{ padding: '10px 16px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', fontWeight: '500', textAlign: 'center', width: isMobile ? '100%' : 'auto' }}>
              Simpan Pengeluaran
            </button>
          </div>
        </div>
      )}

      {/* Tabel Pengeluaran */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', overflow: 'hidden', boxSizing: 'border-box' }}>
        <div style={{ padding: '14px 16px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '14px', fontWeight: '600' }}>Riwayat Pengeluaran Kantor</span>
          <span style={{ fontSize: '12px', color: '#6b7280' }}>{transactions.length} item</span>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '32px', color: '#6b7280', fontSize: '13px' }}>
            Memuat data pengeluaran kantor dari MySQL via Laravel...
          </div>
        ) : transactions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px', color: '#9ca3af' }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>📋</div>
            <div style={{ fontWeight: '500' }}>Belum ada pengeluaran dicatat</div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto', width: '100%' }}>
            <table style={{ width: '100%', minWidth: '600px', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                  {['Tanggal', 'Deskripsi Pengeluaran', 'Kategori', 'Jumlah', 'Aksi'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {transactions.map(t => (
                  <tr key={t.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '14px 16px', color: '#6b7280', whiteSpace: 'nowrap' }}>{t.date}</td>
                    <td style={{ padding: '14px 16px', fontWeight: '500' }}>{t.description}</td>
                    <td style={{ padding: '14px 16px' }}>
                      {t.category ? (
                        <span style={{ background: '#f3f4f6', color: '#374151', padding: '2px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: '500' }}>
                          {t.category}
                        </span>
                      ) : <span style={{ color: '#d1d5db' }}>—</span>}
                    </td>
                    <td style={{ padding: '14px 16px', fontWeight: '700', color: '#dc2626', whiteSpace: 'nowrap' }}>
                      -{formatRupiah(t.amount)}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <button type="button" onClick={() => handleDelete(t.id)} style={{ padding: '6px 12px', border: '1px solid #fca5a5', background: '#fff', color: '#ef4444', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}>
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}