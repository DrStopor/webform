<?php

use Imy\Core\Config;

/**
 * Класс для генерации и проверки CSRF токена
 * Class CsrfGenerator
 */
class CsrfGenerator
{
    /**
     * Генерация токена
     * @return string
     */
    public static function generate(): string
    {
        $salt = Config::get('salt');
        $token = md5(uniqid(mt_rand(), true));
        $expire = time() + 3600;
        $_SESSION['csrf_token'] = $token;
        $_SESSION['csrf_expire'] = $expire;
        $decodingSession = base64_encode($salt . serialize($_SESSION));
        $token .= ':' . $decodingSession;
        return $token;
    }

    /**
     * Проверка токена
     * @param string $token
     * @return bool
     */
    public static function check(string $token): bool
    {
        $salt = Config::get('salt');
        $parts = explode(':', $token);
        $decodingSession = base64_decode($parts[1]);
        $session = unserialize(substr($decodingSession, strlen($salt)), ['allowed_classes' => false]);
        return $session['csrf_token'] === $parts[0] && $session['csrf_expire'] >= time();
    }
}