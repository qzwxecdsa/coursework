export const RenderPosition = {
    BEFOREBEGIN: 'beforebegin',
    AFTERBEGIN: 'afterbegin',
    BEFOREEND: 'beforeend',
    AFTEREND: 'afterend'
};

export function render(component, container, place = RenderPosition.BEFOREEND) {
    if (!component || !component.element) {
        throw new Error('Can render only components with element');
    }
    
    if (!container) {
        throw new Error('Container element doesn\'t exist');
    }
    
    const element = component.element;
    
    switch (place) {
        case RenderPosition.BEFOREBEGIN:
            container.before(element);
            break;
        case RenderPosition.AFTERBEGIN:
            container.prepend(element);
            break;
        case RenderPosition.BEFOREEND:
            container.append(element);
            break;
        case RenderPosition.AFTEREND:
            container.after(element);
            break;
        default:
            container.append(element);
    }
}