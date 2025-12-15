<?php
require __DIR__ . "/resources.php";

use Slim\Factory\AppFactory;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

$app = AppFactory::create();
$app->addErrorMiddleware(true, true, true);
$app->setBasePath($_ENV["ROOT_DIR"]);

$app->get("/v1/websites", function (Request $request, Response $response) {
  global $main_conn, $__WEBSITES;
  $websites = $main_conn->query("SELECT `SITE_CODE`, `SITE_TITLE` FROM `$__WEBSITES`");
  $final_list = array();

  foreach ($websites as $website) {
    array_push($final_list, $website);
  }

  $data = json_encode($final_list);
  $response->getBody()->write($data);
  return $response->withHeader("Content-Type", "application/json",)->withStatus(200);
});

$app->get('/v1/accounts/{accountID}', function (Request $request, Response $response, $args) {
  global $main_conn, $__WEBSITES, $__ACCOUNTS;
  $account_id = clean_txt($args["accountID"]);
  $single_account_query = "SELECT A.`ACCOUNT_ID` AS `ACCOUNT_ID`, A.`SITE_CODE` AS `SITE_CODE`, A.`ACCOUNT_NICK` AS `ACCOUNT_NICK`, 
    A.`ACCOUNT_PASS` AS `ACCOUNT_PASS`, A.`VENDOR_ID` AS `VENDOR_ID`, A.`PRICE_PAID` AS `PRICE_PAID`, 
    A.`WARRANTY_BEGINS` AS `WARRANTY_BEGINS`, A.`WARRANTY_ENDS` AS `WARRANTY_ENDS`, A.`N_AVAILABLE` AS `N_AVAILABLE`, 
    A.`N_SOLD` AS `N_SOLD`, W.`SITE_URL` AS `SITE_URL` 
    FROM `$__ACCOUNTS` AS A 
    INNER JOIN `$__WEBSITES` AS W
    ON A.`SITE_CODE` = W.`SITE_CODE`
    WHERE `ACCOUNT_ID` = '$account_id'";
  $result = $main_conn->query($single_account_query);

  if ($result->num_rows === 0) {
    $response->getBody()->write("No found account for " . $account_id);
    return $response->withHeader('Content-Type', 'text/text')->withStatus(200);
  }

  $account = $result->fetch_assoc();
  $account_data = array(
    "ACCOUNT_ID" => $account['ACCOUNT_ID'],
    "SITE_CODE" => $account['SITE_CODE'],
    "ACCOUNT_NICK" => $account['ACCOUNT_NICK'],
    "ACCOUNT_PASS" => $account['ACCOUNT_PASS'],
    "PRICE_PAID" => $account['PRICE_PAID'],
    "VENDOR_ID" => $account['VENDOR_ID'],
    "N_AVAILABLE" => $account['N_AVAILABLE'],
    "N_SOLD" => $account['N_SOLD'],
    "SITE_URL" => $account['SITE_URL'],
    "WARRANTY_BEGINS" => $account['WARRANTY_BEGINS'],
    "WARRANTY_ENDS" => $account['WARRANTY_ENDS']
  );

  $response->getBody()->write(json_encode($account_data));
  return $response->withHeader('Content-Type', 'application/json')->withStatus(200);
});

