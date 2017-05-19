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

/*if (isset($_GET['user'])) {
    $usr = $_GET['user'];
}
else {
    exit();
}*/

$usr = 1;
$bars = 12;
$delta = 'month';

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
    $sql = "SELECT WEEK(Occurances.Start) number, Occurances.Price, Appliances.Type, Appliances.Users_ID
            FROM Occurances
            LEFT JOIN Appliances ON Occurances.Appliances_App_ID = Appliances.App_ID
            WHERE Users_ID = '$usr' and Start > '$from_date'
            GROUP BY number, Type";
}
else {
    $sql = "SELECT MONTH(Occurances.Start) number, Occurances.Price, Appliances.Type, Appliances.Users_ID
            FROM Occurances
            LEFT JOIN Appliances ON Occurances.Appliances_App_ID = Appliances.App_ID
            WHERE Users_ID = '$usr' and Start > '$from_date'
            GROUP BY number, Type";
}

$result = $mysqli->query($sql);

if(!$result) {
    echo "Error: Failed to execute query: \n";
    echo "Query: " . $sql . "\n";
    echo "Errno: " . $mysqli->errno . "\n";
    echo "Error: " . $mysqli->error . "\n";
    exit;
}

$appliances =  array();
while ($appliance = $result->fetch_assoc()) {
    $appliances[] = $appliance;
}

echo json_encode($appliances);
