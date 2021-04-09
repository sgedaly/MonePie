require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
var schedule = require('node-schedule');
const { Expo } = require('expo-server-sdk');
const port = process.env.PORT || 3000;

var admin = require("firebase-admin");

var serviceAccount = require("./serviceAccountKey.json");

//Plaid Variables
var util = require('util');
var envvar = require('envvar');
const plaid = require('plaid');
//Stripe
//const ssecret_key = "sk_live_VteEQVuL6vcTXdXl8M2MymPW";
//const stripe = require('stripe')(ssecret_key);
//Plaid
var PLAID_CLIENT_ID = envvar.string('PLAID_CLIENT_ID');
var PLAID_SECRET = envvar.string('PLAID_SECRET');
var PLAID_PUBLIC_KEY = envvar.string('PLAID_PUBLIC_KEY');
var PLAID_ENV = envvar.string('PLAID_ENV', 'sandbox');
//var PLAID_PRODUCTS = envvar.string('PLAID_PRODUCTS', ['auth', 'identity']);//not used
//Green
const green_client = "111928";
const green_pass = "dm2hr6jz2d";
const CheckGateway = require('./Green');
var gateway = new CheckGateway(green_client, green_pass, false);
//Initialize
//PLAID_ENV = 'sandbox';
//Initialize Plaid Client

// We store the access_token in memory - in production, store it in a secure
// persistent data store
var ACCESS_TOKEN = null;
var PUBLIC_TOKEN = null;
var ITEM_ID = null;

var plaidClient = new plaid.Client(
  PLAID_CLIENT_ID,
  PLAID_SECRET,
  PLAID_PUBLIC_KEY,
  // PLAID_PRODUCTS,
  // PLAID_COUNTRY_CODES,
  plaid.environments[PLAID_ENV],
  { version: '2019-05-29', clientApp: 'MoneyPie' }
);

var app = express();
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(bodyParser.json());
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://thesavinggame-423a9.firebaseio.com"
});
const db = admin.firestore();
const settings = {/* your settings... */ timestampsInSnapshots: true };
db.settings(settings);
// APP_PORT=3000 \
// PLAID_CLIENT_ID=5bdf645944fc260011e05a6a \
// PLAID_SECRET=78461f7d9f56be7ccc05c3b629556d \
// PLAID_PUBLIC_KEY=5043d945a5b10260976e0c0ceef740 \
// PLAID_PRODUCTS=auth \
// PLAID_COUNTRY_CODES=US \
// PLAID_ENV=development \
// nodemon server.js

var prettyPrintResponse = response => {
  console.log(util.inspect(response, { colors: true, depth: 4 }));
};
//Exchange Token
app.post('/tokenExchange', function (req, res, next) {
  //Get Variables from Front End (mbifn create vars)
  console.log(req.body);
  PUBLIC_TOKEN = req.body.public_token;
  const accountID = req.body.account_id;//.toString();//u96
  const bankName = req.body.institution;
  const user = req.body.user;//u137
  //Variables to be set later
  var bankAccountToken = null;//Source Token for Stripe s98u140
  var stripeID = null;//Token for Stripe Client s128u141
  var accessToken = null;//Plaid access Token s82u96
  //var clientID = null;//Plaid Client ID usuu
  //var itemID = null;//Plaid Item ID (mbu) s83uu
  var bankingInfo = {};
  //Exchange Token through Plaid
  plaidClient.exchangePublicToken(PUBLIC_TOKEN)//request the token
    .then((response) => {//If plaidClient created successfully
      console.log("Inside exPubToken resp: " + response);
      ACCESS_TOKEN = response.access_token;
      ITEM_ID = response.item_id;
      prettyPrintResponse(response);
      db.collection('Users').doc(user).update({
        plaidInfo: {
          accessToken: ACCESS_TOKEN,
          itemID: ITEM_ID
        }
      }).catch((error) => {
        res.status(404)
        res.json({
          error: error
        });
      })
      res.json({
        access_token: ACCESS_TOKEN,
        item_id: ITEM_ID,
        error: null,
      });
    })
    .catch((error) => {//If create plaidClient error
      prettyPrintResponse(error);
      res.status(404)
      res.json({
        error: error
      });
    })
});

