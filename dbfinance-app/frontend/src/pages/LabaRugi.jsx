import { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';

const API_URL = 'http://127.0.0.1:8000/api/reports/laba-rugi';

export default function LabaRugi() {
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // State Data Keuangan
  const [pendapatanJasa, setPendapatanJasa] = useState(0);
  const [piutangUsaha] = useState(0); 
  const [biayaAdminDetail, setBiayaAdminDetail] = useState([]);
  const [totalBiayaAdmin, setTotalBiayaAdmin] = useState(0);
  const [biayaOperasional, setBiayaOperasional] = useState(0);
  const [periodeLabel, setPeriodeLabel] = useState('');

  // 1. Deteksi Layar Responsif
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 2. UBAHAN: Ambil & Hitung Data dari API Laravel (MySQL)
  useEffect(() => {
    let isMounted = true;

    const calculateLabaRugi = async () => {
      try {
        if (isMounted) setLoading(true);

        const response = await fetch(API_URL);
        if (!response.ok) throw new Error("Gagal memuat data laporan laba rugi");
        const data = await response.json();

        // Buat label periode otomatis
        const now = new Date();
        const bulan = now.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
        setPeriodeLabel(bulan);

        if (isMounted) {
          setPendapatanJasa(data.pendapatanJasa);
          setBiayaAdminDetail(data.biayaAdminDetail);
          setTotalBiayaAdmin(data.totalBiayaAdmin);
          setBiayaOperasional(data.biayaOperasional);
        }
      } catch (error) {
        console.error("Gagal menyusun laporan laba rugi dari MySQL:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    calculateLabaRugi();
    return () => { isMounted = false; };
  }, []);

  const formatRupiah = (n) => 'Rp ' + Number(n).toLocaleString('id-ID');
  const formatRupiahExcel = (n) => Number(n);

  // Kalkulasi Final
  const totalPendapatan = pendapatanJasa + piutangUsaha;
  const totalBiayaUmum = totalBiayaAdmin + biayaOperasional;
  const labaBersih = totalPendapatan - totalBiayaUmum;

  // =====================================================================
  // FUNGSI UNDUH EXCEL
  // =====================================================================
  const handleDownloadExcel = () => {
    const wb = XLSX.utils.book_new();
    const rows = [];

    rows.push(['LAPORAN LABA RUGI']);
    rows.push(['DBFinance Management']);
    rows.push([`Periode: ${periodeLabel}`]);
    rows.push([]);

    rows.push(['A.  PEREDARAAN USAHA (OMZET)', '', '', '', '']);
    rows.push(['Pendapatan Jasa', '', '', 'Rp.', formatRupiahExcel(pendapatanJasa)]);
    rows.push(['Piutang Usaha', '', '', 'Rp.', formatRupiahExcel(piutangUsaha)]);
    rows.push(['', '', '', 'Rp.', formatRupiahExcel(totalPendapatan)]);
    rows.push([]);

    rows.push(['B.  BIAYA UMUM DAN ADMINISTRASI', '', '', '', '']);
    biayaAdminDetail.forEach(({ kategori, jumlah }) => {
      rows.push([kategori, '', 'Rp.', jumlah, '']);
    });
    rows.push(['Operasional', '', 'Rp.', formatRupiahExcel(biayaOperasional), '']);
    rows.push([]);
    rows.push(['Jumlah Biaya Umum dan Administrasi', '', '', 'Rp.', formatRupiahExcel(totalBiayaUmum)]);
    rows.push([]);
    rows.push([]);

    rows.push([labaBersih >= 0 ? '(Laba)' : '(Rugi)', '', '', 'Rp.', formatRupiahExcel(labaBersih)]);

    const ws = XLSX.utils.aoa_to_sheet(rows);

    ws['!cols'] = [
      { wch: 42 }, 
      { wch: 4 },  
      { wch: 6 },  
      { wch: 18 }, 
      { wch: 18 }, 
    ];

    const rupiahFmt = '#,##0';

    rows.forEach((row, ri) => {
      ['D', 'E'].forEach((col) => {
        const cellAddr = col + (ri + 1);
        if (ws[cellAddr] && typeof ws[cellAddr].v === 'number') {
          ws[cellAddr].t = 'n';
          ws[cellAddr].z = rupiahFmt;
        }
      });
    });

    ws['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 4 } }, 
      { s: { r: 1, c: 0 }, e: { r: 1, c: 4 } }, 
      { s: { r: 2, c: 0 }, e: { r: 2, c: 4 } }, 
    ];

    XLSX.utils.book_append_sheet(wb, ws, 'Laba Rugi');

    const fileName = `Laporan_Laba_Rugi_${periodeLabel.replace(/\s/g, '_')}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  return (
    <div style={{ flex: 1, padding: isMobile ? '16px' : '24px', overflowY: 'auto', boxSizing: 'border-box', background: '#f8fafc' }}>

      {/* ---- PAGE HEADER ---- */}
      <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', marginBottom: '24px', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '18px', fontWeight: '600', margin: 0, color: '#0f172a' }}>Laporan Laba Rugi</h1>
          <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px', margin: 0 }}>Rekapitulasi pendapatan & biaya operasional periode berjalan</p>
        </div>
        <button
          onClick={handleDownloadExcel}
          disabled={loading}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px',
            background: loading ? '#94a3b8' : '#166534', color: '#fff', border: 'none', borderRadius: '6px',
            fontSize: '12.5px', fontWeight: '500', cursor: loading ? 'not-allowed' : 'pointer',
            width: isMobile ? '100%' : 'auto', justifyContent: 'center', boxSizing: 'border-box', transition: 'background 0.2s'
          }}
          onMouseOver={e => { if (!loading) e.currentTarget.style.background = '#14532d'; }}
          onMouseOut={e => { if (!loading) e.currentTarget.style.background = '#166534'; }}
        >
          <span>📊</span> Unduh Excel
        </button>
      </div>

      {/* ---- GRAND TOTAL SUMMARY CARDS ---- */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '12px', marginBottom: '24px' }}>
        {[
          { label: 'Total Pendapatan (Omzet)', value: loading ? '...' : formatRupiah(totalPendapatan), color: '#15803d', bg: '#F0FDF4', border: '#bbf7d0' },
          { label: 'Total Pengeluaran & Biaya', value: loading ? '...' : formatRupiah(totalBiayaUmum), color: '#dc2626', bg: '#FFF7F7', border: '#fecaca' },
          { 
            label: labaBersih >= 0 ? 'Sisa Laba Bersih' : 'Sisa Rugi Bersih', 
            value: loading ? '...' : formatRupiah(Math.abs(labaBersih)), 
            color: labaBersih >= 0 ? '#1d4ed8' : '#dc2626', 
            bg: labaBersih >= 0 ? '#EFF6FF' : '#FFF7F7', 
            border: labaBersih >= 0 ? '#bfdbfe' : '#fecaca' 
          },
        ].map((s, i) => (
          <div key={i} style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: '10px', padding: '14px 16px', boxSizing: 'border-box' }}>
            <div style={{ fontSize: '10px', fontWeight: '600', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px', color: s.color }}>{s.label}</div>
            <div style={{ fontSize: '16px', fontWeight: '700', color: s.color, wordBreak: 'break-all' }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* ---- DOKUMEN LAPORAN MODERN TABULAR CONTAINER ---- */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', overflow: 'hidden', boxSizing: 'border-box', maxWidth: '100%', margin: '0 auto' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '48px', color: '#6b7280', fontSize: '13px' }}>Sinkronisasi dan kalkulasi data keuangan dari MySQL...</div>
        ) : (
          <>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #e5e7eb', display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', background: '#f9fafb', gap: '8px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ fontSize: '15px', fontWeight: '600', color: '#0f172a' }}>DBFinance Management</div>
                  <span style={{ fontSize: '10px', fontWeight: '600', padding: '2px 8px', borderRadius: '4px', background: '#E2E8F0', color: '#334155' }}>LABA RUGI</span>
                </div>
                <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>Periode Akuntansi berjalan: {periodeLabel}</div>
              </div>
            </div>

            <div style={{ overflowX: 'auto', width: '100%' }}>
              <table style={{ width: '100%', minWidth: '600px', borderCollapse: 'collapse', fontSize: '13px', tableLayout: 'fixed' }}>
                <colgroup>
                  <col style={{ width: '55%' }} />
                  <col style={{ width: '5%' }} />
                  <col style={{ width: '20%' }} />
                  <col style={{ width: '20%' }} />
                </colgroup>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e5e7eb' }}>
                    {['Deskripsi Akun / Kategori', '', 'Nilai Parsial', 'Total Kumulatif'].map((h, idx) => (
                      <th key={idx} style={{ padding: '10px 20px', textAlign: idx >= 2 ? 'right' : 'left', fontSize: '10px', fontWeight: '600', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ background: '#f8fafc' }}>
                    <td colSpan={4} style={{ fontWeight: '700', fontSize: '12px', padding: '12px 20px', color: '#1e293b', letterSpacing: '0.3px', borderBottom: '1px solid #e5e7eb' }}>A.&nbsp;&nbsp;PEREDARAAN USAHA (OMZET)</td>
                  </tr>
                  <Row label="Pendapatan Jasa" nilaiKiri={pendapatanJasa} showKiri={true} fmt={formatRupiah} />
                  <Row label="Piutang Usaha" nilaiKiri={piutangUsaha} showKiri={true} fmt={formatRupiah} isZero={piutangUsaha === 0} />
                  <tr style={{ borderBottom: '1px solid #e5e7eb', background: '#fdfdfd' }}>
                    <td colSpan={2} style={{ padding: '12px 20px', fontWeight: '600', color: '#475569', fontStyle: 'italic' }}>Total Peredaran Usaha Bersih</td>
                    <td></td>
                    <td style={{ fontWeight: '700', padding: '12px 20px', textAlign: 'right', color: '#15803d', fontSize: '14px' }}>{formatRupiah(totalPendapatan)}</td>
                  </tr>

                  <tr style={{ background: '#f8fafc' }}>
                    <td colSpan={4} style={{ fontWeight: '700', fontSize: '12px', padding: '12px 20px', color: '#1e293b', letterSpacing: '0.3px', borderBottom: '1px solid #e5e7eb' }}>B.&nbsp;&nbsp;BIAYA UMUM DAN ADMINISTRASI</td>
                  </tr>
                  {biayaAdminDetail.length === 0 ? (
                    <tr>
                      <td colSpan={4} style={{ color: '#94a3b8', fontSize: '12px', fontStyle: 'italic', padding: '12px 20px' }}>Tidak ada data pengeluaran kas kantor</td>
                    </tr>
                  ) : (
                    biayaAdminDetail.map(({ kategori, jumlah }, idx) => (
                      <Row key={idx} label={kategori} nilaiKiri={jumlah} showKiri={true} fmt={formatRupiah} indent />
                    ))
                  )}
                  <Row label="Operasional" nilaiKiri={biayaOperasional} showKiri={true} fmt={formatRupiah} indent />

                  <tr style={{ borderBottom: '1px solid #e5e7eb', background: '#fdfdfd' }}>
                    <td colSpan={2} style={{ padding: '12px 20px', fontWeight: '600', color: '#475569', fontStyle: 'italic' }}>Jumlah Pengeluaran Operasional & Admin</td>
                    <td></td>
                    <td style={{ fontWeight: '700', padding: '12px 20px', textAlign: 'right', color: '#dc2626', fontSize: '14px' }}>{formatRupiah(totalBiayaUmum)}</td>
                  </tr>

                  <tr style={{ background: labaBersih >= 0 ? '#F0FDF4' : '#FFF7F7' }}>
                    <td colSpan={2} style={{ fontWeight: '700', fontSize: '14px', padding: '16px 20px', color: labaBersih >= 0 ? '#166534' : '#b91c1c' }}>KONDISI KEUANGAN AKHIR: {labaBersih >= 0 ? 'TOTAL LABA BERSIH' : 'TOTAL RUGI BERSIH'}</td>
                    <td></td>
                    <td style={{ fontWeight: '800', fontSize: '15px', padding: '16px 20px', textAlign: 'right', color: labaBersih >= 0 ? '#166534' : '#b91c1c' }}>{formatRupiah(Math.abs(labaBersih))}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Row({ label, nilaiKiri, showKiri, fmt, indent = false, isZero = false }) {
  return (
    <tr style={{ borderBottom: '1px solid #f3f4f6', transition: 'background 0.2s' }}>
      <td style={{ padding: '12px 20px', paddingLeft: indent ? '36px' : '20px', color: '#374151', fontWeight: indent ? '400' : '500' }}>
        {indent ? `• ${label}` : label}
      </td>
      <td></td>
      <td style={{ textAlign: 'right', padding: '12px 20px', color: '#0f172a', fontVariantNumeric: 'tabular-nums', fontWeight: '500' }}>
        {showKiri ? (isZero ? <span style={{ color: '#cbd5e1' }}>—</span> : fmt(nilaiKiri)) : ''}
      </td>
      <td></td>
    </tr>
  );
}