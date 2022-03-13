const express = require("express");
const app = express();
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');
const { generateRandomString, emailExists, urlsForUser, getUserByEmail } = require('./helpers');

const PORT = 8080; // default port 8080

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({ // cookieSession default values
  name: 'session',
  keys: ["banana"],
  maxAge: 24 * 60 * 60 * 1000
}));


const urlDatabase = { // test database
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "userRandomID"
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "user2RandomID"
  }
};

const userDatabase = { // test database
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: bcrypt.hashSync("123", 10)
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("dishwasher-funk", 10)
  }
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/hello', (req, res) => {
  res.send('<html><body>Hello <b>World</b></body></html>\n');
});

app.get('/urls', (req, res) => { // get request for home page
  const user = userDatabase[req.session.id];
  if (!user) { // if not logged in receive error
    let templateVars = {
      error: "Please Login to see URLs",
      user: userDatabase[req.session.id]
    };
    res.status(400).render('error', templateVars);
  } else { // show urls only associated with users
    let templateVars = {
      urls: urlsForUser(req.session.id, urlDatabase),
      user: userDatabase[req.session.id]
    };
    res.render('urls_index', templateVars);
  }
});

app.get('/urls/new', (req, res) => { // get request to create new url
  const templateVars = {
    user: userDatabase[req.session.id]
  };
  const user = req.session.id;
  if (!user) { // redirect to login if no user logged in
    res.redirect('/login');
  }
  res.render('urls_new', templateVars);
});

app.get('/urls/:shortURL', (req, res) => { // get request to show specific short url
  const shortURL = req.params.shortURL;
  
  if (!urlDatabase[shortURL]) { // if no url with that value exists return error
    let templateVars = {
      error: "This url does not exist!",
      user: userDatabase[req.session.id]
    };
    res.status(400).render('error', templateVars);
  }
    
  let templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    userID: req.session.id,
    user: userDatabase[req.session.id]
  };

  res.render('urls_show', templateVars);
  
});

app.get('/u/:shortURL', (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

app.get('/register', (req, res) => { // show registration page
  const templateVars = {
    userDatabase,
    user: userDatabase[req.session.id]
  };
  res.render('register', templateVars);
});

app.get('/login', (req, res) => { // show login page
  const templateVars = {
    userDatabase,
    user: userDatabase[req.session.id]
  };
  res.render('login', templateVars);
});

app.post('/urls', (req, res) => { // posting a new url
  const shortURL = generateRandomString(); //random short url
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = {
    longURL: longURL,
    userID: req.session.id
  };
  res.redirect(`/urls/:${shortURL}`);
});

app.post('/urls/:shortURL/delete', (req, res) => { // delete url
  const userURLs = urlsForUser(req.session.id, urlDatabase);
  if (Object.keys(userURLs).includes(req.params.id)) { // can only delete urls that are associated with user
    const shortURL = req.params.shortURL;
    delete urlDatabase[shortURL];
    res.redirect('/urls');
  } else {
    let templateVars = { // error if they don't own the url
      error: "Only the owner can edit this URL",
      user: userDatabase[req.session.id]
    };
    res.status(400).render('error', templateVars);
  }
});

app.post('/urls/:id', (req, res) => { // editing a url
  const userURLs = urlsForUser(req.session.id, urlDatabase);
  if (Object.keys(userURLs).includes(req.params.id)) { // can only edit urls that the user owns
    const shortURL = req.params.id;
    urlDatabase[shortURL].longURL = req.body.newURL;
    res.redirect('/urls');
  } else {
    let templateVars = { // if user doesn't own url return error
      error: "Only the owner can edit this URL",
      user: userDatabase[req.session.id]
    };
    res.status(400).render('error', templateVars);
  }
});

app.post('/login', (req, res) => { // login to account
  const email = req.body.email;
  const password = req.body.password;

  if (email === "" || email === "") { // error if email is blank
    let templateVars = { // error if they don't own the url
      error: "Email and password cannot be blank",
      user: userDatabase[req.session.id]
    };
    res.status(400).render('error', templateVars);

  } else if (emailExists(email, userDatabase) === false) { // email not found in database
    let templateVars = { // error if they don't own the url
      error: "No account associated with that email found",
      user: userDatabase[req.session.id]
    };
    res.status(400).render('error', templateVars);
      
  } else { // incorrect password
    const user = getUserByEmail(email, userDatabase);
    if (!bcrypt.compareSync(password, userDatabase[user].password)) {
      let templateVars = { // error if they don't own the url
        error: "Incorrect Password",
        user: userDatabase[req.session.id]
      };
      res.status(400).render('error', templateVars);

    } else { // successful login
      req.session.id = user;
      res.redirect('/urls');
    }
  }



  // res.redirect('/urls')
});

app.post('/logout', (req, res) => { // logout and clear cookies
  req.session = null;
  res.redirect('/login');
});

app.post('/register', (req,res) => { // register new account
  const email = req.body.email;
  const password = req.body.password;
  if (email === "" || email === "") { // cannot register an account without an email
    let templateVars = { // error if they don't own the url
      error: "Email and password cannot be blank",
      user: userDatabase[req.session.id]
    };
    res.status(400).render('error', templateVars);

  } else if (emailExists(email, userDatabase)) { // cannot register email if it already exists in database
    let templateVars = { // error if they don't own the url
      error: "Email already exists",
      user: userDatabase[req.session.id]
    };
    res.status(400).render('error', templateVars);

  } else { // sucessful registration
    const newUser = generateRandomString();
    userDatabase[newUser] = {
      id: newUser,
      email: email,
      password: bcrypt.hashSync(password, 10)
    };
    req.session.id = newUser;
    res.redirect('/urls');
  }
  console.log(userDatabase); // log all users to console
});


app.listen(PORT, () => {
  console.log(`Tiny app listening on port ${PORT}!`);
});