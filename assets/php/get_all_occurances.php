<?php
/**
 * Created by IntelliJ IDEA.
 * User: Max
 * Date: 24/06/2017
 * Time: 13:54
 */

include('db_config.php');

/*****************************
 *       Get Variables       *
 *****************************/
if (isset($_GET['appliance_id'])) {
    $app_id = $_GET['appliance_id'];
}
else {
    exit();
}


if (isset($_GET['index'])) {
    $i = $_GET['index'];
}
else {
    exit();
}

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


$sql = "SELECT * FROM Occurances WHERE Appliances_App_ID = '$app_id' ORDER BY Start DESC;";
$result = $mysqli->query($sql);

if(!$result) {
    echo "Error: Failed to execute query: \n";
    echo "Query: " . $sql . "\n";
    echo "Errno: " . $mysqli->errno . "\n";
    echo "Error: " . $mysqli->error . "\n";
    exit;
}

$occurances =  array();
$occurances[] = $i;
while ($occurance = $result->fetch_assoc()) {
    $occurances[] = $occurance;
}

echo json_encode($occurances);