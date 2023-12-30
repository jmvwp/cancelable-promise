const validateCb = (cb, name = "Arg name", allowEmpty = false) => {
    if (allowEmpty) {
        if (cb && typeof cb !== "function") {
            throw new Error(name + " should be a function");
        }
    } else {
        if (typeof cb !== "function") {
            throw new Error(name + " should be a function");
        }
    }
};
const cancelReject = { isCanceled: true };

const isBasicPromise = (mbPromise) => {
    return typeof mbPromise === "object" && mbPromise instanceof Promise;
};

class CancelablePromise {
    constructor(executor, innerPromise = null, relatedPromises = []) {
        if (!isBasicPromise(innerPromise)) {
            validateCb(executor, "executor");
        }

        this.isCanceled = false;
        this.relatedPromises = relatedPromises;
        this.innerPromise =
            innerPromise ??
            new Promise((resolve, reject) => {
                executor((innerResolve) => {
                    this.isCanceled ? reject(cancelReject) : resolve(innerResolve);
                }, reject);
            });

        this.relatedPromises.push(this);
    }

    then(onFulfilled, onRejected) {
        validateCb(onFulfilled, "onFulfilled", true);
        validateCb(onRejected, "onRejected", true);
        const basicPromise = this.innerPromise.then(onFulfilled, onRejected).catch(onRejected);
        return new CancelablePromise(null, basicPromise, this.relatedPromises);
    }

    catch(onRejected) {
        validateCb(onRejected, "onRejected");
        return this.then(null, onRejected);
    }

    cancel() {
        this.relatedPromises.forEach((p) => (p.isCanceled = true));
        return this;
    }
}

module.exports = CancelablePromise;
