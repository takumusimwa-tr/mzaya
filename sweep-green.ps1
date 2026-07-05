# sweep-green.ps1
# Run from anywhere. Sweeps all red brand colors -> green across the whole frontend
# in one pass. Commit first so you can `git diff` / revert if needed.
#
# Usage:
#   cd C:\Users\takum\Downloads\Projects\mzaya
#   powershell -ExecutionPolicy Bypass -File sweep-green.ps1

$root = "C:\Users\takum\Downloads\Projects\mzaya\frontend\src"

# Longer/variant strings first so the base #FF3008 doesn't partially match them.
# (PowerShell -replace is regex; these hex strings have no regex specials, so fine.)
$map = [ordered]@{
  'FF300840' = '00A65140'   # red glow 25%   -> green glow
  'FF300830' = '00A65130'   # red 19%        -> green
  'FF300820' = '00A65120'
  'FF3008'   = '00A651'     # base red       -> Mzaya green (LAST of the FF3008* set)
  'FFF0EE'   = 'EDFAF3'     # light red bg   -> light green bg
}

$changed = 0
Get-ChildItem -Path $root -Recurse -Include *.jsx, *.js, *.css, *.html | ForEach-Object {
  $content = Get-Content $_.FullName -Raw
  $orig = $content
  foreach ($key in $map.Keys) {
    $content = $content -replace $key, $map[$key]
  }
  if ($content -ne $orig) {
    Set-Content -Path $_.FullName -Value $content -NoNewline
    Write-Host "swept: $($_.Name)"
    $changed++
  }
}
Write-Host ""
Write-Host "Done. $changed file(s) changed."
Write-Host "Review with 'git diff', restart Vite, then commit."
