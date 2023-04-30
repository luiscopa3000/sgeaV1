const jwt = require('jsonwebtoken');

function generateToken(user) {
  const payload = {
    userId: user.id,
    email: user.email
  };

  const options = {
    expiresIn: '1d'
  };

  return jwt.sign(payload, 'mi_clave_secreta', options);
}

module.exports = generateToken;
