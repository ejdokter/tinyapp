const express = require("express");
const app = express();
const bodyParser = require('body-parser')
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs')
const { generateRandomString, emailExists, urlsForUser, getUserByEmail } = require('./helpers')

const PORT = 8080; // default port 8080

app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({extended: true}))
app.use(cookieSession({
  name: 'session',
  keys: ["banana"],
  maxAge: 24 * 60 * 60 * 1000
}))


const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "userRandomID"
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "user2RandomID"
  }
};

const userDatabase = { 
  "userRandomID": {
    user_id: "userRandomID", 
    email: "user@example.com", 
    password: bcrypt.hashSync("123", 10)
  },
 "user2RandomID": {
    user_id: "user2RandomID", 
    email: "user2@example.com", 
    password: bcrypt.hashSync("dishwasher-funk", 10)
  }
}

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/hello', (req, res) => {
  res.send('<html><body>Hello <b>World</b></body></html>\n')
})

app.get('/urls', (req, res) => {
  const user = userDatabase[req.session.user_id]
  if (!user) {
    let templateVars = {
      error: "Please Login to see URLs",
      user: userDatabase[req.session.user_id]
    }
    res.status(400).render('error', templateVars)
  } else {
      let templateVars = { 
        urls: urlsForUser(req.session.user_id, urlDatabase), 
        user: userDatabase[req.session.user_id] 
    }
    res.render('urls_index', templateVars)
  }
})

app.get('/urls/new', (req, res) => {
  const templateVars = {
    user: userDatabase[req.session.user_id]
  }
  const user = req.session.user_id
  if (!user) {
    res.redirect('/login')
  }
  res.render('urls_new', templateVars)
})

app.get('/urls/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL
  
  if(!urlDatabase[shortURL]) {
    let templateVars = {
      error: "This url does not exist!",
      user: userDatabase[req.session.user_id]
    }
    res.status(400).render('error', templateVars)
  }
    
  let templateVars = { 
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL].longURL,
    userID: req.session.user_id,
    user: userDatabase[req.session.user_id]
      }

  res.render('urls_show', templateVars)
  
})

app.get('/u/:shortURL', (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL
  res.redirect(longURL)
})

app.get('/register', (req, res) => {
  const templateVars = {
    userDatabase,
    user: userDatabase[req.session.user_id]
  }
  res.render('register', templateVars)
})

app.get('/login', (req, res) => {
  const templateVars = {
    userDatabase,
    user: userDatabase[req.session.user_id]
  }
  res.render('login', templateVars)
})

app.post('/urls', (req, res) => {
  const shortURL = generateRandomString()
  const longURL = req.body.longURL
  urlDatabase[shortURL] = {
    longURL: longURL,
    userID: req.session.user_id
  }
  res.redirect(`/urls/:${shortURL}`)
})

app.post('/urls/:shortURL/delete', (req, res) => {
  const userURLs = urlsForUser(req.session.user_id, urlDatabase)
  if (Object.keys(userURLs).includes(req.params.id)) {
    const shortURL = req.params.shortURL
    delete urlDatabase[shortURL]
    res.redirect('/urls')
  } else {
      let templateVars = {
        error: "Only the owner can edit this URL",
        user: userDatabase[req.session.user_id]
    }
      res.status(400).render('error', templateVars)
  }
})

app.post('/urls/:id', (req, res) => {
  const userURLs = urlsForUser(req.session.user_id, urlDatabase)
  if (Object.keys(userURLs).includes(req.params.id)) {
    const shortURL = req.params.id
    urlDatabase[shortURL].longURL = req.body.newURL
    res.redirect('/urls')
  } else {
      let templateVars = {
        error: "Only the owner can edit this URL",
        user: userDatabase[req.session.user_id]
      }
      res.status(400).render('error', templateVars)
    }
})

app.post('/login', (req, res) => {
  const email = req.body.email
  const password = req.body.password

  if(email === "" || email === "") {
    res.status(400).send('Email and password cannot be blank')
  } else if(emailExists(email, userDatabase) === false) {
      res.status(403).send('No account associated with that email found')
  } else {
      const user = getUserByEmail(email, userDatabase)
      if(!bcrypt.compareSync(password, userDatabase[user].password)) {
        res.status(403).send('Incorrect Password')
      } else {
          req.session.user_id = user
          res.redirect('/urls')
      }  
  }



  // res.redirect('/urls')
})

app.post('/logout', (req, res) => {
  req.session = null
  res.redirect('/login')
})

app.post('/register', (req,res) => {
  const email = req.body.email
  const password = req.body.password
  if(email === "" || email === "") {
    res.status(400).send('Email and password cannot be blank')
  } else if(emailExists(email, userDatabase)) {
    res.status(400).send('Email already exists')
  } else {
    newUser = generateRandomString()
    userDatabase[newUser] = {
      user_id: newUser,
      email: email,
      password: bcrypt.hashSync(password, 10)
    }
      req.session.user_id = newUser
      res.redirect('/urls')
  }
  console.log(userDatabase)
})


app.listen(PORT, () => {
  console.log(`Tiny app listening on port ${PORT}!`);
});