const {
  Account,
  AnagrafeLavoratore,
  Role,
  AccountRole,
  RoleResource,
  Permission,
} = require("../models/tables");
const bcrypt = require("bcryptjs");
const validateRequestFields = require("../utilities/functions/validateRequestFields");

const addAccount = async (req, res) => {
  const validationError = validateRequestFields(req, res);
  if (validationError) return validationError;

  const {
    email,
    password,
    role,
    nome,
    cognome,
    matricola,
    note,
    active,
    confirmPassword,
    resources,
  } = req.body;

  if (!resources || !Array.isArray(resources)) {
    return res.status(400).json({
      error: "The 'resources' array is required in the request body.",
    });
  }

  if (!password || !confirmPassword) {
    return res.status(400).json({ error: "Both password fields are required" });
  }
  if (password !== confirmPassword) {
    return res.status(400).json({ error: "Passwords do not match" });
  }

  try {
    const existingUser = await Account.findOne({ where: { email: email } });
    if (existingUser) {
      return res.status(400).json({ error: "Email is already in use" });
    }

    const existingLavoratore = await AnagrafeLavoratore.findOne({
      where: { matricola: matricola },
    });
    if (existingLavoratore) {
      return res.status(400).json({ error: "Matricola is already in use" });
    }

    const hash = await bcrypt.hash(password, 10);

    const roleData = await Role.findOne({ where: { title: role } });
    if (!roleData) {
      return res.status(400).json({ error: `Role ${role} does not exist` });
    }

    if (role === "rootAdmin") {
      const existingAdminRoot = await AccountRole.findOne({
        where: { roleId: roleData.roleId },
      });
      if (existingAdminRoot) {
        return res.status(400).json({
          error: "An adminRoot already exists. Cannot create another.",
        });
      }
    }

    const user = await Account.create({
      alias: email,
      email,
      password: hash,
      active: active !== undefined ? active : role === "admin" ? 1 : 0,
    });

    const accountRole = await AccountRole.create({
      accountId: user.id,
      roleId: roleData.roleId,
    });

    const lavoratore = await AnagrafeLavoratore.create({
      matricola,
      nome,
      cognome,
      note,
      accountId: user.id,
    });

    let roleResources = await RoleResource.findAll({
      where: { roleId: roleData.roleId },
    });

    for (let roleResource of roleResources) {
      const reqResource = resources.find(
        (r) => r.id === roleResource.resourceId
      );

      let activeStatus = reqResource ? reqResource.active : 1;

      await Permission.create({
        accountId: user.id,
        roleId: roleData.roleId,
        resourceId: roleResource.resourceId,
        active: activeStatus,
      });
    }

    res.json({
      id: user.id,
      lavoratoreId: lavoratore.id,
      accountRoleId: accountRole.id,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = addAccount;

/* 
Il body deve essere impostato come segue
{
  "email": "example@example.com",
  "password": "examplePassword6561@",
  "confirmPassword": "examplePassword6561@",
  "role": "admin",
  "nome": "Mario",
  "cognome": "Rossi",
  "matricola": "123456d32",
  "note": "Some notes",
  "active": true,

  Se resource viene impostato come array vuoto [] tutte le risorse saranno impostato su active:1 di default

  "resources": [
    {"id": 1, "active": 0},
    {"id": 2, "active": 1},
    {"id": 3, "active": 0},
    ...
  ]
}
*/
