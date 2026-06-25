import { useState, useEffect } from 'react';

const API_URL = 'http://66.96.229.251:8000/api/office-categories';

export default function PengeluaranKantor({ onSelectCategory }) {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({
        category_name: '', 
        person_in_charge: ''
    });
    
    const [isMobile, setIsMobile] = useState(false);

    // 1. Deteksi ukuran layar responsif untuk HP/Tablet
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // 2. UBAHAN: Fungsi Ambil Daftar Kategori dari API Laravel (MySQL)
    const fetchCategories = async () => {
        try {
            const response = await fetch(API_URL);
            if (!response.ok) throw new Error("Gagal mengambil data dari server");
            const data = await response.json();
            setCategories(data);
        } catch (error) {
            console.error("Gagal mengambil data kategori kantor dari MySQL: ", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        let isMounted = true;
        const loadData = async () => {
            if (isMounted) setLoading(true);
            await fetchCategories();
        };
        loadData();
        return () => { isMounted = false; };
    }, []);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    // 3. UBAHAN: Fungsi Simpan Kategori Kantor Baru ke API Laravel (MySQL)
    const handleSubmit = async () => {
        if (!form.category_name || !form.person_in_charge) {
            alert('Semua field wajib diisi!');
            return;
        }

        try {
            const payload = {
                category_name: form.category_name,
                person_in_charge: form.person_in_charge
            };

            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) throw new Error("Gagal menyimpan data kategori");

            setForm({ category_name: '', person_in_charge: '' });
            setShowForm(false);

            setLoading(true);
            fetchCategories();
        } catch (error) {
            console.error("Gagal menyimpan kategori baru ke MySQL: ", error);
            alert("Terjadi kesalahan sistem saat menyimpan ke database MySQL.");
        }
    };

    // 4. UBAHAN: Fungsi Hapus Kategori Kantor dari API Laravel (MySQL)
    const handleDelete = async (e, id) => {
        e.stopPropagation(); 
        if (confirm('Apakah Anda yakin ingin menghapus kategori pengeluaran kantor ini?')) {
            try {
                const response = await fetch(`${API_URL}/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'Accept': 'application/json'
                    }
                });

                if (!response.ok) throw new Error("Gagal menghapus kategori");

                setLoading(true);
                fetchCategories();
            } catch (error) {
                console.error("Gagal menghapus kategori pengeluaran kantor: ", error);
                alert("Gagal menghapus data dari database MySQL!");
            }
        }
    };

    const formatRupiah = (n) =>
        'Rp ' + Number(n).toLocaleString('id-ID');

    const grandTotalPengeluaran = categories.reduce((s, c) => s + Number(c.total_expenses || 0), 0);

    return (
        <div style={{ flex: 1, padding: isMobile ? '16px' : '24px', overflowY: 'auto', boxSizing: 'border-box', background: '#f8fafc' }}>
            
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
                    <h1 style={{ fontSize: '18px', fontWeight: '600', margin: 0, color: '#0f172a' }}>Kategori Pengeluaran Kantor</h1>
                    <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px', marginBottom: 0 }}>
                        Kelola data pengeluaran internal kas kantor berdasarkan pos kategori
                    </p>
                </div>
                <button 
                    onClick={() => setShowForm(!showForm)} 
                    style={{
                        display: 'flex', alignItems: 'center', gap: '6px',
                        padding: '10px 16px', background: '#475569', color: '#fff',
                        border: 'none', borderRadius: '8px', fontSize: '13px',
                        cursor: 'pointer', fontWeight: '500',
                        width: isMobile ? '100%' : 'auto', justifyContent: 'center',
                        boxSizing: 'border-box', transition: 'background 0.2s'
                    }}
                    onMouseOver={e => e.currentTarget.style.background = '#334155'}
                    onMouseOut={e => e.currentTarget.style.background = '#475569'}
                >
                    {showForm ? '✕ Tutup Form' : '+ Tambah Kategori'}
                </button>
            </div>

            {/* Stats Ringkasan */}
            <div style={{
                display: 'grid', 
                gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
                gap: '12px', 
                marginBottom: '24px'
            }}>
                {[
                    { label: 'Total Kategori Pos', value: loading ? '...' : categories.length, color: '#475569', bg: '#fff', border: '#e5e7eb' },
                    { label: 'Total Pengeluaran Kas', value: loading ? '...' : formatRupiah(grandTotalPengeluaran), color: '#dc2626', bg: '#FFF7F7', border: '#fecaca' },
                    { label: 'Status Database', value: 'Terhubung MySQL', color: '#15803d', bg: '#F0FDF4', border: '#bbf7d0' },
                ].map((s, i) => (
                    <div key={i} style={{
                        background: s.bg, border: `1px solid ${s.border}`,
                        borderRadius: '10px', padding: '14px 16px',
                        boxSizing: 'border-box'
                    }}>
                        <div style={{
                            fontSize: '11px', color: s.color, marginBottom: '4px',
                            textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600'
                        }}>
                            {s.label}
                        </div>
                        <div style={{ fontSize: '18px', fontWeight: '700', color: s.color, wordBreak: 'break-all' }}>{s.value}</div>
                    </div>
                ))}
            </div>

            {/* Form Pendaftaran Kategori Baru */}
            {showForm && (
                <div style={{
                    background: '#fff', border: '1px solid #e5e7eb',
                    borderRadius: '12px', padding: '20px', marginBottom: '24px',
                    boxSizing: 'border-box', boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
                }}>
                    <h2 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px', marginTop: 0, color: '#0f172a' }}>
                        Tambah Record Kategori Baru
                    </h2>
                    <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', 
                        gap: '14px' 
                    }}>
                        <div>
                            <label style={{ fontSize: '12px', fontWeight: '500', color: '#374151', display: 'block', marginBottom: '5px' }}>
                                Nama Kategori Pengeluaran *
                            </label>
                            <input name="category_name" value={form.category_name}
                                onChange={handleChange} placeholder="Contoh: Alat Tulis Kantor, Listrik & Air, Konsumsi..."
                                style={{
                                    width: '100%', padding: '10px 12px', border: '1px solid #d1d5db',
                                    borderRadius: '8px', fontSize: '13.5px', outline: 'none', boxSizing: 'border-box'
                                }} />
                        </div>
                        <div>
                            <label style={{ fontSize: '12px', fontWeight: '500', color: '#374151', display: 'block', marginBottom: '5px' }}>
                                Penanggung Jawab / Purchaser *
                            </label>
                            <input name="person_in_charge" value={form.person_in_charge}
                                onChange={handleChange} placeholder="Nama penanggung jawab kas"
                                style={{
                                    width: '100%', padding: '10px 12px', border: '1px solid #d1d5db',
                                    borderRadius: '8px', fontSize: '13.5px', outline: 'none', boxSizing: 'border-box'
                                }} />
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
                            background: '#fff', fontSize: '13px', cursor: 'pointer', color: '#4b5563',
                            textAlign: 'center', width: isMobile ? '100%' : 'auto'
                        }}>
                            Batal
                        </button>
                        <button onClick={handleSubmit} style={{
                            padding: '10px 16px', background: '#475569', color: '#fff',
                            border: 'none', borderRadius: '8px', fontSize: '13px',
                            cursor: 'pointer', fontWeight: '500', textAlign: 'center',
                            width: isMobile ? '100%' : 'auto'
                        }}>
                            Simpan Kategori
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
                        Sinkronisasi basis data MySQL via Laravel...
                    </div>
                ) : categories.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '48px', color: '#9ca3af', boxSizing: 'border-box' }}>
                        <div style={{ fontSize: '36px', marginBottom: '10px' }}>🏢</div>
                        <div style={{ fontWeight: '500', color: '#374151' }}>Belum ada record kategori kantor</div>
                        <div style={{ fontSize: '13px', marginTop: '4px' }}>
                            Klik "+ Tambah Kategori" untuk mencatat pos alokasi dana baru
                        </div>
                    </div>
                ) : (
                    <table style={{ width: '100%', minWidth: '600px', borderCollapse: 'collapse', fontSize: '13px' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid #e5e7eb', background: '#f9fafb' }}>
                                {['#', 'Nama Kategori Pos', 'Total Pengeluaran Riil', 'Penanggung Jawab', 'Aksi'].map((h, idx) => (
                                    <th key={idx} style={{
                                        padding: '12px 20px', textAlign: 'left',
                                        fontSize: '10px', fontWeight: '600', color: '#9ca3af',
                                        textTransform: 'uppercase', letterSpacing: '0.5px'
                                    }}> {h} </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {categories.map((c, i) => (
                                <tr 
                                    key={c.id} 
                                    onClick={() => onSelectCategory({
                                        id: c.id,
                                        project_name: c.category_name, 
                                        category_name: c.category_name, 
                                        person_in_charge: c.person_in_charge
                                    })}
                                    style={{ 
                                        borderBottom: '1px solid #f3f4f6',
                                        cursor: 'pointer',
                                        transition: 'background 0.2s ease'
                                    }}
                                    onMouseOver={(e) => e.currentTarget.style.background = '#f8fafc'}
                                    onMouseOut={(e) => e.currentTarget.style.background = '#fff'}
                                >
                                    <td style={{ padding: '14px 20px', color: '#9ca3af', fontWeight: '500' }}>
                                        {String(i + 1).padStart(2, '0')}
                                    </td>
                                    
                                    <td style={{ padding: '14px 20px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span style={{ fontWeight: '600', color: '#1e293b' }}>
                                                {c.category_name}
                                            </span>
                                            <span style={{ fontSize: '11px', color: '#185FA5', opacity: 0.8 }}>
                                                →
                                            </span>
                                        </div>
                                    </td>
                                    
                                    <td style={{ padding: '14px 20px' }}>
                                        <span style={{ 
                                            fontWeight: '700', 
                                            color: Number(c.total_expenses) > 0 ? '#dc2626' : '#6b7280',
                                            background: Number(c.total_expenses) > 0 ? '#FFF7F7' : '#f3f4f6',
                                            padding: '4px 10px',
                                            borderRadius: '20px',
                                            fontSize: '12.5px'
                                        }}>
                                            {formatRupiah(c.total_expenses || 0)}
                                        </span>
                                    </td>
                                    
                                    <td style={{ padding: '14px 20px', color: '#475569', fontWeight: '500' }}>
                                        {c.person_in_charge}
                                    </td>
                                    
                                    <td style={{ padding: '14px 20px' }}>
                                        <button 
                                            onClick={(e) => handleDelete(e, c.id)} 
                                            style={{
                                                padding: '6px 12px', border: '1px solid #fca5a5',
                                                background: '#fff', color: '#ef4444', borderRadius: '6px',
                                                fontSize: '12px', cursor: 'pointer', transition: 'all 0.2s',
                                                fontWeight: '500'
                                            }}
                                            onMouseOver={(e) => {
                                                e.stopPropagation();
                                                e.currentTarget.style.background = '#ef4444';
                                                e.currentTarget.style.color = '#fff';
                                            }}
                                            onMouseOut={(e) => {
                                                e.stopPropagation();
                                                e.currentTarget.style.background = '#fff';
                                                e.currentTarget.style.color = '#ef4444';
                                            }}
                                        >
                                            Hapus
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}