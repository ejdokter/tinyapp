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

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = { 
  "userRandomID": {
    user_id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
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
   const templateVars = { 
     urls: urlDatabase, 
     user: users[req.cookies['user_id']] 
    }
   res.render('urls_index', templateVars)
})

app.get('/urls/new', (req, res) => {
  const templateVars = {
    user: users[req.cookies['user_id']]
  }
  res.render('urls_new', templateVars)
})

app.get('/urls/:shortURL', (req, res) => {
   const templateVars = { 
     shortURL: req.params.shortURL, 
     longURL: urlDatabase[req.params.shortURL],
     user: users[req.cookies['user_id']]
    }
   const longURL = templateVars.longURL
   res.render('urls_show', templateVars)
 })

app.get('/u/:shortURL', (req, res) => {
  const longURL = urlDatabase[req.params.shortURL]
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
  const newURL = generateRandomString()
  urlDatabase[newURL] = req.body.longURL

  res.redirect(`/urls/:${newURL}`)
})

app.post('/urls/:shortURL/delete', (req, res) => {
  const shortURL = req.params.shortURL
  delete urlDatabase[shortURL]
  res.redirect('/urls')
})

app.post('/urls/:id', (req, res) => {
  const shortURL = req.params.id
  urlDatabase[shortURL] = req.body.newURL
  res.redirect('/urls')
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