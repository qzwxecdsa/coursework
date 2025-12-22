import Observable from "../../framework/observable.js";
import ApiService from "../service/api-service.js";

export default class AppModel extends Observable {
    constructor() {
        super();
        this.apiService = new ApiService();
        this.shoppingLists = [];
        this.currentListId = null;
        this.stores = [];
        this.categories = [];
        this.priceHistory = [];
        this.isLoading = false;
        this.apiError = null;
        
        this.initializeData();
    }

    async initializeData() {
        this.isLoading = true;
        this._notify();
        
        try {
            
            const [apiProducts, apiShoppingLists] = await Promise.all([
                this.apiService.getProducts(),
                this.apiService.getShoppingLists().catch(() => [])
            ]);
            
        
            this.stores = [
                { id: '1', name: 'Супермаркет', address: 'ул. Центральная, 1', rating: 4.5 },
                { id: '2', name: 'Магазин у дома', address: 'ул. Домашняя, 5', rating: 4.2 },
                { id: '3', name: 'Дискаунтер', address: 'ул. Экономная, 3', rating: 4.0 }
            ];
            
            this.categories = this.extractCategories(apiProducts);
            
            if (apiShoppingLists.length > 0) {
                this.shoppingLists = [{
                    id: apiShoppingLists[0].id,
                    name: apiShoppingLists[0].name || 'Список покупок',
                    createdAt: apiShoppingLists[0].createdAt || new Date().toISOString(),
                    products: this.convertApiProducts(apiProducts)
                }];
            } else {
                this.shoppingLists = [{
                    id: 'list-1',
                    name: 'Мой список покупок',
                    createdAt: new Date().toISOString(),
                    products: this.convertApiProducts(apiProducts)
                }];
            }
            
            this.currentListId = this.shoppingLists[0].id;
            
            this.initializePriceHistory();
            
            
        } catch (error) {
            this.setupFallbackData();
            
        } finally {
            this.isLoading = false;
            this._notify();
        }
    }

    convertApiProducts(apiProducts) {
        return apiProducts.map((apiProduct, index) => {
            const prices = {};
            this.stores.forEach(store => {
                let basePrice = 50 + (index * 15);
                
                if (store.id === '1') basePrice *= 0.9;   
                if (store.id === '3') basePrice *= 1.1;   
                
                const randomFactor = 0.85 + Math.random() * 0.3;
                prices[store.id] = Math.round(basePrice * randomFactor);
            });
            
            return {
                id: `prod-${apiProduct.id || index}`,
                name: apiProduct.name,
                category: apiProduct.category || 'Продукты',
                quantity: apiProduct.quantity || 1,
                priority: 'medium',
                prices: prices,
                completed: false,
                importedFromApi: true,
                apiProductId: apiProduct.id,
                notes: `Из MockAPI`
            };
        });
    }

    extractCategories(products) {
        const categories = new Set(['Продукты']);
        
        products.forEach(product => {
            if (product.category && product.category.trim()) {
                categories.add(product.category);
            }
        });
        
        return Array.from(categories);
    }

    setupFallbackData() {
        
        this.stores = [
            { id: '1', name: 'Магазин 1', address: 'ул. Тестовая, 1', rating: 4.0 },
            { id: '2', name: 'Магазин 2', address: 'ул. Тестовая, 2', rating: 4.5 }
        ];
        
        const apiProducts = [
            { id: '1', name: 'Товар 1', category: 'Категория 1', quantity: 2 },
            { id: '2', name: 'Товар 2', category: 'Категория 2', quantity: 1 },
            { id: '3', name: 'Товар 3', category: 'Категория 3', quantity: 3 }
        ];
        
        this.categories = this.extractCategories(apiProducts);
        
        this.shoppingLists = [{
            id: 'list-1',
            name: 'Тестовый список',
            createdAt: new Date().toISOString(),
            products: this.convertApiProducts(apiProducts)
        }];
        
        this.currentListId = 'list-1';
        this.initializePriceHistory();
    }

    initializePriceHistory() {
        this.priceHistory = [];
        const currentList = this.currentList;
        const today = new Date();
        
        if (!currentList || !currentList.products) return;
        
        currentList.products.forEach((product, productIndex) => {
            this.stores.forEach((store, storeIndex) => {
                const currentPrice = product.prices[store.id];
                if (currentPrice) {
                    for (let i = 1; i <= 3; i++) {
                        const historyDate = new Date(today);
                        historyDate.setDate(today.getDate() - i * 2); 
                        
                        const oldPrice = Math.round(currentPrice * (0.8 + Math.random() * 0.4));
                        
                        const priceChange = currentPrice - oldPrice;
                        const percentageChange = ((priceChange / oldPrice) * 100).toFixed(1);
                        
                        this.priceHistory.push({
                            productId: product.id,
                            productName: product.name,
                            storeId: store.id,
                            storeName: store.name,
                            oldPrice: oldPrice,
                            newPrice: currentPrice,
                            date: historyDate.toISOString().split('T')[0],
                            change: priceChange,
                            percentageChange: percentageChange,
                            changeType: priceChange >= 0 ? 'increase' : 'decrease'
                        });
                    }
                }
            });
        });
        
        this.priceHistory.sort((a, b) => new Date(b.date) - new Date(a.date));
        
    }

