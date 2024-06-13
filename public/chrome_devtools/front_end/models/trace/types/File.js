export function traceEventKeyToValues(key) {
    const parts = key.split('-');
    const type = parts[0];
    switch (type) {
        case "p" /* EventKeyType.ProfileCall */:
            if (parts.length !== 5 ||
                !(parts.every((part, i) => i === 0 || typeof part === 'number' || !isNaN(parseInt(part, 10))))) {
                throw new Error(`Invalid ProfileCallKey: ${key}`);
            }
            return {
                type: parts[0],
                processID: parseInt(parts[1], 10),
                threadID: parseInt(parts[2], 10),
                sampleIndex: parseInt(parts[3], 10),
                protocol: parseInt(parts[4], 10),
            };
        case "r" /* EventKeyType.RawEvent */:
            if (parts.length !== 2 || !(typeof parts[1] === 'number' || !isNaN(parseInt(parts[1], 10)))) {
                throw new Error(`Invalid RawEvent Key: ${key}`);
            }
            return {
                type: parts[0],
                rawIndex: parseInt(parts[1], 10),
            };
        case "s" /* EventKeyType.SyntheticEvent */:
            if (parts.length !== 2 || !(typeof parts[1] === 'number' || !isNaN(parseInt(parts[1], 10)))) {
                throw new Error(`Invalid SyntheticEvent Key: ${key}`);
            }
            return {
                type: parts[0],
                rawIndex: parseInt(parts[1], 10),
            };
        default:
            throw new Error(`Unknown trace event key: ${key}`);
    }
}
//# sourceMappingURL=File.js.map