const { Account, AccessToken, Role, Resource } = require("../../models/tables");

function loadUserFromToken(req, res, next) {
  if (req.headers.authorization) {
    const token = req.headers.authorization.split(" ")[1];

    AccessToken.findOne({ where: { token: token } })
      .then((accessToken) => {
        if (accessToken) {
          Account.findOne({
            where: { id: accessToken.userId },
            include: [
              {
                model: Role,
                include: [
                  {
                    model: Resource,
                    through: {
                      attributes: [],
                    },
                    attributes: ["uri"],
                  },
                ],
              },
            ],
          })
            .then((user) => {
              if (user) {
                const roles = user.Roles.map((role) => ({
                  id: role.id,
                  title: role.title,
                  description: role.description,
                  resources: role.Resources.map((resource) => resource.uri),
                }));

                req.user = {
                  ...req.user,
                  id: user.id, // aggiungi l'id dell'utente all'oggetto user
                  role: roles,
                };

                next();
              } else {
                res
                  .status(404)
                  .json({ error: "No user associated with token" });
              }
            })
            .catch((err) => {
              res.status(500).json({ error: "Error retrieving user" });
            });
        } else {
          res.status(401).json({ error: "Invalid access token" });
        }
      })
      .catch((err) => {
        res.status(500).json({ error: "Error retrieving access token" });
      });
  } else {
    // Se non c'è un header di autorizzazione, passa al prossimo middleware
    next();
  }
}

module.exports = loadUserFromToken;
