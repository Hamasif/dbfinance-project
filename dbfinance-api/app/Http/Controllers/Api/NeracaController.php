<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\NeracaSetting;
use Illuminate\Http\Request;

class NeracaController extends Controller
{
    // Ambil data nilai inputan akun neraca
    public function index()
    {
        $setting = NeracaSetting::first();
        
        if (!$setting) {
            return response()->json([
                'kas_bank' => 0, 'piutang_usaha' => 0, 'piutang_lain' => 0, 'persediaan' => 0,
                'tanah' => 0, 'bangunan' => 0, 'kendaraan' => 0, 'akm_peny_kendaraan' => 0,
                'alat_kantor' => 0, 'akm_peny_alat' => 0, 'utang_bank_pendek' => 0,
                'utang_dagang' => 0, 'utang_lain' => 0, 'utang_bank_panjang' => 0, 'laba_ditahan' => 0
            ]);
        }
        
        return response()->json($setting);
    }

    // Simpan atau perbarui perubahan nilai akun neraca
    public function update(Request $request)
    {
        $setting = NeracaSetting::updateOrCreate(
            ['id' => 1], // Mengunci agar selalu mengupdate baris pertama
            $request->all()
        );

        return response()->json(['message' => 'Nilai akun neraca berhasil disinkronkan ke MySQL!', 'data' => $setting]);
    }
}