import { AbstractComponent } from "../../framework/abstract-component.js";
import { NOTIFICATION_TYPES } from "../const.js";

export default class NotificationView extends AbstractComponent {
    constructor(message, type = NOTIFICATION_TYPES.SUCCESS) {
        super();
        this.message = message;
        this.type = type;
        this.timeout = null;
    }

    get template() {
        return `
            <div class="notification ${this.type}">
                <div class="notification-content">
                    ${this.getMessageIcon()}
                    <span class="notification-text">${this.message}</span>
                    <button class="notification-close">&times;</button>
                </div>
            </div>
        `;
    }

    getMessageIcon() {
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        return `<span class="notification-icon">${icons[this.type] || icons.info}</span>`;
    }

    afterRender() {
        this.timeout = setTimeout(() => {
            this.hide();
        }, 5000);

        const closeButton = this.element.querySelector('.notification-close');
        if (closeButton) {
            closeButton.addEventListener('click', () => this.hide());
        }

        setTimeout(() => {
            this.element.classList.add('show');
        }, 100);
    }

    show() {
        this.element.classList.add('show');
    }

    hide() {
        this.element.classList.remove('show');
        setTimeout(() => {
            if (this.element && this.element.parentNode) {
                this.element.parentNode.removeChild(this.element);
            }
        }, 300);
        
        if (this.timeout) {
            clearTimeout(this.timeout);
        }
    }

    removeElement() {
        if (this.timeout) {
            clearTimeout(this.timeout);
        }
        super.removeElement();
    }
}