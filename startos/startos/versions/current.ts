import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '0.18.0:2',
  releaseNotes: {
    en_US:
      'Adds a scenes API for CLI use: save, list, fetch, and delete .excalidraw files server-side at the /api path of the Web UI address, plus in-app "Save to server" and "Open from server" via the command palette. See the Show API Token action for credentials.',
    es_ES:
      'Añade una API de escenas para uso por CLI: guarda, lista, obtiene y elimina archivos .excalidraw en el servidor en la ruta /api de la dirección de la interfaz web, además de "Guardar en el servidor" y "Abrir desde el servidor" en la aplicación. Consulta la acción "Show API Token" para las credenciales.',
    de_DE:
      'Fügt eine Szenen-API für die CLI-Nutzung hinzu: Speichern, Auflisten, Abrufen und Löschen von .excalidraw-Dateien serverseitig unter dem /api-Pfad der Web-UI-Adresse, plus "Auf Server speichern" und "Vom Server öffnen" in der App. Zugangsdaten über die Aktion "Show API Token".',
    pl_PL:
      'Dodaje API scen do użytku z CLI: zapisywanie, listowanie, pobieranie i usuwanie plików .excalidraw po stronie serwera pod ścieżką /api adresu interfejsu web, a także "Zapisz na serwerze" i "Otwórz z serwera" w aplikacji. Dane dostępowe w akcji "Show API Token".',
    fr_FR:
      "Ajoute une API de scènes pour usage CLI : enregistrer, lister, récupérer et supprimer des fichiers .excalidraw côté serveur via le chemin /api de l'adresse de l'interface web, plus « Enregistrer sur le serveur » et « Ouvrir depuis le serveur » dans l'application. Voir l'action « Show API Token » pour les identifiants.",
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