app.post('/plaidAuth', async function (req, res, next) {
  console.log("Auth: " + req.body.user)
  db.collection('Users').doc(req.body.user).get().then(async (doc) => {
    accessToken = doc.data()['plaidInfo'].accessToken;
    last4 = doc.data()['bankAccount'].last4;
    bankName = doc.data()['bankAccount'].bank;
    await plaidClient.getAuth(accessToken, {}).then(async (response) => {
      prettyPrintResponse(response);
      if (response.numbers.ach.length > 0) {
        var j = 0;
        var k = 0;
        for (var i = 0; i < response.numbers.ach.length; i++) {
          if (response.numbers.ach[i]['account'].substring(response.numbers.ach.length - 4, response.numbers.ach.length) == last4) {
            j = i;
          }
        }
        for (var i = 0; i < response.accounts.length; i++) {
          if (response.accounts[i].mask == last4) {
            k = i;
          }
        }
        var bankingInfo = {};
        bankingInfo["account"] = response.numbers.ach[j]["account"];
        bankingInfo["routing"] = response.numbers.ach[j]["routing"];
        bankingInfo["accountID"] = response.numbers.ach[j]["account_id"];
        bankingInfo["bankname"] = bankName;
        var balanceEnough = response.accounts[k].balances.available > parseFloat(req.body.amount);
        if (!balanceEnough && req.body.option == 'pay') {
          res.status(300) //status 300 balance not enough
          return res.json({
            error: 'error'
          });
        }
      } else {
        res.status(404)
        return res.json({
          error: 'error'
        });
      }
      console.log("Get identity: " + accessToken)
      await plaidClient.getIdentity(accessToken).then(async (response) => {
        var j = 0;
        for (var i = 0; i < response.accounts.length; i++) {
          if (response.accounts[i].account_id == bankingInfo["accountID"]) {
            j = i;
          }
        }
        bankingInfo["name"] = response.accounts[j].owners[0].names[0];
        bankingInfo["phone"] = response.accounts[j].owners[0].phone_numbers[0].data;
        bankingInfo["email"] = response.accounts[j].owners[0].emails[0].data;
        bankingInfo["address1"] = response.accounts[j].owners[0].addresses[0].data.street;
        bankingInfo["city"] = response.accounts[j].owners[0].addresses[0].data.city;
        bankingInfo["state"] = response.accounts[j].owners[0].addresses[0].data.region;
        bankingInfo["zip"] = response.accounts[j].owners[0].addresses[0].data.postal_code;
        bankingInfo["country"] = response.accounts[j].owners[0].addresses[0].data.country;
        //prettyPrintResponse(bankingInfo);
        if (req.body.option == 'pay') {
          try {
            console.log("Game Pay")
            var now = new Date();
            await gateway.singleCheck(
              bankingInfo.name,
              bankingInfo.email,
              bankingInfo.phone,
              null,
              bankingInfo.address1,
              null,
              bankingInfo.city,
              bankingInfo.state,
              bankingInfo.zip,
              bankingInfo.country,
              bankingInfo.routing,
              bankingInfo.account,
              bankingInfo.bankname,
              "Saving " + req.body.amount + " for game",
              req.body.amount,
              (now.getMonth() + 1) + "/" + now.getDate() + "/" + now.getFullYear()).then(resp => {
                var resps = resp.split(",");
                console.log('resps')
                prettyPrintResponse(resps);
                if (resps[0] == "0") {
                  res.status(200)
                  return res.json({
                    CheckNumber: resps[4],
                    Check_ID: resps[5]
                  });
                } else {
                  res.status(404)
                  return res.json({
                    error: 'error'
                  });
                }
              })
          } catch (err) {
            res.status(404)
            console.log('error: ' + err);
            return res.json({
              error: JSON.stringify(err),
            });
          }
        } else if (req.body.option == 'withdraw') {
          console.log("Withdraw")
          var now = new Date();
          await gateway.singleBillpay(
            bankingInfo.name,
            bankingInfo.address1,
            '',
            bankingInfo.city,
            bankingInfo.state,
            bankingInfo.zip,
            bankingInfo.country,
            bankingInfo.routing,
            bankingInfo.account,
            bankingInfo.bankname,
            "Cashing out " + req.body.amount + " from wallet",
            req.body.amount,
            (now.getMonth() + 1) + "/" + now.getDate() + "/" + now.getFullYear(),
          ).then(resp => {
            var resps = resp.split(",");
            console.log('resps')
            prettyPrintResponse(resp);
            console.log(resps[0])
            if (resps[0] == "0") {
              res.status(200)
              return res.json({
                CheckNumber: "",//resps[4],
                Check_ID: ""//resps[5]
              });
            } else {
              res.status(404)
              return res.json({
                error: 'error'
              });
            }
          }).catch((err) => {
            res.status(404)
            return res.json({
              error: err
            });
          })
        }
      }).catch((err) => {
        prettyPrintResponse(err);
        res.status(404)
        return res.json({
          error: err
        });
      })
    }).catch((error) => {
      prettyPrintResponse(error);
      res.status(404)
      return res.json({
        error: error,
      });
    })
  })
    .catch((err) => {
      console.log(err);
      res.status(404)
      return res.json({
        error: err
      });
    });
})

