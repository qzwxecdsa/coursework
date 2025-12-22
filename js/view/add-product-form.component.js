import { AbstractComponent } from "./abstract-component.js";
import { CATEGORIES, PRIORITY } from "../const.js";

export default class AddProductFormComponent extends AbstractComponent {
    constructor(onSubmit) {
        super();
        this.onSubmit = onSubmit;
    }

    get template() {
        return `
            <div class="card">
                <h2><i>➕</i> Добавить товар</h2>
                <div class="form-group">
                    <label for="product-name">Название товара</label>
                    <input type="text" id="product-name" placeholder="Например: Молоко">
                </div>
                <div class="form-group">
                    <label for="product-category">Категория</label>
                    <select id="product-category">
                        ${CATEGORIES.map(category => `<option value="${category}">${category}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label for="product-quantity">Количество</label>
                    <input type="number" id="product-quantity" value="1" min="1" class="quantity-input">
                </div>
                <div class="form-group">
                    <label for="product-priority">Приоритет</label>
                    <select id="product-priority">
                        <option value="${PRIORITY.LOW}">Низкий</option>
                        <option value="${PRIORITY.MEDIUM}" selected>Средний</option>
                        <option value="${PRIORITY.HIGH}">Высокий</option>
                    </select>
                </div>
                <button id="add-product-btn" class="btn-success"><i>➕</i> Добавить товар</button>
            </div>
        `;
    }

    afterRender() {
        const addButton = this.element.querySelector('#add-product-btn');
        if (addButton) {
            addButton.addEventListener('click', () => {
                const name = this.element.querySelector('#product-name').value.trim();
                const category = this.element.querySelector('#product-category').value;
                const quantity = parseInt(this.element.querySelector('#product-quantity').value) || 1;
                const priority = this.element.querySelector('#product-priority').value;
                
                if (name && this.onSubmit) {
                    this.onSubmit({ name, category, quantity, priority });
                    this.element.querySelector('#product-name').value = '';
                    this.element.querySelector('#product-quantity').value = '1';
                    this.element.querySelector('#product-name').focus();
                }
            });
        }
    }
}