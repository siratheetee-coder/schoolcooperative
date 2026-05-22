# Build app icons: green bg + school logo centered
# Generates: apple-touch-icon.png (180), web-app-manifest-192x192.png, web-app-manifest-512x512.png
Add-Type -AssemblyName System.Drawing

$bgColor = [System.Drawing.ColorTranslator]::FromHtml("#2D7D6F")
$logoPath = Join-Path (Get-Location) "logo-no-bg.png"
$logoRaw = [System.Drawing.Bitmap]::new($logoPath)

# Auto-trim transparent padding so the actual mark fills the icon
function Trim-Transparent($bmp) {
    $w = $bmp.Width; $h = $bmp.Height
    $minX = $w; $minY = $h; $maxX = 0; $maxY = 0
    $found = $false
    # Sample every 2px for speed
    for ($y = 0; $y -lt $h; $y += 2) {
        for ($x = 0; $x -lt $w; $x += 2) {
            $px = $bmp.GetPixel($x, $y)
            if ($px.A -gt 20) {
                $found = $true
                if ($x -lt $minX) { $minX = $x }
                if ($y -lt $minY) { $minY = $y }
                if ($x -gt $maxX) { $maxX = $x }
                if ($y -gt $maxY) { $maxY = $y }
            }
        }
    }
    if (-not $found) { return $bmp }
    $rect = New-Object System.Drawing.Rectangle $minX, $minY, ($maxX - $minX + 1), ($maxY - $minY + 1)
    $cropped = $bmp.Clone($rect, $bmp.PixelFormat)
    return $cropped
}

Write-Host "Trimming transparent padding..."
$logo = Trim-Transparent $logoRaw
"Trimmed logo size: $($logo.Width) x $($logo.Height)" | Write-Host

function Build-Icon($size, $outName, $scalePct) {
    $bmp = New-Object System.Drawing.Bitmap $size, $size
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = 'AntiAlias'
    $g.InterpolationMode = 'HighQualityBicubic'
    $g.PixelOffsetMode = 'HighQuality'

    # Fill background
    $brush = New-Object System.Drawing.SolidBrush $bgColor
    $g.FillRectangle($brush, 0, 0, $size, $size)

    # Compute logo size keeping aspect, fit within (size * scalePct) box
    $maxDim = $size * $scalePct
    $aspect = $logo.Width / $logo.Height
    if ($aspect -ge 1) {
        $w = $maxDim
        $h = $maxDim / $aspect
    } else {
        $h = $maxDim
        $w = $maxDim * $aspect
    }
    $x = ($size - $w) / 2
    $y = ($size - $h) / 2
    $g.DrawImage($logo, $x, $y, $w, $h)

    $brush.Dispose()
    $g.Dispose()

    $outPath = Join-Path (Get-Location) $outName
    $bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
    Write-Host "Wrote $outName ($size x $size)"
}

# Apple touch icon — iOS auto-rounds, fills edge-to-edge
Build-Icon 180 "apple-touch-icon.png" 0.88
# PWA manifest icons (maskable safe-zone = inner 80%)
Build-Icon 192 "web-app-manifest-192x192.png" 0.78
Build-Icon 512 "web-app-manifest-512x512.png" 0.78
# Favicon size
Build-Icon 96 "favicon-96x96.png" 0.88

$logo.Dispose()
$logoRaw.Dispose()
Write-Host "Done."
