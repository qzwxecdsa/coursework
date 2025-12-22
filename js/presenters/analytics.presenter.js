import AnalyticsView from "../view/analytics-view.component.js";
import { render, RenderPosition } from "../../framework/render.js";

export default class AnalyticsPresenter {
    constructor(model, container) {
        this.model = model;
        this.container = container;
        this.view = null;
        this.model.addObserver(() => this.handleModelChange());
    }

    init() {
        this.render();
        this.setupEventListeners();
    }

    render() {
        const analytics = this.model.getAnalytics();
        const priceHistory = this.model.getExtendedPriceHistory();
        
        if (!this.view) {
            this.view = new AnalyticsView(analytics, priceHistory);
            render(this.view, this.container);
        } else {
            this.view.update(analytics, priceHistory);
        }
        
        setTimeout(() => this.setupAnalyticsTabs(), 100);
    }

    setupEventListeners() {
    }

    setupAnalyticsTabs() {
        const container = this.container;
        const tabs = container.querySelectorAll('.tab');
        const tabContents = container.querySelectorAll('.tab-content');
        
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const tabId = tab.dataset.tab;
                
                tabs.forEach(t => t.classList.remove('active'));
                tabContents.forEach(content => content.classList.remove('active'));
                
                tab.classList.add('active');
                const activeContent = container.querySelector(`#${tabId}-tab-content`);
                if (activeContent) {
                    activeContent.classList.add('active');
                }
            });
        });
    }

    handleModelChange() {
        this.render();
    }
}