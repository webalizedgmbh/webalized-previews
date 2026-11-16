# Webalized Previews

Alle Website-Vorschläge (Pitch-Seiten, Coming-Soon-Entwürfe) in einem Repo → **https://preview.webalized.ch/<slug>-<code>/**

```
webalized-previews/
├── index.html        neutrale Startseite (listet KEINE Kunden)
├── robots.txt        Disallow: /  (nicht in Google)
├── .htaccess         noindex-Header, keine Ordner-Listings
├── in-movimento-zfc6glbl/     4 Redesign-Vorschläge (aus inmovimento-design migriert)
├── r-coor-as1k5k47/           Coming-Soon (aus rcoor-coming-soon migriert, Bilder web-optimiert)
├── ideal-moebel-dzjt6y8z/     4 Designvorschläge + Präsentation (aus ideal-moebel-designs migriert)
└── <slug>-<code>/    neue Pitch-Seiten (geheimer Ordnername, vom CRM vergeben) — die Pitch-Phase kopiert sie hierher
```

## Regeln
- Ein Ordner pro Kunde, Name = `<slug>-<8-stelliger Code>` (geheimer Link, vom CRM vergeben; steht in `clients/<slug>/crm.md`). Nie Ordner ohne Code anlegen.
- Jede Seite hat `<meta name="robots" content="noindex, nofollow">`.
- Nur relative Pfade (Seiten laufen in einem Unterordner).
- Optionaler Passwortschutz pro Ordner: Plesk → Website → „Passwortgeschützte Verzeichnisse“.
- Quelle der Pitch-Seiten bleibt im Studio (`clients/<slug>/1-pitch/pitch-page/`); hier liegt die veröffentlichte Kopie.

## Deploy
Plesk/Hosttech: Subdomain `preview.webalized.ch` → Git-Deploy aus diesem Repo (Branch `main`), Dokumentstamm = Repo-Wurzel.
