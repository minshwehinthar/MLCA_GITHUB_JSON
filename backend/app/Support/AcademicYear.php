<?php

namespace App\Support;

use Carbon\CarbonInterface;

class AcademicYear
{
    public const START_MONTH = 11;

    public static function current(): string
    {
        $today = now('Asia/Yangon');
        $startYear = (int) $today->format('n') >= self::START_MONTH
            ? (int) $today->format('Y')
            : (int) $today->format('Y') - 1;

        return $startYear.'-'.($startYear + 1);
    }

    public static function fromDate(CarbonInterface $date): string
    {
        $local = $date->copy()->timezone('Asia/Yangon');
        $startYear = (int) $local->format('n') >= self::START_MONTH
            ? (int) $local->format('Y')
            : (int) $local->format('Y') - 1;

        return $startYear.'-'.($startYear + 1);
    }
}
