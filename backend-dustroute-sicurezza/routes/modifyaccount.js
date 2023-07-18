const {
  Account,
  AnagrafeLavoratore,
  Role,
  AccountRole,
  Permission,
  RoleResource,
} = require("../models/tables");
const bcrypt = require("bcryptjs");

const modifyAccount = async (req, res) => {
  const { id } = req.params;

  const {
    email,
    password,
    confirmPassword,
    role,
    nome,
    cognome,
    matricola,
    note,
    active,
    resources,
  } = req.body;

  // Validiamo le risorse
  if (!resources || !Array.isArray(resources)) {
    return res.status(400).json({
      error: "The 'resources' field is required and must be an array.",
    });
  }

  // Verifichiamo se l'utente è un rootAdmin
  const userRole = await AccountRole.findOne({ where: { accountId: id } });
  if (userRole && userRole.role === "rootAdmin") {
    return res
      .status(403)
      .json({ error: "Cannot modify a user with rootAdmin role" });
  }

  // Verifichiamo se la password e la confirmPassword corrispondono
  if (password || confirmPassword) {
    if (!password || !confirmPassword || password !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match" });
    }
  }

  try {
    // Controlliamo se l'utente esiste
    const existingUser = await Account.findOne({ where: { id: id } });
    if (!existingUser) {
      return res.status(404).json({ error: "User not found" });
    }

    // Verifichiamo se il ruolo esiste
    const roleData = await Role.findOne({ where: { title: role } });
    if (!roleData) {
      return res.status(400).json({ error: `Role ${role} does not exist` });
    }

    // Se l'utente sta cercando di diventare un rootAdmin, verifichiamo se già esiste un rootAdmin
    if (role === "rootAdmin") {
      const existingAdminRoot = await AccountRole.findOne({
        where: { roleId: roleData.roleId },
      });
      if (existingAdminRoot && existingAdminRoot.accountId !== id) {
        return res.status(400).json({
          error: "An adminRoot already exists. Cannot change to another.",
        });
      }
    }

    // Creiamo l'oggetto che useremo per aggiornare l'utente
    let updatedUser = {
      alias: email,
      email,
      active: active !== undefined ? active : role === "admin" ? 1 : 0,
    };

    // Se è stata fornita una password, la crittografiamo
    if (password) {
      const hash = await bcrypt.hash(password, 10);
      updatedUser.password = hash;
    }

    // Aggiorniamo l'utente
    await Account.update(updatedUser, { where: { id: id } });

    // Aggiorniamo i dettagli del lavoratore
    const lavoratore = await AnagrafeLavoratore.findOne({
      where: { accountId: id },
    });
    if (lavoratore) {
      await AnagrafeLavoratore.update(
        {
          matricola,
          nome,
          cognome,
          note,
        },
        { where: { accountId: id } }
      );
    } else {
      return res
        .status(400)
        .json({ error: "Worker details not found for this user" });
    }

    // Aggiorniamo il ruolo dell'utente e i suoi permessi
    const currentRoleData = await AccountRole.findOne({
      where: { accountId: id },
    });

    // Se il ruolo è cambiato, aggiorniamo i permessi
    if (currentRoleData.roleId !== roleData.roleId) {
      await AccountRole.update(
        { roleId: roleData.roleId },
        { where: { accountId: id } }
      );

      await Permission.destroy({ where: { accountId: id } });

      const roleResources = await RoleResource.findAll({
        where: { roleId: roleData.roleId },
      });

      for (let roleResource of roleResources) {
        const reqResource = resources.find(
          (r) => r.id === roleResource.resourceId
        );

        let activeStatus = reqResource ? reqResource.active : 1;

        await Permission.create({
          accountId: id,
          roleId: roleData.roleId,
          resourceId: roleResource.resourceId,
          active: activeStatus,
        });
      }
    } else {
      // Altrimenti, aggiorniamo solo i permessi esistenti
      for (let resource of resources) {
        const existingPermission = await Permission.findOne({
          where: {
            accountId: id,
            resourceId: resource.id,
          },
        });

        if (existingPermission) {
          await Permission.update(
            { active: resource.active },
            {
              where: {
                accountId: id,
                resourceId: resource.id,
              },
            }
          );
        }
      }
    }

    // Rispondiamo con un messaggio di successo
    res.json({ message: `Account with id ${id} was successfully updated` });
  } catch (err) {
    // Se qualcosa va storto, rispondiamo con un errore
    res.status(500).json({ error: err.message });
  }
};

module.exports = modifyAccount;
