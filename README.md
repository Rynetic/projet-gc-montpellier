# Projet GC Tech - Activity search engine near Montpellier/Moteur de recherche d'activités à Montpellier

Ce projet est un moteur de recherche développé dans le cadre d'un test technique pour une alternance chez GCTech. Il permet de rechercher et de filtrer des activités autour de Montpellier, et d'afficher les résultats sur une carte interactive.

## Fonctionnalités

*   Recherche d'activités par mot-clé.
*   Filtrage des activités par catégories (Culture & Musées, Sports & Loisirs, Nature & Plein air, Activités Aquatiques).
*   Affichage des activités sur une carte interactive.
*   Sélection d'une activité pour afficher ses détails.

## Technologies utilisées

*   **Frontend:** Nuxt.js (Vue.js), Tailwind CSS
*   **Backend:** Node.js, Express
*   **Base de données:** MongoDB
*   **Cartographie:** Leaflet
*   **API:** Google Places

## Installation

### Prérequis

*   Node.js
*   MongoDB
*   Clé API Google Places

### Étapes

1. **Clonez le dépôt :**

    ```bash
    git clone https://github.com/Rynetic/projet-gc-montpellier.git
    cd projetGC
    ```

2. **Installez les dépendances du backend :**

    ```bash
    cd backend
    npm install
    ```

3. **Installez les dépendances du frontend :**

    ```bash
    cd ../frontend
    npm install
    ```

4. **Lancez le script de scraping pour remplir la base de données**
    
    ```bash
    cd ../backend
    npm run scrape
    npm run check
    ```

5. **Démarrez le backend :**

    ```bash
    npm run dev
    ```

6. **Démarrez le frontend :**

    ```bash
    npm run dev
    ```

7. **Accédez à l'application dans votre navigateur :**

    ```
    http://localhost:3000
    ```

