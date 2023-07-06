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

function validate($post, &$data, &$errors, $poll) {
    if ($poll['isMultiple'] == false) {
        if (!isset($post["answer"])) {
            $errors["answer"] = "Egyet választanod kell!";
        }
        else if (trim($post["answer"]) === "") {
            $errors["answer"] = "Egyet választanod kell!";
        }
        else {
            $data['votes'][$_SESSION['user']['id']] = $post['answer'];
        }
    }
    else {
        if (!isset($post["answers"])) {
            $errors["answers"] = "Legalább egyet választanod kell!";
        }
        else if (count($post["answers"]) == 0) {
            $errors["answers"] = "Legalább egyet választanod kell!";
        }
        else {
            $not_empty_answers = array_filter($post["answers"], function ($answer) {
              return trim($answer) !== "";
            });
            if (count($not_empty_answers) === 0) {
              $errors['answers'] = "Legalább egyet választanod kell!";
            } else {
                $data['votes'][$_SESSION['user']['id']] = $not_empty_answers;
            }

        }
    }
    return count($errors) === 0;
  }

if(isset($_GET['success']) && $_GET['success'] == 1) {
    echo "<script>alert('Sikeres szavazat!')</script>";
}
  // main
$id = $_GET["id"];
$allpolls = new PollStorage();
$poll = $allpolls->findById($id);
$options = $poll['options'];
$today = date("Y-m-d");


$data = [];
$errors = [];
if (count($_POST) > 0) {
  if (validate($_POST, $data, $errors, $poll)) {
      $poll['votes'][$_SESSION['user']['id']] = $data['votes'][$_SESSION['user']['id']];
      $allpolls->update($id, $poll);
       redirect("vote.php?id={$id}&success=1");
  }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="vote.css">
    <title>Szavazóoldal</title>
</head>
<body>
    <h1>Szavazóoldal</h1>
    <div class="loginDiv">
        <a href="index.php">Vissza</a> <br>
        <a href="logout.php">Kijelentkezés</a>
    </div>
    <div class="mainDiv">
    <h3><?= $poll['question'] ?></h3>
    <form action="" method="<?php if (!($poll['deadline'] < $today)) {echo "POST";} ?>" novalidate>
        <?php if ($poll['isMultiple'] == false) : ?>
            <?php if (isset($errors['answer'])) : ?>
                <p><span class="error"><?= $errors['answer'] ?></span></p>
            <?php endif ?>
            <p>Válassz egyet</p>
            <input type="hidden" name="answer" value=" ">
            <?php foreach ($options as $option) : ?>
                <label for="<?= $option ?>"><?= $option ?></label>
                <input type="radio" <?php if (($poll['deadline'] < $today)) {echo "disabled";} ?> name="answer" id="<?= $option ?>" value="<?= $option ?>" <?php if(isset($poll['votes'][$_SESSION['user']['id']]) && $poll['votes'][$_SESSION['user']['id']] === $option) echo 'checked';?>>
            <?php endforeach ?>
            <br>
            <p>
                <span>Létrehozva: <?= $poll['createdAt'] ?></span><br>
                <span>Határidő: <?= $poll['deadline'] ?></span>
            </p>
            <?php if (!($poll['deadline'] < $today)) : ?>
                <button type="submit">Küld</button>
            <?php endif ?>
        <?php else : ?>
            <?php if (isset($errors['answers'])) : ?>
                <p><span class="error"><?= $errors['answers'] ?></span></p>
            <?php endif ?>
            <p>Válassz bármennyit</p>
            <input type="hidden" name="answers[]" value=" ">
            <?php foreach ($options as $option) : ?>
                <label for="<?= $option ?>"><?= $option ?></label>
                <input type="checkbox" <?php if (($poll['deadline'] < $today)) {echo "disabled";} ?> name="answers[]" id="<?= $option ?>" value="<?= $option ?>" <?php if(isset($poll['votes'][$_SESSION['user']['id']]) && in_array($option,$poll['votes'][$_SESSION['user']['id']])) echo 'checked';?>><br>
            <?php endforeach ?>
            <br>
            <p>
                <span>Létrehozva: <?= $poll['createdAt'] ?></span><br>
                <span>Határidő: <?= $poll['deadline'] ?></span>
            </p>
            <?php if (!($poll['deadline'] < $today)) : ?>
                <button type="submit">Küld</button>
            <?php endif ?>
        <?php endif ?>
    </form>
    </div>
</body>
</html>