<?php

require_once dirname(dirname(__FILE__)) . "/resources.php";

use Psr\Http\Message\ResponseFactoryInterface;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Server\MiddlewareInterface;
use Psr\Http\Server\RequestHandlerInterface;

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class AuthMiddleware implements MiddlewareInterface
{

  private ResponseFactoryInterface $responseFactory;

  function __construct(ResponseFactoryInterface $responseFactory)
  {
    $this->responseFactory = $responseFactory;
  }

  function process(Request $request, RequestHandlerInterface $handler): Response
  {
    $key = $_ENV['SECRET'];

    if (!isset($_SESSION['jwt'])) {
      $response = $this->responseFactory->createResponse(401);
      $response->getBody()->write("Unauthorized (missing session)");
      return $response->withStatus(401);
    }

    $jwt = $_SESSION['jwt'];
    $jwt_decoded = NULL;

    try {
      $jwt_decoded = JWT::decode($jwt, new Key($key, 'HS256'));
    } catch (Exception $e) {
      $response = $this->responseFactory->createResponse(401);
      $response->getBody()->write("Unauthorized");
      return $response->withStatus(401);
    }

    $isTokenExpired = $this->checkTokenExp($jwt_decoded);

    if ($isTokenExpired) {
      $response = $this->responseFactory->createResponse(401);
      return $response->withHeader('Location', $_ENV['ROOT_DIR'] . '/logout')->withStatus(302);
    }

    return $handler->handle($request);
  }

  function checkTokenExp(stdClass $obj)
  {
    $exp_date = $obj->exp;

    if ($exp_date && $exp_date < time()) {
      return true;
    }

    return false;
  }
}
