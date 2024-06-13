// Copyright 2021 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
// This cannot be an interface due to "instanceof RemoteObject" checks in the code.
export class RemoteObject {
    static fromLocalObject(value) {
        return new LocalJSONObject(value);
    }
    static type(remoteObject) {
        if (remoteObject === null) {
            return 'null';
        }
        const type = typeof remoteObject;
        if (type !== 'object' && type !== 'function') {
            return type;
        }
        return remoteObject.type;
    }
    static isNullOrUndefined(remoteObject) {
        if (remoteObject === undefined) {
            return true;
        }
        switch (remoteObject.type) {
            case "object" /* Protocol.Runtime.RemoteObjectType.Object */:
                return remoteObject.subtype === "null" /* Protocol.Runtime.RemoteObjectSubtype.Null */;
            case "undefined" /* Protocol.Runtime.RemoteObjectType.Undefined */:
                return true;
            default:
                return false;
        }
    }
    static arrayNameFromDescription(description) {
        return description.replace(descriptionLengthParenRegex, '').replace(descriptionLengthSquareRegex, '');
    }
    static arrayLength(object) {
        if (object.subtype !== 'array' && object.subtype !== 'typedarray') {
            return 0;
        }
        // Array lengths in V8-generated descriptions switched from square brackets to parentheses.
        // Both formats are checked in case the front end is dealing with an old version of V8.
        const parenMatches = object.description && object.description.match(descriptionLengthParenRegex);
        const squareMatches = object.description && object.description.match(descriptionLengthSquareRegex);
        return parenMatches ? parseInt(parenMatches[1], 10) : (squareMatches ? parseInt(squareMatches[1], 10) : 0);
    }
    static arrayBufferByteLength(object) {
        if (object.subtype !== 'arraybuffer') {
            return 0;
        }
        const matches = object.description && object.description.match(descriptionLengthParenRegex);
        return matches ? parseInt(matches[1], 10) : 0;
    }
    static unserializableDescription(object) {
        if (typeof object === 'number') {
            const description = String(object);
            if (object === 0 && 1 / object < 0) {
                return "-0" /* UnserializableNumber.Negative0 */;
            }
            if (description === "NaN" /* UnserializableNumber.NaN */ || description === "Infinity" /* UnserializableNumber.Infinity */ ||
                description === "-Infinity" /* UnserializableNumber.NegativeInfinity */) {
                return description;
            }
        }
        if (typeof object === 'bigint') {
            return object + 'n';
        }
        return null;
    }
    static toCallArgument(object) {
        const type = typeof object;
        if (type === 'undefined') {
            return {};
        }
        const unserializableDescription = RemoteObject.unserializableDescription(object);
        if (type === 'number') {
            if (unserializableDescription !== null) {
                return { unserializableValue: unserializableDescription };
            }
            return { value: object };
        }
        if (type === 'bigint') {
            return { unserializableValue: unserializableDescription };
        }
        if (type === 'string' || type === 'boolean') {
            return { value: object };
        }
        if (!object) {
            return { value: null };
        }
        // The unserializableValue is a function on RemoteObject's and a simple property on
        // Protocol.Runtime.RemoteObject's.
        const objectAsProtocolRemoteObject = object;
        if (object instanceof RemoteObject) {
            const unserializableValue = object.unserializableValue();
            if (unserializableValue !== undefined) {
                return { unserializableValue: unserializableValue };
            }
        }
        else if (objectAsProtocolRemoteObject.unserializableValue !== undefined) {
            return { unserializableValue: objectAsProtocolRemoteObject.unserializableValue };
        }
        if (typeof objectAsProtocolRemoteObject.objectId !== 'undefined') {
            return { objectId: objectAsProtocolRemoteObject.objectId };
        }
        return { value: objectAsProtocolRemoteObject.value };
    }
    static async loadFromObjectPerProto(object, generatePreview, nonIndexedPropertiesOnly = false) {
        const result = await Promise.all([
            object.getAllProperties(true /* accessorPropertiesOnly */, generatePreview, nonIndexedPropertiesOnly),
            object.getOwnProperties(generatePreview, nonIndexedPropertiesOnly),
        ]);
        const accessorProperties = result[0].properties;
        const ownProperties = result[1].properties;
        const internalProperties = result[1].internalProperties;
        if (!ownProperties || !accessorProperties) {
            return { properties: null, internalProperties: null };
        }
        const propertiesMap = new Map();
        const propertySymbols = [];
        for (let i = 0; i < accessorProperties.length; i++) {
            const property = accessorProperties[i];
            if (property.symbol) {
                propertySymbols.push(property);
            }
            else if (property.isOwn || property.name !== '__proto__') {
                // TODO(crbug/1076820): Eventually we should move away from
                // showing accessor #properties directly on the receiver.
                propertiesMap.set(property.name, property);
            }
        }
        for (let i = 0; i < ownProperties.length; i++) {
            const property = ownProperties[i];
            if (property.isAccessorProperty()) {
                continue;
            }
            if (property.private || property.symbol) {
                propertySymbols.push(property);
            }
            else {
                propertiesMap.set(property.name, property);
            }
        }
        return {
            properties: [...propertiesMap.values()].concat(propertySymbols),
            internalProperties: internalProperties ? internalProperties : null,
        };
    }
    customPreview() {
        return null;
    }
    get objectId() {
        // TODO(crbug.com/1226471): Return undefined here.
        return 'Not implemented';
    }
    get type() {
        throw 'Not implemented';
    }
    get subtype() {
        throw 'Not implemented';
    }
    // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    get value() {
        throw 'Not implemented';
    }
    unserializableValue() {
        throw 'Not implemented';
    }
    get description() {
        throw 'Not implemented';
    }
    set description(description) {
        throw 'Not implemented';
    }
    get hasChildren() {
        throw 'Not implemented';
    }
    get preview() {
        return undefined;
    }
    get className() {
        return null;
    }
    arrayLength() {
        throw 'Not implemented';
    }
    arrayBufferByteLength() {
        throw 'Not implemented';
    }
    getOwnProperties(_generatePreview, _nonIndexedPropertiesOnly) {
        throw 'Not implemented';
    }
    getAllProperties(_accessorPropertiesOnly, _generatePreview, _nonIndexedPropertiesOnly) {
        throw 'Not implemented';
    }
    async deleteProperty(_name) {
        throw 'Not implemented';
    }
    async setPropertyValue(_name, _value) {
        throw 'Not implemented';
    }
    callFunction(_functionDeclaration, _args) {
        throw 'Not implemented';
    }
    callFunctionJSON(_functionDeclaration, _args) {
        throw 'Not implemented';
    }
    release() {
    }
    debuggerModel() {
        throw new Error('DebuggerModel-less object');
    }
    runtimeModel() {
        throw new Error('RuntimeModel-less object');
    }
    isNode() {
        return false;
    }
    /**
     * Checks whether this object can be inspected with the Linear memory inspector.
     * @returns `true` if this object can be inspected with the Linear memory inspector.
     */
    isLinearMemoryInspectable() {
        return false;
    }
    webIdl;
}
export class RemoteObjectImpl extends RemoteObject {
    runtimeModelInternal;
    #runtimeAgent;
    #typeInternal;
    #subtypeInternal;
    #objectIdInternal;
    #descriptionInternal;
    hasChildrenInternal;
    #previewInternal;
    #unserializableValueInternal;
    #valueInternal;
    #customPreviewInternal;
    #classNameInternal;
    constructor(runtimeModel, objectId, type, subtype, value, unserializableValue, description, preview, customPreview, className) {
        super();
        this.runtimeModelInternal = runtimeModel;
        this.#runtimeAgent = runtimeModel.target().runtimeAgent();
        this.#typeInternal = type;
        this.#subtypeInternal = subtype;
        if (objectId) {
            // handle
            this.#objectIdInternal = objectId;
            this.#descriptionInternal = description;
            this.hasChildrenInternal = (type !== 'symbol');
            this.#previewInternal = preview;
        }
        else {
            this.#descriptionInternal = description;
            if (!this.description && unserializableValue) {
                this.#descriptionInternal = unserializableValue;
            }
            if (!this.#descriptionInternal && (typeof value !== 'object' || value === null)) {
                this.#descriptionInternal = String(value);
            }
            this.hasChildrenInternal = false;
            if (typeof unserializableValue === 'string') {
                this.#unserializableValueInternal = unserializableValue;
                if (unserializableValue === "Infinity" /* UnserializableNumber.Infinity */ ||
                    unserializableValue === "-Infinity" /* UnserializableNumber.NegativeInfinity */ ||
                    unserializableValue === "-0" /* UnserializableNumber.Negative0 */ ||
                    unserializableValue === "NaN" /* UnserializableNumber.NaN */) {
                    this.#valueInternal = Number(unserializableValue);
                }
                else if (type === 'bigint' && unserializableValue.endsWith('n')) {
                    this.#valueInternal = BigInt(unserializableValue.substring(0, unserializableValue.length - 1));
                }
                else {
                    this.#valueInternal = unserializableValue;
                }
            }
            else {
                this.#valueInternal = value;
            }
        }
        this.#customPreviewInternal = customPreview || null;
        this.#classNameInternal = typeof className === 'string' ? className : null;
    }
    customPreview() {
        return this.#customPreviewInternal;
    }
    get objectId() {
        return this.#objectIdInternal;
    }
    get type() {
        return this.#typeInternal;
    }
    get subtype() {
        return this.#subtypeInternal;
    }
    get value() {
        return this.#valueInternal;
    }
    unserializableValue() {
        return this.#unserializableValueInternal;
    }
    get description() {
        return this.#descriptionInternal;
    }
    set description(description) {
        this.#descriptionInternal = description;
    }
    get hasChildren() {
        return this.hasChildrenInternal;
    }
    get preview() {
        return this.#previewInternal;
    }
    get className() {
        return this.#classNameInternal;
    }
    getOwnProperties(generatePreview, nonIndexedPropertiesOnly = false) {
        return this.doGetProperties(true, false, nonIndexedPropertiesOnly, generatePreview);
    }
    getAllProperties(accessorPropertiesOnly, generatePreview, nonIndexedPropertiesOnly = false) {
        return this.doGetProperties(false, accessorPropertiesOnly, nonIndexedPropertiesOnly, generatePreview);
    }
    async createRemoteObject(object) {
        return this.runtimeModelInternal.createRemoteObject(object);
    }
    async doGetProperties(ownProperties, accessorPropertiesOnly, nonIndexedPropertiesOnly, generatePreview) {
        if (!this.#objectIdInternal) {
            return { properties: null, internalProperties: null };
        }
        const response = await this.#runtimeAgent.invoke_getProperties({
            objectId: this.#objectIdInternal,
            ownProperties,
            accessorPropertiesOnly,
            nonIndexedPropertiesOnly,
            generatePreview,
        });
        if (response.getError()) {
            return { properties: null, internalProperties: null };
        }
        if (response.exceptionDetails) {
            this.runtimeModelInternal.exceptionThrown(Date.now(), response.exceptionDetails);
            return { properties: null, internalProperties: null };
        }
        const { result: properties = [], internalProperties = [], privateProperties = [] } = response;
        const result = [];
        for (const property of properties) {
            const propertyValue = property.value ? await this.createRemoteObject(property.value) : null;
            const propertySymbol = property.symbol ? this.runtimeModelInternal.createRemoteObject(property.symbol) : null;
            const remoteProperty = new RemoteObjectProperty(property.name, propertyValue, Boolean(property.enumerable), Boolean(property.writable), Boolean(property.isOwn), Boolean(property.wasThrown), propertySymbol);
            if (typeof property.value === 'undefined') {
                if (property.get && property.get.type !== 'undefined') {
                    remoteProperty.getter = this.runtimeModelInternal.createRemoteObject(property.get);
                }
                if (property.set && property.set.type !== 'undefined') {
                    remoteProperty.setter = this.runtimeModelInternal.createRemoteObject(property.set);
                }
            }
            result.push(remoteProperty);
        }
        for (const property of privateProperties) {
            const propertyValue = property.value ? this.runtimeModelInternal.createRemoteObject(property.value) : null;
            const remoteProperty = new RemoteObjectProperty(property.name, propertyValue, true, true, true, false, undefined, false, undefined, true);
            if (typeof property.value === 'undefined') {
                if (property.get && property.get.type !== 'undefined') {
                    remoteProperty.getter = this.runtimeModelInternal.createRemoteObject(property.get);
                }
                if (property.set && property.set.type !== 'undefined') {
                    remoteProperty.setter = this.runtimeModelInternal.createRemoteObject(property.set);
                }
            }
            result.push(remoteProperty);
        }
        const internalPropertiesResult = [];
        for (const property of internalProperties) {
            if (!property.value) {
                continue;
            }
            if (property.name === '[[StableObjectId]]') {
                continue;
            }
            const propertyValue = this.runtimeModelInternal.createRemoteObject(property.value);
            internalPropertiesResult.push(new RemoteObjectProperty(property.name, propertyValue, true, false, undefined, undefined, undefined, true));
        }
        return { properties: result, internalProperties: internalPropertiesResult };
    }
    async setPropertyValue(name, value) {
        if (!this.#objectIdInternal) {
            return 'Can’t set a property of non-object.';
        }
        const response = await this.#runtimeAgent.invoke_evaluate({ expression: value, silent: true });
        if (response.getError() || response.exceptionDetails) {
            return response.getError() ||
                (response.result.type !== 'string' ? response.result.description : response.result.value);
        }
        if (typeof name === 'string') {
            name = RemoteObject.toCallArgument(name);
        }
        const resultPromise = this.doSetObjectPropertyValue(response.result, name);
        if (response.result.objectId) {
            void this.#runtimeAgent.invoke_releaseObject({ objectId: response.result.objectId });
        }
        return resultPromise;
    }
    async doSetObjectPropertyValue(result, name) {
        // This assignment may be for a regular (data) property, and for an accessor property (with getter/setter).
        // Note the sensitive matter about accessor property: the property may be physically defined in some proto object,
        // but logically it is bound to the object in question. JavaScript passes this object to getters/setters, not the object
        // where property was defined; so do we.
        const setPropertyValueFunction = 'function(a, b) { this[a] = b; }';
        const argv = [name, RemoteObject.toCallArgument(result)];
        const response = await this.#runtimeAgent.invoke_callFunctionOn({
            objectId: this.#objectIdInternal,
            functionDeclaration: setPropertyValueFunction,
            arguments: argv,
            silent: true,
        });
        const error = response.getError();
        return error || response.exceptionDetails ? error || response.result.description : undefined;
    }
    async deleteProperty(name) {
        if (!this.#objectIdInternal) {
            return 'Can’t delete a property of non-object.';
        }
        const deletePropertyFunction = 'function(a) { delete this[a]; return !(a in this); }';
        const response = await this.#runtimeAgent.invoke_callFunctionOn({
            objectId: this.#objectIdInternal,
            functionDeclaration: deletePropertyFunction,
            arguments: [name],
            silent: true,
        });
        if (response.getError() || response.exceptionDetails) {
            return response.getError() || response.result.description;
        }
        if (!response.result.value) {
            return 'Failed to delete property.';
        }
        return undefined;
    }
    async callFunction(functionDeclaration, args) {
        const response = await this.#runtimeAgent.invoke_callFunctionOn({
            objectId: this.#objectIdInternal,
            functionDeclaration: functionDeclaration.toString(),
            arguments: args,
            silent: true,
        });
        if (response.getError()) {
            return { object: null, wasThrown: false };
        }
        // TODO: release exceptionDetails object
        return {
            object: this.runtimeModelInternal.createRemoteObject(response.result),
            wasThrown: Boolean(response.exceptionDetails),
        };
    }
    async callFunctionJSON(functionDeclaration, args) {
        const response = await this.#runtimeAgent.invoke_callFunctionOn({
            objectId: this.#objectIdInternal,
            functionDeclaration: functionDeclaration.toString(),
            arguments: args,
            silent: true,
            returnByValue: true,
        });
        return response.getError() || response.exceptionDetails ? null : response.result.value;
    }
    release() {
        if (!this.#objectIdInternal) {
            return;
        }
        void this.#runtimeAgent.invoke_releaseObject({ objectId: this.#objectIdInternal });
    }
    arrayLength() {
        return RemoteObject.arrayLength(this);
    }
    arrayBufferByteLength() {
        return RemoteObject.arrayBufferByteLength(this);
    }
    debuggerModel() {
        return this.runtimeModelInternal.debuggerModel();
    }
    runtimeModel() {
        return this.runtimeModelInternal;
    }
    isNode() {
        return Boolean(this.#objectIdInternal) && this.type === 'object' && this.subtype === 'node';
    }
    isLinearMemoryInspectable() {
        return this.type === 'object' && this.subtype !== undefined &&
            ['webassemblymemory', 'typedarray', 'dataview', 'arraybuffer'].includes(this.subtype);
    }
}
export class ScopeRemoteObject extends RemoteObjectImpl {
    #scopeRef;
    #savedScopeProperties;
    constructor(runtimeModel, objectId, scopeRef, type, subtype, value, unserializableValue, description, preview) {
        super(runtimeModel, objectId, type, subtype, value, unserializableValue, description, preview);
        this.#scopeRef = scopeRef;
        this.#savedScopeProperties = undefined;
    }
    async doGetProperties(ownProperties, accessorPropertiesOnly, _generatePreview) {
        if (accessorPropertiesOnly) {
            return { properties: [], internalProperties: [] };
        }
        if (this.#savedScopeProperties) {
            // No need to reload scope variables, as the remote object never
            // changes its #properties. If variable is updated, the #properties
            // array is patched locally.
            return { properties: this.#savedScopeProperties.slice(), internalProperties: null };
        }
        const allProperties = await super.doGetProperties(ownProperties, accessorPropertiesOnly, false /* nonIndexedPropertiesOnly */, true /* generatePreview */);
        if (this.#scopeRef && Array.isArray(allProperties.properties)) {
            this.#savedScopeProperties = allProperties.properties.slice();
            if (!this.#scopeRef.callFrameId) {
                for (const property of this.#savedScopeProperties) {
                    property.writable = false;
                }
            }
        }
        return allProperties;
    }
    async doSetObjectPropertyValue(result, argumentName) {
        const name = argumentName.value;
        const error = await this.debuggerModel().setVariableValue(this.#scopeRef.number, name, RemoteObject.toCallArgument(result), this.#scopeRef.callFrameId);
        if (error) {
            return error;
        }
        if (this.#savedScopeProperties) {
            for (const property of this.#savedScopeProperties) {
                if (property.name === name) {
                    property.value = this.runtimeModel().createRemoteObject(result);
                }
            }
        }
        return;
    }
}
export class ScopeRef {
    number;
    callFrameId;
    constructor(number, callFrameId) {
        this.number = number;
        this.callFrameId = callFrameId;
    }
}
export class RemoteObjectProperty {
    name;
    value;
    enumerable;
    writable;
    isOwn;
    wasThrown;
    symbol;
    synthetic;
    syntheticSetter;
    private;
    getter;
    setter;
    webIdl;
    constructor(name, value, enumerable, writable, isOwn, wasThrown, symbol, synthetic, syntheticSetter, isPrivate) {
        this.name = name;
        this.value = value !== null ? value : undefined;
        this.enumerable = typeof enumerable !== 'undefined' ? enumerable : true;
        const isNonSyntheticOrSyntheticWritable = !synthetic || Boolean(syntheticSetter);
        this.writable = typeof writable !== 'undefined' ? writable : isNonSyntheticOrSyntheticWritable;
        this.isOwn = Boolean(isOwn);
        this.wasThrown = Boolean(wasThrown);
        if (symbol) {
            this.symbol = symbol;
        }
        this.synthetic = Boolean(synthetic);
        if (syntheticSetter) {
            this.syntheticSetter = syntheticSetter;
        }
        this.private = Boolean(isPrivate);
    }
    async setSyntheticValue(expression) {
        if (!this.syntheticSetter) {
            return false;
        }
        const result = await this.syntheticSetter(expression);
        if (result) {
            this.value = result;
        }
        return Boolean(result);
    }
    isAccessorProperty() {
        return Boolean(this.getter || this.setter);
    }
    match({ includeNullOrUndefinedValues, regex }) {
        if (regex !== null) {
            if (!regex.test(this.name) && !regex.test(this.value?.description ?? '')) {
                return false;
            }
        }
        if (!includeNullOrUndefinedValues) {
            if (!this.isAccessorProperty() && RemoteObject.isNullOrUndefined(this.value)) {
                return false;
            }
        }
        return true;
    }
    cloneWithNewName(newName) {
        const property = new RemoteObjectProperty(newName, this.value ?? null, this.enumerable, this.writable, this.isOwn, this.wasThrown, this.symbol, this.synthetic, this.syntheticSetter, this.private);
        property.getter = this.getter;
        property.setter = this.setter;
        return property;
    }
}
// Below is a wrapper around a local object that implements the RemoteObject interface,
// which can be used by the UI code (primarily ObjectPropertiesSection).
// Note that only JSON-compliant objects are currently supported, as there's no provision
// for traversing prototypes, extracting class names via constructor, handling #properties
// or functions.
export class LocalJSONObject extends RemoteObject {
    valueInternal;
    #cachedDescription;
    #cachedChildren;
    constructor(value) {
        super();
        this.valueInternal = value;
    }
    get objectId() {
        return undefined;
    }
    get value() {
        return this.valueInternal;
    }
    unserializableValue() {
        const unserializableDescription = RemoteObject.unserializableDescription(this.valueInternal);
        return unserializableDescription || undefined;
    }
    get description() {
        if (this.#cachedDescription) {
            return this.#cachedDescription;
        }
        function formatArrayItem(property) {
            return this.formatValue(property.value || null);
        }
        function formatObjectItem(property) {
            let name = property.name;
            if (/^\s|\s$|^$|\n/.test(name)) {
                name = '"' + name.replace(/\n/g, '\u21B5') + '"';
            }
            return name + ': ' + this.formatValue(property.value || null);
        }
        if (this.type === 'object') {
            switch (this.subtype) {
                case 'array':
                    this.#cachedDescription = this.concatenate('[', ']', formatArrayItem.bind(this));
                    break;
                case 'date':
                    this.#cachedDescription = String(this.valueInternal);
                    break;
                case 'null':
                    this.#cachedDescription = 'null';
                    break;
                default:
                    this.#cachedDescription = this.concatenate('{', '}', formatObjectItem.bind(this));
            }
        }
        else {
            this.#cachedDescription = String(this.valueInternal);
        }
        return this.#cachedDescription;
    }
    formatValue(value) {
        if (!value) {
            return 'undefined';
        }
        const description = value.description || '';
        if (value.type === 'string') {
            return '"' + description.replace(/\n/g, '\u21B5') + '"';
        }
        return description;
    }
    concatenate(prefix, suffix, formatProperty) {
        const previewChars = 100;
        let buffer = prefix;
        const children = this.children();
        for (let i = 0; i < children.length; ++i) {
            const itemDescription = formatProperty(children[i]);
            if (buffer.length + itemDescription.length > previewChars) {
                buffer += ',…';
                break;
            }
            if (i) {
                buffer += ', ';
            }
            buffer += itemDescription;
        }
        buffer += suffix;
        return buffer;
    }
    get type() {
        return typeof this.valueInternal;
    }
    get subtype() {
        if (this.valueInternal === null) {
            return 'null';
        }
        if (Array.isArray(this.valueInternal)) {
            return 'array';
        }
        if (this.valueInternal instanceof Date) {
            return 'date';
        }
        return undefined;
    }
    get hasChildren() {
        if ((typeof this.valueInternal !== 'object') || (this.valueInternal === null)) {
            return false;
        }
        return Boolean(Object.keys(this.valueInternal).length);
    }
    async getOwnProperties(_generatePreview, nonIndexedPropertiesOnly = false) {
        function isArrayIndex(name) {
            const index = Number(name) >>> 0;
            return String(index) === name;
        }
        let properties = this.children();
        if (nonIndexedPropertiesOnly) {
            properties = properties.filter(property => !isArrayIndex(property.name));
        }
        return { properties, internalProperties: null };
    }
    async getAllProperties(accessorPropertiesOnly, generatePreview, nonIndexedPropertiesOnly = false) {
        if (accessorPropertiesOnly) {
            return { properties: [], internalProperties: null };
        }
        return await this.getOwnProperties(generatePreview, nonIndexedPropertiesOnly);
    }
    children() {
        if (!this.hasChildren) {
            return [];
        }
        if (!this.#cachedChildren) {
            this.#cachedChildren = Object.entries(this.valueInternal).map(([name, value]) => {
                return new RemoteObjectProperty(name, value instanceof RemoteObject ? value : RemoteObject.fromLocalObject(value));
            });
        }
        return this.#cachedChildren;
    }
    arrayLength() {
        return Array.isArray(this.valueInternal) ? this.valueInternal.length : 0;
    }
    async callFunction(functionDeclaration, args) {
        const target = this.valueInternal;
        const rawArgs = args ? args.map(arg => arg.value) : [];
        let result;
        let wasThrown = false;
        try {
            result = functionDeclaration.apply(target, rawArgs);
        }
        catch (e) {
            wasThrown = true;
        }
        const object = RemoteObject.fromLocalObject(result);
        return { object, wasThrown };
    }
    async callFunctionJSON(functionDeclaration, args) {
        const target = this.valueInternal;
        const rawArgs = args ? args.map(arg => arg.value) : [];
        let result;
        try {
            result = functionDeclaration.apply(target, rawArgs);
        }
        catch (e) {
            result = null;
        }
        return result;
    }
}
export class RemoteArrayBuffer {
    #objectInternal;
    constructor(object) {
        if (object.type !== 'object' || object.subtype !== 'arraybuffer') {
            throw new Error('Object is not an arraybuffer');
        }
        this.#objectInternal = object;
    }
    byteLength() {
        return this.#objectInternal.arrayBufferByteLength();
    }
    async bytes(start = 0, end = this.byteLength()) {
        if (start < 0 || start >= this.byteLength()) {
            throw new RangeError('start is out of range');
        }
        if (end < start || end > this.byteLength()) {
            throw new RangeError('end is out of range');
        }
        return await this.#objectInternal.callFunctionJSON(bytes, [{ value: start }, { value: end - start }]);
        function bytes(offset, length) {
            return [...new Uint8Array(this, offset, length)];
        }
    }
    object() {
        return this.#objectInternal;
    }
}
export class RemoteArray {
    #objectInternal;
    constructor(object) {
        this.#objectInternal = object;
    }
    static objectAsArray(object) {
        if (!object || object.type !== 'object' || (object.subtype !== 'array' && object.subtype !== 'typedarray')) {
            throw new Error('Object is empty or not an array');
        }
        return new RemoteArray(object);
    }
    static async createFromRemoteObjects(objects) {
        if (!objects.length) {
            throw new Error('Input array is empty');
        }
        const result = await objects[0].callFunction(createArray, objects.map(RemoteObject.toCallArgument));
        if (result.wasThrown || !result.object) {
            throw new Error('Call function throws exceptions or returns empty value');
        }
        return RemoteArray.objectAsArray(result.object);
        function createArray(...args) {
            return args;
        }
    }
    async at(index) {
        if (index < 0 || index > this.#objectInternal.arrayLength()) {
            throw new Error('Out of range');
        }
        const result = await this.#objectInternal.callFunction(at, [RemoteObject.toCallArgument(index)]);
        if (result.wasThrown || !result.object) {
            throw new Error('Exception in callFunction or result value is empty');
        }
        return result.object;
        function at(index) {
            return this[index];
        }
    }
    length() {
        return this.#objectInternal.arrayLength();
    }
    map(func) {
        const promises = [];
        for (let i = 0; i < this.length(); ++i) {
            promises.push(this.at(i).then(func));
        }
        return Promise.all(promises);
    }
    object() {
        return this.#objectInternal;
    }
}
export class RemoteFunction {
    #objectInternal;
    constructor(object) {
        this.#objectInternal = object;
    }
    static objectAsFunction(object) {
        if (!object || object.type !== 'function') {
            throw new Error('Object is empty or not a function');
        }
        return new RemoteFunction(object);
    }
    targetFunction() {
        return this.#objectInternal.getOwnProperties(false /* generatePreview */).then(targetFunction.bind(this));
        function targetFunction(ownProperties) {
            if (!ownProperties.internalProperties) {
                return this.#objectInternal;
            }
            const internalProperties = ownProperties.internalProperties;
            for (const property of internalProperties) {
                if (property.name === '[[TargetFunction]]') {
                    return property.value;
                }
            }
            return this.#objectInternal;
        }
    }
    targetFunctionDetails() {
        return this.targetFunction().then(functionDetails.bind(this));
        function functionDetails(targetFunction) {
            const boundReleaseFunctionDetails = releaseTargetFunction.bind(null, this.#objectInternal !== targetFunction ? targetFunction : null);
            return targetFunction.debuggerModel().functionDetailsPromise(targetFunction).then(boundReleaseFunctionDetails);
        }
        function releaseTargetFunction(targetFunction, functionDetails) {
            if (targetFunction) {
                targetFunction.release();
            }
            return functionDetails;
        }
    }
    object() {
        return this.#objectInternal;
    }
}
export class RemoteError {
    #object;
    #exceptionDetails;
    #cause;
    constructor(object) {
        this.#object = object;
    }
    static objectAsError(object) {
        if (object.subtype !== 'error') {
            throw new Error(`Object of type ${object.subtype} is not an error`);
        }
        return new RemoteError(object);
    }
    get errorStack() {
        return this.#object.description ?? '';
    }
    exceptionDetails() {
        if (!this.#exceptionDetails) {
            this.#exceptionDetails = this.#lookupExceptionDetails();
        }
        return this.#exceptionDetails;
    }
    #lookupExceptionDetails() {
        if (this.#object.objectId) {
            return this.#object.runtimeModel().getExceptionDetails(this.#object.objectId);
        }
        return Promise.resolve(undefined);
    }
    cause() {
        if (!this.#cause) {
            this.#cause = this.#lookupCause();
        }
        return this.#cause;
    }
    async #lookupCause() {
        const allProperties = await this.#object.getAllProperties(false /* accessorPropertiesOnly */, false /* generatePreview */);
        const cause = allProperties.properties?.find(prop => prop.name === 'cause');
        return cause?.value;
    }
}
const descriptionLengthParenRegex = /\(([0-9]+)\)/;
const descriptionLengthSquareRegex = /\[([0-9]+)\]/;
/**
 * Pair of a linear memory inspectable {@link RemoteObject} and an optional
 * expression, which identifies the variable holding the object in the
 * current scope or the name of the field holding the object.
 *
 * This data structure is used to reveal an object in the Linear Memory
 * Inspector panel.
 */
export class LinearMemoryInspectable {
    /** The linear memory inspectable {@link RemoteObject}. */
    object;
    /** The name of the variable or the field holding the `object`. */
    expression;
    /**
     * Wrap `object` and `expression` into a reveable structure.
     *
     * @param object A linear memory inspectable {@link RemoteObject}.
     * @param expression An optional name of the field or variable holding the `object`.
     */
    constructor(object, expression) {
        if (!object.isLinearMemoryInspectable()) {
            throw new Error('object must be linear memory inspectable');
        }
        this.object = object;
        this.expression = expression;
    }
}
//# sourceMappingURL=RemoteObject.js.map