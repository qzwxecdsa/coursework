import { AbstractComponent } from "../../framework/abstract-component.js";

export default class StoreListView extends AbstractComponent {
    constructor(stores, onStoreClick, onStoreDelete) {
        super();
        this.stores = stores;
        this.onStoreClick = onStoreClick;
        this.onStoreDelete = onStoreDelete;
    }

    get template() {
        if (this.stores.length === 0) {
            return `<div class="empty-state">Добавьте магазины для сравнения цен</div>`;
        }

        return `
            <div class="stores-list">
                ${this.stores.map(store => `
                    <div class="store-item" data-id="${store.id}">
                        <div class="store-info">
                            <span class="store-name">${store.name}</span>
                            ${store.address ? `<span class="store-address">${store.address}</span>` : ''}
                            ${store.rating ? `<span class="store-rating">⭐ ${store.rating}</span>` : ''}
                        </div>
                        <div class="store-actions">
                            <button class="btn-small btn-secondary select-store" data-id="${store.id}">Выбрать</button>
                            <button class="btn-small btn-danger delete-store" data-id="${store.id}">Удалить</button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    afterRender() {
        const selectButtons = this.element.querySelectorAll('.select-store');
        const deleteButtons = this.element.querySelectorAll('.delete-store');

        selectButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const storeId = e.target.dataset.id;
                if (this.onStoreClick) {
                    this.onStoreClick(storeId);
                }
            });
        });

        deleteButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const storeId = e.target.dataset.id;
                if (this.onStoreDelete) {
                    this.onStoreDelete(storeId);
                }
            });
        });
    }
}