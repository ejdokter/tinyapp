const generateRandomString = function() {
  let result = '';
  let char = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for (let i = 0; i < 6; i++) {
    result += char[Math.round(Math.random() * (char.length - 1))];
  }
  return result;
};

const emailExists = function(email, userDatabase) {
  for (const user in userDatabase) {
    if (userDatabase[user].email === email) {
      return true;
    }
  }
  return false;
};

const urlsForUser = function(id, urlDatabase) {
  const urls = {};
  for (const el in urlDatabase) {
    if (urlDatabase[el].userID === id) {
      urls[el] = urlDatabase[el];
    }
  }
  return urls;
};

const getUserByEmail = function(email, userDatabase) {
  for (const user in userDatabase) {
    if (userDatabase[user].email === email) {
      return userDatabase[user].id;
    }
  }
};

module.exports = { generateRandomString, emailExists, urlsForUser, getUserByEmail };