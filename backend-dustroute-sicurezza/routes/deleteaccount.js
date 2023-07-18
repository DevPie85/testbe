const {
  Account,
  AccountRole,
  AnagrafeLavoratore,
  Permission,
  Role,
} = require("../models/tables");

const deleteAccount = (app, limiter, verifyAdmin) => async (req, res, next) => {
  const id = req.params.id;
  if (id === "1") {
    return res
      .status(403)
      .json({ error: "Questo utente non può essere cancellato" });
  }

  try {
    const user = await Account.findByPk(req.params.id);
    if (!user) {
      return res.status(400).json({ error: "User does not exist" });
    }

    const accountRole = await AccountRole.findOne({
      where: { accountId: user.id },
    });

    const lavoratore = await AnagrafeLavoratore.findOne({
      where: { accountId: user.id },
    });

    // Delete permissions for the account
    const permissions = await Permission.findAll({
      where: { accountId: user.id },
    });
    const deletionPromises = permissions.map((permission) =>
      permission.destroy()
    );
    await Promise.all(deletionPromises);

    // Controlla se l'utente è un amministratore
    if (accountRole) {
      const adminRole = await Role.findOne({ where: { title: "admin" } });
      if (adminRole && accountRole.roleId === adminRole.roleId) {
        // Controlla se ci sono altri amministratori
        const otherAdmins = await AccountRole.count({
          where: { roleId: adminRole.roleId },
        });
        if (otherAdmins <= 1) {
          return res
            .status(400)
            .json({ error: "Cannot delete the last admin" });
        }
      }
      await accountRole.destroy();
    }

    // Cancella le informazioni del lavoratore, se esistono
    if (lavoratore) {
      await lavoratore.destroy();
    }

    // Cancella l'account
    await user.destroy();

    res.json({ message: `User with id ${req.params.id} has been deleted` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
  next();
};

module.exports = deleteAccount;
