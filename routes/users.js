var express = require('express');
var router = express.Router();
var users = require('../resources/users_db')

/* GET users listing. */
router.post('/create', function (req, res, next) {
  let {username, publickkey} = req.body
  users.saveUserAndPubKey(username, publickkey).then((resp) => res.send(resp)).catch((err) => console.log(err))
});

router.post('/confirm', function (req, res, next) {
  let {username, signature} = req.body
  users.confirmKey(username, signature).then((resp) => res.send(resp)).catch((err) => console.log(err))
});

router.post('/generate', function (req, res, next) {
  let {masterKey} = req.body
  users.getMasterKey().then((resp) => console.log(resp)).catch((err) => console.log(err))
  users.genUserKey(masterKey).then((resp) => res.send(resp)).catch((err) => console.log(err))
});


router.get('/', function (req, res, next) {
  res.send("pls, send data")
});

router.get('/list', function (req, res, next) {
  let {user} = req.body
  users.listUsers(user).then((resp) => res.send(resp)).catch((err) => console.log(err))
});

module.exports = router;
