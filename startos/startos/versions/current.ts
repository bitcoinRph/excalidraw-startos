import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '0.18.1:1',
  releaseNotes: {
    en_US:
      'Restores the scenes API on the 0.18.1 package line and adds a separate StartOS API interface for CLI use: save, list, fetch, and delete .excalidraw files server-side using the Scenes API address, plus in-app "Save to server" and "Open from server" via the command palette. See the Show API Token action for credentials.',
    es_ES:
      'Restaura la API de escenas en la línea de paquete 0.18.1 y añade una interfaz API de StartOS separada para uso por CLI: guarda, lista, obtiene y elimina archivos .excalidraw en el servidor usando la dirección de Scenes API, además de "Guardar en el servidor" y "Abrir desde el servidor" en la aplicación. Consulta la acción "Show API Token" para las credenciales.',
    de_DE:
      'Stellt die Szenen-API in der Paketlinie 0.18.1 wieder her und fügt eine separate StartOS-API-Schnittstelle für die CLI-Nutzung hinzu: Speichern, Auflisten, Abrufen und Löschen von .excalidraw-Dateien serverseitig über die Scenes-API-Adresse, plus "Auf Server speichern" und "Vom Server öffnen" in der App. Zugangsdaten über die Aktion "Show API Token".',
    pl_PL:
      'Przywraca API scen w linii pakietu 0.18.1 i dodaje osobny interfejs API StartOS do użytku z CLI: zapisywanie, listowanie, pobieranie i usuwanie plików .excalidraw po stronie serwera przy użyciu adresu Scenes API, a także "Zapisz na serwerze" i "Otwórz z serwera" w aplikacji. Dane dostępowe w akcji "Show API Token".',
    fr_FR:
      "Restaure l'API de scènes sur la ligne de paquet 0.18.1 et ajoute une interface API StartOS séparée pour l'usage CLI : enregistrer, lister, récupérer et supprimer des fichiers .excalidraw côté serveur via l'adresse Scenes API, plus « Enregistrer sur le serveur » et « Ouvrir depuis le serveur » dans l'application. Voir l'action « Show API Token » pour les identifiants.",
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
