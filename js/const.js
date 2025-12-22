export const PRIORITY = {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high'
};

export const PRIORITY_COLORS = {
    low: 'priority-low',
    medium: 'priority-medium',
    high: 'priority-high'
};

export const PRIORITY_ICONS = {
    low: '⬇️',
    medium: '➡️',
    high: '⬆️'
};

export const PAGE_IDS = {
    SHOPPING_LIST: 'shopping-list',
    PRICE_COMPARISON: 'price-comparison',
    ANALYTICS: 'analytics'
};

export const NOTIFICATION_TYPES = {
    SUCCESS: 'success',
    ERROR: 'error',
    WARNING: 'warning',
    INFO: 'info'
};

export const MODAL_TYPES = {
    PRICE: 'price',
    LIST: 'list',
    STORE: 'store'
};

export const CATEGORIES = [
    'Продукты',
    'Бытовая химия',
    'Косметика',
    'Техника',
    'Напитки',
    'Фрукты',
    'Овощи',
    'Молочные продукты',
    'Мясо и рыба',
    'Хлебобулочные изделия',
    'Сладости',
    'Другое'
];

export const SORT_TYPES = {
    DEFAULT: 'default',
    PRICE: 'price',
    PRIORITY: 'priority',
    NAME: 'name',
    CATEGORY: 'category'
};

export const FILTER_TYPES = {
    ALL: 'all',
    PENDING: 'pending',
    COMPLETED: 'completed'
};

export const DEFAULT_STORES = [
    { id: 'store-001', name: 'Магнит', address: 'ул. Ленина, 25', rating: 4.5 },
    { id: 'store-002', name: 'Пятерочка', address: 'ул. Центральная, 10', rating: 4.3 },
    { id: 'store-003', name: 'Перекресток', address: 'пр. Мира, 15', rating: 4.7 }
];

export const CURRENCY = '₽';
export const DEFAULT_QUANTITY = 1;
export const DEFAULT_PRIORITY = 'medium';