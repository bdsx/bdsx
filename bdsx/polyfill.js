"use strict";
if (Promise.prototype.finally == null) {
    Promise.prototype.finally = function (onfinally) {
        async function voiding(value) {
            if (!onfinally)
                return;
            onfinally();
            return value;
        }
        return this.then(voiding, voiding);
    };
}
//# sourceMappingURL=polyfill.js.map