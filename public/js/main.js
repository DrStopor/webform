/**
 * Используется jQuery
 * @type {jQuery}
 * @version 3.6.0
 * Для форматирования кода использовался плагин Prettier
 */
$(document).ready(function () {
  initRenderMessagesWithPagination();
  setInterval(getSequence, 60000);

  $("#message_send").on("click", function (event) {
    handlerSendButton(event);
  });
});

/**
 * Default object for ajax request
 * @type {{type: string, dataType: string, data: {action: string}}}
 */
const objDef = {
  type: "POST",
  dataType: "json",
  data: {
    action: "test",
    _token: document.querySelector('meta[name="csrf-token"]').content,
  },
};
/**
 * Last sequence of messages
 * @type {number}
 */
let globalLastSequence = 0;
/**
 * Время анимации по умолчанию
 * @type {number}
 */
const durationDefault = 100;

/**
 * Обработчик кнопки отправки сообщения
 * @param event
 */
function handlerSendButton(event) {
  const ajaxObject = Object.assign({}, objDef);
  ajaxObject.data = Object.assign({}, objDef.data);
  ajaxObject.data.action = "save";
  const form = $(event.target).parents("form");
  form.find("input,textarea").each(function (_, obj) {
    const jObj = $(obj);
    const fieldName = jObj.prop("id");
    const fieldValue = jObj.val();
    const isRequired = jObj.prop("required");
    const minLength = jObj.prop("minlength") || jObj.prop("minLength");
    const maxLength = jObj.prop("maxlength") || jObj.prop("maxLength");
    let error = [];

    if (isRequired && fieldValue === "") {
        error.push("Поле обязательно для заполнения");
    }
    if (minLength !== undefined && fieldValue.length < minLength) {
        error.push(`Минимальная длина поля ${minLength} символов`);
    }
    if (maxLength !== undefined && fieldValue.length > maxLength) {
        error.push(`Максимальная длина поля ${maxLength} символов`);
    }

    if (error.length > 0) {
        jObj.addClass("is-invalid");
        jObj.removeClass("is-valid");
        let html = "";
        for (let i = 0; i < error.length; i++) {
            html += `<div class="invalid-feedback">${error[i]}</div>`;
        }
        jObj.parent().find(".invalid-feedback").remove();
        jObj.after(html);
        return;
    }

    ajaxObject.data[fieldName] = jObj.val();
  });

    $.ajax(ajaxObject)
      .done(function (data) {
        const notificationBlock = $(".container .notification");
        notificationBlock.fadeOut({ duration: durationDefault });
        notificationBlock.html("");
        if (data.error.length > 0) {
          notificationBlock.html(data.error.html);
          notificationBlock.fadeIn({ duration: durationDefault });
          clearBlockAfterTimeout(notificationBlock);
          return;
        }

        notificationBlock.html(data.data.html);
        notificationBlock.fadeIn({ duration: durationDefault });
        clearBlockAfterTimeout(notificationBlock);

        initRenderMessagesWithPagination();
      })
      .fail(function (data) {
        console.warn(data);
      });
}

/**
 * Скрытие блока через определенное время
 * @param {jQuery} block
 * @param {number} timeout
 * @param {number} durationTime
 */
function clearBlockAfterTimeout(block, timeout = 5000, durationTime = durationDefault) {
  setTimeout(() => {
    block.fadeOut({ duration: durationTime });
  }, timeout);
}

/**
 * Получение последнего sequence
 */
function getSequence() {
  const ajaxObject = Object.assign({}, objDef);
  ajaxObject.data = Object.assign({}, objDef.data);
  ajaxObject.data.action = "getSequence";

  $.ajax(ajaxObject)
    /** @param {{error: string, data: {sequence: number}}} data */
    .done(function (data) {
      if (data.error.length > 0) {
        return;
      }
      if (
        data.data.sequence !== undefined &&
        data.data.sequence > globalLastSequence
      ) {
        globalLastSequence = data.data.sequence;
        const toastContainer = $(".toast-container");
        toastContainer.html(data.data.html);
        $(".toast").show(durationDefault);
        clearBlockAfterTimeout(toastContainer, 3000, 1000);
      }
    })
    .fail(function (data) {
      console.warn(data);
    });
}

/**
 * Отрисовка сообщений с пагинацией
 * @param {HTMLElement | number} element
 */
function renderMessagesWithPagination(element) {
  let currentPage = Number(element.dataset.page) || 1;
  const ajaxObject = Object.assign({}, objDef);
  ajaxObject.data = Object.assign({}, objDef.data);
  ajaxObject.data.action = "getMessagesWithPagination";
  ajaxObject.data.page = currentPage;
  $.ajax(ajaxObject)
    /** @param {{error: string, data: {messages: string, pagination: {page: number, total: number, html: string}}}} data */
    .done(function (data) {
      const notificationBlock = $(".container .content .notification");
      notificationBlock.fadeOut({ duration: durationDefault });
      notificationBlock.html("");
      if (data.error.length > 0) {
        let html = `<div class="alert alert-danger" role="alert">${data.error}</div>`;
        notificationBlock.html(html);
        notificationBlock.fadeIn({ duration: durationDefault });
        clearBlockAfterTimeout(notificationBlock);
        return;
      }

      const messagesBlock = $(".container .content .messages");
      messagesBlock.fadeOut({ duration: 250 });
      messagesBlock.html(data.data.messages);
      messagesBlock.fadeIn({ duration: 250 });

        const paginationBlock = $(".container .content .pagination");
        paginationBlock.html(data.data.pagination.html);
    })
    .fail(function (data) {
      const notificationBlock = $(".container .notification");
      let html = `<div class="alert alert-warning" role="alert">${data.message}</div>`;
      notificationBlock.html(html);
      notificationBlock.fadeIn({ duration: durationDefault });
      clearBlockAfterTimeout(notificationBlock);
    });
}

/**
 * Стартовая отрисовки сообщений с пагинацией
 */
function initRenderMessagesWithPagination() {
  const ajaxObject = Object.assign({}, objDef);
  ajaxObject.data = Object.assign({}, objDef.data);
  ajaxObject.data.action = "getMessagesWithPagination";
  ajaxObject.data.page = 1;
  $.ajax(ajaxObject)
    /** @param {{error: string, data: {messages: [], pagination: {page: number, total: number}}}} data */
    .done(function (data) {
      const messagesBlock = $(".container .content .messages");
      messagesBlock.fadeOut({ duration: durationDefault });
      messagesBlock.html("");
      if (data.error.length > 0) {
        let html = `<div class="alert alert-danger" role="alert">${data.error}</div>`;
        messagesBlock.html(html);
        messagesBlock.fadeIn({ duration: durationDefault });
        clearBlockAfterTimeout(messagesBlock);
        return;
      }

        const paginationBlock = $(".container .content .pagination-container");
        paginationBlock.html(data.data.pagination.html);
      messagesBlock.fadeOut({ duration: durationDefault });
      messagesBlock.html(data.data.messages);
      messagesBlock.fadeIn({ duration: durationDefault });
    })
    .fail(function (data) {
      const notificationBlock = $(".container .notification");
      let html = `<div class="alert alert-warning" role="alert">${data.message}</div>`;
      notificationBlock.html(html);
      notificationBlock.fadeIn({ duration: durationDefault });
      clearBlockAfterTimeout(notificationBlock);
    });
}
