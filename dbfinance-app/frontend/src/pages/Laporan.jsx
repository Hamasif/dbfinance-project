import { useState, useEffect } from 'react';

const API_URL = 'http://66.96.229.251:8000/api/reports/projects';

export default function Laporan() {
    const [allData, setAllData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isMobile, setIsMobile] = useState(false);
    
    const [viewAllTarget, setViewAllTarget] = useState(null); 

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // UBAHAN: Mengambil data rekap laporan kumulatif langsung dari API Laravel (MySQL)
    const fetchProjectReport = async () => {
        try {
            const response = await fetch(API_URL);
            if (!response.ok) throw new Error("Gagal memuat laporan keuangan");
            const data = await response.json();
            setAllData(data);
        } catch (error) {
            console.error("Gagal memuat rekap project dari MySQL: ", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        let isMounted = true;
        const loadReport = async () => {
            if (isMounted) setLoading(true);
            await fetchProjectReport();
        };
        loadReport();
        return () => { isMounted = false; };
    }, []);

    const formatRupiah = (n) => 'Rp ' + Number(n).toLocaleString('id-ID');

    const grandAnggaran = allData.reduce((s, d) => s + Number(d.budget_amount || 0), 0);
    const grandPemasukan = allData.reduce((s, d) => s + Number(d.totalPemasukan || 0), 0);
    const grandPengeluaran = allData.reduce((s, d) => s + Number(d.totalPengeluaran || 0), 0);
    const grandSisa = grandAnggaran - grandPengeluaran;

    const handleDownloadPDF = (data) => {
        const printWindow = window.open('', '_blank');
        const htmlContent = `
            <html>
            <head>
                <title>Laporan Keuangan - ${data.display_name}</title>
                <style>
                    body { font-family: Arial, sans-serif; color: #333; padding: 40px; line-height: 1.5; }
                    .header { margin-bottom: 30px; border-bottom: 2px solid #e5e7eb; padding-bottom: 20px; }
                    .title { font-size: 22px; font-weight: bold; margin: 0; color: #111827; }
                    .subtitle { font-size: 13px; color: #6b7280; margin-top: 5px; }
                    .meta-info { margin-bottom: 25px; background: #f9fafb; padding: 15px; border-radius: 8px; border: 1px solid #e5e7eb; display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 13.5px; }
                    .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 30px; }
                    .stats-box { border: 1px solid #e5e7eb; padding: 12px; border-radius: 8px; text-align: center; }
                    .stat-label { font-size: 10px; text-transform: uppercase; color: #6b7280; font-weight: 600; margin-bottom: 4px; }
                    .stat-value { font-size: 15px; font-weight: bold; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12.5px; }
                    th { background: #f3f4f6; color: #4b5563; font-weight: 600; padding: 10px; text-align: left; border-bottom: 2px solid #e5e7eb; }
                    td { padding: 10px; border-bottom: 1px solid #e5e7eb; }
                    .badge { padding: 2px 6px; border-radius: 4px; font-size: 10.5px; font-weight: 600; }
                    .badge-pemasukan { background: #dcfce7; color: #15803d; }
                    .badge-pengeluaran { background: #fee2e2; color: #dc2626; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1 class="title">LAPORAN KEUANGAN [${data.tag.toUpperCase()}]</h1>
                    <p class="subtitle">Dicetak pada: ${new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
                <div class="meta-info">
                    <div><strong>Nama Project:</strong> ${data.display_name}</div>
                    <div><strong>${data.sub_label}</strong></div>
                    <div><strong>Plafon Anggaran:</strong> ${formatRupiah(data.budget_amount)}</div>
                    <div><strong>Persentase Penyerapan:</strong> ${data.persen}%</div>
                </div>
                <div class="stats-grid">
                    <div class="stats-box"><div class="stat-label">Total Pemasukan</div><div class="stat-value" style="color: #15803d;">${formatRupiah(data.totalPemasukan)}</div></div>
                    <div class="stats-box"><div class="stat-label">Total Pengeluaran</div><div class="stat-value" style="color: #dc2626;">${formatRupiah(data.totalPengeluaran)}</div></div>
                    <div class="stats-box"><div class="stat-label">Sisa Anggaran</div><div class="stat-value" style="color: #1d4ed8;">${formatRupiah(data.sisaAnggaran)}</div></div>
                </div>
                <h3>Daftar Seluruh Riwayat Transaksi</h3>
                <table>
                    <thead>
                        <tr><th>Tanggal</th><th>Deskripsi</th><th>Kategori</th><th>Tipe</th><th>Jumlah</th></tr>
                    </thead>
                    <tbody>
                        ${data.transactions.map(t => `
                            <tr>
                                <td>${t.date}</td>
                                <td><strong>${t.description}</strong></td>
                                <td>${t.category || '—'}</td>
                                <td><span class="badge ${t.type === 'pemasukan' ? 'badge-pemasukan' : 'badge-pengeluaran'}">${t.type.toUpperCase()}</span></td>
                                <td><span style="color: ${t.type === 'pemasukan' ? '#15803d' : '#dc2626'}; font-weight: 600;">${formatRupiah(t.amount)}</span></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                <script>window.onload = function() { window.print(); setTimeout(function() { window.close(); }, 500); };</script>
            </body>
            </html>
        `;
        printWindow.document.write(htmlContent);
        printWindow.document.close();
    };

    if (viewAllTarget) {
        return (
            <div style={{ flex: 1, padding: isMobile ? '16px' : '24px', overflowY: 'auto', boxSizing: 'border-box' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#6b7280', marginBottom: '20px' }}>
                    <span onClick={() => setViewAllTarget(null)} style={{ cursor: 'pointer', color: '#185FA5', fontWeight: '500' }}>← Kembali Rekap</span>
                    <span>/</span>
                    <span style={{ color: '#111827', fontWeight: '500' }}>Semua Histori: {viewAllTarget.display_name}</span>
                </div>

                <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '16px 20px', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                        <div>
                            <h2 style={{ fontSize: '18px', fontWeight: '700', margin: 0 }}>{viewAllTarget.display_name}</h2>
                            <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#6b7280' }}>{viewAllTarget.sub_label} &nbsp;·&nbsp; Anggaran: {formatRupiah(viewAllTarget.budget_amount)}</p>
                        </div>
                        <button onClick={() => handleDownloadPDF(viewAllTarget)} style={{ background: '#1e293b', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '6px', fontSize: '13px', cursor: 'pointer', fontWeight: '500' }}>📥 Cetak PDF</button>
                    </div>
                </div>

                <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', overflow: 'hidden' }}>
                    <div style={{ padding: '14px 16px', borderBottom: '1px solid #e5e7eb', fontWeight: '600', fontSize: '14px' }}>Daftar Lengkap Transaksi ({viewAllTarget.transactions.length})</div>
                    <div style={{ overflowX: 'auto', width: '100%' }}>
                        <table style={{ width: '100%', minWidth: '600px', borderCollapse: 'collapse', fontSize: '13px' }}>
                            <thead>
                                <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                                    {['Tanggal', 'Deskripsi', 'Kategori', 'Tipe', 'Jumlah'].map(h => <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', color: '#9ca3af', textTransform: 'uppercase' }}>{h}</th>)}
                                </tr>
                            </thead>
                            <tbody>
                                {viewAllTarget.transactions.map(t => (
                                    <tr key={t.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                        <td style={{ padding: '12px 16px', color: '#6b7280' }}>{t.date}</td>
                                        <td style={{ padding: '12px 16px', fontWeight: '500' }}>{t.description}</td>
                                        <td style={{ padding: '12px 16px' }}>{t.category || '—'}</td>
                                        <td style={{ padding: '12px 16px' }}>
                                            <span style={{ padding: '2px 8px', borderRadius: '20px', fontSize: '10px', fontWeight: '600', background: t.type === 'pemasukan' ? '#F0FDF4' : '#FFF7F7', color: t.type === 'pemasukan' ? '#15803d' : '#dc2626' }}>{t.type === 'pemasukan' ? '↑ Pemasukan' : '↓ Pengeluaran'}</span>
                                        </td>
                                        <td style={{ padding: '12px 16px', fontWeight: '700', color: t.type === 'pemasukan' ? '#15803d' : '#dc2626' }}>{formatRupiah(t.amount)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ flex: 1, padding: isMobile ? '16px' : '24px', overflowY: 'auto', boxSizing: 'border-box' }}>
            <div style={{ marginBottom: '24px' }}>
                <h1 style={{ fontSize: '18px', fontWeight: '600', margin: 0 }}>Laporan Keuangan Proyek</h1>
                <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px', marginBottom: 0 }}>Ringkasan anggaran, akumulasi dana masuk, serta pengeluaran vendor proyek lapangan.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
                {[
                    { label: 'Total Plafon Anggaran', value: loading ? '...' : formatRupiah(grandAnggaran), color: '#1e293b', bg: '#fff', border: '#e5e7eb' },
                    { label: 'Total Pemasukan Dana', value: loading ? '...' : formatRupiah(grandPemasukan), color: '#15803d', bg: '#F0FDF4', border: '#bbf7d0' },
                    { label: 'Total Pengeluaran Proyek', value: loading ? '...' : formatRupiah(grandPengeluaran), color: '#dc2626', bg: '#FFF7F7', border: '#fecaca' },
                    { label: 'Sisa Saldo Proyek', value: loading ? '...' : formatRupiah(grandSisa), color: grandSisa >= 0 ? '#1d4ed8' : '#dc2626', bg: '#EFF6FF', border: '#bfdbfe' },
                ].map((s, i) => (
                    <div key={i} style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: '10px', padding: '14px 16px' }}>
                        <div style={{ fontSize: '10px', fontWeight: '600', marginBottom: '4px', textTransform: 'uppercase', color: '#6b7280' }}>{s.label}</div>
                        <div style={{ fontSize: '16px', fontWeight: '700', color: s.color }}>{s.value}</div>
                    </div>
                ))}
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '48px', color: '#6b7280', fontSize: '13px' }}>Memuat rekapitulasi data proyek...</div>
            ) : allData.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af', background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px' }}>Belum ada data project terdaftar.</div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {allData.map(p => (
                        <div key={p.id} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', overflow: 'hidden' }}>
                            <div style={{ padding: '16px 20px', borderBottom: '1px solid #e5e7eb', display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', background: '#f9fafb', gap: '16px' }}>
                                <div>
                                    <div style={{ fontSize: '15px', fontWeight: '600', color: '#111827' }}>{p.display_name}</div>
                                    <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>{p.sub_label} &nbsp;·&nbsp; Anggaran: {formatRupiah(p.budget_amount)}</div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: isMobile ? '100%' : 'auto', justifyContent: 'space-between' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <div style={{ width: '80px', height: '6px', background: '#e5e7eb', borderRadius: '99px', overflow: 'hidden' }}>
                                            <div style={{ height: '100%', width: p.persen + '%', background: p.persen > 90 ? '#ef4444' : '#185FA5' }} />
                                        </div>
                                        <span style={{ fontSize: '11px', fontWeight: '600' }}>{p.persen}%</span>
                                    </div>
                                    <button onClick={() => handleDownloadPDF(p)} style={{ background: '#fff', border: '1px solid #d1d5db', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', fontWeight: '500' }}>Cetak PDF</button>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', background: '#fff', borderBottom: p.transactions.length > 0 ? '1px solid #e5e7eb' : 'none' }}>
                                <div style={{ padding: '10px 20px', borderRight: !isMobile ? '1px solid #e5e7eb' : 'none' }}><span style={{ fontSize: '10px', color: '#6b7280', display: 'block' }}>PEMASUKAN</span><strong style={{ color: '#15803d', fontSize: '13.5px' }}>{formatRupiah(p.totalPemasukan)}</strong></div>
                                <div style={{ padding: '10px 20px', borderRight: !isMobile ? '1px solid #e5e7eb' : 'none' }}><span style={{ fontSize: '10px', color: '#6b7280', display: 'block' }}>PENGELUARAN</span><strong style={{ color: '#dc2626', fontSize: '13.5px' }}>{formatRupiah(p.totalPengeluaran)}</strong></div>
                                <div style={{ padding: '10px 20px' }}><span style={{ fontSize: '10px', color: '#6b7280', display: 'block' }}>SISA ANGGARAN</span><strong style={{ color: p.sisaAnggaran >= 0 ? '#1d4ed8' : '#dc2626', fontSize: '13.5px' }}>{formatRupiah(p.sisaAnggaran)}</strong></div>
                            </div>

                            {p.transactions.length > 0 && (
                                <div>
                                    <div style={{ overflowX: 'auto', width: '100%' }}>
                                        <table style={{ width: '100%', minWidth: '600px', borderCollapse: 'collapse', fontSize: '12px' }}>
                                            <tbody>
                                                {p.transactions.slice(0, 5).map(t => (
                                                    <tr key={t.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                                        <td style={{ padding: '10px 20px', color: '#6b7280', width: '100px' }}>{t.date}</td>
                                                        <td style={{ padding: '10px 20px', fontWeight: '500' }}>{t.description}</td>
                                                        <td style={{ padding: '10px 20px', color: '#4b5563' }}>{t.category || '—'}</td>
                                                        <td style={{ padding: '10px 20px', width: '110px' }}><span style={{ fontSize: '10px', fontWeight: '600', color: t.type === 'pemasukan' ? '#15803d' : '#dc2626' }}>{t.type === 'pemasukan' ? '↑ Pemasukan' : '↓ Pengeluaran'}</span></td>
                                                        <td style={{ padding: '10px 20px', fontWeight: '700', textAlign: 'right', color: t.type === 'pemasukan' ? '#15803d' : '#dc2626', width: '120px' }}>{formatRupiah(t.amount)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    {p.transactions.length > 5 && (
                                        <div style={{ padding: '12px', borderTop: '1px solid #f3f4f6', textAlign: 'center' }}>
                                            <span onClick={() => setViewAllTarget(p)} style={{ fontSize: '12.5px', color: '#185FA5', fontWeight: '600', cursor: 'pointer' }}>Lihat Semua Transaksi ({p.transactions.length}) →</span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}