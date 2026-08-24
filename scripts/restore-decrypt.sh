#!/usr/bin/env bash
# ============================================================================
# scripts/restore-decrypt.sh — Restauração com DESCRIPTOGRAFIA (SEC-016/HEL-L05)
#
# Restore testado ANTES da exposição pública (gate de go-live). O teste de
# restore SÓ conta se incluir a descriptografia (age -d) — L05.
#
# Pré-requisitos: age, psql, env DATABASE_URL_TARGET, AGE_PRIVATE_KEY_FILE
# (secret manager — nunca no repo), e o arquivo .sql.age.
#
# Uso:
#   DATABASE_URL_TARGET="postgresql://..." \
#   AGE_PRIVATE_KEY_FILE="$(cat /path/secret)" ./restore-decrypt.sh backups/cydef-leads-*.sql.age
# ============================================================================
set -euo pipefail

: "${DATABASE_URL_TARGET:?DATABASE_URL_TARGET obrigatória (env)}"
: "${AGE_PRIVATE_KEY_FILE:?AGE_PRIVATE_KEY_FILE obrigatória (chave privada via secret manager)}"

BACKUP="${1:?uso: restore-decrypt.sh <arquivo.sql.age>}"
[ -f "$BACKUP" ] || { echo "arquivo não encontrado: $BACKUP"; exit 1; }

echo "→ descriptografando (age)..."
age -d -i "$AGE_PRIVATE_KEY_FILE" "$BACKUP" > /tmp/cydef-restore-$$.sql
echo "→ aplicando em $DATABASE_URL_TARGET (ambiente de teste — nunca produção sem aprovação)..."
psql "$DATABASE_URL_TARGET" -v ON_ERROR_STOP=1 -f /tmp/cydef-restore-$$.sql
rm -f /tmp/cydef-restore-$$.sql

echo "→ verificação pós-restore (contagens, sem dados):"
psql "$DATABASE_URL_TARGET" -tAc "select 'leads='||count(*) from public.leads; select 'consentimentos='||count(*) from public.consentimentos; select 'tokens='||count(*) from public.tokens_confirmacao;"
echo "RESTORE+DESCRIPTOGRAFIA OK — registrar evidência no relatório de gates (S-08)."
