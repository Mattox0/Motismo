# 🎯 Motismo - Application de Quiz Interactif

**Motismo** est une application web moderne de création et de participation à des quiz interactifs en temps réel. Conçue pour les enseignants, formateurs et amis, elle permet de créer, partager et jouer à des quiz de manière intuitive et engageante.

## ✨ Fonctionnalités

### 🎮Quizz interactifs en temps réel
- Participation simultanée de plusieurs joueurs
- Affichage des résultats en temps réel
- Système de classement dynamique
- WebSockets pour une expérience fluide

### 📝 Création de Quiz Intuitive
- Interface simple et moderne
- Différents types de questions (QCM, association, nuage de mots)
- Personnalisation du design

### 📊 Analyses Détaillées
- Statistiques complètes sur les performances
- Résultats détaillés par participant
- Export des données
- Tableaux de bord interactifs

### 🌍 Internationalisation
- Support multilingue (Français/Anglais)
- Interface adaptée selon la langue de l'utilisateur
- Messages d'erreur localisés

### 🔐 Authentification Sécurisée
- Système d'authentification JWT
- Gestion des rôles (Admin/Utilisateur)
- Protection des routes sensibles
- Connexion sociale (Google)

## 🏗️ Architecture

### Backend (NestJS)
- **Framework**: NestJS avec TypeScript
- **Base de données**: PostgreSQL avec TypeORM
- **Stockage**: AWS S3 / MinIO en local pour les fichiers
- **WebSockets**: Socket.io pour le temps réel
- **Documentation**: Swagger
- **Monitoring**: Sentry pour le suivi d'erreurs

### Frontend (Next.js)
- **Framework**: Next.js
- **Styling**: Tailwind CSS + SCSS
- **État**: Redux Toolkit
- **Formulaires**: React Hook Form + Zod
- **Animations**: Framer Motion
- **Tests**: Jest + Testing Library
- **Monitoring**: Sentry

## 🚀 Installation

### Prérequis
- **Node.js** >= 20.0.0
- **npm** >= 10.0.0
- **PostgreSQL** >= 12.3
- **Redis** >= 7.0
- **Docker** (optionnel, pour le développement)

### 1. Cloner le Repository
```bash
git clone https://github.com/Mattox0/Motismo.git
cd Motismo
```

### 2. Configuration Backend

```bash
cd backend

# Installer les dépendances
npm install

# Copier le fichier d'environnement
cp .env.example .env

# Configurer les variables d'environnement
vim .env
```

### 3. Configuration Frontend

```bash
cd ../frontend

# Installer les dépendances
npm install

# Copier le fichier d'environnement
cp .env.example .env

# Configurer les variables d'environnement
vim .env
```

### 4. Base de Données

#### Option A : Docker (Recommandé pour le développement)
```bash
cd backend
docker-compose up -d
```

### 5. Démarrage

#### Backend
```bash
cd backend

# Mode développement
npm run start:dev

# Mode production
npm run build
npm run start:prod
```

#### Frontend
```bash
cd frontend

# Mode développement
npm run dev

# Mode production
npm run build
npm run start
```

## 🧪 Tests

### Backend
```bash
cd backend

# Tests unitaires
npm run test

# Tests avec couverture
npm run test:cov
```

### Frontend
```bash
cd frontend

# Tests unitaires
npm run test

# Tests avec couverture
npm run test:coverage
```

### Démarrage
```bash
docker-compose up -d
```

## 🔧 Scripts Utiles

## 📄 Licence

Ce projet est sous licence MIT.

## 📞 Support

- **Email** : support@motismo.com

---

**Motismo** - Transformez vos connaissances en expériences interactives ! 🎯
