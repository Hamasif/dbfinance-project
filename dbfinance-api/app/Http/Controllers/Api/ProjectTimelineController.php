<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ProjectTimeline;
use Illuminate\Http\Request;

class ProjectTimelineController extends Controller
{
    public function indexByProject($projectId)
    {
        $timelines = ProjectTimeline::where('project_id', $projectId)
            ->orderBy('start_date', 'asc')
            ->get();

        return response()->json($timelines);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'project_id'  => 'required',
            'step_name'   => 'required|string|max:255',
            'description' => 'nullable|string',
            'start_date'  => 'required|date',
            'end_date'    => 'nullable|date',
            'status'      => 'required|in:pending,in_progress,completed,delayed',
        ]);

        $timeline = ProjectTimeline::create($validated);

        return response()->json([
            'message' => 'Tahapan timeline berhasil disimpan ke MySQL!',
            'data'    => $timeline
        ], 201);
    }

    public function destroy($id)
    {
        $timeline = ProjectTimeline::findOrFail($id);
        $timeline->delete();

        return response()->json([
            'message' => 'Tahapan timeline berhasil dihapus!'
        ]);
    }
}