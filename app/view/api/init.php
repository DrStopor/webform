<?php
/**
 * @var $name string
 */
?>
<div class="header">
    <div class="container">
        <div class="row">
            <div class="col-12">
                <div class="header__title">
                    <h1><?= $name ?></h1>
                </div>
            </div>
        </div>
    </div>
</div>

<div class="container">
    <div class="row">
        <div class="notification" style="display: none">
            <div class="alert alert-success" role="alert">
            </div>
        </div>
    </div>
    <div class="row">
        <div class="col-4">
            <form>
                <div class="mb-3">
                    <label for="name" class="form-label">Имя</label>
                    <input type="text" class="form-control" id="name" aria-describedby="nameHelp" minlength="2" maxlength="128" required>
                    <div id="nameHelp" class="form-text">Представьтесь</div>
                </div>
                <div class="mb-3">
                    <label for="user_text" class="form-label">Отзыв</label>
                    <textarea class="form-control" id="user_text" rows="3" minlength="2" maxlength="2056" required></textarea>
                </div>
                <div class="d-grid">
                    <button type="button" class="btn btn-primary mb-3" id="message_send">Отправить</button>
                </div>
            </form>
        </div>
        <div class="col-8">
            <div class="content">
                <div class="messages">
                    <p>
                        <h3>
                        Сообщений нет
                        </h3>
                    </p>
                </div>
                <div class="pagination-container"></div>
            </div>
        </div>
    </div>
</div>

<div class="toast-container"></div>