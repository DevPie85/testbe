// la funzione checkUserRole ora accetta un numero indefinito di argomenti
function checkUserRole(...roles) {
  return function (req, res, next) {
    if (req.user && req.user.role) {
      // verifica se l'utente ha almeno uno dei ruoli richiesti
      const hasRole = req.user.role.some((userRole) =>
        roles.includes(userRole.title)
      );

      if (hasRole) {
        next();
      } else {
        res.status(403).json({ error: "Accesso negato" });
      }
    } else {
      res.status(401).json({ error: "Autenticazione richiesta" });
    }
  };
}

module.exports = checkUserRole;
