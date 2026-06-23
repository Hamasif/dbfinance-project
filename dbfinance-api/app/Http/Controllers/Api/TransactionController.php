<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use Illuminate\Http\Request;

class TransactionController extends Controller
{
    // Mengambil transaksi berdasarkan ID Project tertentu
    public function getByProject($projectId)
    {
        $transactions = Transaction::where('project_id', $projectId)
                                    ->orderBy('date', 'desc')
                                    ->orderBy('created_at', 'desc')
                                    ->get();
        return response()->json($transactions);
    }

    // Menyimpan transaksi baru
    public function store(Request $request)
    {
        $request->validate([
            'project_id'  => 'required|exists:projects,id',
            'type'        => 'required|in:pemasukan,pengeluaran',
            'description' => 'required|string',
            'amount'      => 'required|numeric',
            'date'        => 'required|date',
        ]);

        $transaction = Transaction::create($request->all());

        return response()->json([
            'message' => 'Transaksi berhasil dicatat ke MySQL!',
            'data' => $transaction
        ]);
    }

    // Menghapus transaksi
    public function destroy($id)
    {
        $transaction = Transaction::findOrFail($id);
        $transaction->delete();

        return response()->json(['message' => 'Transaksi berhasil dihapus!']);
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