/**
 * Используется jQuery
 * @type {jQuery}
 * @version 3.6.0
 * Для форматирования кода использовался плагин Prettier
 */
$(document).ready(function () {
  //renderMessages();
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
    ajaxObject.data[jObj.prop("id")] = jObj.val();
  });

  $.ajax(ajaxObject)
    /** @param {{error: string, data: {saved: boolean, message: string}}} data */
    .done(function (data) {
      const notificationBlock = $(".container .notification");
      if (data.error !== "") {
        let html = `<div class="alert alert-danger" role="alert">${data.error}</div>`;
        notificationBlock.html(html);
        notificationBlock.fadeIn({ duration: 100 });
        clearBlockAfterTimeout(notificationBlock);
        return;
      }

      if (data.data.saved !== true) {
        let html = `<div class="alert alert-danger" role="alert">${data.data.message}</div>`;
        notificationBlock.html(html);
        notificationBlock.fadeIn({ duration: 100 });
        clearBlockAfterTimeout(notificationBlock);
        return;
      }

      let html = `<div class="alert alert-success" role="alert">${data.data.message}</div>`;
      notificationBlock.html(html);
      notificationBlock.fadeIn({ duration: 100 });
      clearBlockAfterTimeout(notificationBlock);
      renderMessages();
    })
    .fail(function (data) {
      const notificationBlock = $(".container .notification");
      let html = `<div class="alert alert-warning" role="alert">${data.message}</div>`;
      notificationBlock.html(html);
      notificationBlock.fadeIn({ duration: 100 });
      clearBlockAfterTimeout(notificationBlock);
    });
}

/**
 * Отрисовка всех сообщений
 * @note Не используется
 */
function renderMessages() {
  const ajaxObject = Object.assign({}, objDef);
  ajaxObject.data = Object.assign({}, objDef.data);
  ajaxObject.data.action = "getMessages";
  $.ajax(ajaxObject)
    /** @param {{error: string, data: {messages: [], message: string}}} data */
    .done(function (data) {
      const notificationBlock = $(".container .content .messages");
      notificationBlock.fadeOut({ duration: 100 });
      notificationBlock.html("");
      if (data.error !== "") {
        let html = `<div class="alert alert-danger" role="alert">${data.error}</div>`;
        notificationBlock.html(html);
        notificationBlock.fadeIn({ duration: 100 });
        clearBlockAfterTimeout(notificationBlock);
        return;
      }

      let html = "";
      /** @param { messages: [user_name: string, message: string, date: string, id: number] } messages */
      const messages = data.data.messages;
      if (messages.length === 0) {
        html = `<div class="alert alert-warning" role="alert">Сообщений нет</div>`;
        notificationBlock.html(html);
        notificationBlock.fadeIn({ duration: 100 });
        clearBlockAfterTimeout(notificationBlock);
        return;
      }

      for (let i = 0; i < messages.length; i++) {
        html += `
<div class="row g-0 border rounded overflow-hidden flex-md-row mb-4 shadow-sm h-md-250 position-relative" id="message_${messages[i].id}">
    <div class="col p-4 d-flex flex-column position-static">
        <h3 class="mb-0">${messages[i].user_name}</h3>
        <div class="mb-1 text-muted">Отправлено: ${messages[i].date}</div>
        <p class="mb-auto">${messages[i].message}</p>
    </div>
</div>
`;
      }

      notificationBlock.html(html);
      notificationBlock.fadeIn({ duration: 100 });
    })
    .fail(function (data) {
      const notificationBlock = $(".container .notification");
      let html = `<div class="alert alert-warning" role="alert">${data.message}</div>`;
      notificationBlock.html(html);
      notificationBlock.fadeIn({ duration: 100 });
      clearBlockAfterTimeout(notificationBlock);
    });
}

/**
 * Скрытие блока через определенное время
 * @param {jQuery} block
 * @param {number} timeout
 * @param {number} durationTime
 */
function clearBlockAfterTimeout(block, timeout = 5000, durationTime = 100) {
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
      if (data.error !== "") {
        return;
      }
      if (
        data.data.sequence !== undefined &&
        data.data.sequence > globalLastSequence
      ) {
        globalLastSequence = data.data.sequence;
        renderToast();
      }
    })
    .fail(function (data) {
      console.warn(data);
    });
}

/**
 * Отрисовка всплывающего сообщения
 */
