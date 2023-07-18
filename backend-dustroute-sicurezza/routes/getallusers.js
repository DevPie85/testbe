const {
  Account,
  AnagrafeLavoratore,
  Role,
  AccountRole,
  Permission,
  Resource,
} = require("../models/tables");
const Sequelize = require("sequelize");

const getUsers = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const offset = (page - 1) * limit;

    const accounts = await Account.findAll({
      limit,
      offset,
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
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    });

    const totalAccount = await Account.count();

    const filteredAccounts = accounts.map((account) => {
      const filteredRoles = account.AccountRoles.map((accountRole) => {
        const filteredResources = accountRole.Role.Resources.map((resource) => {
          const filteredPermissions = resource.Permissions.filter(
            (permission) => permission.accountId === account.id
          );

          return { ...resource.toJSON(), Permissions: filteredPermissions };
        });

        return {
          ...accountRole.toJSON(),
          Role: { ...accountRole.Role.toJSON(), Resources: filteredResources },
        };
      });

      return {
        ...account.toJSON(),
        AccountRoles: filteredRoles,
      };
    });

    const response = {
      count: totalAccount,
      currentPage: page,
      totalPages: Math.ceil(totalAccount / limit),
      accountPerPage: filteredAccounts.length,
      account: filteredAccounts,
    };

    res.json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = getUsers;
