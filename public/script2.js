// JavaScript-код для отображения модального окна
const openModalButtons = document.querySelectorAll('.open-modal-button');

openModalButtons.forEach(button => {
    button.addEventListener('click', () => {
        const teamId = button.dataset.teamId;
        const modal = document.getElementById(`team-modal-${teamId}`);
        modal.style.display = "block";
    });
});

// закрытие модального окна при нажатии на крестик
const closeButtons = document.querySelectorAll('.close');

closeButtons.forEach(button => {
    button.addEventListener('click', () => {
        const modal = button.parentElement.parentElement;
        modal.style.display = "none";
    });
});
