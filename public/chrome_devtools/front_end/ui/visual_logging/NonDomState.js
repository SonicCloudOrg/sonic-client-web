const registry = new Map();
export function registerLoggable(loggable, config, parent) {
    registry.set(loggable, { loggable, config, parent });
}
export function unregisterLoggable(loggable) {
    registry.delete(loggable);
}
export function getNonDomState() {
    return { loggables: [...registry.values()] };
}
export function unregisterAllLoggables() {
    registry.clear();
}
//# sourceMappingURL=NonDomState.js.map