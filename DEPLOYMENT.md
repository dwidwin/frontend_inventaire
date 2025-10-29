# Guide de Déploiement - Frontend Inventaire Club

## 🚀 Déploiement sur VPS

### Prérequis

- VPS avec Docker et Docker Compose installés
- Accès SSH au serveur
- Domaine configuré (optionnel)

### Méthode 1: Déploiement avec Docker (Recommandé)

1. **Cloner le repository sur votre VPS**
   ```bash
   git clone https://github.com/votre-username/frontend-inventaire-club.git
   cd frontend-inventaire-club
   ```

2. **Configurer l'environnement**
   ```bash
   cp env.example .env
   # Modifier .env si nécessaire
   ```

3. **Déployer avec Docker Compose**
   ```bash
   chmod +x deploy.sh
   ./deploy.sh
   ```

4. **Vérifier le déploiement**
   ```bash
   docker-compose ps
   docker-compose logs -f
   ```

### Méthode 2: Déploiement manuel

1. **Installer les dépendances**
   ```bash
   npm install
   ```

2. **Construire l'application**
   ```bash
   npm run build
   ```

3. **Servir avec nginx**
   ```bash
   # Copier les fichiers buildés vers nginx
   sudo cp -r dist/* /var/www/html/
   
   # Configurer nginx
   sudo nano /etc/nginx/sites-available/inventaire-club
   ```

   Configuration nginx:
   ```nginx
   server {
       listen 80;
       server_name votre-domaine.com;
       root /var/www/html;
       index index.html;

       location / {
           try_files $uri $uri/ /index.html;
       }

       location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
           expires 1y;
           add_header Cache-Control "public, immutable";
       }
   }
   ```

### Configuration SSL (Optionnel)

1. **Installer Certbot**
   ```bash
   sudo apt update
   sudo apt install certbot python3-certbot-nginx
   ```

2. **Obtenir un certificat SSL**
   ```bash
   sudo certbot --nginx -d votre-domaine.com
   ```

### Variables d'Environnement

| Variable | Description | Valeur par défaut |
|----------|-------------|-------------------|
| `VITE_API_URL` | URL de l'API backend | `https://api-inventory.edwinbouchenna.fr` |
| `VITE_APP_NAME` | Nom de l'application | `Inventaire Club` |

### Commandes utiles

```bash
# Voir les logs
docker-compose logs -f

# Redémarrer l'application
docker-compose restart

# Mettre à jour l'application
git pull
docker-compose up --build -d

# Arrêter l'application
docker-compose down

# Voir l'utilisation des ressources
docker stats
```

### Dépannage

**Problème de connexion à l'API**
- Vérifier que l'API est accessible depuis le VPS
- Vérifier la configuration CORS de l'API
- Vérifier les variables d'environnement

**Problème de build**
- Vérifier que Node.js 18+ est installé
- Vérifier les permissions des fichiers
- Vérifier l'espace disque disponible

**Problème de nginx**
- Vérifier la configuration nginx
- Vérifier que le port 80 est ouvert
- Vérifier les logs nginx: `sudo tail -f /var/log/nginx/error.log`

### Monitoring

**Logs d'application**
```bash
docker-compose logs -f frontend
```

**Métriques système**
```bash
docker stats
htop
```

**Vérification de santé**
```bash
curl -I http://votre-ip:80
```

### Sauvegarde

**Sauvegarder la configuration**
```bash
tar -czf inventaire-club-backup-$(date +%Y%m%d).tar.gz .
```

**Restaurer depuis une sauvegarde**
```bash
tar -xzf inventaire-club-backup-YYYYMMDD.tar.gz
docker-compose up -d
```
