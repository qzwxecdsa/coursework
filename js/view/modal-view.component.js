import { AbstractComponent } from "../../framework/abstract-component.js";

export default class ModalView extends AbstractComponent {
    constructor(type, title) {
        super();
        this.type = type;
        this.title = title;
    }

    get template() {
        return `
            <div id="${this.type}-modal" class="modal" style="display: none;">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3 class="modal-title">${this.title}</h3>
                        <button class="close-btn">&times;</button>
                    </div>
                    <div id="${this.type}-modal-body"></div>
                    <div class="modal-actions">
                        <button class="btn-secondary" id="${this.type}-cancel-modal">Отмена</button>
                        <button class="btn-success" id="${this.type}-save-modal">Сохранить</button>
                    </div>
                </div>
            </div>
        `;
    }

    get modalBody() {
        return this.element.querySelector(`#${this.type}-modal-body`);
    }

    show() {
        this.element.style.display = 'flex';
    }

    hide() {
        this.element.style.display = 'none';
    }
}