<?php
include_once "storage.php";
include_once "helper.php";
include_once "userstorage.php";
include_once "auth.php";

function validate($post, &$data, &$errors) {
    if (!isset($post["username"])) {
        $errors["username"] = "Username is required!";
    }
    else if (trim($post["username"]) === "") {
        $errors["username"] = "Username is required!";
    }
    else {
        $data["username"] = $post["username"];
    }
    if (!isset($post["password"])) {
        $errors["password"] = "Password is required!";
    }
    else if (trim($post["password"]) === "") {
        $errors["password"] = "Password is required!";
    }
    else {
        $data["password"] = $post["password"];
    }
  
    return count($errors) === 0;
}

// main
session_start();
if(isset($_GET['success']) && $_GET['success'] == 1) {
    echo "<script>alert('Sikeres regisztráció!')</script>";
  }

$user_storage = new UserStorage();
$auth = new Auth($user_storage);
$data = [];
$errors = [];
if (count($_POST) > 0) {
    if (validate($_POST, $data, $errors)) {
        $auth_user = $auth->authenticate($data['username'], $data['password']);
        if (!$auth_user) {
        $errors['global'] = "Login error";
        } else {
        $auth->login($auth_user);
        redirect('index.php');
        }
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="login.css">
    <title>Bejelentkezés</title>
</head>
<body>
    <h2>Bejelentkezés</h2>
    <div>
        <form action="" method="POST" novalidate>
        <?php if (isset($errors['global'])) : ?>
            <p><span class="error"><?= $errors['global'] ?></span></p>
        <?php endif ?>
            <label for="username">Felhasználónév</label>
            <input type="text" name="username" id="username" value="<?= $_POST['username'] ?? "" ?>">
            <?php if (isset($errors['username'])) : ?>
                <span class="error"><?= $errors['username'] ?></span>
            <?php endif; ?>
            <label for="password">Jelszó</label>
            <input type="password" name="password" id="password" value="<?= $_POST['password'] ?? "" ?>">
            <?php if (isset($errors['password'])) : ?>
                <span class="error"><?= $errors['password'] ?></span>
            <?php endif; ?>
            <button type="submit">Belépés</button>
        </form>
    </div>
</body>
</html>