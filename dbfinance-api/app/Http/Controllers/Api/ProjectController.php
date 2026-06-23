<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Project;
use Illuminate\Http\Request;
use App\Models\OfficeCategory;
use App\Models\Transaction;

class ProjectController extends Controller
{
    public function index()
    {
        // Mengurutkan dari yang terbaru (Pengganti orderBy("createdAt", "desc"))
        return response()->json(Project::latest()->get());
    }

    public function store(Request $request)
    {
        $project = Project::create($request->all());
        return response()->json(['message' => 'Proyek berhasil disimpan ke MySQL!', 'data' => $project]);
    }

    public function destroy($id)
    {
        $project = Project::findOrFail($id);
        $project->delete();
        return response()->json(['message' => 'Proyek berhasil dihapus!']);
    }

    public function report()
    {
        // Ambil semua proyek diurutkan dari yang terbaru
        $projects = Project::latest()
            ->with([
                'transactions' => function ($query) {
                    $query->orderBy('date', 'desc')->orderBy('created_at', 'desc');
                }
            ])
            ->get();

        // Petakan data agar format JSON-nya pas dengan kebutuhan frontend React
        $reportData = $projects->map(function ($project) {
            $transactions = $project->transactions;

            // Hitung total akumulasi nominal uang masuk dan keluar
            $totalPemasukan = $transactions->where('type', 'pemasukan')->sum('amount');
            $totalPengeluaran = $transactions->where('type', 'pengeluaran')->sum('amount');

            $sisaAnggaran = $project->project_amount - totalPengeluaran;

            $persen = $project->project_amount > 0
                ? min(100, round(($totalPengeluaran / $project->project_amount) * 100))
                : 0;

            return [
                'id' => $project->id,
                'display_name' => $project->project_name,
                'sub_label' => "PJ: " . $project->person_in_charge,
                'budget_amount' => (int) $project->project_amount,
                'transactions' => $transactions->values(),
                'totalPemasukan' => $totalPemasukan,
                'totalPengeluaran' => $totalPengeluaran,
                'sisaAnggaran' => $sisaAnggaran,
                'persen' => $persen,
                'tag' => 'Project'
            ];
        });

        return response()->json($reportData);
    }

    public function labaRugi()
    {
        // 1. PENDAPATAN JASA: Jumlahkan seluruh anggaran bersih dari semua project
        $pendapatanJasa = Project::sum('project_amount');

        // 2. BIAYA OPERASIONAL: Jumlahkan seluruh transaksi pengeluaran proyek (yang memiliki project_id terikat ke tabel projects)
        $biayaOperasional = Transaction::whereNotNull('project_id')
            ->whereHas('project') // Memastikan project_id tersebut valid ada di tabel projects
            ->where('type', 'pengeluaran')
            ->sum('amount');

        // 3. BIAYA ADMINISTRASI KANTOR: Ambil kategori kantor beserta total akumulasi pengeluaran masing-masing pos
        $categories = OfficeCategory::withSum([
            'transactions as total_expenses' => function ($query) {
                $query->whereIn('type', ['pengeluaran', 'pengeluaran_kantor']);
            }
        ], 'amount')
            ->get();

        $biayaAdminDetail = $categories->map(function ($cat) {
            return [
                'kategori' => $cat->category_name,
                'jumlah' => (int) ($cat->total_expenses ?? 0)
            ];
        })->filter(function ($item) {
            return $item['jumlah'] > 0;
        })->values();

        $totalBiayaAdmin = $biayaAdminDetail->sum('jumlah');

        return response()->json([
            'pendapatanJasa' => (int) $pendapatanJasa,
            'biayaOperasional' => (int) $biayaOperasional,
            'biayaAdminDetail' => $biayaAdminDetail,
            'totalBiayaAdmin' => (int) $totalBiayaAdmin,
        ]);
    }
}