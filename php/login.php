<?php
session_start();

if (isset($_SESSION['user'])) {
  header("Location: accounts");
}

require_once(dirname(__FILE__) . '/resources.php');
?>

<!DOCTYPE html>
<html lang="en">

<head>
  <base href="<?= $_ENV['PHP_ROOT_DIR'] ?>">
  <title>Login Page | Fappu Admin</title>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="../css/style.css">
  <style>
    html {
      background-color: #FCFCFC;
    }
    header {
      margin-top: 2rem;
      margin-bottom: 3rem;
    }

    h1 {
      font-size: 2rem;
      text-align: center;
      cursor: default;
    }

    h1 .em {
      color: #B208FA;
    }

    div.error {
      width: 300px;
      margin: 8px auto;
      padding: 10px 25px;
      background-color: #B208FA;

      font-family: 'Roboto Condensed Light';
      font-size: 16px;

      color: white;
      text-align: center;
      box-sizing: border-box;
      box-shadow: 0 2px 6px -2px gray;
    }

    @media screen and (max-width: 1000px) {
      main {
        padding: 0
      }
    }

    @media screen and (max-width: 800px) {
      div.error {
        width: 90%;
      }

      main form {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      main form button {
        width: fit-content;
        flex: 0 0 auto;
        align-self: flex-end;
      }
    }
  </style>
</head>

<body>
  <header>
    <h1>Fappu<br><span class="em">Admin</span></h1>
  </header>

  <?php if (isset($_GET['error_banner'])): ?>
    <div class="error">Wrong credentials</div>
  <?php endif; ?>

  <main>
    <form action="<?= $_ENV['ROOT_DIR'] . '/v1/users' ?>" method="post">
      <input type="text" class="LL" placeholder="username" autocomplete="true" name="Username" required>
      <input type="password" class="LL" placeholder="password" autocomplete="false" name="Password" required>
      <button class="button button small secondary" type="submit">Log In</button>
    </form>
  </main>

  <footer>
    <script>
      let form = document.querySelector('form')
      let button = document.querySelector('form button')
      let requestExists = false;

      form.addEventListener('submit', function() {
        if (!requestExists) {
          requestExists = true
          button.setAttribute('disabled', 1)
        }
      })
    </script>
  </footer>
</body>

</html>