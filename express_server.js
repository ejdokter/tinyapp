const express = require("express");
const app = express();
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser');
const e = require("express");

const PORT = 8080; // default port 8080

app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({extended: true}))
app.use(cookieParser())

function generateRandomString() {
  let result = ''
  let char = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
  for (let i = 0; i < 6; i++) {
    result += char[Math.round(Math.random() * (char.length - 1))]
  }
  return result
}

function emailExists(email) {
  for (const user in users) {
    if(users[user].email === email){
      return users[user]
    }
  }
  return false
}

function urlsForUser(id, urlDatabase) {
  const urls = {}
  for (const el in urlDatabase) {
    if (urlDatabase[el].userID === id) {
      urls[el] = urlDatabase[el]
    }
  }
  return urls
}

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

const users = { 
  "userRandomID": {
    user_id: "userRandomID", 
    email: "user@example.com", 
    password: "123"
  },
 "user2RandomID": {
    user_id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
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
  const user = users[req.cookies.user_id]
  if (!user) {
    let templateVars = {
      error: "Please Login to see URLs",
      user: users[req.cookies.user_id]
    }
    res.status(400).render('error', templateVars)
  } else {
      let templateVars = { 
        urls: urlsForUser(req.cookies.user_id, urlDatabase), 
        user: users[req.cookies['user_id']] 
    }
    res.render('urls_index', templateVars)
  }
})

app.get('/urls/new', (req, res) => {
  const templateVars = {
    user: users[req.cookies['user_id']]
  }
  const user = req.cookies['user_id']
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
      user: users[req.cookies.user_id]
    }
    res.status(400).render('error', templateVars)
  }
    
  let templateVars = { 
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL].longURL,
    userID: req.cookies['user_id'],
    user: users[req.cookies['user_id']]
      }

  res.render('urls_show', templateVars)
  
})

app.get('/u/:shortURL', (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL
  res.redirect(longURL)
})

app.get('/register', (req, res) => {
  const templateVars = {
    users,
    user: users[req.cookies['user_id']]
  }
  res.render('register', templateVars)
})

app.get('/login', (req, res) => {
  const templateVars = {
    users,
    user: users[req.cookies['user_id']]
  }
  res.render('login', templateVars)
})

app.post('/urls', (req, res) => {
  const shortURL = generateRandomString()
  const longURL = req.body.longURL
  urlDatabase[shortURL] = {
    longURL: longURL,
    userID: req.cookies.user_id
  }
  res.redirect(`/urls/:${shortURL}`)
})

app.post('/urls/:shortURL/delete', (req, res) => {
  const userURLs = urlsForUser(req.cookies.user_id, urlDatabase)
  if (Object.keys(userURLs).includes(req.params.id)) {
    const shortURL = req.params.shortURL
    delete urlDatabase[shortURL]
    res.redirect('/urls')
  } else {
      let templateVars = {
        error: "Only the owner can edit this URL",
        user: users[req.cookies.user_id]
    }
      res.status(400).render('error', templateVars)
  }
})

app.post('/urls/:id', (req, res) => {
  const userURLs = urlsForUser(req.cookies.user_id, urlDatabase)
  if (Object.keys(userURLs).includes(req.params.id)) {
    const shortURL = req.params.id
    urlDatabase[shortURL].longURL = req.body.newURL
    res.redirect('/urls')
  } else {
      let templateVars = {
        error: "Only the owner can edit this URL",
        user: users[req.cookies.user_id]
      }
      res.status(400).render('error', templateVars)
    }
})

app.post('/login', (req, res) => {
  const email = req.body.email
  const password = req.body.password

  if(email === "" || email === "") {
    res.status(400).send('Email and password cannot be blank')
  } else if(emailExists(email) === false) {
      res.status(403).send('No account associated with that email found')
  } else {
      const user = emailExists(email)
      if(user.password !== password) {
        res.status(403).send('Incorrect Password')
      } else {
          res.cookie('user_id', user.user_id)
          res.redirect('/urls')
      }  
  }



  // res.redirect('/urls')
})

app.post('/logout', (req, res) => {
  res.clearCookie('user_id')
  res.redirect('/urls')
})

app.post('/register', (req,res) => {
  const email = req.body.email

  if(email === "" || email === "") {
    res.status(400).send('Email and password cannot be blank')
  } else if(emailExists(email)) {
    res.status(400).send('Email already exists')
  } else {
    newUser = generateRandomString()
    users[newUser] = {
      user_id: newUser,
      email: req.body.email,
      password: req.body.password
    }
      res.cookie('user_id', newUser)
      res.redirect('/urls')
  }
  console.log(users)
})


app.listen(PORT, () => {
  console.log(`Tiny app listening on port ${PORT}!`);
});