$app->get('/v1/accounts_killed/{accountID}', function (Request $request, Response $response, $args) {
  global $main_conn, $__ACCOUNTS, $__ACCOUNTS_KILLED;
  $account_id = clean_txt($args["accountID"]);
  $killed_account_query = "SELECT A.`ACCOUNT_ID` AS `ACCOUNT_ID`, A.`SITE_CODE` AS `SITE_CODE`, A.`ACCOUNT_NICK` AS `ACCOUNT_NICK`, 
    A.`ACCOUNT_PASS` AS `ACCOUNT_PASS`, A.`VENDOR_ID` AS `VENDOR_ID`, A.`PRICE_PAID` AS `PRICE_PAID`, 
    A.`WARRANTY_BEGINS` AS `WARRANTY_BEGINS`, A.`WARRANTY_ENDS` AS `WARRANTY_ENDS`, A.`N_AVAILABLE` AS `N_AVAILABLE`, 
    A.`N_SOLD` AS `N_SOLD`, KA.`MOTIVE` AS `MOTIVE`, KA.`ACTION_DATE` AS 'ACTION_DATE'
    FROM `$__ACCOUNTS` AS A
    INNER JOIN `$__ACCOUNTS_KILLED` AS KA 
    ON A.`ACCOUNT_ID` = KA.`ACCOUNT_ID` 
    WHERE A.`ACCOUNT_ID` = '$account_id'";
  $result = $main_conn->query($killed_account_query);

  if ($result->num_rows === 0) {
    $response->getBody()->write("No found account for " . $account_id);
    return $response->withHeader('Content-Type', 'text/text')->withStatus(200);
  }

  $account = $result->fetch_assoc();
  $account_data = array(
    "ACCOUNT_ID" => $account['ACCOUNT_ID'],
    "SITE_CODE" => $account['SITE_CODE'],
    "ACCOUNT_NICK" => $account['ACCOUNT_NICK'],
    'ACCOUNT_PASS' => $account['ACCOUNT_PASS'],
    "MOTIVE" => $account['MOTIVE'],
    "VENDOR_ID" => $account['VENDOR_ID'],
    "ACTION_DATE" => $account['ACTION_DATE']
  );

  $response->getBody()->write(json_encode($account_data));
  return $response->withHeader('Content-Type', 'application/json')->withStatus(200);
});

$app->get('/v1/websites/{website}/screens', function (Request $request, Response $response, $args) {
  global $main_conn, $__WEBSITES_CHILDREN;
  $site_code = clean_txt($args['website']);

  $screens_query = "SELECT `children` FROM `$__WEBSITES_CHILDREN` 
                      WHERE `SITE_CODE` = '$site_code'";
  $results = $main_conn->query($screens_query);

  if (!$results->num_rows) {
    $response->getBody()->write("No screens found for \"$site_code\"");
    return $response->withHeader('Content-Type', 'text/text')->withStatus(200);
  }

  $screens = $results->fetch_array();
  $screens = $screens[0];

  $screens_arr = json_encode(explode('/', $screens));
  $response->getBody()->write($screens_arr);
  return $response->withHeader('Content-Type', 'application/json')->withStatus(200);
});

$app->get('/v1/vendors/search/{vendor}', function (Request $request, Response $response, $args) {
  global $main_conn, $__VENDORS;
  $vendor_query = clean_txt($args['vendor']);

  $vendors_query = "SELECT `ID` FROM `$__VENDORS` WHERE `ID` LIKE '%$vendor_query%' LIMIT 3";
  $vendors = $main_conn->query($vendors_query);

  if ($vendors->num_rows === 0) {
    $response->getBody()->write("No vendors were found ");
    return $response->withHeader('Content-Type', 'text/text')->withStatus(200);
  }

  $vendors_list = array();

  foreach ($vendors as $vendor) {
    array_push($vendors_list, $vendor);
  }

  $response->getBody()->write(json_encode($vendors_list));
  return $response->withHeader('Content-Type', 'application/json')->withStatus(200);
});

$app->get('/v1/reclaims/{reclaimID}', function (Request $request, Response $response, $args) {
  global $main_conn, $__RECLAIMS, $__ACCOUNTS, $__ACCOUNTS_KILLED;
  $reclaim_id = clean_txt($args['reclaimID']);

  $reclaim_query = "SELECT R.`RECLAIM_ID` AS `RECLAIM_ID`, R.`USER_EMAIL` AS `USER_EMAIL`, R.`ACCOUNT_ID` AS `ACCOUNT_ID`,
                      R.`ORDER_ID` AS `ORDER_ID`, R.`DATE` AS `DATE`, R.`STATUS` AS `RECLAIM_STATUS`,
                      A.`ACCOUNT_NICK` AS `NICKNAME`, A.`WARRANTY_BEGINS` AS `ACCOUNT_BOUGHT_DATE`,
                  
                      (CASE
                        WHEN A_K.`ACCOUNT_ID` IS NOT NULL THEN UCASE(A_K.`MOTIVE`)
                        ELSE A.`ACCESS_STATE`
                        END) AS `ACCOUNT_STATUS`
                  
                      FROM `$__RECLAIMS` AS R 
                      INNER JOIN `$__ACCOUNTS` AS A
                      ON R.`ACCOUNT_ID` = A.`ACCOUNT_ID`
                      LEFT OUTER JOIN `$__ACCOUNTS_KILLED` AS A_K
                      ON R.`ACCOUNT_ID` = A_K.`ACCOUNT_ID`
                      WHERE R.`RECLAIM_ID` = '$reclaim_id'
                      ORDER BY R.`RECLAIM_ID` DESC
                      LIMIT 1";

  $results = $main_conn->query($reclaim_query);

  if ($results->num_rows === 0) {
    $response->getBody()->write("No reclaim with id \"$reclaim_id\" was found");
    return $response->withHeader('Content-Type', 'text/text')->withStatus(200);
  }

  $response->getBody()->write(json_encode($results->fetch_assoc()));
  return $response->withHeader('Content-Type', 'application/json')->withStatus(200);
});

