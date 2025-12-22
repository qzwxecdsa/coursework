import { AbstractComponent } from "./abstract-component.js";

export default class StoreManagementComponent extends AbstractComponent {
    constructor(stores, onAddStore, onDeleteStore) {
        super();
        this.stores = stores;
        this.onAddStore = onAddStore;
        this.onDeleteStore = onDeleteStore;
    }

    get template() {
        return `
            <div class="stores-management">
                <h3><i>🏪</i> Управление магазинами</h3>
                <div class="form-group">
                    <input type="text" id="new-store-name" placeholder="Название нового магазина">
                    <button id="add-store-btn" class="btn-small">Добавить магазин</button>
                </div>
                <div class="stores-list" id="stores-list-container">
                    ${this.renderStoresList()}
                </div>
            </div>
        `;
    }

    renderStoresList() {
        if (this.stores.length === 0) {
            return '<div class="empty-state">Добавьте магазины для сравнения цен</div>';
        }

        return this.stores.map(store => `
            <div class="store-item" data-id="${store.id}">
                <div class="store-info">
                    <span class="store-name">${store.name}</span>
                    ${store.address ? `<span class="store-address">${store.address}</span>` : ''}
                </div>
                <div class="store-actions">
                    <button class="btn-small btn-danger delete-store-btn" data-id="${store.id}">Удалить</button>
                </div>
            </div>
        `).join('');
    }

    afterRender() {
        const addButton = this.element.querySelector('#add-store-btn');
        const newStoreInput = this.element.querySelector('#new-store-name');
        
        if (addButton && newStoreInput) {
            addButton.addEventListener('click', () => {
                const storeName = newStoreInput.value.trim();
                if (storeName && this.onAddStore) {
                    this.onAddStore(storeName);
                    newStoreInput.value = '';
                    newStoreInput.focus();
                }
            });
        }

        const deleteButtons = this.element.querySelectorAll('.delete-store-btn');
        deleteButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const storeId = e.target.dataset.id;
                if (storeId && this.onDeleteStore) {
                    this.onDeleteStore(storeId);
                }
            });
        });
    }

    update(stores) {
        this.stores = stores;
        const storesContainer = this.element.querySelector('#stores-list-container');
        if (storesContainer) {
            storesContainer.innerHTML = this.renderStoresList();
            this.afterRender();
        }
    }
}