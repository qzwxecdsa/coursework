import ShoppingListView from "../view/shopping-list-view.component.js";
import ProductItemView from "../view/product-item-view.component.js";
import StoreListView from "../view/store-list-view.component.js";
import NotificationView from "../view/notification-view.component.js";
import ModalView from "../view/modal-view.component.js";
import ApiSearchComponent from "../view/api-search.component.js";
import { render, RenderPosition } from "../../framework/render.js";
import { SORT_TYPES, FILTER_TYPES, NOTIFICATION_TYPES, MODAL_TYPES } from "../const.js";

export default class ShoppingListPresenter {
    constructor(model, container) {
        this.model = model;
        this.container = container;
        this.view = new ShoppingListView();
        this.selectedStoreFilter = null;
        this.currentFilter = FILTER_TYPES.ALL;
        this.sortBy = SORT_TYPES.DEFAULT;
        this.sortDirection = 'asc';
        this.searchTerm = '';
        
        this.priceModal = null;
        this.listModal = null;
        this.apiSearchComponent = null;
        this.currentProduct = null;
        
        
        this.model.addObserver(() => this.handleModelChange());
    }

    init() {
        this.container.innerHTML = '';
        render(this.view, this.container);
        this.createModals();
        this.setupEventListeners();
        this.renderAll();
        
        this.addApiSearchComponent();
    }

    addApiSearchComponent() {
        const apiSearchContainer = document.createElement('div');
        apiSearchContainer.id = 'api-search-container';
        this.view.element.querySelector('.left-column').appendChild(apiSearchContainer);
        
        this.apiSearchComponent = new ApiSearchComponent(
            this.model,
            (product) => this.handleApiProductImported(product)
        );
        render(this.apiSearchComponent, apiSearchContainer);
    }

    handleApiProductImported(product) {
        this.showNotification(`Товар "${product.name}" импортирован из API`, NOTIFICATION_TYPES.SUCCESS);
        this.renderProducts();
    }

    createModals() {
        this.priceModal = new ModalView(MODAL_TYPES.PRICE, 'Цены для товара');
        render(this.priceModal, document.body);
        
        this.listModal = new ModalView(MODAL_TYPES.LIST, 'Создать новый список');
        render(this.listModal, document.body);
        
        this.setupModalHandlers();
    }

