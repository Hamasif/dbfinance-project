<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            // UBAH JADI NULLABLE
            $table->foreignId('project_id')->nullable()->constrained('projects')->onDelete('cascade');
            $table->string('type');
            $table->string('description');
            $table->bigInteger('amount');
            $table->date('date');
            $table->string('category')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};