import { useState, useEffect } from 'react';

const API_URL = 'http://127.0.0.1:8000/api/reports/office';

export default function LaporanKantor() {
    const [allData, setAllData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isMobile, setIsMobile] = useState(false);
    
    // State untuk melihat rincian penuh log pengeluaran
    const [viewAllTarget, setViewAllTarget] = useState(null);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // UBAHAN: Mengambil data rekap pengeluaran kantor dari API Laravel (MySQL)
    const fetchOfficeReport = async () => {
        try {
            const response = await fetch(API_URL);
            if (!response.ok) throw new Error("Gagal memuat data laporan kantor");
            const data = await response.json();
            setAllData(data);
        } catch (error) {
            console.error("Gagal memuat rekap operasional dari MySQL: ", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        let isMounted = true;
        const loadReport = async () => {
            if (isMounted) setLoading(true);
            await fetchOfficeReport();
        };
        loadReport();
        return () => { isMounted = false; };
    }, []);

    const formatRupiah = (n) => 'Rp ' + Number(n).toLocaleString('id-ID');

    const grandPengeluaran = allData.reduce((s, d) => s + Number(d.totalPengeluaran || 0), 0);

    const handleDownloadPDF = (data) => {
        const printWindow = window.open('', '_blank');
        const htmlContent = `
            <html>
            <head>
                <title>Log Pengeluaran - ${data.display_name}</title>
                <style>
                    body { font-family: Arial, sans-serif; color: #333; padding: 40px; line-height: 1.5; }
                    .header { margin-bottom: 30px; border-bottom: 2px solid #ef4444; padding-bottom: 20px; }
                    .title { font-size: 22px; font-weight: bold; margin: 0; color: #111827; }
                    .meta-info { margin-bottom: 25px; background: #fef2f2; padding: 15px; border-radius: 8px; border: 1px solid #fee2e2; font-size: 13.5px; }
                    .total-box { border: 1px solid #fee2e2; background: #fff5f5; padding: 15px; border-radius: 8px; text-align: center; font-size: 18px; font-weight: bold; color: #dc2626; margin-bottom: 30px; }
                    table { width: 100%; border-collapse: collapse; font-size: 12.5px; }
                    th { background: #f9fafb; color: #4b5563; font-weight: 600; padding: 10px; text-align: left; border-bottom: 2px solid #fee2e2; }
                    td { padding: 10px; border-bottom: 1px solid #e5e7eb; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1 class="title">REKAP OPERASIONAL KANTOR [${data.display_name.toUpperCase()}]</h1>
                    <p>Dicetak pada: ${new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
                <div class="meta-info">
                    <div><strong>Pos Kategori:</strong> ${data.display_name}</div>
                    <div><strong>Penanggung Jawab Kebutuhan:</strong> ${data.sub_label}</div>
                </div>
                <div class="total-box">TOTAL PENGELUARAN AKTIF: ${formatRupiah(data.totalPengeluaran)}</div>
                <h3>Histori Detail Pembelian Logistik</h3>
                <table>
                    <thead><tr><th>Tanggal</th><th>Deskripsi Kebutuhan Kantor</th><th>Kategori</th><th>Jumlah</th></tr></thead>
                    <tbody>
                        ${data.transactions.map(t => `
                            <tr>
                                <td>${t.date}</td>
                                <td><strong>${t.description}</strong></td>
                                <td>${t.category || 'Operasional'}</td>
                                <td><span style="color: #dc2626; font-weight: bold;">-${formatRupiah(t.amount)}</span></td>
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
                    <span onClick={() => setViewAllTarget(null)} style={{ cursor: 'pointer', color: '#dc2626', fontWeight: '500' }}>← Kembali Pos Rekap</span>
                    <span>/</span>
                    <span style={{ color: '#111827', fontWeight: '500' }}>Semua Pengeluaran: {viewAllTarget.display_name}</span>
                </div>

                <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '16px 20px', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                        <div>
                            <h2 style={{ fontSize: '17px', fontWeight: '700', margin: 0 }}>Log Pengeluaran: {viewAllTarget.display_name}</h2>
                            <p style={{ margin: '3px 0 0', fontSize: '13px', color: '#6b7280' }}>{viewAllTarget.sub_label} &nbsp;·&nbsp; Total Terpakai: <strong style={{ color: '#dc2626' }}>{formatRupiah(viewAllTarget.totalPengeluaran)}</strong></p>
                        </div>
                        <button onClick={() => handleDownloadPDF(viewAllTarget)} style={{ background: '#dc2626', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', fontWeight: '500' }}>📥 Unduh Berkas</button>
                    </div>
                </div>

                <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', overflow: 'hidden' }}>
                    <div style={{ padding: '14px 16px', borderBottom: '1px solid #e5e7eb', fontWeight: '600', fontSize: '14px' }}>Seluruh Log Belanja Kategori ({viewAllTarget.transactions.length})</div>
                    <div style={{ overflowX: 'auto', width: '100%' }}>
                        <table style={{ width: '100%', minWidth: '600px', borderCollapse: 'collapse', fontSize: '13px' }}>
                            <thead>
                                <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                                    {['Tanggal', 'Deskripsi Pengeluaran', 'Kategori', 'Jumlah'].map(h => <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', color: '#9ca3af', textTransform: 'uppercase' }}>{h}</th>)}
                                </tr>
                            </thead>
                            <tbody>
                                {viewAllTarget.transactions.map(t => (
                                    <tr key={t.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                        <td style={{ padding: '12px 16px', color: '#6b7280' }}>{t.date}</td>
                                        <td style={{ padding: '12px 16px', fontWeight: '500' }}>{t.description}</td>
                                        <td style={{ padding: '12px 16px' }}><span style={{ background: '#f3f4f6', padding: '2px 8px', borderRadius: '20px', fontSize: '11px' }}>{t.category || 'Operasional'}</span></td>
                                        <td style={{ padding: '12px 16px', fontWeight: '700', color: '#dc2626' }}>-{formatRupiah(t.amount)}</td>
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
                <h1 style={{ fontSize: '18px', fontWeight: '600', margin: 0 }}>Laporan Internal Operasional Kantor</h1>
                <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px', marginBottom: 0 }}>Memonitor alokasi pengeluaran bulanan logistik, utilitas, ruko, dan pengadaan perlengkapan internal.</p>
            </div>

            {/* Total Kas Box */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px', marginBottom: '24px' }}>
                <div style={{ background: '#FFF7F7', border: '1px solid #fecaca', borderRadius: '10px', padding: '14px 16px' }}>
                    <div style={{ fontSize: '10px', fontWeight: '600', marginBottom: '4px', textTransform: 'uppercase', color: '#991b1b' }}>Akumulasi Seluruh Pengeluaran Kantor</div>
                    <div style={{ fontSize: '20px', fontWeight: '700', color: '#dc2626' }}>{loading ? '...' : formatRupiah(grandPengeluaran)}</div>
                </div>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '48px', color: '#6b7280', fontSize: '13px' }}>Menghitung kalkulasi laporan operasional kas...</div>
            ) : allData.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af', background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px' }}>Belum ada rincian kas kantor dicatat.</div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {allData.map(p => (
                        <div key={p.id} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', overflow: 'hidden' }}>
                            {/* Header Pos */}
                            <div style={{ padding: '14px 20px', borderBottom: '1px solid #e5e7eb', display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', background: '#f9fafb', gap: '12px' }}>
                                <div>
                                    <div style={{ fontSize: '14.5px', fontWeight: '600', color: '#111827' }}>Kategori Pos: {p.display_name}</div>
                                    <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>{p.sub_label}</div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: isMobile ? '100%' : 'auto', justifyContent: 'space-between' }}>
                                    <div>
                                        <span style={{ fontSize: '11px', color: '#6b7280' }}>Total Dana Terpakai:</span>
                                        <span style={{ fontSize: '13.5px', fontWeight: '700', color: '#dc2626', marginLeft: '6px' }}>{formatRupiah(p.totalPengeluaran)}</span>
                                    </div>
                                    <button onClick={() => handleDownloadPDF(p)} style={{ background: '#fff', border: '1px solid #d1d5db', padding: '5px 10px', borderRadius: '6px', fontSize: '11.5px', cursor: 'pointer', fontWeight: '500' }}>Cetak</button>
                                </div>
                            </div>

                            {/* Tabel Pembatasan Maksimal 5 Item */}
                            {p.transactions.length > 0 && (
                                <div>
                                    <div style={{ overflowX: 'auto', width: '100%' }}>
                                        <table style={{ width: '100%', minWidth: '600px', borderCollapse: 'collapse', fontSize: '12.5px' }}>
                                            <tbody>
                                                {p.transactions.slice(0, 5).map(t => (
                                                    <tr key={t.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                                        <td style={{ padding: '10px 20px', color: '#6b7280', width: '100px' }}>{t.date}</td>
                                                        <td style={{ padding: '10px 20px', fontWeight: '500' }}>{t.description}</td>
                                                        <td style={{ padding: '10px 20px', color: '#4b5563' }}><span style={{ background: '#f3f4f6', padding: '2px 6px', borderRadius: '4px', fontSize: '10.5px' }}>{t.category || 'Operasional'}</span></td>
                                                        <td style={{ padding: '10px 20px', fontWeight: '700', textAlign: 'right', color: '#dc2626', width: '120px' }}>-{formatRupiah(t.amount)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    {p.transactions.length > 5 && (
                                        <div style={{ padding: '10px', borderTop: '1px solid #f3f4f6', textAlign: 'center', background: '#fff' }}>
                                            <span onClick={() => setViewAllTarget(p)} style={{ fontSize: '12px', color: '#dc2626', fontWeight: '600', cursor: 'pointer' }}>Lihat Histori Pengeluaran Lengkap ({p.transactions.length}) →</span>
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