    getExtendedPriceHistory() {
        return this.priceHistory.sort((a, b) => new Date(b.date) - new Date(a.date));
    }
    
    getRecentPriceHistory(limit = 10) {
        return this.priceHistory
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, limit);
    }
    
    getPriceHistoryByProduct(productId) {
        return this.priceHistory
            .filter(record => record.productId === productId)
            .sort((a, b) => new Date(b.date) - new Date(a.date));
    }
    
    getPriceHistoryByStore(storeId) {
        return this.priceHistory
            .filter(record => record.storeId === storeId)
            .sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    getSavingsData() {
        const currentList = this.currentList;
        if (!currentList) return { totalSavings: 0, byStore: {}, recommendations: [] };
        
        const savingsData = {
            totalSavings: 0,
            byStore: {},
            bestStore: null,
            worstStore: null,
            recommendations: []
        };
        
        currentList.products.forEach(product => {
            const prices = Object.values(product.prices);
            if (prices.length > 1) {
                const minPrice = Math.min(...prices);
                const maxPrice = Math.max(...prices);
                
                Object.entries(product.prices).forEach(([storeId, price]) => {
                    if (price === minPrice) {
                        savingsData.byStore[storeId] = (savingsData.byStore[storeId] || 0) + 
                            (maxPrice - minPrice) * product.quantity;
                    }
                });
            }
        });
        
        savingsData.totalSavings = Object.values(savingsData.byStore).reduce((sum, saving) => sum + saving, 0);
        
        const storesWithSavings = Object.entries(savingsData.byStore);
        if (storesWithSavings.length > 0) {
            storesWithSavings.sort((a, b) => b[1] - a[1]);
            savingsData.bestStore = {
                id: storesWithSavings[0][0],
                name: this.stores.find(s => s.id === storesWithSavings[0][0])?.name || 'Неизвестно',
                savings: storesWithSavings[0][1]
            };
            
            if (storesWithSavings.length > 1) {
                savingsData.worstStore = {
                    id: storesWithSavings[storesWithSavings.length - 1][0],
                    name: this.stores.find(s => s.id === storesWithSavings[storesWithSavings.length - 1][0])?.name || 'Неизвестно',
                    overspend: storesWithSavings[storesWithSavings.length - 1][1]
                };
            }
        }
        
        savingsData.recommendations = this.generateSavingsRecommendations(savingsData);
        
        return savingsData;
    }
    
    generateSavingsRecommendations(savingsData) {
        const recommendations = [];
        
        if (savingsData.totalSavings > 0 && savingsData.bestStore) {
            recommendations.push({
                type: 'best_store',
                title: `Лучший магазин для экономии`,
                message: `Покупая в "${savingsData.bestStore.name}", вы сэкономите ${Math.round(savingsData.totalSavings)} руб.`,
                priority: 'high'
            });
        }
        
        if (savingsData.worstStore) {
            recommendations.push({
                type: 'worst_store',
                title: `Избегайте переплаты`,
                message: `В "${savingsData.worstStore.name}" вы переплатите ${Math.round(savingsData.worstStore.overspend)} руб.`,
                priority: 'medium'
            });
        }
        
        const currentList = this.currentList;
        if (currentList) {
            const productsWithoutPrices = currentList.products.filter(p => 
                Object.keys(p.prices).length === 0
            );
            
            if (productsWithoutPrices.length > 0) {
                recommendations.push({
                    type: 'missing_prices',
                    title: 'Добавьте цены',
                    message: `У ${productsWithoutPrices.length} товаров нет цен. Добавьте их для расчета экономии.`,
                    priority: 'low'
                });
            }
        }
        
        return recommendations;
    }
    
    getMonthlySavings() {
        const savingsData = this.getSavingsData();
        return {
            currentMonth: savingsData.totalSavings,
            averageMonthly: Math.round(savingsData.totalSavings * 0.8), 
            totalYear: Math.round(savingsData.totalSavings * 12 * 0.7) 
        };
    }

    get currentList() {
        return this.shoppingLists.find(list => list.id === this.currentListId);
    }

    getTotalPriceForStore(storeId) {
        const currentList = this.currentList;
        if (!currentList) return 0;

        return currentList.products.reduce((total, product) => {
            const price = product.prices[storeId];
            return price ? total + (price * product.quantity) : total;
        }, 0);
    }

    getCheapestPrice(product) {
        const prices = Object.values(product.prices);
        return prices.length > 0 ? Math.min(...prices) : null;
    }

    getAnalytics() {
        const currentList = this.currentList;
        if (!currentList) return null;

        const stats = {
            totalProducts: currentList.products.length,
            completedProducts: currentList.products.filter(p => p.completed).length,
            byCategory: {},
            totalCost: 0,
            cheapestStore: null,
            cheapestTotal: Infinity
        };

        currentList.products.forEach(product => {
            const category = product.category || 'Без категории';
            stats.byCategory[category] = (stats.byCategory[category] || 0) + 1;
            
            const cheapestPrice = this.getCheapestPrice(product);
            if (cheapestPrice) {
                stats.totalCost += cheapestPrice * product.quantity;
            }
        });

        this.stores.forEach(store => {
            const total = this.getTotalPriceForStore(store.id);
            if (total < stats.cheapestTotal) {
                stats.cheapestTotal = total;
                stats.cheapestStore = store.name;
            }
        });

        return stats;
    }

    getComparisonData() {
        const currentList = this.currentList;
        if (!currentList) return { products: [], stores: this.stores };

        const productsWithPrices = currentList.products.filter(p => 
            Object.keys(p.prices).length > 0
        );

        return { products: productsWithPrices, stores: this.stores };
    }

    toggleProductComplete(productId) {
        const currentList = this.currentList;
        if (!currentList) return;

        const product = currentList.products.find(p => p.id === productId);
        if (product) {
            product.completed = !product.completed;
            this._notify();
        }
    }

    updateProductQuantity(productId, newQuantity) {
        const currentList = this.currentList;
        if (!currentList) return;

        const product = currentList.products.find(p => p.id === productId);
        if (product && newQuantity > 0) {
            product.quantity = newQuantity;
            this._notify();
        }
    }

    removeProduct(productId) {
        const currentList = this.currentList;
        if (!currentList) return;

        currentList.products = currentList.products.filter(p => p.id !== productId);
        this._notify();
    }

    updateProductPrices(productId, prices) {
        const currentList = this.currentList;
        if (!currentList) return;

        const product = currentList.products.find(p => p.id === productId);
        if (!product) return;

        Object.entries(prices).forEach(([storeId, newPrice]) => {
            if (newPrice && !isNaN(newPrice)) {
                const oldPrice = product.prices[storeId];
                const numericPrice = Number(newPrice);
                
                if (oldPrice !== undefined && oldPrice !== numericPrice) {
                    const store = this.stores.find(s => s.id === storeId);
                    if (store) {
                        const change = numericPrice - oldPrice;
                        const percentageChange = ((change / oldPrice) * 100).toFixed(1);
                        
                        this.priceHistory.push({
                            productId: product.id,
                            productName: product.name,
                            storeId: storeId,
                            storeName: store.name,
                            oldPrice: oldPrice,
                            newPrice: numericPrice,
                            date: new Date().toISOString().split('T')[0],
                            change: change,
                            percentageChange: percentageChange,
                            changeType: change >= 0 ? 'increase' : 'decrease'
                        });
                    }
                }
                
                product.prices[storeId] = numericPrice;
            }
        });

        this._notify();
    }

async addProduct(productData) {
    const currentList = this.currentList;
    if (!currentList) return null;

    const productForApi = {
        name: productData.name,
        category: productData.category || 'Продукты',
        quantity: productData.quantity || 1,
        priority: productData.priority || 'medium',
        listId: currentList.id 
    };

    try {
        const savedProduct = await this.apiService.createProduct(productForApi);

        const newProduct = {
            id: savedProduct.id, 
            ...productForApi,
            prices: {}, 
            completed: false,
            importedFromApi: false,
            apiProductId: savedProduct.id, 
            notes: 'Добавлен вручную и сохранен в MockAPI'
        };

        currentList.products.push(newProduct);
        this._notify();
        
        return newProduct;

    } catch (error) {
        
        const newProduct = {
            id: `product-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            ...productForApi,
            prices: {},
            completed: false,
            importedFromApi: false,
            apiProductId: null, 
            notes: 'Добавлен вручную (только локально)'
        };

        currentList.products.push(newProduct);
        this._notify();
        return newProduct;
    }
}
async addStore(storeName) {
    if (!storeName || !storeName.trim()) return null;

    const storeForApi = {
        name: storeName.trim(),
        address: 'Адрес не указан',
        rating: 4.0
    };

    try {
        const savedStore = await this.apiService.createShoppingList({
            name: `Магазин: ${storeName}`,
            type: 'store'
        });

        const newStore = {
            id: savedStore.id, 
            ...storeForApi,
            apiId: savedStore.id
        };

        this.stores.push(newStore);
        this._notify();
        return newStore;

    } catch (error) {
        
        const newStore = {
            id: `store-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            ...storeForApi,
            apiId: null
        };

        this.stores.push(newStore);
        this._notify();
        return newStore;
    }
}

    removeStore(storeId) {
        const storeIndex = this.stores.findIndex(s => s.id === storeId);
        if (storeIndex !== -1) {
            this.stores.splice(storeIndex, 1);
            this._notify();
            return true;
        }
        return false;
    }

    createList(listName) {
        const newList = {
            id: `list-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: listName || 'Новый список',
            createdAt: new Date().toISOString(),
            products: []
        };

        this.shoppingLists.push(newList);
        this.currentListId = newList.id;
        this._notify();
        return newList;
    }
}