$app->get('/v1/messages', function (Request $request, Response $response, $args) {
  global $main_conn, $__MESSAGES;
  $messages_per_page = 3;
  $queryParams = $request->getQueryParams();
  $category = $queryParams['category'] ?? null;
  $page = $queryParams['page'] ?? 1;
  $page = (int) $page;

  $messages_query = "SELECT * FROM `$__MESSAGES`
                    ORDER BY `DATE` DESC
                    LIMIT $page, $messages_per_page";

  if ($category) {
    $category = strtoupper($category);
    $messages_query = "SELECT * FROM `$__MESSAGES` 
                      WHERE `CATEGORY_LABEL` = '$category'
                      ORDER BY `DATE` DESC
                      LIMIT $page, $messages_per_page";
  }

  $results = $main_conn->query($messages_query);
  $messages = [];

  while ($message = $results->fetch_array(MYSQLI_ASSOC)) {
    array_push($messages, $message);
  }

  $response->getBody()->write(json_encode($messages));
  return $response->withHeader('Content-Type', 'application/json')->withStatus(200);
});

$app->get('/v1/messages/total', function (Request $request, Response $response, $args) {
  global $main_conn, $__MESSAGES;
  $queryParams = $request->getQueryParams();
  $category = $queryParams['category'] ?? null;

  $messages_query = "SELECT COUNT(*) AS `TOTAL` FROM `$__MESSAGES`";

  if ($category) {
    $category = strtoupper($category);
    $messages_query = "SELECT COUNT(*) AS `TOTAL` FROM `$__MESSAGES` 
                      WHERE `CATEGORY_LABEL` = '$category'";
  }

  $results = $main_conn->query($messages_query);
  $row = $results->fetch_assoc();
  $total = array(
    'TOTAL_MESSAGES' => $row['TOTAL']
  );
  $response->getBody()->write(json_encode($total));
  return $response->withHeader('Content-Type', 'application/json')->withStatus(200);
});

