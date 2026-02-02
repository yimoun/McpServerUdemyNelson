# API Philips Hue - Guide Rapide

## 1. Découverte du pont

### Trouver l'IP du pont
```bash
curl https://discovery.meethue.com
```
Retourne : `[{"id":"ID_du_pont","internalipaddress":"IP_du_pont"}]`

### Interface de debug
Accéder à : `http://IP_du_pont/debug/clip.html`

## 2. Authentification

### Créer un jeton utilisateur
1. Appuyer sur le bouton du pont
2. Exécuter dans les 30 secondes :

```bash
# Linux/Mac
curl -X POST -d '{"devicetype":"my_app#device_name"}' IP_du_pont/api

# Windows
curl -X POST -d {\"devicetype\":\"my_app#device_name\"} IP_du_pont/api
```

Réponse : `[{"success":{"username":"votre_jeton"}}]`

### Lister les jetons existants
```bash
curl -X GET IP_du_pont/api/votre_jeton/config
```

### Supprimer un jeton
```bash
curl -X DELETE IP_du_pont/api/votre_jeton/config/whitelist/jeton_a_supprimer
```

## 3. Gestion des ampoules

### Lister toutes les ampoules
```bash
curl -X GET IP_du_pont/api/votre_jeton/lights
```

### Allumer une ampoule
```bash
curl -X PUT -d '{"on":true}' IP_du_pont/api/votre_jeton/lights/ID_LAMPE/state
```

### Éteindre une ampoule
```bash
curl -X PUT -d '{"on":false}' IP_du_pont/api/votre_jeton/lights/ID_LAMPE/state
```

## 4. URLs de référence

- Configuration pont : `/api/config`
- Liste ampoules : `/api/username/lights`
- État ampoule : `/api/username/lights/ID/state`
- Gestion jetons : `/api/username/config/whitelist`

*Note : [IMAGE] Ajouter des captures d'écran de l'interface debug et des réponses JSON*

## Documentation officielle
Consulter la documentation complète sur le site de Signify pour les fonctionnalités avancées (couleurs, groupes, scènes, etc.).
