<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class CategoryController extends Controller
{
    public function index()
    {
        return response()->json(Category::withCount('blogs')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'  => 'required|string|max:255|unique:categories,name',
            'slug'  => 'nullable|string|max:255|unique:categories,slug',
            'image' => 'nullable|image|max:2048',
        ]);

        if (! isset($validated['slug'])) {
            $validated['slug'] = \Illuminate\Support\Str::slug($validated['name']);
        }

        if ($request->hasFile('image')) {
            $validated['image'] = Storage::url($request->file('image')->store('categories', 'public'));
        }

        $category = Category::create($validated);

        return response()->json($category, 201);
    }

    public function update(Request $request, Category $category)
    {
        $validated = $request->validate([
            'name'  => 'sometimes|string|max:255|unique:categories,name,' . $category->id,
            'slug'  => 'nullable|string|max:255|unique:categories,slug,' . $category->id,
            'image' => 'nullable|image|max:2048',
        ]);

        if ($request->hasFile('image')) {
            $validated['image'] = Storage::url($request->file('image')->store('categories', 'public'));
        }

        $category->update($validated);

        return response()->json($category);
    }

    public function destroy(Category $category)
    {
        if ($category->blogs()->exists()) {
            return response()->json([
                'message' => 'Cannot delete category with existing blogs.',
            ], 409);
        }

        $category->delete();

        return response()->noContent();
    }
}
