const express = require("express");
const app = express();
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')

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

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

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
   const templateVars = { urls: urlDatabase, username: req.cookies['username'] }
   res.render('urls_index', templateVars)
})

app.get('/urls/new', (req, res) => {
  res.render('urls_new')
})

app.get('/urls/:shortURL', (req, res) => {
   const templateVars = { 
     shortURL: req.params.shortURL, 
     longURL: urlDatabase[req.params.shortURL],
     username: req.cookies['username']
    }
   const longURL = templateVars.longURL
   res.render('urls_show', templateVars)
 })

app.get('/u/:shortURL', (req, res) => {
  const longURL = urlDatabase[req.params.shortURL]
  res.redirect(longURL)
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

<<<<<<< HEAD
=======
app.post('/login', (req, res) => {
  let username = req.body.username
  res.cookie('username', username)
  res.redirect('/urls')
})

app.post('/logout', (req, res) => {
  res.clearCookie('username')
  res.redirect('/urls')
})

>>>>>>> feature/cookies


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});