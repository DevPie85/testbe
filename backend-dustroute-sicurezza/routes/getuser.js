const {
  Account,
  AnagrafeLavoratore,
  Role,
  AccountRole,
  Permission,
  Resource,
} = require("../models/tables");
const Sequelize = require("sequelize");

const getUser = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await Account.findOne({
      where: {
        id: id,
        "$AccountRoles.Role.Resources.Permissions.accountId$":
          Sequelize.col("Account.id"),
      },
      attributes: { exclude: ["password", "createdAt", "updatedAt"] },
      include: [
        {
          model: AnagrafeLavoratore,
          attributes: { exclude: ["createdAt", "updatedAt"] },
        },
        {
          model: AccountRole,
          attributes: { exclude: ["createdAt", "updatedAt"] },
          include: [
            {
              model: Role,
              attributes: { exclude: ["createdAt", "updatedAt"] },
              include: [
                {
                  model: Resource,
                  through: {
                    attributes: [],
                  },
                  attributes: { exclude: ["createdAt", "updatedAt"] },
                  include: [
                    {
                      model: Permission,
                      required: false,
                      attributes: { exclude: ["createdAt", "updatedAt"] },
                      where: {
                        accountId: id, // Filtra solo i permessi con lo stesso accountId dell'account principale
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Rimuovi i duplicati dai permessi
    const filteredPermissions = [];
    user.AccountRoles.forEach((accountRole) => {
      accountRole.Role.Resources.forEach((resource) => {
        resource.Permissions.forEach((permission) => {
          const existingPermission = filteredPermissions.find(
            (p) => p.idPermission === permission.idPermission
          );
          if (!existingPermission) {
            filteredPermissions.push(permission);
          }
        });
      });
    });

    // Aggiorna i permessi filtrati nell'oggetto utente
    const userObject = user.toJSON();
    userObject.AccountRoles.forEach((accountRole) => {
      accountRole.Role.Resources.forEach((resource) => {
        resource.Permissions = filteredPermissions.filter(
          (permission) => permission.resourceId === resource.idResource
        );
      });
    });

    res.json(userObject);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = getUser;
