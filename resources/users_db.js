var crypto = require("crypto")

const sign = crypto.createSign('SHA256');
const verify = crypto.createVerify('SHA256');

var masteKey = ""

async function saveUserAndPubKey(user, pub) {
  ` accepted

    -----BEGIN PRIVATE KEY-----
    MH4CAQAwEAYHKoZIzj0CAQYFK4EEAAMEZzBlAgEBBB4PSuLa52aZefrQKb1hdVkp
    p/UFQEa2xwMFbWTg1HShQAM+AARZ3TSstpTxGVabC8WMn02d+e5D7VnfxERI1iwM
    GrB5bmDqh1nlPO8jJl33/ynvszf/V3+L1b69wj1OJn8=
    -----END PRIVATE KEY-----

    -----BEGIN PUBLIC KEY-----
    MFIwEAYHKoZIzj0CAQYFK4EEAAMDPgAEWd00rLaU8RlWmwvFjJ9NnfnuQ+1Z38RE
    SNYsDBqweW5g6odZ5TzvIyZd9/8p77M3/1d/i9W+vcI9TiZ/
    -----END PUBLIC KEY-----`


  return new Promise(function (resolve, reject) {

    let randomBytes = crypto.randomBytes(20).toString('hex');


    if (user != undefined && pub != undefined) {

      global.conn.collection("users").findOne({
        "user": user
      }).then((resp_user) => {
        let user = resp_user


        if (user == null) {
          global.conn.collection("users").insertOne({
            "user": user,
            "pubKey": pub,
            "confirmated": false,
            "randomMem": randomBytes
          })
          resolve({
            "status": "success",
            "data": "NEEDCONFIRMATION"
          })

        } else {
          resolve({
            "status": "error",
            "data": "USEREXIST"
          })
        }


      }).catch((err => {
        resolve({
          "status": "error",
          "data": "REGISTRATIONEEDED"
        })

      }))


    } else {
      reject({
        "status": "fail",
        "data": "MISSINGEUSERORPUBKEY"
      })
    }

  })
}

async function confirmKey(user, signature) {

  return new Promise(function (resolve, reject) {




    if (user != undefined && signature != undefined) {

      global.conn.collection("users").findOne({
        "user": user
      }).then((resp_user) => {
        let user = resp_user


        if (user != null) {



          verify.update(user.randomMem);
          verify.end();


          sign.write(user.randomMem);
          sign.end();
          let signature = sign.sign(privateKey, 'hex');

          if (verify.verify(user.pub, signature, 'hex')) {
            global.conn.collection("users").update({
              "user": user
            }, {
              $set: {
                "confirmated": true
              }
            })
            resolve({
              "status": "esuccess",
              "data": "confirmed"
            })
          } else {
            let randomBytes = crypto.randomBytes(20).toString('hex');
            global.conn.collection("users").update({
              "user": user
            }, {
              $set: {
                "randomMem": randomBytes
              }
            })
            resolve({
              "status": "error",
              "data": {
                "code": "WRONGCONFIMATION",
                "expected": signature
              }
            })
          }







        } else {
          resolve({
            "status": "error",
            "data": "REGISTRATIONEEDED"
          })
        }


      }).catch((err => {
        resolve({
          "status": "error",
          "data": "REGISTRATIONEEDED"
        })

      }))


    } else {
      reject({
        "status": "fail",
        "data": "MISSINGEUSERORsignature"
      })
    }

  })
}

async function listUsers(user) {

  return new Promise(function (resolve, reject) {
    if (user!= undefined){
      global.conn.collection("users").findOne({
        "user": user
      }).then((resp_user) => {
        resolve({
          "user": resp_user.user,
          "data": resp_user.pubKey
        })
      })
    } else {
      global.conn.collection("users").find().limit(100).toArray(function(err, result) {
        if (err) throw err;
        users = []
        for (let i in result ){
          users.push({"user":i.user, "publicKey":i.pubKey})
        }
        resolve({
          "status": "esuccess",
          "data": users
        })
        db.close();
      })
    }
    



  })
}

async function genUserKey(mKey) {

  return new Promise(function (resolve, reject) {
    let {
      privateKey,
      publicKey
    } = crypto.generateKeyPairSync('ec', {
      namedCurve: 'secp256k1',
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem'
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem'
      }
    });

    if (masteKey != "" && masteKey == mKey) {
      resolve({
        "status": "success",
        "data": {
          privateKey,
          publicKey
        }
      })
    } else {
      resolve({
        "status": "error",
        "data": "WRONGMASTERORNEEDGEN"
      })
    }



  })
}

async function getMasterKey() {

  return new Promise(function (resolve, reject) {

    if (masteKey == "") {
      masteKey = crypto.randomBytes(20).toString('hex');
      console.log(masterKey);
      resolve({
        "status": "success",
        "data": "GENERATEDSEELOG"
      })
    } else {
      console.log(masterKey);
      resolve({
        "status": "success",
        "data": "SEELOG"
      })
    }



  })
}

module.exports = {
  saveUserAndPubKey,
  confirmKey,
  genUserKey,
  getMasterKey,
  listUsers
};