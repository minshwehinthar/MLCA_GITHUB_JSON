<?php

namespace App\Console\Commands;

use App\Services\JsonVaultService;
use Illuminate\Console\Command;

class VaultImportCommand extends Command
{
    protected $signature = 'vault:import {--force : Skip the confirmation prompt}';

    protected $description = 'Import JSON vault data into the local database';

    public function handle(JsonVaultService $vault): int
    {
        if (! $this->option('force') && ! $this->confirm('This will replace local content with the JSON vault. Continue?')) {
            return self::FAILURE;
        }

        $result = $vault->import();

        $this->info('Vault import complete.');
        foreach ($result['tables'] as $table => $count) {
            $this->line(sprintf('  %-24s %d rows', $table, $count));
        }
        $this->line(sprintf('  %-24s %d files', 'media', $result['media_files']));

        return self::SUCCESS;
    }
}
