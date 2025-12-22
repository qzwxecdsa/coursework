import { AbstractComponent } from "./abstract-component.js";
import { PAGE_IDS } from "../const.js";

export default class NavigationComponent extends AbstractComponent {
    constructor(activePage = PAGE_IDS.SHOPPING_LIST) {
        super();
        this.activePage = activePage;
    }

    get template() {
        return `
            <div class="navigation">
                <button class="nav-btn ${this.activePage === PAGE_IDS.SHOPPING_LIST ? 'active' : ''}" 
                        data-page="${PAGE_IDS.SHOPPING_LIST}">
                    <i>📋</i> Список покупок
                </button>
                <button class="nav-btn ${this.activePage === PAGE_IDS.PRICE_COMPARISON ? 'active' : ''}" 
                        data-page="${PAGE_IDS.PRICE_COMPARISON}">
                    <i>🏪</i> Сравнение цен
                </button>
                <button class="nav-btn ${this.activePage === PAGE_IDS.ANALYTICS ? 'active' : ''}" 
                        data-page="${PAGE_IDS.ANALYTICS}">
                    <i>📊</i> Аналитика
                </button>
            </div>
        `;
    }
}