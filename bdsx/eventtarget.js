"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventEx = exports.Event = void 0;
const common_1 = require("./common");
const source_map_support_1 = require("./source-map-support");
class Event {
    constructor() {
        this.listeners = [];
        this.installer = null;
        this.uninstaller = null;
    }
    /**
     * call the installer when first listener registered.
     */
    setInstaller(installer, uninstaller = null) {
        if (this.listeners.length !== 0) {
            if (this.uninstaller !== null) {
                this.uninstaller();
            }
            installer();
            if (uninstaller === null) {
                this.installer = null;
            }
            else {
                this.installer = installer;
            }
        }
        else {
            this.installer = installer;
        }
        this.uninstaller = uninstaller;
    }
    /**
     * pipe two events
     * it uses setInstaller
     */
    pipe(target, piper) {
        const pipe = ((...args) => piper.call(this, ...args));
        this.setInstaller(() => target.on(pipe), () => target.remove(pipe));
    }
    isEmpty() {
        return this.listeners.length === 0;
    }
    /**
     * cancel event if it returns non-undefined value
     */
    on(listener) {
        if (this.listeners.length === 0 && this.installer !== null) {
            this.installer();
            if (this.uninstaller === null) {
                this.installer = null;
            }
        }
        this.listeners.push(listener);
    }
    once(listener) {
        const listenerWrap = (...args) => {
            this.remove(listenerWrap);
            return listener(...args);
        };
        this.on(listenerWrap);
    }
    promise() {
        return new Promise(resolve => this.once(resolve));
    }
    onFirst(listener) {
        this.listeners.unshift(listener);
    }
    onLast(listener) {
        this.listeners.push(listener);
    }
    onBefore(listener, needle) {
        const idx = this.listeners.indexOf(needle);
        if (idx === -1)
            throw Error('needle not found');
        this.listeners.splice(idx, 0, listener);
    }
    onAfter(listener, needle) {
        const idx = this.listeners.indexOf(needle);
        if (idx === -1)
            throw Error('needle not found');
        this.listeners.splice(idx + 1, 0, listener);
    }
    remove(listener) {
        const idx = this.listeners.indexOf(listener);
        if (idx === -1)
            return false;
        this.listeners.splice(idx, 1);
        if (this.listeners.length === 0 && this.uninstaller != null) {
            this.uninstaller();
        }
        return true;
    }
    /**
     * return value if it canceled
     */
    _fireWithoutErrorHandling(...v) {
        for (const listener of this.listeners) {
            try {
                const ret = listener(...v);
                if (ret === common_1.CANCEL)
                    return common_1.CANCEL;
                if (typeof ret === 'number')
                    return ret;
            }
            catch (err) {
                (0, source_map_support_1.remapAndPrintError)(err);
            }
        }
        return undefined;
    }
    /**
     * return value if it canceled
     */
    fire(...v) {
        for (const listener of this.listeners.slice()) {
            try {
                const ret = listener(...v);
                if (ret === common_1.CANCEL)
                    return common_1.CANCEL;
                if (typeof ret === 'number')
                    return ret;
            }
            catch (err) {
                Event.errorHandler._fireWithoutErrorHandling(err);
            }
        }
    }
    /**
     * reverse listener orders
     * return value if it canceled
     */
    fireReverse(...v) {
        for (const listener of this.listeners.slice().reverse()) {
            try {
                const ret = listener(...v);
                if (ret === common_1.CANCEL)
                    return common_1.CANCEL;
                if (typeof ret === 'number')
                    return ret;
            }
            catch (err) {
                Event.errorHandler._fireWithoutErrorHandling(err);
            }
        }
    }
    allListeners() {
        return this.listeners.values();
    }
    /**
     * remove all listeners
     */
    clear() {
        this.listeners.length = 0;
    }
}
exports.Event = Event;
Event.errorHandler = new Event();
/**
 * @deprecated use Event.setInstaller
 */
class EventEx extends Event {
    onStarted() {
        // empty
    }
    onCleared() {
        // empty
    }
    on(listener) {
        if (this.isEmpty())
            this.onStarted();
        super.on(listener);
    }
    remove(listener) {
        if (!this.remove(listener))
            return false;
        if (this.isEmpty())
            this.onCleared();
        return true;
    }
}
exports.EventEx = EventEx;
//# sourceMappingURL=eventtarget.js.map