var loserPushTokens = [];
var winnerPushTokens = [];
var now = new Date();
hour = now.getHours();
minute = now.getMinutes();
second = now.getSeconds();
//var schObj = [{hour: hour, minute: minute, second: (second+1)%60}, {hour: hour, minute: minute, second: (second+6)%60}, {hour: hour, minute: minute, second: (second+11)%60}];
var schObj = [{ hour: 0, minute: 0, second: 1 }, { hour: 0, minute: 0, second: 6 }, { hour: 0, minute: 0, second: 11 }];
var j = schedule.scheduleJob(schObj[0], function () {
  console.log('The answer to life, the universe, and everything!');
  db.collection('Games').where("isActive", "==", true).get().then(function (snapshot) {
    snapshot.forEach(function (doc) {
      let id = doc.id
      check = doc.data()['dailyUserPaymentCheck']
      activeUsers = doc.data()['activeUsers']
      startDate = doc.data()['startingDate'].toDate();
      amountToSave = doc.data()['amountToSave'];
      contribution = doc.data()['periodicalContribution'];
      _window = doc.data()['paymentPeriodWindow'];
      risk = doc.data()['risk'];
      currentDate = new Date();
      fromStart = currentDate - startDate;
      fromStart = Math.floor(fromStart / 1000 / 60 / 60 / 24);
      doCheck = fromStart % _window == 0;
      inactiveUsers = activeUsers.filter(x => !check.includes(x));
      console.log(id + ": " + inactiveUsers)
      if (doCheck) {
        db.collection('Games').doc(id).update({
          activeUsers: check,
          inactiveUsers: inactiveUsers,
          dailyUserPaymentCheck: [],
          joinable: false
        }).then(function () {
          console.log("Document successfully updated!");
        })
          .catch(function (error) {
            console.error("Error updating document: ", error);
          });
        totalPot = doc.data()['totalPot'];
        rewardPot = doc.data()['rewardPot'];
        for (i in inactiveUsers) {//ELIMINATING USERS THAT DIDN'T PAY
          //DO ALL LOGIC OF GIVING BACK THE RIGHT AMOUNT OF MONEY TO THE USER BY PUTING THE MONEY IN THEIR GAME WALLET BY UPDATING THE "accountBalance" VARIABLE, AND ALSO UPDATING THE "totalPot" in Game. DEPENDING ON THE RISK AND AMOUNT CONTRIBUTED
          //LOGIC TO UPDATE THE STATS VARIABLES OF USER
          db.collection('Users').doc(inactiveUsers[i]).get().then(function (doc) {
            currentAmountSaved = doc.data()['activeGames'][id]
            devolution = currentAmountSaved * (1 - risk);
            totalPot = totalPot - devolution;
            rewardPot = rewardPot + devolution;
            accountBalance = doc.data()['accountBalance'] + devolution;
            historicalSavings = doc.data()['historicalSavings'] + devolution;
            moneyInPlay = doc.data()['moneyInPlay'] - currentAmountSaved
            monthlySavings = doc.data()['monthlySavings'] + devolution
            ref = db.collection('Users').doc(doc.id)
            now = new Date();
            ref.update({//Send money to winners and update user variables
              pastGames: admin.firestore.FieldValue.arrayUnion({ id: id, saved: devolution, endDate: new Date() }),
              accountBalance: accountBalance,
              historicalSavings: historicalSavings,
              moneyInPlay: moneyInPlay,
              monthlySavings: monthlySavings,
              transactions: admin.firestore.FieldValue.arrayUnion({
                amount: devolution,
                bankAccount: "MoneyPie Virtual Wallet",
                date: (now.getMonth() + 1) + "/" + now.getDate() + "/" + now.getFullYear(),
                type: 'Game Finished, Goal not Achieved',
                key: Math.random()
              })
            })
            var update = {}
            update['activeGames.' + id] = admin.firestore.FieldValue.delete()
            ref.update(update)
            ///
            loserPushTokens.push({ "token": doc.data()['notificationsToken'], "pctg": (1 - risk) * 100 })
            console.log(loserPushTokens)
          }).then(function () {
            console.log("Total Pot 1: " + totalPot)
            db.collection('Games').doc(id).update({
              totalPot: totalPot,
              rewardPot: rewardPot
            }).then(function () {
              console.log("Document successfully updated!");
            })
              .catch(function (error) {
                console.error("Error updating document: ", error);
              });
          })
            .catch(function (error) {
              console.error("Error updating document: ", error);
            });
        }
      }
    });///////TEST ALL THIS////////TODO: CREATE GAMES FOR NEXT DAY
  })
});

