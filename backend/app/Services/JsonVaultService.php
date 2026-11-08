<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Process;
use Illuminate\Support\Facades\Schema;

class JsonVaultService
{
    public function export(bool $commit = false, bool $push = true): array
    {
        $publicTables = $this->collect(config('vault.public_tables', []));
        $privateTables = $this->collect(config('vault.private_tables', []));

        $payload = $this->payload($publicTables);
        if (config('vault.include_private')) {
            $payload['tables'] = array_merge($payload['tables'], $privateTables);
        }

        $publicPath = $this->publicPath();
        $this->writeJson($publicPath, $payload);

        if (! config('vault.include_private')) {
            $this->writeJson(config('vault.private_file'), $this->payload($privateTables));
        }

        $media = $this->syncMedia();

        $result = [
            'public_tables' => count($publicTables),
            'private_tables' => count($privateTables),
            'media_files' => $media,
            'committed' => false,
            'pushed' => false,
        ];

        if ($commit) {
            $result = array_merge($result, $this->commit($push));
        }

        return $result;
    }

    public function import(): array
    {
        $publicPath = $this->publicPath();
        if (! File::exists($publicPath)) {
            throw new \RuntimeException('Vault data file not found: '.$publicPath);
        }

        $payload = json_decode(File::get($publicPath), true, flags: JSON_THROW_ON_ERROR);
        $tables = $payload['tables'] ?? [];

        if (! config('vault.include_private')) {
            $privatePath = config('vault.private_file');
            if (File::exists($privatePath)) {
                $private = json_decode(File::get($privatePath), true, flags: JSON_THROW_ON_ERROR);
                $tables = array_merge($tables, $private['tables'] ?? []);
            }
        }

        $allowed = array_merge(config('vault.public_tables', []), config('vault.private_tables', []));
        $imported = [];

        Schema::disableForeignKeyConstraints();

        try {
            foreach ($tables as $table => $rows) {
                if (! in_array($table, $allowed, true) || ! Schema::hasTable($table) || ! is_array($rows)) {
                    continue;
                }

                DB::table($table)->delete();

                foreach (array_chunk($rows, 200) as $chunk) {
                    DB::table($table)->insert($chunk);
                }

                $imported[$table] = count($rows);
            }
        } finally {
            Schema::enableForeignKeyConstraints();
        }

        return $imported;
    }

    public function commit(bool $push = true): array
    {
        $repo = config('vault.repo_path');
        if (! File::isDirectory($repo.'/.git')) {
            return ['committed' => false, 'pushed' => false, 'message' => 'Vault git repository not found at '.$repo];
        }

        $this->runGit($repo, ['git', 'add', '-A']);

        $status = $this->runGit($repo, ['git', 'status', '--porcelain']);
        if (trim($status->output()) === '') {
            return ['committed' => false, 'pushed' => false, 'message' => 'No vault changes to commit.'];
        }

        $message = 'Sync MLCA content '.now()->format('Y-m-d H:i:s');
        $commit = $this->runGit($repo, ['git', 'commit', '-m', $message]);
        $committed = $commit->successful();

        if (! $committed) {
            Log::error('Vault commit failed.', ['output' => $commit->errorOutput()]);

            return ['committed' => false, 'pushed' => false, 'message' => $commit->errorOutput()];
        }

        if (! $push) {
            return ['committed' => true, 'pushed' => false, 'message' => 'Committed locally. Push skipped.'];
        }

        $branch = config('vault.branch', 'main');
        $pushResult = $this->runGit($repo, ['git', 'push', config('vault.remote', 'origin'), 'HEAD:'.$branch]);

        if (! $pushResult->successful()) {
            Log::error('Vault push failed. Authenticate GitHub to enable automatic push.', ['output' => $pushResult->errorOutput()]);

            return ['committed' => true, 'pushed' => false, 'message' => $pushResult->errorOutput()];
        }

        return ['committed' => true, 'pushed' => true, 'message' => 'Vault pushed to GitHub.'];
    }

    public function status(): array
    {
        $repo = config('vault.repo_path');

        return [
            'repo_path' => $repo,
            'repo_exists' => File::isDirectory($repo.'/.git'),
            'data_file' => $this->publicPath(),
            'data_exists' => File::exists($this->publicPath()),
            'private_file' => config('vault.private_file'),
            'private_exists' => File::exists(config('vault.private_file')),
            'include_private' => (bool) config('vault.include_private'),
            'auto_sync' => (bool) config('vault.auto_sync'),
        ];
    }

    protected function payload(array $tables): array
    {
        return [
            'meta' => [
                'app' => 'MLCA',
                'schema_version' => 1,
                'exported_at' => now()->toIso8601String(),
            ],
            'tables' => $tables,
        ];
    }

    protected function collect(array $tables): array
    {
        $data = [];

        foreach ($tables as $table) {
            if (! Schema::hasTable($table)) {
                continue;
            }

            $data[$table] = DB::table($table)->get()
                ->map(fn ($row) => (array) $row)
                ->all();
        }

        return $data;
    }

    protected function writeJson(string $path, array $payload): void
    {
        File::ensureDirectoryExists(dirname($path));
        File::put($path, json_encode($payload, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR));
    }

    protected function syncMedia(): int
    {
        $source = config('vault.media_source');
        $destination = rtrim(config('vault.repo_path'), '/').'/'.config('vault.media_dir');

        if (! File::isDirectory($source)) {
            return 0;
        }

        File::ensureDirectoryExists($destination);

        $result = Process::timeout(300)->run(['rsync', '-a', '--delete', rtrim($source, '/').'/', rtrim($destination, '/').'/']);
        if (! $result->successful()) {
            File::copyDirectory($source, $destination);
        }

        return count(File::allFiles($destination));
    }

    protected function publicPath(): string
    {
        return rtrim(config('vault.repo_path'), '/').'/'.config('vault.public_file');
    }

    protected function runGit(string $repo, array $command)
    {
        return Process::path($repo)->timeout(180)->run($command);
    }
}