$app->post("/v1/websites", function (Request $request, Response $response) {
  global $main_conn, $__WEBSITES, $__WEBSITES_CHILDREN;

  $body = $request->getParsedBody();
  $files = $request->getUploadedFiles();

  $original_price = clean_txt($body['__ORIGINAL_PRICE']);
  $offer_price = clean_txt($body['__SALE_PRICE']);

  $site_title = strtoupper(clean_txt($body['__SITE_TITLE']));
  $site_code = strtoupper(clean_txt($body['__SITE_CODE']));
  $site_url = strtolower(clean_txt($body['__SITE_URL']));

  $logo = $files['__LOGO'];
  $logo_file_path = __ASSETS . "/websites_logos/" . strtolower($site_code) . ".png";

  // Check whether thumbs/, screens/, subsites_logos/ & websites_logos/ exist
  if (!is_dir(__ASSETS . "/thumbs"))  mkdir(__ASSETS . "/thumbs");
  if (!is_dir(__ASSETS . "/screens"))  mkdir(__ASSETS . "/screens");
  if (!is_dir(__ASSETS . "/subsites_logos"))  mkdir(__ASSETS . "/subsites_logos");
  if (!is_dir(__ASSETS . "/websites_logos"))  mkdir(__ASSETS . "/websites_logos");

  // Check if directories related to the website already exists..
  if (
    is_dir(__ASSETS . "/thumbs/$site_code") ||
    is_dir(__ASSETS . "/screens/$site_code") ||
    is_dir(__ASSETS . "/subsites_logos/$site_code") ||
    is_file(__ASSETS . '/websites_logos/' . strtolower($site_code) . '.png')
  ) {
    $response->getBody()->write('ERROR: Website already exists!');
    return $response->withHeader('Content-Type', 'text/text')->withStatus(409);
  }

  // Create thumbs/ & thumbs/blur/
  mkdir(__ASSETS . "/thumbs/$site_code");
  mkdir(__ASSETS . "/thumbs/$site_code/blur");
  // Create screens/ & screens/blur/
  mkdir(__ASSETS . "/screens/$site_code");
  mkdir(__ASSETS . "/screens/$site_code/blur");
  // Create subsites_logos/ & subsites_logos/blur
  mkdir(__ASSETS . "/subsites_logos/$site_code/");
  mkdir(__ASSETS . "/subsites_logos/$site_code/blur/");

  // Upload logo
  $logo->moveTo($logo_file_path);

  $new_website_query = "INSERT INTO `$__WEBSITES` VALUES('$site_code', '$site_title', '$site_url', $original_price, $offer_price, DEFAULT, DEFAULT)";
  $new_children_website_query = "INSERT INTO `$__WEBSITES_CHILDREN` VALUES('$site_code', '')";

  try {
    $main_conn->begin_transaction();
    // Create New Website Record
    $main_conn->query($new_website_query);
    // Create New Website's Children Record
    $main_conn->query($new_children_website_query);
    $main_conn->commit();
  } catch (Throwable $error) {
    $main_conn->rollback();
    $response->getBody()->write("Internal Server Error\n$error");
    return $response->withHeader('Content-Type', 'text/text')->withStatus(503);
  }

  // Modify & Upload Thumbnail Pictures
  for ($i = 1; $i <= 3; $i++) {
    $file = $files["__PICTURE_$i"];
    $picture = new Imagick();
    $picture->readImageBlob($file->getStream()->getContents());
    $picture_scale = $body["__PICTURE_$i" . "_SCALE"];

    $origin_arr = explode('/', $body["__PICTURE_$i" . '_COORDS']);
    $new_width = (int) (($picture->getImageWidth() / $picture->getImageHeight()) * 500) * $picture_scale;
    $new_height = (int) 500 * $picture_scale;

    $picture_final_path = __ASSETS . "/thumbs/$site_code/" . '/' . strtolower($site_title) . "_$i.jpg";
    $picture->resizeImage($new_width, $new_height, Imagick::FILTER_UNDEFINED, 0);
    $picture->cropImage(510, 510, (int) $origin_arr[0], (int) $origin_arr[1]);
    $picture->setImageCompressionQuality(80);
    $picture->writeImage($picture_final_path);

    $blurred_picture = clone $picture;
    $blurred_picture_final_path = __ASSETS . "/thumbs/$site_code/blur/" . strtolower($site_title) . "_$i.jpg";
    $blurred_picture->blurImage(4, 4);
    $blurred_picture->scaleImage($blurred_picture->getImageWidth() / 2, 0);
    $blurred_picture->setImageCompressionQuality(50);
    $blurred_picture->writeImage($blurred_picture_final_path);
  }

  $response->getBody()->write("Website \"$site_title\" created");
  return $response->withHeader('Content-Type', 'text/text')->withStatus(201);
});

$app->post("/v1/accounts", function (Request $request, Response $response) {
  require_once __DIR__ . '/fun/accounts.php';
  global $main_conn, $__ACCOUNTS;

  $id = new_id();
  $body = $request->getParsedBody();
  $website = clean_txt($body['__WEBSITE']);
  $nickname = clean_txt($body['__NICK']);
  $password = clean_txt($body['__PASS']);
  $price = clean_txt($body['__PRICE']);
  $offers = clean_txt($body['__OFFERS']);
  $vendor = clean_txt($body['__VENDOR']);
  $warranty_begins = clean_txt($body['__WBEGINS']);
  $warranty_ends = clean_txt($body['__WENDS']);

  if ($id && $nickname && $password && $website && $offers && $price && $vendor && $warranty_begins && $warranty_ends) {
    $new_account_query = "INSERT INTO `$__ACCOUNTS` (`ACCOUNT_ID`, `SITE_CODE`, `ACCOUNT_NICK`, `ACCOUNT_PASS`, `PRICE_PAID`,
                          `VENDOR_ID`, `WARRANTY_BEGINS`, `WARRANTY_ENDS`, `ACCESS_STATE`, `N_AVAILABLE`, `N_SOLD`)
                          VALUES('$id', '$website', '$nickname', '$password', '$price', '$vendor', 
                          '$warranty_begins', '$warranty_ends', 1, '$offers', 0)";

    $final_result = $main_conn->query($new_account_query);

    if (!$final_result) {
      $response->getBody()->write("Something went wrong");
      return $response->withHeader('Content-Type', 'text/text')->withStatus(500);
    }
  } else {
    $response->getBody()->write("Incomplete data supplied.");
    return $response->withHeader('Content-Type', 'text/text')->withStatus(200);
  }

  $response->getBody()->write("Account created.");
  return $response->withHeader('Content-Type', 'text/text')->withStatus(201);
});

