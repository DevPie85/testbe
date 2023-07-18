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

const defaultAdminEmail = process.env.DEFAULT_ADMIN_EMAIL;
const defaultAdminPassword = process.env.DEFAULT_ADMIN_PASSWORD;

const defaultMatricola = process.env.DEFAULT_ADMIN_MATRICOLA;
const defaultNome = process.env.DEFAULT_ADMIN_NOME;
const defaultCognome = process.env.DEFAULT_ADMIN_COGNOME;
const defaultNnote = process.env.DEFAULT_ADMIN_NOTE;

sequelize
  .sync({ force: true })
  .then(async () => {
    console.log("Database & tables created!");

    const clientId = process.env.CLIENT_ID;
    const clientSecret = process.env.CLIENT_SECRET;

    let client = await Client.findOne({ where: { id: clientId } });

    let roleAdmin = await Role.findOne({ where: { title: "admin" } });
    if (!roleAdmin) {
      roleAdmin = await Role.create({
        title: "admin",
        description: "Ruolo di amministratore",
      });
    }

    let rootAdmin = await Role.findOne({ where: { title: "rootAdmin" } });
    if (!rootAdmin) {
      rootAdmin = await Role.create({
        title: "rootAdmin",
        description: "Ruolo di super amministratore",
      });
    }

    let roleUser = await Role.findOne({ where: { title: "user" } });
    if (!roleUser) {
      roleUser = await Role.create({
        title: "user",
        description: "Ruolo utente",
      });
    }

    if (client) {
      console.log(`Il client con ID: ${clientId} esiste già`);
    } else {
      console.log(
        `Creazione del client con ID: ${clientId} e segreto: ${clientSecret}`
      );
      client = await Client.create({
        id: clientId,
        secret: clientSecret,
        grants: "password refresh_token",
      });

      if (client) {
        console.log(`Client creato: `, client.toJSON());
      } else {
        console.log("Creazione del client fallita");
      }
    }

    let defaultAdmin = await Account.findOne({
      where: { email: defaultAdminEmail },
    });

    if (!defaultAdmin) {
      const hashedPassword = await bcrypt.hash(defaultAdminPassword, 10);
      defaultAdmin = await Account.create({
        alias: defaultAdminEmail,
        email: defaultAdminEmail,
        password: hashedPassword,
        active: 1,
      });

      let accountRoleAdmin = await AccountRole.create({
        accountId: defaultAdmin.id, // Usa l'ID dell'account di admin appena creato
        roleId: rootAdmin.roleId, // Usa l'ID del ruolo di admin appena creato
      });

      await AnagrafeLavoratore.create({
        matricola: defaultMatricola,
        nome: defaultNome,
        cognome: defaultCognome,
        note: defaultNnote,
        accountId: defaultAdmin.id,
      });

      console.log("Admin di default creato con successo.");

      let adminResources = [
        {
          uri: "AddAccount",
          section: 1,
          tag: "Aggiungi nuovo utente",
        },
        {
          uri: "ModifyAccount",
          section: 2,
          tag: "Modifica utente",
        },
        {
          uri: "DeleteAccount",
          section: 3,
          tag: "Cancella utente",
        },
        /*         {
          uri: "ChangeUserActiveStatus",
          section: 5,
          tag: "Attiva utente",
        }, */
        {
          uri: "UsersPage",
          section: 4,
          tag: "Accesso pagina utenti",
        },
        /*         {
          uri: "AccessPlatform",
          section: 7,
          tag: "Abilita l'accesso alla piattaforma (provvisorio)",
        }, */
      ];

      let userResources = [
        /*         {
          uri: "AccessPlatform",
          section: 9,
          tag: "Livello di sicurezza aggiuntivo per l'accesso alla piattaforma",
        }, */
      ];

      // Creazione delle risorse per l'admin
      for (let { uri, section, tag } of adminResources) {
        let resource = await Resource.create({
          uri: uri,
          section: section,
          tag: tag,
        });

        let roleResourceAdmin = await RoleResource.create({
          roleId: roleAdmin.roleId,
          resourceId: resource.idResource,
        });
      }

      // Creazione delle risorse per lo user
      for (let { uri, section, tag } of userResources) {
        let resource = await Resource.create({
          uri: uri,
          section: section,
          tag: tag,
        });

        let roleResourceUser = await RoleResource.create({
          roleId: roleUser.roleId,
          resourceId: resource.idResource,
        });
      }

      // Creazione delle risorse e delle associazioni e dei permessi per l'admin di default
      for (let { uri, section, tag } of adminResources) {
        let resource = await Resource.create({
          uri: uri,
          section: section,
          tag: tag,
        });

        let roleResourceAdmin = await RoleResource.create({
          roleId: rootAdmin.roleId,
          resourceId: resource.idResource,
        });

        let permissionAdmin = await Permission.create({
          accountId: defaultAdmin.id,
          roleId: rootAdmin.roleId,
          resourceId: resource.idResource,
          active: 1,
        });
      }

      console.log("Risorse collegate ai ruoli con successo.");
    } else {
      console.log("Admin di default già esistente.");
    }
  })
  .catch((error) => {
    console.error("Impossibile connettersi al database:", error);
  });
