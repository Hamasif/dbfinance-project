<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('neraca_settings', function (Blueprint $table) {
            $table->id();
            // Kolom Aktiva Lancar
            $table->bigInteger('kas_bank')->default(0);
            $table->bigInteger('piutang_usaha')->default(0);
            $table->bigInteger('piutang_lain')->default(0);
            $table->bigInteger('persediaan')->default(0);
            // Kolom Aktiva Tetap
            $table->bigInteger('tanah')->default(0);
            $table->bigInteger('bangunan')->default(0);
            $table->bigInteger('kendaraan')->default(0);
            $table->bigInteger('akm_peny_kendaraan')->default(0);
            $table->bigInteger('alat_kantor')->default(0);
            $table->bigInteger('akm_peny_alat')->default(0);
            // Kolom Pasiva
            $table->bigInteger('utang_bank_pendek')->default(0);
            $table->bigInteger('utang_dagang')->default(0);
            $table->bigInteger('utang_lain')->default(0);
            $table->bigInteger('utang_bank_panjang')->default(0);
            $table->bigInteger('laba_ditahan')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('neraca_settings');
    }
};