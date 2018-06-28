
export const dispatchEvent = (type, data) => {
    return new CustomEvent(type, { data, });
};

export const handleEvent = (eventName, appRoot, handler, target) => {
    if (appRoot && typeof appRoot.addEventListener === 'function') {
        appRoot.addEventListener(eventName, (event) => {
            if (target) {
                if (event.target === target) handler(event);
            } else handler(event);
        });
    } else console.log('{{Events.handleEvent}}: App root is invalid', appRoot);
};
