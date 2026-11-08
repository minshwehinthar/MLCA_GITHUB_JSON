<?php

namespace Database\Seeders\Support;

use Illuminate\Support\Facades\Storage;

class SampleMedia
{
    public static function generate(): void
    {
        $disk = Storage::disk('public');
        $disk->makeDirectory('uploads/seed');
        $dir = $disk->path('uploads/seed');

        self::image($dir, 'hero.jpg', 1600, 900, 'MON LITERATURE & CULTURE', 'Together We Preserve Our Heritage', '#641C35', '#2B0A17');
        self::image($dir, 'about.jpg', 1200, 800, 'ABOUT MLCA', 'Our Story, Our Culture', '#4A1427', '#641C35');
        self::image($dir, 'contact.jpg', 1400, 700, 'GET IN TOUCH', 'We would love to hear from you', '#641C35', '#8A2B4A');

        $posts = [
            ['post1.jpg', 'MON NATIONAL DAY', 'Celebrating unity and heritage', '#641C35', '#8A2B4A'],
            ['post2.jpg', 'CULTURAL WORKSHOP', 'Learning traditional Mon dance', '#7A4B12', '#C49A45'],
            ['post3.jpg', 'STUDENT WELCOME', 'A warm welcome to new members', '#2B4A3A', '#4C8A6A'],
            ['post4.jpg', 'LITERATURE TALK', 'Preserving the Mon script', '#3A2B4A', '#6A4C8A'],
        ];
        foreach ($posts as $p) {
            self::image($dir, $p[0], 1200, 700, $p[1], $p[2], $p[3], $p[4]);
        }

        $activities = [
            ['activity1.jpg', 'MON NATIONAL DAY CELEBRATION', 'Hpa-An', '#641C35', '#C49A45'],
            ['activity2.jpg', 'TRADITIONAL CULTURAL EVENT', 'University Campus', '#3A2B4A', '#8A5C2B'],
            ['activity3.jpg', 'STUDENT WELCOME CEREMONY', 'Main Hall', '#1F3A4A', '#3A7A8A'],
            ['activity4.jpg', 'COMMUNITY SERVICE', 'Hpa-An Township', '#2B4A3A', '#6A8A3A'],
        ];
        foreach ($activities as $p) {
            self::image($dir, $p[0], 1200, 700, $p[1], $p[2], $p[3], $p[4]);
        }

        $events = [
            ['event1.jpg', 'MON CULTURAL FESTIVAL', 'Annual celebration', '#641C35', '#C49A45'],
            ['event2.jpg', 'LITERATURE SEMINAR', 'Guest speakers', '#2B3A4A', '#5A7A9A'],
            ['event3.jpg', 'TRADITIONAL DANCE SHOW', 'Student performance', '#4A2B3A', '#8A5A7A'],
        ];
        foreach ($events as $p) {
            self::image($dir, $p[0], 1200, 700, $p[1], $p[2], $p[3], $p[4]);
        }

        $labels = ['Heritage', 'Dance', 'Music', 'Literature', 'Community', 'Ceremony', 'Campus', 'Festival'];
        for ($i = 1; $i <= 8; $i++) {
            $hue = ['#641C35', '#7A4B12', '#2B4A3A', '#3A2B4A', '#1F3A4A', '#4A2B3A', '#2B3A4A', '#4A3A1F'][$i - 1];
            self::image($dir, "gallery{$i}.jpg", 1000, 1000, $labels[$i - 1], 'MLCA Gallery', $hue, '#C49A45');
        }

        $members = [
            ['member1.jpg', 'NAI', 'Chairperson'],
            ['member2.jpg', 'MI', 'Vice Chairperson'],
            ['member3.jpg', 'NAI', 'General Secretary'],
            ['member4.jpg', 'MI', 'Treasurer'],
            ['member5.jpg', 'NAI', 'Event Coordinator'],
            ['member6.jpg', 'MI', 'Cultural Officer'],
            ['member7.jpg', 'NAI', 'Member'],
            ['member8.jpg', 'MI', 'Member'],
        ];
        foreach ($members as $i => $m) {
            self::portrait($dir, $m[0], $m[1], $m[2], $i);
        }

        for ($i = 1; $i <= 3; $i++) {
            self::image($dir, "video{$i}.jpg", 1200, 675, ['MON DOCUMENTARY', 'TRADITIONAL PERFORMANCE', 'CULTURE LECTURE'][$i - 1], 'Watch the story', '#641C35', '#C49A45');
        }

        self::logo($dir);
        self::favicon($dir);

        self::pdf($dir, 'document1.pdf', 'MLCA Annual Report 2026');
        self::pdf($dir, 'document2.pdf', 'Mon Cultural Guidelines');
        self::pdf($dir, 'document3.pdf', 'Association Constitution');
    }

