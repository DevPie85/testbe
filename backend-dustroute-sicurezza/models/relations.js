const {
  Account,
  AnagrafeLavoratore,
  Role,
  AccountRole,
  Permission,
  Resource,
  RoleResource,
} = require("./models");

Account.belongsToMany(Role, { through: AccountRole, foreignKey: "accountId" });
Role.belongsToMany(Account, { through: AccountRole, foreignKey: "roleId" });

Account.hasOne(AnagrafeLavoratore, { foreignKey: "accountId" });
AnagrafeLavoratore.belongsTo(Account, { foreignKey: "accountId" });

Account.hasMany(AccountRole, { foreignKey: "accountId" });
AccountRole.belongsTo(Account, { foreignKey: "accountId" });

Role.hasMany(AccountRole, { foreignKey: "roleId" });
AccountRole.belongsTo(Role, { foreignKey: "roleId" });

Role.belongsToMany(Resource, { through: RoleResource, foreignKey: "roleId" });
Resource.belongsToMany(Role, {
  through: RoleResource,
  foreignKey: "resourceId",
});

Role.hasMany(Permission, { foreignKey: "roleId" });
Permission.belongsTo(Role, { foreignKey: "roleId" });

Resource.hasMany(Permission, { foreignKey: "resourceId" });
Permission.belongsTo(Resource, { foreignKey: "resourceId" });
