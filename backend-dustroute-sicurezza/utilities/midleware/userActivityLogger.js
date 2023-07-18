const fs = require("fs");
const path = require("path");
const { Account } = require("../../models/tables"); // aggiungi il riferimento al modello Account

const userActivityLogger = (req, res, next) => {
  // Estrai i dati dell'utente da req.user
  const { id } = req.user;

  // Cerca l'email dell'utente nel database
  Account.findOne({ where: { id: id } })
    .then((user) => {
      if (user) {
        const log = {
          user: {
            id,
            email: user.email,
            //role: req.user.role,
          },
          timestamp: new Date().toLocaleString("it-IT", {
            timeZone: "Europe/Rome",
          }), // aggiornato al timestamp locale del server
          method: req.method,
          path: req.originalUrl,
        };

        // Converte l'oggetto log in una stringa JSON
        const logString = JSON.stringify(log) + "\n";

        // Specifica il percorso del file di log
        const logFilePath = path.join(__dirname, "../../log/userActivity.log");

        // Scrive la stringa del log nel file di log
        fs.appendFile(logFilePath, logString, (err) => {
          if (err) {
            console.error("Errore durante la scrittura nel file di log:", err);
          }
        });
      }

      next();
    })
    .catch((err) => {
      console.error("Errore durante la ricerca dell'utente:", err);
      next();
    });
};

module.exports = userActivityLogger;
