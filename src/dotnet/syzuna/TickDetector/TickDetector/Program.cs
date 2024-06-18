using System.Text;
using Ionic.Zlib;
using NetMQ;
using NetMQ.Sockets;

const string TICK_SERVICE_URL = "tcp://infomancer.uk:5551";
List<string> topics = ["Heartbeat", "GalaxyTick", "SystemTick", "FactionChanges", "FactionExpandedFrom"];

using var socket = new SubscriberSocket();

socket.Options.ReceiveHighWatermark = 1000;
socket.Connect(TICK_SERVICE_URL);

foreach (var topic in topics)
{
    socket.Subscribe(topic, Encoding.UTF8);
}

while (true)
{
    var multipartMessage = socket.ReceiveMultipartMessage();
    
    if (multipartMessage.FrameCount < 2)
        continue;
    
    var topic = Encoding.UTF8.GetString(multipartMessage[0].Buffer);
    
    if (string.IsNullOrWhiteSpace(topic))
        continue;
    
    var uncompressed = ZlibStream.UncompressBuffer(multipartMessage[1].Buffer);
    
    if (uncompressed is null)
        continue;
    
    Console.WriteLine($"Topic: {topic} - {Encoding.UTF8.GetString(uncompressed)}");
}