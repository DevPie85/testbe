# Documentazione Tecnica ABC-DATA-COLLECTOR backend WSS Security

- implementata la rotta per ottenere i dati relativi ai ruoli

## Dipendenze

- `Node: v18.16.0`

- `NPM: 9.5.1`

- `bcryptjs: ^2.4.3`

- `cors: ^2.8.5`

- `dotenv: ^16.0.3`

- `express: ^4.18.2`

- `express-oauth-server: ^2.0.0`

- `express-rate-limit: ^6.7.0`

- `mysql2: ^3.3.1`

- `sequelize: ^6.31.1`

# Ambiente di Sviluppo

Di seguito sono riportate le informazioni riguardo all'ambiente di sviluppo utilizzato:

## IDE

- **Visual Studio Code**
  - Versione: 1.78.2

## Runtime JavaScript

- **Node.js**
  - Versione: v18.16.0

## Gestore dei Pacchetti

- **NPM**
  - Versione: 9.5.1

## Database

- **MySQL Workbench**
  - Versione: 8.0

# Prima configurazione per l'avvio del server

Recersi nel file .env ed effettuare la configurazione:

## Porta del server

`SERVER_PORT`: Questa variabile specifica la porta su cui il server sarà in ascolto. Il valore predefinito è `3000`.

## Configurazione del database

`CLIENT_ID`: Questo è l'ID del client necessario per una corretta comunicazione con il client. Sostituisci `your_client_id` con il tuo ID client effettivo.

`CLIENT_SECRET`: Questo è il segreto del client necessario per una corretta comunicazione con il client. Sostituisci `your_client_secret` con il tuo segreto client effettivo.

`DB_NAME`: Questa è la variabile per il nome del database. In questo caso, il valore predefinito è `nuovo_02`.

`DB_USER`: Questa è la variabile per il nome utente del database. Il valore predefinito è `root`.

`DB_PASSWORD`: Questa è la variabile per la password del database. Il valore predefinito è `admin`.

`DB_HOST`: Questa è la variabile per l'host del database. Il valore predefinito è `localhost`.

`DB_PORT`: Questa è la variabile per la porta del database. Il valore predefinito è `3307`.

## Admin di default

`DEFAULT_ADMIN_EMAIL`: Questa è la variabile per l'email dell'admin di default. Il valore predefinito è `admin@admin.com`.

`DEFAULT_ADMIN_PASSWORD`: Questa è la variabile per la password dell'admin di default. Il valore predefinito è `Administrator1!`. Nota: la password deve avere almeno 8 caratteri, una lettera maiuscola, una minuscola, un numero e un carattere speciale.

## Dati del rootAdmin

`DEFAULT_ADMIN_MATRICOLA`: Questa è la variabile per la matricola dell'admin di default. Il valore predefinito è `matr-admin`.

`DEFAULT_ADMIN_NOME`: Questa è la variabile per il nome dell'admin di default. Il valore predefinito è `amministratore`.

`DEFAULT_ADMIN_COGNOME`: Questa è la variabile per il cognome dell'admin di default. Il valore predefinito è `super admin`.

`DEFAULT_ADMIN_NOTE`: Questa è la variabile per le note relative all'admin di default. Il valore predefinito è `Amministratore di default creato al momento della prima esecuzione del server.`.

### Nota importante

Il rootAdmin non può essere cancellato o modificato. Non è possibile creare più di un solo rootAdmin. Una volta eseguita la configurazione si suggerisce di rimuovere i dati sensibili dal file .env

## Endpoints

# Endpoint: Aggiungi Account

## Endpoint

```
POST /AAA/v1/Authenticate/Account/Add
```

Questo endpoint è progettato per creare un nuovo account.

### Autenticazione

Per accedere a questo endpoint è necessario essere autenticati. Viene utilizzata l'autenticazione OAuth.

### Controllo Accesso Risorsa

L'accesso a questa risorsa è controllato tramite la funzione `checkResourceAccess("AddAccount")`. Questa funzione verifica che l'utente abbia il rulo appropriato, la risorsa ed il permesso abilitato per potervi accedere.

## Logica della Rotta

La logica di questo endpoint è gestita dal modulo `addAccount`.

### Modulo: addAccount

Il modulo `addAccount` si occupa di:

