// Simple circuit breaker: opens after N failures, closes after cooldown
export class CircuitBreaker {
    private failures = 0;
    private lastFailure = 0;
    private openUntil = 0;
    constructor(
        private maxFailures = 5,
        private cooldownMs = 15000
    ) {}
    async run<T>(fn: () => Promise<T>): Promise<T> {
        const now = Date.now();
        if (this.openUntil > now) {
            console.warn('[CircuitBreaker] Call blocked: circuit is open until', new Date(this.openUntil).toISOString());
            throw new Error('Circuit breaker open');
        }
        try {
            const result = await fn();
            this.failures = 0;
            return result;
        } catch (e) {
            this.failures++;
            this.lastFailure = now;
            if (this.failures >= this.maxFailures) {
                this.openUntil = now + this.cooldownMs;
                console.warn('[CircuitBreaker] Tripped after', this.failures, 'failures. Blocking calls for', this.cooldownMs, 'ms until', new Date(this.openUntil).toISOString());
            }
            throw e;
        }
    }
    isOpen() {
        return this.openUntil > Date.now();
    }
}
// Small helpers: timeout, retry with exponential backoff, and a simple concurrency limiter
export const withTimeout = <T>(promise: Promise<T>, ms: number, errorMessage = 'Timeout') => {
    return new Promise<T>((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error(errorMessage)), ms);
        promise.then((v) => { clearTimeout(timer); resolve(v); }).catch((e) => { clearTimeout(timer); reject(e); });
    });
};

export const retry = async <T>(fn: () => Promise<T>, attempts = 3, delayMs = 300, factor = 2, label = 'AI'): Promise<T> => {
    let lastErr: any;
    let wait = delayMs;
    for (let i = 0; i < attempts; i++) {
        try {
            if (i > 0) {
                console.warn(`[${label}] Retry attempt ${i + 1} after failure:`, lastErr);
            }
            return await fn();
        } catch (err) {
            lastErr = err;
            if (i < attempts - 1) {
                await new Promise((r) => setTimeout(r, wait));
                wait *= factor;
            }
        }
    }
    console.error(`[${label}] All retry attempts failed. Last error:`, lastErr);
    throw lastErr;
};

export class ConcurrencyLimiter {
    private running = 0;
    private queue: Array<() => void> = [];

    constructor(private maxConcurrency = 5) {}

    async run<T>(fn: () => Promise<T>, label = 'AI'): Promise<T> {
        if (this.running >= this.maxConcurrency) {
            console.warn(`[${label}] Throttling: concurrency limit reached (${this.maxConcurrency}), queuing request.`);
            await new Promise<void>((resolve) => this.queue.push(resolve));
        }
        this.running++;
        try {
            return await fn();
        } finally {
            this.running--;
            const next = this.queue.shift();
            if (next) next();
        }
    }
}

export default {
    withTimeout,
    retry,
    ConcurrencyLimiter,
    CircuitBreaker
};
