var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
// Simple circuit breaker: opens after N failures, closes after cooldown
var CircuitBreaker = /** @class */ (function () {
    function CircuitBreaker(maxFailures, cooldownMs) {
        if (maxFailures === void 0) { maxFailures = 5; }
        if (cooldownMs === void 0) { cooldownMs = 15000; }
        this.maxFailures = maxFailures;
        this.cooldownMs = cooldownMs;
        this.failures = 0;
        this.lastFailure = 0;
        this.openUntil = 0;
    }
    CircuitBreaker.prototype.run = function (fn) {
        return __awaiter(this, void 0, void 0, function () {
            var now, result, e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        now = Date.now();
                        if (this.openUntil > now) {
                            console.warn('[CircuitBreaker] Call blocked: circuit is open until', new Date(this.openUntil).toISOString());
                            throw new Error('Circuit breaker open');
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, fn()];
                    case 2:
                        result = _a.sent();
                        this.failures = 0;
                        return [2 /*return*/, result];
                    case 3:
                        e_1 = _a.sent();
                        this.failures++;
                        this.lastFailure = now;
                        if (this.failures >= this.maxFailures) {
                            this.openUntil = now + this.cooldownMs;
                            console.warn('[CircuitBreaker] Tripped after', this.failures, 'failures. Blocking calls for', this.cooldownMs, 'ms until', new Date(this.openUntil).toISOString());
                        }
                        throw e_1;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    CircuitBreaker.prototype.isOpen = function () {
        return this.openUntil > Date.now();
    };
    return CircuitBreaker;
}());
export { CircuitBreaker };
// Small helpers: timeout, retry with exponential backoff, and a simple concurrency limiter
export var withTimeout = function (promise, ms, errorMessage) {
    if (errorMessage === void 0) { errorMessage = 'Timeout'; }
    return new Promise(function (resolve, reject) {
        var timer = setTimeout(function () { return reject(new Error(errorMessage)); }, ms);
        promise.then(function (v) { clearTimeout(timer); resolve(v); }).catch(function (e) { clearTimeout(timer); reject(e); });
    });
};
export var retry = function (fn_1) {
    var args_1 = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args_1[_i - 1] = arguments[_i];
    }
    return __awaiter(void 0, __spreadArray([fn_1], args_1, true), void 0, function (fn, attempts, delayMs, factor, label) {
        var lastErr, wait, i, err_1;
        if (attempts === void 0) { attempts = 3; }
        if (delayMs === void 0) { delayMs = 300; }
        if (factor === void 0) { factor = 2; }
        if (label === void 0) { label = 'AI'; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    wait = delayMs;
                    i = 0;
                    _a.label = 1;
                case 1:
                    if (!(i < attempts)) return [3 /*break*/, 8];
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 7]);
                    if (i > 0) {
                        console.warn("[".concat(label, "] Retry attempt ").concat(i + 1, " after failure:"), lastErr);
                    }
                    return [4 /*yield*/, fn()];
                case 3: return [2 /*return*/, _a.sent()];
                case 4:
                    err_1 = _a.sent();
                    lastErr = err_1;
                    if (!(i < attempts - 1)) return [3 /*break*/, 6];
                    return [4 /*yield*/, new Promise(function (r) { return setTimeout(r, wait); })];
                case 5:
                    _a.sent();
                    wait *= factor;
                    _a.label = 6;
                case 6: return [3 /*break*/, 7];
                case 7:
                    i++;
                    return [3 /*break*/, 1];
                case 8:
                    console.error("[".concat(label, "] All retry attempts failed. Last error:"), lastErr);
                    throw lastErr;
            }
        });
    });
};
var ConcurrencyLimiter = /** @class */ (function () {
    function ConcurrencyLimiter(maxConcurrency) {
        if (maxConcurrency === void 0) { maxConcurrency = 5; }
        this.maxConcurrency = maxConcurrency;
        this.running = 0;
        this.queue = [];
    }
    ConcurrencyLimiter.prototype.run = function (fn_1) {
        return __awaiter(this, arguments, void 0, function (fn, label) {
            var next;
            var _this = this;
            if (label === void 0) { label = 'AI'; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(this.running >= this.maxConcurrency)) return [3 /*break*/, 2];
                        console.warn("[".concat(label, "] Throttling: concurrency limit reached (").concat(this.maxConcurrency, "), queuing request."));
                        return [4 /*yield*/, new Promise(function (resolve) { return _this.queue.push(resolve); })];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        this.running++;
                        _a.label = 3;
                    case 3:
                        _a.trys.push([3, , 5, 6]);
                        return [4 /*yield*/, fn()];
                    case 4: return [2 /*return*/, _a.sent()];
                    case 5:
                        this.running--;
                        next = this.queue.shift();
                        if (next)
                            next();
                        return [7 /*endfinally*/];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    return ConcurrencyLimiter;
}());
export { ConcurrencyLimiter };
export default {
    withTimeout: withTimeout,
    retry: retry,
    ConcurrencyLimiter: ConcurrencyLimiter,
    CircuitBreaker: CircuitBreaker
};
