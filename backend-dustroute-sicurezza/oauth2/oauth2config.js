const OAuthServer = require("express-oauth-server");
const bcrypt = require("bcryptjs");
const {
  AccessToken,
  RefreshToken,
  Client,
  Account,
  Resource,
  Role,
  Permission,
  RoleResource,
  AccountRole,
} = require("../models/tables");

// Definisce il modello per il server OAuth
const oauthServerModel = {
  // Recupera il token di accesso dal database
  getAccessToken: (accessToken) => {
    return AccessToken.findOne({ where: { token: accessToken } }).then(
      (accessToken) => {
        // Se non c'è il token, restituisci false
        if (!accessToken) return false;

        // Controlla se il token è scaduto
        const now = new Date();
        if (accessToken.expiresAt < now) {
          console.log("Token scaduto");
          return false;
        }

        return {
          accessToken: accessToken.token,
          accessTokenExpiresAt: accessToken.expiresAt,
          client: { id: accessToken.clientId },
          user: { id: accessToken.userId },
        };
      }
    );
  },

  // Recupera il token di aggiornamento dal database
  getRefreshToken: (refreshToken) => {
    return RefreshToken.findOne({ where: { token: refreshToken } }).then(
      (refreshToken) => {
        if (!refreshToken) return false;

        return {
          refreshToken: refreshToken.token,
          refreshTokenExpiresAt: refreshToken.expiresAt,
          client: { id: refreshToken.clientId },
          user: { id: refreshToken.userId },
        };
      }
    );
  },

  // Revoca un token di aggiornamento eliminandolo dal database
  revokeToken: (token) => {
    return RefreshToken.destroy({
      where: { token: token.refreshToken },
    }).then((deletedRowsCount) => deletedRowsCount > 0);
  },

  // Salva un nuovo token di accesso e un token di aggiornamento nel database
  // Salva un nuovo token di accesso e un token di aggiornamento nel database
  saveToken: (token, client, user) => {
    const expirationDate = new Date();
    expirationDate.setMinutes(expirationDate.getMinutes() + 1440);
    return Promise.all([
      AccessToken.create({
        userId: user.id,
        clientId: client.id,
        token: token.accessToken,
        expiresAt: expirationDate,
      }),
      RefreshToken.create({
        userId: user.id,
        clientId: client.id,
        token: token.refreshToken,
        expiresAt: expirationDate,
      }),
    ]).then(([accessToken, refreshToken]) => ({
      accessToken: accessToken.token,
      accessTokenExpiresAt: accessToken.expiresAt,
      refreshToken: refreshToken.token,
      refreshTokenExpiresAt: refreshToken.expiresAt,
      client: { id: client.id },
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    }));
  },

  // Valida l'ambito del client (funzione stub, dovrebbe essere implementata in base alle esigenze del progetto)
  validateScope: () => true,

  // Verifica l'ambito del client (funzione stub, dovrebbe essere implementata in base alle esigenze del progetto)
  verifyScope: () => true,

  getClient: (clientId, clientSecret) => {
    const whereOptions = {
      id: clientId,
    };
    if (clientSecret) whereOptions.secret = clientSecret;

    return Client.findOne({ where: whereOptions }).then((client) => {
      if (!client) {
        console.log(
          `Cliente non trovato con ID: ${clientId} e segreto: ${clientSecret}`
        );
        return false;
      }
      console.log(`Cliente trovato: `, client.toJSON());

      return {
        id: client.id,
        grants: client.grants.split(" "),
      };
    });
  },

  getUser: (email, password) => {
    if (!email) {
      throw new Error("Email is required");
    }
    if (!password) {
      throw new Error("Password is required");
    }

    return Account.findOne({
      where: { email },
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
    }).then((user) => {
      if (!user || !user.active) return false;
      return bcrypt.compare(password, user.password).then((match) => {
        if (!match) return false;

        const roles = user.Roles.map((role) => ({
          id: role.id,
          title: role.title,
          description: role.description,
          resources: role.Resources.map((resource) => resource.uri),
        }));

        return {
          id: user.id,
          email: user.email,
          role: roles,
        };
      });
    });
  },

  grants: ["password", "refresh_token"],

  // Configurazione per richiedere l'autenticazione del client
  requireClientAuthentication: { password: true },
};

module.exports = new OAuthServer({ model: oauthServerModel });
