# Fix duplo-encoding (mojibake) em arquivos fonte do cydef-nexus.
# Arquivos legados foram salvos como UTF-8 de texto lido como cp1252 ("SeguranÃ§a").
# Converte pares mojibake -> caractere correto. Fonte 100% ASCII (codepoints).
# Uso: powershell -ExecutionPolicy Bypass -File fix-encoding.ps1 <raiz>

$root = if ($args.Count -gt 0) { $args[0] } else { "C:\Users\User\.openclaw\workspace\cydef\cydef-nexus" }
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)

$pairs = @()
function Add-Pair($mojiHigh, $mojiLow, $target) {
  $script:pairs += , @(([string][char]$mojiHigh + [char]$mojiLow), [string][char]$target)
}
# C3 ("A") 2-byte
Add-Pair 0xC3 0xA7 0xE7   # c,cc,cao
Add-Pair 0xC3 0xA3 0xE3   # a
Add-Pair 0xC3 0xA9 0xE9   # e
Add-Pair 0xC3 0xA1 0xE1   # a
Add-Pair 0xC3 0xB3 0xF3   # o
Add-Pair 0xC3 0xB5 0xF5   # o
Add-Pair 0xC3 0xA2 0xE2   # a
Add-Pair 0xC3 0xAA 0xEA   # e
Add-Pair 0xC3 0xB4 0xF4   # o
Add-Pair 0xC3 0xBA 0xFA   # u
Add-Pair 0xC3 0xAD 0xED   # i
Add-Pair 0xC3 0xBC 0xFC   # u
Add-Pair 0xC3 0xB1 0xF1   # n
Add-Pair 0xC3 0xA8 0xE8   # e
Add-Pair 0xC3 0xA4 0xE4   # a
Add-Pair 0xC3 0xB6 0xF6   # o
Add-Pair 0xC3 0xA5 0xE5   # a
Add-Pair 0xC3 0xB9 0xF9   # u
Add-Pair 0xC3 0xAC 0xEC   # i
Add-Pair 0xC3 0xAE 0xEE   # i
Add-Pair 0xC3 0xB8 0xF8   # o
Add-Pair 0xC3 0xA6 0xE6   # ae
Add-Pair 0xC3 0x82 0xC2   # A
Add-Pair 0xC3 0x80 0xC0   # A
Add-Pair 0xC3 0xA0 0xE0   # a (com NBSP)
# C2 ("A") 2-byte
Add-Pair 0xC2 0xA0 0x20   # NBSP -> espaco
Add-Pair 0xC2 0xA9 0xA9   # (c)
Add-Pair 0xC2 0xAE 0xAE   # (r)
Add-Pair 0xC2 0xB0 0xB0   # grau
Add-Pair 0xC2 0xB1 0xB1   # +/-
Add-Pair 0xC2 0xB5 0xB5   # micro
Add-Pair 0xC2 0xBA 0xBA   # ord. masc
Add-Pair 0xC2 0xAA 0xAA   # ord. fem
Add-Pair 0xC2 0xA7 0xA7   # paragrafo
Add-Pair 0xC2 0xB7 0xB7   # ponto medio
Add-Pair 0xC2 0xA2 0xA2   # centavos
Add-Pair 0xC2 0xA3 0xA3   # libra
Add-Pair 0xC2 0xAC 0xAC   # negacao
Add-Pair 0xC2 0xAB 0xAB   # aspas <>
Add-Pair 0xC2 0xBB 0xBB   # aspas <>
Add-Pair 0xC2 0xBD 0xBD   # 1/2
Add-Pair 0xC2 0xBC 0xBC   # 1/4
Add-Pair 0xC2 0xBE 0xBE   # 3/4
Add-Pair 0xC2 0xA1 0xA1   # !
Add-Pair 0xC2 0xBF 0xBF   # ?
Add-Pair 0xC2 0xB4 0xB4   # acento agudo
Add-Pair 0xC2 0xB8 0xB8   # cedilha
# --- 3 bytes E2 80 xx / E2 82 AC (travessao, aspas curvas etc) ---
$p3 = @(
  , @(([string][char]0xE2 + [char]0x20AC + [char]0x94), [char]0x2014)   # travessao
  , @(([string][char]0xE2 + [char]0x20AC + [char]0x93), [char]0x2013)   # en dash
  , @(([string][char]0xE2 + [char]0x20AC + [char]0x99), [char]0x2019)   # apostrofo
  , @(([string][char]0xE2 + [char]0x20AC + [char]0x98), [char]0x2018)   # aspas simples
  , @(([string][char]0xE2 + [char]0x20AC + [char]0x9C), [char]0x201C)   # aspas duplas
  , @(([string][char]0xE2 + [char]0x20AC + [char]0x9D), [char]0x201D)   # aspas duplas fecha
  , @(([string][char]0xE2 + [char]0x20AC + [char]0xA6), [char]0x2026)   # reticencias
  , @(([string][char]0xE2 + [char]0x20AC + [char]0xA2), [char]0x2022)   # bullet
  , @(([string][char]0xE2 + [char]0x82 + [char]0xAC), [char]0x20AC)     # euro
)

$exts = @("*.ts", "*.tsx", "*.css", "*.html")
$files = Get-ChildItem -Path $root -Recurse -File -Include $exts |
  Where-Object { $_.FullName -notmatch '\\node_modules\\|\\dist\\|\\.git\\' }
$changed = 0
foreach ($f in $files) {
  $bytes = [System.IO.File]::ReadAllBytes($f.FullName)
  $s = [System.Text.Encoding]::UTF8.GetString($bytes)
  $before = $s
  foreach ($p in $pairs) { $s = $s.Replace($p[0], $p[1]) }
  foreach ($p in $p3)    { $s = $s.Replace($p[0], $p[1]) }
  if ($s -ne $before) {
    [System.IO.File]::WriteAllText($f.FullName, $s, $utf8NoBom)
    Write-Host ("FIX   {0}" -f $f.FullName.Replace($root, ""))
    $changed++
  }
}
Write-Host "Arquivos corrigidos: $changed"
