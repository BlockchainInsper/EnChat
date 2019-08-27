var crypto = require("crypto")

const sign = crypto.createSign('SHA256');
const verify = crypto.createVerify('SHA256');

var masterKey = ""

async function saveUserAndPubKey(user, pub) {

  return new Promise(function (resolve, reject) {
    
    

    let randomBytes = crypto.randomBytes(20).toString('hex');


    if (user != undefined && pub != undefined) {

      global.conn.collection("users").findOne({
        "user": user
      }).then((resp_user) => {


        if (resp_user == null) {
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



    console.log({user, signature});
    
    if (user != undefined && signature != undefined) {

      global.conn.collection("users").findOne({
        "user": user
      }).then((resp_user) => {
        let user = resp_user


        if (user != null) {

          const verify = crypto.createVerify('SHA256'); //TODO: initializate in a better way
          
          verify.update(user.randomMem);
          verify.end();

          console.log(user);
          


          if (verify.verify(user.pubKey, signature, 'hex')) {
            global.conn.collection("users").update({
              "user": user.user
            }, { $set: { "randomMem": "", "confirmated" : true } }, { upsert: true 
            }).then(data => {
              if (data.result.nModified){
                resolve({
                  "status": "success",
                  "data": "confirmed"
                })
              } else {
                resolve({
                  "status": "error",
                  "data": "unknown"
                })
              }
              
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
        console.log(err);
        
        resolve({
          "status": "error",
          "data": err
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
      global.conn.collection("users").find({}).limit(100).toArray(function(err, result) {
        if (err) throw err;

        console.log(result);
        

        users = []
        for (let i in result){
          
          users.push({"user":result[i].user, "publicKey":result[i].pubKey})

        }
        
        resolve({
          "status": "success",
          "data": users
        })
        
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

    if (masterKey != "" && masterKey == mKey) {
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

    if (masterKey == "") {
      masterKey = crypto.randomBytes(20).toString('hex');
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