<?php
include_once "storage.php";
include_once "helper.php";
include_once "userstorage.php";
include_once "auth.php";
include_once "pollstorage.php";

session_start();

$user_storage = new UserStorage();
$auth = new Auth($user_storage);

if (!$auth->is_authenticated()) {
  redirect("login.php");
}

if (!$auth->authorize(["admin"])) {
  redirect("index.php");
}

$allpolls = new PollStorage();
$id = $_GET["id"];

$allpolls->delete($id);

redirect("index.php");