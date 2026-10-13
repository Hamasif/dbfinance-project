<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ProjectTimeline;
use Illuminate\Http\Request;

class ProjectTimelineController extends Controller
{
    // Penanda otomatis: tahapan yang sudah melewati batas waktu
    // (tenggat tahapannya sendiri ATAU tenggat akhir project) menjadi "Tertunda"
    private function autoMarkOverdue()
    {
        $today = \Carbon\Carbon::today()->toDateString();

        // 1. Tahapan yang melewati tanggal selesainya sendiri
        ProjectTimeline::whereIn('status', ['pending', 'in_progress'])
            ->whereNotNull('end_date')
            ->whereDate('end_date', '<', $today)
            ->update(['status' => 'delayed']);

        // 2. Project yang sudah melewati batas waktu akhirnya:
        // seluruh tahapan yang belum selesai menjadi "Tertunda"
        $overdueProjectIds = \App\Models\Project::whereNotNull('end_date')
            ->whereDate('end_date', '<', $today)
            ->pluck('id');

        if ($overdueProjectIds->isNotEmpty()) {
            ProjectTimeline::whereIn('project_id', $overdueProjectIds)
                ->whereIn('status', ['pending', 'in_progress'])
                ->update(['status' => 'delayed']);
        }
    }

    public function indexByProject($projectId)
    {
        $this->autoMarkOverdue();

        // Urutkan berdasarkan tanggal selesainya paling dekat (paling atas)
        // hingga yang paling lama (paling bawah); tanpa tenggat diletakkan paling akhir
        $timelines = ProjectTimeline::where('project_id', $projectId)
            ->orderByRaw('ISNULL(end_date) ASC, end_date ASC, start_date ASC')
            ->get();

        return response()->json($timelines);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'project_id' => 'required',
            'step_name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'start_date' => 'required|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'status' => 'required|in:pending,in_progress,completed,delayed',
        ]);

        $timeline = ProjectTimeline::create($validated);

        return response()->json([
            'message' => 'Tahapan timeline berhasil disimpan ke MySQL!',
            'data' => $timeline
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $timeline = ProjectTimeline::findOrFail($id);

        $validated = $request->validate([
            'step_name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'start_date' => 'required|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'status' => 'required|in:pending,in_progress,completed,delayed',
        ]);

        $timeline->update($validated);

        // Jika tenggat diperpanjang hingga belum lewat dan project juga belum lewat batas,
        // status "Tertunda" dikembalikan ke status normal
        $today = \Carbon\Carbon::today();
        $project = $timeline->project;
        $projectOverdue = $project && !empty($project->end_date) && $project->end_date->lt($today);

        if ($timeline->status === 'delayed' && !$projectOverdue
            && (empty($timeline->end_date) || \Carbon\Carbon::parse($timeline->end_date)->gte($today))) {
            $timeline->update([
                'status' => (!empty($timeline->start_date) && \Carbon\Carbon::parse($timeline->start_date)->gt($today))
                    ? 'pending'
                    : 'in_progress',
            ]);
        }

        return response()->json([
            'message' => 'Tahapan timeline berhasil diperbarui!',
            'data' => $timeline->fresh()
        ]);
    }

    public function destroy($id)
    {
        $timeline = ProjectTimeline::findOrFail($id);
        $timeline->delete();

        return response()->json([
            'message' => 'Tahapan timeline berhasil dihapus!'
        ]);
    }

    // Mengambil daftar notifikasi H-7 berdasarkan tanggal berakhir (tenggat)
    public function getNotifications()
    {
        // Sinkronkan status tahapan yang sudah melewati batas waktu terlebih dahulu
        $this->autoMarkOverdue();

        // Mengambil timeline yang tanggal berakhirnya berada di rentang hari ini s/d H-7
        $today = \Carbon\Carbon::now()->toDateString();
        $h7Date = \Carbon\Carbon::now()->addDays(7)->toDateString();

        $upcomingTimelines = ProjectTimeline::with('project')
            ->whereNotNull('end_date')
            ->whereBetween('end_date', [$today, $h7Date])
            ->whereIn('status', ['pending', 'in_progress'])
            ->orderBy('end_date', 'asc')
            ->get();

        return response()->json($upcomingTimelines);
    }
}