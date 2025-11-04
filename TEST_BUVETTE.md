# Guide de Test - Module Buvette

## 🚀 Démarrage en mode développement

### 1. Configuration

Créez un fichier `.env` à la racine du projet frontend :

```bash
cp env.example .env
```

Vérifiez que `.env` contient :
```env
VITE_API_URL=https://api-inventory.edwinbouchenna.fr
VITE_APP_NAME=Inventaire Club
```

Pour tester en local avec votre API locale, vous pouvez utiliser :
```env
VITE_API_URL=http://localhost:3000
```

### 2. Installer les dépendances (si nécessaire)

```bash
npm install
```

### 3. Démarrer le serveur de développement

```bash
npm run dev
```

Le serveur démarre généralement sur **http://localhost:3000** (ou le port indiqué dans la console).

### 4. Accéder à l'application

1. Ouvrez votre navigateur sur `http://localhost:3000`
2. Connectez-vous avec un compte **Manager** ou **Admin** (les routes buvette nécessitent ces permissions)
3. Dans le menu de navigation, vous devriez voir **"Buvette"** avec les sous-menus :
   - Produits
   - Stock  
   - Ventes

## 🧪 Tests à effectuer

### Test 1 : Produits Buvette

1. Aller sur `/buvette/products`
2. Vérifier que la liste des produits s'affiche (vide au début)
3. Cliquer sur "Ajouter un produit"
4. Créer un produit :
   - Nom : "Coca-Cola 33cl"
   - Catégorie : créer une catégorie buvette d'abord
   - Prix : "1.50"
   - Description (optionnel)

**Note** : Vous devrez d'abord créer des catégories buvette via l'API directement ou ajouter une interface pour cela.

### Test 2 : Stock Buvette

1. Aller sur `/buvette/stock`
2. Cliquer sur "Ajouter au stock"
3. Créer un stock :
   - Produit : sélectionner un produit créé
   - Emplacement : sélectionner un emplacement (partagé avec matériel)
   - Quantité : "50"
   - Quantité minimum : "10" (pour les alertes)

### Test 3 : Ventes Buvette

1. Aller sur `/buvette/sales`
2. Cliquer sur "Nouvelle vente"
3. Créer une vente :
   - Sélectionner un stock
   - Indiquer la quantité
   - Prix unitaire (optionnel, utilise le prix du produit par défaut)
   - Client : utilisateur, équipe ou nom externe

### Test 4 : Alertes Stock Bas

1. Aller sur `/buvette/stock`
2. Si un stock a une quantité ≤ quantité minimum, une alerte jaune doit s'afficher en haut
3. Le stock concerné doit être en rouge dans le tableau

## 🔍 URLs directes à tester

- **Produits** : http://localhost:3000/buvette/products
- **Stock** : http://localhost:3000/buvette/stock  
- **Ventes** : http://localhost:3000/buvette/sales

## 🐛 Dépannage

### Le serveur ne démarre pas
- Vérifiez que Node.js 18+ est installé : `node --version`
- Vérifiez les dépendances : `npm install`
- Vérifiez le port 3000 n'est pas déjà utilisé

### Les routes buvette ne s'affichent pas dans le menu
- Vérifiez que vous êtes connecté avec un compte **Manager** ou **Admin**
- Rafraîchissez la page (F5)
- Vérifiez la console du navigateur pour les erreurs

### Les données ne s'affichent pas
- Vérifiez que l'API backend est accessible
- Ouvrez la console du navigateur (F12) pour voir les erreurs réseau
- Vérifiez l'URL de l'API dans `.env`

### Erreurs CORS
- L'API doit autoriser les requêtes depuis `http://localhost:3000`
- Vérifiez la configuration CORS dans le backend

## 📝 Notes importantes

1. **Catégories Buvette** : Les catégories buvette sont séparées des catégories matériel. Vous devrez créer des catégories via l'API `/buvette/categories` d'abord.

2. **Emplacements** : Les emplacements sont **partagés** entre buvette et matériel. Utilisez les mêmes que pour le matériel.

3. **Permissions** : Seuls les Managers et Admins peuvent accéder au module Buvette.

4. **Frontend basique** : Les vues créées sont des versions de base. Vous devrez peut-être ajouter :
   - Modals pour créer/modifier des produits
   - Modals pour ajuster le stock
   - Formulaire complet pour créer une vente
   - Gestion des catégories buvette dans l'interface

## 🚀 Prochaines étapes

1. Créer des modals complets pour créer/modifier les entités
2. Ajouter une interface pour gérer les catégories buvette
3. Améliorer l'interface de création de vente avec sélection de produits
4. Ajouter des statistiques (revenus, produits les plus vendus, etc.)