1. Validare i campi della richiesta: Verifica che tutti i campi richiesti siano presenti nel corpo della richiesta.

2. Verificare l'unicità dell'email e della matricola: Controlla che l'email e la matricola fornite non siano già in uso.

3. Creare un nuovo account: Genera un hash della password e crea un nuovo account con le informazioni fornite.

4. Associare un ruolo all'account..

5. Creare un nuovo lavoratore e associarlo all'account: Viene creato un nuovo record nel database AnagrafeLavoratore.

6. Creare i permessi associati alle risorse del ruolo: Per ogni risorsa associata al ruolo, viene creato un record nel database Permission.

## Richiesta

### Header

Il token di autenticazione deve essere incluso nell'header della richiesta come segue:

```
Authorization: Bearer <your_token_here>
```

### Body

Il corpo della richiesta deve avere il seguente formato:

```json
{
  "email": "esempio@esempio.com",
  "password": "esempioPassword6561@",
  "confirmPassword": "esempioPassword6561@",
  "role": "admin",
  "nome": "Mario",
  "cognome": "Rossi",
  "matricola": "123456d32",
  "note": "Alcune note",
  "active": true,
  "resources": [
    { "id": 1, "active": 0 },
    { "id": 2, "active": 1 },
    { "id": 3, "active": 0 }
  ]
}
```

- `email`: L'indirizzo email dell'utente. Deve essere unico.
- `password` e `confirmPassword`: La password dell'utente. Deve essere identica in entrambi i campi.
- `role`: Il ruolo dell'utente. Deve esistere nel database dei ruoli.
- `nome` e `cognome`: Il nome e il cognome dell'utente.
- `matricola`: La matricola dell'utente. Deve essere unica.
- `note`: Eventuali note relative all'utente.
- `active`: Lo stato attivo dell'utente. Se true, l'utente è attivo.
- `resources`: Una lista di risorse associate all'utente. Ogni risorsa è un oggetto con un id e uno stato attivo.

Se "resources" viene impostato come array vuoto `[]`, tutte le risorse saranno impostate su `active: 1` di default.

## Risposta

Il modulo `addAccount` risponderà con un oggetto JSON che contiene le informazioni relative all'account, al ruolo e al lavoratore creati. Ad esempio:

```json
{
  "id": 1,
  "lavoratoreId": 1,
  "accountRoleId": 1
}
```

In caso di errori, sarà restituito un messaggio di errore con lo stato di errore appropriato.

# Endpoint: Modifica Account

## Endpoint

```
PATCH /AAA/v1/Authenticate/Account/:id
```

Questo endpoint è progettato per modificare un account esistente, dove `:id` rappresenta l'ID dell'account che si desidera modificare.

### Autenticazione

Per accedere a questo endpoint è necessario essere autenticati. Viene utilizzata l'autenticazione OAuth.

### Controllo per l'accesso alla risorsa

L'accesso a questa risorsa è controllato tramite la funzione `checkResourceAccess("ModifyAccount")`. Questa funzione verifica che l'utente autenticato abbia l'autorizzazione per modificare un account.

## Logica della Rotta

La logica di questo endpoint è gestita dal modulo `modifyAccount`.

### Modulo: modifyAccount

Il modulo `modifyAccount` si occupa di:

1. Verificare l'unicità dell'email e della matricola: Controlla che l'email e la matricola fornite non siano già in uso da altri account.

2. Verificare la corrispondenza delle password: Se fornite, controlla che la password e la conferma della password siano identiche.

3. Aggiornare l'account: Se fornita, la password viene hasciata e insieme agli altri dati forniti viene usata per aggiornare l'account.

4. Aggiornare il ruolo dell'account: Se il ruolo fornito è diverso da quello attuale, il ruolo dell'account viene aggiornato.

5. Aggiornare le informazioni del lavoratore: Le informazioni del lavoratore associate all'account vengono aggiornate.

6. Aggiornare i permessi associati alle risorse del ruolo: Se il ruolo è cambiato, per ogni risorsa associata al nuovo ruolo viene creato un permesso.

## Richiesta

### Header

Il token di autenticazione deve essere incluso nell'header della richiesta come segue:

```
Authorization: Bearer <your_token_here>
```

### Body

Il corpo della richiesta deve avere il seguente formato:

