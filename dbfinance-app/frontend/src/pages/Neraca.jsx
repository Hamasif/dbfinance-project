import { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';

const API_BASE_URL = 'http://66.96.229.251:8000/api';

export default function Neraca() {
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // =====================================================================
  // STATE DATA KEUANGAN NERACA (Dinamis dengan Database MySQL)
  // =====================================================================
  const [kasBank, setKasBank] = useState(0);
  const [piutangUsaha, setPiutangUsaha] = useState(0);
  const [piutangLain, setPiutangLain] = useState(0);
  const [persediaan, setPersediaan] = useState(0);
  const [tanah, setTanah] = useState(0);
  const [bangunan, setBangunan] = useState(0);
  const [kendaraan, setKendaraan] = useState(0);
  const [akmPenyKendaraan, setAkmPenyKendaraan] = useState(0);
  const [alatKantor, setAlatKantor] = useState(0);
  const [akmPenyAlat, setAkmPenyAlat] = useState(0);

  const [utangBankPendek, setUtangBankPendek] = useState(0);
  const [utangDagang, setUtangDagang] = useState(0);
  const [utangLain, setUtangLain] = useState(0);
  const [utangBankPanjang, setUtangBankPanjang] = useState(0);
  const [labaDitahan, setLabaDitahan] = useState(0);
  
  const modalDisetor = 510000000; 
  
  const [labaBerjalan, setLabaBerjalan] = useState(0);
  const [periodeLabel, setPeriodeLabel] = useState('');

  // Deteksi Layar Responsif
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 1024);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 1. Ambil & Hitung Seluruh Data dari API Laravel (MySQL) saat Halaman Dimuat
  useEffect(() => {
    let isMounted = true;
    
    const loadAllNeracaData = async () => {
      try {
        if (isMounted) setLoading(true);

        const now = new Date();
        const bulan = now.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
        setPeriodeLabel(bulan);

        // A. Ambil nilai nominal akun neraca dari MySQL
        const settingsRes = await fetch(`${API_BASE_URL}/neraca-settings`);
        const settingsData = await settingsRes.json();

        // B. Ambil nilai laba berjalan dari API Laba Rugi terpusat
        const labaRes = await fetch(`${API_BASE_URL}/reports/laba-rugi`);
        const labaData = await labaRes.json();

        if (isMounted) {
          setKasBank(Number(settingsData.kas_bank));
          setPiutangUsaha(Number(settingsData.piutang_usaha));
          setPiutangLain(Number(settingsData.piutang_lain));
          setPersediaan(Number(settingsData.persediaan));
          setTanah(Number(settingsData.tanah));
          setBangunan(Number(settingsData.bangunan));
          setKendaraan(Number(settingsData.kendaraan));
          setAkmPenyKendaraan(Number(settingsData.akm_peny_kendaraan));
          setAlatKantor(Number(settingsData.alat_kantor));
          setAkmPenyAlat(Number(settingsData.akm_peny_alat));
          setUtangBankPendek(Number(settingsData.utang_bank_pendek));
          setUtangDagang(Number(settingsData.utang_dagang));
          setUtangLain(Number(settingsData.utang_lain));
          setUtangBankPanjang(Number(settingsData.utang_bank_panjang));
          setLabaDitahan(Number(settingsData.laba_ditahan));
          
          setLabaBerjalan(labaData.pendapatanJasa - (labaData.totalBiayaAdmin + labaData.biayaOperasional));
        }
      } catch (error) {
        console.error("Gagal menyinkronkan data neraca dari MySQL:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadAllNeracaData();
    return () => { isMounted = false; };
  }, []);

  // 2. Fungsi Kirim/Simpan Perubahan ke Database MySQL (Dijalankan pas nilai input bergeser/blur)
  const saveToDatabase = async (updatedFields) => {
    try {
      await fetch(`${API_BASE_URL}/neraca-settings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          kas_bank: updatedFields.kas_bank ?? kasBank,
          piutang_usaha: updatedFields.piutang_usaha ?? piutangUsaha,
          piutang_lain: updatedFields.piutang_lain ?? piutangLain,
          persediaan: updatedFields.persediaan ?? persediaan,
          tanah: updatedFields.tanah ?? tanah,
          bangunan: updatedFields.bangunan ?? bangunan,
          kendaraan: updatedFields.kendaraan ?? kendaraan,
          akm_peny_kendaraan: updatedFields.akm_peny_kendaraan ?? akmPenyKendaraan,
          alat_kantor: updatedFields.alat_kantor ?? alatKantor,
          akm_peny_alat: updatedFields.akm_peny_alat ?? akmPenyAlat,
          utang_bank_pendek: updatedFields.utang_bank_pendek ?? utangBankPendek,
          utang_dagang: updatedFields.utang_dagang ?? utangDagang,
          utang_lain: updatedFields.utang_lain ?? utangLain,
          utang_bank_panjang: updatedFields.utang_bank_panjang ?? utangBankPanjang,
          laba_ditahan: updatedFields.laba_ditahan ?? labaDitahan,
        })
      });
    } catch (error) {
      console.error("Gagal menyimpan perubahan ke MySQL:", error);
    }
  };

  const formatRupiah = (n) => {
    if (n === 0) return 'Rp 0';
    const tanda = n < 0 ? '-Rp ' : 'Rp ';
    return tanda + Math.abs(Number(n)).toLocaleString('id-ID');
  };

  // =====================================================================
  // KALKULASI FORMULA REAL-TIME
  // =====================================================================
  const totalAsetLancar = kasBank + piutangUsaha + piutangLain + persediaan;
  const totalAsetTetap = (tanah + bangunan + kendaraan + alatKantor) - (akmPenyKendaraan + akmPenyAlat);
  const totalAktiva = totalAsetLancar + totalAsetTetap;

  const totalUtangLancar = utangBankPendek + utangDagang + utangLain;
  const totalUtangPanjang = utangBankPanjang;
  const totalModal = modalDisetor + labaDitahan + labaBerjalan;
  const totalPasiva = totalUtangLancar + totalUtangPanjang + totalModal;

  const handleDownloadExcel = () => {
    const wb = XLSX.utils.book_new();
    const rows = [];

    rows.push(['LAPORAN NERACA KEUANGAN']);
    rows.push(['DBFinance Management']);
    rows.push([`Periode: Akhir ${periodeLabel}`]);
    rows.push([]);

    rows.push(['AKTIVA (ASET)', '', 'NILAI (Rp)', '', 'PASIVA (KEWAJIBAN & EKUITAS)', '', 'NILAI (Rp)']);

    const content = [
      ['I. AKTIVA LANCAR', '', '', '', 'I. HUTANG LANCAR', '', ''],
      ['   Kas dan Setara Kas', '', kasBank, '', '   Hutang Bank Jangka Pendek', '', utangBankPendek],
      ['   Piutang Usaha', '', piutangUsaha, '', '   Hutang Dagang', '', utangDagang],
      ['   Piutang Lain-Lain', '', piutangLain, '', '   Hutang Lain-lain', '', utangLain],
      ['   Persediaan', '', persediaan, '', 'TOTAL HUTANG LANCAR', '', totalUtangLancar],
      ['TOTAL AKTIVA LANCAR', '', totalAsetLancar, '', '', '', ''],
      ['', '', '', '', 'II. HUTANG JANGKA PANJANG', '', ''],
      ['II. AKTIVA TETAP', '', '', '', '   Hutang Bank Jangka Panjang', '', utangBankPanjang],
      ['TOTAL AKTIVA TETAP', '', totalAsetTetap, '', 'TOTAL HUTANG JANGKA PANJANG', '', totalUtangPanjang],
      ['   Tanah', '', tanah, '', '', '', ''],
      ['   Bangunan', '', bangunan, '', 'III. MODAL', '', ''],
      ['   Kendaraan', '', kendaraan, '', '   Modal Disetor', '', modalDisetor],
      ['   Akumulasi Penyusutan', '', -akmPenyKendaraan, '', '   Laba/Rugi Ditahan', '', labaDitahan],
      ['   Alat Alat Kantor', '', alatKantor, '', '   Laba/Rugi Tahun Berjalan', '', labaBerjalan],
      ['   Akumulasi Penyusutan', '', -akmPenyAlat, '', 'TOTAL MODAL', '', totalModal],
      ['', '', '', '', '', '', ''],
      ['TOTAL AKTIVA', '', totalAktiva, '', 'TOTAL EKUITAS (PASIVA)', '', totalPasiva]
    ];

    content.forEach(r => rows.push(r));
    const ws = XLSX.utils.aoa_to_sheet(rows);

    ws['!cols'] = [{ wch: 30 }, { wch: 2 }, { wch: 18 }, { wch: 4 }, { wch: 30 }, { wch: 2 }, { wch: 18 }];

    const rupiahFmt = '#,##0;(#,##0);"-"';
    rows.forEach((row, ri) => {
      ['C', 'G'].forEach((col) => {
        const cellAddr = col + (ri + 1);
        if (ws[cellAddr] && typeof ws[cellAddr].v === 'number') {
          ws[cellAddr].t = 'n';
          ws[cellAddr].z = rupiahFmt;
        }
      });
    });

    ws['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 6 } }, { s: { r: 1, c: 0 }, e: { r: 1, c: 6 } }, { s: { r: 2, c: 0 }, e: { r: 2, c: 6 } }];

    XLSX.utils.book_append_sheet(wb, ws, 'Neraca');
    XLSX.writeFile(wb, `Laporan_Neraca_${periodeLabel.replace(/\s/g, '_')}.xlsx`);
  };

  return (
    <div style={{ flex: 1, padding: isMobile ? '16px' : '24px', overflowY: 'auto', boxSizing: 'border-box', background: '#f8fafc' }}>
      
      {/* ---- PAGE HEADER ---- */}
      <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', marginBottom: '24px', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '18px', fontWeight: '600', margin: 0, color: '#0f172a' }}>Laporan Neraca Keuangan</h1>
          <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px', margin: 0 }}>Model Skontro Bilateral (Sinkronisasi otomatis ke Database MySQL)</p>
        </div>
        <button onClick={handleDownloadExcel} disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: loading ? '#94a3b8' : '#1e4ed8', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '12.5px', fontWeight: '500', cursor: loading ? 'not-allowed' : 'pointer', width: isMobile ? '100%' : 'auto', justifyContent: 'center' }}>
          <span>📊</span> Unduh File Excel
        </button>
      </div>

      {/* ---- GRID DUA SISI ---- */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '48px', color: '#6b7280', background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px' }}>
          Sinkronisasi otomatis nilai neraca dari basis data MySQL...
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '20px', alignItems: 'flex-start', width: '100%' }}>
          
          {/* ==================== SISI KIRI: AKTIVA ==================== */}
          <div style={{ flex: 1, background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', overflow: 'hidden', width: '100%' }}>
            <div style={{ background: '#0f172a', color: '#fff', padding: '12px 16px', fontWeight: '600', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              AKTIVA (ASET COMPANY)
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <tbody>
                <HeaderRow title="I. AKTIVA LANCAR" />
                <InputRow label="Kas dan Setara Kas" value={kasBank} onChangeFn={setKasBank} saveFn={(val) => saveToDatabase({ kas_bank: val })} />
                <InputRow label="Piutang Usaha" value={piutangUsaha} onChangeFn={setPiutangUsaha} saveFn={(val) => saveToDatabase({ piutang_usaha: val })} />
                <InputRow label="Piutang Lain-Lain" value={piutangLain} onChangeFn={setPiutangLain} saveFn={(val) => saveToDatabase({ piutang_lain: val })} />
                <InputRow label="Persediaan" value={persediaan} onChangeFn={setPersediaan} saveFn={(val) => saveToDatabase({ persediaan: val })} />
                <TotalSubRow label="TOTAL AKTIVA LANCAR" value={totalAsetLancar} fmt={formatRupiah} />

                <HeaderRow title="II. AKTIVA TETAP" />
                <InputRow label="Tanah" value={tanah} onChangeFn={setTanah} saveFn={(val) => saveToDatabase({ tanah: val })} />
                <InputRow label="Bangunan" value={bangunan} onChangeFn={setBangunan} saveFn={(val) => saveToDatabase({ bangunan: val })} />
                <InputRow label="Kendaraan" value={kendaraan} onChangeFn={setKendaraan} saveFn={(val) => saveToDatabase({ kendaraan: val })} />
                <InputRow label="Akumulasi Penyusutan Kendaraan" value={akmPenyKendaraan} onChangeFn={setAkmPenyKendaraan} saveFn={(val) => saveToDatabase({ akm_peny_kendaraan: val })} isMinus />
                <InputRow label="Alat Alat Kantor" value={alatKantor} onChangeFn={setAlatKantor} saveFn={(val) => saveToDatabase({ alat_kantor: val })} />
                <InputRow label="Akumulasi Penyusutan Alat" value={akmPenyAlat} onChangeFn={setAkmPenyAlat} saveFn={(val) => saveToDatabase({ akm_peny_alat: val })} isMinus />
                <TotalSubRow label="TOTAL AKTIVA TETAP" value={totalAsetTetap} fmt={formatRupiah} />
                
                {isMobile ? null : <tr style={{ height: '40px' }}><td colSpan={2}></td></tr>}
                <GrandTotalRow label="TOTAL AKTIVA ( I + II )" value={totalAktiva} fmt={formatRupiah} highlightColor="#1e4ed8" />
              </tbody>
            </table>
          </div>

          {/* ==================== SISI KANAN: PASIVA ==================== */}
          <div style={{ flex: 1, background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', overflow: 'hidden', width: '100%' }}>
            <div style={{ background: '#334155', color: '#fff', padding: '12px 16px', fontWeight: '600', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              PASIVA (LIABILITAS & MODAL)
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <tbody>
                <HeaderRow title="I. UTANG LANCAR" />
                <InputRow label="Hutang Bank Jangka Pendek" value={utangBankPendek} onChangeFn={setUtangBankPendek} saveFn={(val) => saveToDatabase({ utang_bank_pendek: val })} />
                <InputRow label="Hutang Dagang" value={utangDagang} onChangeFn={setUtangDagang} saveFn={(val) => saveToDatabase({ utang_dagang: val })} />
                <InputRow label="Hutang Lain-lain" value={utangLain} onChangeFn={setUtangLain} saveFn={(val) => saveToDatabase({ utang_lain: val })} />
                <TotalSubRow label="TOTAL HUTANG LANCAR" value={totalUtangLancar} fmt={formatRupiah} />

                <HeaderRow title="II. UTANG JANGKA PANJANG" />
                <InputRow label="Hutang Bank Jangka Panjang" value={utangBankPanjang} onChangeFn={setUtangBankPanjang} saveFn={(val) => saveToDatabase({ utang_bank_panjang: val })} />
                <TotalSubRow label="TOTAL HUTANG JANGKA PANJANG" value={totalUtangPanjang} fmt={formatRupiah} />

                <HeaderRow title="III. MODAL COMPANY" />
                <StaticRow label="Modal Disetor (Statis)" value={modalDisetor} fmt={formatRupiah} />
                <InputRow label="Laba/Rugi Ditahan" value={labaDitahan} onChangeFn={setLabaDitahan} saveFn={(val) => saveToDatabase({ laba_ditahan: val })} />
                
                <StaticRow label="Laba/Rugi Tahun Berjalan (Cloud)" value={labaBerjalan} fmt={formatRupiah} isRed={labaBerjalan < 0} />
                <TotalSubRow label="TOTAL MODAL" value={totalModal} fmt={formatRupiah} />
                
                <GrandTotalRow label="TOTAL EKUITAS PASIVA" value={totalPasiva} fmt={formatRupiah} highlightColor="#475569" />
              </tbody>
            </table>
          </div>

        </div>
      )}
    </div>
  );
}

// =====================================================================
// HELPER SUB-COMPONENTS
// =====================================================================
function HeaderRow({ title }) {
  return (
    <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
      <td colSpan={2} style={{ padding: '10px 16px', fontWeight: '700', color: '#1e293b', fontSize: '12px' }}>{title}</td>
    </tr>
  );
}

// UBAHAN BARIS INPUT: Menyertakan 'onBlur' agar melakukan hit otomatis save data ke MySQL saat kursor keluar dari form input
function InputRow({ label, value, onChangeFn, saveFn, isMinus = false }) {
  return (
    <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
      <td style={{ padding: '8px 16px', paddingLeft: '28px', color: '#475569' }}>{label}</td>
      <td style={{ padding: '4px 16px', textAlign: 'right' }}>
        <input
          type="number"
          value={value === 0 ? '' : value}
          placeholder="0"
          onChange={(e) => onChangeFn(Number(e.target.value))}
          onBlur={(e) => saveFn(Number(e.target.value))}
          style={{
            textAlign: 'right', padding: '6px 10px', fontSize: '13px', fontWeight: '600',
            border: '1px solid #d1d5db', borderRadius: '6px', outline: 'none',
            width: '150px', color: isMinus ? '#dc2626' : '#0f172a', background: '#fff', fontFamily: 'inherit'
          }}
        />
      </td>
    </tr>
  );
}

function StaticRow({ label, value, fmt, isRed = false }) {
  return (
    <tr style={{ borderBottom: '1px solid #f1f5f9', background: '#fcfcfc' }}>
      <td style={{ padding: '10px 16px', paddingLeft: '28px', color: '#64748b', fontStyle: 'italic' }}>{label}</td>
      <td style={{ padding: '10px 16px', textAlign: 'right', fontWeight: '700', color: isRed ? '#dc2626' : '#334155', fontVariantNumeric: 'tabular-nums' }}>
        {value === 0 ? '—' : fmt(value)}
      </td>
    </tr>
  );
}

function TotalSubRow({ label, value, fmt }) {
  return (
    <tr style={{ borderBottom: '1px solid #cbd5e1', background: '#fafafa' }}>
      <td style={{ padding: '10px 16px', fontWeight: '600', color: '#334155', fontSize: '11.5px' }}>{label}</td>
      <td style={{ padding: '10px 16px', textAlign: 'right', fontWeight: '700', borderTop: '1px solid #94a3b8', fontVariantNumeric: 'tabular-nums', color: '#0f172a' }}>{fmt(value)}</td>
    </tr>
  );
}

function GrandTotalRow({ label, value, fmt, highlightColor }) {
  return (
    <tr style={{ background: '#f8fafc', borderTop: '2px solid #94a3b8', borderBottom: '2px solid #94a3b8' }}>
      <td style={{ padding: '14px 16px', fontWeight: '700', color: highlightColor, fontSize: '12.5px' }}>{label}</td>
      <td style={{ padding: '14px 16px', textAlign: 'right', fontWeight: '800', fontSize: '14px', color: highlightColor, fontVariantNumeric: 'tabular-nums', borderBottom: '4px double #94a3b8' }}>
        {fmt(value)}
      </td>
    </tr>
  );
}