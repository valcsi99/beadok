<?php
include_once "storage.php";
include_once "helper.php";
include_once "userstorage.php";
include_once "auth.php";
include_once "pollstorage.php";

session_start();

$user_storage = new UserStorage();
$auth = new Auth($user_storage);
$polls = new PollStorage();

function isOption($option) {
    return $option;
}

function compareByDate($a, $b) {
    return strcmp($a["createdAt"], $b["createdAt"]);
}

$allpolls = $polls->findAll();
$everypoll = $polls->getPollsWithDeadlineAfterToday();
$oldpolls = $polls->getPollsWithDeadlineBeforeToday();

$dateSort = $everypoll;
usort($dateSort, 'compareByDate');
$dateSort = array_reverse($dateSort);

$dateSortOld = $oldpolls;
usort($dateSortOld, 'compareByDate');
$dateSortOld = array_reverse($dateSortOld);
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="index.css">
    <title>Főoldal</title>
</head>
<body>
    <div class="headerDiv">
    <h1>Főoldal</h1>
    <div class="loginDiv">
        <?php if (!count($_SESSION) > 0) : ?>
            <a href="login.php">Bejelentkezés</a> <br>
            <a href="register.php">Regisztráció</a>
        <?php else : ?>
            <a href="logout.php">Kijelentkezés</a>
            <?php if ($auth->authorize(["admin"])) : ?>
                <br>
                <a href="creator.php">Szavazás létrehozása</a>
                <?php endif ?>
        <?php endif ?>
    </div>
        <p>Az oldalon több szavazólapot találsz. A még aktív szavazólapokon tudsz a megadott témákban szavazni. Minden szavazólapon egy szavazatot adhatsz le, de a határidőig még tudod módosítani.</p>
    </div>
   
    <div class="mainDiv">
        <?php foreach($dateSort as $poll) : ?>
            <div class="card">
                <span class="id"><?= array_search($poll, $allpolls) ?></span>
                <?php if (count($_SESSION) > 0 && $auth->authorize(["admin"])) : ?>
                    <a class="delete" href="delete.php?id=<?= $poll["id"] ?>">Törlés</a>
                <?php endif ?>
                <h4 class="title"><?= $poll['question'] ?></h4>
                <span class="dates">Létrehozva: <?= $poll['createdAt'] ?></span><br>
                <span class="dates">Lejárati idő: <?= $poll['deadline'] ?></span><br>
                <a class="sub" href="vote.php?id=<?= $poll["id"] ?>"><?php if ($auth->is_authenticated()) {
                    if (isset($poll['votes'][$_SESSION['user']['id']])) {
                        echo "Szavazat módosítása";
                    }
                    else {
                        echo "Szavazás";
                    }
                }
                else {
                    echo "Szavazás";
                } ?></a>
            </div>
            <?php endforeach ?>
            <hr>
            <p>Lejárt szavazások</p>
            <?php foreach($dateSortOld as $poll) : ?>
            <div class="card">
                <span class="id"><?= array_search($poll, $allpolls) ?></span>
                <?php if (count($_SESSION) > 0 && $auth->authorize(["admin"])) : ?>
                    <a class="delete" href="delete.php?id=<?= $poll["id"] ?>">Törlés</a>
                <?php endif ?>
                <h4 class="title"><?= $poll['question'] ?></h4>
                <span class="dates">Létrehozva: <?= $poll['createdAt'] ?></span><br>
                <span class="dates">Lejárt: <?= $poll['deadline'] ?></span><br>
                <a class="sub" href="vote.php?id=<?= $poll["id"] ?>">Szavazat megtekintése</a>
                <p class="stats">Eredmények</p>
                <table>
                    <?php if (isset($poll['votes'])) : ?>
                        <?php if ($poll['isMultiple'] == false) : ?>
                        <?php foreach ($poll['options'] as $option) : ?>
                            <tr><th><?= $option ?></th><td><?php $num_votes = 0;
                            foreach ($poll['votes'] as $user => $vote) {
                                if ($vote == $option) {
                                    $num_votes++;
                                }
                            } echo $num_votes ?></td></tr>
                        <?php endforeach ?>
                        <?php else : ?>
                            <?php foreach ($poll['options'] as $option) : ?>
                            <tr><th><?= $option ?></th><td><?php $num_votes = 0;
                            $arrays = array_values($poll['votes']);
                            foreach ($arrays as $array) {
                                foreach ($array as $value) {
                                    if ($value == $option) {
                                        $num_votes++;
                                    }
                                }
                            }
                            echo $num_votes; ?></td></tr>
                            <?php endforeach ?>
                        <?php endif ?>
                    <?php else :?>
                        <?php if ($poll['isMultiple'] == false) : ?>
                        <?php foreach ($poll['options'] as $option) : ?>
                            <tr><th><?= $option ?></th><td>0</td></tr>
                        <?php endforeach ?>
                        <?php else : ?>
                            <?php foreach ($poll['options'] as $option) : ?>
                            <tr><th><?= $option ?></th><td>0</td></tr>
                        <?php endforeach ?>
                        <?php endif ?>
                    <?php endif ?>
                </table>
            </div>
            <?php endforeach ?>
    </div>
</body>
</html>