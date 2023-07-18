const validateRequestFields = (req, res) => {
  const { email, password, role, nome, cognome, matricola } = req.body;

  const passwordPattern =
    /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.{8,})/;
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const requiredFields = [
    { field: "email", value: email },
    { field: "password", value: password },
    { field: "role", value: role },
    { field: "nome", value: nome },
    { field: "cognome", value: cognome },
    { field: "matricola", value: matricola },
  ];

  for (let { field, value } of requiredFields) {
    if (!value) {
      return res.status(400).json({
        error: `${field.charAt(0).toUpperCase() + field.slice(1)} is required`,
      });
    }
  }

  if (!passwordPattern.test(password)) {
    return res.status(400).json({
      error:
        "Password must be at least 8 characters, include at least one uppercase letter, one lowercase letter, one number, and one special character.",
    });
  }

  if (!emailPattern.test(email)) {
    return res.status(400).json({
      error: "Invalid email format.",
    });
  }

  return null;
};

module.exports = validateRequestFields;
