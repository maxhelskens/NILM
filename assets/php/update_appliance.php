<?php
/**
 * Created by IntelliJ IDEA.
 * User: Max
 * Date: 15/05/2017
 * Time: 12:06
 */

include('db_config.php');

if( isset($_GET['new_name']) ) {
    $name = $_GET['new_name'];
}
else {
    exit();
}

if( isset($_GET['tag']) ) {
    $tag = $_GET['tag'];
}
else {
    exit();
}

if( isset($_GET['id']) ) {
    $id = $_GET['id'];
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

$sql = "UPDATE Appliances SET Name = '$name' WHERE App_ID = '$id';";
$result = $mysqli->query($sql);

if(!$result) {
    echo "Error: Failed to execute query: \n";
    echo "Query: " . $sql . "\n";
    echo "Errno: " . $mysqli->errno . "\n";
    echo "Error: " . $mysqli->error . "\n";
    exit;
}

$sql = "SELECT Tags_ID FROM Tags WHERE Name = '$tag';";
$result = $mysqli->query($sql);

if(!$result) {
    echo "Error: Failed to execute query: \n";
    echo "Query: " . $sql . "\n";
    echo "Errno: " . $mysqli->errno . "\n";
    echo "Error: " . $mysqli->error . "\n";
    exit;
}

$tag_id = $result->fetch_assoc()["Tags_ID"];

$sql = "UPDATE Appliances SET Tags_Tags_ID = '$tag_id' WHERE App_ID = '$id';";
$result = $mysqli->query($sql);

if(!$result) {
    echo "Error: Failed to execute query: \n";
    echo "Query: " . $sql . "\n";
    echo "Errno: " . $mysqli->errno . "\n";
    echo "Error: " . $mysqli->error . "\n";
    exit;
}

echo json_encode($tag_id);