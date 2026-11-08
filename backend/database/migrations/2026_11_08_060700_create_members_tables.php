<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('members', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('photo')->nullable();
            $table->string('email')->nullable();
            $table->string('phone', 40)->nullable();
            $table->string('department')->nullable();
            $table->string('academic_year')->nullable();
            $table->string('position')->nullable();
            $table->string('facebook')->nullable();
            $table->string('telegram')->nullable();
            $table->boolean('is_executive')->default(false)->index();
            $table->boolean('is_active')->default(true)->index();
            $table->unsignedInteger('order')->default(0);
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('member_translations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('member_id')->constrained()->cascadeOnDelete();
            $table->string('locale', 5);
            $table->string('name');
            $table->string('position')->nullable();
            $table->text('biography')->nullable();
            $table->timestamps();

            $table->unique(['member_id', 'locale']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('member_translations');
        Schema::dropIfExists('members');
    }
};
