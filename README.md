# 🛵 RiderDash — Next.js + Supabase

Pannello di controllo per rider: traccia giornate, guadagni e statistiche.  
Stack: **Next.js 14** · **Supabase (PostgreSQL)** · **JWT session** · **Chart.js**

---

## 1 — Setup Supabase

### 1a. Crea il progetto
1. Vai su [supabase.com](https://supabase.com) → **New Project**
2. Scegli un nome (es. `riderdash`) e una password per il DB
3. Seleziona la region più vicina (es. `eu-central-1`)

### 1b. Crea il database
1. Nel progetto Supabase → **SQL Editor** → **New Query**
2. Incolla il contenuto di **`supabase-schema.sql`** (è nella root del progetto)
3. Clicca **Run** — crea le tabelle `riders`, `giornate`, `guadagni`

### 1c. Copia le credenziali
Vai su **Settings → API** e copia:

| Variabile | Dove trovarla |
|-----------|--------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `anon` `public` key |
| `SUPABASE_SERVICE_ROLE_KEY` | `service_role` key (⚠️ tenila segreta) |

---

## 2 — Setup locale (sviluppo)

```bash
# Clona / estrai il progetto
cd riderdash-next

# Installa dipendenze
npm install

# Crea il file .env.local
cp .env.local.example .env.local
# → apri .env.local e incolla le tue credenziali Supabase
# → genera JWT_SECRET con: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Avvia in sviluppo
npm run dev
# → apri http://localhost:3000
```

### Contenuto `.env.local`
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
JWT_SECRET=la-tua-stringa-random-lunga
```

---

## 3 — Deploy su Vercel

### 3a. Carica il progetto
**Opzione A — GitHub (consigliata):**
1. Crea un repo su GitHub e fai push del progetto
2. Vai su [vercel.com](https://vercel.com) → **New Project** → importa il repo
3. Vercel rileva automaticamente Next.js

**Opzione B — Vercel CLI:**
```bash
npm i -g vercel
vercel
# segui le istruzioni
```

### 3b. Aggiungi le variabili d'ambiente su Vercel
In Vercel → **Settings → Environment Variables** aggiungi:

```
NEXT_PUBLIC_SUPABASE_URL        = https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY   = eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY       = eyJhbGc...
JWT_SECRET                      = la-tua-stringa-random-lunga
```

> ⚠️ `SUPABASE_SERVICE_ROLE_KEY` e `JWT_SECRET` non devono mai essere pubbliche

### 3c. Deploy
Clicca **Deploy** — Vercel builderà e pubblicherà il sito.  
Ogni push su `main` triggererà un nuovo deploy automatico.

---

## 4 — Struttura del progetto

```
riderdash-next/
├── app/
│   ├── layout.js               # Root layout + font
│   ├── globals.css             # Design system completo
│   ├── page.js                 # Redirect login/dashboard
│   ├── login/                  # Pagina login
│   ├── registrazione/          # Pagina registrazione
│   ├── dashboard/
│   │   ├── layout.js           # Layout con nav (protetto)
│   │   ├── page.js             # Home / menu
│   │   ├── giornate/
│   │   │   ├── page.js                    # Seleziona anno/mese
│   │   │   ├── [anno]/[mese]/page.js      # Visualizza giornate
│   │   │   ├── inserisci/page.js          # Inserisci giornata
│   │   │   └── modifica/[id]/page.js      # Modifica/elimina
│   │   ├── guadagni/page.js    # Guadagni con progress bar
│   │   └── grafici/page.js     # Grafici Chart.js
│   └── api/
│       ├── auth/login/         # POST login
│       ├── auth/logout/        # POST logout
│       ├── auth/register/      # POST registrazione
│       ├── giornate/           # GET lista, POST crea
│       ├── giornate/[id]/      # GET, PUT, DELETE singola
│       ├── guadagni/           # GET lista anni, POST crea mese
│       ├── grafici/mensile/    # GET dati mensili per anno
│       └── grafici/annuale/    # GET totali per anno
├── components/
│   ├── DashNav.js              # Navbar condivisa
│   └── DashNav.module.css
├── lib/
│   ├── supabase.js             # Client admin + client browser
│   ├── session.js              # JWT create/verify/get
│   └── calcoli.js              # Tasse, bonifico, aggregati
├── middleware.js               # Protezione route autenticate
├── supabase-schema.sql         # Schema DB da eseguire su Supabase
└── .env.local.example          # Template variabili d'ambiente
```

---

## 5 — Calcoli (invariati dal PHP originale)

| Campo | Formula |
|-------|---------|
| **Totale** | ordini_consegnati + incentivi + mance |
| **Tasse** | (consegnati × 20%) + (incentivi × 20%) + (mance × 20%) + 2 € |
| **Bonifico** | Totale − Tasse − Contanti |

---

## 6 — Funzionalità

- 🔐 Login / Registrazione con **username + password** (bcrypt)
- 📅 **Inserisci giornata** con live preview totale/tasse/bonifico
- 📋 **Visualizza giornate** — card mobile + tabella desktop, footer tasse/bonifico
- ✏️ **Modifica/Elimina** giornata con modal di conferma
- 💰 **Guadagni** — KPI annuali, progress bar soglia 5000 €, dettaglio per mese
- 📈 **Grafici** — lineare per mese (fatturato, bonifico, ordini) + per anno
- 🔒 **Middleware** — tutte le route `/dashboard` e `/api/*` sono protette
