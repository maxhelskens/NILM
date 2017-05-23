<?php
/**
 * Created by IntelliJ IDEA.
 * User: Max
 * Date: 19/05/2017
 * Time: 11:47
 */

include('db_config.php');

/*****************************
 *       Get Variables       *
 *****************************/

if (isset($_GET['user'])) {
    $usr = $_GET['user'];
}
else {
    exit();
}

if (isset($_GET['amount'])) {
    $bars = $_GET['amount'];
}
else {
    exit();
}

if (isset($_GET['sample'])) {
    $delta = $_GET['sample'];
}
else {
    exit();
}


date_default_timezone_set('Europe/Brussels');
$to_date = date('Y-m-d', strtotime('last Monday'));
$from_date = date('Y-m-d',strtotime($to_date . ' - '.$bars.' ' . $delta));

/*****************************
 *       Connect to db       *
 *****************************/

$mysqli = new mysqli($host, $user, $password, $db);
if ($mysqli->connect_errno) {
    // The connection failed. What do you want to do?
    // You could contact yourself (email?), log the error, show a nice page, etc.
    // You do not want to reveal sensitive information

    // Let's try this:
    echo "Sorry, this website is experiencing problems.";

    // Something you should not do on a public site, but this example will show you
    // anyways, is print out MySQL error related information -- you might log this
    echo "Error: Failed to make a MySQL connection, here is why: \n";
    echo "Errno: " . $mysqli->connect_errno . "\n";
    echo "Error: " . $mysqli->connect_error . "\n";

    // You might want to show them something nice, but we will simply exit
    exit;
}

if ($delta == 'week') {
    $sql = "SELECT WEEK(Occurances.Start) week, YEAR(Occurances.Start) year, SUM(Occurances.Price) as Price, Appliances.Type, Appliances.Users_ID
            FROM Occurances
            LEFT JOIN Appliances ON Occurances.Appliances_App_ID = Appliances.App_ID
            WHERE Users_ID = '$usr' " . //and Start > '$from_date'
            "GROUP BY week, Type
            ORDER BY week DESC";
}
else {
    $sql = "SELECT MONTH(Occurances.Start) month, SUM(Occurances.Price) as Price, Appliances.Type, Appliances.Users_ID
            FROM Occurances
            LEFT JOIN Appliances ON Occurances.Appliances_App_ID = Appliances.App_ID
            WHERE Users_ID = '$usr' " . //and Start > '$from_date'
            "GROUP BY month, Type
            ORDER BY month DESC";
}

$result = $mysqli->query($sql);

if(!$result) {
    echo "Error: Failed to execute query: \n";
    echo "Query: " . $sql . "\n";
    echo "Errno: " . $mysqli->errno . "\n";
    echo "Error: " . $mysqli->error . "\n";
    exit;
}

function getStartAndEndDate($week, $year)
{

    $time = strtotime("1 January $year", time());
    $day = date('w', $time);
    $time += ((7*$week)+1-$day)*24*3600;
    $return[0] = date('d M', $time);
    $time += 6*24*3600;
    $return[1] = date('d M', $time);
    return $return;
}


if ($delta == 'week') {
    $prev = -1;
    $label ='';
    $temp = '{';
    $cons = '{';

    while ($appliance = $result->fetch_assoc()) {

        if ($appliance['week'] != $prev) {
            if ( $cons != '{') {
                if ($temp != '{') {
                    $temp = $temp . ',';
                }
                $cons = $cons . '}';
                $temp = $temp . '"' . $label . '":' . $cons;

                $label ='';
                $cons = '{';
            }

            $dates = getStartAndEndDate($appliance['week'], $appliance['year']);

            $label = $dates[0] . ' - ' . $dates[1];
            $cons = $cons . '"' . $appliance['Type'] .'":'. $appliance['Price'];

            $prev = $appliance['week'];
        }
        else {
            $cons =  $cons. ',' . '"' . $appliance['Type'] .'":'. $appliance['Price'];
        }

    }
    $cons = $cons . '}';

    if ($temp != '{') {
        $temp = $temp . ',';
    }
    $temp = $temp . '"' . $label . '":' . $cons . '}';

    echo json_encode($temp);
}
else {
    $prev = -1;
    $monthName ='';
    $temp = '{';
    $cons = '{';

    while ($appliance = $result->fetch_assoc()) {

        if ($appliance['month'] != $prev) {
            if ( $cons != '{') {
                if ($temp != '{') {
                    $temp = $temp . ',';
                }
                $cons = $cons . '}';
                $temp = $temp . '"' . $monthName . '":' . $cons;

                $monthName ='';
                $cons = '{';
            }

            $monthNum  = $appliance['month'];
            $dateObj   = DateTime::createFromFormat('!m', $monthNum);
            $monthName = $dateObj->format('F'); // March

            $cons = $cons . '"' . $appliance['Type'] .'":'. $appliance['Price'];

            $prev = $appliance['month'];
        }
        else {
            $cons =  $cons. ',' . '"' . $appliance['Type'] .'":'. $appliance['Price'];
        }

    }
    $cons = $cons . '}';
    if ($temp != '{') {
        $temp = $temp . ',';
    }
    $temp = $temp . '"' . $monthName . '":' . $cons . '}';

    echo json_encode($temp);
}