import { useState, useEffect } from 'react';

// URL Endpoint dari Server Laravel API
const API_URL = 'http://66.96.229.251:20527/api/projects';

export default function Home({ onSelectProject }) {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    
    const [form, setForm] = useState({
        project_name: '', 
        project_amount: '', 
        person_in_charge: '',
        tax_rate: '0',
        start_date: '',
        end_date: ''
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

    // 2. UBAHAN: Fungsi Ambil Daftar Project dari API Laravel (MySQL)
    const fetchProjects = async () => {
        try {
            const response = await fetch(API_URL);
            if (!response.ok) throw new Error("Gagal memuat data dari server");
            const data = await response.json();
            setProjects(data);
        } catch (error) {
            console.error("Gagal mengambil daftar proyek dari MySQL: ", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        let isMounted = true;
        const loadData = async () => {
            if (isMounted) setLoading(true);
            await fetchProjects();
        };
        loadData();
        return () => { isMounted = false; };
    }, []);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const rawAmount = Number(form.project_amount || 0);
    const taxPercent = Number(form.tax_rate || 0);
    const calculatedTaxValue = (rawAmount * taxPercent) / 100;
    const finalCleanAmount = rawAmount - calculatedTaxValue; 

    // 3. UBAHAN: Fungsi Simpan Project Baru / Perubahan ke API Laravel (MySQL)
    const handleSubmit = async () => {
        if (!form.project_name || !form.project_amount || !form.person_in_charge) {
            alert('Semua field wajib diisi!');
            return;
        }
        if (!form.start_date || !form.end_date) {
            alert('Rentang waktu project (tanggal mulai & selesai) wajib diisi!');
            return;
        }
        if (new Date(form.end_date) < new Date(form.start_date)) {
            alert('Tanggal selesai tidak boleh lebih awal dari tanggal mulai!');
            return;
        }

        try {
            const payload = {
                project_name: form.project_name,
                project_amount: finalCleanAmount, 
                person_in_charge: form.person_in_charge,
                tax_rate_percent: taxPercent,
                tax_value_deduction: calculatedTaxValue,
                project_raw_amount: rawAmount,
                start_date: form.start_date,
                end_date: form.end_date
            };

            const response = await fetch(editingId ? `${API_URL}/${editingId}` : API_URL, {
                method: editingId ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) throw new Error("Gagal menyimpan ke server");

            // Reset form kembali ke kondisi semula
            setForm({ project_name: '', project_amount: '', person_in_charge: '', tax_rate: '0', start_date: '', end_date: '' });
            setEditingId(null);
            setShowForm(false);

            setLoading(true);
            fetchProjects();
        } catch (error) {
            console.error("Gagal menyimpan project baru: ", error);
            alert("Terjadi kesalahan sistem saat menyimpan ke database MySQL.");
        }
    };

    // 5. Fungsi Buka Form Ubah Project (mengisi form dengan data yang ada)
    const handleEdit = (p) => {
        setEditingId(p.id);
        setForm({
            project_name: p.project_name || '',
            project_amount: p.project_raw_amount ?? p.project_amount ?? '',
            person_in_charge: p.person_in_charge || '',
            tax_rate: String(p.tax_rate_percent ?? '0'),
            start_date: p.start_date || '',
            end_date: p.end_date || ''
        });
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancelForm = () => {
        setForm({ project_name: '', project_amount: '', person_in_charge: '', tax_rate: '0', start_date: '', end_date: '' });
        setEditingId(null);
        setShowForm(false);
    };

    // 4. UBAHAN: Fungsi Hapus Project dari API Laravel (MySQL)
    const handleDelete = async (id) => {
        if (confirm('Apakah Anda yakin ingin menghapus project ini dari database?')) {
            try {
                const response = await fetch(`${API_URL}/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'Accept': 'application/json'
                    }
                });

                if (!response.ok) throw new Error("Gagal menghapus data di server");

                setLoading(true);
                fetchProjects();
            } catch (error) {
                console.error("Gagal menghapus project: ", error);
                alert("Gagal menghapus data dari database MySQL!");
            }
        }
    };

    const formatRupiah = (n) =>
        'Rp ' + Number(n).toLocaleString('id-ID');

    // Cek apakah project sudah melewati batas waktu akhirnya (untuk badge Tertunda)
    const isProjectOverdue = (p) => {
        if (!p.end_date) return false;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const endDate = new Date(p.end_date);
        endDate.setHours(0, 0, 0, 0);
        return endDate < today;
    };

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
                    <h1 style={{ fontSize: '18px', fontWeight: '600', margin: 0 }}>Home — Daftar Project</h1>
                    <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px', marginBottom: 0 }}>
                        Kelola semua project keuangan secara terpusat di Database MySQL
                    </p>
                </div>
                <button 
                    onClick={() => showForm ? handleCancelForm() : setShowForm(true)} 
                    style={{
                        display: 'flex', alignItems: 'center', gap: '6px',
                        padding: '10px 16px', background: '#185FA5', color: '#fff',
                        border: 'none', borderRadius: '8px', fontSize: '13px',
                        cursor: 'pointer', fontWeight: '500',
                        width: isMobile ? '100%' : 'auto', justifyContent: 'center',
                        boxSizing: 'border-box'
                    }}
                >
                    {showForm ? '✕ Tutup Form' : '+ Tambah Project'}
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
                    { label: 'Total Project', value: loading ? '...' : projects.length },
                    { label: 'Total Anggaran Bersih', value: loading ? '...' : formatRupiah(projects.reduce((s, p) => s + Number(p.project_amount), 0)) },
                    { label: 'Status Database', value: 'Terhubung MySQL' },
                ].map((s, i) => (
                    <div key={i} style={{
                        background: '#fff', border: '1px solid #e5e7eb',
                        borderRadius: '10px', padding: '14px 16px',
                        boxSizing: 'border-box'
                    }}>
                        <div style={{
                            fontSize: '11px', color: '#6b7280', marginBottom: '4px',
                            textTransform: 'uppercase', letterSpacing: '0.5px'
                        }}>
                            {s.label}
                        </div>
                        <div style={{ fontSize: '20px', fontWeight: '600', wordBreak: 'break-all' }}>{s.value}</div>
                    </div>
                ))}
            </div>

            {/* Form Pendaftaran Baru */}
            {showForm && (
                <div style={{
                    background: '#fff', border: '1px solid #e5e7eb',
                    borderRadius: '12px', padding: '20px', marginBottom: '24px',
                    boxSizing: 'border-box'
                }}>
                    <h2 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px', marginTop: 0 }}>
                        {editingId ? 'Ubah Project' : 'Tambah Project Baru'}
                    </h2>
                    <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', 
                        gap: '14px' 
                    }}>
                        <div style={{ gridColumn: isMobile ? 'auto' : '1 / -1' }}>
                            <label style={{
                                fontSize: '12px', fontWeight: '500',
                                color: '#374151', display: 'block', marginBottom: '5px'
                            }}>
                                Nama Project *
                            </label>
                            <input name="project_name" value={form.project_name}
                                onChange={handleChange} placeholder="Contoh: Renovasi Gedung A"
                                style={{
                                    width: '100%', padding: '10px 12px', border: '1px solid #d1d5db',
                                    borderRadius: '8px', fontSize: '13.5px', outline: 'none', boxSizing: 'border-box'
                                }} />
                        </div>
                        <div>
                            <label style={{
                                fontSize: '12px', fontWeight: '500',
                                color: '#374151', display: 'block', marginBottom: '5px'
                            }}>
                                Besaran Nilai Kontrak Awal (IDR) *
                            </label>
                            <input name="project_amount" value={form.project_amount}
                                onChange={handleChange} type="number" placeholder="0"
                                style={{
                                    width: '100%', padding: '10px 12px', border: '1px solid #d1d5db',
                                    borderRadius: '8px', fontSize: '13.5px', outline: 'none', boxSizing: 'border-box'
                                }} />
                        </div>

                        <div>
                            <label style={{
                                fontSize: '12px', fontWeight: '500',
                                color: '#374151', display: 'block', marginBottom: '5px'
                            }}>
                                PPN Pendapatan *
                            </label>
                            <select name="tax_rate" value={form.tax_rate} onChange={handleChange} style={{
                                width: '100%', padding: '10px 12px', border: '1px solid #d1d5db',
                                borderRadius: '8px', fontSize: '13.5px', outline: 'none', background: '#fff', boxSizing: 'border-box'
                            }}>
                                <option value="0">Tanpa PPN (0%)</option>
                                <option value="10">PPN Lama (10%)</option>
                                <option value="11">PPN Standar (11%)</option>
                                <option value="12">PPN Baru (12%)</option>
                            </select>
                        </div>

                        <div>
                            <label style={{
                                fontSize: '12px', fontWeight: '500',
                                color: '#374151', display: 'block', marginBottom: '5px'
                            }}>
                                Penanggung Jawab *
                            </label>
                            <input name="person_in_charge" value={form.person_in_charge}
                                onChange={handleChange} placeholder="Nama penanggung jawab"
                                style={{
                                    width: '100%', padding: '10px 12px', border: '1px solid #d1d5db',
                                    borderRadius: '8px', fontSize: '13.5px', outline: 'none', boxSizing: 'border-box'
                                }} />
                        </div>

                        <div>
                            <label style={{
                                fontSize: '12px', fontWeight: '500',
                                color: '#374151', display: 'block', marginBottom: '5px'
                            }}>
                                Timeline Awal Project *
                            </label>
                            <input name="start_date" value={form.start_date}
                                onChange={handleChange} type="date"
                                style={{
                                    width: '100%', padding: '10px 12px', border: '1px solid #d1d5db',
                                    borderRadius: '8px', fontSize: '13.5px', outline: 'none', boxSizing: 'border-box'
                                }} />
                        </div>

                        <div>
                            <label style={{
                                fontSize: '12px', fontWeight: '500',
                                color: '#374151', display: 'block', marginBottom: '5px'
                            }}>
                                Timeline Akhir Project *
                            </label>
                            <input name="end_date" value={form.end_date}
                                onChange={handleChange} type="date" min={form.start_date || undefined}
                                style={{
                                    width: '100%', padding: '10px 12px', border: '1px solid #d1d5db',
                                    borderRadius: '8px', fontSize: '13.5px', outline: 'none', boxSizing: 'border-box'
                                }} />
                        </div>

                        {rawAmount > 0 && (
                            <div style={{ 
                                gridColumn: '1 / -1', 
                                background: '#f8fafc', 
                                border: '1px dashed #cbd5e1', 
                                borderRadius: '8px', 
                                padding: '12px 14px',
                                fontSize: '12.5px',
                                color: '#475569'
                            }}>
                                <div style={{ fontWeight: '600', marginBottom: '6px', color: '#0f172a' }}>📋 Jabaran Alokasi Potongan Pajak:</div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                                    <span>Nilai Kontrak Kotor:</span>
                                    <span>{formatRupiah(rawAmount)}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px', color: '#dc2626' }}>
                                    <span>Potongan PPN ({taxPercent}%):</span>
                                    <span>-{formatRupiah(calculatedTaxValue)}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '700', color: '#15803d', paddingTop: '6px', borderTop: '1px solid #e2e8f0', marginTop: '4px' }}>
                                    <span>Anggaran Bersih Project (Disimpan):</span>
                                    <span>{formatRupiah(finalCleanAmount)}</span>
                                </div>
                            </div>
                        )}

                    </div>
                    <div style={{
                        display: 'flex', 
                        flexDirection: isMobile ? 'column-reverse' : 'row',
                        justifyContent: 'flex-end',
                        gap: '8px', marginTop: '16px', paddingTop: '14px',
                        borderTop: '1px solid #e5e7eb'
                    }}>
                        <button onClick={handleCancelForm} style={{
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
                            {editingId ? 'Simpan Perubahan' : 'Simpan Project'}
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
                ) : projects.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '48px', color: '#9ca3af', boxSizing: 'border-box' }}>
                        <div style={{ fontSize: '36px', marginBottom: '10px' }}>📂</div>
                        <div style={{ fontWeight: '500' }}>Belum ada project di Database</div>
                        <div style={{ fontSize: '13px', marginTop: '4px' }}>
                            Klik "Tambah Project" untuk membuat proyek pertama Anda
                        </div>
                    </div>
                ) : (
                    <table style={{ width: '100%', minWidth: '850px', borderCollapse: 'collapse', fontSize: '13px' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid #e5e7eb', background: '#f9fafb' }}>
                                {['#', 'Nama Project', 'Besaran Anggaran Bersih', 'Penanggung Jawab', 'Periode Project', 'Aksi'].map(h => (
                                    <th key={h} style={{
                                        padding: '12px 16px', textAlign: 'left',
                                        fontSize: '11px', fontWeight: '600', color: '#6b7280',
                                        textTransform: 'uppercase', letterSpacing: '0.5px'
                                    }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {projects.map((p, i) => (
                                <tr key={p.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                    <td style={{ padding: '14px 16px', color: '#9ca3af' }}>
                                        {String(i + 1).padStart(2, '0')}
                                    </td>

                                    <td style={{ padding: '14px 16px' }}>
                                        <span
                                            onClick={() => onSelectProject(p)}
                                            style={{
                                                fontWeight: '500', color: '#185FA5',
                                                cursor: 'pointer', textDecoration: 'underline',
                                                textUnderlineOffset: '3px'
                                            }}
                                        >
                                            {p.project_name}
                                        </span>
                                        {p.tax_rate_percent > 0 && (
                                            <span style={{
                                                fontSize: '10px', background: '#fee2e2', color: '#991b1b',
                                                padding: '2px 6px', borderRadius: '4px', marginLeft: '6px', fontWeight: '600'
                                            }}>
                                                Inc. PPN {p.tax_rate_percent}%
                                            </span>
                                        )}
                                    </td>

                                    <td style={{ padding: '14px 16px', fontWeight: '500' }}>
                                        {formatRupiah(p.project_amount)}
                                    </td>
                                    <td style={{ padding: '14px 16px' }}>{p.person_in_charge}</td>

                                    <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                                        {p.start_date || p.end_date ? (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                                                <span style={{ color: '#4b5563' }}>
                                                    📅 {p.start_date || '-'} {p.end_date ? `s/d ${p.end_date}` : ''}
                                                </span>
                                                {isProjectOverdue(p) && (
                                                    <span style={{
                                                        fontSize: '10px', background: '#fee2e2', color: '#991b1b',
                                                        padding: '2px 6px', borderRadius: '4px', fontWeight: '600'
                                                    }}>
                                                        Tertunda
                                                    </span>
                                                )}
                                            </div>
                                        ) : (
                                            <span style={{ color: '#9ca3af' }}>-</span>
                                        )}
                                    </td>

                                    <td style={{ padding: '14px 16px' }}>
                                        <div style={{ display: 'flex', gap: '6px' }}>
                                            <button onClick={() => handleEdit(p)} style={{
                                                padding: '6px 12px', border: '1px solid #93c5fd',
                                                background: '#fff', color: '#185FA5', borderRadius: '6px',
                                                fontSize: '12px', cursor: 'pointer'
                                            }}>
                                                Ubah
                                            </button>
                                            <button onClick={() => handleDelete(p.id)} style={{
                                                padding: '6px 12px', border: '1px solid #fca5a5',
                                                background: '#fff', color: '#ef4444', borderRadius: '6px',
                                                fontSize: '12px', cursor: 'pointer'
                                            }}>
                                                Hapus
                                            </button>
                                        </div>
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