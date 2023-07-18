const Sequelize = require("sequelize");
const sequelize = require("./db_connect").sequelize;

const AccessToken = sequelize.define("AccessToken", {
  userId: Sequelize.INTEGER,
  clientId: Sequelize.STRING,
  token: Sequelize.STRING(256),
  expiresAt: Sequelize.DATE,
});

const RefreshToken = sequelize.define("RefreshToken", {
  userId: Sequelize.INTEGER,
  clientId: Sequelize.STRING,
  token: Sequelize.STRING(256),
  expiresAt: Sequelize.DATE,
});

const Client = sequelize.define("Client", {
  id: {
    type: Sequelize.STRING,
    primaryKey: true,
  },
  secret: Sequelize.STRING,
  grants: Sequelize.STRING,
});

const Account = sequelize.define("Account", {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  alias: Sequelize.STRING,
  email: Sequelize.STRING,
  password: Sequelize.STRING,
  active: Sequelize.INTEGER,
});

const AnagrafeLavoratore = sequelize.define("AnagrafeLavoratore", {
  idLavoratore: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  matricola: Sequelize.STRING,
  nome: Sequelize.STRING,
  cognome: Sequelize.STRING,
  note: Sequelize.STRING,
  accountId: Sequelize.INTEGER,
});

const Role = sequelize.define("Role", {
  roleId: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  title: Sequelize.STRING,
  description: Sequelize.STRING,
});

const AccountRole = sequelize.define(
  "AccountRole",
  {
    idAccountRole: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    accountId: Sequelize.INTEGER,
    roleId: Sequelize.INTEGER,
  },
  {
    indexes: [
      {
        fields: ["roleId"],
      },
    ],
  }
);

const Resource = sequelize.define("Resource", {
  idResource: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  uri: Sequelize.STRING,
  section: Sequelize.INTEGER,
  tag: Sequelize.STRING,
});

const RoleResource = sequelize.define("RoleResource", {
  idRoleResource: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  roleId: Sequelize.INTEGER,
  resourceId: Sequelize.INTEGER,
});

const Permission = sequelize.define("Permission", {
  idPermission: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  accountId: {
    type: Sequelize.INTEGER,
    references: {
      model: "accounts",
      key: "id",
    },
  },
  resourceId: Sequelize.INTEGER,
  active: Sequelize.INTEGER,
});

module.exports = {
  AccessToken,
  RefreshToken,
  Client,
  Account,
  AnagrafeLavoratore,
  Role,
  AccountRole,
  Permission,
  Resource,
  RoleResource,
};
