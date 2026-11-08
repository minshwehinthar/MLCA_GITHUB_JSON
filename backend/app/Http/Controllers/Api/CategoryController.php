<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Concerns\ApiResponse;
use App\Http\Controllers\Controller;
use App\Http\Resources\CategoryResource;
use App\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    use ApiResponse;

    public function index(Request $request): JsonResponse
    {
        $query = Category::where('is_active', true)->orderBy('order');

        if ($type = $request->query('type')) {
            $query->where('type', $type);
        }

        return $this->success(CategoryResource::collection($query->get())->resolve($request));
    }
}