    protected static function hexRgb(string $hex): array
    {
        $hex = ltrim($hex, '#');

        return [hexdec(substr($hex, 0, 2)), hexdec(substr($hex, 2, 2)), hexdec(substr($hex, 4, 2))];
    }

    protected static function image(string $dir, string $name, int $w, int $h, string $title, string $subtitle, string $from, string $to): void
    {
        $img = imagecreatetruecolor($w, $h);
        [$r1, $g1, $b1] = self::hexRgb($from);
        [$r2, $g2, $b2] = self::hexRgb($to);

        for ($y = 0; $y < $h; $y++) {
            $t = $y / max(1, $h - 1);
            $color = imagecolorallocate($img, (int) ($r1 + ($r2 - $r1) * $t), (int) ($g1 + ($g2 - $g1) * $t), (int) ($b1 + ($b2 - $b1) * $t));
            imageline($img, 0, $y, $w, $y, $color);
        }

        $gold = imagecolorallocatealpha($img, 196, 154, 69, 40);
        $white = imagecolorallocatealpha($img, 250, 247, 240, 20);
        imagefilledellipse($img, (int) ($w * 0.82), (int) ($h * 0.2), (int) ($w * 0.5), (int) ($w * 0.5), $gold);
        imagefilledellipse($img, (int) ($w * 0.12), (int) ($h * 0.85), (int) ($w * 0.35), (int) ($w * 0.35), $gold);
        imagefilledrectangle($img, 0, 0, (int) ($w * 0.012), $h, imagecolorallocate($img, 196, 154, 69));

        $font = self::font();
        if ($font) {
            $titleSize = max(22, (int) ($w / 26));
            $subSize = max(14, (int) ($w / 55));
            imagettftext($img, $titleSize, 0, (int) ($w * 0.07), (int) ($h * 0.5), $white, $font, $title);
            imagettftext($img, $subSize, 0, (int) ($w * 0.07), (int) ($h * 0.58), imagecolorallocate($img, 230, 210, 170), $font, $subtitle);
            imagettftext($img, max(12, (int) ($w / 70)), 0, (int) ($w * 0.07), (int) ($h * 0.68), imagecolorallocate($img, 200, 180, 150), $font, 'MLCA - UCShPa-An');
        } else {
            imagestring($img, 5, (int) ($w * 0.07), (int) ($h * 0.48), $title, $white);
            imagestring($img, 4, (int) ($w * 0.07), (int) ($h * 0.56), $subtitle, $white);
        }

        imagejpeg($img, $dir.'/'.$name, 88);
        imagedestroy($img);
    }

    protected static function portrait(string $dir, string $name, string $initial, string $role, int $index): void
    {
        $w = 600;
        $h = 600;
        $img = imagecreatetruecolor($w, $h);
        $palettes = [[100, 28, 53], [43, 74, 58], [58, 43, 74], [31, 58, 74], [74, 43, 58], [74, 58, 31]];
        [$r, $g, $b] = $palettes[$index % count($palettes)];

        for ($y = 0; $y < $h; $y++) {
            $t = $y / $h;
            $color = imagecolorallocate($img, (int) ($r * (0.5 + $t * 0.7)), (int) ($g * (0.5 + $t * 0.7)), (int) ($b * (0.5 + $t * 0.7)));
            imageline($img, 0, $y, $w, $y, $color);
        }

        $gold = imagecolorallocate($img, 196, 154, 69);
        $white = imagecolorallocate($img, 250, 247, 240);
        imagefilledellipse($img, $w / 2, 240, 260, 260, imagecolorallocatealpha($img, 250, 247, 240, 100));
        imagefilledellipse($img, $w / 2, 520, 360, 260, imagecolorallocatealpha($img, 250, 247, 240, 100));
        imagefilledellipse($img, $w / 2, 240, 180, 180, $gold);

        $font = self::font();
        if ($font) {
            $box = imagettfbbox(72, 0, $font, $initial);
            $tw = $box[2] - $box[0];
            imagettftext($img, 72, 0, (int) (($w - $tw) / 2), 265, $white, $font, $initial);
            $box = imagettfbbox(28, 0, $font, $role);
            $tw = $box[2] - $box[0];
            imagettftext($img, 24, 0, (int) (($w - $tw) / 2), 560, $white, $font, $role);
        }

        imagejpeg($img, $dir.'/'.$name, 88);
        imagedestroy($img);
    }

