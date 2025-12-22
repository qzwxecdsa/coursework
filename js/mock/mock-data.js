export const mockShoppingLists = [
    {
        id: 'list-001',
        name: 'Еженедельные покупки',
        createdAt: '2024-01-15',
        products: [
            {
                id: 'prod-001',
                name: 'Молоко',
                category: 'Молочные продукты',
                quantity: 2,
                priority: 'high',
                prices: { 
                    'store-001': 85, 
                    'store-002': 80, 
                    'store-003': 90 
                },
                priceHistory: [
                    {
                        storeId: 'store-001',
                        oldPrice: 90,
                        newPrice: 85,
                        date: '2024-01-10'
                    },
                    {
                        storeId: 'store-002',
                        oldPrice: 85,
                        newPrice: 80,
                        date: '2024-01-12'
                    }
                ],
                completed: false
            },
            {
                id: 'prod-002',
                name: 'Хлеб',
                category: 'Хлебобулочные изделия',
                quantity: 1,
                priority: 'medium',
                prices: { 
                    'store-001': 45, 
                    'store-002': 40, 
                    'store-003': 50 
                },
                priceHistory: [
                    {
                        storeId: 'store-001',
                        oldPrice: 50,
                        newPrice: 45,
                        date: '2024-01-08'
                    }
                ],
                completed: true
            },
            {
                id: 'prod-003',
                name: 'Яйца',
                category: 'Продукты',
                quantity: 10,
                priority: 'high',
                prices: { 
                    'store-001': 120, 
                    'store-002': 110, 
                    'store-003': 130 
                },
                priceHistory: [],
                completed: false
            },
            {
                id: 'prod-004',
                name: 'Яблоки',
                category: 'Фрукты',
                quantity: 5,
                priority: 'medium',
                prices: { 
                    'store-001': 150, 
                    'store-002': 140, 
                    'store-003': 160 
                },
                priceHistory: [
                    {
                        storeId: 'store-002',
                        oldPrice: 145,
                        newPrice: 140,
                        date: '2024-01-14'
                    }
                ],
                completed: false
            },
            {
                id: 'prod-005',
                name: 'Масло сливочное',
                category: 'Молочные продукты',
                quantity: 1,
                priority: 'medium',
                prices: { 
                    'store-001': 180, 
                    'store-002': 175, 
                    'store-003': 190 
                },
                priceHistory: [],
                completed: false
            }
        ]
    }
];

export const mockStores = [
    { id: 'store-001', name: 'Магнит', address: 'ул. Ленина, 25', rating: 4.5 },
    { id: 'store-002', name: 'Пятерочка', address: 'ул. Центральная, 10', rating: 4.3 },
    { id: 'store-003', name: 'Перекресток', address: 'пр. Мира, 15', rating: 4.7 }
];

export const mockCategories = [
    'Продукты',
    'Напитки',
    'Фрукты',
    'Овощи',
    'Молочные продукты',
    'Мясо и рыба',
    'Хлебобулочные изделия',
    'Сладости',
    'Бытовая химия',
    'Косметика',
    'Техника',
    'Другое'
];