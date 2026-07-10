<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Contact;
use Illuminate\Http\Request;

class ContactController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'    => 'required|string|max:255',
            'email'   => 'required|email|max:255',
            'phone'   => 'nullable|string|max:32',
            'subject' => 'required|string|max:255',
            'message' => 'required|string',
        ]);

        $contact = Contact::create($validated + ['is_read' => false]);

        return response()->json($contact, 201);
    }

    public function index()
    {
        return response()->json(Contact::latest()->paginate(20));
    }

    public function read(int $id)
    {
        $contact = Contact::findOrFail($id);
        $contact->update(['is_read' => true]);

        return response()->json($contact);
    }

    public function destroy(int $id)
    {
        Contact::findOrFail($id)->delete();

        return response()->noContent();
    }
}
