<?php

namespace App\Services;

use GuzzleHttp\Client;
use Illuminate\Support\Facades\Cache;

class QuoteService
{
    public function __construct(private ?Client $client = null)
    {
        $this->client ??= new Client(['timeout' => 5]);
    }

    public function quoteOfTheDay(): array
    {
        return Cache::remember('quote-of-the-day', now()->addHour(), function () {
            try {
                $res = $this->client->get('https://zenquotes.io/api/random');
                $data = json_decode((string) $res->getBody(), true);

                return ['quote' => $data[0]['q'] ?? '', 'author' => $data[0]['a'] ?? ''];
            } catch (\Throwable $e) {
                return ['quote' => 'Words are the voice of the heart.', 'author' => 'Anonymous'];
            }
        });
    }
}
