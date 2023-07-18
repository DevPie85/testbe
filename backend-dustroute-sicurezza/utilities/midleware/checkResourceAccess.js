const {
  Account,
  Resource,
  Role,
  RoleResource,
  AccountRole,
  Permission,
} = require("../../models/tables");

function checkResourceAccess(...resourceUris) {
  return async (req, res, next) => {
    const { id } = req.user;

    const account = await Account.findOne({
      where: { id: id },
      include: [
        {
          model: Role,
          through: { model: AccountRole },
          include: [
            {
              model: Resource,
              through: { model: RoleResource },
              include: [
                {
                  model: Permission,
                  where: { accountId: id },
                },
              ],
            },
          ],
        },
      ],
    });

    if (!account) {
      return res.status(404).json({ error: "Account non trovato." });
    }

    const hasAccess = resourceUris.every((resourceUri) =>
      account.Roles.some((role) =>
        role.Resources.some(
          (resource) =>
            resource.uri === resourceUri &&
            resource.Permissions.some((permission) => permission.active === 1)
        )
      )
    );

    if (!hasAccess) {
      return res.status(403).json({ error: "Accesso negato." });
    }

    next();
  };
}

module.exports = checkResourceAccess;
