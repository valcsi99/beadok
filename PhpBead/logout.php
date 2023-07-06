<?php
include_once "storage.php";
include_once "helper.php";
include_once "userstorage.php";
include_once "auth.php";

session_start();
$user_storage = new UserStorage();
$auth = new Auth($user_storage);

$auth->logout();
redirect("index.php");