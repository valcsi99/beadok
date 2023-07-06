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

function validate($post, &$data, &$errors) {
  $data['question'] = $post['question'];
  if ($post['isMultiple'] == "false") {
    $data['isMultiple'] = false;
  }
  else {
    $data['isMultiple'] = true;
  }
  $data['deadline'] = $post['deadline'];
  $not_empty_options = array_filter($post["options"], function ($option) {
    return trim($option) !== "";
  });
  $data['options'] = $not_empty_options;

  $today = date('Y-m-d');
  $data['createdAt'] = $today;
  return count($errors) === 0;
}

$data = [];
$errors = [];
if (count($_POST) > 0) {
    if (validate($_POST, $data, $errors)) {
      $poll = new PollStorage();
      $poll->add($data);
      redirect('creator.php');
    }
}

?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="creator.css">
    <title>Szavazás létrehozása</title>
</head>
<body>
    <h1>Szavazás létrehozása</h1>
    <div class="loginDiv">
        <a href="index.php">Vissza</a> <br>
        <a href="logout.php">Kijelentkezés</a>
    </div>
    <div class="mainDiv">
      <form action="" method="POST" novalidate>
        <label for="question">Szavazás kérdése</label><br>
        <input type="text" name="question">
        <p>Legyen több válaszlehetőség?</p>
        <label for="igen">Igen</label>
        <input type="radio" id="igen" name="isMultiple" value="true">
        <label for="nem">Nem</label>
        <input type="radio" id="nem" name="isMultiple" value="false"> <br>
        <p>Leadás határideje</p>
        <input type="date" name="deadline">
        <p>Választási lehetőségek</p>
        <input class="inputs" type="text" name="options[]"> <br>
        <input class="inputs" type="text" name="options[]">
        <br>
        <img src="plus.png" alt="Új opció"><br>
        <button type="submit">Kész</button>
      </form>
    </div>
    <script src="creator.js"></script>
</body>
</html>