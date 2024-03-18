import zmq from 'zeromq'; // note needs npm install zeromq@6.0.0-beta.19 (or higher)
const port = 5551;

var sock;

async function run() {
  sock = new zmq.Subscriber;

//  sock.connect(`tcp://localhost:${port}`);
  sock.connect(`tcp://srv477848.hstgr.cloud:${port}`);
  sock.subscribe('GalaxyTick');
  sock.subscribe('SystemTick');
  sock.subscribe('Heartbeat');
  console.log(`Subscriber connected to port ${port}`);

  for await (const [topic, msg] of sock) {
    const sTopic = topic.toString();
    const payload = msg.toString();
    console.log(`${sTopic}: ${payload}`);
  }
}

run();

process.on('SIGINT', () => {
  sock.close();
  console.log("Subscriber shutting down...");
});
