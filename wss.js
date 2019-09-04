var wss;



async function init(server) {

    return new Promise(function(resolve, reject) {

        const WebSocket = require('ws');



        wss = new WebSocket.Server({ server });


        if (wss != undefined) {


            wss.on('connection', (ws) => {

                ws.isAlive = true;

                ws.on('pong', () => {
                    ws.isAlive = true;
                });

                ws.on('message', (message) => {

                    try {
                        let msg = JSON.parse(message)
                            //TODO:save in database(?) test if user exist and if signature is right
                        wss.clients
                            .forEach(client => {
                                if (client == ws) {
                                    client.send(`{"data":${message},"origin":"you"}`);

                                } else {
                                    client.send(`{"data":${message},"origin":"other"}`);
                                }
                            });
                    } catch (error) {
                        console.log(error, message);
                    }


                })
            });

            setInterval(() => {
                wss.clients.forEach((ws) => {

                    if (!ws.isAlive) return ws.terminate();

                    ws.isAlive = false;
                    ws.ping(null, false, true);
                });
            }, 10000);





            resolve("WSS CONFIGURATION DONE")
        } else {
            reject("WSS NOT STARTED")
        }




    })
}



module.exports = { wss, init }