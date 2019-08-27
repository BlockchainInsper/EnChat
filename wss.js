const WebSocket = require('ws');
var wss;



async function init(server) {

    return new Promise(function (resolve, reject) {

        wss = new WebSocket.Server({ server });
        console.log(wss == undefined);

        if (wss!=undefined){
            wss.on('connection', (ws) => {

                ws.on('message', (message) => {
            

                    console.log('received: %s', message);
                    ws.send(`received -> ${message}`);

                    ws.isAlive = true;

                    

                    

                });
                ws.on('pong', () => {
                    ws.isAlive = true;
                });
    
    
                ws.on('chatMessage', (message) => {
                    if (message.msg!=undefined && message.user!=undefined){
                        //TODO salvar no database 
                        wss.clients.forEach(function each(client) {
                            if (client !== ws && client.readyState === WebSocket.OPEN) {
                              client.send(message);
                            }
                        });
                    }
                    
                });

                ws.send('Connection established');

                
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



  module.exports = {wss, init}