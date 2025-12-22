import { AbstractComponent } from "./abstract-component.js";

export default class HeaderComponent extends AbstractComponent {
    constructor(title, subtitle) {
        super();
        this.title = title;
        this.subtitle = subtitle;
    }

    get template() {
        return `
            <header>
                <h1>${this.title}</h1>
                ${this.subtitle ? `<p>${this.subtitle}</p>` : ''}
            </header>
        `;
    }
}