export class AbstractComponent {
    constructor() {
        if (new.target === AbstractComponent) {
            throw new Error('Can\'t instantiate AbstractComponent, only concrete one.');
        }
        this._element = null;
    }

    get element() {
        if (!this._element) {
            this._element = this.createElement(this.template);
            if (typeof this.afterRender === 'function') {
                this.afterRender();
            }
        }
        return this._element;
    }

    get template() {
        throw new Error('Abstract method not implemented: get template');
    }

    createElement(template) {
        const newElement = document.createElement('div');
        newElement.innerHTML = template;
        return newElement.firstElementChild;
    }

    removeElement() {
        if (this._element) {
            this._element.remove();
        }
        this._element = null;
    }
}