```json
{
  "email": "esempio@esempio.com",
  "password": "esempioPassword6561@",
  "confirmPassword": "esempioPassword6561@",
  "role": "admin",
  "nome": "Mario",
  "cognome": "Rossi",
  "matricola": "123456d32",
  "note": "Alcune note",
  "active": true,
  "resources": [
    { "id": 1, "active": 0 },
    { "id": 2, "active": 1 },
    { "id": 3, "active": 0 }
  ]
}
```

- `email`: L'indirizzo email dell'utente. Se viene modificato, deve essere unico.
- `password` e `confirmPassword`: La nuova password dell'utente. Se fornite, devono essere identiche.
- `role`: Il nuovo ruolo dell'utente. Se fornito, deve esistere nel database dei ruoli.
- `nome` e `cognome`: Il nuovo nome e cognome dell'utente.
- `matricola`: La nuova matricola dell'utente. Se modificata, deve essere unica.
- `note`: Le nuove note relative all'utente.
- `active`: Il nuovo stato attivo dell'utente.
- `resources`: Un array di oggetti rappresentanti le risorse con il relativo stato 'active'. Se viene fornito un array vuoto, tutte le risorse saranno impostate su `active: 1`.

## Risposta

Il modulo `modifyAccount` risponderà con un messaggio di successo in caso di operazione riuscita. In caso contrario, restituirà un messaggio di errore appropriato.

# Documentazione Tecnica - Endpoint: Cancella Account

## Endpoint

```
DELETE /AAA/v1/Authenticate/Account/:id
```

Questo endpoint è progettato per cancellare un account esistente, dove `:id` rappresenta l'ID dell'account che si desidera cancellare.

### Autenticazione

Per accedere a questo endpoint è necessario essere autenticati. Viene utilizzata l'autenticazione OAuth.

### Controllo Accesso Risorsa

L'accesso a questa risorsa è controllato tramite la funzione `checkResourceAccess("DeleteAccount")`. Questa funzione verifica che l'utente autenticato abbia l'autorizzazione per cancellare un account.

## Logica della Rotta

La logica di questo endpoint è gestita dal modulo `deleteAccount`.

### Modulo: deleteAccount

Il modulo `deleteAccount` si occupa di:

1. Verificare l'esistenza dell'utente: Controlla se l'account da cancellare esiste nel sistema.

2. Verificare che l'utente non sia l'unico amministratore: Se l'utente ha un ruolo di amministratore, il modulo controlla se ci sono altri amministratori. Se l'utente è l'unico amministratore, la cancellazione viene bloccata.

3. Cancellare il ruolo dell'account: Il ruolo associato all'account viene cancellato.

4. Cancellare le informazioni del lavoratore: Le informazioni del lavoratore associate all'account vengono cancellate.

5. Cancellare l'account: Infine, l'account stesso viene cancellato.

## Richiesta

### Header

Il token di autenticazione deve essere incluso nell'header della richiesta come segue:

```
Authorization: Bearer <your_token_here>
```

## Risposta

Il modulo `deleteAccount` risponderà con un messaggio di successo in caso di operazione riuscita. In caso contrario, restituirà un messaggio di errore appropriato. Ad esempio, se si tenta di cancellare l'ultimo amministratore, verrà restituito un messaggio di errore specifico.

## Route: `POST /AAA/v1/Authenticate/Account/Identify`

Questo endpoint è utilizzato per autenticare gli utenti e per ottenere un token di accesso. La logica di questo endpoint è gestita dalla funzione `identifyAccount`.

### Headers

- `Content-Type`: Questo deve essere impostato su `application/x-www-form-urlencoded` poiché il flusso di concessione del token di password OAuth 2.0 richiede che i dati vengano inviati in questo formato.

### Body

Le informazioni seguenti dovrebbero essere incluse nel corpo della richiesta:

- `username`: (obbligatorio) L'username dell'utente.
- `password`: (obbligatorio) La password dell'utente.
- `grant_type`: (obbligatorio) Questo deve essere impostato su `password`, che indica che si desidera utilizzare il flusso di concessione del token di password OAuth 2.0.
- `client_id`: (obbligatorio) your_client_id.
- `client_secret`: (obbligatorio) your_client_secret.

### Risposte