    setupModalHandlers() {
        const priceSaveBtn = document.getElementById('price-save-modal');
        const priceCancelBtn = document.getElementById('price-cancel-modal');
        const priceCloseBtn = this.priceModal.element.querySelector('.close-btn');
        
        if (priceSaveBtn) priceSaveBtn.addEventListener('click', () => this.handleSavePrices());
        if (priceCancelBtn) priceCancelBtn.addEventListener('click', () => this.priceModal.hide());
        if (priceCloseBtn) priceCloseBtn.addEventListener('click', () => this.priceModal.hide());
        
        const listSaveBtn = document.getElementById('list-save-modal');
        const listCancelBtn = document.getElementById('list-cancel-modal');
        const listCloseBtn = this.listModal.element.querySelector('.close-btn');
        
        if (listSaveBtn) listSaveBtn.addEventListener('click', () => this.handleSaveList());
        if (listCancelBtn) listCancelBtn.addEventListener('click', () => this.listModal.hide());
        if (listCloseBtn) listCloseBtn.addEventListener('click', () => this.listModal.hide());
        
        [this.priceModal.element, this.listModal.element].forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.style.display = 'none';
                }
            });
        });
    }

    setupEventListeners() {
        const createListBtn = this.view.createListButton;
        if (createListBtn) {
            createListBtn.addEventListener('click', () => this.showCreateListModal());
        }

        const addProductBtn = this.view.addProductButton;
        if (addProductBtn) {
            addProductBtn.addEventListener('click', () => this.handleAddProduct());
        }

        const clearListBtn = this.view.clearListButton;
        if (clearListBtn) {
            clearListBtn.addEventListener('click', () => this.handleClearList());
        }

        const markAllBtn = this.view.markAllCompletedButton;
        if (markAllBtn) {
            markAllBtn.addEventListener('click', () => this.handleMarkAllCompleted());
        }

        const addStoreBtn = this.view.addStoreButton;
        if (addStoreBtn) {
            addStoreBtn.addEventListener('click', () => this.handleAddStore());
        }

        const sortByPriceBtn = this.view.sortByPriceButton;
        if (sortByPriceBtn) {
            sortByPriceBtn.addEventListener('click', () => this.handleSortBy('price'));
        }

        const sortByPriorityBtn = this.view.sortByPriorityButton;
        if (sortByPriorityBtn) {
            sortByPriorityBtn.addEventListener('click', () => this.handleSortBy('priority'));
        }

        const searchInput = this.view.searchInput;
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
        }
    }

    showCreateListModal() {
        this.listModal.modalBody.innerHTML = `
            <div class="form-group">
                <label for="new-list-name">Название списка</label>
                <input type="text" id="new-list-name" placeholder="Например: Еженедельные покупки">
            </div>
        `;
        
        this.listModal.show();
        
        const input = this.listModal.modalBody.querySelector('#new-list-name');
        if (input) input.focus();
    }

    handleSaveList() {
        const input = this.listModal.modalBody.querySelector('#new-list-name');
        if (input && input.value.trim()) {
            const listName = input.value.trim();
            
            if (typeof this.model.createList === 'function') {
                this.model.createList(listName);
            } else {
                const newList = {
                    id: `list-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    name: listName,
                    createdAt: new Date().toISOString(),
                    products: []
                };
                
                this.model.shoppingLists.push(newList);
                this.model.currentListId = newList.id;
                this.model._notify();
            }
            
            this.showNotification('Новый список создан!', NOTIFICATION_TYPES.SUCCESS);
            this.listModal.hide();
        }
    }

    handleAddProduct() {
        const nameInput = this.view.productNameInput;
        const categorySelect = this.view.productCategorySelect;
        const quantityInput = this.view.productQuantityInput;
        const prioritySelect = this.view.productPrioritySelect;
        
        const name = nameInput ? nameInput.value.trim() : '';
        
        if (!name) {
            this.showNotification('Введите название товара', NOTIFICATION_TYPES.ERROR);
            return;
        }

        const productData = {
            name: name,
            category: categorySelect ? categorySelect.value : 'Продукты',
            quantity: quantityInput ? parseInt(quantityInput.value) || 1 : 1,
            priority: prioritySelect ? prioritySelect.value : 'medium'
        };


        if (typeof this.model.addProduct === 'function') {
            try {
                const product = this.model.addProduct(productData);
                if (product) {
                    this.showNotification(`Товар "${name}" добавлен`, NOTIFICATION_TYPES.SUCCESS);
                    
                    if (nameInput) nameInput.value = '';
                    if (quantityInput) quantityInput.value = '1';
                    if (nameInput) nameInput.focus();
                }
            } catch (error) {
                this.addProductDirectly(productData);
            }
        } else {
            this.addProductDirectly(productData);
        }
    }

    addProductDirectly(productData) {
        const currentList = this.model.currentList;
        if (!currentList) {
            this.showNotification('Нет активного списка', NOTIFICATION_TYPES.ERROR);
            return;
        }

        const newProduct = {
            id: `product-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: productData.name,
            category: productData.category || 'Продукты',
            quantity: productData.quantity || 1,
            priority: productData.priority || 'medium',
            prices: {},
            completed: false,
            importedFromApi: false,
            apiProductId: null,
            notes: 'Добавлен вручную'
        };

        currentList.products.push(newProduct);
        this.model._notify();
        
        const nameInput = this.view.productNameInput;
        const quantityInput = this.view.productQuantityInput;
        
        if (nameInput) nameInput.value = '';
        if (quantityInput) quantityInput.value = '1';
        if (nameInput) nameInput.focus();
        
        this.showNotification(`Товар "${productData.name}" добавлен`, NOTIFICATION_TYPES.SUCCESS);
    }

    handleClearList() {
        const currentList = this.model.currentList;
        if (!currentList || currentList.products.length === 0) {
            this.showNotification('Список уже пуст', NOTIFICATION_TYPES.INFO);
            return;
        }

        if (confirm(`Очистить список "${currentList.name}"? (${currentList.products.length} товаров)`)) {
            currentList.products = [];
            this.model._notify();
            this.showNotification('Список очищен', NOTIFICATION_TYPES.SUCCESS);
        }
    }

    handleMarkAllCompleted() {
        const currentList = this.model.currentList;
        if (!currentList || currentList.products.length === 0) {
            this.showNotification('Список пуст', NOTIFICATION_TYPES.INFO);
            return;
        }

        const allCompleted = currentList.products.every(p => p.completed);
        
        currentList.products.forEach(product => {
            product.completed = !allCompleted;
        });
        this.model._notify();
        this.showNotification(allCompleted ? 'Все товары возобновлены' : 'Все товары отмечены как купленные', NOTIFICATION_TYPES.SUCCESS);
    }

    handleAddStore() {
        const newStoreInput = this.view.newStoreInput;
        if (newStoreInput && newStoreInput.value.trim()) {
            const storeName = newStoreInput.value.trim();
            

            
            if (typeof this.model.addStore === 'function') {
                try {
                    this.model.addStore(storeName);
                    this.showNotification(`Магазин "${storeName}" добавлен`, NOTIFICATION_TYPES.SUCCESS);
                    newStoreInput.value = '';
                    newStoreInput.focus();
                } catch (error) {
                    this.addStoreDirectly(storeName);
                }
            } else {
                this.addStoreDirectly(storeName);
            }
        } else {
            this.showNotification('Введите название магазина', NOTIFICATION_TYPES.ERROR);
        }
    }

    addStoreDirectly(storeName) {
        const newStore = {
            id: `store-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: storeName.trim(),
            address: 'Адрес не указан',
            rating: 4.0
        };

        this.model.stores.push(newStore);
        this.model._notify();
        
        const newStoreInput = this.view.newStoreInput;
        if (newStoreInput) {
            newStoreInput.value = '';
            newStoreInput.focus();
        }
        
        this.showNotification(`Магазин "${storeName}" добавлен`, NOTIFICATION_TYPES.SUCCESS);
    }

    handleSortBy(sortType) {
        if (this.sortBy === sortType) {
            this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            this.sortBy = sortType;
            this.sortDirection = 'asc';
        }
        
        this.updateSortButtons();
        this.renderProducts();
    }

    handleSearch(searchTerm) {
        this.searchTerm = searchTerm.toLowerCase().trim();
        this.renderProducts();
    }

    renderAll() {
        this.renderLists();
        this.renderProducts();
        this.renderStores();
        this.renderStoreFilters();
        this.updateSortButtons();
        this.updateListStats();
    }

    renderLists() {
        const container = this.view.listsContainer;
        if (!container) return;
        
        container.innerHTML = '';
        
        if (!this.model.shoppingLists || this.model.shoppingLists.length === 0) {
            container.innerHTML = '<div class="empty-state"><i>📋</i><p>Создайте свой первый список</p></div>';
            return;
        }
        
        this.model.shoppingLists.forEach(list => {
            const listCard = document.createElement('div');
            listCard.className = `list-card ${list.id === this.model.currentListId ? 'active' : ''}`;
            
            const completedCount = list.products ? list.products.filter(p => p.completed).length : 0;
            const totalCount = list.products ? list.products.length : 0;
            const completionPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
            const totalCost = list.products ? list.products.reduce((sum, product) => {
                const cheapestPrice = this.model.getCheapestPrice ? this.model.getCheapestPrice(product) : 
                    Object.values(product.prices || {}).length > 0 ? Math.min(...Object.values(product.prices || {})) : 0;
                return sum + (cheapestPrice ? cheapestPrice * product.quantity : 0);
            }, 0) : 0;
            
            listCard.innerHTML = `
                <div class="list-header">
                    <div class="list-name">${list.name || 'Без названия'}</div>
                    <div class="list-status ${completionPercent === 100 ? 'completed' : ''}">
                        ${completionPercent}%
                    </div>
                </div>
                <div class="list-stats">
                    <div class="stat">
                        <span class="stat-label">Товаров</span>
                        <span class="stat-value">${totalCount}</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">Куплено</span>
                        <span class="stat-value">${completedCount}</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">Стоимость</span>
                        <span class="stat-value">${totalCost.toFixed(2)} ₽</span>
                    </div>
                </div>
            `;
            
            listCard.addEventListener('click', () => {
                if (this.model.currentListId !== list.id) {
                    this.model.currentListId = list.id;
                    if (typeof this.model._notify === 'function') {
                        this.model._notify();
                    }
                }
            });
            
            container.appendChild(listCard);
        });
    }

    renderProducts() {
        const container = this.view.productsContainer;
        if (!container) return;
        
        const currentList = this.model.currentList;
        
        if (!currentList) {
            container.innerHTML = '<div class="empty-state"><i>📋</i><p>Выберите или создайте список</p></div>';
            return;
        }
        
        let products = currentList.products ? [...currentList.products] : [];
        
        if (this.selectedStoreFilter) {
            products = products.filter(product => product.prices && product.prices[this.selectedStoreFilter]);
        }
        
        if (this.currentFilter === FILTER_TYPES.COMPLETED) {
            products = products.filter(product => product.completed);
        } else if (this.currentFilter === FILTER_TYPES.PENDING) {
            products = products.filter(product => !product.completed);
        }
        
        if (this.searchTerm) {
            products = products.filter(product => 
                product.name.toLowerCase().includes(this.searchTerm) ||
                (product.category && product.category.toLowerCase().includes(this.searchTerm))
            );
        }
        
        products.sort((a, b) => {
            let valueA, valueB;
            
            switch(this.sortBy) {
                case SORT_TYPES.PRICE:
                    const getCheapestPrice = (product) => {
                        if (!product.prices || Object.keys(product.prices).length === 0) return 0;
                        return Math.min(...Object.values(product.prices));
                    };
                    valueA = getCheapestPrice(a);
                    valueB = getCheapestPrice(b);
                    break;
                    
                case SORT_TYPES.PRIORITY:
                    const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
                    valueA = priorityOrder[a.priority] || 0;
                    valueB = priorityOrder[b.priority] || 0;
                    break;
                    
                default:
                    if (a.completed !== b.completed) {
                        return a.completed ? 1 : -1;
                    }
                    return 0;
            }
            
            if (valueA < valueB) return this.sortDirection === 'asc' ? -1 : 1;
            if (valueA > valueB) return this.sortDirection === 'asc' ? 1 : -1;
            return 0;
        });
        
        if (products.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i>🔍</i>
                    <p>Товары не найдены</p>
                </div>
            `;
            return;
        }

        container.innerHTML = '';
        
        products.forEach(product => {
            const productView = new ProductItemView(product, this.model.stores || []);
            render(productView, container);
            
            const checkbox = productView.element.querySelector('.product-checkbox');
            const editButton = productView.element.querySelector('.edit-prices');
            const deleteButton = productView.element.querySelector('.delete-product');
            
            if (checkbox) {
                checkbox.addEventListener('change', () => {
                    if (typeof this.model.toggleProductComplete === 'function') {
                        this.model.toggleProductComplete(product.id);
                    } else {
                        product.completed = !product.completed;
                        if (typeof this.model._notify === 'function') {
                            this.model._notify();
                        }
                    }
                });
            }
            
            if (editButton) {
                editButton.addEventListener('click', () => {
                    this.showPriceModal(product);
                });
            }
            
            if (deleteButton) {
                deleteButton.addEventListener('click', () => {
                    if (confirm(`Удалить товар "${product.name}"?`)) {
                        if (typeof this.model.removeProduct === 'function') {
                            this.model.removeProduct(product.id);
                        } else {
                            if (currentList.products) {
                                currentList.products = currentList.products.filter(p => p.id !== product.id);
                                if (typeof this.model._notify === 'function') {
                                    this.model._notify();
                                }
                            }
                        }
                        this.showNotification(`Товар "${product.name}" удален`, NOTIFICATION_TYPES.SUCCESS);
                    }
                });
            }
        });
        
        this.updateListStats();
    }

    renderStores() {
        const container = this.view.storesListContainer;
        if (!container) return;
        
        const stores = this.model.stores || [];
        
        if (stores.length === 0) {
            container.innerHTML = '<div class="empty-state">Добавьте магазины для сравнения цен</div>';
            return;
        }
        
        const storeListView = new StoreListView(
            stores,
            (storeId) => this.handleStoreSelect(storeId),
            (storeId) => this.handleStoreDelete(storeId)
        );
        
        container.innerHTML = '';
        render(storeListView, container);
    }

    renderStoreFilters() {
        const container = this.view.storeFiltersContainer;
        if (!container) return;
        
        const stores = this.model.stores || [];
        
        container.innerHTML = `
            <div class="filter-group">
                <span class="filter-label">Магазины:</span>
                <button class="filter-btn ${this.selectedStoreFilter === null ? 'active' : ''}" 
                        data-filter="all">
                    Все
                </button>
                ${stores.map(store => `
                    <button class="filter-btn ${this.selectedStoreFilter === store.id ? 'active' : ''}" 
                            data-filter="${store.id}">
                        ${store.name}
                    </button>
                `).join('')}
            </div>
            <div class="filter-group">
                <span class="filter-label">Статус:</span>
                <button class="filter-btn ${this.currentFilter === 'all' ? 'active' : ''}" 
                        data-status="all">
                    Все
                </button>
                <button class="filter-btn ${this.currentFilter === 'pending' ? 'active' : ''}" 
                        data-status="pending">
                    Не купленные
                </button>
                <button class="filter-btn ${this.currentFilter === 'completed' ? 'active' : ''}" 
                        data-status="completed">
                    Купленные
                </button>
            </div>
        `;
        
        container.querySelectorAll('[data-filter]').forEach(button => {
            button.addEventListener('click', (e) => {
                const filter = e.target.dataset.filter;
                this.selectedStoreFilter = filter === 'all' ? null : filter;
                this.renderStoreFilters();
                this.renderProducts();
            });
        });
        
        container.querySelectorAll('[data-status]').forEach(button => {
            button.addEventListener('click', (e) => {
                this.currentFilter = e.target.dataset.status;
                this.renderStoreFilters();
                this.renderProducts();
            });
        });
    }

    updateSortButtons() {
        const sortByPriceBtn = this.view.sortByPriceButton;
        const sortByPriorityBtn = this.view.sortByPriorityButton;
        
        if (sortByPriceBtn) {
            sortByPriceBtn.classList.remove('active');
        }
        if (sortByPriorityBtn) {
            sortByPriorityBtn.classList.remove('active');
        }
        
        if (this.sortBy === SORT_TYPES.PRICE && sortByPriceBtn) {
            sortByPriceBtn.classList.add('active');
            sortByPriceBtn.innerHTML = this.sortDirection === 'asc' ? 
                '<i>⬆️</i> Цена' : '<i>⬇️</i> Цена';
        } else if (sortByPriceBtn) {
            sortByPriceBtn.innerHTML = '<i>↕️</i> По цене';
        }
        
        if (this.sortBy === SORT_TYPES.PRIORITY && sortByPriorityBtn) {
            sortByPriorityBtn.classList.add('active');
            sortByPriorityBtn.innerHTML = this.sortDirection === 'asc' ? 
                '<i>⬆️</i> Приоритет' : '<i>⬇️</i> Приоритет';
        } else if (sortByPriorityBtn) {
            sortByPriorityBtn.innerHTML = '<i>📊</i> По приоритету';
        }
    }

    updateListStats() {
        const container = this.view.listStatsContainer;
        if (!container) return;
        
        const currentList = this.model.currentList;
        if (!currentList) return;
        
        const total = currentList.products ? currentList.products.length : 0;
        const completed = currentList.products ? currentList.products.filter(p => p.completed).length : 0;
        const pending = total - completed;
        
        container.innerHTML = `
            <span class="stats-item">Всего: ${total}</span>
            <span class="stats-item">Куплено: ${completed}</span>
            <span class="stats-item">Осталось: ${pending}</span>
        `;
    }

    handleStoreSelect(storeId) {
        this.selectedStoreFilter = storeId;
        this.renderStoreFilters();
        this.renderProducts();
    }

    handleStoreDelete(storeId) {
        const stores = this.model.stores || [];
        const store = stores.find(s => s.id === storeId);
        if (!store) return;
        
        if (confirm(`Удалить магазин "${store.name}"?`)) {
            if (typeof this.model.removeStore === 'function') {
                this.model.removeStore(storeId);
            } else {
                const index = stores.findIndex(s => s.id === storeId);
                if (index !== -1) {
                    stores.splice(index, 1);
                    if (typeof this.model._notify === 'function') {
                        this.model._notify();
                    }
                }
            }
            
            this.showNotification(`Магазин "${store.name}" удален`, NOTIFICATION_TYPES.SUCCESS);
            
            if (this.selectedStoreFilter === storeId) {
                this.selectedStoreFilter = null;
            }
            
            this.renderStores();
            this.renderStoreFilters();
        }
    }

    showPriceModal(product) {
        this.currentProduct = product;
        
        this.priceModal.element.querySelector('.modal-title').textContent = 
            `Цены для: ${product.name} (${product.quantity} шт.)`;
        
        const stores = this.model.stores || [];
        this.priceModal.modalBody.innerHTML = stores.map(store => `
            <div class="price-input-group" style="margin-bottom: 15px;">
                <label class="store-label" style="display: block; margin-bottom: 5px; font-weight: 600;">${store.name}</label>
                <div class="input-with-currency" style="display: flex; align-items: center; gap: 10px;">
                    <input type="number" 
                           min="0" 
                           step="0.01" 
                           value="${product.prices && product.prices[store.id] ? product.prices[store.id] : ''}"
                           data-store="${store.id}"
                           placeholder="0.00"
                           class="price-input"
                           style="flex: 1;">
                    <span class="currency" style="font-weight: 600;">₽</span>
                </div>
            </div>
        `).join('');
        
        this.priceModal.show();
        
        const firstInput = this.priceModal.modalBody.querySelector('.price-input');
        if (firstInput) firstInput.focus();
    }

    handleSavePrices() {
        if (!this.currentProduct) return;
        
        const inputs = this.priceModal.modalBody.querySelectorAll('.price-input');
        const prices = {};
        let hasValidPrice = false;
        
        inputs.forEach(input => {
            const storeId = input.dataset.store;
            const price = parseFloat(input.value);
            if (!isNaN(price) && price >= 0) {
                prices[storeId] = price;
                hasValidPrice = true;
            }
        });

        if (hasValidPrice) {
            if (typeof this.model.updateProductPrices === 'function') {
                this.model.updateProductPrices(this.currentProduct.id, prices);
            } else {
                Object.assign(this.currentProduct.prices, prices);
                if (typeof this.model._notify === 'function') {
                    this.model._notify();
                }
            }
            this.showNotification(`Цены для "${this.currentProduct.name}" сохранены`, NOTIFICATION_TYPES.SUCCESS);
            this.priceModal.hide();
        } else {
            this.showNotification('Введите хотя бы одну цену', NOTIFICATION_TYPES.ERROR);
        }
    }

    showNotification(message, type = NOTIFICATION_TYPES.SUCCESS) {
        const notification = new NotificationView(message, type);
        render(notification, document.body);
        return notification;
    }

    handleModelChange() {
        this.renderAll();
    }
}