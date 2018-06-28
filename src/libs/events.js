// https://stackoverflow.com/a/5116987/4931825
export const getEventTarget = (event) => {
    event = event || window.event;
    return event.target || event.srcElement;
};

export const dispatchEvent = (appRoot, name, data = {}) => {
    const event = new CustomEvent(name, { data, });

    if (appRoot && typeof appRoot.dispatchEvent === 'function') {
        appRoot.dispatchEvent(event);
    } else console.log('{{Events.dispatchEvent}}: App root is invalid', appRoot);
};

export const handleEvent = (eventName, appRoot, handler, target) => {
    event.preventDefault();
    event.stopPropagation();

    if (appRoot && typeof appRoot.addEventListener === 'function') {
        appRoot.addEventListener(eventName, (event) => {
            if (target) {
                if (getEventTarget(event) === target) handler(event);
            } else handler(event);
        });
    } else console.log('{{Events.handleEvent}}: App root is invalid', appRoot);
};

