<?php

namespace App\Helpers;

class NumberFormatter
{
    public static function formatHours($minutes)
    {
        return round($minutes / 60, 1);
    }

    public static function formatLargeNumber($number)
    {
        if ($number >= 1000000) {
            return round($number / 1000000, 1) . 'M';
        } elseif ($number >= 1000) {
            return round($number / 1000, 1) . 'k';
        }

        return round($number, 1);
    }
}
