const { Role, Resource } = require("../models/tables");
const sequelize = require("sequelize");

const getRoles = async (req, res) => {
  try {
    const roles = await Role.findAll({
      attributes: {
        exclude: ["createdAt", "updatedAt"],
      },
      where: {
        title: {
          [sequelize.Op.not]: "rootAdmin",
        },
      },
      include: [
        {
          model: Resource,
          as: "Resources",
          attributes: {
            exclude: ["createdAt", "updatedAt"],
          },
          through: {
            as: "Permissions",
            attributes: {
              exclude: ["createdAt", "updatedAt"],
            },
          },
        },
      ],
    });
    res.json(roles);
  } catch (error) {
    console.error(error);
    res.status(500).send("Errore del server");
  }
};

module.exports = getRoles;
