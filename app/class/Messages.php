<?php

use Imy\Core\Entity;

class Messages extends Entity
{
    private string $table = 'messages';

    public function __construct()
    {
        $this->entity = $this->table;
        parent::__construct($this->table);
    }


    /**
     * Сохранение нового сообщения
     * @param array $data
     * @return bool
     */
    public static function saveNew(array $data): bool
    {
        return (new Messages())->create($data);
    }

    /**
     * Всего сообщений
     * @return int
     */
    public function getTotal()
    {
        return $this->model->get()->count();
    }

    /**
     * Получение сообщений для страницы
     * @param int $page
     * @param int $messagesPerPage
     * @return array
     */
    final public function getMessagesWithPagination(int $page, int $messagesPerPage): array
    {
        return $this->model->get()->orderBy('cdate', 'DESC')->limit($messagesPerPage)->offset(($page - 1) * $messagesPerPage)->fetchAll();
    }

    /**
     * Получение последнего ID
     * @return int
     */
    public static function getSequence(): int
    {
        return (new Messages())->model->get()->max('id');
    }
}