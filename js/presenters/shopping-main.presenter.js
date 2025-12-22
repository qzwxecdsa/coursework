import AppModel from "../models/shopping.model.js";
import ShoppingListPresenter from "./shopping-list.presenter.js";
import PriceComparisonPresenter from "./price-comparison.presenter.js";
import AnalyticsPresenter from "./analytics.presenter.js";
import { PAGE_IDS } from "../const.js";

export default class ShoppingMainPresenter {
    constructor() {
        this.model = new AppModel();
        this.presenters = {};
        this.currentPage = PAGE_IDS.SHOPPING_LIST;
        this.init();
    }

    init() {
        this.setupNavigation();
        this.setupModalListeners();
        this.showPage(PAGE_IDS.SHOPPING_LIST);
    }

    setupNavigation() {
        const navButtons = document.querySelectorAll('.nav-btn');
        const pages = document.querySelectorAll('.page');
        
        navButtons.forEach(button => {
            button.addEventListener('click', () => {
                const pageId = button.dataset.page;
                
                navButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                
                pages.forEach(page => {
                    page.classList.remove('active');
                    if (page.id === pageId) {
                        page.classList.add('active');
                    }
                });
                
                this.showPage(pageId);
            });
        });
    }

    setupModalListeners() {
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                e.target.style.display = 'none';
            }
        });

        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('close-btn')) {
                const modal = e.target.closest('.modal');
                if (modal) {
                    modal.style.display = 'none';
                }
            }
        });
    }

    showPage(pageId) {
        const container = document.getElementById(pageId);
        if (!container) {
            return;
        }
        
        this.currentPage = pageId;
        
        switch(pageId) {
            case PAGE_IDS.SHOPPING_LIST:
                if (!this.presenters.shoppingList) {
                    this.presenters.shoppingList = new ShoppingListPresenter(this.model, container);
                    this.presenters.shoppingList.init();
                } else {
                    this.presenters.shoppingList.container = container;
                    this.presenters.shoppingList.renderAll();
                }
                break;
                
            case PAGE_IDS.PRICE_COMPARISON:
                if (!this.presenters.priceComparison) {
                    this.presenters.priceComparison = new PriceComparisonPresenter(this.model, container);
                } else {
                    this.presenters.priceComparison.container = container;
                }
                this.presenters.priceComparison.init();
                break;
                
            case PAGE_IDS.ANALYTICS:
                if (!this.presenters.analytics) {
                    this.presenters.analytics = new AnalyticsPresenter(this.model, container);
                } else {
                    this.presenters.analytics.container = container;
                }
                this.presenters.analytics.init();
                break;
        }
    }
}