<?php
/**
 * Created by IntelliJ IDEA.
 * User: Max
 * Date: 09/05/2017
 * Time: 13:23
 */

include('db_config.php');

/*****************************
 *       Get Variables       *
 *****************************/
if (isset($_GET['cons_type'])) {
    $type = $_GET['cons_type'];
}
else {
    exit();
}

if (isset($_GET['user'])) {
    $usr = $_GET['user'];
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


$sql = "SELECT * FROM Appliances WHERE Type = '$type' AND  Users_ID = '$usr';";
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