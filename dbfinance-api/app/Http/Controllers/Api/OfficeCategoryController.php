<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\OfficeCategory;
use Illuminate\Http\Request;

class OfficeCategoryController extends Controller
{
    public function index()
    {
        // Mengambil kategori pos dan otomatis menjumlahkan kolom 'amount' dari relasi transaksi yang bertipe 'pengeluaran'
        $categories = OfficeCategory::latest()
            ->withSum(['transactions as total_expenses' => function ($query) {
                $query->where('type', 'pengeluaran');
            }], 'amount')
            ->get();

        // Mengubah nilai null menjadi 0 sebelum dikirim ke React
        $categories->transform(function ($item) {
            $item->total_expenses = $item->total_expenses ?? 0;
            return $item;
        });

        return response()->json($categories);
    }

    public function store(Request $request)
    {
        $request->validate([
            'category_name'    => 'required|string',
            'person_in_charge' => 'required|string',
        ]);

        $category = OfficeCategory::create($request->all());

        return response()->json([
            'message' => 'Kategori kantor berhasil disimpan!',
            'data' => $category
        ]);
    }

    public function destroy($id)
    {
        $category = OfficeCategory::findOrFail($id);
        $category->delete();

        return response()->json(['message' => 'Kategori pos berhasil dihapus!']);
    }

    public function report()
{
    // Ambil semua kategori kantor beserta transaksi terkait yang filternya bertipe pengeluaran
    $categories = OfficeCategory::latest()
        ->with(['transactions' => function($query) {
            $query->whereIn('type', ['pengeluaran', 'pengeluaran_kantor'])
                  ->orderBy('date', 'desc')
                  ->orderBy('created_at', 'desc');
        }])
        ->get();

    // Map data agar sesuai dengan struktur state yang dibutuhkan frontend React Anda
    $reportData = $categories->map(function ($cat) {
        $transactions = $cat->transactions;
        $totalPengeluaran = $transactions->sum('amount');

        return [
            'id' => $cat->id,
            'display_name' => $cat->category_name,
            'sub_label' => "Purchaser: " . $cat->person_in_charge,
            'transactions' => $transactions->values(),
            'totalPengeluaran' => $totalPengeluaran,
            'tag' => 'Kas Kantor'
        ];
    });

    return response()->json($reportData);
}
}