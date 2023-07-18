/* versione 1.0.5 del progetto AAA */
const express = require("express");
require("dotenv").config();
const oauthServer = require("./oauth2/oauth2config");
const userActivityLogger = require("./utilities/midleware/userActivityLogger"); //midleware per loggare le attività degli utenti

const loadUserFromToken = require("./utilities/midleware/loadUserFromToken"); //midleware per recupereare i dati dell'utente dal token
const limiter = require("./utilities/midleware/limiter"); //midleware di sicurezza per contenere attacchi di tipo DDOS
const checkResourceAccess = require("./utilities/midleware/checkResourceAccess"); //midleware per controllare se l'utente ha i permessi per accedere alla risorsa
const checkUserRole = require("./utilities/midleware/checkUserRole"); //midleware per controllare se l'utente ha il ruolo richiesto
//Importo le rotte
const addAccount = require("./routes/addaccounts"); // importa la rotta per aggiungere un account
const modifyAccount = require("./routes/modifyaccount"); // importa la rotta per modificare un account
const getUser = require("./routes/getuser"); // importa la rotta per ottenere i dati di un utente
const changeUserActiveStatus = require("./routes/changeuseractivestatus"); // importa la rotta per cambiare lo stato di attivazione di un utente
const getAllUsers = require("./routes/getallusers"); // importa la rotta per ottenere tutti gli utenti
const identifyAccount = require("./routes/loginroutes"); // importa la rotta per effettuare il login
const deleteAccount = require("./routes/deleteaccount"); // importa la rotta per cancellare un account
const getRoles = require("./routes/getallroles"); // logica per l'endpoint /AAA/v1/Roles
const cors = require("cors");
const app = express();

// Configurazione dei middleware per l'applicazione Express
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true })); // Aggiungi questa linea;
app.oauth = oauthServer;
app.use(loadUserFromToken);

// Rotta POST per aggiungere un account
//Accessibile solo da un amministratore
app.post(
  "/AAA/v1/Authenticate/Account/Add",
  app.oauth.authenticate(),
  checkUserRole("admin", "rootAdmin"),
  userActivityLogger,
  addAccount //logica della rotta
);

// Rotta PATCH per modificare un account
app.patch(
  "/AAA/v1/Authenticate/Account/:id",
  app.oauth.authenticate(),
  checkUserRole("admin", "rootAdmin"),
  userActivityLogger,
  modifyAccount //logica della rotta
);

//Rotta per ottenere la lista dei ruoli, risorse e permessi
app.get(
  "/AAA/v1/Roles",
  app.oauth.authenticate(),
  /*   checkResourceAccess("ModifyAccount"), */
  getRoles //logica della rotta
);

// Rotta DELETE per cancellare un account.
//Solo un utente con ruolo di amministratore può accedere a questa rotta.
app.delete(
  "/AAA/v1/Authenticate/Account/:id",
  app.oauth.authenticate(),
  checkUserRole("admin", "rootAdmin"),
  userActivityLogger,
  deleteAccount(app)
);

// Rotta POST per effettuare il login
app.post(
  "/AAA/v1/Authenticate/Account/Identify",
  limiter,
  identifyAccount(app, limiter)
);

// Rotta GET per ottenere l'id dell'utente
// essenziale per l'ottenimento dei dati personali nel frontend
app.get(
  "/AAA/v1/Authenticate/Identify/id",
  app.oauth.authenticate(),
  /*   checkResourceAccess("AccessPlatform"), */
  userActivityLogger,
  (req, res) => {
    res.json({
      id: req.user.id,
    });
  }
);

// Rotta PUT per cambiare lo stato di attivazione di un utente,
//solo un amministratore può accedere a questa rotta.
app.put(
  "/AAA/v1/Authorize/:id",
  app.oauth.authenticate(),
  checkUserRole("admin", "rootAdmin"),
  userActivityLogger,
  changeUserActiveStatus //logica della rotta
);

// Rotta GET per ottenere una lista di tutti gli utenti. Solo un utente con ruolo di amministratore può accedere a questa rotta.
app.get(
  "/AAA/v1/Users",
  app.oauth.authenticate(),
  checkUserRole("admin", "rootAdmin"),
  /* checkResourceAccess("UsersPage"), */
  getAllUsers
);

// Rotta GET per ottenere i dati di un utente specifico in base al suo ID.
// Solo un utente con ruolo di amministratore può accedere a questa rotta
app.get(
  "/AAA/v1/Users/:id",
  app.oauth.authenticate(),
  /*   checkResourceAccess("AccessPlatform"), */
  userActivityLogger,
  getUser //logica della rotta
);

const port = process.env.SERVER_PORT || 3000;

app.listen(port, () => console.log(`Server started on port ${port}`));