var i = schedule.scheduleJob(schObj[1], function () {
  db.collection('Games').where("isActive", "==", true).get().then(function (snapshot) {
    snapshot.forEach(function (doc) {
      id = doc.id
      endingDate = doc.data()['endingDate'].toDate()
      currDate = new Date()
      currDate.setHours(currDate.getHours() - 5)
      var winners = doc.data()['activeUsers']
      //console.log('first: ' + winners)
      userSteak = doc.data()['totalPot'] / winners.length
      console.log("userSteak1: " + userSteak)
      aTS = doc.data()['amountToSave'];
      if (currDate.getFullYear() == endingDate.getFullYear() && currDate.getMonth() == endingDate.getMonth() && currDate.getDate() == endingDate.getDate()) {
        //DONE: PUT THE GAME INTO PASTGAMES VARIABLE IN USER AND DELETE GAME FROM ACTIVEGAMES VARIABLE IN USER
        db.collection('Games').doc(id).update({
          isActive: false,
        }).then(function () {
          console.log('second: ' + winners)
          for (i in winners) {
            console.log(winners[i]);
            db.collection('Users').doc(winners[i]).get().then(function (doc) {
              console.log("account balance: " + doc.data()['accountBalance']);
              console.log("userSteak2: " + userSteak)
              accountBalance = doc.data()['accountBalance'] + userSteak;
              historicalSavings = doc.data()['historicalSavings'] + userSteak;
              moneyInPlay = doc.data()['moneyInPlay'] - aTS;
              monthlySavings = doc.data()['monthlySavings'] + userSteak;
              console.log(accountBalance);
              ref = db.collection('Users').doc(doc.id)
              now = new Date();
              ref.update({
                pastGames: admin.firestore.FieldValue.arrayUnion({ id: id, saved: userSteak, endDate: new Date() }),
                accountBalance: accountBalance,
                historicalSavings: historicalSavings,
                moneyInPlay: moneyInPlay,
                monthlySavings: monthlySavings,
                transactions: admin.firestore.FieldValue.arrayUnion({
                  amount: userSteak,
                  bankAccount: "MoneyPie Virtual Wallet",
                  date: (now.getMonth() + 1) + "/" + now.getDate() + "/" + now.getFullYear(),
                  type: 'Game Finished, Goal Achieved',
                  key: Math.random()
                })
              })
              var update = {}
              update['activeGames.' + id] = admin.firestore.FieldValue.delete()
              ref.update(update)
              winnerPushTokens.push(doc.data()['notificationsToken'])
            })
          }
        })
          .catch(function (error) {
            console.error("Error updating document: ", error);
          });
      }
    });
  })
})

var i = schedule.scheduleJob(schObj[2], function () {
  let messages = [];
  console.log(loserPushTokens)
  for (let pushToken of loserPushTokens) {
    // Each push token looks like ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]
    console.log("inside loser for loop");
    console.log(pushToken);
    // Check that all your push tokens appear to be valid Expo push tokens
    if (!Expo.isExpoPushToken(pushToken["token"])) {
      console.error(`Push token ${pushToken} is not a valid Expo push token`);
      continue;
    }
    // Construct a message (see https://docs.expo.io/versions/latest/guides/push-notifications.html)
    messages.push({
      to: pushToken["token"],
      sound: 'default',
      title: 'Game Lost',
      body: 'Oops. It seams you forgot to pay. ' + pushToken["pctg"] + '% of what you have saved is waiting in your wallet. Try again by joining a new game!',
    })
  }
  for (let pushToken of winnerPushTokens) {
    // Each push token looks like ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]
    console.log("inside winner for loop");
    console.log(pushToken);
    // Check that all your push tokens appear to be valid Expo push tokens
    if (!Expo.isExpoPushToken(pushToken)) {
      console.error(`Push token ${pushToken} is not a valid Expo push token`);
      continue;
    }

    // Construct a message (see https://docs.expo.io/versions/latest/guides/push-notifications.html)
    messages.push({
      to: pushToken,
      sound: 'default',
      title: 'You Won!',
      body: 'Congratulations! You have made it all the way through. Your money is waiting in your wallet.',
    })
  }
  let expo = new Expo();
  // The Expo push notification service accepts batches of notifications so
  // that you don't need to send 1000 requests to send 1000 notifications. We
  // recommend you batch your notifications to reduce the number of requests
  // and to compress them (notifications with similar content will get
  // compressed).
  let chunks = expo.chunkPushNotifications(messages);
  let tickets = [];
  (async () => {
    // Send the chunks to the Expo push notification service. There are
    // different strategies you could use. A simple one is to send one chunk at a
    // time, which nicely spreads the load out over time:
    for (let chunk of chunks) {
      try {
        let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        console.log(ticketChunk);
        tickets.push(...ticketChunk);
        // NOTE: If a ticket contains an error code in ticket.details.error, you
        // must handle it appropriately. The error codes are listed in the Expo
        // documentation:
        // https://docs.expo.io/versions/latest/guides/push-notifications#response-format
      } catch (error) {
        console.error(error);
      }
    }
  })();
  loserPushTokens = [];
  winnerPushTokens = [];
})

