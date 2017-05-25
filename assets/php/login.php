<?php
/**
 * Created by IntelliJ IDEA.
 * User: Max
 * Date: 08/05/2017
 * Time: 13:59
 */


include('db_config.php');

/*****************************
 *       Get Variables       *
 *****************************/

//LOGIN

if (isset($_GET['login_email'])) {
    $email = $_GET['login_email'];
}

if ($email != '' && $email != null) {
    $login = true;
}
else {
    $login = false;
}

if (isset($_GET['login_password'])) {
    $pwd = $_GET['login_password'];
}

//CREATE
if (!$login) {
    if (isset($_GET['new_email'])) {
        $email = $_GET['new_email'];
        $login = false;
    }

    if ($email != '' && $email != null) {
        $create = true;
    }
    else {
        $create = false;
    }

    if (isset($_GET['password'][0]) && isset($_GET['password'][1])) {
        if ($_GET['password'][0] == $_GET['password'][1]) {
            $pwd = $_GET['password'][0];
        }
        else {
            echo 'Passwords are not the same';
        }
    }

    if (isset($_GET['f_name'])) {
        $f_name = $_GET['f_name'];
    }

    if (isset($_GET['l_name'])) {
        $l_name = $_GET['l_name'];
    }

    if (isset($_GET['fluksos'])) {
        $fluksos = str_getcsv($_GET['fluksos']);
    }
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

$output = array(
    "id" => null
);

if (!$login && $create) {

    /**********************************
     *         CREATE ACCOUNT         *
     **********************************/

    //INSERT USER
    $sql = "INSERT INTO Users (F_Name, L_Name, Email, Password) VALUES ('$f_name', '$l_name', '$email', '$pwd');";
    $result = $mysqli->query($sql);

    if(!$result) {
        echo "Error: Failed to execute query: \n";
        echo "Query: " . $sql . "\n";
        echo "Errno: " . $mysqli->errno . "\n";
        echo "Error: " . $mysqli->error . "\n";
        exit;
    }

    $newCUserId = $mysqli->insert_id;

    //INSERT FLUKSOS
    for ($i = 0; $i <= sizeof($fluksos); $i++) {

        $FL_ID = $fluksos[$i];
        if ($FL_ID != '' && $FL_ID != null) {

            $sql = "INSERT INTO Fluksos (FL_ID, Users_ID) VALUES ('$FL_ID', '$newCUserId');";
            $result = $mysqli->query($sql);

            if(!$result) {
                echo "Error: Failed to execute query: \n";
                echo "Query: " . $sql . "\n";
                echo "Errno: " . $mysqli->errno . "\n";
                echo "Error: " . $mysqli->error . "\n";
                exit;
            }

        }

    }

    $output['id'] =  $newCUserId;
}
else if(!$create && $login) {

    /*************************
     *         LOGIN         *
     *************************/

    $sql = "SELECT * FROM Users WHERE Email = '$email';";
    $result = $mysqli->query($sql);

    if(!$result) {
        echo "Error: Failed to execute query: \n";
        echo "Query: " . $sql . "\n";
        echo "Errno: " . $mysqli->errno . "\n";
        echo "Error: " . $mysqli->error . "\n";
        exit;
    }

    $data =  array();
    while ($d = $result->fetch_assoc()) {
        $data[] = $d;
    }

    $pwd1 = $data[0]["Password"];
    $id = $data[0]["ID"];

    if ($pwd1 == $pwd) {
        echo json_encode($data);
    }
    else {
        $output['id'] = -1;
        echo json_encode($output);
    }

}
