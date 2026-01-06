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
import { AI_CONFIG } from "./config";
import { withTimeout, retry, ConcurrencyLimiter, CircuitBreaker } from "./aiHelpers";
var DEFAULT_TIMEOUT = 8000; // ms
var DEFAULT_RETRIES = 3;
var limiter = new ConcurrencyLimiter(Math.max(2, Number(process.env.REACT_APP_AI_MAX_CONCURRENCY) || 4));
var circuit = new CircuitBreaker(5, 15000); // 5 failures, 15s cooldown
// ================= วิเคราะห์อากาศ (ใช้ GitHub/GPT เป็นหลัก) =================
export var getAIAnalysis = function (weather) { return __awaiter(void 0, void 0, void 0, function () {
    var fallbackData, fn_1, result, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                fallbackData = {
                    summary: "\u0E27\u0E31\u0E19\u0E19\u0E35\u0E49\u0E17\u0E35\u0E48 ".concat(weather.city, " \u0E2D\u0E32\u0E01\u0E32\u0E28").concat(weather.conditionText, " \u0E2D\u0E38\u0E13\u0E2B\u0E20\u0E39\u0E21\u0E34 ").concat(weather.temperature, "\u00B0C"),
                    clothingAdvice: "แต่งกายตามปกติ ระบายอากาศได้ดี",
                    healthAdvice: "ดื่มน้ำบ่อยๆ ดูแลสุขภาพด้วยนะคะ",
                    activityRecommendation: "ทำกิจกรรมสันทนาการได้ตามปกติ"
                };
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                if (circuit.isOpen()) {
                    console.warn('AI circuit breaker open, returning fallback');
                    return [2 /*return*/, fallbackData];
                }
                fn_1 = function () { return __awaiter(void 0, void 0, void 0, function () {
                    var response, data;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, fetch(AI_CONFIG.GITHUB.ENDPOINT, {
                                    method: "POST",
                                    headers: {
                                        "Content-Type": "application/json",
                                        "Authorization": "Bearer ".concat(AI_CONFIG.GITHUB.TOKEN)
                                    },
                                    body: JSON.stringify({
                                        messages: [
                                            { role: "system", content: "You are a weather assistant. Respond in Thai JSON." },
                                            { role: "user", content: "\u0E27\u0E34\u0E40\u0E04\u0E23\u0E32\u0E30\u0E2B\u0E4C\u0E2D\u0E32\u0E01\u0E32\u0E28 ".concat(weather.city, ": ").concat(weather.temperature, "\u00B0C, ").concat(weather.conditionText, ". JSON fields: summary, clothingAdvice, healthAdvice, activityRecommendation") }
                                        ],
                                        model: AI_CONFIG.GITHUB.MODEL,
                                        response_format: { type: "json_object" }
                                    })
                                })];
                            case 1:
                                response = _a.sent();
                                if (!response.ok)
                                    throw new Error("API error ".concat(response.status));
                                return [4 /*yield*/, response.json()];
                            case 2:
                                data = _a.sent();
                                return [2 /*return*/, JSON.parse(data.choices[0].message.content)];
                        }
                    });
                }); };
                return [4 /*yield*/, circuit.run(function () { return limiter.run(function () { return retry(function () { return withTimeout(fn_1(), DEFAULT_TIMEOUT, 'AI timeout'); }, DEFAULT_RETRIES); }); })];
            case 2:
                result = _a.sent();
                return [2 /*return*/, result];
            case 3:
                error_1 = _a.sent();
                console.error('getAIAnalysis failed:', error_1);
                return [2 /*return*/, fallbackData];
            case 4: return [2 /*return*/];
        }
    });
}); };
// น้องฟ้าใส (GitHub/GPT)
var FahsaiChatSession = /** @class */ (function () {
    function FahsaiChatSession(weather) {
        this.weather = weather;
        this.history = [];
        this.history = [{
                role: "system",
                content: "\u0E04\u0E38\u0E13\u0E04\u0E37\u0E2D \"\u0E19\u0E49\u0E2D\u0E07\u0E1F\u0E49\u0E32\u0E43\u0E2A\" \u0E1C\u0E39\u0E49\u0E0A\u0E48\u0E27\u0E22\u0E2A\u0E32\u0E27\u0E19\u0E49\u0E2D\u0E22\u0E23\u0E48\u0E32\u0E40\u0E23\u0E34\u0E07 \u0E04\u0E38\u0E22\u0E20\u0E32\u0E29\u0E32\u0E44\u0E17\u0E22 \u0E21\u0E35\u0E2B\u0E32\u0E07\u0E40\u0E2A\u0E35\u0E22\u0E07 \u0E19\u0E30\u0E04\u0E30/\u0E04\u0E48\u0E32\u0E32 \u2728 \u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E2D\u0E32\u0E01\u0E32\u0E28: ".concat(weather.city, ", ").concat(weather.temperature, "\u00B0C")
            }];
        console.log("FahsaiChatSession initialized with weather:", weather.city);
    }
    FahsaiChatSession.prototype.sendMessage = function (msg) {
        return __awaiter(this, void 0, void 0, function () {
            var fn_2, fallbackMessage_1, text_1, error_2, fallbackMessage_2;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        if (!this.history) {
                            throw new Error("Chat history is not initialized");
                        }
                        console.log("Sending message to GPT:", msg);
                        this.history.push({ role: "user", content: msg });
                        fn_2 = function () { return __awaiter(_this, void 0, void 0, function () {
                            var res, errorData, data, text;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, fetch(AI_CONFIG.GITHUB.ENDPOINT, {
                                            method: "POST",
                                            headers: {
                                                "Content-Type": "application/json",
                                                "Authorization": "Bearer ".concat(AI_CONFIG.GITHUB.TOKEN)
                                            },
                                            body: JSON.stringify({ messages: this.history, model: AI_CONFIG.GITHUB.MODEL })
                                        })];
                                    case 1:
                                        res = _a.sent();
                                        if (!!res.ok) return [3 /*break*/, 3];
                                        return [4 /*yield*/, res.text()];
                                    case 2:
                                        errorData = _a.sent();
                                        throw new Error("API Error: ".concat(res.status, " ").concat(errorData));
                                    case 3: return [4 /*yield*/, res.json()];
                                    case 4:
                                        data = _a.sent();
                                        if (!data.choices || !data.choices[0] || !data.choices[0].message) {
                                            throw new Error("Invalid response structure from GPT API");
                                        }
                                        text = data.choices[0].message.content;
                                        if (!text || typeof text !== "string") {
                                            throw new Error("Invalid response text from GPT API");
                                        }
                                        return [2 /*return*/, text];
                                }
                            });
                        }); };
                        if (circuit.isOpen()) {
                            console.warn('GPT circuit breaker open, returning fallback');
                            fallbackMessage_1 = "ขออภัยค่ะ ระบบขัดข้องชั่วคราว ลองใหม่อีกครั้งนะคะ";
                            this.history.push({ role: "assistant", content: fallbackMessage_1 });
                            return [2 /*return*/, { response: { text: function () { return fallbackMessage_1; } } }];
                        }
                        return [4 /*yield*/, circuit.run(function () { return limiter.run(function () { return retry(function () { return withTimeout(fn_2(), DEFAULT_TIMEOUT, 'GPT timeout'); }, DEFAULT_RETRIES); }); })];
                    case 1:
                        text_1 = _a.sent();
                        console.log("Received response from GPT:", text_1);
                        this.history.push({ role: "assistant", content: text_1 });
                        return [2 /*return*/, { response: { text: function () { return text_1; } } }];
                    case 2:
                        error_2 = _a.sent();
                        console.error("Error during GPT API call:", error_2);
                        fallbackMessage_2 = "ขออภัยค่ะ ระบบขัดข้องชั่วคราว ลองใหม่อีกครั้งนะคะ";
                        this.history.push({ role: "assistant", content: fallbackMessage_2 });
                        return [2 /*return*/, { response: { text: function () { return fallbackMessage_2; } } }];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return FahsaiChatSession;
}());
export { FahsaiChatSession };