$app->post("/v1/subsites", function (Request $request, Response $response) {
  global $main_conn, $__WEBSITES_CHILDREN;

  $body = $request->getParsedBody();
  $files = $request->getUploadedFiles();

  $logo_file = $files['__LOGO'];
  $picture_file = $files['__PICTURE'];

  $subtitle = strtolower((clean_txt($body['__SUBTITLE'])));
  $site_code = strtoupper(clean_txt(($body['__SITE_CODE'])));

  // Get All Children Subsites First
  try {
    $children_query = "SELECT `CHILDREN` FROM `$__WEBSITES_CHILDREN` WHERE `SITE_CODE` = '$site_code'";
    $children_results = $main_conn->query($children_query);
    $children = $children_results->fetch_array();
    $children = explode('/', $children['CHILDREN']);
  } catch (Throwable $error) {
    $response->getBody()->write("Something went wrong.");
    return $response->withHeader('Content-Type', 'text/text')->withStatus(500);
  }

  if (in_array($subtitle, $children)) {
    $response->getBody()->write("ERROR: Subsite already exists.");
    return $response->withHeader('Content-Type', 'text/text')->withStatus(409);
  }

  // Get Important Picture's Data
  $picture_origin = clean_txt($body['__ORIGIN']);
  $picture_scale = clean_txt($body['__SCALE']);

  // Get Origin Coordenates
  $origin = explode('/', $picture_origin);
  $x = $origin[0];
  $y = ($picture_scale != 1) ? $origin[1] : 0;

  /**
   * Screen Picture Resizing And Cropping
   */

  // Create New Resource Pictures
  $original_picture = new Imagick();
  $original_picture->readImageBlob($picture_file->getStream()->getContents());
  $blurred_picture = clone $original_picture;
  // Resize Resource Picture
  $original_picture->scaleImage(0, (500 * $picture_scale));
  // Crop Picture With Origin Point
  $original_picture->cropImage(310, 500, $x, $y);
  // Save Original Picture
  $original_picture->writeImage(__ASSETS . "/screens/$site_code/" . "$subtitle.jpg");
  // Config Blurred Image
  $blurred_picture->scaleImage(0, $blurred_picture->getImageHeight() / 2);
  $blurred_picture->cropImage(310, 500, $x, $y);
  $blurred_picture->blurImage(16, 16);
  // Save Blurred Image
  $blurred_picture->writeImage(__ASSETS . "/screens/$site_code/blur/" . "$subtitle.jpg");

  // Create New Logo Pictures
  $logo_picture = new Imagick();
  $logo_picture->readImageBlob($logo_file->getStream()->getContents());
  $logo_picture_blurred = clone $logo_picture;
  $logo_picture_reduced = clone $logo_picture;
  // Blurred Logo Picture Resize & Blur
  $logo_picture_blurred->scaleImage((int) ($logo_picture_blurred->getImageWidth() / 10), 0);
  $logo_picture_blurred->blurImage(16, 8);
  // Reduced Logo Picture Resize
  $aspect_ration = (float) $logo_picture_reduced->getImageWidth() / $logo_picture_reduced->getImageHeight();

  // Validate aspect ratio of logo
  if ($aspect_ration <= 2.5)
    $logo_picture_reduced->scaleImage(0, 75);
  elseif ($aspect_ration > 2.5)
    $logo_picture_reduced->scaleImage(150, 0);

  // Upload Logo Files
  $logo_picture->writeImage(__ASSETS . "/subsites_logos/$site_code/" . "$subtitle.png");
  $logo_picture_blurred->writeImage(__ASSETS . "/subsites_logos/$site_code/blur/" . "$subtitle.png");

  if ($children[0] === '') {
    $new_children = "$subtitle";
  } else {
    $new_children = implode('/', $children) . "/$subtitle";
  }

  try {
    $main_conn->begin_transaction();
    $new_children_query = "UPDATE `$__WEBSITES_CHILDREN` SET `CHILDREN` = '$new_children' WHERE `SITE_CODE` = '$site_code'";
    $main_conn->query($new_children_query);
    $main_conn->commit();
  } catch (Throwable $error) {
    $main_conn->rollback();
    $response->getBody()->write("Something went wrong.");
    return $response->withHeader('Content-Type', 'text/text')->withStatus(500);
  }

  $response->getBody()->write("Subsite Created.");
  return $response->withHeader('Content-Type', 'text/text')->withStatus(201);
});