app.get('/resetDatabase', function (req, res) {
  db.collection('Users').where("avgGameAmount", "==", null).get().then(function (snapshot) {
    snapshot.forEach(function (doc) {
      ref = db.collection('Users').doc(doc.id)
      ref.update({
        accountBalance: 0.00,
        activeGames: [],
        historicalSavings: 0.00,
        moneyInPlay: 0.00,
        monthlySavings: 0.00,
        pastGames: [],
        transactions: []
      })
    })
  })
  res.send(
    {
      message: 'Hello from server!!',
    });
});

//app.use(bodyParser.urlencoded({ extended: false }));
app.get('/createGame', function (req, res) {
  console.log('hello');
  emojis = ['dollar', 'heavy_dollar_sign', 'credit_card', 'money_with_wings', 'moneybag', 'money_mouth_face']
  var endDate = new Date("2019-06-26T05:00:00Z");
  var startDate = new Date("2019-06-23T05:00:00Z");
  var joinBy = new Date("2019-06-24T05:00:00Z");
  var min = 0;
  var max = 5;
  var random = Math.floor(Math.random() * (+max - +min)) + +min;
  db.collection('Games').doc().set({
    activeUsers: [],
    amountToSave: 3,
    dailyUserPaymentCheck: [],
    emoji: emojis[random],
    endingDate: endDate,
    joinBy: joinBy,
    gameName: 'Test Game',
    inactiveUsers: [],
    isActive: true,
    joinable: true,
    paymentPeriodWindow: 1,
    periodicalContribution: 1,
    risk: 0.5,
    startingDate: startDate,
    usersInPlay: [],
    totalPot: 0,
    wdUsers: [],
    rewardPot: 0
  }).then(e => '');
  res.send(
    {
      message: 'Hello from server!!',
    });
});

app.get('/testNotification', function (req, res) {
  let somePushTokens = ["ExponentPushToken[l_U3WcEcShxfzcbvQD9_Tq]"];
  let expo = new Expo();
  let messages = [];
  for (let pushToken of somePushTokens) {
    // Each push token looks like ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]

    // Check that all your push tokens appear to be valid Expo push tokens
    if (!Expo.isExpoPushToken(pushToken)) {
      console.error(`Push token ${pushToken} is not a valid Expo push token`);
      continue;
    }

    // Construct a message (see https://docs.expo.io/versions/latest/guides/push-notifications.html)
    messages.push({
      to: pushToken,
      sound: 'default',
      title: 'Test',
      body: 'This is a test.',
    })
  }

  // The Expo push notification service accepts batches of notifications so
  // that you don't need to send 1000 requests to send 1000 notifications. We
  // recommend you batch your notifications to reduce the number of requests
  // and to compress them (notifications with similar content will get
  // compressed).
  let chunks = expo.chunkPushNotifications(messages);
  let tickets = [];
  (async () => {
    // Send the chunks to the Expo push notification service. There are
    // different strategies you could use. A simple one is to send one chunk at a
    // time, which nicely spreads the load out over time:
    for (let chunk of chunks) {
      try {
        let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        console.log(ticketChunk);
        tickets.push(...ticketChunk);
        // NOTE: If a ticket contains an error code in ticket.details.error, you
        // must handle it appropriately. The error codes are listed in the Expo
        // documentation:
        // https://docs.expo.io/versions/latest/guides/push-notifications#response-format
      } catch (error) {
        console.error(error);
      }
    }
  })();

  res.send(
    {
      message: 'Hello from server!!',
    });
})

app.listen(port, function () {
  console.log('Server started!');
});

var prettyPrintResponse = response => {
  console.log(util.inspect(response, { colors: true, depth: 4 }));
};
