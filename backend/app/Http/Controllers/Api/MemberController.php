<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Concerns\ApiResponse;
use App\Http\Controllers\Controller;
use App\Http\Resources\MemberResource;
use App\Models\Member;
use App\Support\AcademicYear;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MemberController extends Controller
{
    use ApiResponse;

    public function index(Request $request): JsonResponse
    {
        $query = Member::with('translations');

        if ($request->has('executive')) {
            $query->where('is_executive', $request->boolean('executive'));
        }

        if ($department = $request->query('department')) {
            $query->where('department', $department);
        }

        if ($year = $request->query('academic_year')) {
            $query->where('academic_year', $year);
        }

        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('department', 'like', "%{$search}%")
                    ->orWhereHas('translations', fn ($t) => $t->where('name', 'like', "%{$search}%"));
            });
        }

        $members = $query->orderByDesc('academic_year')->orderByDesc('is_executive')->orderBy('order')->paginate((int) $request->query('per_page', 12));

        return $this->paginated($members, 'Members retrieved.', fn ($member) => (new MemberResource($member))->resolve($request));
    }

    public function years(): JsonResponse
    {
        $years = Member::query()
            ->whereNotNull('academic_year')
            ->distinct()
            ->orderByDesc('academic_year')
            ->pluck('academic_year')
            ->values();

        $current = AcademicYear::current();
        if (! $years->contains($current)) {
            $years->prepend($current);
        }

        return $this->success($years);
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $member = Member::with('translations')->findOrFail($id);

        return $this->success((new MemberResource($member))->resolve($request));
    }
}
