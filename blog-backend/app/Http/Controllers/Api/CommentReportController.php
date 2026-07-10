<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Comment;
use App\Models\CommentReport;
use Illuminate\Http\Request;

class CommentReportController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'comment_id'  => 'required|exists:comments,id',
            'reason'      => 'required|in:spam,harassment,inappropriate,misinformation,other',
            'description' => 'nullable|string|max:2000',
        ]);

        $existing = CommentReport::where('comment_id', $validated['comment_id'])
            ->where('reported_by', $request->user()->id)
            ->first();

        if ($existing) {
            return response()->json(['message' => 'You already reported this comment.'], 409);
        }

        $report = CommentReport::create([
            'comment_id'  => $validated['comment_id'],
            'reported_by' => $request->user()->id,
            'reason'      => $validated['reason'],
            'description' => $validated['description'] ?? null,
            'status'      => 'pending',
        ]);

        return response()->json($report, 201);
    }

    public function index()
    {
        return response()->json(
            CommentReport::with(['comment:id,text', 'reporter:id,name,email'])
                ->latest()
                ->paginate(20)
        );
    }

    public function updateStatus(Request $request, int $id)
    {
        $validated = $request->validate([
            'status' => 'required|in:reviewed,dismissed',
        ]);

        $report = CommentReport::findOrFail($id);
        $report->update(['status' => $validated['status']]);

        return response()->json($report);
    }

    public function destroy(int $id)
    {
        CommentReport::findOrFail($id)->delete();

        return response()->noContent();
    }

    public function deleteComment(int $id)
    {
        $report = CommentReport::findOrFail($id);
        $report->comment()->delete();
        // report is cascade-deleted with the comment

        return response()->noContent();
    }
}
