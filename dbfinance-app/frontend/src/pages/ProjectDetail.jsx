import { useState, useEffect, useCallback } from 'react';

// FORMAT RUPIAH GLOBAL
const formatRupiah = (n) => 'Rp ' + Number(n).toLocaleString('id-ID');
const API_BASE_URL = 'http://66.96.229.251:20528/api';

export default function ProjectDetail({ project, onBack }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const isOffice =
    !Object.hasOwn(project, 'project_amount') ||
    Object.hasOwn(project, 'category_name') ||
    project.project_amount === undefined;

  const [form, setForm] = useState({
    type: isOffice ? 'pengeluaran' : 'pemasukan',
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    category: '',
  });

  // 1. Deteksi Ukuran Layar Responsif
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 2. UBAHAN: Ambil Data Transaksi dari API Laravel (MySQL)
  const fetchTransactions = useCallback(async (isMounted = true) => {
    try {
      const response = await fetch(`${API_BASE_URL}/projects/${project.id}/transactions`);
      if (!response.ok) throw new Error("Gagal memuat data dari server");

      const data = await response.json();
      if (isMounted) {
        setTransactions(data);
      }
    } catch (error) {
      console.error("Gagal mengambil data transaksi dari MySQL: ", error);
    } finally {
      if (isMounted) {
        setLoading(false);
      }
    }
  }, [project.id]);

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

  // 3. UBAHAN: Simpan Transaksi Baru ke API Laravel (MySQL)
  const handleSubmit = async () => {
    if (!form.description || !form.amount || !form.date) {
      alert('Deskripsi, jumlah, dan tanggal wajib diisi!');
      return;
    }

    try {
      const payload = {
        project_id: project.id,
        type: isOffice ? 'pengeluaran' : form.type,
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

      if (!response.ok) throw new Error("Gagal menyimpan transaksi ke server");

      setForm({
        type: isOffice ? 'pengeluaran' : 'pemasukan',
        description: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        category: ''
      });
      setShowForm(false);
      setLoading(true);

      await fetchTransactions(true);
    } catch (error) {
      console.error("Gagal menyimpan transaksi: ", error);
      alert("Terjadi masalah saat mencoba menyimpan data transaksi ke MySQL.");
    }
  };

  // 4. UBAHAN: Hapus Transaksi dari API Laravel (MySQL)
  const handleDelete = async (id) => {
    if (confirm('Apakah Anda yakin ingin menghapus transaksi ini?')) {
      try {
        const response = await fetch(`${API_BASE_URL}/transactions/${id}`, {
          method: 'DELETE',
          headers: {
            'Accept': 'application/json'
          }
        });

        if (!response.ok) throw new Error("Gagal menghapus data transaksi di server");

        setLoading(true);
        await fetchTransactions(true);
      } catch (error) {
        console.error("Gagal menghapus dokumen transaksi: ", error);
        alert("Gagal menghapus data dari database MySQL!");
      }
    }
  };

  if (isOffice) {
    return (
      <DetailPengeluaranKantorView
        project={project}
        transactions={transactions}
        // loading={loading}
        showForm={showForm}
        setShowForm={setShowForm}
        form={form}
        setForm={setForm}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
        handleDelete={handleDelete}
        onBack={onBack}
        isMobile={isMobile}
      />
    );
  }

  return (
    <DetailProjectView
      project={project}
      transactions={transactions}
      loading={loading}
      showForm={showForm}
      setShowForm={setShowForm}
      form={form}
      handleChange={handleChange}
      handleSubmit={handleSubmit}
      handleDelete={handleDelete}
      onBack={onBack}
      isMobile={isMobile}
    />
  );
}

// =========================================================================
// VIEW SUB-COMPONENTS (TETAP SAMA SEPERTI KODE ASLI ANDA)
// =========================================================================
function DetailPengeluaranKantorView({
  project, transactions, loading, showForm, setShowForm, form, handleChange, handleSubmit, handleDelete, onBack, isMobile
}) {
  const totalPengeluaran = transactions
    .filter(t => t.type === 'pengeluaran')
    .reduce((s, t) => s + Number(t.amount), 0);

  return (
    <div style={{ flex: 1, padding: isMobile ? '16px' : '24px', overflowY: 'auto', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#6b7280', marginBottom: '20px' }}>
        <span onClick={onBack} style={{ cursor: 'pointer', color: '#185FA5', fontWeight: '500' }}>← Kembali</span>
        <span>/</span>
        <span style={{ color: '#111827', fontWeight: '500' }}>{project.project_name}</span>
      </div>

      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '16px 20px', marginBottom: '20px', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'stretch' : 'center', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '4px', color: '#111827', lineHeight: '1.3' }}>
              Log Pengeluaran: {project.project_name}
            </h1>
            <div style={{ fontSize: '13px', color: '#4b5563' }}>Penanggung Jawab: <strong>{project.person_in_charge}</strong></div>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            style={{ padding: '10px 16px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', fontWeight: '500', textAlign: 'center', boxSizing: 'border-box', width: isMobile ? '100%' : 'auto' }}
          >
            {showForm ? '✕ Tutup Form' : '+ Catat Pengeluaran'}
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px', marginBottom: '20px' }}>
        <div style={{ background: '#FFF7F7', border: '1px solid #fecaca', borderRadius: '10px', padding: '14px 16px', boxSizing: 'border-box' }}>
          <div style={{ fontSize: '10px', color: '#991b1b', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>
            Total Pengeluaran Kas Kantor
          </div>
          <div style={{ fontSize: '22px', fontWeight: '700', color: '#dc2626', wordBreak: 'break-all' }}>
            {formatRupiah(totalPengeluaran)}
          </div>
          <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '2px' }}>
            Terakumulasi dari {transactions.length} riwayat laporan pengeluaran
          </div>
        </div>
      </div>

      {showForm && (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '20px', marginBottom: '20px', boxSizing: 'border-box' }}>
          <h2 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px', marginTop: 0 }}>Catat Pengeluaran Baru</h2>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '14px' }}>
            <div style={{ gridColumn: isMobile ? 'auto' : '1 / -1' }}>
              <label style={{ fontSize: '12px', fontWeight: '500', color: '#374151', display: 'block', marginBottom: '5px' }}>Deskripsi Pengeluaran *</label>
              <input name="description" value={form.description} onChange={handleChange} placeholder="Masukkan rincian pengeluaran operasional..." style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '13.5px', outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: '500', color: '#374151', display: 'block', marginBottom: '5px' }}>Jumlah (IDR) *</label>
              <input name="amount" value={form.amount} onChange={handleChange} type="number" placeholder="0" style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '13.5px', outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: '500', color: '#374151', display: 'block', marginBottom: '5px' }}>Tanggal *</label>
              <input name="date" value={form.date} onChange={handleChange} type="date" style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '13.5px', outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <div style={{ gridColumn: isMobile ? 'auto' : '1 / -1' }}>
              <label style={{ fontSize: '12px', fontWeight: '500', color: '#374151', display: 'block', marginBottom: '5px' }}>Kategori</label>
              <select name="category" value={form.category} onChange={handleChange} style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '13.5px', outline: 'none', background: '#fff', boxSizing: 'border-box' }}>
                <option value="">-- Pilih Kategori --</option>
                <option value="Operasional">Operasional</option>
                <option value="SDM">SDM / Gaji</option>
                <option value="Infrastruktur">Infrastruktur</option>
                <option value="Pengadaan">Pengadaan</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: isMobile ? 'column-reverse' : 'row', justifyContent: 'flex-end', gap: '8px', marginTop: '16px', paddingTop: '14px', borderTop: '1px solid #e5e7eb' }}>
            <button type="button" onClick={() => setShowForm(false)} style={{ padding: '10px 16px', border: '1px solid #d1d5db', borderRadius: '8px', background: '#fff', fontSize: '13px', cursor: 'pointer', textAlign: 'center', width: isMobile ? '100%' : 'auto' }}>Batal</button>
            <button type="button" onClick={handleSubmit} style={{ padding: '10px 16px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', fontWeight: '500', textAlign: 'center', width: isMobile ? '100%' : 'auto' }}>Simpan Pengeluaran</button>
          </div>
        </div>
      )}

      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', overflow: 'hidden', boxSizing: 'border-box' }}>
        <div style={{ padding: '14px 16px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '14px', fontWeight: '600' }}>Riwayat Transaksi Pengeluaran</span>
          <span style={{ fontSize: '12px', color: '#6b7280' }}>{transactions.length} item</span>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '32px', color: '#6b7280', fontSize: '13px' }}>Memuat riwayat transaksi kas...</div>
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
                  {['Tanggal', 'Deskripsi Pengeluaran', 'Kategori', 'Tipe', 'Jumlah', 'Aksi'].map(h => (
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
                        <span style={{ background: '#f3f4f6', color: '#374151', padding: '2px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: '500' }}>{t.category}</span>
                      ) : <span style={{ color: '#d1d5db' }}>—</span>}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600', background: '#FFF7F7', color: '#dc2626', whiteSpace: 'nowrap' }}>↓ Pengeluaran</span>
                    </td>
                    <td style={{ padding: '14px 16px', fontWeight: '700', color: '#dc2626', whiteSpace: 'nowrap' }}>
                      -{formatRupiah(t.amount)}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <button type="button" onClick={() => handleDelete(t.id)} style={{ padding: '6px 12px', border: '1px solid #fca5a5', background: '#fff', color: '#ef4444', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}>Hapus</button>
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

function DetailProjectView({
  project, transactions, showForm, setShowForm, form, handleChange, handleSubmit, handleDelete, onBack, isMobile
}) {
  const totalPemasukan = transactions
    .filter(t => t.type === 'pemasukan')
    .reduce((s, t) => s + Number(t.amount), 0);

  const totalPengeluaran = transactions
    .filter(t => t.type === 'pengeluaran')
    .reduce((s, t) => s + Number(t.amount), 0);

  const saldoKas = totalPemasukan - totalPengeluaran;
  const anggaranProject = Number(project.project_amount || 0);
  const sisaAnggaran = anggaranProject - totalPengeluaran;

  const persen = anggaranProject > 0
    ? Math.min(100, Math.round((totalPengeluaran / anggaranProject) * 100))
    : 0;

  return (
    <div style={{ flex: 1, padding: isMobile ? '16px' : '24px', overflowY: 'auto', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#6b7280', marginBottom: '20px' }}>
        <span onClick={onBack} style={{ cursor: 'pointer', color: '#185FA5', fontWeight: '500' }}>← Kembali</span>
        <span>/</span>
        <span style={{ color: '#111827', fontWeight: '500' }}>{project.project_name}</span>
      </div>

      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '16px 20px', marginBottom: '20px', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'stretch' : 'flex-start', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '6px', color: '#111827', lineHeight: '1.3' }}>{project.project_name}</h1>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '13px', color: '#4b5563' }}>
              <div>Penanggung Jawab: <strong>{project.person_in_charge}</strong></div>
              <div>Anggaran Awal: <strong style={{ color: '#111827' }}>{formatRupiah(anggaranProject)}</strong></div>
            </div>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            style={{ padding: '10px 16px', background: '#185FA5', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', fontWeight: '500', textAlign: 'center', boxSizing: 'border-box', width: isMobile ? '100%' : 'auto' }}
          >
            {showForm ? '✕ Tutup Form' : '+ Tambah Transaksi'}
          </button>
        </div>

        <div style={{ marginTop: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#6b7280', marginBottom: '6px' }}>
            <span>Penyerapan Anggaran</span>
            <span style={{ fontWeight: '600', color: persen > 90 ? '#ef4444' : persen > 70 ? '#f59e0b' : '#185FA5' }}>{persen}%</span>
          </div>
          <div style={{ height: '8px', background: '#e5e7eb', borderRadius: '99px', overflow: 'hidden' }}>
            <div style={{ height: '100%', borderRadius: '99px', transition: 'width 0.4s ease', width: persen + '%', background: persen > 90 ? '#ef4444' : persen > 70 ? '#f59e0b' : '#185FA5' }} />
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : window.innerWidth <= 1024 ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' }}>
        <div style={{ background: sisaAnggaran >= 0 ? '#F0FDF4' : '#FFF7F7', border: sisaAnggaran >= 0 ? '1px solid #bbf7d0' : '1px solid #fecaca', borderRadius: '10px', padding: '14px 16px', boxSizing: 'border-box' }}>
          <div style={{ fontSize: '10px', color: sisaAnggaran >= 0 ? '#166534' : '#991b1b', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>Sisa Anggaran</div>
          <div style={{ fontSize: '16px', fontWeight: '700', color: sisaAnggaran >= 0 ? '#15803d' : '#dc2626', wordBreak: 'break-all' }}>{sisaAnggaran < 0 ? '-' : ''}{formatRupiah(Math.abs(sisaAnggaran))}</div>
          <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '2px' }}>dari {formatRupiah(anggaranProject)}</div>
        </div>

        <div style={{ background: '#F0FDF4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '14px 16px', boxSizing: 'border-box' }}>
          <div style={{ fontSize: '10px', color: '#166534', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>Total Pemasukan</div>
          <div style={{ fontSize: '16px', fontWeight: '700', color: '#15803d', wordBreak: 'break-all' }}>{formatRupiah(totalPemasukan)}</div>
          <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '2px' }}>{transactions.filter(t => t.type === 'pemasukan').length} transaksi</div>
        </div>

        <div style={{ background: '#FFF7F7', border: '1px solid #fecaca', borderRadius: '10px', padding: '14px 16px', boxSizing: 'border-box' }}>
          <div style={{ fontSize: '10px', color: '#991b1b', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>Total Pengeluaran</div>
          <div style={{ fontSize: '16px', fontWeight: '700', color: '#dc2626', wordBreak: 'break-all' }}>{formatRupiah(totalPengeluaran)}</div>
          <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '2px' }}>{transactions.filter(t => t.type === 'pengeluaran').length} transaksi</div>
        </div>

        <div style={{ background: saldoKas >= 0 ? '#EFF6FF' : '#FFF7F7', border: saldoKas >= 0 ? '1px solid #bfdbfe' : '1px solid #fecaca', borderRadius: '10px', padding: '14px 16px', boxSizing: 'border-box' }}>
          <div style={{ fontSize: '10px', color: saldoKas >= 0 ? '#1e40af' : '#991b1b', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>Saldo Kas</div>
          <div style={{ fontSize: '16px', fontWeight: '700', color: saldoKas >= 0 ? '#1d4ed8' : '#dc2626', wordBreak: 'break-all' }}>{saldoKas < 0 ? '-' : ''}{formatRupiah(Math.abs(saldoKas))}</div>
          <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '2px' }}>kondisi: {saldoKas >= 0 ? 'surplus' : 'defisit'}</div>
        </div>
      </div>

      {showForm && (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '20px', marginBottom: '20px', boxSizing: 'border-box' }}>
          <h2 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px', marginTop: 0 }}>Tambah Transaksi Baru</h2>

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '14px' }}>
            <div style={{ gridColumn: isMobile ? 'auto' : '1 / -1' }}>
              <label style={{ fontSize: '12px', fontWeight: '500', color: '#374151', display: 'block', marginBottom: '5px' }}>Deskripsi *</label>
              <input name="description" value={form.description} onChange={handleChange} placeholder="Contoh: Pembayaran termin 1, Pembelian Material..." style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '13.5px', outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: '500', color: '#374151', display: 'block', marginBottom: '5px' }}>Jumlah (IDR) *</label>
              <input name="amount" value={form.amount} onChange={handleChange} type="number" placeholder="0" style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '13.5px', outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: '500', color: '#374151', display: 'block', marginBottom: '5px' }}>Tanggal *</label>
              <input name="date" value={form.date} onChange={handleChange} type="date" style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '13.5px', outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <div style={{ gridColumn: isMobile ? 'auto' : '1 / -1' }}>
              <label style={{ fontSize: '12px', fontWeight: '500', color: '#374151', display: 'block', marginBottom: '5px' }}>Kategori</label>
              <select name="category" value={form.category} onChange={handleChange} style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '13.5px', outline: 'none', background: '#fff', boxSizing: 'border-box' }}>
                <option value="">-- Pilih Kategori --</option>
                <option value="Operasional">Operasional</option>
                <option value="SDM">SDM / Gaji</option>
                <option value="Infrastruktur">Infrastruktur</option>
                <option value="Pengadaan">Pengadaan</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: isMobile ? 'column-reverse' : 'row', justifyContent: 'flex-end', gap: '8px', marginTop: '16px', paddingTop: '14px', borderTop: '1px solid #e5e7eb' }}>
            <button type="button" onClick={() => setShowForm(false)} style={{ padding: '10px 16px', border: '1px solid #d1d5db', borderRadius: '8px', background: '#fff', fontSize: '13px', cursor: 'pointer', textAlign: 'center', width: isMobile ? '100%' : 'auto' }}>Batal</button>
            <button type="button" onClick={handleSubmit} style={{ padding: '10px 16px', background: '#185FA5', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', fontWeight: '500', textAlign: 'center', width: isMobile ? '100%' : 'auto' }}>Simpan Transaksi</button>
          </div>
        </div>
      )}

      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', overflow: 'hidden', boxSizing: 'border-box' }}>
        <div style={{ padding: '14px 16px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '14px', fontWeight: '600' }}>Riwayat Transaksi Proyek</span>
          <span style={{ fontSize: '12px', color: '#6b7280' }}>{transactions.length} transaksi</span>
        </div>

        <div style={{ overflowX: 'auto', width: '100%' }}>
          <table style={{ width: '100%', minWidth: '700px', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                {['Tanggal', 'Deskripsi', 'Kategori', 'Tipe', 'Jumlah', 'Saldo Setelah', 'Aksi'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(() => {
                const sorted = [...transactions].reverse();

                let running = Number(anggaranProject || 0);

                const withBalance = [];

                sorted.forEach(t => {
                  const transactionAmount = Number(t.amount || 0);

                  if (t.type === 'pengeluaran') {
                    running = running - transactionAmount;
                  } else {
                    running = running + transactionAmount;
                  }

                  withBalance.push({
                    ...t,
                    runningBalance: running,
                  });
                });

                return withBalance.reverse().map(t => (
                  <tr key={t.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '14px 16px', color: '#6b7280', whiteSpace: 'nowrap' }}>{t.date}</td>
                    <td style={{ padding: '14px 16px', fontWeight: '500' }}>{t.description}</td>
                    <td style={{ padding: '14px 16px' }}>{t.category || '—'}</td>
                    <td style={{ padding: '14px 16px' }}>{t.type}</td>
                    <td style={{ padding: '14px 16px', fontWeight: '700' }}>{formatRupiah(t.amount)}</td>
                    <td style={{ padding: '14px 16px', fontWeight: '600' }}>{formatRupiah(t.runningBalance)}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <button type="button" onClick={() => handleDelete(t.id)} style={{ padding: '6px 12px', border: '1px solid #fca5a5', background: '#fff', color: '#ef4444', borderRadius: '6px', fontSize: '12px' }}>Hapus</button>
                    </td>
                  </tr>
                ));
              })()}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}