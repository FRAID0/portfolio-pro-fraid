# FortLion — Checklist dev/ops

## Avant déploiement
- Vérifier que les variables d’environnement sont correctement séparées PROD vs STAGE:
  - Front: `NEXT_PUBLIC_API_URL`
  - Back: `DATABASE_URL`, `EMAIL_PASSWORD`, `ADMIN_SECRET_KEY`, `CORS_ORIGINS`
- Confirmer que `SMTP_TLS_REJECT_UNAUTHORIZED=true` en prod.
- Vérifier que `/health` répond 200 en environnement cible.
- Vérifier que `/metrics` répond (Prometheus scrape OK).

## Déploiement (Render / Vercel)
- Render:
  - Confirmer la branche/commit du déploiement.
  - Sur échec: ouvrir logs build, identifier la première erreur, relancer après correction.
- Vercel:
  - Confirmer `target=production` (prod) ou preview (stage selon modèle).
  - Vérifier que les env vars (prod/stage) sont au bon scope.

## Post-déploiement (smoke tests)
- Front:
  - Page d’accueil charge sans erreur console.
  - `GET /api/projects` fonctionne via le front (CORS OK).
  - Formulaire contact: envoi OK (429 attendu si spam).
- Back:
  - `GET /health` = 200
  - `GET /metrics` = 200
  - Logs: pas d’erreurs SMTP/DB récurrentes

## Rollback
- Render:
  - Rollback vers le dernier déploiement “green”.
  - Vérifier `/health`, `/metrics`, et les endpoints critiques.
- Vercel:
  - Re-promouvoir un déploiement antérieur (ou redeploy) et vérifier le routage.

## DNS / TLS / Headers
- DNS:
  - `Resolve-DnsName` apex + www (A/AAAA/CNAME)
- TLS / redirects:
  - `curl.exe -I http://...` redirige vers `https://...`
  - Canonical: www vs non-www cohérent
- Headers:
  - HSTS présent si activé
  - XFO/XCTO/Referrer-Policy/Permissions-Policy présents

## Sécurité & hygiene
- `.env` non versionnés; utiliser `*.example` pour documentation.
- Activer Dependabot (ou équivalent) + secret scanning.
- Mettre une rotation régulière des secrets (DB, admin key, SMTP).

