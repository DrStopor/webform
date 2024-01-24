<?php

use Imy\Core\Cache;
use Imy\Core\Controller;
use Imy\Core\Tools;

/**
 * Контроллер для работы с API
 * Class ApiController
 */
class ApiController extends Controller
{
    /** @var int $messagesPerPage Количество сообщений на одной странице */
    private int $messagesPerPage = 10;

    /**
     * @return void
     */
    final public function init(): void
    {
        $this->v['name'] = 'Тестовое задание';
    }

    /**
     * Основной метод для работы с API
     * @return void
     */
    final public function ajax(): void
    {
        if (!CsrfGenerator::check($this->request->post('_token'))) {
            $this->response([
                'code' => 200,
                'error' => [
                    'message' => 'Invalid token',
                    'code' => '403'
                ]
            ]);
        }

        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            $this->response([
                'code' => 200,
                'error' => [
                    'message' => 'Method not allowed',
                    'code' => '405'
                ]
            ]);
        }
    }

    /**
     * Сохранение сообщения
     * @return void
     */
    final public function ajax_save(): void
    {
        $userName = Tools::secureText(trim($this->request->post('name')));
        $message = Tools::secureText(trim($this->request->post('user_text')));

        if (empty($userName) || empty($message)) {
            $this->response([
                'code' => 200,
                'error' => [
                    'message' => trim(
                        'Не заполнены обязательные поля: '
                        . (empty($userName) ? 'Имя ' : '')
                        . (empty($message) ? 'Отзыв' : '')
                    ),
                    'code' => '400'
                ]
            ]);
        }

        $entity = M('messages')->factory()
            ->setValue(
                'user_name',
                Tools::secureText(trim($this->request->post('name')))
            )
            ->setValue(
                'message',
                Tools::secureText(trim($this->request->post('user_text')))
            );

        $result = $entity->save();

        $data = [
            'saved' => (bool)$result,
            'message' => $result ? 'Сообщение успешно сохранено' : 'Ошибка сохранения сообщения. ' . ($entity->last_error ?? '')
        ];

        $response = [
            'code' => 200,
            'error' => '',
            'data' => $data
        ];

        $this->v += $response;
    }

    /**
     * Получение сообщений
     * @return void
     */
    final public function ajax_getMessages(): void
    {
        $response = [
            'code' => 200,
            'error' => '',
            'data' => [
                'messages' => [],
                'pagination' => [
                    'page' => 1,
                    'total' => 1,
                ]
            ]
        ];

        $cache = new Cache();
        $messages = $cache->get('messages');
        if ($messages) {
            $response['data']['messages'] = $messages;
            $this->v += $response;
            return;
        }

        $entity = M('messages')->factory();
        $messages = $entity->get()->orderBy('cdate', 'DESC')->fetchAll();

        if (!$messages) {
            $this->v += $response;
            return;
        }

        $messages = array_map(static function ($message) {
            return [
                'id' => $message->id,
                'user_name' => $message->user_name,
                'message' => $message->message,
                'date' => $message->cdate
            ];
        }, $messages);

        $cache->set('messages', $messages, 60);
        $response['data']['messages'] = $messages;

        $this->v += $response;
    }

    /**
     * Получение id последнего сообщения
     * @return void
     */
    final public function ajax_getSequence(): void
    {
        $response = [
            'code' => 200,
            'error' => '',
            'data' => [
                'sequence' => null
            ]
        ];

        $cache = new Cache();
        $sequence = $cache->get('sequence');
        if ($sequence) {
            $response['data']['sequence'] = $sequence;
            $this->v = array_merge($this->v, $response);
            return;
        }

        $entity = M('messages')->factory();
        $sequence = $entity->get()->orderBy('id', 'DESC')->limit(1)->fetch();

        if (!$sequence) {
            $this->v = array_merge($this->v, $response);
            return;
        }

        $cache->set('sequence', $sequence->id, 60);

        $response['data']['sequence'] = $sequence->id;
        $this->v = array_merge($this->v, $response);
    }

    /**
     * Получение сообщений (ограниченное количество на странице) с пагинацией
     * @return void
     */
    final public function ajax_getMessagesWithPagination(): void
    {
        $page = $this->request->post('page');
        if (!$page || !is_numeric($page)) {
            $page = 1;
        }

        $response = [
            'code' => 200,
            'error' => '',
            'data' => [
                'messages' => [],
                'pagination' => [
                    'page' => (int)$page,
                    'total' => 1,
                ]
            ]
        ];

        $cache = new Cache();
        $totalPages = $cache->get('totalPages');
        $messagesOnPage = $cache->get('messages_page_' . $page);

        if (!$totalPages) {
            $entity = M('messages')->factory();
            $totalMessages = $entity->get()->count();
            $totalPages = (int)ceil($totalMessages / $this->messagesPerPage);
            $cache->set('totalPages', $totalPages, 120);
        }

        if (!$messagesOnPage) {
            $entity = M('messages')->factory();
            $messagesOnPage = $entity->get()->orderBy('cdate', 'DESC')->limit($this->messagesPerPage)->offset(($page - 1) * $this->messagesPerPage)->fetchAll();
            if (count($messagesOnPage) > 0) {
                $cache->set('messages_page_' . $page, $messagesOnPage, 120);
            }
        }

        if (!$messagesOnPage) {
            $this->v += $response;
            return;
        }

        $messagesOnPage = array_map(static function ($message) {
            return [
                'id' => $message->id,
                'user_name' => $message->user_name,
                'message' => $message->message,
                'date' => $message->cdate
            ];
        }, $messagesOnPage);

        $response['data']['messages'] = $messagesOnPage;
        $response['data']['pagination']['total'] = $totalPages;

        $this->v += $response;
    }

    /**
     * Тестовый метод
     * @return void
     */
    final public function ajax_test(): void
    {
        $this->response([
            'code' => 200,
            'error' => '',
            'data' => [
                'test' => 'test'
            ]
        ]);
    }
}