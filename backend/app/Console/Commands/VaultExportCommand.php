<?php

namespace App\Console\Commands;

use App\Services\JsonVaultService;
use Illuminate\Console\Command;

class VaultExportCommand extends Command
{
    protected $signature = 'vault:export {--push : Commit and push the vault to GitHub} {--include-private : Include users, messages and logs in the committed file}';

    protected $description = 'Export the database to the JSON vault and optionally push it to GitHub';

    public function handle(JsonVaultService $vault): int
    {
        if ($this->option('include-private')) {
            config(['vault.include_private' => true]);
            $this->warn('Private tables will be included. Make sure the vault repository is private.');
        }

        $result = $vault->export(true, (bool) $this->option('push'));

        $this->info('Vault export complete.');
        foreach ($result as $key => $value) {
            $this->line(sprintf('  %-15s %s', $key, is_bool($value) ? ($value ? 'yes' : 'no') : $value));
        }

        return self::SUCCESS;
    }
}
