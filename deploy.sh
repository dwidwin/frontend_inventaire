#!/bin/bash

# Script de déploiement pour VPS
# Usage: ./deploy.sh

set -e

echo "🚀 Déploiement du Frontend Inventaire Club..."

# Couleurs pour les logs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Fonction pour afficher les messages colorés
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Vérifier si Docker est installé
if ! command -v docker &> /dev/null; then
    log_error "Docker n'est pas installé. Veuillez l'installer d'abord."
    exit 1
fi

# Vérifier si Docker Compose est installé
if ! command -v docker-compose &> /dev/null; then
    log_error "Docker Compose n'est pas installé. Veuillez l'installer d'abord."
    exit 1
fi

# Arrêter les conteneurs existants
log_info "Arrêt des conteneurs existants..."
docker-compose down || true

# Construire et démarrer les nouveaux conteneurs
log_info "Construction et démarrage des conteneurs..."
docker-compose up --build -d

# Vérifier le statut des conteneurs
log_info "Vérification du statut des conteneurs..."
docker-compose ps

# Afficher les logs
log_info "Logs du déploiement:"
docker-compose logs --tail=50

log_info "✅ Déploiement terminé !"
log_info "🌐 L'application est accessible sur http://votre-ip:80"
log_info "📊 Pour voir les logs en temps réel: docker-compose logs -f"
