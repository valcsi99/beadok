<?php
include_once "storage.php";
include_once "helper.php";
include_once "userstorage.php";
include_once "auth.php";


// functions
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
    if (!isset($post["email"])) {
        $errors["email"] = "Email is required!";
    }
    else if (trim($post["email"]) === "") {
        $errors["email"] = "Email is required!";
    }
    else if (!filter_var($post["email"], FILTER_VALIDATE_EMAIL)) {
        $errors["email"] = "Email is wrong format!";
    }
    else {
        $data["email"] = $post["email"];
    }
    if (!isset($post["password"])) {
        $errors["password"] = "Password is required!";
    }
    else if (trim($post["password"]) === "") {
        $errors["password"] = "Password is required!";
    }
    else {
        if ($post['passwordagain'] != $post['password']) {
            $errors['passwordagain'] = "Passwords not matching!";
        }
        else {
            $data["password"] = $post["password"];
        }
    }
  
    return count($errors) === 0;
  }
  
  // main
  $user_storage = new UserStorage();
  $auth = new Auth($user_storage);
  $errors = [];
  $data = [];
  if (count($_POST) > 0) {
    if (validate($_POST, $data, $errors)) {
      if ($auth->user_exists($data['username'])) {
        $errors['global'] = "User already exists";
      } else {
        $auth->register($data);
        redirect('login.php?success=1');
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
    <link rel="stylesheet" href="register.css">
    <title>Regisztráció</title>
</head>
<body>
    <h2>Regisztráció</h2>
    <div>
        <form action="" method="POST" novalidate>
            <?php if (isset($errors['global'])) : ?>
                <span class="errorglobal"><?= $errors['global'] ?></span>
            <?php endif ?>
            <label for="username">Felhasználónév</label>
            <input type="text" name="username" id="username" value="<?= $_POST['username'] ?? "" ?>">
            <?php if (isset($errors['username'])) : ?>
                <span class="error"><?= $errors['username'] ?></span>
            <?php endif; ?>
            <label for="email">E-mail</label>
            <input type="text" name="email" id="email" value="<?= $_POST['email'] ?? "" ?>">
            <?php if (isset($errors['email'])) : ?>
                <span class="error"><?= $errors['email'] ?></span>
            <?php endif; ?>
            <label for="password">Jelszó</label>
            <input type="password" name="password" id="password" value="<?= $_POST['password'] ?? "" ?>">
            <?php if (isset($errors['password'])) : ?>
                <span class="error"><?= $errors['password'] ?></span>
            <?php endif; ?>
            <label for="passwordagain">Jelszó mégegyszer</label>
            <input type="password" name="passwordagain" id="passwordagain" value="">
            <?php if (isset($errors['passwordagain'])) : ?>
                <span class="error"><?= $errors['passwordagain'] ?></span>
            <?php endif; ?>
            <button type="submit">Regisztrálás</button>
        </form>
    </div>
</body>
</html>