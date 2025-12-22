import PriceComparisonView from "../view/price-comparison-view.component.js";
import { render, RenderPosition } from "../../framework/render.js";

export default class PriceComparisonPresenter {
    constructor(model, container) {
        this.model = model;
        this.container = container;
        this.view = null;
        this.model.addObserver(() => this.handleModelChange());
    }

    init() {
        this.render();
    }

    render() {
        const data = this.model.getComparisonData();
        
        if (!this.view) {
            this.view = new PriceComparisonView(data, this.model);
            render(this.view, this.container);
        } else {
            this.view.update(data);
        }
    }

    handleModelChange() {
        this.render();
    }
}