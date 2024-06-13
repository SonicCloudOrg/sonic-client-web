import { needsLogging } from './LoggingConfig.js';
const state = new WeakMap();
function nextVeId() {
    const result = new Int32Array(1);
    crypto.getRandomValues(result);
    return result[0];
}
export function getOrCreateLoggingState(loggable, config, parent) {
    if (state.has(loggable)) {
        const currentState = state.get(loggable);
        if (parent && !config.parent && currentState.parent !== getLoggingState(parent)) {
            currentState.parent = getLoggingState(parent);
        }
        return currentState;
    }
    if (config.parent && parentProviders.has(config.parent) && loggable instanceof Element) {
        parent = parentProviders.get(config.parent)?.(loggable);
        while (parent instanceof Element && !needsLogging(parent)) {
            parent = parent.parentElementOrShadowHost() ?? undefined;
        }
    }
    const loggableState = {
        impressionLogged: false,
        processed: false,
        config,
        veid: nextVeId(),
        parent: parent ? getLoggingState(parent) : null,
        size: new DOMRect(0, 0, 0, 0),
    };
    state.set(loggable, loggableState);
    return loggableState;
}
export function getLoggingState(loggable) {
    return state.get(loggable) || null;
}
const parentProviders = new Map();
export function registerParentProvider(name, provider) {
    if (parentProviders.has(name)) {
        throw new Error(`Parent provider with the name '${name} is already registered'`);
    }
    parentProviders.set(name, provider);
}
const parentMap = new WeakMap();
registerParentProvider('mapped', (e) => parentMap.get(e));
export function setMappedParent(element, parent) {
    parentMap.set(element, parent);
}
//# sourceMappingURL=LoggingState.js.map