$app->post("/v1/vendors", function (Request $request, Response $response) {
  global $main_conn, $__VENDORS;

  // Create vendors/ if it does not exist already
  if (!is_dir(__ASSETS . '/vendors')) {
    mkdir(__ASSETS . '/vendors');
  }

  $body = $request->getParsedBody();
  $files = $request->getUploadedFiles();

  $vendor_id = strtoupper(clean_txt($body['__VENDOR_ID']));
  $vendor_email = strtolower(clean_txt($body['__VENDOR_EMAIL']));
  $vendor_url = strtolower(clean_txt($body['__VENDOR_URL']));
  $vendor_picture_file = $files['__AVATAR'];

  $date = date('Y-m-d');
  $image_uri = strtolower($vendor_id) . '.png';

  try {
    $main_conn->begin_transaction();
    $vendor_query = "INSERT INTO `$__VENDORS` VALUES('$vendor_id', '$vendor_email', '$vendor_url', '$date', NULL)";
    $main_conn->query($vendor_query);
    $main_conn->commit();
  } catch (Throwable $error) {
    $main_conn->rollback();
    $response->getBody()->write("Something went wrong.");
    return $response->withHeader('Content-Type', 'text/text')->withStatus(500);
  }

  $vendor_picture = new Imagick();
  $vendor_picture->readImageBlob($vendor_picture_file->getStream()->getContents());
  $vendor_picture->scaleImage(98, 0);
  $vendor_picture->writeImage(__ASSETS . '/vendors/' . $image_uri);

  $response->getBody()->write("Vendor Created.");
  return $response->withHeader('Content-Type', 'text/text')->withStatus(201);
});

$app->post("/v1/websites/logo", function (Request $request, Response $response) {
  global $main_conn, $__WEBSITES;

  $body = $request->getParsedBody();
  $files = $request->getUploadedFiles();

  $site_code = strtolower(clean_txt($body['__SITE_CODE']));
  $site_code_query = "SELECT * FROM `$__WEBSITES` WHERE `SITE_CODE` = '$site_code'";

  $logo_file = $files['__NEW_LOGO'];
  $logo_path = __ASSETS . "/websites_logos/$site_code" . ".png";

  $website_results = $main_conn->query($site_code_query);

  if ($website_results->num_rows && $logo_file->getError() === UPLOAD_ERR_OK) {
    $logo_file->moveTo($logo_path);
    $response->getBody()->write("Logo file was modified.");
    return $response->withHeader('Content-Type', 'text/text')->withStatus(200);
  }

  $response->getBody()->write("No resource was modified.");
  return $response->withHeader('Content-Type', 'text/text')->withStatus(200);
});

$app->patch('/v1/accounts', function (Request $request, Response $response) {
  require_once __DIR__ . '/fun/accounts.php';
  global $main_conn, $__ACCOUNTS;

  $body = $request->getParsedBody();

  $account_id = clean_txt($body['__ACCOUNT_ID']);
  $update_str = createMultipleColumnUpdateString($body);

  $update_account_query = "UPDATE `$__ACCOUNTS`
                          SET $update_str
                          WHERE `ACCOUNT_ID` = '$account_id'";

  try {
    $main_conn->query($update_account_query);
  } catch (Throwable $error) {
    $response->getBody()->write("Something went wrong while trying to update account \"$account_id\"");
    return $response->withHeader('Content-Type', 'text/text')->withStatus(500);
  }

  $response->getBody()->write("Account \"$account_id\" has been updated.");
  return $response->withHeader('Content-Type', 'text/text')->withStatus(200);
});

