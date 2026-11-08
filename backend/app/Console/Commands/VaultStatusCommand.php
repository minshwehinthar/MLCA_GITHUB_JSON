<?php

namespace App\Console\Commands;

use App\Services\JsonVaultService;
use Illuminate\Console\Command;

class VaultStatusCommand extends Command
{
    protected $signature = 'vault:status';

    protected $description = 'Show the current JSON vault configuration and repository status';

    public function handle(JsonVaultService $vault): int
    {
        foreach ($vault->status() as $key => $value) {
            $this->line(sprintf('%-18s %s', $key, is_bool($value) ? ($value ? 'yes' : 'no') : $value));
        }

        return self::SUCCESS;
    }
}
