const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp(functions.config().firebase);

var msgData;

exports.gamesTrigger = functions.firestore.document(
    'games/{gamesId}'
    ).onCreate((snapshot, context) => {
        msgData = snapshot.data();
        admin.firestore().collection('player').get().then((snapshots => {
            var tokens = [];
            var receiverID = msgData.receiverID;
			console.log(receiverID);
			for(var player of snapshots.docs){
				if(player.id == receiverID){
				tokens.push(player.data().pushID);
				}
			}
			console.log(tokens);
            var payload = {
                notification: {
                    title: "Game invite",
                    body: msgData.name + " invites you to play",
                    sound: "default"
                },
                data: {
                    senderName: msgData.name,
                    senderNumber: msgData.senderNumber,
                    gameID: msgData.senderID,
					click_action: "FLUTTER_NOTIFICATION_CLICK"
                }
            };
			var options = {
				priority: "high",
				timeToLive: 60 * 60 * 24
			};
            admin.messaging().sendToDevice(tokens, payload, options).then((response) => {
                console.log('Invite Sent');
            }).catch((err) =>{
                console.log(err);
            })

        })).catch((err) =>{
                console.log(err);
            })
    })