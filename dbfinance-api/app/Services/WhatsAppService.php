<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class WhatsAppService
{
    // Mengirim pesan WhatsApp via gateway Fonnte ke nomor tujuan global (.env)
    public function send(string $message, ?string $target = null): bool
    {
        $token = config('services.fonnte.token');
        $rawTargets = $target ?: config('services.whatsapp.target');

        if (!$token || !$rawTargets) {
            Log::warning('Pengiriman WhatsApp dilewati: FONNTE_TOKEN atau WA_REMINDER_TARGET belum diisi di .env');
            return false;
        }

        // Dukungan beberapa nomor tujuan sekaligus, dipisah koma di .env
        $targets = array_values(array_filter(array_map(
            fn ($number) => $this->normalizeNumber(trim($number)),
            explode(',', $rawTargets)
        )));

        if (empty($targets)) {
            Log::warning('Pengiriman WhatsApp dilewati: format nomor tujuan tidak valid.');
            return false;
        }

        $anySent = false;

        foreach ($targets as $target) {
            try {
                $response = Http::asForm()
                    ->withHeaders(['Authorization' => $token])
                    ->post(config('services.fonnte.url'), [
                        'target' => $target,
                        'message' => $message,
                    ]);

                if ($response->successful() && $response->json('status') === true) {
                    $anySent = true;
                } else {
                    Log::error("Gagal mengirim WhatsApp ke {$target} via Fonnte: " . $response->body());
                }
            } catch (\Throwable $e) {
                Log::error("Error koneksi ke Fonnte untuk {$target}: " . $e->getMessage());
            }
        }

        return $anySent;
    }

    // Menyeragamkan format nomor: buang non-digit, awalan 0/8 diubah jadi kode negara 62
    private function normalizeNumber(?string $number): ?string
    {
        if (!$number) {
            return null;
        }

        $digits = preg_replace('/[^0-9]/', '', $number);

        if (str_starts_with($digits, '0')) {
            return '62' . substr($digits, 1);
        }

        if (str_starts_with($digits, '8')) {
            return '62' . $digits;
        }

        return $digits;
    }
}