$app->patch('/v1/accounts/kill', function (Request $request, Response $response) {
  global $main_conn, $__ACCOUNTS, $__ACCOUNTS_KILLED;

  $body = $request->getParsedBody();

  $account_id = clean_txt($body['__ACCOUNT_ID']);
  $action_date = date('Y-m-d');

  $account_query = "SELECT * FROM `$__ACCOUNTS` WHERE `ACCOUNT_ID` = '$account_id'";
  $account_results = $main_conn->query($account_query);

  if (!$account_results->num_rows) {
    $response->getBody()->write("Something went wrong while trying to update account \"$account_id\"");
    return $response->withHeader('Content-Type', 'text/text')->withStatus(500);
  }

  try {
    $main_conn->begin_transaction();
    $disable_account_query = "UPDATE `$__ACCOUNTS` SET `ACCESS_STATE` = 0 WHERE `ACCOUNT_ID` = '$account_id'";
    $killed_account_query = "INSERT INTO `$__ACCOUNTS_KILLED` VALUES('$account_id', 'KILLED', '$action_date')";
    $main_conn->query($disable_account_query);
    $main_conn->query($killed_account_query);
    $main_conn->commit();
  } catch (Throwable $error) {
    $main_conn->rollback();
    $response->getBody()->write("Something went wrong while trying to update account \"$account_id\"");
    return $response->withHeader('Content-Type', 'text/text')->withStatus(500);
  }

  $response->getBody()->write("Account \"$account_id\" has been updated");
  return $response->withHeader('Content-Type', 'text/text')->withStatus(200);
});

$app->patch('/v1/accounts/revive', function (Request $request, Response $response) {
  global $main_conn, $__ACCOUNTS, $__ACCOUNTS_KILLED;

  $body = $request->getParsedBody();

  $account_id = clean_txt($body['__ACCOUNT_ID']);

  $account_query = "SELECT * FROM `$__ACCOUNTS` WHERE `ACCOUNT_ID` = '$account_id' AND `ACCESS_STATE` = 0";
  $account_results = $main_conn->query($account_query);

  if (!$account_results->num_rows) {
    $response->getBody()->write("Something went wrong while trying to update account \"$account_id\"");
    return $response->withHeader('Content-Type', 'text/text')->withStatus(500);
  }

  try {
    $main_conn->begin_transaction();
    $revive_account_query = "UPDATE `$__ACCOUNTS` SET `ACCESS_STATE` = 1 WHERE `ACCOUNT_ID` = '$account_id'";
    $remove_killed_account_query = "DELETE FROM `$__ACCOUNTS_KILLED` WHERE `ACCOUNT_ID` = '$account_id'";
    $main_conn->query($revive_account_query);
    $main_conn->query($remove_killed_account_query);
    $main_conn->commit();
  } catch (Throwable $error) {
    $main_conn->rollback();
    $response->getBody()->write("Something went wrong while trying to update account \"$account_id\"");
    return $response->withHeader('Content-Type', 'text/text')->withStatus(500);
  }

  $response->getBody()->write("Account \"$account_id\" has been updated");
  return $response->withHeader('Content-Type', 'text/text')->withStatus(200);
});

$app->patch('/v1/reclaims/resolve', function (Request $request, Response $response) {
  global $main_conn, $__RECLAIMS;

  $body = $request->getParsedBody();
  
  $reclaim_id = clean_txt($body['__RECLAIM_ID']);

  $reclaim_query = "SELECT * FROM `$__RECLAIMS` WHERE `RECLAIM_ID` = '$reclaim_id'";
  $resolve_reclaim_query = "UPDATE `$__RECLAIMS` 
                            SET `STATUS` = 1 
                            WHERE `RECLAIM_ID` = '$reclaim_id'";
  $reclaim_results = $main_conn->query($reclaim_query);

  if (!$reclaim_results->num_rows) {
    $response->getBody()->write("Something went wrong while trying to resolve reclaim \"$reclaim_id\"");
    return $response->withHeader('Content-Type', 'text/text')->withStatus(500);
  }

  $main_conn->query($resolve_reclaim_query);

  $response->getBody()->write("Account \"$reclaim_id\" has been updated");
  return $response->withHeader('Content-Type', 'text/text')->withStatus(200);
});

$app->run();

function clean_txt(string $txt)
{
  $txt = trim($txt);
  $txt = htmlentities($txt);
  $txt = stripslashes($txt);
  return $txt;
}
