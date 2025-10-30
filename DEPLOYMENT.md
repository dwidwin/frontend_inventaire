# Guide de Déploiement - Frontend Inventaire Club (Node/pm2)

## 🚀 Déploiement sur VPS (sans Docker)

### Prérequis

- Accès SSH au serveur
- Node.js 18+ installé
- pm2 installé globalement (`npm i -g pm2`)
- Domaine configuré (optionnel)

### Première installation (VPS)

1. Cloner le repository
   ```bash
   git clone https://github.com/votre-username/frontend-inventaire-club.git
   cd frontend-inventaire-club
   ```

2. Configurer l'environnement
   ```bash
   cp env.example .env.production
   # Éditer .env.production si nécessaire (VITE_API_URL, VITE_APP_NAME)
   ```

3. Installer et builder
   ```bash
   npm ci
   npm run build
   ```

4. Démarrer via pm2
   ```bash
   npm run start
   # ou directement
   pm2 start ecosystem.config.cjs
   pm2 save
   ```

### Mises à jour (déploiement continu via git pull)

Sur le VPS, exécuter:
```bash
scripts/deploy-vps.sh
```

Ce script fait: `git pull` → `npm ci` → `npm run build` → `pm2 reload`.

### Reverse proxy (optionnel) avec Nginx

Proxy vers l'app sur `localhost:5173` (ou le port configuré dans `ecosystem.config.cjs`).

```
server {
    listen 80;
    server_name votre-domaine.com;

    location / {
        proxy_pass http://127.0.0.1:5173;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Variables d'Environnement (Vite)

| Variable | Description | Valeur par défaut |
|----------|-------------|-------------------|
| `VITE_API_URL` | URL de l'API backend | `https://api-inventory.edwinbouchenna.fr` |
| `VITE_APP_NAME` | Nom de l'application | `Inventaire Club` |

Placer ces variables dans `.env.production` sur le VPS.

### Dépannage

- Vérifier que Node.js 18+ et pm2 sont installés
- `pm2 logs frontend-inventaire` pour voir les logs
- Vérifier `dist/` est présent après build
- Si reverse proxy: `sudo tail -f /var/log/nginx/error.log`

### Monitoring (pm2)

```bash
pm2 status
pm2 logs frontend-inventaire
pm2 monit
```
