var express = require('express');
var router = express.Router();
var users = require('../resources/users_db')

/* GET users listing. */
router.post('/create', function (req, res, next) {
  let {username, publicKey} = req.body
  publicKey = publicKey.replace(/\\n/g,"\n") //TODO: find new way without RegEx
  usernameValue = req.body.username;
  
  users.saveUserAndPubKey(username, publicKey).then((resp) => {

    if (resp.status == 'success') {
      console.log(resp.data);
      console.log(resp.data.randomMsg);
      
      
      res.render('authentication', {randomVar: resp.data.randomMsg, usernameValue})
    } else {
      res.render('fail')
    }

  
  }).catch((err) => console.log(err))
});

router.post('/confirm', function (req, res, next) {
  let {username, signature} = req.body
  users.confirmKey(username, signature).then((resp) => {

    if (resp.status == 'success') {
      res.render('chat')
    } else {
      res.render('fail')
    }
    


  }).catch((err) => console.log(err))
});

router.post('/generate', function (req, res, next) {
  let {masterKey} = req.body
  users.getMasterKey().then((resp) => console.log(resp)).catch((err) => console.log(err))
  users.genUserKey(masterKey).then((resp) => res.send(resp)).catch((err) => console.log(err))
});


router.get('/create', function (req, res, next) {
  res.render('index')
});

router.get('/list', function (req, res, next) {
  let {user} = req.body
  users.listUsers(user).then((resp) => res.send(resp)).catch((err) => console.log(err))
});

module.exports = router;
