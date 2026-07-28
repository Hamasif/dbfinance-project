<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class TransactionController extends Controller
{
    // Mengambil transaksi berdasarkan project
    public function getByProject($projectId)
    {
        $transactions = Transaction::where('project_id', $projectId)
            ->orderBy('date', 'desc')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($transactions);
    }

    // Simpan transaksi
    public function store(Request $request)
    {
        $request->validate([
            'project_id'  => 'required|exists:projects,id',
            'type'        => 'required|in:pemasukan,pengeluaran',
            'description' => 'required|string|max:255',
            'amount'      => 'required|numeric|min:0',
            'date'        => 'required|date',
            'category'    => 'nullable|string|max:100',

            // Upload bukti (opsional)
            'receipt'     => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:2048',
        ]);

        $receiptPath = null;

        if ($request->hasFile('receipt')) {

            $receiptPath = $request
                ->file('receipt')
                ->store('receipts', 'public');
        }

        $transaction = Transaction::create([
            'project_id'  => $request->project_id,
            'type'        => $request->type,
            'description' => $request->description,
            'amount'      => $request->amount,
            'date'        => $request->date,
            'category'    => $request->category,
            'receipt'     => $receiptPath,
        ]);

        return response()->json([
            'message' => 'Transaksi berhasil dicatat!',
            'data' => $transaction
        ], 201);
    }

    // Hapus transaksi
    public function destroy($id)
    {
        $transaction = Transaction::findOrFail($id);

        // Hapus file jika ada
        if ($transaction->receipt && Storage::disk('public')->exists($transaction->receipt)) {
            Storage::disk('public')->delete($transaction->receipt);
        }

        $transaction->delete();

        return response()->json([
            'message' => 'Transaksi berhasil dihapus!'
        ]);
    }

    public function getOfficeExpenses()
    {
        $expenses = Transaction::where('type', 'pengeluaran_kantor')
            ->orderBy('date', 'desc')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($expenses);
    }
}