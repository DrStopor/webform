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
    /** @var int Минимальная длина имени */
    private const MIN_NAME_LENGTH = 2;
    /** @var int Максимальная длина имени */
    private const MAX_NAME_LENGTH = 128;
    /** @var int Минимальная длина сообщения */
    private const MIN_MESSAGE_LENGTH = 2;
    /** @var int Максимальная длина сообщения */
    private const MAX_MESSAGE_LENGTH = 2056;
    /** @var int $messagesPerPage Количество сообщений на одной странице */
    private int $messagesPerPage = 10;

    private array $defaultResponse = [
        'code' => 200,
        'error' => [],
        'data' => []
    ];

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
            $this->response(
                $this->getResponse([
                    'code' => 403,
                    'error' => Tools::get_include_contents(tpl('tpl/notice'), [
                        'message' => 'Ошибка CSRF токена',
                        'alertClass' => 'alert-danger'
                    ])
                ])
            );
        }

        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            $this->response(
                $this->getResponse([
                    'code' => 405,
                    'error' => Tools::get_include_contents(tpl('tpl/notice'), [
                        'message' => 'Метод не разрешен',
                        'alertClass' => 'alert-danger'
                    ])
                ])
            );
        }
    }

    /**
     * Сохранение сообщения
     * @return void
     */
    final public function ajax_save(): void
    {
        $values = $this->validateFieldWithError();

        $saved = Messages::saveNew($values);

        $this->v += $this->getResponse([
            'data' => [
                'saved' => $saved,
                'html' => Tools::get_include_contents(tpl('tpl/notice'), [
                    'message' => $saved ? 'Сообщение успешно сохранено' : 'Ошибка сохранения сообщения',
                    'alertClass' => $saved ? 'alert-success' : 'alert-danger'
                ])
            ],
            'error' => $saved ? [] : ['message' => 'Ошибка сохранения сообщения']
        ]);
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
            $this->v += $this->getResponse($response);
            return;
        }

        $sequence = Messages::getSequence();

        if (!$sequence) {
            $this->v += $this->getResponse($response);
            return;
        }

        $cache->set('sequence', $sequence, 60);

        $response['data'] = [
            'sequence' => $sequence,
            'html' => Tools::get_include_contents(tpl('tpl/toast'))
        ];
        $this->v += $this->getResponse($response);
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
        } else {
            $page = (int)$page;
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

        $messageEntity = new Messages();

        if (!$totalPages) {
            $totalMessages = $messageEntity->getTotal();
            $totalPages = (int)ceil($totalMessages / $this->messagesPerPage);
            $cache->set('totalPages', $totalPages, 120);
        }

        if (!$messagesOnPage) {
            $messagesOnPage = $messageEntity->getMessagesWithPagination((int)$page, $this->messagesPerPage);
            if (count($messagesOnPage) > 0) {
                $cache->set('messages_page_' . $page, $messagesOnPage, 120);
            }
        }

        if (!$messagesOnPage) {
            $this->v += $this->getResponse($response);
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

        $messagesTpl = Tools::get_include_contents(tpl('tpl/messages'), [
            'messages' => $messagesOnPage
        ]);

        $paginationTpl = Tools::get_include_contents(tpl('tpl/pagination'), [
            'currentPage' => $page,
            'totalPages' => $totalPages
        ]);
        $response['data']['messages'] = $messagesTpl;
        $response['data']['pagination'] = [
            'page' => $page,
            'total' => $totalPages,
            'html' => $paginationTpl
        ];
        $this->v += $this->getResponse($response);
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

    private function getResponse(array $response): array
    {
        return array_merge($this->defaultResponse, $response);
    }

    /**
     * @return array
     */
    private function validateFieldWithError(): array
    {
        $fields = [
            'user_name' => [
                'min' => self::MIN_NAME_LENGTH,
                'max' => self::MAX_NAME_LENGTH
            ],
            'message' => [
                'min' => self::MIN_MESSAGE_LENGTH,
                'max' => self::MAX_MESSAGE_LENGTH
            ]
        ];

        $values = [];
        $errors = [];

        foreach ($fields as $field => $length) {
            $value = Tools::secureText(trim($this->request->post($field)));
            $values[$field] = $value;
            if (empty($value)) {
                $errors[] = "Не заполнено обязательное поле: $field";
                continue;
            }
            if (mb_strlen($value) < $length['min'] || mb_strlen($value) > $length['max']) {
                $errors[] = "Неверная длина поля $field. Допустимая длина от {$length['min']} до {$length['max']} символов";
            }
        }

        if (!empty($errors)) {
            $this->response(
                $this->getResponse([
                    'code' => 400,
                    'error' => Tools::get_include_contents(tpl('tpl/notice'), [
                        'message' => implode('<br>', $errors),
                        'alertClass' => 'alert-warning'
                    ])
                ])
            );
        }
        return $values;
    }
}