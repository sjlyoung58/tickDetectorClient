import jakarta.json.*;
import org.zeromq.*;
import java.io.StringReader;
import java.time.LocalDateTime;
import java.util.*;
import java.util.zip.DataFormatException;
import java.util.zip.Inflater;

import static java.nio.charset.StandardCharsets.UTF_8;
import static java.time.format.DateTimeFormatter.ISO_OFFSET_DATE_TIME;

public class TickDetector implements Runnable {

  private static final List<String> SUBSCRIPTIONS = List.of(
      "FactionChanges",
      "FactionExpandedFrom",
      "GalaxyTick",
      "Heartbeat",
      "SystemTick"
  );

  @Override
  public void run() {
    try (var context = new ZContext()) {
      var client = context.createSocket(SocketType.SUB);
      SUBSCRIPTIONS.forEach(s -> client.subscribe(s.getBytes()));
      client.setReceiveTimeOut(30_000);
      client.connect("tcp://infomancer.uk:5551");
      System.out.println("TickDetector connected");
      var poller = context.createPoller(1);
      poller.register(client, ZMQ.Poller.POLLIN);
      byte[] output = new byte[256 * 1024];
      ZMsg received;
      while (true) {
        var poll = poller.poll(10);
        if (poll == ZMQ.Poller.POLLIN) {
          if (poller.pollin(0)) {
            if ((received = ZMsg.recvMsg(client)) != null) {
              var topic = received.pop().getString(UTF_8);
              var payload = received.pop().getData();
              var inflater = new Inflater();
              inflater.setInput(payload);
              try {
                int len = inflater.inflate(output);
                var content = new String(output, 0, len, UTF_8);
                var json = Json.createReader(new StringReader(content)).readObject();
                System.out.println(topic + ": " + json);
              } catch (DataFormatException e) {
                // Log but swallow the error
                System.err.println(e);
              }
            }
          }
        }
      }
    }

  }

  public static void main(String[] args) {
    var tickDetector = new TickDetector();
    tickDetector.run();
  }

}