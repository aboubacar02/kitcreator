# ============================================================
# KitCreator - Outil bêta : recharger les crédits d'un testeur
#
# Usage :
#   .\add-beta-credits.ps1 -Email "testeur@mail.com"            (+50 par defaut)
#   .\add-beta-credits.ps1 -Email "testeur@mail.com" -Amount 200
#
# Prerequis : etre connecte au projet (npx supabase login au besoin)
# ============================================================
param(
    [Parameter(Mandatory = $true)]
    [string]$Email,
    [int]$Amount = 50
)

$ErrorActionPreference = 'Stop'
$safeEmail = $Email.Replace("'", "''")

$sql = @"
update public.profiles
set credits = credits + $Amount
where id = (select id from auth.users where email = '$safeEmail')
returning id, credits;
"@

$tmp = Join-Path $env:TEMP "opencode\grant.sql"
Set-Content -Path $tmp -Value $sql -Encoding ASCII

npx supabase db query --file $tmp --linked
