import url from 'url';
import { Telnet } from 'telnet-client';
import { WebSocketServer, createWebSocketStream } from 'ws';
import { pipeline } from 'node:stream/promises';


const wss = new WebSocketServer({ port: 4000 });

wss.on('connection', async (connection, request) => {
  const send = (message) => {
    const messageLength = message.length;
    const buffer = new ArrayBuffer(messageLength);
    const bufferView = new Uint8Array(buffer);
    for (let i = 0; i < messageLength; i++) {
      bufferView[i] = message.charCodeAt(i);
    }
    connection.send(buffer);
  };

  const telnet = new Telnet();
  const duplex = createWebSocketStream(connection, { encoding: 'ascii' });
  const { ip, port } = url.parse(request.url, true).query;

  const params = {
    host: ip,
    port: port,
    disableLogon: true,
    shellPrompt: null,
    stripControls: true
  };

  connection.on('close', () => {
    if (!telnet.endEmitted) {
      try {
        telnet.end();
      } catch(error) {
        console.log(error);
      }
    }
  });

  try {
    send(`Trying to connect to ${ip} : ${port}... `);
    await telnet.connect(params);
    send(`Connected!\r\n\r\n`);

    const stream = await telnet.shell();
    send('Press ENTER to start.\r\n');

    connection.cleanup = async () => {
      await stream.end();
      await duplex.end();
    };

    await Promise.all([ pipeline(duplex, stream), pipeline(stream, duplex) ]);
  }
  catch(error) {
    send(error.message);
    console.log(error);
  }
  finally {
    if (!telnet.endEmitted) {
      telnet.end();
    }
  }

});


function handleExit() {
  wss.clients.forEach(connection => connection.cleanup && connection.cleanup());
  wss.close();
}

process.on('SIGINT', handleExit);
process.on('SIGTERM', handleExit);
