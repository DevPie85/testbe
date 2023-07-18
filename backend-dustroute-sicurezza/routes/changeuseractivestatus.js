const { Account, Role } = require("../models/tables");

const changeUserActiveStatus = async (req, res) => {
  const { active } = req.body;
  const { id } = req.params;

  try {
    const user = await Account.findByPk(id);
    const currentUser = req.user;

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const userRoles = await user.getRoles();
    const isAdmin = userRoles.some((role) => role.title === "admin");
    const isSelf = currentUser.id === user.id;

    console.log("---------------------------->" + req.user.resource);
    if (req.user.role && req.user.role.some((role) => role.title === "admin")) {
      // Il ruolo "admin" è presente in req.user.role
      console.log("L'utente ha il ruolo di 'admin'");
    } else {
      // Il ruolo "admin" non è presente in req.user.role
      console.log("L'utente non ha il ruolo di 'admin'");
    }

    if (isAdmin && isSelf && !active) {
      return res
        .status(400)
        .json({ error: "Admin cannot deactivate themselves" });
    }

    const adminRole = await Role.findOne({ where: { title: "admin" } });
    const activeAdmins = await adminRole.getAccounts({
      where: { active: 1 },
    });

    if (isAdmin && activeAdmins.length === 1 && !active) {
      return res
        .status(400)
        .json({ error: "At least one admin must remain active" });
    }

    if (active !== undefined) {
      const newActiveStatus = active ? 1 : 0;
      await user.update({ active: newActiveStatus });
    }

    res.json({ id: user.id, active: user.active });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = changeUserActiveStatus;
