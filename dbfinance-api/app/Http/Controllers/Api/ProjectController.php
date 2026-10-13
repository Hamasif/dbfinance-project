<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Project;
use Illuminate\Http\Request;
use App\Models\OfficeCategory;
use App\Models\Transaction;
use App\Models\ProjectTimeline;

class ProjectController extends Controller
{
    public function index()
    {
        // Mengurutkan dari yang terbaru (Pengganti orderBy("createdAt", "desc"))
        return response()->json(Project::latest()->get());
    }

    public function store(Request $request)
    {
        $request->validate([
            'project_name' => 'required|string|max:255',
            'project_amount' => 'required|numeric',
            'person_in_charge' => 'required|string|max:255',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
        ]);

        $data = $request->all();
        foreach (['start_date', 'end_date'] as $field) {
            if (empty($data[$field])) $data[$field] = null;
        }

        $project = Project::create($data);
        return response()->json(['message' => 'Proyek berhasil disimpan ke MySQL!', 'data' => $project]);
    }

    public function update(Request $request, $id)
    {
        $project = Project::findOrFail($id);

        $request->validate([
            'project_name' => 'required|string|max:255',
            'project_amount' => 'required|numeric',
            'person_in_charge' => 'required|string|max:255',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
        ]);

        $data = $request->all();
        foreach (['start_date', 'end_date'] as $field) {
            if (empty($data[$field])) $data[$field] = null;
        }

        $project->update($data);

        // Jika batas waktu project diperpanjang (belum lewat / dihapus),
        // tahapan "Tertunda" yang tenggatnya belum lewat dikembalikan ke status normal
        $today = \Carbon\Carbon::today();
        $projectOverdue = !empty($project->end_date) && $project->end_date->lt($today);

        if (!$projectOverdue) {
            $toRestore = ProjectTimeline::where('project_id', $project->id)
                ->where('status', 'delayed')
                ->where(function ($q) use ($today) {
                    $q->whereNull('end_date')->orWhereDate('end_date', '>=', $today->toDateString());
                })
                ->get();

            foreach ($toRestore as $timeline) {
                $timeline->update([
                    'status' => (!empty($timeline->start_date) && \Carbon\Carbon::parse($timeline->start_date)->gt($today))
                        ? 'pending'
                        : 'in_progress',
                ]);
            }
        }

        return response()->json(['message' => 'Proyek berhasil diperbarui!', 'data' => $project]);
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

            $sisaAnggaran = $project->project_amount - $totalPengeluaran;

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