export default class ApiService {
    constructor(baseUrl = 'https://6948328a1ee66d04a44eee60.mockapi.io') {
        this.baseUrl = baseUrl;
    }

    async request(endpoint, method = 'GET', data = null) {
        try {
            const url = `${this.baseUrl}/${endpoint}`;
            
            const options = {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                },
            };
            
            if (data && (method === 'POST' || method === 'PUT')) {
                options.body = JSON.stringify(data);
            }
            
            const response = await fetch(url, options);
            
            if (!response.ok) {
                const errorMsg = `HTTP ${response.status} для ${method} ${endpoint}`;
                throw new Error(errorMsg);
            }
            
            const responseText = await response.text();
            return responseText ? JSON.parse(responseText) : null;
            
        } catch (error) {
            throw error; 
        }
    }

    async get(endpoint) {
        return this.request(endpoint, 'GET');
    }

    async getProducts() {
        return this.get('products');
    }

    async getShoppingLists() {
        return this.get('shopping-lists');
    }


    async post(endpoint, data) {
        return this.request(endpoint, 'POST', data);
    }

    async createProduct(productData) {
        return this.post('products', productData);
    }

    async createShoppingList(listData) {
        return this.post('shopping-lists', listData);
    }

    async put(endpoint, id, data) {
        return this.request(`${endpoint}/${id}`, 'PUT', data);
    }

    async updateProduct(id, productData) {
        return this.put('products', id, productData);
    }

    async updateShoppingList(id, listData) {
        return this.put('shopping-lists', id, listData);
    }

    async delete(endpoint, id) {
        return this.request(`${endpoint}/${id}`, 'DELETE');
    }

    async deleteProduct(id) {
        return this.delete('products', id);
    }

    async deleteShoppingList(id) {
        return this.delete('shopping-lists', id);
    }
}