- `200 OK`: Se l'autenticazione ha successo, l'endpoint restituirà un token di accesso.
- `400 Bad Request`: Se le informazioni di autenticazione non sono valide, l'endpoint restituirà un messaggio di errore appropriato.
- `500 Internal Server Error`: Se si verifica un errore durante l'elaborazione della richiesta, l'endpoint restituirà un messaggio di errore.

### Dettagli Tecnici

La funzione `identifyAccount` accetta la richiesta e la inoltra al middleware `oauth.token()`, che gestisce l'autenticazione dell'utente e l'emissione del token di accesso.

### Esempio di richiesta

```
POST /AAA/v1/Authenticate/Account/Identify
HTTP/1.1
Content-Type: application/x-www-form-urlencoded

{
"grant_type": "password",
"username" : "yourusername@email.com",
"password" : "yourpassword254@",
"client_id" : "your_client_id",
"client_secret" : "your_client_secret"
}

```

### Esempio di risposta

```
HTTP/1.1 200 OK
Content-Type: application/json

{
  "access_token": "2YotnFZFEjr1zCsicMWpAA",
  "token_type": "Bearer",
  "expires_in": 3600,
  "refresh_token": "tGzv3JOkF0XG5Qx2TlKWIA"
}
```

## Rotta: PUT /AAA/v1/Authorize/:id

Questo endpoint è utilizzato per cambiare lo stato di attivazione di un utente. Solo un amministratore può accedere a questa rotta. La logica di questo endpoint è gestita dalla funzione `changeUserActiveStatus`.

### Headers

`Content-Type`: Questo deve essere impostato su `application/json`.

### Body

Il body della richiesta deve essere un JSON contenente i campi.

`active`: (obbligatorio) Il nuovo stato di attivazione dell'utente. Questo dovrebbe essere un valore booleano.

### Parametri URL

`id`: (obbligatorio) L'ID dell'utente da modificare.

### Risposte

`200 OK`: Se la modifica ha successo, l'endpoint restituirà l'ID dell'utente e il nuovo stato di attivazione.
`400 Bad Request`: Se le informazioni fornite non sono valide, l'endpoint restituirà un messaggio di errore appropriato.
`404 Not Found`: Se l'utente non viene trovato, l'endpoint restituirà un messaggio di errore.
`500 Internal Server Error`: Se si verifica un errore durante l'elaborazione della richiesta, l'endpoint restituirà un messaggio di errore.

### Dettagli Tecnici

La funzione `changeUserActiveStatus` accetta la richiesta, verifica se l'utente che sta tentando di effettuare la modifica ha i permessi di amministratore, verifica quindi se l'utente che si sta tentando di modificare esiste, e infine modifica lo stato di attivazione dell'utente.

### Esempio di richiesta

```http
PUT /AAA/v1/Authorize/123
HTTP/1.1
Content-Type: application/json
Authorization: Bearer access_token

{
  "active": false
}
```