    protected static function logo(string $dir): void
    {
        $svg = <<<'SVG'
<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#641C35"/>
      <stop offset="1" stop-color="#3A0F1E"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="96" fill="url(#bg)"/>
  <circle cx="256" cy="256" r="188" fill="none" stroke="#C49A45" stroke-width="10"/>
  <circle cx="256" cy="256" r="160" fill="none" stroke="#C49A45" stroke-width="2" stroke-dasharray="6 8"/>
  <path d="M256 96c40 52 40 128 0 180-40-52-40-128 0-180z" fill="#C49A45"/>
  <path d="M256 236c40 52 40 128 0 180-40-52-40-128 0-180z" fill="#E8C983"/>
  <circle cx="256" cy="256" r="26" fill="#641C35" stroke="#C49A45" stroke-width="6"/>
  <text x="256" y="430" text-anchor="middle" font-family="Georgia, serif" font-size="54" font-weight="bold" fill="#FAF7F0">MLCA</text>
  <text x="256" y="462" text-anchor="middle" font-family="Arial, sans-serif" font-size="15" letter-spacing="3" fill="#C49A45">CULTURE · HERITAGE</text>
</svg>
SVG;
        file_put_contents($dir.'/logo.svg', $svg);
    }

    protected static function favicon(string $dir): void
    {
        $img = imagecreatetruecolor(64, 64);
        $bg = imagecolorallocate($img, 100, 28, 53);
        $gold = imagecolorallocate($img, 196, 154, 69);
        imagefilledrectangle($img, 0, 0, 64, 64, $bg);
        imagefilledellipse($img, 32, 32, 44, 44, $gold);
        imagefilledellipse($img, 32, 32, 30, 30, $bg);
        imagefilledellipse($img, 32, 32, 12, 12, $gold);
        imagepng($img, $dir.'/favicon.png');
        imagedestroy($img);
    }

    protected static function pdf(string $dir, string $name, string $title): void
    {
        $title = str_replace(['\\', '(', ')'], ['\\\\', '\\(', '\\)'], $title);
        $content = "BT /F1 24 Tf 72 760 Td ({$title}) Tj ET\n"
            ."BT /F1 12 Tf 72 720 Td (Mon Literature and Culture Association) Tj ET\n"
            ."BT /F1 12 Tf 72 700 Td (University of Computer Studies - Hpa-An) Tj ET\n"
            ."BT /F1 11 Tf 72 660 Td (This is a sample PDF generated for the MLCA document library.) Tj ET\n"
            ."BT /F1 11 Tf 72 640 Td (Replace it with real association documents from the admin dashboard.) Tj ET\n";

        $objects = [
            '<< /Type /Catalog /Pages 2 0 R >>',
            '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
            '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>',
            '<< /Length '.strlen($content)." >>\nstream\n".$content."endstream",
            '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
        ];

        $pdf = "%PDF-1.4\n";
        $offsets = [];
        foreach ($objects as $i => $obj) {
            $offsets[$i + 1] = strlen($pdf);
            $pdf .= ($i + 1)." 0 obj\n".$obj."\nendobj\n";
        }

        $xref = strlen($pdf);
        $pdf .= 'xref'."\n0 ".(count($objects) + 1)."\n0000000000 65535 f \n";
        foreach ($offsets as $offset) {
            $pdf .= sprintf("%010d 00000 n \n", $offset);
        }
        $pdf .= 'trailer << /Size '.(count($objects) + 1)." /Root 1 0 R >>\nstartxref\n{$xref}\n%%EOF";

        file_put_contents($dir.'/'.$name, $pdf);
    }

    protected static function font(): ?string
    {
        $candidates = [
            '/System/Library/Fonts/Supplemental/Arial Bold.ttf',
            '/System/Library/Fonts/Supplemental/Arial.ttf',
            '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',
        ];

        foreach ($candidates as $font) {
            if (file_exists($font)) {
                return $font;
            }
        }

        return null;
    }
}
