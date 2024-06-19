<?php
/**
 *  Configuration
 */
set_time_limit(0);

$tickDetector				 = 'tcp://infomancer.uk:5551';
//5 minutes for a heartbeat to come in before reconnecting
$timeoutHeartbeat            = 360000;

// Set to false if you do not want JSON logging
$logJSONFile            = dirname(__FILE__) . '/Tick_log_%TYPE%_%DATE%.log';
//$logJSONFile            = false;

/**
 * WORKER FUNCTIONS
 */
function echoLogJSON($json, $prefix)
{
    global $logJSONFile;

    if($logJSONFile !== false)
    {
        $logJSONFileParsed = str_replace('%DATE%', date('Y-m-d'), str_replace('%TYPE%', $prefix, $logJSONFile));

        file_put_contents(
            $logJSONFileParsed,
            $json . PHP_EOL,
            FILE_APPEND
        );
    }
}

/**
 * START OF LISTENER
 */

// UTC
date_default_timezone_set('UTC');

$context    = new ZMQContext();
$subscriber = $context->getSocket(ZMQ::SOCKET_SUB);

$subscriber->setSockOpt(ZMQ::SOCKOPT_SUBSCRIBE, "GalaxyTick");
$subscriber->setSockOpt(ZMQ::SOCKOPT_SUBSCRIBE, "SystemTick");
$subscriber->setSockOpt(ZMQ::SOCKOPT_SUBSCRIBE, "Heartbeat");
$subscriber->setSockOpt(ZMQ::SOCKOPT_RCVTIMEO, $timeoutHeartbeat);

while (true)
{
    try
    {
        $subscriber->connect($tickDetector);
        
        while (true)
        {
            $message = $subscriber->recvMulti();

            if ($message === false)
            {
                $subscriber->disconnect($tickDetector);
                break;
            }
            
            $filter = $message[0];
			$data = zlib_decode($message[1]);
            $jsonData = json_decode($data);
            echoLogJSON($data, $filter);

            switch ($filter)
            {
                case "GalaxyTick":
                    //Do something with the GalaxyTick
                    break;
                case "SystemTick":
                    //Do something with the SystemTick
                    break;
                case "Heartbeat":
                    //Do something with the heartbeat
                    break;
            }
        }
    }
    catch (ZMQSocketException $e)
    {
        sleep(10);
    }
}

// Exit correctly
exit(0);
