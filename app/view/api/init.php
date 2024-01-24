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
                    <input type="text" class="form-control" id="name" aria-describedby="nameHelp">
                    <div id="nameHelp" class="form-text">Представьтесь</div>
                </div>
                <div class="mb-3">
                    <label for="user_text" class="form-label">Отзыв</label>
                    <textarea class="form-control" id="user_text" rows="3"></textarea>
                </div>
                <div class="d-grid">
                    <button type="button" class="btn btn-primary mb-3" id="message_send">Отправить</button>
                </div>
            </form>
        </div>
        <div class="col-8">
            <div class="content">
                <div class="messages">
                    <div class="message" id="message_1">
                        <div class="header__message">an1</div>
                        <div class="body__message">
                            Lorem ipsum dolor sit amet, consectetur adipisicing elit. Blanditiis excepturi laboriosam
                            laborum nisi quam quod repudiandae saepe temporibus voluptatum! Excepturi iure labore magni,
                            molestiae non omnis recusandae totam veniam vitae.
                        </div>
                        <div class="time__message">22.01.2024 11:51</div>
                    </div>
                    <div class="message" id="message_2">
                        <div class="header__message">an2</div>
                        <div class="body__message">
                            Lorem ipsum dolor sit amet, consectetur adipisicing elit. Atque cupiditate doloremque earum,
                            eum excepturi ipsa labore quo sunt suscipit vitae! Aspernatur,
                            at deleniti doloribus eius incidunt numquam optio quae quia.
                        </div>
                        <div class="time__message">22.01.2024 14:01</div>
                    </div>
                </div>
                <div class="pagination-container"></div>
            </div>
        </div>
    </div>
</div>

<div class="toast-container"></div>