import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '0.18.1:3',
  releaseNotes: {
    en_US:
      'Merges the upstream Excalidraw v0.18.1 security patch release into the StartOS fork while preserving the server-scenes API and in-app save/open integration. This includes the Mermaid XSS mitigation for CVE-2025-54881 / GHSA-7rqq-prvp-x9jh via @excalidraw/mermaid-to-excalidraw 2.2.2 and keeps the static nginx web build plus Scenes API sidecar package wiring unchanged.',
    es_ES:
      'Fusiona la versión de seguridad upstream Excalidraw v0.18.1 en el fork de StartOS conservando la API de escenas del servidor y la integración de guardar/abrir desde la app. Incluye la mitigación Mermaid XSS para CVE-2025-54881 / GHSA-7rqq-prvp-x9jh mediante @excalidraw/mermaid-to-excalidraw 2.2.2 y mantiene sin cambios el empaquetado de nginx estático y la API de escenas.',
    de_DE:
      'Führt den Upstream-Sicherheitsrelease Excalidraw v0.18.1 in den StartOS-Fork ein und erhält die Server-Szenen-API sowie die Speichern/Öffnen-Integration in der App. Enthält die Mermaid-XSS-Abhilfe für CVE-2025-54881 / GHSA-7rqq-prvp-x9jh über @excalidraw/mermaid-to-excalidraw 2.2.2 und lässt die statische nginx-Web-App samt Szenen-API-Sidecar unverändert.',
    pl_PL:
      'Scala upstreamowe wydanie bezpieczeństwa Excalidraw v0.18.1 z forkiem StartOS, zachowując API scen serwera oraz integrację zapisu/otwierania w aplikacji. Obejmuje mitigację Mermaid XSS dla CVE-2025-54881 / GHSA-7rqq-prvp-x9jh przez @excalidraw/mermaid-to-excalidraw 2.2.2 i pozostawia bez zmian statyczny nginx oraz sidecar Scenes API.',
    fr_FR:
      "Fusionne la version de sécurité upstream Excalidraw v0.18.1 dans le fork StartOS tout en conservant l'API de scènes serveur et l'intégration d'enregistrement/ouverture dans l'app. Inclut l'atténuation Mermaid XSS pour CVE-2025-54881 / GHSA-7rqq-prvp-x9jh via @excalidraw/mermaid-to-excalidraw 2.2.2 et garde inchangé le paquet nginx statique avec le sidecar Scenes API.",
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
