// Находим все кнопки "Оценить"
var buttons = document.querySelectorAll('.open-modal-button');

// Для каждой кнопки добавляем обработчик события
buttons.forEach(function(button) {
    // Находим соответствующее модальное окно по id
    var modal = document.getElementById(button.id);

    // Находим элемент <span>, который закрывает модальное окно
    var span = modal.querySelector(".close");

    // Когда пользователь нажимает на кнопку, открываем модальное окно
    button.onclick = function() {
        modal.style.display = "block";
    }

    // Когда пользователь нажимает на <span> (x), закрываем модальное окно
    span.onclick = function() {
        modal.style.display = "none";
    }

    // Когда пользователь щелкает в любом месте за пределами модального окна, закрываем его
    window.onclick = function(event) {
        if (event.target === modal) {
            modal.style.display = "none";
        }
    }
});


buttons.forEach(button => {
    button.addEventListener('click', event => {
        const answerId = event.target.dataset.answerId;

        fetch(`/answer/${answerId}/check`, { method: 'POST' })
            .then(response => {
                if (response.ok) {
                    // Обновление статуса на клиенте
                    event.target.style.display = 'none';
                    // Вывод сообщения об успешном обновлении
                    alert('Статус обновлен!');
                } else {
                    // Вывод сообщения об ошибке
                    alert('Ошибка при обновлении статуса!');
                }
            })
            .catch(error => {
                // Вывод сообщения об ошибке
                alert('Ошибка при обновлении статуса!');
            });
    });
});

