import { useState, useEffect } from 'react';

// URL Endpoint dari Server Laravel API yang mengambil data project murni
const API_URL = 'http://66.96.229.251:20527/api/projects';

export default function BukuBesar() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
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

  // 2. UBAHAN: Ambil data project terbaru dari API Laravel (MySQL)
  useEffect(() => {
    let isMounted = true;

    const fetchBukuBesarData = async () => {
      try {
        if (isMounted) setLoading(true);
        
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error("Gagal mengambil data buku besar");
        
        const data = await response.json();

        if (isMounted) setProjects(data);
      } catch (error) {
        console.error("Gagal memuat rekap buku besar dari MySQL: ", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchBukuBesarData();

    return () => {
      isMounted = false;
    };
  }, []);

  const formatRupiah = (n) => 'Rp ' + Number(n).toLocaleString('id-ID');

  // 3. Kalkulasi Grand Total untuk baris paling bawah tabel
  const grandTotalKotor = projects.reduce((sum, p) => sum + Number(p.project_raw_amount || p.project_amount || 0), 0);
  const grandTotalPPN = projects.reduce((sum, p) => sum + Number(p.tax_value_deduction || 0), 0);
  const grandTotalBersih = projects.reduce((sum, p) => sum + Number(p.project_amount || 0), 0);

  return (
    <div style={{ flex: 1, padding: isMobile ? '16px' : '24px', overflowY: 'auto', boxSizing: 'border-box' }}>
      
      {/* Header Menu */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '18px', fontWeight: '600', margin: 0 }}>Buku Besar Keuangan Project</h1>
        <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px', marginBottom: 0 }}>
          Rekapitulasi otomatis nilai kontrak, alokasi pajak PPN, dan anggaran bersih seluruh kegiatan (Database MySQL)
        </p>
      </div>

      {/* Widget Ringkasan Atas */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
        gap: '12px',
        marginBottom: '24px'
      }}>
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '14px 16px', boxSizing: 'border-box' }}>
          <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Kontrak Kotor</div>
          <div style={{ fontSize: '18px', fontWeight: '700', color: '#334155' }}>{loading ? '...' : formatRupiah(grandTotalKotor)}</div>
        </div>
        <div style={{ background: '#FFF7F7', border: '1px solid #fecaca', borderRadius: '10px', padding: '14px 16px', boxSizing: 'border-box' }}>
          <div style={{ fontSize: '11px', color: '#991b1b', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total PPN Terpotong</div>
          <div style={{ fontSize: '18px', fontWeight: '700', color: '#dc2626' }}>{loading ? '...' : formatRupiah(grandTotalPPN)}</div>
        </div>
        <div style={{ background: '#F0FDF4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '14px 16px', boxSizing: 'border-box' }}>
          <div style={{ fontSize: '11px', color: '#166534', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Anggaran Bersih</div>
          <div style={{ fontSize: '18px', fontWeight: '700', color: '#15803d' }}>{loading ? '...' : formatRupiah(grandTotalBersih)}</div>
        </div>
      </div>

      {/* Tabel Utama Buku Besar */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', overflow: 'hidden', width: '100%' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '48px', color: '#6b7280', fontSize: '13px' }}>
            Menghitung akumulasi data buku besar dari MySQL...
          </div>
        ) : projects.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px', color: '#9ca3af' }}>
            <div style={{ fontSize: '36px', marginBottom: '10px' }}>📖</div>
            <div style={{ fontWeight: '500' }}>Buku besar masih kosong</div>
            <div style={{ fontSize: '13px', marginTop: '4px' }}>Belum ada data project yang terakumulasi di database.</div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto', width: '100%' }}>
            <table style={{ width: '100%', minWidth: '750px', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e5e7eb', background: '#f9fafb' }}>
                  <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '11px', fontWeight: '600', color: '#6b7280', width: '50px' }}>NO</th>
                  <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '11px', fontWeight: '600', color: '#6b7280' }}>PEKERJAAN / KEGIATAN</th>
                  <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '11px', fontWeight: '600', color: '#6b7280' }}>PENANGGUNG JAWAB</th>
                  <th style={{ padding: '14px 16px', textAlign: 'right', fontSize: '11px', fontWeight: '600', color: '#6b7280' }}>BESARAN AWAL (KOTOR)</th>
                  <th style={{ padding: '14px 16px', textAlign: 'center', fontSize: '11px', fontWeight: '600', color: '#6b7280' }}>TARIF PPN</th>
                  <th style={{ padding: '14px 16px', textAlign: 'right', fontSize: '11px', fontWeight: '600', color: '#6b7280' }}>NILAI PPN</th>
                  <th style={{ padding: '14px 16px', textAlign: 'right', fontSize: '11px', fontWeight: '600', color: '#6b7280' }}>ANGGARAN BERSIH</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((p, i) => {
                  const kotor = Number(p.project_raw_amount || p.project_amount || 0);
                  const tarifPPN = Number(p.tax_rate_percent || 0);
                  const nilaiPPN = Number(p.tax_value_deduction || 0);
                  const bersih = Number(p.project_amount || 0);

                  return (
                    <tr key={p.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '14px 16px', color: '#9ca3af', fontWeight: '500' }}>
                        {String(i + 1).padStart(2, '0')}
                      </td>
                      <td style={{ padding: '14px 16px', fontWeight: '600', color: '#111827' }}>
                        {p.project_name}
                      </td>
                      <td style={{ padding: '14px 16px', color: '#4b5563' }}>
                        {p.person_in_charge}
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'right', fontWeight: '500', color: '#334155' }}>
                        {formatRupiah(kotor)}
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                        <span style={{
                          fontSize: '11px',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          background: tarifPPN > 0 ? '#fee2e2' : '#f3f4f6',
                          color: tarifPPN > 0 ? '#991b1b' : '#4b5563',
                          fontWeight: '600'
                        }}>
                          {tarifPPN}%
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'right', fontWeight: '500', color: '#dc2626' }}>
                        {formatRupiah(nilaiPPN)}
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'right', fontWeight: '700', color: '#15803d' }}>
                        {formatRupiah(bersih)}
                      </td>
                    </tr>
                  );
                })}

                {/* BARIS TOTAL AKUMULASI BAWAH */}
                <tr style={{ background: '#f8fafc', borderTop: '2px solid #e2e8f0', fontWeight: '700' }}>
                  <td colSpan="3" style={{ padding: '16px', textAlign: 'center', color: '#0f172a', fontSize: '12px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                    TOTAL REKAPITULASI
                  </td>
                  <td style={{ padding: '16px', textAlign: 'right', color: '#334155', fontSize: '13px' }}>
                    {formatRupiah(grandTotalKotor)}
                  </td>
                  <td style={{ background: '#f1f5f9' }}></td>
                  <td style={{ padding: '16px', textAlign: 'right', color: '#dc2626', fontSize: '13px' }}>
                    {formatRupiah(grandTotalPPN)}
                  </td>
                  <td style={{ padding: '16px', textAlign: 'right', color: '#15803d', fontSize: '14px' }}>
                    {formatRupiah(grandTotalBersih)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}