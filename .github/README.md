# GitHub Actions Workflows

Ce dossier contient les workflows GitHub Actions pour automatiser les tests et le déploiement de l'application Motismo.

## Workflows disponibles

### 1. `tests.yml` - Tests principaux
**Déclenchement :** Push sur toutes les branches et Pull Requests

Ce workflow exécute :
- **Tests Backend** : Tests unitaires avec PostgreSQL
- **Tests Frontend** : Tests unitaires avec Jest
- **Lint et Format** : Vérification du code avec ESLint et Prettier
- **Build Check** : Vérification que l'application se compile correctement

### 2. `e2e-tests.yml` - Tests End-to-End
**Déclenchement :** Push sur `dev`/`preprod` et Pull Requests vers `dev`/`preprod`

Ce workflow exécute les tests E2E complets avec les services démarrés.

### 3. `deploy.yml` - Déploiement en production
**Déclenchement :** Push sur `dev` et `preprod`

Ce workflow prépare le déploiement sur votre VPS OVH.

## Configuration requise

### Variables d'environnement pour les tests
Les workflows utilisent ces variables d'environnement pour les tests :
- `DATABASE_URL` : URL de connexion PostgreSQL
- `REDIS_URL` : URL de connexion Redis
- `JWT_SECRET` : Clé secrète JWT
- `AWS_*` : Variables AWS pour S3

### Secrets GitHub pour le déploiement
Quand vous configurerez votre VPS, ajoutez ces secrets dans les paramètres GitHub :
- `VPS_HOST` : Adresse IP de votre VPS
- `VPS_USERNAME` : Nom d'utilisateur SSH
- `VPS_SSH_KEY` : Clé SSH privée
- `VPS_PORT` : Port SSH (généralement 22)

## Configuration du VPS OVH

### 1. Prérequis sur le VPS
```bash
# Installation de Docker et Docker Compose
sudo apt update
sudo apt install docker.io docker-compose

# Installation de Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Installation de Git
sudo apt install git
```

### 2. Configuration du projet
```bash
# Cloner le repository
git clone https://github.com/votre-username/motismo.git
cd motismo

# Créer les fichiers de configuration
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Configurer les variables d'environnement
nano backend/.env
nano frontend/.env
```

### 3. Configuration Docker (optionnel)
Si vous voulez utiliser Docker pour le déploiement, créez un `docker-compose.yml` à la racine :

```yaml
version: '3.8'
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: motismo
      POSTGRES_USER: motismo
      POSTGRES_PASSWORD: votre_mot_de_passe
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  backend:
    build: ./backend
    ports:
      - "3001:3001"
    environment:
      - DATABASE_URL=postgresql://motismo:votre_mot_de_passe@postgres:5432/motismo
      - REDIS_URL=redis://redis:6379
    depends_on:
      - postgres
      - redis

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    depends_on:
      - backend

volumes:
  postgres_data:
```

### 4. Configuration Nginx (recommandé)
```bash
# Installation de Nginx
sudo apt install nginx

# Configuration du site
sudo nano /etc/nginx/sites-available/motismo
```

Contenu du fichier de configuration Nginx :
```nginx
server {
    listen 80;
    server_name votre-domaine.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Activer le site
sudo ln -s /etc/nginx/sites-available/motismo /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 5. Configuration SSL avec Let's Encrypt
```bash
# Installation de Certbot
sudo apt install certbot python3-certbot-nginx

# Obtention du certificat SSL
sudo certbot --nginx -d votre-domaine.com

# Renouvellement automatique
sudo crontab -e
# Ajouter cette ligne :
# 0 12 * * * /usr/bin/certbot renew --quiet
```

## Activation des workflows

1. Poussez ces fichiers dans votre repository GitHub
2. Allez dans l'onglet "Actions" de votre repository
3. Les workflows se déclencheront automatiquement sur les push et pull requests

## Monitoring

- **GitHub Actions** : Surveillez l'onglet Actions pour voir l'état des workflows
- **Logs d'application** : `docker-compose logs -f` ou `pm2 logs`
- **Monitoring système** : Utilisez des outils comme htop, netstat, etc.

## Dépannage

### Problèmes courants
1. **Tests qui échouent** : Vérifiez les variables d'environnement et les dépendances
2. **Déploiement échoué** : Vérifiez les secrets GitHub et la connectivité SSH
3. **Services qui ne démarrent pas** : Vérifiez les logs Docker et les ports

### Commandes utiles
```bash
# Vérifier l'état des services
docker-compose ps

# Voir les logs
docker-compose logs backend
docker-compose logs frontend

# Redémarrer les services
docker-compose restart

# Nettoyer Docker
docker system prune -f
``` 