function renderToast() {
  const toastContainer = $(".toast-container");
  const html = `
<div class="position-fixed bottom-0 end-0 p-3" style="z-index: 11">
<div class="toast align-items-center text-white bg-info border-0" role="alert" aria-live="assertive" aria-atomic="true">
  <div class="d-flex">
    <div class="toast-body">
        Появились новые сообщения
    </div>
    <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
  </div>
</div>
</div>
`;
  toastContainer.html(html);
  $(".toast").show(100);
  clearBlockAfterTimeout(toastContainer, 3000, 1000);
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
    /** @param {{error: string, data: {messages: [], pagination: {page: number, total: number}}}} data */
    .done(function (data) {
      const notificationBlock = $(".container .content .notification");
      notificationBlock.fadeOut({ duration: 100 });
      notificationBlock.html("");
      if (data.error !== "") {
        let html = `<div class="alert alert-danger" role="alert">${data.error}</div>`;
        notificationBlock.html(html);
        notificationBlock.fadeIn({ duration: 100 });
        clearBlockAfterTimeout(notificationBlock);
        return;
      }

      let html = "";
      /** @param { messages: [user_name: string, message: string, date: string, id: number] } messages */
      const messages = data.data.messages;
      if (messages.length === 0) {
        html = `<div class="alert alert-warning" role="alert">Сообщений нет</div>`;
        notificationBlock.html(html);
        notificationBlock.fadeIn({ duration: 100 });
        clearBlockAfterTimeout(notificationBlock);
        return;
      }

      let htmlMessages = "";
      for (let i = 0; i < messages.length; i++) {
        htmlMessages += `
<div class="row g-0 border rounded overflow-hidden flex-md-row mb-4 shadow-sm h-md-250 position-relative" id="message_${messages[i].id}">
    <div class="col p-4 d-flex flex-column position-static">
        <h3 class="mb-0">${messages[i].user_name}</h3>
        <div class="mb-1 text-muted">Отправлено: ${messages[i].date}</div>
        <p class="mb-auto">${messages[i].message}</p>
    </div>
</div>
`;
      }
      const messagesBlock = $(".container .content .messages");
      messagesBlock.fadeOut({ duration: 250 });
      messagesBlock.html(htmlMessages);
      messagesBlock.fadeIn({ duration: 250 });

      let paginationHtml = "";
      /** @param {{page: number, total: number}} pagination */
      const pagination = data.data.pagination;
      if (Object.keys(pagination).length > 0) {
        const paginationBlock = $(".container .content .pagination");
        paginationHtml = `
<nav aria-label="paginator">
<ul class="pagination pagination-md">
`;
        for (let i = 1; i <= pagination.total; i++) {
          if (i === pagination.page) {
            paginationHtml += `<li class="page-item active" aria-current="page">
        <span class="page-link">${i}</span>
        </li>`;
            continue;
          }
          paginationHtml += `<li class="page-item"><a class="page-link" href="#" data-page="${i}" onclick="renderMessagesWithPagination(this)">${i}</a></li>`;
        }
        paginationHtml += `</ul></nav>`;

        paginationBlock.html(paginationHtml);
      }
    })
    .fail(function (data) {
      const notificationBlock = $(".container .notification");
      let html = `<div class="alert alert-warning" role="alert">${data.message}</div>`;
      notificationBlock.html(html);
      notificationBlock.fadeIn({ duration: 100 });
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
      messagesBlock.fadeOut({ duration: 100 });
      messagesBlock.html("");
      if (data.error !== "") {
        let html = `<div class="alert alert-danger" role="alert">${data.error}</div>`;
        messagesBlock.html(html);
        messagesBlock.fadeIn({ duration: 100 });
        clearBlockAfterTimeout(messagesBlock);
        return;
      }

      let html = "";
      /** @param { messages: [user_name: string, message: string, date: string, id: number] } messages */
      const messages = data.data.messages;
      if (messages.length === 0) {
        html = `<div class="alert alert-warning" role="alert">Сообщений нет</div>`;
        messagesBlock.html(html);
        messagesBlock.fadeIn({ duration: 100 });
        clearBlockAfterTimeout(messagesBlock);
        return;
      }

      for (let i = 0; i < messages.length; i++) {
        html += `
<div class="row g-0 border rounded overflow-hidden flex-md-row mb-4 shadow-sm h-md-250 position-relative" id="message_${messages[i].id}">
    <div class="col p-4 d-flex flex-column position-static">
        <h3 class="mb-0">${messages[i].user_name}</h3>
        <div class="mb-1 text-muted">Отправлено: ${messages[i].date}</div>
        <p class="mb-auto">${messages[i].message}</p>
    </div>
</div>
`;
      }

      let paginationHtml = "";
      /** @param {{page: number, total: number}} pagination */
      const pagination = data.data.pagination;

      if (Object.keys(pagination).length > 0) {
        const paginationBlock = $(".container .content .pagination-container");
        paginationHtml = `
<nav aria-label="paginator">
<ul class="pagination pagination-md">
`;
        for (let i = 1; i <= pagination.total; i++) {
          if (i === pagination.page) {
            paginationHtml += `<li class="page-item active" aria-current="page">
            <span class="page-link">${i}</span>
            </li>`;
            continue;
          }
          paginationHtml += `<li class="page-item"><a class="page-link" href="#" data-page="${i}" onclick="renderMessagesWithPagination(this)">${i}</a></li>`;
        }
        paginationHtml += `</ul></nav>`;
        paginationBlock.html(paginationHtml);
      }
      messagesBlock.fadeOut({ duration: 100 });
      messagesBlock.html(html);
      messagesBlock.fadeIn({ duration: 100 });
    })
    .fail(function (data) {
      const notificationBlock = $(".container .notification");
      let html = `<div class="alert alert-warning" role="alert">${data.message}</div>`;
      notificationBlock.html(html);
      notificationBlock.fadeIn({ duration: 100 });
      clearBlockAfterTimeout(notificationBlock);
    });
}

function generateCSRFToken() {
  const token = document.querySelector('meta[name="csrf-token"]').content;
  return token;
}
