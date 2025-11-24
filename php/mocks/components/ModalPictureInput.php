<?php require_once(dirname(dirname(__DIR__)) . "/environment.php"); ?>
<!DOCTYPE html>
<html lang="en">

<head>
  <base href="<?= $_ENV['PHP_ROOT_DIR']; ?>">
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script type="module" src="../js/classes/ModalPictureInput.js"></script>
  <link rel="stylesheet" href="../css/style.css">
  <title>Document</title>
  <style>
    #parent {
      width: 300px;
      height: 300px;
      margin: 0 auto;
      box-shadow: 0 2px 8px -2px gray;
      overflow: hidden;
    }
  </style>
</head>

<body>
  <div id="parent">
    <modal-picture-input></modal-picture-input>
  </div>
</body>

</html>