### Esempio di risposta

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "id": 123,
  "active": false
}
```

# Endpoint: Lista Utenti

## Endpoint

```
GET /AAA/v1/Users
```

Questo endpoint recupera una lista di tutti gli utenti. Solo un utente con il ruolo di amministratore e che abbia attivo il permesso relativo a checkResourceAccess("ShowUserAccount"), ha il permesso di accedere a questa rotta.

## Logica della Rotta

La logica di questo endpoint è gestita dal modulo `getUsers`.

### Modulo: getUsers

Il modulo `getUsers` esegue le seguenti operazioni:

1. Estrae `limit` e `page` dai parametri della query. Se non forniti, utilizza i valori di default (`limit`=10, `page`=1).

2. Calcola l'offset in base alla pagina e al limite per l'interrogazione paginata del database.

3. Esegue una query nel database per trovare tutti gli Account, includendo le relative informazioni dell'AnagrafeLavoratore, AccountRole, Role, Resource e Permission. Le informazioni relative alle date di creazione e aggiornamento (`createdAt`, `updatedAt`) sono escluse.

4. Calcola il numero totale di Account presenti nel database.

5. Crea un oggetto di risposta che include il conteggio totale degli account, la pagina corrente, il numero totale di pagine, il numero di account per pagina e l'array degli account. Invia quindi la risposta come un oggetto JSON.

## Richiesta

### Parametri della Query

- `limit`: Il numero di utenti da visualizzare per pagina. Opzionale. Default: 10.
- `page`: La pagina di utenti da visualizzare. Opzionale. Default: 1.

## Risposta

La risposta è un oggetto JSON che include:

- `count`: Il numero totale di account nel database.
- `currentPage`: Il numero della pagina corrente.
- `totalPages`: Il numero totale di pagine.
- `accountPerPage`: Il numero di account nella pagina corrente.
- `account`: Un array di oggetti, con ciascun oggetto che rappresenta un utente e le sue relative informazioni.

Ogni oggetto `account` include:

- `id`: L'ID dell'account.
- `alias`: L'alias dell'account.
- `email`: L'email dell'account.
- `active`: Lo stato attivo dell'account.

Il campo `AnagrafeLavoratore` include:

- `id`: L'ID dell'anagrafica del lavoratore.
- `matricola`: Il numero di matricola del lavoratore.
- `nome`: Il nome del lavoratore.
- `cognome`: Il cognome del lavoratore.
- `note`: Le note associate al lavoratore.
- `accountId`: L'ID dell'account associato al lavoratore.

Il campo `AccountRoles` include:

- `id`: L'ID del ruolo dell'account.
- `roleId`: L'ID del ruolo associato.
- `accountId`: L'ID dell'account associato.

Il campo `Role` include:

- `id`: L'ID del ruolo.
- `title`: Il titolo del ruolo.

Il campo `Resource` include:

- `id`: L'ID della risorsa.
- `title`: Il titolo della risorsa.
- `description`: La descrizione della risorsa.
- `Permission`: Un oggetto che rappresenta i perm

essi associati alla risorsa.

Il campo `Permission` include:

- `id`: L'ID del permesso.
- `title`: Il titolo del permesso.
- `description`: La descrizione del permesso.

In caso di errore, la risposta sarà un oggetto JSON che contiene un campo `error` con un messaggio di errore.

### Rotta: GET /AAA/v1/Users/:id

Questo endpoint è utilizzato per ottenere i dati di un utente specifico in base al suo ID. Solo un utente con ruolo di amministratore può accedere a questa rotta. La logica di questo endpoint è gestita dalla funzione `getUser`. La risposta è analoga all'endpoint precedente.

### Headers

Nessun header specifico richiesto.

### Parametri URL

`id`: (obbligatorio) L'ID dell'utente da recuperare.

# Sistema di sicurezza: OAuthServer

L'OAuthServer è un modulo che fornisce la funzionalità di autenticazione OAuth 2.0 per le applicazioni Express.js. In questo progetto, viene utilizzato per gestire l'autenticazione e l'autorizzazione degli utenti secondo il flusso Resource Owner Password Credentials Grant.

## Resource Owner Password Credentials Grant

Nel flusso Resource Owner Password Credentials Grant di OAuth 2.0, l'utente fornisce direttamente le proprie credenziali all'applicazione. L'applicazione utilizza poi queste credenziali per ottenere un access token e un refresh token dal server OAuth.

## Modulo: OAuthServerModel

Il modulo `oauthServerModel` definisce il modello per il server OAuth secondo il flusso Resource Owner Password Credentials Grant, implementando i seguenti metodi:

1. `getAccessToken(accessToken)`: Questo metodo recupera un token di accesso dal database. Se il token esiste ed è ancora valido, ritorna un oggetto contenente il token di accesso, la sua data di scadenza, l'ID del client e l'ID dell'utente. Se il token non esiste o è scaduto, ritorna `false`.

2. `getRefreshToken(refreshToken)`: Questo metodo recupera un token di aggiornamento dal database. Se il token esiste, ritorna un oggetto contenente il token di aggiornamento, la sua data di scadenza, l'ID del client e l'ID dell'utente. Se il token non esiste, ritorna `false`.

3. `revokeToken(token)`: Questo metodo elimina un token di aggiornamento dal database e ritorna `true` se l'operazione è riuscita, `false` altrimenti.

4. `saveToken(token, client, user)`: Questo metodo salva un nuovo token di accesso e un nuovo token di aggiornamento nel database, ritornando un oggetto che contiene il token di accesso, il token di aggiornamento, le loro date di scadenza, e le informazioni del client e dell'utente.

5. `getClient(clientId, clientSecret)`: Questo metodo cerca un client nel database utilizzando l'ID del client e il segreto del client. Ritorna le informazioni del client se il client esiste, `false` altrimenti.

6. `getUser(email, password)`: Questo metodo autentica un utente nel database usando l'email e la password fornite, ritornando le informazioni dell'utente se l'autenticazione ha successo, `false` altrimenti.

## Configurazione del Modulo: OAuthServerModel

Il modulo `oauthServerModel` definisce due configurazioni importanti:

- `grants`: Questa configurazione definisce i tipi di grant supportati dal server OAuth. In questo progetto, vengono supportati i grant "password" e "refresh_token", che sono necessari per il flusso Resource Owner Password Credentials Grant.

- `requireClientAuthentication`: Questa configurazione specifica se l'autenticazione del client è richiesta per il grant "password". Nel nostro caso, è impostata su `true`, quindi è richiesta l'autenticazione del client.

## Modulo: bcrypt

Il modulo `bcrypt` viene utilizzato per confrontare la password fornita dall'utente con la password hashata nel database durante il processo di autenticazione dell'utente. Questo modulo fornisce un alto livello di sicurezza per la gestione delle password degli utenti.

# Tabella delle relazioni

Sulla base delle informazioni fornite, ecco una rappresentazione tabulare delle relazioni tra le tabelle:

| Tabella            | Relazione     | Tabella Collegata  |
| ------------------ | ------------- | ------------------ |
| Account            | belongsToMany | Role               |
|                    | hasOne        | AnagrafeLavoratore |
|                    | hasMany       | AccountRole        |
| AnagrafeLavoratore | belongsTo     | Account            |
| Role               | belongsToMany | Account            |
|                    | hasMany       | AccountRole        |
|                    | belongsToMany | Resource           |
|                    | hasMany       | Permission         |
| AccountRole        | belongsTo     | Account            |
|                    | belongsTo     | Role               |
| Permission         | belongsTo     | Role               |
|                    | belongsTo     | Resource           |
| Resource           | belongsToMany | Role               |
|                    | hasMany       | Permission         |
| RoleResource       | hasMany       | Role, Resource     |

# User Activity Logger

Il modulo `userActivityLogger` è un middleware Express che registra l'attività degli utenti all'interno dell'applicazione. Questo modulo utilizza i moduli `fs` e `path` di Node.js per scrivere i dati di log nel sistema di file, e il modello `Account` per ottenere le informazioni dell'utente.

## Funzionalità del Logger

Il logger registra le seguenti informazioni per ogni richiesta HTTP effettuata dagli utenti autenticati:

- L'ID e l'email dell'utente.
- Il timestamp della richiesta, espressa in formato locale italiano ("it-IT") e con fuso orario "Europe/Rome".
- Il metodo HTTP della richiesta (ad es. GET, POST).
- Il percorso originale della richiesta.

Queste informazioni vengono quindi convertite in una stringa JSON e scritte in un file di log denominato `userActivity.log`.

## File di Log

Il file di log `userActivity.log` viene salvato nella cartella `log` del progetto. Ogni entry del file di log rappresenta una singola richiesta HTTP e contiene una stringa JSON con le informazioni dell'attività dell'utente.

Se il file di log non può essere scritto per qualsiasi motivo (ad es. a causa di problemi di permessi), il logger stampa un messaggio di errore sulla console.

## Endpoint monitorati

Il middleware `userActivityLogger` è stato utilizzato per monitorare l'attività dei seguenti endpoint

1. **Aggiungi Account**

   - Metodo: POST
   - Endpoint: `/AAA/v1/Authenticate/Account/Add`
   - Descrizione: Questo endpoint è accessibile solo da un amministratore e consente di aggiungere un account.

2. **Modifica Account**

   - Metodo: PATCH
   - Endpoint: `/AAA/v1/Authenticate/Account/:id`
   - Descrizione: Questo endpoint permette di modificare un account.

3. **Cancella Account**

   - Metodo: DELETE
   - Endpoint: `/AAA/v1/Authenticate/Account/:id`
   - Descrizione: Questo endpoint può essere utilizzato per cancellare un account. Solo un utente con ruolo di amministratore può accedere a questa rotta.

4. **Ottieni l'ID dell'Utente**

   - Metodo: GET
   - Endpoint: `/AAA/v1/Authenticate/Identify/id`
   - Descrizione: Questo endpoint è essenziale per l'ottenimento dei dati personali nel frontend.

5. **Cambia lo Stato di Attivazione di un Utente**

   - Metodo: PUT
   - Endpoint: `/AAA/v1/Authorize/:id`
   - Descrizione: Questo endpoint permette di cambiare lo stato di attivazione di un utente, solo un amministratore può accedere a questa rotta.

6. **Ottieni i dati di un Utente**
   - Metodo: GET
   - Endpoint: `/AAA/v1/Users/:id`
   - Descrizione: Questo endpoint permette di ottenere i dati di un utente specifico in base al suo ID. Solo un utente con ruolo di amministratore può accedere a questa rotta.

Il middleware `userActivityLogger` viene utilizzato per monitorare l'attività degli utenti che utilizzano gli endpoint più sensibili.

## Gestione degli Errori

Se si verifica un errore durante la ricerca dell'utente nel database (ad es. se il database non è raggiungibile), il logger stampa un messaggio di errore sulla console e poi passa il controllo al prossimo middleware nella catena, senza interrompere l'esecuzione dell'applicazione.

# Documentazione per `sync.js`

Il file `sync.js` è un modulo JavaScript per l'inizializzazione del database dell'applicazione, incluso la creazione di ruoli predefiniti, l'aggiunta di un client e un amministratore di default, la creazione di risorse e l'assegnazione di permessi.

## Dettagli del Codice

### 1. Importazione delle dipendenze

```javascript
const sequelize = require("./db_connect").sequelize;
require("dotenv").config();
const bcrypt = require("bcryptjs");
const {
  Client,
  Account,
  AnagrafeLavoratore,
  Role,
  AccountRole,
  Resource,
  RoleResource,
  Permission,
} = require("./models");
```

Queste linee importano le dipendenze necessarie per il modulo, incluso Sequelize, bcrypt per l'hashing delle password, e vari modelli del database.

### 2. Sincronizzazione del Database

```javascript
sequelize.sync({ force: false });
```

Questa istruzione richiede a Sequelize di sincronizzare il database con i modelli. L'opzione `force: false` fa sì che tutte le tabelle siano create esclusivamente al primo avvio del server. Se nell'opzione viene passato il parametro `true`, cancellare tutte le tabelle dal database al primo riavvio del server .

### 3. Creazione dei Ruoli

```javascript
let roleAdmin = await Role.findOne({ where: { title: "admin" } });
//...
let rootAdmin = await Role.findOne({ where: { title: "rootAdmin" } });
//...
let roleUser = await Role.findOne({ where: { title: "user" } });
```

Queste linee controllano se i ruoli 'admin', 'rootAdmin', e 'user' esistono nel database. Se non esistono, vengono creati.

### 4. Creazione del Client

```javascript
let client = await Client.findOne({ where: { id: clientId } });
//...
client = await Client.create({
  /*...*/
});
```

Questa sezione cerca un client con un `clientId` specificato. Se non esiste, ne crea uno nuovo con il `clientId` e `clientSecret`.

### 5. Creazione dell'Amministratore di Default

```javascript
let defaultAdmin = await Account.findOne({
  where: { email: defaultAdminEmail },
});
//...
defaultAdmin = await Account.create({
  /*...*/
});
```

Qui, il modulo cerca un account con l'email di default dell'amministratore. Se non esiste, ne crea uno con le credenziali di default.

### 6. Creazione delle Risorse

```javascript
let adminResources = [
  {
    /*...*/
  },
];
let userResources = [
  {
    /*...*/
  },
];
```

Queste linee definiscono un array di risorse per 'admin' e 'user'. Ogni risorsa viene poi creata nel database e associata al ruolo corrispondente.

### 7. Creazione dei Permessi

```javascript
let permissionAdmin = await Permission.create({
  /*...*/
});
```

Qui, il modulo crea permessi che collegano l'account di amministratore alle risorse con il ruolo di 'rootAdmin'.

### 8. Gestione degli Errori

```javascript
.catch((error) => { console.error("Impossibile connettersi al database:", error); });
```

Questa linea gestisce eventuali errori durante l'esecuzione del modulo, catturandoli e stampando il messaggio di errore nella console.
