const path = require('path')
const express = require('express')
const morgan = require('morgan')
const helmet = require('helmet')
const yup = require('yup')
const monk = require('monk')
const rateLimit = require('express-rate-limit')
const slowDown = require('express-slow-down')
const { nanoid } = require('nanoid')
const shortid = require('shortid')
var bodyParser = require('body-parser')

//fb
var admin = require('firebase-admin')

var serviceAccount = require('./serviceAccountKey.json')

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://tictactoe-230f0.firebaseio.com'
})

const db = admin.firestore()
//fb end
const app = express()

app.use(bodyParser.urlencoded({ extended: false }))

app.use(express.static('./public'))

app.get('/', async (req, res, next) => {
  console.log(req.params)

  res.sendFile('./index.html')
})

app.post('/submitUrl', async (req, res, next) => {
  // console.log(req.body.url);
  console.log(req);
  //   res.sendFile('./index.html');
  const DOC_NAME = shortid.generate()
  const docRef = db.collection('URL_DATAS').doc(DOC_NAME)
  await docRef.set({
    url: req.body.url,
    date: new Date()
  })
  let url = req.protocol + '://' + req.get('host') + req.originalUrl
  url = url.replace('submitUrl', '')
  res.send(
    '<strong>' +
      req.body.url +
      '</strong> Submitted Successfully!\n' +
      "<h3>Your new URL is <a href='" +
      url +
      DOC_NAME +
      "'>" +
      url +
      DOC_NAME +
      '</a>'
  )
})

app.get('/:url', async (req, res, next) => {
  let url = req.params.url

  const ref = db.collection('URL_DATAS').doc(url)

  ref
    .get()
    .then(doc => {
      // console.log(doc.empty);

      
      if (!doc.exists || doc.empty) {
        // console.log("here");
        
  res.sendFile(__dirname + '/public/not_found.html');

      } else {
        // console.log(url + 'mapped to -> ' + doc.data().url)
        res.redirect(doc.data().url)
      }
    })
   
})

const port = process.env.PORT || 4433
app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`)
})
