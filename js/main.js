import ShoppingMainPresenter from "./presenters/shopping-main.presenter.js";

class MainApp {
    constructor() {
        this.mainPresenter = null;
        this.init();
    }

    init() {
        try {
            this.mainPresenter = new ShoppingMainPresenter();
            window.app = this;
            
        } catch (error) {
            this.showErrorPage();
        }
    }

    showErrorPage() {
        document.body.innerHTML = `
            <div class="container">
                <div class="error-page" style="text-align: center; padding: 50px;">
                    <h1 style="color: #dc3545;">
                        <i class="fas fa-exclamation-triangle"></i> Ошибка загрузки приложения
                    </h1>
                    <p>Произошла ошибка при загрузке Умного списка покупок.</p>
                    <p>Пожалуйста, обновите страницу или попробуйте позже.</p>
                    <button onclick="location.reload()" class="btn-success" style="margin-top: 20px;">
                        <i class="fas fa-redo"></i> Обновить страницу
                    </button>
                </div>
            </div>
        `;
    }
}
window.addEventListener('beforeunload', (event) => {
    if (model && typeof model.saveAllData === 'function') {
        event.preventDefault();
        event.returnValue = 'Данные не сохранены. Уйти со страницы?';
        
        model.saveAllData().then(() => {
        });
    }
});
document.addEventListener('DOMContentLoaded', () => {
    new MainApp();
});