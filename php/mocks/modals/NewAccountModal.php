<?php require_once(dirname(dirname(__DIR__)) . "/environment.php"); ?>
<!DOCTYPE html>
<html lang="en">

<head>
  <base href="<?= $_ENV['PHP_ROOT_DIR']; ?>">
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script type="module" src="../js/classes/NewAccountModal.js"></script>
  <link rel="stylesheet" href="../css/style.css">
  <title>Document</title>
</head>

<body>
  <button class="open">Open Modal</button>
  <new-account-modal></new-account-modal>
  <script>
    let button = document.querySelector('button')
    let modal = document.querySelector('new-account-modal')

    customElements.whenDefined('new-account-modal')
      .then(() => {
        button.addEventListener("click", () => {
          modal.open();
        })
      })
  </script>
</body>

</html>