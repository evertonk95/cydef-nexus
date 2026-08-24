#!/usr/bin/env bash
# ============================================================================
# scripts/backup-encrypt.sh — Backup criptografado da base de leads (SEC-016/HEL-L05)
#
# Padrão: pg_dump (via Supabase pooler/connection string) → criptografia `age`
# (chave pública versionável; chave privada SOMENTE em secret manager).
# Restore: scripts/restore-decrypt.sh (inclui descriptografia — L05).
#
# Pré-requisitos (go-live — REQUER AUTORIZAÇÃO/ambiente):
#   - psql/pg_dump instalados (Postgres client) OU Supabase CLI logado
#   - age instalado (https://github.com/FiloSottile/age)
#   - env: DATABASE_URL (connection string do projeto), AGE_RECIPIENT
#     (chave pública age — versão em secret manager/inventário, NUNCA privada)
#
# Uso:
#   DATABASE_URL="postgresql://..." AGE_RECIPIENT="age1..." ./backup-encrypt.sh
# Saída: backups/cydef-leads-<data>.sql.age (nunca texto claro em repouso)
# ============================================================================
set -euo pipefail

: "${DATABASE_URL:?DATABASE_URL obrigatória (env)}"
: "${AGE_RECIPIENT:?AGE_RECIPIENT obrigatória (chave pública age)}"

BACKUP_DIR="${BACKUP_DIR:-backups}"
mkdir -p "$BACKUP_DIR"
STAMP="$(date +%Y%m%d-%H%M%S)"
OUT="$BACKUP_DIR/cydef-leads-$STAMP.sql.age"

echo "→ dump (texto claro somente em memória/pipe)..."
pg_dump --no-owner --no-privileges --clean --if-exists "$DATABASE_URL" \
  | age -r "$AGE_RECIPIENT" -o "$OUT"

echo "→ backup criptografado: $OUT ($(du -h "$OUT" | cut -f1))"
echo "→ verificação de integridade (descriptografar no ar para hash):"
age -d -i "$AGE_PRIVATE_KEY_FILE" "$OUT" 2>/dev/null | sha256sum || \
  echo "⚠ verificação exige AGE_PRIVATE_KEY_FILE (secret manager) — faça no restore."
