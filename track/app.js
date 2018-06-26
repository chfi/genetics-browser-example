(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.GGB = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],2:[function(require,module,exports){
var bigInt = (function (undefined) {
    "use strict";

    var BASE = 1e7,
        LOG_BASE = 7,
        MAX_INT = 9007199254740992,
        MAX_INT_ARR = smallToArray(MAX_INT),
        LOG_MAX_INT = Math.log(MAX_INT);

    function Integer(v, radix) {
        if (typeof v === "undefined") return Integer[0];
        if (typeof radix !== "undefined") return +radix === 10 ? parseValue(v) : parseBase(v, radix);
        return parseValue(v);
    }

    function BigInteger(value, sign) {
        this.value = value;
        this.sign = sign;
        this.isSmall = false;
    }
    BigInteger.prototype = Object.create(Integer.prototype);

    function SmallInteger(value) {
        this.value = value;
        this.sign = value < 0;
        this.isSmall = true;
    }
    SmallInteger.prototype = Object.create(Integer.prototype);

    function isPrecise(n) {
        return -MAX_INT < n && n < MAX_INT;
    }

    function smallToArray(n) { // For performance reasons doesn't reference BASE, need to change this function if BASE changes
        if (n < 1e7)
            return [n];
        if (n < 1e14)
            return [n % 1e7, Math.floor(n / 1e7)];
        return [n % 1e7, Math.floor(n / 1e7) % 1e7, Math.floor(n / 1e14)];
    }

    function arrayToSmall(arr) { // If BASE changes this function may need to change
        trim(arr);
        var length = arr.length;
        if (length < 4 && compareAbs(arr, MAX_INT_ARR) < 0) {
            switch (length) {
                case 0: return 0;
                case 1: return arr[0];
                case 2: return arr[0] + arr[1] * BASE;
                default: return arr[0] + (arr[1] + arr[2] * BASE) * BASE;
            }
        }
        return arr;
    }

    function trim(v) {
        var i = v.length;
        while (v[--i] === 0);
        v.length = i + 1;
    }

    function createArray(length) { // function shamelessly stolen from Yaffle's library https://github.com/Yaffle/BigInteger
        var x = new Array(length);
        var i = -1;
        while (++i < length) {
            x[i] = 0;
        }
        return x;
    }

    function truncate(n) {
        if (n > 0) return Math.floor(n);
        return Math.ceil(n);
    }

    function add(a, b) { // assumes a and b are arrays with a.length >= b.length
        var l_a = a.length,
            l_b = b.length,
            r = new Array(l_a),
            carry = 0,
            base = BASE,
            sum, i;
        for (i = 0; i < l_b; i++) {
            sum = a[i] + b[i] + carry;
            carry = sum >= base ? 1 : 0;
            r[i] = sum - carry * base;
        }
        while (i < l_a) {
            sum = a[i] + carry;
            carry = sum === base ? 1 : 0;
            r[i++] = sum - carry * base;
        }
        if (carry > 0) r.push(carry);
        return r;
    }

    function addAny(a, b) {
        if (a.length >= b.length) return add(a, b);
        return add(b, a);
    }

    function addSmall(a, carry) { // assumes a is array, carry is number with 0 <= carry < MAX_INT
        var l = a.length,
            r = new Array(l),
            base = BASE,
            sum, i;
        for (i = 0; i < l; i++) {
            sum = a[i] - base + carry;
            carry = Math.floor(sum / base);
            r[i] = sum - carry * base;
            carry += 1;
        }
        while (carry > 0) {
            r[i++] = carry % base;
            carry = Math.floor(carry / base);
        }
        return r;
    }

    BigInteger.prototype.add = function (v) {
        var n = parseValue(v);
        if (this.sign !== n.sign) {
            return this.subtract(n.negate());
        }
        var a = this.value, b = n.value;
        if (n.isSmall) {
            return new BigInteger(addSmall(a, Math.abs(b)), this.sign);
        }
        return new BigInteger(addAny(a, b), this.sign);
    };
    BigInteger.prototype.plus = BigInteger.prototype.add;

    SmallInteger.prototype.add = function (v) {
        var n = parseValue(v);
        var a = this.value;
        if (a < 0 !== n.sign) {
            return this.subtract(n.negate());
        }
        var b = n.value;
        if (n.isSmall) {
            if (isPrecise(a + b)) return new SmallInteger(a + b);
            b = smallToArray(Math.abs(b));
        }
        return new BigInteger(addSmall(b, Math.abs(a)), a < 0);
    };
    SmallInteger.prototype.plus = SmallInteger.prototype.add;

    function subtract(a, b) { // assumes a and b are arrays with a >= b
        var a_l = a.length,
            b_l = b.length,
            r = new Array(a_l),
            borrow = 0,
            base = BASE,
            i, difference;
        for (i = 0; i < b_l; i++) {
            difference = a[i] - borrow - b[i];
            if (difference < 0) {
                difference += base;
                borrow = 1;
            } else borrow = 0;
            r[i] = difference;
        }
        for (i = b_l; i < a_l; i++) {
            difference = a[i] - borrow;
            if (difference < 0) difference += base;
            else {
                r[i++] = difference;
                break;
            }
            r[i] = difference;
        }
        for (; i < a_l; i++) {
            r[i] = a[i];
        }
        trim(r);
        return r;
    }

    function subtractAny(a, b, sign) {
        var value;
        if (compareAbs(a, b) >= 0) {
            value = subtract(a,b);
        } else {
            value = subtract(b, a);
            sign = !sign;
        }
        value = arrayToSmall(value);
        if (typeof value === "number") {
            if (sign) value = -value;
            return new SmallInteger(value);
        }
        return new BigInteger(value, sign);
    }

    function subtractSmall(a, b, sign) { // assumes a is array, b is number with 0 <= b < MAX_INT
        var l = a.length,
            r = new Array(l),
            carry = -b,
            base = BASE,
            i, difference;
        for (i = 0; i < l; i++) {
            difference = a[i] + carry;
            carry = Math.floor(difference / base);
            difference %= base;
            r[i] = difference < 0 ? difference + base : difference;
        }
        r = arrayToSmall(r);
        if (typeof r === "number") {
            if (sign) r = -r;
            return new SmallInteger(r);
        } return new BigInteger(r, sign);
    }

    BigInteger.prototype.subtract = function (v) {
        var n = parseValue(v);
        if (this.sign !== n.sign) {
            return this.add(n.negate());
        }
        var a = this.value, b = n.value;
        if (n.isSmall)
            return subtractSmall(a, Math.abs(b), this.sign);
        return subtractAny(a, b, this.sign);
    };
    BigInteger.prototype.minus = BigInteger.prototype.subtract;

    SmallInteger.prototype.subtract = function (v) {
        var n = parseValue(v);
        var a = this.value;
        if (a < 0 !== n.sign) {
            return this.add(n.negate());
        }
        var b = n.value;
        if (n.isSmall) {
            return new SmallInteger(a - b);
        }
        return subtractSmall(b, Math.abs(a), a >= 0);
    };
    SmallInteger.prototype.minus = SmallInteger.prototype.subtract;

    BigInteger.prototype.negate = function () {
        return new BigInteger(this.value, !this.sign);
    };
    SmallInteger.prototype.negate = function () {
        var sign = this.sign;
        var small = new SmallInteger(-this.value);
        small.sign = !sign;
        return small;
    };

    BigInteger.prototype.abs = function () {
        return new BigInteger(this.value, false);
    };
    SmallInteger.prototype.abs = function () {
        return new SmallInteger(Math.abs(this.value));
    };

    function multiplyLong(a, b) {
        var a_l = a.length,
            b_l = b.length,
            l = a_l + b_l,
            r = createArray(l),
            base = BASE,
            product, carry, i, a_i, b_j;
        for (i = 0; i < a_l; ++i) {
            a_i = a[i];
            for (var j = 0; j < b_l; ++j) {
                b_j = b[j];
                product = a_i * b_j + r[i + j];
                carry = Math.floor(product / base);
                r[i + j] = product - carry * base;
                r[i + j + 1] += carry;
            }
        }
        trim(r);
        return r;
    }

    function multiplySmall(a, b) { // assumes a is array, b is number with |b| < BASE
        var l = a.length,
            r = new Array(l),
            base = BASE,
            carry = 0,
            product, i;
        for (i = 0; i < l; i++) {
            product = a[i] * b + carry;
            carry = Math.floor(product / base);
            r[i] = product - carry * base;
        }
        while (carry > 0) {
            r[i++] = carry % base;
            carry = Math.floor(carry / base);
        }
        return r;
    }

    function shiftLeft(x, n) {
        var r = [];
        while (n-- > 0) r.push(0);
        return r.concat(x);
    }

    function multiplyKaratsuba(x, y) {
        var n = Math.max(x.length, y.length);

        if (n <= 30) return multiplyLong(x, y);
        n = Math.ceil(n / 2);

        var b = x.slice(n),
            a = x.slice(0, n),
            d = y.slice(n),
            c = y.slice(0, n);

        var ac = multiplyKaratsuba(a, c),
            bd = multiplyKaratsuba(b, d),
            abcd = multiplyKaratsuba(addAny(a, b), addAny(c, d));

        var product = addAny(addAny(ac, shiftLeft(subtract(subtract(abcd, ac), bd), n)), shiftLeft(bd, 2 * n));
        trim(product);
        return product;
    }

    // The following function is derived from a surface fit of a graph plotting the performance difference
    // between long multiplication and karatsuba multiplication versus the lengths of the two arrays.
    function useKaratsuba(l1, l2) {
        return -0.012 * l1 - 0.012 * l2 + 0.000015 * l1 * l2 > 0;
    }

    BigInteger.prototype.multiply = function (v) {
        var n = parseValue(v),
            a = this.value, b = n.value,
            sign = this.sign !== n.sign,
            abs;
        if (n.isSmall) {
            if (b === 0) return Integer[0];
            if (b === 1) return this;
            if (b === -1) return this.negate();
            abs = Math.abs(b);
            if (abs < BASE) {
                return new BigInteger(multiplySmall(a, abs), sign);
            }
            b = smallToArray(abs);
        }
        if (useKaratsuba(a.length, b.length)) // Karatsuba is only faster for certain array sizes
            return new BigInteger(multiplyKaratsuba(a, b), sign);
        return new BigInteger(multiplyLong(a, b), sign);
    };

    BigInteger.prototype.times = BigInteger.prototype.multiply;

    function multiplySmallAndArray(a, b, sign) { // a >= 0
        if (a < BASE) {
            return new BigInteger(multiplySmall(b, a), sign);
        }
        return new BigInteger(multiplyLong(b, smallToArray(a)), sign);
    }
    SmallInteger.prototype._multiplyBySmall = function (a) {
            if (isPrecise(a.value * this.value)) {
                return new SmallInteger(a.value * this.value);
            }
            return multiplySmallAndArray(Math.abs(a.value), smallToArray(Math.abs(this.value)), this.sign !== a.sign);
    };
    BigInteger.prototype._multiplyBySmall = function (a) {
            if (a.value === 0) return Integer[0];
            if (a.value === 1) return this;
            if (a.value === -1) return this.negate();
            return multiplySmallAndArray(Math.abs(a.value), this.value, this.sign !== a.sign);
    };
    SmallInteger.prototype.multiply = function (v) {
        return parseValue(v)._multiplyBySmall(this);
    };
    SmallInteger.prototype.times = SmallInteger.prototype.multiply;

    function square(a) {
        var l = a.length,
            r = createArray(l + l),
            base = BASE,
            product, carry, i, a_i, a_j;
        for (i = 0; i < l; i++) {
            a_i = a[i];
            for (var j = 0; j < l; j++) {
                a_j = a[j];
                product = a_i * a_j + r[i + j];
                carry = Math.floor(product / base);
                r[i + j] = product - carry * base;
                r[i + j + 1] += carry;
            }
        }
        trim(r);
        return r;
    }

    BigInteger.prototype.square = function () {
        return new BigInteger(square(this.value), false);
    };

    SmallInteger.prototype.square = function () {
        var value = this.value * this.value;
        if (isPrecise(value)) return new SmallInteger(value);
        return new BigInteger(square(smallToArray(Math.abs(this.value))), false);
    };

    function divMod1(a, b) { // Left over from previous version. Performs faster than divMod2 on smaller input sizes.
        var a_l = a.length,
            b_l = b.length,
            base = BASE,
            result = createArray(b.length),
            divisorMostSignificantDigit = b[b_l - 1],
            // normalization
            lambda = Math.ceil(base / (2 * divisorMostSignificantDigit)),
            remainder = multiplySmall(a, lambda),
            divisor = multiplySmall(b, lambda),
            quotientDigit, shift, carry, borrow, i, l, q;
        if (remainder.length <= a_l) remainder.push(0);
        divisor.push(0);
        divisorMostSignificantDigit = divisor[b_l - 1];
        for (shift = a_l - b_l; shift >= 0; shift--) {
            quotientDigit = base - 1;
            if (remainder[shift + b_l] !== divisorMostSignificantDigit) {
              quotientDigit = Math.floor((remainder[shift + b_l] * base + remainder[shift + b_l - 1]) / divisorMostSignificantDigit);
            }
            // quotientDigit <= base - 1
            carry = 0;
            borrow = 0;
            l = divisor.length;
            for (i = 0; i < l; i++) {
                carry += quotientDigit * divisor[i];
                q = Math.floor(carry / base);
                borrow += remainder[shift + i] - (carry - q * base);
                carry = q;
                if (borrow < 0) {
                    remainder[shift + i] = borrow + base;
                    borrow = -1;
                } else {
                    remainder[shift + i] = borrow;
                    borrow = 0;
                }
            }
            while (borrow !== 0) {
                quotientDigit -= 1;
                carry = 0;
                for (i = 0; i < l; i++) {
                    carry += remainder[shift + i] - base + divisor[i];
                    if (carry < 0) {
                        remainder[shift + i] = carry + base;
                        carry = 0;
                    } else {
                        remainder[shift + i] = carry;
                        carry = 1;
                    }
                }
                borrow += carry;
            }
            result[shift] = quotientDigit;
        }
        // denormalization
        remainder = divModSmall(remainder, lambda)[0];
        return [arrayToSmall(result), arrayToSmall(remainder)];
    }

    function divMod2(a, b) { // Implementation idea shamelessly stolen from Silent Matt's library http://silentmatt.com/biginteger/
        // Performs faster than divMod1 on larger input sizes.
        var a_l = a.length,
            b_l = b.length,
            result = [],
            part = [],
            base = BASE,
            guess, xlen, highx, highy, check;
        while (a_l) {
            part.unshift(a[--a_l]);
            trim(part);
            if (compareAbs(part, b) < 0) {
                result.push(0);
                continue;
            }
            xlen = part.length;
            highx = part[xlen - 1] * base + part[xlen - 2];
            highy = b[b_l - 1] * base + b[b_l - 2];
            if (xlen > b_l) {
                highx = (highx + 1) * base;
            }
            guess = Math.ceil(highx / highy);
            do {
                check = multiplySmall(b, guess);
                if (compareAbs(check, part) <= 0) break;
                guess--;
            } while (guess);
            result.push(guess);
            part = subtract(part, check);
        }
        result.reverse();
        return [arrayToSmall(result), arrayToSmall(part)];
    }

    function divModSmall(value, lambda) {
        var length = value.length,
            quotient = createArray(length),
            base = BASE,
            i, q, remainder, divisor;
        remainder = 0;
        for (i = length - 1; i >= 0; --i) {
            divisor = remainder * base + value[i];
            q = truncate(divisor / lambda);
            remainder = divisor - q * lambda;
            quotient[i] = q | 0;
        }
        return [quotient, remainder | 0];
    }

    function divModAny(self, v) {
        var value, n = parseValue(v);
        var a = self.value, b = n.value;
        var quotient;
        if (b === 0) throw new Error("Cannot divide by zero");
        if (self.isSmall) {
            if (n.isSmall) {
                return [new SmallInteger(truncate(a / b)), new SmallInteger(a % b)];
            }
            return [Integer[0], self];
        }
        if (n.isSmall) {
            if (b === 1) return [self, Integer[0]];
            if (b == -1) return [self.negate(), Integer[0]];
            var abs = Math.abs(b);
            if (abs < BASE) {
                value = divModSmall(a, abs);
                quotient = arrayToSmall(value[0]);
                var remainder = value[1];
                if (self.sign) remainder = -remainder;
                if (typeof quotient === "number") {
                    if (self.sign !== n.sign) quotient = -quotient;
                    return [new SmallInteger(quotient), new SmallInteger(remainder)];
                }
                return [new BigInteger(quotient, self.sign !== n.sign), new SmallInteger(remainder)];
            }
            b = smallToArray(abs);
        }
        var comparison = compareAbs(a, b);
        if (comparison === -1) return [Integer[0], self];
        if (comparison === 0) return [Integer[self.sign === n.sign ? 1 : -1], Integer[0]];

        // divMod1 is faster on smaller input sizes
        if (a.length + b.length <= 200)
            value = divMod1(a, b);
        else value = divMod2(a, b);

        quotient = value[0];
        var qSign = self.sign !== n.sign,
            mod = value[1],
            mSign = self.sign;
        if (typeof quotient === "number") {
            if (qSign) quotient = -quotient;
            quotient = new SmallInteger(quotient);
        } else quotient = new BigInteger(quotient, qSign);
        if (typeof mod === "number") {
            if (mSign) mod = -mod;
            mod = new SmallInteger(mod);
        } else mod = new BigInteger(mod, mSign);
        return [quotient, mod];
    }

    BigInteger.prototype.divmod = function (v) {
        var result = divModAny(this, v);
        return {
            quotient: result[0],
            remainder: result[1]
        };
    };
    SmallInteger.prototype.divmod = BigInteger.prototype.divmod;

    BigInteger.prototype.divide = function (v) {
        return divModAny(this, v)[0];
    };
    SmallInteger.prototype.over = SmallInteger.prototype.divide = BigInteger.prototype.over = BigInteger.prototype.divide;

    BigInteger.prototype.mod = function (v) {
        return divModAny(this, v)[1];
    };
    SmallInteger.prototype.remainder = SmallInteger.prototype.mod = BigInteger.prototype.remainder = BigInteger.prototype.mod;

    BigInteger.prototype.pow = function (v) {
        var n = parseValue(v),
            a = this.value,
            b = n.value,
            value, x, y;
        if (b === 0) return Integer[1];
        if (a === 0) return Integer[0];
        if (a === 1) return Integer[1];
        if (a === -1) return n.isEven() ? Integer[1] : Integer[-1];
        if (n.sign) {
            return Integer[0];
        }
        if (!n.isSmall) throw new Error("The exponent " + n.toString() + " is too large.");
        if (this.isSmall) {
            if (isPrecise(value = Math.pow(a, b)))
                return new SmallInteger(truncate(value));
        }
        x = this;
        y = Integer[1];
        while (true) {
            if (b & 1 === 1) {
                y = y.times(x);
                --b;
            }
            if (b === 0) break;
            b /= 2;
            x = x.square();
        }
        return y;
    };
    SmallInteger.prototype.pow = BigInteger.prototype.pow;

    BigInteger.prototype.modPow = function (exp, mod) {
        exp = parseValue(exp);
        mod = parseValue(mod);
        if (mod.isZero()) throw new Error("Cannot take modPow with modulus 0");
        var r = Integer[1],
            base = this.mod(mod);
        while (exp.isPositive()) {
            if (base.isZero()) return Integer[0];
            if (exp.isOdd()) r = r.multiply(base).mod(mod);
            exp = exp.divide(2);
            base = base.square().mod(mod);
        }
        return r;
    };
    SmallInteger.prototype.modPow = BigInteger.prototype.modPow;

    function compareAbs(a, b) {
        if (a.length !== b.length) {
            return a.length > b.length ? 1 : -1;
        }
        for (var i = a.length - 1; i >= 0; i--) {
            if (a[i] !== b[i]) return a[i] > b[i] ? 1 : -1;
        }
        return 0;
    }

    BigInteger.prototype.compareAbs = function (v) {
        var n = parseValue(v),
            a = this.value,
            b = n.value;
        if (n.isSmall) return 1;
        return compareAbs(a, b);
    };
    SmallInteger.prototype.compareAbs = function (v) {
        var n = parseValue(v),
            a = Math.abs(this.value),
            b = n.value;
        if (n.isSmall) {
            b = Math.abs(b);
            return a === b ? 0 : a > b ? 1 : -1;
        }
        return -1;
    };

    BigInteger.prototype.compare = function (v) {
        // See discussion about comparison with Infinity:
        // https://github.com/peterolson/BigInteger.js/issues/61
        if (v === Infinity) {
            return -1;
        }
        if (v === -Infinity) {
            return 1;
        }

        var n = parseValue(v),
            a = this.value,
            b = n.value;
        if (this.sign !== n.sign) {
            return n.sign ? 1 : -1;
        }
        if (n.isSmall) {
            return this.sign ? -1 : 1;
        }
        return compareAbs(a, b) * (this.sign ? -1 : 1);
    };
    BigInteger.prototype.compareTo = BigInteger.prototype.compare;

    SmallInteger.prototype.compare = function (v) {
        if (v === Infinity) {
            return -1;
        }
        if (v === -Infinity) {
            return 1;
        }

        var n = parseValue(v),
            a = this.value,
            b = n.value;
        if (n.isSmall) {
            return a == b ? 0 : a > b ? 1 : -1;
        }
        if (a < 0 !== n.sign) {
            return a < 0 ? -1 : 1;
        }
        return a < 0 ? 1 : -1;
    };
    SmallInteger.prototype.compareTo = SmallInteger.prototype.compare;

    BigInteger.prototype.equals = function (v) {
        return this.compare(v) === 0;
    };
    SmallInteger.prototype.eq = SmallInteger.prototype.equals = BigInteger.prototype.eq = BigInteger.prototype.equals;

    BigInteger.prototype.notEquals = function (v) {
        return this.compare(v) !== 0;
    };
    SmallInteger.prototype.neq = SmallInteger.prototype.notEquals = BigInteger.prototype.neq = BigInteger.prototype.notEquals;

    BigInteger.prototype.greater = function (v) {
        return this.compare(v) > 0;
    };
    SmallInteger.prototype.gt = SmallInteger.prototype.greater = BigInteger.prototype.gt = BigInteger.prototype.greater;

    BigInteger.prototype.lesser = function (v) {
        return this.compare(v) < 0;
    };
    SmallInteger.prototype.lt = SmallInteger.prototype.lesser = BigInteger.prototype.lt = BigInteger.prototype.lesser;

    BigInteger.prototype.greaterOrEquals = function (v) {
        return this.compare(v) >= 0;
    };
    SmallInteger.prototype.geq = SmallInteger.prototype.greaterOrEquals = BigInteger.prototype.geq = BigInteger.prototype.greaterOrEquals;

    BigInteger.prototype.lesserOrEquals = function (v) {
        return this.compare(v) <= 0;
    };
    SmallInteger.prototype.leq = SmallInteger.prototype.lesserOrEquals = BigInteger.prototype.leq = BigInteger.prototype.lesserOrEquals;

    BigInteger.prototype.isEven = function () {
        return (this.value[0] & 1) === 0;
    };
    SmallInteger.prototype.isEven = function () {
        return (this.value & 1) === 0;
    };

    BigInteger.prototype.isOdd = function () {
        return (this.value[0] & 1) === 1;
    };
    SmallInteger.prototype.isOdd = function () {
        return (this.value & 1) === 1;
    };

    BigInteger.prototype.isPositive = function () {
        return !this.sign;
    };
    SmallInteger.prototype.isPositive = function () {
        return this.value > 0;
    };

    BigInteger.prototype.isNegative = function () {
        return this.sign;
    };
    SmallInteger.prototype.isNegative = function () {
        return this.value < 0;
    };

    BigInteger.prototype.isUnit = function () {
        return false;
    };
    SmallInteger.prototype.isUnit = function () {
        return Math.abs(this.value) === 1;
    };

    BigInteger.prototype.isZero = function () {
        return false;
    };
    SmallInteger.prototype.isZero = function () {
        return this.value === 0;
    };
    BigInteger.prototype.isDivisibleBy = function (v) {
        var n = parseValue(v);
        var value = n.value;
        if (value === 0) return false;
        if (value === 1) return true;
        if (value === 2) return this.isEven();
        return this.mod(n).equals(Integer[0]);
    };
    SmallInteger.prototype.isDivisibleBy = BigInteger.prototype.isDivisibleBy;

    function isBasicPrime(v) {
        var n = v.abs();
        if (n.isUnit()) return false;
        if (n.equals(2) || n.equals(3) || n.equals(5)) return true;
        if (n.isEven() || n.isDivisibleBy(3) || n.isDivisibleBy(5)) return false;
        if (n.lesser(25)) return true;
        // we don't know if it's prime: let the other functions figure it out
    }

    BigInteger.prototype.isPrime = function () {
        var isPrime = isBasicPrime(this);
        if (isPrime !== undefined) return isPrime;
        var n = this.abs(),
            nPrev = n.prev();
        var a = [2, 3, 5, 7, 11, 13, 17, 19],
            b = nPrev,
            d, t, i, x;
        while (b.isEven()) b = b.divide(2);
        for (i = 0; i < a.length; i++) {
            x = bigInt(a[i]).modPow(b, n);
            if (x.equals(Integer[1]) || x.equals(nPrev)) continue;
            for (t = true, d = b; t && d.lesser(nPrev) ; d = d.multiply(2)) {
                x = x.square().mod(n);
                if (x.equals(nPrev)) t = false;
            }
            if (t) return false;
        }
        return true;
    };
    SmallInteger.prototype.isPrime = BigInteger.prototype.isPrime;

    BigInteger.prototype.isProbablePrime = function (iterations) {
        var isPrime = isBasicPrime(this);
        if (isPrime !== undefined) return isPrime;
        var n = this.abs();
        var t = iterations === undefined ? 5 : iterations;
        // use the Fermat primality test
        for (var i = 0; i < t; i++) {
            var a = bigInt.randBetween(2, n.minus(2));
            if (!a.modPow(n.prev(), n).isUnit()) return false; // definitely composite
        }
        return true; // large chance of being prime
    };
    SmallInteger.prototype.isProbablePrime = BigInteger.prototype.isProbablePrime;

    BigInteger.prototype.modInv = function (n) {
        var t = bigInt.zero, newT = bigInt.one, r = parseValue(n), newR = this.abs(), q, lastT, lastR;
        while (!newR.equals(bigInt.zero)) {
            q = r.divide(newR);
            lastT = t;
            lastR = r;
            t = newT;
            r = newR;
            newT = lastT.subtract(q.multiply(newT));
            newR = lastR.subtract(q.multiply(newR));
        }
        if (!r.equals(1)) throw new Error(this.toString() + " and " + n.toString() + " are not co-prime");
        if (t.compare(0) === -1) {
            t = t.add(n);
        }
        if (this.isNegative()) {
            return t.negate();
        }
        return t;
    };

    SmallInteger.prototype.modInv = BigInteger.prototype.modInv;

    BigInteger.prototype.next = function () {
        var value = this.value;
        if (this.sign) {
            return subtractSmall(value, 1, this.sign);
        }
        return new BigInteger(addSmall(value, 1), this.sign);
    };
    SmallInteger.prototype.next = function () {
        var value = this.value;
        if (value + 1 < MAX_INT) return new SmallInteger(value + 1);
        return new BigInteger(MAX_INT_ARR, false);
    };

    BigInteger.prototype.prev = function () {
        var value = this.value;
        if (this.sign) {
            return new BigInteger(addSmall(value, 1), true);
        }
        return subtractSmall(value, 1, this.sign);
    };
    SmallInteger.prototype.prev = function () {
        var value = this.value;
        if (value - 1 > -MAX_INT) return new SmallInteger(value - 1);
        return new BigInteger(MAX_INT_ARR, true);
    };

    var powersOfTwo = [1];
    while (2 * powersOfTwo[powersOfTwo.length - 1] <= BASE) powersOfTwo.push(2 * powersOfTwo[powersOfTwo.length - 1]);
    var powers2Length = powersOfTwo.length, highestPower2 = powersOfTwo[powers2Length - 1];

    function shift_isSmall(n) {
        return ((typeof n === "number" || typeof n === "string") && +Math.abs(n) <= BASE) ||
            (n instanceof BigInteger && n.value.length <= 1);
    }

    BigInteger.prototype.shiftLeft = function (n) {
        if (!shift_isSmall(n)) {
            throw new Error(String(n) + " is too large for shifting.");
        }
        n = +n;
        if (n < 0) return this.shiftRight(-n);
        var result = this;
        while (n >= powers2Length) {
            result = result.multiply(highestPower2);
            n -= powers2Length - 1;
        }
        return result.multiply(powersOfTwo[n]);
    };
    SmallInteger.prototype.shiftLeft = BigInteger.prototype.shiftLeft;

    BigInteger.prototype.shiftRight = function (n) {
        var remQuo;
        if (!shift_isSmall(n)) {
            throw new Error(String(n) + " is too large for shifting.");
        }
        n = +n;
        if (n < 0) return this.shiftLeft(-n);
        var result = this;
        while (n >= powers2Length) {
            if (result.isZero()) return result;
            remQuo = divModAny(result, highestPower2);
            result = remQuo[1].isNegative() ? remQuo[0].prev() : remQuo[0];
            n -= powers2Length - 1;
        }
        remQuo = divModAny(result, powersOfTwo[n]);
        return remQuo[1].isNegative() ? remQuo[0].prev() : remQuo[0];
    };
    SmallInteger.prototype.shiftRight = BigInteger.prototype.shiftRight;

    function bitwise(x, y, fn) {
        y = parseValue(y);
        var xSign = x.isNegative(), ySign = y.isNegative();
        var xRem = xSign ? x.not() : x,
            yRem = ySign ? y.not() : y;
        var xDigit = 0, yDigit = 0;
        var xDivMod = null, yDivMod = null;
        var result = [];
        while (!xRem.isZero() || !yRem.isZero()) {
            xDivMod = divModAny(xRem, highestPower2);
            xDigit = xDivMod[1].toJSNumber();
            if (xSign) {
                xDigit = highestPower2 - 1 - xDigit; // two's complement for negative numbers
            }

            yDivMod = divModAny(yRem, highestPower2);
            yDigit = yDivMod[1].toJSNumber();
            if (ySign) {
                yDigit = highestPower2 - 1 - yDigit; // two's complement for negative numbers
            }

            xRem = xDivMod[0];
            yRem = yDivMod[0];
            result.push(fn(xDigit, yDigit));
        }
        var sum = fn(xSign ? 1 : 0, ySign ? 1 : 0) !== 0 ? bigInt(-1) : bigInt(0);
        for (var i = result.length - 1; i >= 0; i -= 1) {
            sum = sum.multiply(highestPower2).add(bigInt(result[i]));
        }
        return sum;
    }

    BigInteger.prototype.not = function () {
        return this.negate().prev();
    };
    SmallInteger.prototype.not = BigInteger.prototype.not;

    BigInteger.prototype.and = function (n) {
        return bitwise(this, n, function (a, b) { return a & b; });
    };
    SmallInteger.prototype.and = BigInteger.prototype.and;

    BigInteger.prototype.or = function (n) {
        return bitwise(this, n, function (a, b) { return a | b; });
    };
    SmallInteger.prototype.or = BigInteger.prototype.or;

    BigInteger.prototype.xor = function (n) {
        return bitwise(this, n, function (a, b) { return a ^ b; });
    };
    SmallInteger.prototype.xor = BigInteger.prototype.xor;

    var LOBMASK_I = 1 << 30, LOBMASK_BI = (BASE & -BASE) * (BASE & -BASE) | LOBMASK_I;
    function roughLOB(n) { // get lowestOneBit (rough)
        // SmallInteger: return Min(lowestOneBit(n), 1 << 30)
        // BigInteger: return Min(lowestOneBit(n), 1 << 14) [BASE=1e7]
        var v = n.value, x = typeof v === "number" ? v | LOBMASK_I : v[0] + v[1] * BASE | LOBMASK_BI;
        return x & -x;
    }

    function max(a, b) {
        a = parseValue(a);
        b = parseValue(b);
        return a.greater(b) ? a : b;
    }
    function min(a, b) {
        a = parseValue(a);
        b = parseValue(b);
        return a.lesser(b) ? a : b;
    }
    function gcd(a, b) {
        a = parseValue(a).abs();
        b = parseValue(b).abs();
        if (a.equals(b)) return a;
        if (a.isZero()) return b;
        if (b.isZero()) return a;
        var c = Integer[1], d, t;
        while (a.isEven() && b.isEven()) {
            d = Math.min(roughLOB(a), roughLOB(b));
            a = a.divide(d);
            b = b.divide(d);
            c = c.multiply(d);
        }
        while (a.isEven()) {
            a = a.divide(roughLOB(a));
        }
        do {
            while (b.isEven()) {
                b = b.divide(roughLOB(b));
            }
            if (a.greater(b)) {
                t = b; b = a; a = t;
            }
            b = b.subtract(a);
        } while (!b.isZero());
        return c.isUnit() ? a : a.multiply(c);
    }
    function lcm(a, b) {
        a = parseValue(a).abs();
        b = parseValue(b).abs();
        return a.divide(gcd(a, b)).multiply(b);
    }
    function randBetween(a, b) {
        a = parseValue(a);
        b = parseValue(b);
        var low = min(a, b), high = max(a, b);
        var range = high.subtract(low).add(1);
        if (range.isSmall) return low.add(Math.floor(Math.random() * range));
        var length = range.value.length - 1;
        var result = [], restricted = true;
        for (var i = length; i >= 0; i--) {
            var top = restricted ? range.value[i] : BASE;
            var digit = truncate(Math.random() * top);
            result.unshift(digit);
            if (digit < top) restricted = false;
        }
        result = arrayToSmall(result);
        return low.add(typeof result === "number" ? new SmallInteger(result) : new BigInteger(result, false));
    }
    var parseBase = function (text, base) {
        var length = text.length;
		var i;
		var absBase = Math.abs(base);
		for(var i = 0; i < length; i++) {
			var c = text[i].toLowerCase();
			if(c === "-") continue;
			if(/[a-z0-9]/.test(c)) {
			    if(/[0-9]/.test(c) && +c >= absBase) {
					if(c === "1" && absBase === 1) continue;
                    throw new Error(c + " is not a valid digit in base " + base + ".");
				} else if(c.charCodeAt(0) - 87 >= absBase) {
					throw new Error(c + " is not a valid digit in base " + base + ".");
				}
			}
		}
        if (2 <= base && base <= 36) {
            if (length <= LOG_MAX_INT / Math.log(base)) {
				var result = parseInt(text, base);
				if(isNaN(result)) {
					throw new Error(c + " is not a valid digit in base " + base + ".");
				}
                return new SmallInteger(parseInt(text, base));
            }
        }
        base = parseValue(base);
        var digits = [];
        var isNegative = text[0] === "-";
        for (i = isNegative ? 1 : 0; i < text.length; i++) {
            var c = text[i].toLowerCase(),
                charCode = c.charCodeAt(0);
            if (48 <= charCode && charCode <= 57) digits.push(parseValue(c));
            else if (97 <= charCode && charCode <= 122) digits.push(parseValue(c.charCodeAt(0) - 87));
            else if (c === "<") {
                var start = i;
                do { i++; } while (text[i] !== ">");
                digits.push(parseValue(text.slice(start + 1, i)));
            }
            else throw new Error(c + " is not a valid character");
        }
        return parseBaseFromArray(digits, base, isNegative);
    };

    function parseBaseFromArray(digits, base, isNegative) {
        var val = Integer[0], pow = Integer[1], i;
        for (i = digits.length - 1; i >= 0; i--) {
            val = val.add(digits[i].times(pow));
            pow = pow.times(base);
        }
        return isNegative ? val.negate() : val;
    }

    function stringify(digit) {
        if (digit <= 35) {
            return "0123456789abcdefghijklmnopqrstuvwxyz".charAt(digit);
        }
        return "<" + digit + ">";
    }

    function toBase(n, base) {
        base = bigInt(base);
        if (base.isZero()) {
            if (n.isZero()) return {value: [0], isNegative: false};
            throw new Error("Cannot convert nonzero numbers to base 0.");
        }
        if (base.equals(-1)) {
            if (n.isZero()) return {value: [0], isNegative: false};
            if (n.isNegative())
              return {
                value: [].concat.apply([], Array.apply(null, Array(-n))
                            .map(Array.prototype.valueOf, [1, 0])
                          ),
                isNegative: false
              };

            var arr = Array.apply(null, Array(+n - 1))
              .map(Array.prototype.valueOf, [0, 1]);
            arr.unshift([1]);
            return {
              value: [].concat.apply([], arr),
              isNegative: false
            };
        }

        var neg = false;
        if (n.isNegative() && base.isPositive()) {
            neg = true;
            n = n.abs();
        }
        if (base.equals(1)) {
            if (n.isZero()) return {value: [0], isNegative: false};
            
            return {
              value: Array.apply(null, Array(+n))
                       .map(Number.prototype.valueOf, 1),
              isNegative: neg
            };
        }
        var out = [];
        var left = n, divmod;
        while (left.isNegative() || left.compareAbs(base) >= 0) {
            divmod = left.divmod(base);
            left = divmod.quotient;
            var digit = divmod.remainder;
            if (digit.isNegative()) {
                digit = base.minus(digit).abs();
                left = left.next();
            }
            out.push(digit.toJSNumber());
        }
        out.push(left.toJSNumber());
        return {value: out.reverse(), isNegative: neg};
    }

    function toBaseString(n, base) {
        var arr = toBase(n, base);
        return (arr.isNegative ? "-" : "") + arr.value.map(stringify).join('');
    }

    BigInteger.prototype.toArray = function (radix) {
      return toBase(this, radix);
    };

    SmallInteger.prototype.toArray = function (radix) {
      return toBase(this, radix);
    };

    BigInteger.prototype.toString = function (radix) {
        if (radix === undefined) radix = 10;
        if (radix !== 10) return toBaseString(this, radix);
        var v = this.value, l = v.length, str = String(v[--l]), zeros = "0000000", digit;
        while (--l >= 0) {
            digit = String(v[l]);
            str += zeros.slice(digit.length) + digit;
        }
        var sign = this.sign ? "-" : "";
        return sign + str;
    };

    SmallInteger.prototype.toString = function (radix) {
        if (radix === undefined) radix = 10;
        if (radix != 10) return toBaseString(this, radix);
        return String(this.value);
    };
    BigInteger.prototype.toJSON = SmallInteger.prototype.toJSON = function() { return this.toString(); }

    BigInteger.prototype.valueOf = function () {
        return parseInt(this.toString(), 10);
    };
    BigInteger.prototype.toJSNumber = BigInteger.prototype.valueOf;

    SmallInteger.prototype.valueOf = function () {
        return this.value;
    };
    SmallInteger.prototype.toJSNumber = SmallInteger.prototype.valueOf;

    function parseStringValue(v) {
            if (isPrecise(+v)) {
                var x = +v;
                if (x === truncate(x))
                    return new SmallInteger(x);
                throw "Invalid integer: " + v;
            }
            var sign = v[0] === "-";
            if (sign) v = v.slice(1);
            var split = v.split(/e/i);
            if (split.length > 2) throw new Error("Invalid integer: " + split.join("e"));
            if (split.length === 2) {
                var exp = split[1];
                if (exp[0] === "+") exp = exp.slice(1);
                exp = +exp;
                if (exp !== truncate(exp) || !isPrecise(exp)) throw new Error("Invalid integer: " + exp + " is not a valid exponent.");
                var text = split[0];
                var decimalPlace = text.indexOf(".");
                if (decimalPlace >= 0) {
                    exp -= text.length - decimalPlace - 1;
                    text = text.slice(0, decimalPlace) + text.slice(decimalPlace + 1);
                }
                if (exp < 0) throw new Error("Cannot include negative exponent part for integers");
                text += (new Array(exp + 1)).join("0");
                v = text;
            }
            var isValid = /^([0-9][0-9]*)$/.test(v);
            if (!isValid) throw new Error("Invalid integer: " + v);
            var r = [], max = v.length, l = LOG_BASE, min = max - l;
            while (max > 0) {
                r.push(+v.slice(min, max));
                min -= l;
                if (min < 0) min = 0;
                max -= l;
            }
            trim(r);
            return new BigInteger(r, sign);
    }

    function parseNumberValue(v) {
        if (isPrecise(v)) {
            if (v !== truncate(v)) throw new Error(v + " is not an integer.");
            return new SmallInteger(v);
        }
        return parseStringValue(v.toString());
    }

    function parseValue(v) {
        if (typeof v === "number") {
            return parseNumberValue(v);
        }
        if (typeof v === "string") {
            return parseStringValue(v);
        }
        return v;
    }
    // Pre-define numbers in range [-999,999]
    for (var i = 0; i < 1000; i++) {
        Integer[i] = new SmallInteger(i);
        if (i > 0) Integer[-i] = new SmallInteger(-i);
    }
    // Backwards compatibility
    Integer.one = Integer[1];
    Integer.zero = Integer[0];
    Integer.minusOne = Integer[-1];
    Integer.max = max;
    Integer.min = min;
    Integer.gcd = gcd;
    Integer.lcm = lcm;
    Integer.isInstance = function (x) { return x instanceof BigInteger || x instanceof SmallInteger; };
    Integer.randBetween = randBetween;

    Integer.fromArray = function (digits, base, isNegative) {
        return parseBaseFromArray(digits.map(parseValue), parseValue(base || 10), isNegative);
    };

    return Integer;
})();

// Node.js check
if (typeof module !== "undefined" && module.hasOwnProperty("exports")) {
    module.exports = bigInt;
}

//amd check
if ( typeof define === "function" && define.amd ) {
  define( "big-integer", [], function() {
    return bigInt;
  });
}

},{}],3:[function(require,module,exports){
(function (process){
// Generated by purs bundle 0.12.0
var PS = {};
(function(exports) {
    "use strict";

  exports.arrayApply = function (fs) {
    return function (xs) {
      var l = fs.length;
      var k = xs.length;
      var result = new Array(l*k);
      var n = 0;
      for (var i = 0; i < l; i++) {
        var f = fs[i];
        for (var j = 0; j < k; j++) {
          result[n++] = f(xs[j]);
        }
      }
      return result;
    };
  };
})(PS["Control.Apply"] = PS["Control.Apply"] || {});
(function(exports) {
  // Generated by purs version 0.12.0
  "use strict";
  var Semigroupoid = function (compose) {
      this.compose = compose;
  };
  var semigroupoidFn = new Semigroupoid(function (f) {
      return function (g) {
          return function (x) {
              return f(g(x));
          };
      };
  });
  var compose = function (dict) {
      return dict.compose;
  };
  var composeFlipped = function (dictSemigroupoid) {
      return function (f) {
          return function (g) {
              return compose(dictSemigroupoid)(g)(f);
          };
      };
  };
  exports["compose"] = compose;
  exports["Semigroupoid"] = Semigroupoid;
  exports["composeFlipped"] = composeFlipped;
  exports["semigroupoidFn"] = semigroupoidFn;
})(PS["Control.Semigroupoid"] = PS["Control.Semigroupoid"] || {});
(function(exports) {
  // Generated by purs version 0.12.0
  "use strict";
  var Control_Semigroupoid = PS["Control.Semigroupoid"];                 
  var Category = function (Semigroupoid0, identity) {
      this.Semigroupoid0 = Semigroupoid0;
      this.identity = identity;
  };
  var identity = function (dict) {
      return dict.identity;
  };
  var categoryFn = new Category(function () {
      return Control_Semigroupoid.semigroupoidFn;
  }, function (x) {
      return x;
  });
  exports["Category"] = Category;
  exports["identity"] = identity;
  exports["categoryFn"] = categoryFn;
})(PS["Control.Category"] = PS["Control.Category"] || {});
(function(exports) {
  // Generated by purs version 0.12.0
  "use strict";
  var otherwise = true;
  exports["otherwise"] = otherwise;
})(PS["Data.Boolean"] = PS["Data.Boolean"] || {});
(function(exports) {
    "use strict";

  exports.refEq = function (r1) {
    return function (r2) {
      return r1 === r2;
    };
  };
})(PS["Data.Eq"] = PS["Data.Eq"] || {});
(function(exports) {
    "use strict";

  exports.boolConj = function (b1) {
    return function (b2) {
      return b1 && b2;
    };
  };

  exports.boolDisj = function (b1) {
    return function (b2) {
      return b1 || b2;
    };
  };

  exports.boolNot = function (b) {
    return !b;
  };
})(PS["Data.HeytingAlgebra"] = PS["Data.HeytingAlgebra"] || {});
(function(exports) {
  // Generated by purs version 0.12.0
  "use strict";
  var $foreign = PS["Data.Symbol"];      
  var SProxy = (function () {
      function SProxy() {

      };
      SProxy.value = new SProxy();
      return SProxy;
  })();
  var IsSymbol = function (reflectSymbol) {
      this.reflectSymbol = reflectSymbol;
  };
  var reflectSymbol = function (dict) {
      return dict.reflectSymbol;
  };
  exports["IsSymbol"] = IsSymbol;
  exports["reflectSymbol"] = reflectSymbol;
  exports["SProxy"] = SProxy;
})(PS["Data.Symbol"] = PS["Data.Symbol"] || {});
(function(exports) {
    "use strict";

  exports.unit = {};
})(PS["Data.Unit"] = PS["Data.Unit"] || {});
(function(exports) {
    "use strict";

  exports.showIntImpl = function (n) {
    return n.toString();
  };

  exports.showNumberImpl = function (n) {
    var str = n.toString();
    return isNaN(str + ".0") ? str : str + ".0";
  };

  exports.showStringImpl = function (s) {
    var l = s.length;
    return "\"" + s.replace(
      /[\0-\x1F\x7F"\\]/g, // eslint-disable-line no-control-regex
      function (c, i) {
        switch (c) {
          case "\"":
          case "\\":
            return "\\" + c;
          case "\x07": return "\\a";
          case "\b": return "\\b";
          case "\f": return "\\f";
          case "\n": return "\\n";
          case "\r": return "\\r";
          case "\t": return "\\t";
          case "\v": return "\\v";
        }
        var k = i + 1;
        var empty = k < l && s[k] >= "0" && s[k] <= "9" ? "\\&" : "";
        return "\\" + c.charCodeAt(0).toString(10) + empty;
      }
    ) + "\"";
  };
})(PS["Data.Show"] = PS["Data.Show"] || {});
(function(exports) {
    "use strict";

  exports.unsafeHas = function (label) {
    return function (rec) {
      return {}.hasOwnProperty.call(rec, label);
    };
  };

  exports.unsafeGet = function (label) {
    return function (rec) {
      return rec[label];
    };
  };

  exports.unsafeSet = function (label) {
    return function (value) {
      return function (rec) {
        var copy = {};
        for (var key in rec) {
          if ({}.hasOwnProperty.call(rec, key)) {
            copy[key] = rec[key];
          }
        }
        copy[label] = value;
        return copy;
      };
    };
  };
})(PS["Record.Unsafe"] = PS["Record.Unsafe"] || {});
(function(exports) {
  // Generated by purs version 0.12.0
  "use strict";
  var $foreign = PS["Record.Unsafe"];
  exports["unsafeHas"] = $foreign.unsafeHas;
  exports["unsafeGet"] = $foreign.unsafeGet;
  exports["unsafeSet"] = $foreign.unsafeSet;
})(PS["Record.Unsafe"] = PS["Record.Unsafe"] || {});
(function(exports) {
  // Generated by purs version 0.12.0
  "use strict";
  var RLProxy = (function () {
      function RLProxy() {

      };
      RLProxy.value = new RLProxy();
      return RLProxy;
  })();
  exports["RLProxy"] = RLProxy;
})(PS["Type.Data.RowList"] = PS["Type.Data.RowList"] || {});
(function(exports) {
  // Generated by purs version 0.12.0
  "use strict";
  var $foreign = PS["Data.Show"];
  var Data_Symbol = PS["Data.Symbol"];
  var Record_Unsafe = PS["Record.Unsafe"];
  var Type_Data_RowList = PS["Type.Data.RowList"];                 
  var Show = function (show) {
      this.show = show;
  };
  var showString = new Show($foreign.showStringImpl);
  var showNumber = new Show($foreign.showNumberImpl);
  var showInt = new Show($foreign.showIntImpl);
  var show = function (dict) {
      return dict.show;
  };
  exports["Show"] = Show;
  exports["show"] = show;
  exports["showInt"] = showInt;
  exports["showNumber"] = showNumber;
  exports["showString"] = showString;
})(PS["Data.Show"] = PS["Data.Show"] || {});
(function(exports) {
  // Generated by purs version 0.12.0
  "use strict";
  var $foreign = PS["Data.Unit"];
  var Data_Show = PS["Data.Show"];
  exports["unit"] = $foreign.unit;
})(PS["Data.Unit"] = PS["Data.Unit"] || {});
(function(exports) {
  // Generated by purs version 0.12.0
  "use strict";
  var $foreign = PS["Data.HeytingAlgebra"];
  var Data_Symbol = PS["Data.Symbol"];
  var Data_Unit = PS["Data.Unit"];
  var Record_Unsafe = PS["Record.Unsafe"];
  var Type_Data_Row = PS["Type.Data.Row"];
  var Type_Data_RowList = PS["Type.Data.RowList"];                 
  var HeytingAlgebra = function (conj, disj, ff, implies, not, tt) {
      this.conj = conj;
      this.disj = disj;
      this.ff = ff;
      this.implies = implies;
      this.not = not;
      this.tt = tt;
  };
  var tt = function (dict) {
      return dict.tt;
  };
  var not = function (dict) {
      return dict.not;
  };
  var implies = function (dict) {
      return dict.implies;
  };
  var ff = function (dict) {
      return dict.ff;
  };
  var disj = function (dict) {
      return dict.disj;
  };
  var heytingAlgebraBoolean = new HeytingAlgebra($foreign.boolConj, $foreign.boolDisj, false, function (a) {
      return function (b) {
          return disj(heytingAlgebraBoolean)(not(heytingAlgebraBoolean)(a))(b);
      };
  }, $foreign.boolNot, true);
  var conj = function (dict) {
      return dict.conj;
  };
  exports["HeytingAlgebra"] = HeytingAlgebra;
  exports["tt"] = tt;
  exports["ff"] = ff;
  exports["implies"] = implies;
  exports["conj"] = conj;
  exports["disj"] = disj;
  exports["not"] = not;
  exports["heytingAlgebraBoolean"] = heytingAlgebraBoolean;
})(PS["Data.HeytingAlgebra"] = PS["Data.HeytingAlgebra"] || {});
(function(exports) {
  // Generated by purs version 0.12.0
  "use strict";
  var $foreign = PS["Data.Eq"];
  var Data_HeytingAlgebra = PS["Data.HeytingAlgebra"];
  var Data_Symbol = PS["Data.Symbol"];
  var Data_Unit = PS["Data.Unit"];
  var Data_Void = PS["Data.Void"];
  var Record_Unsafe = PS["Record.Unsafe"];
  var Type_Data_RowList = PS["Type.Data.RowList"];                 
  var Eq = function (eq) {
      this.eq = eq;
  };
  var EqRecord = function (eqRecord) {
      this.eqRecord = eqRecord;
  }; 
  var eqString = new Eq($foreign.refEq);
  var eqRowNil = new EqRecord(function (v) {
      return function (v1) {
          return function (v2) {
              return true;
          };
      };
  });
  var eqRecord = function (dict) {
      return dict.eqRecord;
  };
  var eqRec = function (dictRowToList) {
      return function (dictEqRecord) {
          return new Eq(eqRecord(dictEqRecord)(Type_Data_RowList.RLProxy.value));
      };
  };
  var eqNumber = new Eq($foreign.refEq);
  var eqInt = new Eq($foreign.refEq);
  var eqChar = new Eq($foreign.refEq);
  var eqBoolean = new Eq($foreign.refEq);
  var eq = function (dict) {
      return dict.eq;
  }; 
  var eqRowCons = function (dictEqRecord) {
      return function (dictCons) {
          return function (dictIsSymbol) {
              return function (dictEq) {
                  return new EqRecord(function (v) {
                      return function (ra) {
                          return function (rb) {
                              var tail = eqRecord(dictEqRecord)(Type_Data_RowList.RLProxy.value)(ra)(rb);
                              var key = Data_Symbol.reflectSymbol(dictIsSymbol)(Data_Symbol.SProxy.value);
                              var get = Record_Unsafe.unsafeGet(key);
                              return eq(dictEq)(get(ra))(get(rb)) && tail;
                          };
                      };
                  });
              };
          };
      };
  };
  var notEq = function (dictEq) {
      return function (x) {
          return function (y) {
              return eq(eqBoolean)(eq(dictEq)(x)(y))(false);
          };
      };
  };
  exports["Eq"] = Eq;
  exports["eq"] = eq;
  exports["notEq"] = notEq;
  exports["EqRecord"] = EqRecord;
  exports["eqRecord"] = eqRecord;
  exports["eqBoolean"] = eqBoolean;
  exports["eqInt"] = eqInt;
  exports["eqNumber"] = eqNumber;
  exports["eqChar"] = eqChar;
  exports["eqString"] = eqString;
  exports["eqRec"] = eqRec;
  exports["eqRowNil"] = eqRowNil;
  exports["eqRowCons"] = eqRowCons;
})(PS["Data.Eq"] = PS["Data.Eq"] || {});
(function(exports) {
    "use strict";

  exports.unsafeCompareImpl = function (lt) {
    return function (eq) {
      return function (gt) {
        return function (x) {
          return function (y) {
            return x < y ? lt : x === y ? eq : gt;
          };
        };
      };
    };
  };
})(PS["Data.Ord.Unsafe"] = PS["Data.Ord.Unsafe"] || {});
(function(exports) {
    "use strict";

  exports.concatString = function (s1) {
    return function (s2) {
      return s1 + s2;
    };
  };

  exports.concatArray = function (xs) {
    return function (ys) {
      if (xs.length === 0) return ys;
      if (ys.length === 0) return xs;
      return xs.concat(ys);
    };
  };
})(PS["Data.Semigroup"] = PS["Data.Semigroup"] || {});
(function(exports) {
  // Generated by purs version 0.12.0
  "use strict";
  var $foreign = PS["Data.Semigroup"];
  var Data_Symbol = PS["Data.Symbol"];
  var Data_Unit = PS["Data.Unit"];
  var Data_Void = PS["Data.Void"];
  var Record_Unsafe = PS["Record.Unsafe"];
  var Type_Data_RowList = PS["Type.Data.RowList"];                 
  var Semigroup = function (append) {
      this.append = append;
  }; 
  var semigroupString = new Semigroup($foreign.concatString);
  var semigroupArray = new Semigroup($foreign.concatArray);
  var append = function (dict) {
      return dict.append;
  };
  var semigroupFn = function (dictSemigroup) {
      return new Semigroup(function (f) {
          return function (g) {
              return function (x) {
                  return append(dictSemigroup)(f(x))(g(x));
              };
          };
      });
  };
  exports["Semigroup"] = Semigroup;
  exports["append"] = append;
  exports["semigroupString"] = semigroupString;
  exports["semigroupFn"] = semigroupFn;
  exports["semigroupArray"] = semigroupArray;
})(PS["Data.Semigroup"] = PS["Data.Semigroup"] || {});
(function(exports) {
  // Generated by purs version 0.12.0
  "use strict";
  var Data_Eq = PS["Data.Eq"];
  var Data_Semigroup = PS["Data.Semigroup"];
  var Data_Show = PS["Data.Show"];                 
  var LT = (function () {
      function LT() {

      };
      LT.value = new LT();
      return LT;
  })();
  var GT = (function () {
      function GT() {

      };
      GT.value = new GT();
      return GT;
  })();
  var EQ = (function () {
      function EQ() {

      };
      EQ.value = new EQ();
      return EQ;
  })();
  var eqOrdering = new Data_Eq.Eq(function (v) {
      return function (v1) {
          if (v instanceof LT && v1 instanceof LT) {
              return true;
          };
          if (v instanceof GT && v1 instanceof GT) {
              return true;
          };
          if (v instanceof EQ && v1 instanceof EQ) {
              return true;
          };
          return false;
      };
  });
  exports["LT"] = LT;
  exports["GT"] = GT;
  exports["EQ"] = EQ;
  exports["eqOrdering"] = eqOrdering;
})(PS["Data.Ordering"] = PS["Data.Ordering"] || {});
(function(exports) {
  // Generated by purs version 0.12.0
  "use strict";
  var $foreign = PS["Data.Ord.Unsafe"];
  var Data_Ordering = PS["Data.Ordering"];                 
  var unsafeCompare = $foreign.unsafeCompareImpl(Data_Ordering.LT.value)(Data_Ordering.EQ.value)(Data_Ordering.GT.value);
  exports["unsafeCompare"] = unsafeCompare;
})(PS["Data.Ord.Unsafe"] = PS["Data.Ord.Unsafe"] || {});
(function(exports) {
    "use strict";

  exports.intSub = function (x) {
    return function (y) {
      /* jshint bitwise: false */
      return x - y | 0;
    };
  };

  exports.numSub = function (n1) {
    return function (n2) {
      return n1 - n2;
    };
  };
})(PS["Data.Ring"] = PS["Data.Ring"] || {});
(function(exports) {
    "use strict";

  exports.intAdd = function (x) {
    return function (y) {
      /* jshint bitwise: false */
      return x + y | 0;
    };
  };

  exports.intMul = function (x) {
    return function (y) {
      /* jshint bitwise: false */
      return x * y | 0;
    };
  };

  exports.numAdd = function (n1) {
    return function (n2) {
      return n1 + n2;
    };
  };

  exports.numMul = function (n1) {
    return function (n2) {
      return n1 * n2;
    };
  };
})(PS["Data.Semiring"] = PS["Data.Semiring"] || {});
(function(exports) {
  // Generated by purs version 0.12.0
  "use strict";
  var $foreign = PS["Data.Semiring"];
  var Data_Symbol = PS["Data.Symbol"];
  var Data_Unit = PS["Data.Unit"];
  var Record_Unsafe = PS["Record.Unsafe"];
  var Type_Data_Row = PS["Type.Data.Row"];
  var Type_Data_RowList = PS["Type.Data.RowList"];                 
  var Semiring = function (add, mul, one, zero) {
      this.add = add;
      this.mul = mul;
      this.one = one;
      this.zero = zero;
  };
  var zero = function (dict) {
      return dict.zero;
  }; 
  var semiringNumber = new Semiring($foreign.numAdd, $foreign.numMul, 1.0, 0.0);
  var semiringInt = new Semiring($foreign.intAdd, $foreign.intMul, 1, 0);
  var one = function (dict) {
      return dict.one;
  };
  var mul = function (dict) {
      return dict.mul;
  };
  var add = function (dict) {
      return dict.add;
  };
  exports["Semiring"] = Semiring;
  exports["add"] = add;
  exports["zero"] = zero;
  exports["mul"] = mul;
  exports["one"] = one;
  exports["semiringInt"] = semiringInt;
  exports["semiringNumber"] = semiringNumber;
})(PS["Data.Semiring"] = PS["Data.Semiring"] || {});
(function(exports) {
  // Generated by purs version 0.12.0
  "use strict";
  var $foreign = PS["Data.Ring"];
  var Data_Semiring = PS["Data.Semiring"];
  var Data_Symbol = PS["Data.Symbol"];
  var Data_Unit = PS["Data.Unit"];
  var Record_Unsafe = PS["Record.Unsafe"];
  var Type_Data_RowList = PS["Type.Data.RowList"];                 
  var Ring = function (Semiring0, sub) {
      this.Semiring0 = Semiring0;
      this.sub = sub;
  };
  var sub = function (dict) {
      return dict.sub;
  };
  var ringNumber = new Ring(function () {
      return Data_Semiring.semiringNumber;
  }, $foreign.numSub);
  var ringInt = new Ring(function () {
      return Data_Semiring.semiringInt;
  }, $foreign.intSub);
  exports["Ring"] = Ring;
  exports["sub"] = sub;
  exports["ringInt"] = ringInt;
  exports["ringNumber"] = ringNumber;
})(PS["Data.Ring"] = PS["Data.Ring"] || {});
(function(exports) {
  // Generated by purs version 0.12.0
  "use strict";
  var $foreign = PS["Data.Ord"];
  var Data_Eq = PS["Data.Eq"];
  var Data_Ord_Unsafe = PS["Data.Ord.Unsafe"];
  var Data_Ordering = PS["Data.Ordering"];
  var Data_Ring = PS["Data.Ring"];
  var Data_Semiring = PS["Data.Semiring"];
  var Data_Unit = PS["Data.Unit"];
  var Data_Void = PS["Data.Void"];                 
  var Ord = function (Eq0, compare) {
      this.Eq0 = Eq0;
      this.compare = compare;
  }; 
  var ordString = new Ord(function () {
      return Data_Eq.eqString;
  }, Data_Ord_Unsafe.unsafeCompare);
  var ordNumber = new Ord(function () {
      return Data_Eq.eqNumber;
  }, Data_Ord_Unsafe.unsafeCompare);
  var ordInt = new Ord(function () {
      return Data_Eq.eqInt;
  }, Data_Ord_Unsafe.unsafeCompare);
  var ordChar = new Ord(function () {
      return Data_Eq.eqChar;
  }, Data_Ord_Unsafe.unsafeCompare);
  var compare = function (dict) {
      return dict.compare;
  };
  var comparing = function (dictOrd) {
      return function (f) {
          return function (x) {
              return function (y) {
                  return compare(dictOrd)(f(x))(f(y));
              };
          };
      };
  };
  var greaterThan = function (dictOrd) {
      return function (a1) {
          return function (a2) {
              var v = compare(dictOrd)(a1)(a2);
              if (v instanceof Data_Ordering.GT) {
                  return true;
              };
              return false;
          };
      };
  };
  var greaterThanOrEq = function (dictOrd) {
      return function (a1) {
          return function (a2) {
              var v = compare(dictOrd)(a1)(a2);
              if (v instanceof Data_Ordering.LT) {
                  return false;
              };
              return true;
          };
      };
  };
  var lessThan = function (dictOrd) {
      return function (a1) {
          return function (a2) {
              var v = compare(dictOrd)(a1)(a2);
              if (v instanceof Data_Ordering.LT) {
                  return true;
              };
              return false;
          };
      };
  };
  var max = function (dictOrd) {
      return function (x) {
          return function (y) {
              var v = compare(dictOrd)(x)(y);
              if (v instanceof Data_Ordering.LT) {
                  return y;
              };
              if (v instanceof Data_Ordering.EQ) {
                  return x;
              };
              if (v instanceof Data_Ordering.GT) {
                  return x;
              };
              throw new Error("Failed pattern match at Data.Ord line 122, column 3 - line 125, column 12: " + [ v.constructor.name ]);
          };
      };
  };
  var min = function (dictOrd) {
      return function (x) {
          return function (y) {
              var v = compare(dictOrd)(x)(y);
              if (v instanceof Data_Ordering.LT) {
                  return x;
              };
              if (v instanceof Data_Ordering.EQ) {
                  return x;
              };
              if (v instanceof Data_Ordering.GT) {
                  return y;
              };
              throw new Error("Failed pattern match at Data.Ord line 113, column 3 - line 116, column 12: " + [ v.constructor.name ]);
          };
      };
  }; 
  var clamp = function (dictOrd) {
      return function (low) {
          return function (hi) {
              return function (x) {
                  return min(dictOrd)(hi)(max(dictOrd)(low)(x));
              };
          };
      };
  };
  exports["Ord"] = Ord;
  exports["compare"] = compare;
  exports["lessThan"] = lessThan;
  exports["greaterThan"] = greaterThan;
  exports["greaterThanOrEq"] = greaterThanOrEq;
  exports["comparing"] = comparing;
  exports["min"] = min;
  exports["max"] = max;
  exports["clamp"] = clamp;
  exports["ordInt"] = ordInt;
  exports["ordNumber"] = ordNumber;
  exports["ordString"] = ordString;
  exports["ordChar"] = ordChar;
})(PS["Data.Ord"] = PS["Data.Ord"] || {});
(function(exports) {
  // Generated by purs version 0.12.0
  "use strict";
  var Control_Category = PS["Control.Category"];
  var Data_Boolean = PS["Data.Boolean"];
  var Data_Ord = PS["Data.Ord"];
  var Data_Ring = PS["Data.Ring"];                 
  var on = function (f) {
      return function (g) {
          return function (x) {
              return function (y) {
                  return f(g(x))(g(y));
              };
          };
      };
  };
  var flip = function (f) {
      return function (b) {
          return function (a) {
              return f(a)(b);
          };
      };
  };
  var $$const = function (a) {
      return function (v) {
          return a;
      };
  };
  exports["flip"] = flip;
  exports["const"] = $$const;
  exports["on"] = on;
})(PS["Data.Function"] = PS["Data.Function"] || {});
(function(exports) {
    "use strict";

  exports.arrayMap = function (f) {
    return function (arr) {
      var l = arr.length;
      var result = new Array(l);
      for (var i = 0; i < l; i++) {
        result[i] = f(arr[i]);
      }
      return result;
    };
  };
})(PS["Data.Functor"] = PS["Data.Functor"] || {});
(function(exports) {
  // Generated by purs version 0.12.0
  "use strict";
  var $foreign = PS["Data.Functor"];
  var Control_Semigroupoid = PS["Control.Semigroupoid"];
  var Data_Function = PS["Data.Function"];
  var Data_Unit = PS["Data.Unit"];                 
  var Functor = function (map) {
      this.map = map;
  };
  var map = function (dict) {
      return dict.map;
  };
  var $$void = function (dictFunctor) {
      return map(dictFunctor)(Data_Function["const"](Data_Unit.unit));
  };
  var functorFn = new Functor(Control_Semigroupoid.compose(Control_Semigroupoid.semigroupoidFn));
  var functorArray = new Functor($foreign.arrayMap);
  exports["Functor"] = Functor;
  exports["map"] = map;
  exports["void"] = $$void;
  exports["functorFn"] = functorFn;
  exports["functorArray"] = functorArray;
})(PS["Data.Functor"] = PS["Data.Functor"] || {});
(function(exports) {
  // Generated by purs version 0.12.0
  "use strict";
  var $foreign = PS["Control.Apply"];
  var Control_Category = PS["Control.Category"];
  var Data_Function = PS["Data.Function"];
  var Data_Functor = PS["Data.Functor"];                 
  var Apply = function (Functor0, apply) {
      this.Functor0 = Functor0;
      this.apply = apply;
  }; 
  var applyArray = new Apply(function () {
      return Data_Functor.functorArray;
  }, $foreign.arrayApply);
  var apply = function (dict) {
      return dict.apply;
  };
  var applySecond = function (dictApply) {
      return function (a) {
          return function (b) {
              return apply(dictApply)(Data_Functor.map(dictApply.Functor0())(Data_Function["const"](Control_Category.identity(Control_Category.categoryFn)))(a))(b);
          };
      };
  };
  var lift2 = function (dictApply) {
      return function (f) {
          return function (a) {
              return function (b) {
                  return apply(dictApply)(Data_Functor.map(dictApply.Functor0())(f)(a))(b);
              };
          };
      };
  };
  exports["Apply"] = Apply;
  exports["apply"] = apply;
  exports["applySecond"] = applySecond;
  exports["lift2"] = lift2;
  exports["applyArray"] = applyArray;
})(PS["Control.Apply"] = PS["Control.Apply"] || {});
(function(exports) {
  // Generated by purs version 0.12.0
  "use strict";
  var Control_Apply = PS["Control.Apply"];
  var Data_Functor = PS["Data.Functor"];
  var Data_Unit = PS["Data.Unit"];                 
  var Applicative = function (Apply0, pure) {
      this.Apply0 = Apply0;
      this.pure = pure;
  };
  var pure = function (dict) {
      return dict.pure;
  };
  var when = function (dictApplicative) {
      return function (v) {
          return function (v1) {
              if (v) {
                  return v1;
              };
              if (!v) {
                  return pure(dictApplicative)(Data_Unit.unit);
              };
              throw new Error("Failed pattern match at Control.Applicative line 57, column 1 - line 57, column 63: " + [ v.constructor.name, v1.constructor.name ]);
          };
      };
  };
  var liftA1 = function (dictApplicative) {
      return function (f) {
          return function (a) {
              return Control_Apply.apply(dictApplicative.Apply0())(pure(dictApplicative)(f))(a);
          };
      };
  }; 
  var applicativeArray = new Applicative(function () {
      return Control_Apply.applyArray;
  }, function (x) {
      return [ x ];
  });
  exports["Applicative"] = Applicative;
  exports["pure"] = pure;
  exports["liftA1"] = liftA1;
  exports["when"] = when;
  exports["applicativeArray"] = applicativeArray;
})(PS["Control.Applicative"] = PS["Control.Applicative"] || {});
(function(exports) {
    "use strict";

  exports.arrayBind = function (arr) {
    return function (f) {
      var result = [];
      for (var i = 0, l = arr.length; i < l; i++) {
        Array.prototype.push.apply(result, f(arr[i]));
      }
      return result;
    };
  };
})(PS["Control.Bind"] = PS["Control.Bind"] || {});
(function(exports) {
  // Generated by purs version 0.12.0
  "use strict";
  var $foreign = PS["Control.Bind"];
  var Control_Applicative = PS["Control.Applicative"];
  var Control_Apply = PS["Control.Apply"];
  var Control_Category = PS["Control.Category"];
  var Data_Function = PS["Data.Function"];
  var Data_Functor = PS["Data.Functor"];
  var Data_Unit = PS["Data.Unit"];                 
  var Bind = function (Apply0, bind) {
      this.Apply0 = Apply0;
      this.bind = bind;
  };
  var Discard = function (discard) {
      this.discard = discard;
  };
  var discard = function (dict) {
      return dict.discard;
  }; 
  var bindArray = new Bind(function () {
      return Control_Apply.applyArray;
  }, $foreign.arrayBind);
  var bind = function (dict) {
      return dict.bind;
  };
  var bindFlipped = function (dictBind) {
      return Data_Function.flip(bind(dictBind));
  };
  var composeKleisliFlipped = function (dictBind) {
      return function (f) {
          return function (g) {
              return function (a) {
                  return bindFlipped(dictBind)(f)(g(a));
              };
          };
      };
  };
  var discardUnit = new Discard(function (dictBind) {
      return bind(dictBind);
  });
  var join = function (dictBind) {
      return function (m) {
          return bind(dictBind)(m)(Control_Category.identity(Control_Category.categoryFn));
      };
  };
  exports["Bind"] = Bind;
  exports["bind"] = bind;
  exports["bindFlipped"] = bindFlipped;
  exports["Discard"] = Discard;
  exports["discard"] = discard;
  exports["join"] = join;
  exports["composeKleisliFlipped"] = composeKleisliFlipped;
  exports["bindArray"] = bindArray;
  exports["discardUnit"] = discardUnit;
})(PS["Control.Bind"] = PS["Control.Bind"] || {});
(function(exports) {
  // Generated by purs version 0.12.0
  "use strict";
  var Data_Functor = PS["Data.Functor"];
  var Data_Semigroup = PS["Data.Semigroup"];                 
  var Alt = function (Functor0, alt) {
      this.Functor0 = Functor0;
      this.alt = alt;
  };
  var altArray = new Alt(function () {
      return Data_Functor.functorArray;
  }, Data_Semigroup.append(Data_Semigroup.semigroupArray));
  var alt = function (dict) {
      return dict.alt;
  };
  exports["Alt"] = Alt;
  exports["alt"] = alt;
  exports["altArray"] = altArray;
})(PS["Control.Alt"] = PS["Control.Alt"] || {});
(function(exports) {
  // Generated by purs version 0.12.0
  "use strict";
  var Control_Alt = PS["Control.Alt"];
  var Data_Functor = PS["Data.Functor"];                 
  var Plus = function (Alt0, empty) {
      this.Alt0 = Alt0;
      this.empty = empty;
  };
  var plusArray = new Plus(function () {
      return Control_Alt.altArray;
  }, [  ]);
  var empty = function (dict) {
      return dict.empty;
  };
  exports["Plus"] = Plus;
  exports["empty"] = empty;
  exports["plusArray"] = plusArray;
})(PS["Control.Plus"] = PS["Control.Plus"] || {});
(function(exports) {
  // Generated by purs version 0.12.0
  "use strict";
  var Control_Alt = PS["Control.Alt"];
  var Control_Applicative = PS["Control.Applicative"];
  var Control_Apply = PS["Control.Apply"];
  var Control_Plus = PS["Control.Plus"];
  var Data_Functor = PS["Data.Functor"];                 
  var Alternative = function (Applicative0, Plus1) {
      this.Applicative0 = Applicative0;
      this.Plus1 = Plus1;
  };
  var alternativeArray = new Alternative(function () {
      return Control_Applicative.applicativeArray;
  }, function () {
      return Control_Plus.plusArray;
  });
  exports["Alternative"] = Alternative;
  exports["alternativeArray"] = alternativeArray;
})(PS["Control.Alternative"] = PS["Control.Alternative"] || {});
(function(exports) {
    "use strict";

  //------------------------------------------------------------------------------
  // Array creation --------------------------------------------------------------
  //------------------------------------------------------------------------------

  exports.range = function (start) {
    return function (end) {
      var step = start > end ? -1 : 1;
      var result = new Array(step * (end - start) + 1);
      var i = start, n = 0;
      while (i !== end) {
        result[n++] = i;
        i += step;
      }
      result[n] = i;
      return result;
    };
  };                                                                                             

  exports.fromFoldableImpl = (function () {
    function Cons(head, tail) {
      this.head = head;
      this.tail = tail;
    }
    var emptyList = {};

    function curryCons(head) {
      return function (tail) {
        return new Cons(head, tail);
      };
    }

    function listToArray(list) {
      var result = [];
      var count = 0;
      var xs = list;
      while (xs !== emptyList) {
        result[count++] = xs.head;
        xs = xs.tail;
      }
      return result;
    }

    return function (foldr) {
      return function (xs) {
        return listToArray(foldr(curryCons)(emptyList)(xs));
      };
    };
  })();

  //------------------------------------------------------------------------------
  // Array size ------------------------------------------------------------------
  //------------------------------------------------------------------------------

  exports.length = function (xs) {
    return xs.length;
  };

  //------------------------------------------------------------------------------
  // Extending arrays ------------------------------------------------------------
  //------------------------------------------------------------------------------

  exports.cons = function (e) {
    return function (l) {
      return [e].concat(l);
    };
  };

  exports.snoc = function (l) {
    return function (e) {
      var l1 = l.slice();
      l1.push(e);
      return l1;
    };
  };

  //------------------------------------------------------------------------------
  // Non-indexed reads -----------------------------------------------------------
  //------------------------------------------------------------------------------

  exports["uncons'"] = function (empty) {
    return function (next) {
      return function (xs) {
        return xs.length === 0 ? empty({}) : next(xs[0])(xs.slice(1));
      };
    };
  };

  //------------------------------------------------------------------------------
  // Indexed operations ----------------------------------------------------------
  //------------------------------------------------------------------------------

  exports.indexImpl = function (just) {
    return function (nothing) {
      return function (xs) {
        return function (i) {
          return i < 0 || i >= xs.length ? nothing :  just(xs[i]);
        };
      };
    };
  };

  exports.concat = function (xss) {
    if (xss.length <= 10000) {
      // This method is faster, but it crashes on big arrays.
      // So we use it when can and fallback to simple variant otherwise.
      return Array.prototype.concat.apply([], xss);
    }

    var result = [];
    for (var i = 0, l = xss.length; i < l; i++) {
      var xs = xss[i];
      for (var j = 0, m = xs.length; j < m; j++) {
        result.push(xs[j]);
      }
    }
    return result;
  };

  exports.filter = function (f) {
    return function (xs) {
      return xs.filter(f);
    };
  };

  exports.partition = function (f) {
    return function (xs) {
      var yes = [];
      var no  = [];
      for (var i = 0; i < xs.length; i++) {
        var x = xs[i];
        if (f(x))
          yes.push(x);
        else
          no.push(x);
      }
      return { yes: yes, no: no };
    };
  };

  //------------------------------------------------------------------------------
  // Sorting ---------------------------------------------------------------------
  //------------------------------------------------------------------------------

  exports.sortImpl = function (f) {
    return function (l) {
      return l.slice().sort(function (x, y) {
        return f(x)(y);
      });
    };
  };

  //------------------------------------------------------------------------------
  // Subarrays -------------------------------------------------------------------
  //------------------------------------------------------------------------------

  exports.slice = function (s) {
    return function (e) {
      return function (l) {
        return l.slice(s, e);
      };
    };
  };

  exports.take = function (n) {
    return function (l) {
      return n < 1 ? [] : l.slice(0, n);
    };
  };

  //------------------------------------------------------------------------------
  // Zipping ---------------------------------------------------------------------
  //------------------------------------------------------------------------------

  exports.zipWith = function (f) {
    return function (xs) {
      return function (ys) {
        var l = xs.length < ys.length ? xs.length : ys.length;
        var result = new Array(l);
        for (var i = 0; i < l; i++) {
          result[i] = f(xs[i])(ys[i]);
        }
        return result;
      };
    };
  };
})(PS["Data.Array"] = PS["Data.Array"] || {});
(function(exports) {
    "use strict";

  exports.map_ = function (f) {
    return function (a) {
      return function () {
        return f(a());
      };
    };
  };

  exports.pure_ = function (a) {
    return function () {
      return a;
    };
  };

  exports.bind_ = function (a) {
    return function (f) {
      return function () {
        return f(a())();
      };
    };
  };

  exports.run = function (f) {
    return f();
  };

  exports["while"] = function (f) {
    return function (a) {
      return function () {
        while (f()) {
          a();
        }
      };
    };
  };

  exports.foreach = function (as) {
    return function (f) {
      return function () {
        for (var i = 0, l = as.length; i < l; i++) {
          f(as[i])();
        }
      };
    };
  };

  exports.new = function (val) {
    return function () {
      return { value: val };
    };
  };

  exports.read = function (ref) {
    return function () {
      return ref.value;
    };
  };

  exports["modify'"] = function (f) {
    return function (ref) {
      return function () {
        var t = f(ref.value);
        ref.value = t.state;
        return t.value;
      };
    };
  };

  exports.write = function (a) {
    return function (ref) {
      return function () {
        return ref.value = a; // eslint-disable-line no-return-assign
      };
    };
  };
})(PS["Control.Monad.ST.Internal"] = PS["Control.Monad.ST.Internal"] || {});
(function(exports) {
  // Generated by purs version 0.12.0
  "use strict";
  var Control_Applicative = PS["Control.Applicative"];
  var Control_Apply = PS["Control.Apply"];
  var Control_Bind = PS["Control.Bind"];
  var Data_Functor = PS["Data.Functor"];
  var Data_Unit = PS["Data.Unit"];                 
  var Monad = function (Applicative0, Bind1) {
      this.Applicative0 = Applicative0;
      this.Bind1 = Bind1;
  };
  var ap = function (dictMonad) {
      return function (f) {
          return function (a) {
              return Control_Bind.bind(dictMonad.Bind1())(f)(function (v) {
                  return Control_Bind.bind(dictMonad.Bind1())(a)(function (v1) {
                      return Control_Applicative.pure(dictMonad.Applicative0())(v(v1));
                  });
              });
          };
      };
  };
  exports["Monad"] = Monad;
  exports["ap"] = ap;
})(PS["Control.Monad"] = PS["Control.Monad"] || {});
(function(exports) {
    "use strict";

  // module Partial.Unsafe

  exports.unsafePartial = function (f) {
    return f();
  };
})(PS["Partial.Unsafe"] = PS["Partial.Unsafe"] || {});
(function(exports) {
    "use strict";

  // module Partial

  exports.crashWith = function () {
    return function (msg) {
      throw new Error(msg);
    };
  };
})(PS["Partial"] = PS["Partial"] || {});
(function(exports) {
  // Generated by purs version 0.12.0
  "use strict";
  var $foreign = PS["Partial"];
  exports["crashWith"] = $foreign.crashWith;
})(PS["Partial"] = PS["Partial"] || {});
(function(exports) {
  // Generated by purs version 0.12.0
  "use strict";
  var $foreign = PS["Partial.Unsafe"];
  var Partial = PS["Partial"];
  var unsafeCrashWith = function (msg) {
      return $foreign.unsafePartial(function (dictPartial) {
          return Partial.crashWith(dictPartial)(msg);
      });
  };
  exports["unsafeCrashWith"] = unsafeCrashWith;
})(PS["Partial.Unsafe"] = PS["Partial.Unsafe"] || {});
(function(exports) {
  // Generated by purs version 0.12.0
  "use strict";
  var $foreign = PS["Control.Monad.ST.Internal"];
  var Control_Applicative = PS["Control.Applicative"];
  var Control_Apply = PS["Control.Apply"];
  var Control_Bind = PS["Control.Bind"];
  var Control_Monad = PS["Control.Monad"];
  var Control_Monad_Rec_Class = PS["Control.Monad.Rec.Class"];
  var Data_Functor = PS["Data.Functor"];
  var Data_Unit = PS["Data.Unit"];
  var Partial_Unsafe = PS["Partial.Unsafe"];
  var Prelude = PS["Prelude"];                 
  var modify = function (f) {
      return $foreign["modify'"](function (s) {
          var s$prime = f(s);
          return {
              state: s$prime,
              value: s$prime
          };
      });
  };
  var functorST = new Data_Functor.Functor($foreign.map_);
  var monadST = new Control_Monad.Monad(function () {
      return applicativeST;
  }, function () {
      return bindST;
  });
  var bindST = new Control_Bind.Bind(function () {
      return applyST;
  }, $foreign.bind_);
  var applyST = new Control_Apply.Apply(function () {
      return functorST;
  }, Control_Monad.ap(monadST));
  var applicativeST = new Control_Applicative.Applicative(function () {
      return applyST;
  }, $foreign.pure_);
  exports["modify"] = modify;
  exports["functorST"] = functorST;
  exports["applyST"] = applyST;
  exports["applicativeST"] = applicativeST;
  exports["bindST"] = bindST;
  exports["monadST"] = monadST;
  exports["run"] = $foreign.run;
  exports["while"] = $foreign["while"];
  exports["foreach"] = $foreign.foreach;
  exports["new"] = $foreign["new"];
  exports["read"] = $foreign.read;
  exports["write"] = $foreign.write;
})(PS["Control.Monad.ST.Internal"] = PS["Control.Monad.ST.Internal"] || {});
(function(exports) {
    "use strict";

  exports.empty = function () {
    return [];
  };

  exports.pushAll = function (as) {
    return function (xs) {
      return function () {
        return xs.push.apply(xs, as);
      };
    };
  };
})(PS["Data.Array.ST"] = PS["Data.Array.ST"] || {});
(function(exports) {
    "use strict";

  exports.topInt = 2147483647;
  exports.bottomInt = -2147483648;

  exports.topChar = String.fromCharCode(65535);
  exports.bottomChar = String.fromCharCode(0);
})(PS["Data.Bounded"] = PS["Data.Bounded"] || {});
(function(exports) {
  // Generated by purs version 0.12.0
  "use strict";
  var $foreign = PS["Data.Bounded"];
  var Data_Ord = PS["Data.Ord"];
  var Data_Ordering = PS["Data.Ordering"];
  var Data_Unit = PS["Data.Unit"];                 
  var Bounded = function (Ord0, bottom, top) {
      this.Ord0 = Ord0;
      this.bottom = bottom;
      this.top = top;
  };
  var top = function (dict) {
      return dict.top;
  };                                            
  var boundedInt = new Bounded(function () {
      return Data_Ord.ordInt;
  }, $foreign.bottomInt, $foreign.topInt);
  var boundedChar = new Bounded(function () {
      return Data_Ord.ordChar;
  }, $foreign.bottomChar, $foreign.topChar);
  var bottom = function (dict) {
      return dict.bottom;
  };
  exports["Bounded"] = Bounded;
  exports["bottom"] = bottom;
  exports["top"] = top;
  exports["boundedInt"] = boundedInt;
  exports["boundedChar"] = boundedChar;
})(PS["Data.Bounded"] = PS["Data.Bounded"] || {});
(function(exports) {
    "use strict";

  exports.intDegree = function (x) {
    return Math.min(Math.abs(x), 2147483647);
  };

  // See the Euclidean definition in
  // https://en.m.wikipedia.org/wiki/Modulo_operation.
  exports.intDiv = function (x) {
    return function (y) {
      if (y === 0) return 0;
      return y > 0 ? Math.floor(x / y) : -Math.floor(x / -y);
    };
  };

  exports.intMod = function (x) {
    return function (y) {
      if (y === 0) return 0;
      var yy = Math.abs(y);
      return ((x % yy) + yy) % yy;
    };
  };

  exports.numDiv = function (n1) {
    return function (n2) {
      return n1 / n2;
    };
  };
})(PS["Data.EuclideanRing"] = PS["Data.EuclideanRing"] || {});
(function(exports) {
  // Generated by purs version 0.12.0
  "use strict";
  var Data_Ring = PS["Data.Ring"];
  var Data_Semiring = PS["Data.Semiring"];
  var Data_Symbol = PS["Data.Symbol"];
  var Data_Unit = PS["Data.Unit"];                 
  var CommutativeRing = function (Ring0) {
      this.Ring0 = Ring0;
  };
  var commutativeRingNumber = new CommutativeRing(function () {
      return Data_Ring.ringNumber;
  });
  var commutativeRingInt = new CommutativeRing(function () {
      return Data_Ring.ringInt;
  });
  exports["CommutativeRing"] = CommutativeRing;
  exports["commutativeRingInt"] = commutativeRingInt;
  exports["commutativeRingNumber"] = commutativeRingNumber;
})(PS["Data.CommutativeRing"] = PS["Data.CommutativeRing"] || {});
(function(exports) {
  // Generated by purs version 0.12.0
  "use strict";
  var $foreign = PS["Data.EuclideanRing"];
  var Data_BooleanAlgebra = PS["Data.BooleanAlgebra"];
  var Data_CommutativeRing = PS["Data.CommutativeRing"];
  var Data_Eq = PS["Data.Eq"];
  var Data_HeytingAlgebra = PS["Data.HeytingAlgebra"];
  var Data_Ring = PS["Data.Ring"];
  var Data_Semiring = PS["Data.Semiring"];                 
  var EuclideanRing = function (CommutativeRing0, degree, div, mod) {
      this.CommutativeRing0 = CommutativeRing0;
      this.degree = degree;
      this.div = div;
      this.mod = mod;
  };
  var mod = function (dict) {
      return dict.mod;
  };
  var euclideanRingNumber = new EuclideanRing(function () {
      return Data_CommutativeRing.commutativeRingNumber;
  }, function (v) {
      return 1;
  }, $foreign.numDiv, function (v) {
      return function (v1) {
          return 0.0;
      };
  });
  var euclideanRingInt = new EuclideanRing(function () {
      return Data_CommutativeRing.commutativeRingInt;
  }, $foreign.intDegree, $foreign.intDiv, $foreign.intMod);
  var div = function (dict) {
      return dict.div;
  };
  var degree = function (dict) {
      return dict.degree;
  };
  exports["EuclideanRing"] = EuclideanRing;
  exports["degree"] = degree;
  exports["div"] = div;
  exports["mod"] = mod;
  exports["euclideanRingInt"] = euclideanRingInt;
  exports["euclideanRingNumber"] = euclideanRingNumber;
})(PS["Data.EuclideanRing"] = PS["Data.EuclideanRing"] || {});
(function(exports) {
  // Generated by purs version 0.12.0
  "use strict";
  var Data_Boolean = PS["Data.Boolean"];
  var Data_Eq = PS["Data.Eq"];
  var Data_EuclideanRing = PS["Data.EuclideanRing"];
  var Data_Ord = PS["Data.Ord"];
  var Data_Ordering = PS["Data.Ordering"];
  var Data_Semigroup = PS["Data.Semigroup"];
  var Data_Symbol = PS["Data.Symbol"];
  var Data_Unit = PS["Data.Unit"];
  var Record_Unsafe = PS["Record.Unsafe"];
  var Type_Data_RowList = PS["Type.Data.RowList"];                 
  var Monoid = function (Semigroup0, mempty) {
      this.Semigroup0 = Semigroup0;
      this.mempty = mempty;
  };                 
  var monoidString = new Monoid(function () {
      return Data_Semigroup.semigroupString;
  }, "");                    
  var monoidArray = new Monoid(function () {
      return Data_Semigroup.semigroupArray;
  }, [  ]);
  var mempty = function (dict) {
      return dict.mempty;
  };
  var monoidFn = function (dictMonoid) {
      return new Monoid(function () {
          return Data_Semigroup.semigroupFn(dictMonoid.Semigroup0());
      }, function (v) {
          return mempty(dictMonoid);
      });
  };
  exports["Monoid"] = Monoid;
  exports["mempty"] = mempty;
  exports["monoidFn"] = monoidFn;
  exports["monoidString"] = monoidString;
  exports["monoidArray"] = monoidArray;
})(PS["Data.Monoid"] = PS["Data.Monoid"] || {});
(function(exports) {
  // Generated by purs version 0.12.0
  "use strict";
  var Control_Alt = PS["Control.Alt"];
  var Control_Alternative = PS["Control.Alternative"];
  var Control_Applicative = PS["Control.Applicative"];
  var Control_Apply = PS["Control.Apply"];
  var Control_Bind = PS["Control.Bind"];
  var Control_Category = PS["Control.Category"];
  var Control_Extend = PS["Control.Extend"];
  var Control_Monad = PS["Control.Monad"];
  var Control_MonadZero = PS["Control.MonadZero"];
  var Control_Plus = PS["Control.Plus"];
  var Data_Bounded = PS["Data.Bounded"];
  var Data_Eq = PS["Data.Eq"];
  var Data_Function = PS["Data.Function"];
  var Data_Functor = PS["Data.Functor"];
  var Data_Functor_Invariant = PS["Data.Functor.Invariant"];
  var Data_Monoid = PS["Data.Monoid"];
  var Data_Ord = PS["Data.Ord"];
  var Data_Ordering = PS["Data.Ordering"];
  var Data_Semigroup = PS["Data.Semigroup"];
  var Data_Show = PS["Data.Show"];
  var Data_Unit = PS["Data.Unit"];
  var Prelude = PS["Prelude"];                 
  var Nothing = (function () {
      function Nothing() {

      };
      Nothing.value = new Nothing();
      return Nothing;
  })();
  var Just = (function () {
      function Just(value0) {
          this.value0 = value0;
      };
      Just.create = function (value0) {
          return new Just(value0);
      };
      return Just;
  })();
  var semigroupMaybe = function (dictSemigroup) {
      return new Data_Semigroup.Semigroup(function (v) {
          return function (v1) {
              if (v instanceof Nothing) {
                  return v1;
              };
              if (v1 instanceof Nothing) {
                  return v;
              };
              if (v instanceof Just && v1 instanceof Just) {
                  return new Just(Data_Semigroup.append(dictSemigroup)(v.value0)(v1.value0));
              };
              throw new Error("Failed pattern match at Data.Maybe line 175, column 1 - line 175, column 62: " + [ v.constructor.name, v1.constructor.name ]);
          };
      });
  };
  var maybe = function (v) {
      return function (v1) {
          return function (v2) {
              if (v2 instanceof Nothing) {
                  return v;
              };
              if (v2 instanceof Just) {
                  return v1(v2.value0);
              };
              throw new Error("Failed pattern match at Data.Maybe line 218, column 1 - line 218, column 51: " + [ v.constructor.name, v1.constructor.name, v2.constructor.name ]);
          };
      };
  };
  var isNothing = maybe(true)(Data_Function["const"](false));
  var isJust = maybe(false)(Data_Function["const"](true));
  var functorMaybe = new Data_Functor.Functor(function (v) {
      return function (v1) {
          if (v1 instanceof Just) {
              return new Just(v(v1.value0));
          };
          return Nothing.value;
      };
  });
  var fromMaybe = function (a) {
      return maybe(a)(Control_Category.identity(Control_Category.categoryFn));
  };
  var fromJust = function (dictPartial) {
      return function (v) {
          var $__unused = function (dictPartial1) {
              return function ($dollar35) {
                  return $dollar35;
              };
          };
          return $__unused(dictPartial)((function () {
              if (v instanceof Just) {
                  return v.value0;
              };
              throw new Error("Failed pattern match at Data.Maybe line 269, column 1 - line 269, column 46: " + [ v.constructor.name ]);
          })());
      };
  };
  var applyMaybe = new Control_Apply.Apply(function () {
      return functorMaybe;
  }, function (v) {
      return function (v1) {
          if (v instanceof Just) {
              return Data_Functor.map(functorMaybe)(v.value0)(v1);
          };
          if (v instanceof Nothing) {
              return Nothing.value;
          };
          throw new Error("Failed pattern match at Data.Maybe line 67, column 1 - line 67, column 35: " + [ v.constructor.name, v1.constructor.name ]);
      };
  });
  var bindMaybe = new Control_Bind.Bind(function () {
      return applyMaybe;
  }, function (v) {
      return function (v1) {
          if (v instanceof Just) {
              return v1(v.value0);
          };
          if (v instanceof Nothing) {
              return Nothing.value;
          };
          throw new Error("Failed pattern match at Data.Maybe line 126, column 1 - line 126, column 33: " + [ v.constructor.name, v1.constructor.name ]);
      };
  });
  var applicativeMaybe = new Control_Applicative.Applicative(function () {
      return applyMaybe;
  }, Just.create);
  var altMaybe = new Control_Alt.Alt(function () {
      return functorMaybe;
  }, function (v) {
      return function (v1) {
          if (v instanceof Nothing) {
              return v1;
          };
          return v;
      };
  });
  exports["Nothing"] = Nothing;
  exports["Just"] = Just;
  exports["maybe"] = maybe;
  exports["fromMaybe"] = fromMaybe;
  exports["isJust"] = isJust;
  exports["isNothing"] = isNothing;
  exports["fromJust"] = fromJust;
  exports["functorMaybe"] = functorMaybe;
  exports["applyMaybe"] = applyMaybe;
  exports["applicativeMaybe"] = applicativeMaybe;
  exports["altMaybe"] = altMaybe;
  exports["bindMaybe"] = bindMaybe;
  exports["semigroupMaybe"] = semigroupMaybe;
})(PS["Data.Maybe"] = PS["Data.Maybe"] || {});
(function(exports) {
    "use strict";

  // module Unsafe.Coerce

  exports.unsafeCoerce = function (x) {
    return x;
  };
})(PS["Unsafe.Coerce"] = PS["Unsafe.Coerce"] || {});
(function(exports) {
  // Generated by purs version 0.12.0
  "use strict";
  var $foreign = PS["Unsafe.Coerce"];
  exports["unsafeCoerce"] = $foreign.unsafeCoerce;
})(PS["Unsafe.Coerce"] = PS["Unsafe.Coerce"] || {});
(function(exports) {
  // Generated by purs version 0.12.0
  "use strict";
  var $foreign = PS["Data.Array.ST"];
  var Control_Applicative = PS["Control.Applicative"];
  var Control_Bind = PS["Control.Bind"];
  var Control_Monad_ST = PS["Control.Monad.ST"];
  var Control_Monad_ST_Internal = PS["Control.Monad.ST.Internal"];
  var Control_Semigroupoid = PS["Control.Semigroupoid"];
  var Data_Maybe = PS["Data.Maybe"];
  var Data_Ord = PS["Data.Ord"];
  var Data_Ordering = PS["Data.Ordering"];
  var Data_Ring = PS["Data.Ring"];
  var Prelude = PS["Prelude"];
  var Unsafe_Coerce = PS["Unsafe.Coerce"];                 
  var unsafeThaw = function ($11) {
      return Control_Applicative.pure(Control_Monad_ST_Internal.applicativeST)($11);
  };
  var unsafeFreeze = function ($12) {
      return Control_Applicative.pure(Control_Monad_ST_Internal.applicativeST)($12);
  };
  var push = function (a) {
      return $foreign.pushAll([ a ]);
  };
  exports["push"] = push;
  exports["unsafeFreeze"] = unsafeFreeze;
  exports["unsafeThaw"] = unsafeThaw;
  exports["empty"] = $foreign.empty;
})(PS["Data.Array.ST"] = PS["Data.Array.ST"] || {});
(function(exports) {
  // Generated by purs version 0.12.0
  "use strict";
  var Control_Applicative = PS["Control.Applicative"];
  var Control_Bind = PS["Control.Bind"];
  var Control_Monad_ST = PS["Control.Monad.ST"];
  var Control_Monad_ST_Internal = PS["Control.Monad.ST.Internal"];
  var Control_Monad_ST_Ref = PS["Control.Monad.ST.Ref"];
  var Control_Semigroupoid = PS["Control.Semigroupoid"];
  var Data_Array_ST = PS["Data.Array.ST"];
  var Data_Function = PS["Data.Function"];
  var Data_Functor = PS["Data.Functor"];
  var Data_HeytingAlgebra = PS["Data.HeytingAlgebra"];
  var Data_Maybe = PS["Data.Maybe"];
  var Data_Semiring = PS["Data.Semiring"];
  var Prelude = PS["Prelude"];                 
  var Iterator = (function () {
      function Iterator(value0, value1) {
          this.value0 = value0;
          this.value1 = value1;
      };
      Iterator.create = function (value0) {
          return function (value1) {
              return new Iterator(value0, value1);
          };
      };
      return Iterator;
  })();
  var next = function (v) {
      return Control_Bind.bind(Control_Monad_ST_Internal.bindST)(Control_Monad_ST_Internal.read(v.value1))(function (v1) {
          return Control_Bind.bind(Control_Monad_ST_Internal.bindST)(Control_Monad_ST_Internal.modify(function (v2) {
              return v2 + 1 | 0;
          })(v.value1))(function (v2) {
              return Control_Applicative.pure(Control_Monad_ST_Internal.applicativeST)(v.value0(v1));
          });
      });
  };                                                    
  var iterator = function (f) {
      return Data_Functor.map(Control_Monad_ST_Internal.functorST)(Iterator.create(f))(Control_Monad_ST_Internal["new"](0));
  };
  var iterate = function (iter) {
      return function (f) {
          return Control_Bind.bind(Control_Monad_ST_Internal.bindST)(Control_Monad_ST_Internal["new"](false))(function (v) {
              return Control_Monad_ST_Internal["while"](Data_Functor.map(Control_Monad_ST_Internal.functorST)(Data_HeytingAlgebra.not(Data_HeytingAlgebra.heytingAlgebraBoolean))(Control_Monad_ST_Internal.read(v)))(Control_Bind.bind(Control_Monad_ST_Internal.bindST)(next(iter))(function (v1) {
                  if (v1 instanceof Data_Maybe.Just) {
                      return f(v1.value0);
                  };
                  if (v1 instanceof Data_Maybe.Nothing) {
                      return Data_Functor["void"](Control_Monad_ST_Internal.functorST)(Control_Monad_ST_Internal.write(true)(v));
                  };
                  throw new Error("Failed pattern match at Data.Array.ST.Iterator line 42, column 5 - line 44, column 47: " + [ v1.constructor.name ]);
              }));
          });
      };
  };
  exports["iterator"] = iterator;
  exports["iterate"] = iterate;
  exports["next"] = next;
})(PS["Data.Array.ST.Iterator"] = PS["Data.Array.ST.Iterator"] || {});
(function(exports) {
    "use strict";

  exports.foldrArray = function (f) {
    return function (init) {
      return function (xs) {
        var acc = init;
        var len = xs.length;
        for (var i = len - 1; i >= 0; i--) {
          acc = f(xs[i])(acc);
        }
        return acc;
      };
    };
  };

  exports.foldlArray = function (f) {
    return function (init) {
      return function (xs) {
        var acc = init;
        var len = xs.length;
        for (var i = 0; i < len; i++) {
          acc = f(acc)(xs[i]);
        }
        return acc;
      };
    };
  };
})(PS["Data.Foldable"] = PS["Data.Foldable"] || {});
(function(exports) {
  // Generated by purs version 0.12.0
  "use strict";
  var Control_Applicative = PS["Control.Applicative"];
  var Control_Apply = PS["Control.Apply"];
  var Control_Bind = PS["Control.Bind"];
  var Control_Monad = PS["Control.Monad"];
  var Data_Bounded = PS["Data.Bounded"];
  var Data_Eq = PS["Data.Eq"];
  var Data_Functor = PS["Data.Functor"];
  var Data_Monoid = PS["Data.Monoid"];
  var Data_Ord = PS["Data.Ord"];
  var Data_Semigroup = PS["Data.Semigroup"];
  var Data_Semiring = PS["Data.Semiring"];
  var Data_Show = PS["Data.Show"];
  var Prelude = PS["Prelude"];                 
  var Additive = function (x) {
      return x;
  };
  var semigroupAdditive = function (dictSemiring) {
      return new Data_Semigroup.Semigroup(function (v) {
          return function (v1) {
              return Data_Semiring.add(dictSemiring)(v)(v1);
          };
      });
  };
  var monoidAdditive = function (dictSemiring) {
      return new Data_Monoid.Monoid(function () {
          return semigroupAdditive(dictSemiring);
      }, Data_Semiring.zero(dictSemiring));
  };
  exports["Additive"] = Additive;
  exports["semigroupAdditive"] = semigroupAdditive;
  exports["monoidAdditive"] = monoidAdditive;
})(PS["Data.Monoid.Additive"] = PS["Data.Monoid.Additive"] || {});
(function(exports) {
  // Generated by purs version 0.12.0
  "use strict";
  var Control_Applicative = PS["Control.Applicative"];
  var Control_Apply = PS["Control.Apply"];
  var Control_Bind = PS["Control.Bind"];
  var Control_Monad = PS["Control.Monad"];
  var Data_Bounded = PS["Data.Bounded"];
  var Data_Eq = PS["Data.Eq"];
  var Data_Functor = PS["Data.Functor"];
  var Data_HeytingAlgebra = PS["Data.HeytingAlgebra"];
  var Data_Monoid = PS["Data.Monoid"];
  var Data_Ord = PS["Data.Ord"];
  var Data_Semigroup = PS["Data.Semigroup"];
  var Data_Semiring = PS["Data.Semiring"];
  var Data_Show = PS["Data.Show"];
  var Prelude = PS["Prelude"];                 
  var Disj = function (x) {
      return x;
  };
  var semigroupDisj = function (dictHeytingAlgebra) {
      return new Data_Semigroup.Semigroup(function (v) {
          return function (v1) {
              return Data_HeytingAlgebra.disj(dictHeytingAlgebra)(v)(v1);
          };
      });
  };
  var monoidDisj = function (dictHeytingAlgebra) {
      return new Data_Monoid.Monoid(function () {
          return semigroupDisj(dictHeytingAlgebra);
      }, Data_HeytingAlgebra.ff(dictHeytingAlgebra));
  };
  exports["Disj"] = Disj;
  exports["semigroupDisj"] = semigroupDisj;
  exports["monoidDisj"] = monoidDisj;
})(PS["Data.Monoid.Disj"] = PS["Data.Monoid.Disj"] || {});
(function(exports) {
  // Generated by purs version 0.12.0
  "use strict";
  var Control_Semigroupoid = PS["Control.Semigroupoid"];
  var Data_Function = PS["Data.Function"];
  var Data_Functor = PS["Data.Functor"];
  var Data_Monoid_Additive = PS["Data.Monoid.Additive"];
  var Data_Monoid_Conj = PS["Data.Monoid.Conj"];
  var Data_Monoid_Disj = PS["Data.Monoid.Disj"];
  var Data_Monoid_Dual = PS["Data.Monoid.Dual"];
  var Data_Monoid_Endo = PS["Data.Monoid.Endo"];
  var Data_Monoid_Multiplicative = PS["Data.Monoid.Multiplicative"];
  var Data_Semigroup_First = PS["Data.Semigroup.First"];
  var Data_Semigroup_Last = PS["Data.Semigroup.Last"];
  var Prelude = PS["Prelude"];                 
  var Newtype = function (unwrap, wrap) {
      this.unwrap = unwrap;
      this.wrap = wrap;
  };
  var wrap = function (dict) {
      return dict.wrap;
  };
  var unwrap = function (dict) {
      return dict.unwrap;
  };
  var under = function (dictNewtype) {
      return function (dictNewtype1) {
          return function (v) {
              return function (f) {
                  return function ($71) {
                      return unwrap(dictNewtype1)(f(wrap(dictNewtype)($71)));
                  };
              };
          };
      };
  };
  var over = function (dictNewtype) {
      return function (dictNewtype1) {
          return function (v) {
              return function (f) {
                  return function ($78) {
                      return wrap(dictNewtype1)(f(unwrap(dictNewtype)($78)));
                  };
              };
          };
      };
  };                        
  var newtypeDisj = new Newtype(function (v) {
      return v;
  }, Data_Monoid_Disj.Disj);
  var newtypeAdditive = new Newtype(function (v) {
      return v;
  }, Data_Monoid_Additive.Additive);
  var alaF = function (dictFunctor) {
      return function (dictFunctor1) {
          return function (dictNewtype) {
              return function (dictNewtype1) {
                  return function (v) {
                      return function (f) {
                          return function ($80) {
                              return Data_Functor.map(dictFunctor1)(unwrap(dictNewtype1))(f(Data_Functor.map(dictFunctor)(wrap(dictNewtype))($80)));
                          };
                      };
                  };
              };
          };
      };
  };
  exports["unwrap"] = unwrap;
  exports["wrap"] = wrap;
  exports["Newtype"] = Newtype;
  exports["alaF"] = alaF;
  exports["over"] = over;
  exports["under"] = under;
  exports["newtypeAdditive"] = newtypeAdditive;
  exports["newtypeDisj"] = newtypeDisj;
})(PS["Data.Newtype"] = PS["Data.Newtype"] || {});
(function(exports) {
  // Generated by purs version 0.12.0
  "use strict";
  var Control_Alt = PS["Control.Alt"];
  var Control_Alternative = PS["Control.Alternative"];
  var Control_Applicative = PS["Control.Applicative"];
  var Control_Apply = PS["Control.Apply"];
  var Control_Bind = PS["Control.Bind"];
  var Control_Extend = PS["Control.Extend"];
  var Control_Monad = PS["Control.Monad"];
  var Control_MonadZero = PS["Control.MonadZero"];
  var Control_Plus = PS["Control.Plus"];
  var Data_Bounded = PS["Data.Bounded"];
  var Data_Eq = PS["Data.Eq"];
  var Data_Functor = PS["Data.Functor"];
  var Data_Functor_Invariant = PS["Data.Functor.Invariant"];
  var Data_Maybe = PS["Data.Maybe"];
  var Data_Monoid = PS["Data.Monoid"];
  var Data_Newtype = PS["Data.Newtype"];
  var Data_Ord = PS["Data.Ord"];
  var Data_Semigroup = PS["Data.Semigroup"];
  var Data_Show = PS["Data.Show"];
  var Prelude = PS["Prelude"];                 
  var First = function (x) {
      return x;
  };
  var semigroupFirst = new Data_Semigroup.Semigroup(function (v) {
      return function (v1) {
          if (v instanceof Data_Maybe.Just) {
              return v;
          };
          return v1;
      };
  });                                  
  var newtypeFirst = new Data_Newtype.Newtype(function (n) {
      return n;
  }, First);
  var monoidFirst = new Data_Monoid.Monoid(function () {
      return semigroupFirst;
  }, Data_Maybe.Nothing.value);
  exports["First"] = First;
  exports["newtypeFirst"] = newtypeFirst;
  exports["semigroupFirst"] = semigroupFirst;
  exports["monoidFirst"] = monoidFirst;
})(PS["Data.Maybe.First"] = PS["Data.Maybe.First"] || {});
(function(exports) {
  // Generated by purs version 0.12.0
  "use strict";
  var $foreign = PS["Data.Foldable"];
  var Control_Alt = PS["Control.Alt"];
  var Control_Applicative = PS["Control.Applicative"];
  var Control_Apply = PS["Control.Apply"];
  var Control_Bind = PS["Control.Bind"];
  var Control_Category = PS["Control.Category"];
  var Control_Plus = PS["Control.Plus"];
  var Control_Semigroupoid = PS["Control.Semigroupoid"];
  var Data_Eq = PS["Data.Eq"];
  var Data_Function = PS["Data.Function"];
  var Data_Functor = PS["Data.Functor"];
  var Data_HeytingAlgebra = PS["Data.HeytingAlgebra"];
  var Data_Maybe = PS["Data.Maybe"];
  var Data_Maybe_First = PS["Data.Maybe.First"];
  var Data_Maybe_Last = PS["Data.Maybe.Last"];
  var Data_Monoid = PS["Data.Monoid"];
  var Data_Monoid_Additive = PS["Data.Monoid.Additive"];
  var Data_Monoid_Conj = PS["Data.Monoid.Conj"];
  var Data_Monoid_Disj = PS["Data.Monoid.Disj"];
  var Data_Monoid_Dual = PS["Data.Monoid.Dual"];
  var Data_Monoid_Endo = PS["Data.Monoid.Endo"];
  var Data_Monoid_Multiplicative = PS["Data.Monoid.Multiplicative"];
  var Data_Newtype = PS["Data.Newtype"];
  var Data_Ord = PS["Data.Ord"];
  var Data_Ordering = PS["Data.Ordering"];
  var Data_Semigroup = PS["Data.Semigroup"];
  var Data_Semiring = PS["Data.Semiring"];
  var Data_Unit = PS["Data.Unit"];
  var Prelude = PS["Prelude"];                 
  var Foldable = function (foldMap, foldl, foldr) {
      this.foldMap = foldMap;
      this.foldl = foldl;
      this.foldr = foldr;
  };
  var foldr = function (dict) {
      return dict.foldr;
  };
  var traverse_ = function (dictApplicative) {
      return function (dictFoldable) {
          return function (f) {
              return foldr(dictFoldable)(function ($195) {
                  return Control_Apply.applySecond(dictApplicative.Apply0())(f($195));
              })(Control_Applicative.pure(dictApplicative)(Data_Unit.unit));
          };
      };
  };
  var for_ = function (dictApplicative) {
      return function (dictFoldable) {
          return Data_Function.flip(traverse_(dictApplicative)(dictFoldable));
      };
  };
  var sequence_ = function (dictApplicative) {
      return function (dictFoldable) {
          return traverse_(dictApplicative)(dictFoldable)(Control_Category.identity(Control_Category.categoryFn));
      };
  };
  var foldl = function (dict) {
      return dict.foldl;
  };
  var intercalate = function (dictFoldable) {
      return function (dictMonoid) {
          return function (sep) {
              return function (xs) {
                  var go = function (v) {
                      return function (x) {
                          if (v.init) {
                              return {
                                  init: false,
                                  acc: x
                              };
                          };
                          return {
                              init: false,
                              acc: Data_Semigroup.append(dictMonoid.Semigroup0())(v.acc)(Data_Semigroup.append(dictMonoid.Semigroup0())(sep)(x))
                          };
                      };
                  };
                  return (foldl(dictFoldable)(go)({
                      init: true,
                      acc: Data_Monoid.mempty(dictMonoid)
                  })(xs)).acc;
              };
          };
      };
  };
  var length = function (dictFoldable) {
      return function (dictSemiring) {
          return foldl(dictFoldable)(function (c) {
              return function (v) {
                  return Data_Semiring.add(dictSemiring)(Data_Semiring.one(dictSemiring))(c);
              };
          })(Data_Semiring.zero(dictSemiring));
      };
  };
  var minimumBy = function (dictFoldable) {
      return function (cmp) {
          var min$prime = function (v) {
              return function (v1) {
                  if (v instanceof Data_Maybe.Nothing) {
                      return new Data_Maybe.Just(v1);
                  };
                  if (v instanceof Data_Maybe.Just) {
                      return new Data_Maybe.Just((function () {
                          var $120 = Data_Eq.eq(Data_Ordering.eqOrdering)(cmp(v.value0)(v1))(Data_Ordering.LT.value);
                          if ($120) {
                              return v.value0;
                          };
                          return v1;
                      })());
                  };
                  throw new Error("Failed pattern match at Data.Foldable line 389, column 3 - line 389, column 27: " + [ v.constructor.name, v1.constructor.name ]);
              };
          };
          return foldl(dictFoldable)(min$prime)(Data_Maybe.Nothing.value);
      };
  }; 
  var foldableMaybe = new Foldable(function (dictMonoid) {
      return function (f) {
          return function (v) {
              if (v instanceof Data_Maybe.Nothing) {
                  return Data_Monoid.mempty(dictMonoid);
              };
              if (v instanceof Data_Maybe.Just) {
                  return f(v.value0);
              };
              throw new Error("Failed pattern match at Data.Foldable line 129, column 1 - line 129, column 41: " + [ f.constructor.name, v.constructor.name ]);
          };
      };
  }, function (v) {
      return function (z) {
          return function (v1) {
              if (v1 instanceof Data_Maybe.Nothing) {
                  return z;
              };
              if (v1 instanceof Data_Maybe.Just) {
                  return v(z)(v1.value0);
              };
              throw new Error("Failed pattern match at Data.Foldable line 129, column 1 - line 129, column 41: " + [ v.constructor.name, z.constructor.name, v1.constructor.name ]);
          };
      };
  }, function (v) {
      return function (z) {
          return function (v1) {
              if (v1 instanceof Data_Maybe.Nothing) {
                  return z;
              };
              if (v1 instanceof Data_Maybe.Just) {
                  return v(v1.value0)(z);
              };
              throw new Error("Failed pattern match at Data.Foldable line 129, column 1 - line 129, column 41: " + [ v.constructor.name, z.constructor.name, v1.constructor.name ]);
          };
      };
  });
  var foldMapDefaultR = function (dictFoldable) {
      return function (dictMonoid) {
          return function (f) {
              return foldr(dictFoldable)(function (x) {
                  return function (acc) {
                      return Data_Semigroup.append(dictMonoid.Semigroup0())(f(x))(acc);
                  };
              })(Data_Monoid.mempty(dictMonoid));
          };
      };
  };
  var foldableArray = new Foldable(function (dictMonoid) {
      return foldMapDefaultR(foldableArray)(dictMonoid);
  }, $foreign.foldlArray, $foreign.foldrArray);
  var foldMap = function (dict) {
      return dict.foldMap;
  };
  var fold = function (dictFoldable) {
      return function (dictMonoid) {
          return foldMap(dictFoldable)(dictMonoid)(Control_Category.identity(Control_Category.categoryFn));
      };
  };
  var find = function (dictFoldable) {
      return function (p) {
          var go = function (v) {
              return function (v1) {
                  if (v instanceof Data_Maybe.Nothing && p(v1)) {
                      return new Data_Maybe.Just(v1);
                  };
                  return v;
              };
          };
          return foldl(dictFoldable)(go)(Data_Maybe.Nothing.value);
      };
  };
  var any = function (dictFoldable) {
      return function (dictHeytingAlgebra) {
          return Data_Newtype.alaF(Data_Functor.functorFn)(Data_Functor.functorFn)(Data_Newtype.newtypeDisj)(Data_Newtype.newtypeDisj)(Data_Monoid_Disj.Disj)(foldMap(dictFoldable)(Data_Monoid_Disj.monoidDisj(dictHeytingAlgebra)));
      };
  };
  exports["Foldable"] = Foldable;
  exports["foldr"] = foldr;
  exports["foldl"] = foldl;
  exports["foldMap"] = foldMap;
  exports["foldMapDefaultR"] = foldMapDefaultR;
  exports["fold"] = fold;
  exports["traverse_"] = traverse_;
  exports["for_"] = for_;
  exports["sequence_"] = sequence_;
  exports["intercalate"] = intercalate;
  exports["any"] = any;
  exports["find"] = find;
  exports["minimumBy"] = minimumBy;
  exports["length"] = length;
  exports["foldableArray"] = foldableArray;
  exports["foldableMaybe"] = foldableMaybe;
})(PS["Data.Foldable"] = PS["Data.Foldable"] || {});
(function(exports) {
    "use strict";

  // jshint maxparams: 3

  exports.traverseArrayImpl = function () {
    function array1(a) {
      return [a];
    }

    function array2(a) {
      return function (b) {
        return [a, b];
      };
    }

    function array3(a) {
      return function (b) {
        return function (c) {
          return [a, b, c];
        };
      };
    }

    function concat2(xs) {
      return function (ys) {
        return xs.concat(ys);
      };
    }

    return function (apply) {
      return function (map) {
        return function (pure) {
          return function (f) {
            return function (array) {
              function go(bot, top) {
                switch (top - bot) {
                case 0: return pure([]);
                case 1: return map(array1)(f(array[bot]));
                case 2: return apply(map(array2)(f(array[bot])))(f(array[bot + 1]));
                case 3: return apply(apply(map(array3)(f(array[bot])))(f(array[bot + 1])))(f(array[bot + 2]));
                default:
                  // This slightly tricky pivot selection aims to produce two
                  // even-length partitions where possible.
                  var pivot = bot + Math.floor((top - bot) / 4) * 2;
                  return apply(map(concat2)(go(bot, pivot)))(go(pivot, top));
                }
              }
              return go(0, array.length);
            };
          };
        };
      };
    };
  }();
})(PS["Data.Traversable"] = PS["Data.Traversable"] || {});
(function(exports) {
  // Generated by purs version 0.12.0
  "use strict";
  var Control_Applicative = PS["Control.Applicative"];
  var Control_Apply = PS["Control.Apply"];
  var Data_Functor = PS["Data.Functor"];
  var Data_Traversable_Accum = PS["Data.Traversable.Accum"];
  var Prelude = PS["Prelude"];
  var stateL = function (v) {
      return v;
  }; 
  var functorStateL = new Data_Functor.Functor(function (f) {
      return function (k) {
          return function (s) {
              var v = stateL(k)(s);
              return {
                  accum: v.accum,
                  value: f(v.value)
              };
          };
      };
  });
  var applyStateL = new Control_Apply.Apply(function () {
      return functorStateL;
  }, function (f) {
      return function (x) {
          return function (s) {
              var v = stateL(f)(s);
              var v1 = stateL(x)(v.accum);
              return {
                  accum: v1.accum,
                  value: v.value(v1.value)
              };
          };
      };
  });
  var applicativeStateL = new Control_Applicative.Applicative(function () {
      return applyStateL;
  }, function (a) {
      return function (s) {
          return {
              accum: s,
              value: a
          };
      };
  });
  exports["stateL"] = stateL;
  exports["functorStateL"] = functorStateL;
  exports["applyStateL"] = applyStateL;
  exports["applicativeStateL"] = applicativeStateL;
})(PS["Data.Traversable.Accum.Internal"] = PS["Data.Traversable.Accum.Internal"] || {});
(function(exports) {
  // Generated by purs version 0.12.0
  "use strict";
  var $foreign = PS["Data.Traversable"];
  var Control_Applicative = PS["Control.Applicative"];
  var Control_Apply = PS["Control.Apply"];
  var Control_Category = PS["Control.Category"];
  var Data_Foldable = PS["Data.Foldable"];
  var Data_Functor = PS["Data.Functor"];
  var Data_Maybe = PS["Data.Maybe"];
  var Data_Maybe_First = PS["Data.Maybe.First"];
  var Data_Maybe_Last = PS["Data.Maybe.Last"];
  var Data_Monoid_Additive = PS["Data.Monoid.Additive"];
  var Data_Monoid_Conj = PS["Data.Monoid.Conj"];
  var Data_Monoid_Disj = PS["Data.Monoid.Disj"];
  var Data_Monoid_Dual = PS["Data.Monoid.Dual"];
  var Data_Monoid_Multiplicative = PS["Data.Monoid.Multiplicative"];
  var Data_Traversable_Accum = PS["Data.Traversable.Accum"];
  var Data_Traversable_Accum_Internal = PS["Data.Traversable.Accum.Internal"];
  var Prelude = PS["Prelude"];                 
  var Traversable = function (Foldable1, Functor0, sequence, traverse) {
      this.Foldable1 = Foldable1;
      this.Functor0 = Functor0;
      this.sequence = sequence;
      this.traverse = traverse;
  };
  var traverse = function (dict) {
      return dict.traverse;
  }; 
  var sequenceDefault = function (dictTraversable) {
      return function (dictApplicative) {
          return traverse(dictTraversable)(dictApplicative)(Control_Category.identity(Control_Category.categoryFn));
      };
  };
  var traversableArray = new Traversable(function () {
      return Data_Foldable.foldableArray;
  }, function () {
      return Data_Functor.functorArray;
  }, function (dictApplicative) {
      return sequenceDefault(traversableArray)(dictApplicative);
  }, function (dictApplicative) {
      return $foreign.traverseArrayImpl(Control_Apply.apply(dictApplicative.Apply0()))(Data_Functor.map((dictApplicative.Apply0()).Functor0()))(Control_Applicative.pure(dictApplicative));
  });
  var sequence = function (dict) {
      return dict.sequence;
  };
  var mapAccumL = function (dictTraversable) {
      return function (f) {
          return function (s0) {
              return function (xs) {
                  return Data_Traversable_Accum_Internal.stateL(traverse(dictTraversable)(Data_Traversable_Accum_Internal.applicativeStateL)(function (a) {
                      return function (s) {
                          return f(s)(a);
                      };
                  })(xs))(s0);
              };
          };
      };
  };
  var scanl = function (dictTraversable) {
      return function (f) {
          return function (b0) {
              return function (xs) {
                  return (mapAccumL(dictTraversable)(function (b) {
                      return function (a) {
                          var b$prime = f(b)(a);
                          return {
                              accum: b$prime,
                              value: b$prime
                          };
                      };
                  })(b0)(xs)).value;
              };
          };
      };
  };
  var $$for = function (dictApplicative) {
      return function (dictTraversable) {
          return function (x) {
              return function (f) {
                  return traverse(dictTraversable)(dictApplicative)(f)(x);
              };
          };
      };
  };
  exports["Traversable"] = Traversable;
  exports["traverse"] = traverse;
  exports["sequence"] = sequence;
  exports["sequenceDefault"] = sequenceDefault;
  exports["for"] = $$for;
  exports["scanl"] = scanl;
  exports["mapAccumL"] = mapAccumL;
  exports["traversableArray"] = traversableArray;
})(PS["Data.Traversable"] = PS["Data.Traversable"] || {});
(function(exports) {
  // Generated by purs version 0.12.0
  "use strict";
  var Control_Category = PS["Control.Category"];                 
  var Bifunctor = function (bimap) {
      this.bimap = bimap;
  };
  var bimap = function (dict) {
      return dict.bimap;
  };
  exports["bimap"] = bimap;
  exports["Bifunctor"] = Bifunctor;
})(PS["Data.Bifunctor"] = PS["Data.Bifunctor"] || {});
(function(exports) {
  // Generated by purs version 0.12.0
  "use strict";
  var TypeEquals = function (from, to) {
      this.from = from;
      this.to = to;
  };
  var to = function (dict) {
      return dict.to;
  };
  var refl = new TypeEquals(function (a) {
      return a;
  }, function (a) {
      return a;
  });
  var from = function (dict) {
      return dict.from;
  };
  exports["TypeEquals"] = TypeEquals;
  exports["to"] = to;
  exports["from"] = from;
  exports["refl"] = refl;
})(PS["Type.Equality"] = PS["Type.Equality"] || {});
(function(exports) {
  // Generated by purs version 0.12.0
  "use strict";
  var Control_Applicative = PS["Control.Applicative"];
  var Control_Apply = PS["Control.Apply"];
  var Control_Biapplicative = PS["Control.Biapplicative"];
  var Control_Biapply = PS["Control.Biapply"];
  var Control_Bind = PS["Control.Bind"];
  var Control_Comonad = PS["Control.Comonad"];
  var Control_Extend = PS["Control.Extend"];
  var Control_Lazy = PS["Control.Lazy"];
  var Control_Monad = PS["Control.Monad"];
  var Control_Semigroupoid = PS["Control.Semigroupoid"];
  var Data_Bifoldable = PS["Data.Bifoldable"];
  var Data_Bifunctor = PS["Data.Bifunctor"];
  var Data_Bitraversable = PS["Data.Bitraversable"];
  var Data_BooleanAlgebra = PS["Data.BooleanAlgebra"];
  var Data_Bounded = PS["Data.Bounded"];
  var Data_CommutativeRing = PS["Data.CommutativeRing"];
  var Data_Distributive = PS["Data.Distributive"];
  var Data_Eq = PS["Data.Eq"];
  var Data_Foldable = PS["Data.Foldable"];
  var Data_Function = PS["Data.Function"];
  var Data_Functor = PS["Data.Functor"];
  var Data_Functor_Invariant = PS["Data.Functor.Invariant"];
  var Data_HeytingAlgebra = PS["Data.HeytingAlgebra"];
  var Data_Maybe = PS["Data.Maybe"];
  var Data_Maybe_First = PS["Data.Maybe.First"];
  var Data_Monoid = PS["Data.Monoid"];
  var Data_Newtype = PS["Data.Newtype"];
  var Data_Ord = PS["Data.Ord"];
  var Data_Ordering = PS["Data.Ordering"];
  var Data_Ring = PS["Data.Ring"];
  var Data_Semigroup = PS["Data.Semigroup"];
  var Data_Semiring = PS["Data.Semiring"];
  var Data_Show = PS["Data.Show"];
  var Data_Traversable = PS["Data.Traversable"];
  var Data_Unit = PS["Data.Unit"];
  var Prelude = PS["Prelude"];
  var Type_Equality = PS["Type.Equality"];                 
  var Tuple = (function () {
      function Tuple(value0, value1) {
          this.value0 = value0;
          this.value1 = value1;
      };
      Tuple.create = function (value0) {
          return function (value1) {
              return new Tuple(value0, value1);
          };
      };
      return Tuple;
  })();
  var uncurry = function (f) {
      return function (v) {
          return f(v.value0)(v.value1);
      };
  };
  var snd = function (v) {
      return v.value1;
  }; 
  var semigroupTuple = function (dictSemigroup) {
      return function (dictSemigroup1) {
          return new Data_Semigroup.Semigroup(function (v) {
              return function (v1) {
                  return new Tuple(Data_Semigroup.append(dictSemigroup)(v.value0)(v1.value0), Data_Semigroup.append(dictSemigroup1)(v.value1)(v1.value1));
              };
          });
      };
  };
  var monoidTuple = function (dictMonoid) {
      return function (dictMonoid1) {
          return new Data_Monoid.Monoid(function () {
              return semigroupTuple(dictMonoid.Semigroup0())(dictMonoid1.Semigroup0());
          }, new Tuple(Data_Monoid.mempty(dictMonoid), Data_Monoid.mempty(dictMonoid1)));
      };
  };
  var functorTuple = new Data_Functor.Functor(function (f) {
      return function (m) {
          return new Tuple(m.value0, f(m.value1));
      };
  });                                                                                                   
  var fst = function (v) {
      return v.value0;
  };
  var bifunctorTuple = new Data_Bifunctor.Bifunctor(function (f) {
      return function (g) {
          return function (v) {
              return new Tuple(f(v.value0), g(v.value1));
          };
      };
  });
  exports["Tuple"] = Tuple;
  exports["fst"] = fst;
  exports["snd"] = snd;
  exports["uncurry"] = uncurry;
  exports["semigroupTuple"] = semigroupTuple;
  exports["monoidTuple"] = monoidTuple;
  exports["functorTuple"] = functorTuple;
  exports["bifunctorTuple"] = bifunctorTuple;
})(PS["Data.Tuple"] = PS["Data.Tuple"] || {});
(function(exports) {
    "use strict";

  exports.unfoldrArrayImpl = function (isNothing) {
    return function (fromJust) {
      return function (fst) {
        return function (snd) {
          return function (f) {
            return function (b) {
              var result = [];
              var value = b;
              while (true) { // eslint-disable-line no-constant-condition
                var maybe = f(value);
                if (isNothing(maybe)) return result;
                var tuple = fromJust(maybe);
                result.push(fst(tuple));
                value = snd(tuple);
              }
            };
          };
        };
      };
    };
  };
})(PS["Data.Unfoldable"] = PS["Data.Unfoldable"] || {});
(function(exports) {
    "use strict";

  exports.unfoldr1ArrayImpl = function (isNothing) {
    return function (fromJust) {
      return function (fst) {
        return function (snd) {
          return function (f) {
            return function (b) {
              var result = [];
              var value = b;
              while (true) { // eslint-disable-line no-constant-condition
                var tuple = f(value);
                result.push(fst(tuple));
                var maybe = snd(tuple);
                if (isNothing(maybe)) return result;
                value = fromJust(maybe);
              }
            };
          };
        };
      };
    };
  };
})(PS["Data.Unfoldable1"] = PS["Data.Unfoldable1"] || {});
(function(exports) {
  // Generated by purs version 0.12.0
  "use strict";
  var $foreign = PS["Data.Unfoldable1"];
  var Data_Boolean = PS["Data.Boolean"];
  var Data_Eq = PS["Data.Eq"];
  var Data_Maybe = PS["Data.Maybe"];
  var Data_Ord = PS["Data.Ord"];
  var Data_Ring = PS["Data.Ring"];
  var Data_Semigroup_Traversable = PS["Data.Semigroup.Traversable"];
  var Data_Semiring = PS["Data.Semiring"];
  var Data_Tuple = PS["Data.Tuple"];
  var Partial_Unsafe = PS["Partial.Unsafe"];
  var Prelude = PS["Prelude"];                 
  var Unfoldable1 = function (unfoldr1) {
      this.unfoldr1 = unfoldr1;
  };
  var unfoldr1 = function (dict) {
      return dict.unfoldr1;
  };
  var unfoldable1Array = new Unfoldable1($foreign.unfoldr1ArrayImpl(Data_Maybe.isNothing)(Data_Maybe.fromJust())(Data_Tuple.fst)(Data_Tuple.snd));
  exports["Unfoldable1"] = Unfoldable1;
  exports["unfoldr1"] = unfoldr1;
  exports["unfoldable1Array"] = unfoldable1Array;
})(PS["Data.Unfoldable1"] = PS["Data.Unfoldable1"] || {});
(function(exports) {
  // Generated by purs version 0.12.0
  "use strict";
  var $foreign = PS["Data.Unfoldable"];
  var Data_Function = PS["Data.Function"];
  var Data_Functor = PS["Data.Functor"];
  var Data_Maybe = PS["Data.Maybe"];
  var Data_Ord = PS["Data.Ord"];
  var Data_Ring = PS["Data.Ring"];
  var Data_Traversable = PS["Data.Traversable"];
  var Data_Tuple = PS["Data.Tuple"];
  var Data_Unfoldable1 = PS["Data.Unfoldable1"];
  var Data_Unit = PS["Data.Unit"];
  var Partial_Unsafe = PS["Partial.Unsafe"];
  var Prelude = PS["Prelude"];                 
  var Unfoldable = function (Unfoldable10, unfoldr) {
      this.Unfoldable10 = Unfoldable10;
      this.unfoldr = unfoldr;
  };
  var unfoldr = function (dict) {
      return dict.unfoldr;
  };
  var unfoldableArray = new Unfoldable(function () {
      return Data_Unfoldable1.unfoldable1Array;
  }, $foreign.unfoldrArrayImpl(Data_Maybe.isNothing)(Data_Maybe.fromJust())(Data_Tuple.fst)(Data_Tuple.snd));
  exports["Unfoldable"] = Unfoldable;
  exports["unfoldr"] = unfoldr;
  exports["unfoldableArray"] = unfoldableArray;
})(PS["Data.Unfoldable"] = PS["Data.Unfoldable"] || {});
(function(exports) {
  // Generated by purs version 0.12.0
  "use strict";
  var $foreign = PS["Data.Array"];
  var Control_Alt = PS["Control.Alt"];
  var Control_Alternative = PS["Control.Alternative"];
  var Control_Applicative = PS["Control.Applicative"];
  var Control_Apply = PS["Control.Apply"];
  var Control_Bind = PS["Control.Bind"];
  var Control_Category = PS["Control.Category"];
  var Control_Lazy = PS["Control.Lazy"];
  var Control_Monad_Rec_Class = PS["Control.Monad.Rec.Class"];
  var Control_Monad_ST = PS["Control.Monad.ST"];
  var Control_Monad_ST_Internal = PS["Control.Monad.ST.Internal"];
  var Control_Semigroupoid = PS["Control.Semigroupoid"];
  var Data_Array_NonEmpty_Internal = PS["Data.Array.NonEmpty.Internal"];
  var Data_Array_ST = PS["Data.Array.ST"];
  var Data_Array_ST_Iterator = PS["Data.Array.ST.Iterator"];
  var Data_Boolean = PS["Data.Boolean"];
  var Data_Eq = PS["Data.Eq"];
  var Data_Foldable = PS["Data.Foldable"];
  var Data_Function = PS["Data.Function"];
  var Data_Functor = PS["Data.Functor"];
  var Data_HeytingAlgebra = PS["Data.HeytingAlgebra"];
  var Data_Maybe = PS["Data.Maybe"];
  var Data_Ord = PS["Data.Ord"];
  var Data_Ordering = PS["Data.Ordering"];
  var Data_Ring = PS["Data.Ring"];
  var Data_Semigroup = PS["Data.Semigroup"];
  var Data_Semiring = PS["Data.Semiring"];
  var Data_Traversable = PS["Data.Traversable"];
  var Data_Tuple = PS["Data.Tuple"];
  var Data_Unfoldable = PS["Data.Unfoldable"];
  var Partial_Unsafe = PS["Partial.Unsafe"];
  var Prelude = PS["Prelude"];
  var Unsafe_Coerce = PS["Unsafe.Coerce"];
  var zip = $foreign.zipWith(Data_Tuple.Tuple.create);
  var uncons = $foreign["uncons'"](Data_Function["const"](Data_Maybe.Nothing.value))(function (x) {
      return function (xs) {
          return new Data_Maybe.Just({
              head: x,
              tail: xs
          });
      };
  });
  var sortBy = function (comp) {
      return function (xs) {
          var comp$prime = function (x) {
              return function (y) {
                  var v = comp(x)(y);
                  if (v instanceof Data_Ordering.GT) {
                      return 1;
                  };
                  if (v instanceof Data_Ordering.EQ) {
                      return 0;
                  };
                  if (v instanceof Data_Ordering.LT) {
                      return -1 | 0;
                  };
                  throw new Error("Failed pattern match at Data.Array line 702, column 15 - line 707, column 1: " + [ v.constructor.name ]);
              };
          };
          return $foreign.sortImpl(comp$prime)(xs);
      };
  };
  var sortWith = function (dictOrd) {
      return function (f) {
          return sortBy(Data_Ord.comparing(dictOrd)(f));
      };
  };
  var singleton = function (a) {
      return [ a ];
  };
  var $$null = function (xs) {
      return $foreign.length(xs) === 0;
  };
  var mapWithIndex = function (f) {
      return function (xs) {
          return $foreign.zipWith(f)($foreign.range(0)($foreign.length(xs) - 1 | 0))(xs);
      };
  };
  var index = $foreign.indexImpl(Data_Maybe.Just.create)(Data_Maybe.Nothing.value);
  var last = function (xs) {
      return index(xs)($foreign.length(xs) - 1 | 0);
  };
  var unzip = function (xs) {
      return Control_Monad_ST_Internal.run(Control_Bind.bind(Control_Monad_ST_Internal.bindST)(Data_Array_ST.empty)(function (v) {
          return Control_Bind.bind(Control_Monad_ST_Internal.bindST)(Data_Array_ST.empty)(function (v1) {
              return Control_Bind.bind(Control_Monad_ST_Internal.bindST)(Data_Array_ST_Iterator.iterator(function (v2) {
                  return index(xs)(v2);
              }))(function (v2) {
                  return Control_Bind.discard(Control_Bind.discardUnit)(Control_Monad_ST_Internal.bindST)(Data_Array_ST_Iterator.iterate(v2)(function (v3) {
                      return Control_Bind.discard(Control_Bind.discardUnit)(Control_Monad_ST_Internal.bindST)(Data_Functor["void"](Control_Monad_ST_Internal.functorST)(Data_Array_ST.push(v3.value0)(v)))(function () {
                          return Data_Functor["void"](Control_Monad_ST_Internal.functorST)(Data_Array_ST.push(v3.value1)(v1));
                      });
                  }))(function () {
                      return Control_Bind.bind(Control_Monad_ST_Internal.bindST)(Data_Array_ST.unsafeFreeze(v))(function (v3) {
                          return Control_Bind.bind(Control_Monad_ST_Internal.bindST)(Data_Array_ST.unsafeFreeze(v1))(function (v4) {
                              return Control_Applicative.pure(Control_Monad_ST_Internal.applicativeST)(new Data_Tuple.Tuple(v3, v4));
                          });
                      });
                  });
              });
          });
      }));
  };
  var head = function (xs) {
      return index(xs)(0);
  };
  var nubBy = function (comp) {
      return function (xs) {
          var indexedAndSorted = sortBy(function (x) {
              return function (y) {
                  return comp(Data_Tuple.snd(x))(Data_Tuple.snd(y));
              };
          })(mapWithIndex(Data_Tuple.Tuple.create)(xs));
          var v = head(indexedAndSorted);
          if (v instanceof Data_Maybe.Nothing) {
              return [  ];
          };
          if (v instanceof Data_Maybe.Just) {
              return Data_Functor.map(Data_Functor.functorArray)(Data_Tuple.snd)(sortWith(Data_Ord.ordInt)(Data_Tuple.fst)(Control_Monad_ST_Internal.run(Control_Bind.bind(Control_Monad_ST_Internal.bindST)(Data_Array_ST.unsafeThaw(singleton(v.value0)))(function (v1) {
                  return Control_Bind.discard(Control_Bind.discardUnit)(Control_Monad_ST_Internal.bindST)(Control_Monad_ST_Internal.foreach(indexedAndSorted)(function (v2) {
                      return Control_Bind.bind(Control_Monad_ST_Internal.bindST)(Data_Functor.map(Control_Monad_ST_Internal.functorST)(function ($111) {
                          return Data_Tuple.snd((function ($112) {
                              return Data_Maybe.fromJust()(last($112));
                          })($111));
                      })(Data_Array_ST.unsafeFreeze(v1)))(function (v3) {
                          return Control_Applicative.when(Control_Monad_ST_Internal.applicativeST)(Data_Eq.notEq(Data_Ordering.eqOrdering)(comp(v3)(v2.value1))(Data_Ordering.EQ.value))(Data_Functor["void"](Control_Monad_ST_Internal.functorST)(Data_Array_ST.push(v2)(v1)));
                      });
                  }))(function () {
                      return Data_Array_ST.unsafeFreeze(v1);
                  });
              }))));
          };
          throw new Error("Failed pattern match at Data.Array line 903, column 17 - line 911, column 29: " + [ v.constructor.name ]);
      };
  };
  var fromFoldable = function (dictFoldable) {
      return $foreign.fromFoldableImpl(Data_Foldable.foldr(dictFoldable));
  };
  var concatMap = Data_Function.flip(Control_Bind.bind(Control_Bind.bindArray));
  var mapMaybe = function (f) {
      return concatMap(function ($114) {
          return Data_Maybe.maybe([  ])(singleton)(f($114));
      });
  };
  var catMaybes = mapMaybe(Control_Category.identity(Control_Category.categoryFn));
  exports["fromFoldable"] = fromFoldable;
  exports["singleton"] = singleton;
  exports["null"] = $$null;
  exports["head"] = head;
  exports["last"] = last;
  exports["uncons"] = uncons;
  exports["index"] = index;
  exports["concatMap"] = concatMap;
  exports["mapMaybe"] = mapMaybe;
  exports["catMaybes"] = catMaybes;
  exports["mapWithIndex"] = mapWithIndex;
  exports["sortBy"] = sortBy;
  exports["sortWith"] = sortWith;
  exports["nubBy"] = nubBy;
  exports["zip"] = zip;
  exports["unzip"] = unzip;
  exports["range"] = $foreign.range;
  exports["length"] = $foreign.length;
  exports["cons"] = $foreign.cons;
  exports["snoc"] = $foreign.snoc;
  exports["concat"] = $foreign.concat;
  exports["filter"] = $foreign.filter;
  exports["partition"] = $foreign.partition;
  exports["take"] = $foreign.take;
  exports["zipWith"] = $foreign.zipWith;
})(PS["Data.Array"] = PS["Data.Array"] || {});
(function(exports) {
    "use strict";

  exports.mapWithIndexArray = function (f) {
    return function (xs) {
      var l = xs.length;
      var result = Array(l);
      for (var i = 0; i < l; i++) {
        result[i] = f(i)(xs[i]);
      }
      return result;
    };
  };
})(PS["Data.FunctorWithIndex"] = PS["Data.FunctorWithIndex"] || {});
(function(exports) {
  // Generated by purs version 0.12.0
  "use strict";
  var $foreign = PS["Data.FunctorWithIndex"];
  var Data_Function = PS["Data.Function"];
  var Data_Functor = PS["Data.Functor"];
  var Data_Maybe = PS["Data.Maybe"];
  var Data_Maybe_First = PS["Data.Maybe.First"];
  var Data_Maybe_Last = PS["Data.Maybe.Last"];
  var Data_Monoid_Additive = PS["Data.Monoid.Additive"];
  var Data_Monoid_Conj = PS["Data.Monoid.Conj"];
  var Data_Monoid_Disj = PS["Data.Monoid.Disj"];
  var Data_Monoid_Dual = PS["Data.Monoid.Dual"];
  var Data_Monoid_Multiplicative = PS["Data.Monoid.Multiplicative"];
  var Data_Unit = PS["Data.Unit"];
  var Prelude = PS["Prelude"];                 
  var FunctorWithIndex = function (Functor0, mapWithIndex) {
      this.Functor0 = Functor0;
      this.mapWithIndex = mapWithIndex;
  };
  var mapWithIndex = function (dict) {
      return dict.mapWithIndex;
  }; 
  var functorWithIndexArray = new FunctorWithIndex(function () {
      return Data_Functor.functorArray;
  }, $foreign.mapWithIndexArray);
  exports["FunctorWithIndex"] = FunctorWithIndex;
  exports["mapWithIndex"] = mapWithIndex;
  exports["functorWithIndexArray"] = functorWithIndexArray;
})(PS["Data.FunctorWithIndex"] = PS["Data.FunctorWithIndex"] || {});
(function(exports) {
  // Generated by purs version 0.12.0
  "use strict";
  var Control_Applicative = PS["Control.Applicative"];
  var Control_Apply = PS["Control.Apply"];
  var Control_Bind = PS["Control.Bind"];
  var Control_Category = PS["Control.Category"];
  var Control_Semigroupoid = PS["Control.Semigroupoid"];
  var Data_Foldable = PS["Data.Foldable"];
  var Data_Function = PS["Data.Function"];
  var Data_FunctorWithIndex = PS["Data.FunctorWithIndex"];
  var Data_Maybe = PS["Data.Maybe"];
  var Data_Maybe_First = PS["Data.Maybe.First"];
  var Data_Maybe_Last = PS["Data.Maybe.Last"];
  var Data_Monoid = PS["Data.Monoid"];
  var Data_Monoid_Additive = PS["Data.Monoid.Additive"];
  var Data_Monoid_Conj = PS["Data.Monoid.Conj"];
  var Data_Monoid_Disj = PS["Data.Monoid.Disj"];
  var Data_Monoid_Dual = PS["Data.Monoid.Dual"];
  var Data_Monoid_Endo = PS["Data.Monoid.Endo"];
  var Data_Monoid_Multiplicative = PS["Data.Monoid.Multiplicative"];
  var Data_Newtype = PS["Data.Newtype"];
  var Data_Semigroup = PS["Data.Semigroup"];
  var Data_Unit = PS["Data.Unit"];
  var Prelude = PS["Prelude"];
  var FoldableWithIndex = function (Foldable0, foldMapWithIndex, foldlWithIndex, foldrWithIndex) {
      this.Foldable0 = Foldable0;
      this.foldMapWithIndex = foldMapWithIndex;
      this.foldlWithIndex = foldlWithIndex;
      this.foldrWithIndex = foldrWithIndex;
  };
  var foldrWithIndex = function (dict) {
      return dict.foldrWithIndex;
  };
  var foldlWithIndex = function (dict) {
      return dict.foldlWithIndex;
  };
  var foldMapWithIndex = function (dict) {
      return dict.foldMapWithIndex;
  };
  exports["FoldableWithIndex"] = FoldableWithIndex;
  exports["foldrWithIndex"] = foldrWithIndex;
  exports["foldlWithIndex"] = foldlWithIndex;
  exports["foldMapWithIndex"] = foldMapWithIndex;
})(PS["Data.FoldableWithIndex"] = PS["Data.FoldableWithIndex"] || {});
(function(exports) {
  // Generated by purs version 0.12.0
  "use strict";
  var Control_Alt = PS["Control.Alt"];
  var Control_Alternative = PS["Control.Alternative"];
  var Control_Applicative = PS["Control.Applicative"];
  var Control_Apply = PS["Control.Apply"];
  var Control_Category = PS["Control.Category"];
  var Control_Plus = PS["Control.Plus"];
  var Control_Semigroupoid = PS["Control.Semigroupoid"];
  var Data_Eq = PS["Data.Eq"];
  var Data_Foldable = PS["Data.Foldable"];
  var Data_FoldableWithIndex = PS["Data.FoldableWithIndex"];
  var Data_Function = PS["Data.Function"];
  var Data_Functor = PS["Data.Functor"];
  var Data_FunctorWithIndex = PS["Data.FunctorWithIndex"];
  var Data_HeytingAlgebra = PS["Data.HeytingAlgebra"];
  var Data_Maybe = PS["Data.Maybe"];
  var Data_Ord = PS["Data.Ord"];
  var Data_Ordering = PS["Data.Ordering"];
  var Data_Semigroup = PS["Data.Semigroup"];
  var Data_Semigroup_Foldable = PS["Data.Semigroup.Foldable"];
  var Data_Show = PS["Data.Show"];
  var Data_Traversable = PS["Data.Traversable"];
  var Data_TraversableWithIndex = PS["Data.TraversableWithIndex"];
  var Data_Tuple = PS["Data.Tuple"];
  var Data_Unfoldable = PS["Data.Unfoldable"];
  var Data_Unfoldable1 = PS["Data.Unfoldable1"];
  var Prelude = PS["Prelude"];                 
  var NonEmpty = (function () {
      function NonEmpty(value0, value1) {
          this.value0 = value0;
          this.value1 = value1;
      };
      NonEmpty.create = function (value0) {
          return function (value1) {
              return new NonEmpty(value0, value1);
          };
      };
      return NonEmpty;
  })();
  var singleton = function (dictPlus) {
      return function (a) {
          return new NonEmpty(a, Control_Plus.empty(dictPlus));
      };
  };
  var functorNonEmpty = function (dictFunctor) {
      return new Data_Functor.Functor(function (f) {
          return function (m) {
              return new NonEmpty(f(m.value0), Data_Functor.map(dictFunctor)(f)(m.value1));
          };
      });
  };
  var foldableNonEmpty = function (dictFoldable) {
      return new Data_Foldable.Foldable(function (dictMonoid) {
          return function (f) {
              return function (v) {
                  return Data_Semigroup.append(dictMonoid.Semigroup0())(f(v.value0))(Data_Foldable.foldMap(dictFoldable)(dictMonoid)(f)(v.value1));
              };
          };
      }, function (f) {
          return function (b) {
              return function (v) {
                  return Data_Foldable.foldl(dictFoldable)(f)(f(b)(v.value0))(v.value1);
              };
          };
      }, function (f) {
          return function (b) {
              return function (v) {
                  return f(v.value0)(Data_Foldable.foldr(dictFoldable)(f)(b)(v.value1));
              };
          };
      });
  };
  exports["NonEmpty"] = NonEmpty;
  exports["singleton"] = singleton;
  exports["functorNonEmpty"] = functorNonEmpty;
  exports["foldableNonEmpty"] = foldableNonEmpty;
})(PS["Data.NonEmpty"] = PS["Data.NonEmpty"] || {});
(function(exports) {
  // Generated by purs version 0.12.0
  "use strict";
  var Control_Alternative = PS["Control.Alternative"];
  var Control_Bind = PS["Control.Bind"];
  var Control_Lazy = PS["Control.Lazy"];
  var Control_Monad_Rec_Class = PS["Control.Monad.Rec.Class"];
  var Control_Semigroupoid = PS["Control.Semigroupoid"];
  var Data_Array = PS["Data.Array"];
  var Data_Array_NonEmpty_Internal = PS["Data.Array.NonEmpty.Internal"];
  var Data_Bifunctor = PS["Data.Bifunctor"];
  var Data_Boolean = PS["Data.Boolean"];
  var Data_Eq = PS["Data.Eq"];
  var Data_Foldable = PS["Data.Foldable"];
  var Data_Function = PS["Data.Function"];
  var Data_Functor = PS["Data.Functor"];
  var Data_Maybe = PS["Data.Maybe"];
  var Data_NonEmpty = PS["Data.NonEmpty"];
  var Data_Ord = PS["Data.Ord"];
  var Data_Ring = PS["Data.Ring"];
  var Data_Semigroup = PS["Data.Semigroup"];
  var Data_Semigroup_Foldable = PS["Data.Semigroup.Foldable"];
  var Data_Semiring = PS["Data.Semiring"];
  var Data_Tuple = PS["Data.Tuple"];
  var Data_Unfoldable = PS["Data.Unfoldable"];
  var Data_Unfoldable1 = PS["Data.Unfoldable1"];
  var Partial_Unsafe = PS["Partial.Unsafe"];
  var Prelude = PS["Prelude"];
  var Unsafe_Coerce = PS["Unsafe.Coerce"];         
  var toArray = Unsafe_Coerce.unsafeCoerce;  
  var adaptAny = function (f) {
      return function ($54) {
          return f(toArray($54));
      };
  };
  var index = adaptAny(Data_Array.index);
  exports["toArray"] = toArray;
  exports["index"] = index;
})(PS["Data.Array.NonEmpty"] = PS["Data.Array.NonEmpty"] || {});
(function(exports) {
  // Generated by purs version 0.12.0
  "use strict";
  var Control_Alt = PS["Control.Alt"];
  var Control_Applicative = PS["Control.Applicative"];
  var Control_Apply = PS["Control.Apply"];
  var Control_Bind = PS["Control.Bind"];
  var Control_Extend = PS["Control.Extend"];
  var Control_Monad = PS["Control.Monad"];
  var Control_Semigroupoid = PS["Control.Semigroupoid"];
  var Data_Bifoldable = PS["Data.Bifoldable"];
  var Data_Bifunctor = PS["Data.Bifunctor"];
  var Data_Bitraversable = PS["Data.Bitraversable"];
  var Data_Bounded = PS["Data.Bounded"];
  var Data_Eq = PS["Data.Eq"];
  var Data_Foldable = PS["Data.Foldable"];
  var Data_Function = PS["Data.Function"];
  var Data_Functor = PS["Data.Functor"];
  var Data_Functor_Invariant = PS["Data.Functor.Invariant"];
  var Data_Maybe = PS["Data.Maybe"];
  var Data_Monoid = PS["Data.Monoid"];
  var Data_Ord = PS["Data.Ord"];
  var Data_Ordering = PS["Data.Ordering"];
  var Data_Semigroup = PS["Data.Semigroup"];
  var Data_Show = PS["Data.Show"];
  var Data_Traversable = PS["Data.Traversable"];
  var Prelude = PS["Prelude"];                 
  var Left = (function () {
      function Left(value0) {
          this.value0 = value0;
      };
      Left.create = function (value0) {
          return new Left(value0);
      };
      return Left;
  })();
  var Right = (function () {
      function Right(value0) {
          this.value0 = value0;
      };
      Right.create = function (value0) {
          return new Right(value0);
      };
      return Right;
  })();
  var note = function (a) {
      return Data_Maybe.maybe(new Left(a))(Right.create);
  };
  var functorEither = new Data_Functor.Functor(function (f) {
      return function (m) {
          if (m instanceof Left) {
              return new Left(m.value0);
          };
          if (m instanceof Right) {
              return new Right(f(m.value0));
          };
          throw new Error("Failed pattern match at Data.Either line 35, column 8 - line 35, column 52: " + [ m.constructor.name ]);
      };
  });
  var either = function (v) {
      return function (v1) {
          return function (v2) {
              if (v2 instanceof Left) {
                  return v(v2.value0);
              };
              if (v2 instanceof Right) {
                  return v1(v2.value0);
              };
              throw new Error("Failed pattern match at Data.Either line 220, column 1 - line 220, column 64: " + [ v.constructor.name, v1.constructor.name, v2.constructor.name ]);
          };
      };
  }; 
  var applyEither = new Control_Apply.Apply(function () {
      return functorEither;
  }, function (v) {
      return function (v1) {
          if (v instanceof Left) {
              return new Left(v.value0);
          };
          if (v instanceof Right) {
              return Data_Functor.map(functorEither)(v.value0)(v1);
          };
          throw new Error("Failed pattern match at Data.Either line 76, column 1 - line 76, column 41: " + [ v.constructor.name, v1.constructor.name ]);
      };
  });
  var applicativeEither = new Control_Applicative.Applicative(function () {
      return applyEither;
  }, Right.create);
  exports["Left"] = Left;
  exports["Right"] = Right;
  exports["either"] = either;
  exports["note"] = note;
  exports["functorEither"] = functorEither;
  exports["applyEither"] = applyEither;
  exports["applicativeEither"] = applicativeEither;
})(PS["Data.Either"] = PS["Data.Either"] || {});
(function(exports) {
    "use strict";

  exports.fromNumberImpl = function (just) {
    return function (nothing) {
      return function (n) {
        /* jshint bitwise: false */
        return (n | 0) === n ? just(n) : nothing;
      };
    };
  };

  exports.toNumber = function (n) {
    return n;
  };

  exports.fromStringAsImpl = function (just) {
    return function (nothing) {
      return function (radix) {
        var digits;
        if (radix < 11) {
          digits = "[0-" + (radix - 1).toString() + "]";
        } else if (radix === 11) {
          digits = "[0-9a]";
        } else {
          digits = "[0-9a-" + String.fromCharCode(86 + radix) + "]";
        }
        var pattern = new RegExp("^[\\+\\-]?" + digits + "+$", "i");

        return function (s) {
          /* jshint bitwise: false */
          if (pattern.test(s)) {
            var i = parseInt(s, radix);
            return (i | 0) === i ? just(i) : nothing;
          } else {
            return nothing;
          }
        };
      };
    };
  };
})(PS["Data.Int"] = PS["Data.Int"] || {});
(function(exports) {
  /* globals exports */
  "use strict";         

  exports.infinity = Infinity;
})(PS["Global"] = PS["Global"] || {});
(function(exports) {
  // Generated by purs version 0.12.0
  "use strict";
  var $foreign = PS["Global"];
  exports["infinity"] = $foreign.infinity;
})(PS["Global"] = PS["Global"] || {});
(function(exports) {
    "use strict";

  // module Math

  exports.abs = Math.abs;

  exports.floor = Math.floor;

  exports.log = Math.log;

  exports.pow = function (n) {
    return function (p) {
      return Math.pow(n, p);
    };
  };

  exports.remainder = function (n) {
    return function (m) {
      return n % m;
    };
  };

  exports.round = Math.round;

  exports.sqrt = Math.sqrt;

  exports.ln10 = Math.LN10;    

  exports.pi = Math.PI;
})(PS["Math"] = PS["Math"] || {});
(function(exports) {
  // Generated by purs version 0.12.0
  "use strict";
  var $foreign = PS["Math"];
  exports["abs"] = $foreign.abs;
  exports["floor"] = $foreign.floor;
  exports["log"] = $foreign.log;
  exports["pow"] = $foreign.pow;
  exports["round"] = $foreign.round;
  exports["sqrt"] = $foreign.sqrt;
  exports["remainder"] = $foreign.remainder;
  exports["ln10"] = $foreign.ln10;
  exports["pi"] = $foreign.pi;
})(PS["Math"] = PS["Math"] || {});
(function(exports) {
  // Generated by purs version 0.12.0
  "use strict";
  var $foreign = PS["Data.Int"];
  var Control_Category = PS["Control.Category"];
  var Control_Semigroupoid = PS["Control.Semigroupoid"];
  var Data_Boolean = PS["Data.Boolean"];
  var Data_Bounded = PS["Data.Bounded"];
  var Data_CommutativeRing = PS["Data.CommutativeRing"];
  var Data_DivisionRing = PS["Data.DivisionRing"];
  var Data_Eq = PS["Data.Eq"];
  var Data_EuclideanRing = PS["Data.EuclideanRing"];
  var Data_HeytingAlgebra = PS["Data.HeytingAlgebra"];
  var Data_Int_Bits = PS["Data.Int.Bits"];
  var Data_Maybe = PS["Data.Maybe"];
  var Data_Ord = PS["Data.Ord"];
  var Data_Ordering = PS["Data.Ordering"];
  var Data_Ring = PS["Data.Ring"];
  var Data_Semiring = PS["Data.Semiring"];
  var Data_Show = PS["Data.Show"];
  var Global = PS["Global"];
  var $$Math = PS["Math"];
  var Prelude = PS["Prelude"];
  var hexadecimal = 16;
  var fromStringAs = $foreign.fromStringAsImpl(Data_Maybe.Just.create)(Data_Maybe.Nothing.value);
  var fromString = fromStringAs(10);
  var fromNumber = $foreign.fromNumberImpl(Data_Maybe.Just.create)(Data_Maybe.Nothing.value);
  var unsafeClamp = function (x) {
      if (x === Global.infinity) {
          return 0;
      };
      if (x === -Global.infinity) {
          return 0;
      };
      if (x >= $foreign.toNumber(Data_Bounded.top(Data_Bounded.boundedInt))) {
          return Data_Bounded.top(Data_Bounded.boundedInt);
      };
      if (x <= $foreign.toNumber(Data_Bounded.bottom(Data_Bounded.boundedInt))) {
          return Data_Bounded.bottom(Data_Bounded.boundedInt);
      };
      if (Data_Boolean.otherwise) {
          return Data_Maybe.fromMaybe(0)(fromNumber(x));
      };
      throw new Error("Failed pattern match at Data.Int line 66, column 1 - line 66, column 29: " + [ x.constructor.name ]);
  };
  var round = function ($23) {
      return unsafeClamp($$Math.round($23));
  };
  var floor = function ($24) {
      return unsafeClamp($$Math.floor($24));
  };
  exports["fromNumber"] = fromNumber;
  exports["floor"] = floor;
  exports["round"] = round;
  exports["fromString"] = fromString;
  exports["hexadecimal"] = hexadecimal;
  exports["fromStringAs"] = fromStringAs;
  exports["toNumber"] = $foreign.toNumber;
})(PS["Data.Int"] = PS["Data.Int"] || {});
(function(exports) {
    "use strict";
  /* global Symbol */

  var hasArrayFrom = typeof Array.from === "function";
  var hasStringIterator =
    typeof Symbol !== "undefined" &&
    Symbol != null &&
    typeof Symbol.iterator !== "undefined" &&
    typeof String.prototype[Symbol.iterator] === "function";
  var hasFromCodePoint = typeof String.prototype.fromCodePoint === "function";
  var hasCodePointAt = typeof String.prototype.codePointAt === "function";

  exports._unsafeCodePointAt0 = function (fallback) {
    return hasCodePointAt
      ? function (str) { return str.codePointAt(0); }
      : fallback;
  };

  exports._singleton = function (fallback) {
    return hasFromCodePoint ? String.fromCodePoint : fallback;
  };

  exports._take = function (fallback) {
    return function (n) {
      if (hasStringIterator) {
        return function (str) {
          var accum = "";
          var iter = str[Symbol.iterator]();
          for (var i = 0; i < n; ++i) {
            var o = iter.next();
            if (o.done) return accum;
            accum += o.value;
          }
          return accum;
        };
      }
      return fallback(n);
    };
  };

  exports._toCodePointArray = function (fallback) {
    return function (unsafeCodePointAt0) {
      if (hasArrayFrom) {
        return function (str) {
          return Array.from(str, unsafeCodePointAt0);
        };
      }
      return fallback;
    };
  };
})(PS["Data.String.CodePoints"] = PS["Data.String.CodePoints"] || {});
(function(exports) {
    "use strict";

  exports.toCharCode = function (c) {
    return c.charCodeAt(0);
  };

  exports.fromCharCode = function (c) {
    return String.fromCharCode(c);
  };
})(PS["Data.Enum"] = PS["Data.Enum"] || {});
(function(exports) {
  // Generated by purs version 0.12.0
  "use strict";
  var $foreign = PS["Data.Enum"];
  var Control_Apply = PS["Control.Apply"];
  var Control_Bind = PS["Control.Bind"];
  var Control_MonadPlus = PS["Control.MonadPlus"];
  var Control_MonadZero = PS["Control.MonadZero"];
  var Control_Semigroupoid = PS["Control.Semigroupoid"];
  var Data_Boolean = PS["Data.Boolean"];
  var Data_Bounded = PS["Data.Bounded"];
  var Data_Either = PS["Data.Either"];
  var Data_Eq = PS["Data.Eq"];
  var Data_Function = PS["Data.Function"];
  var Data_Functor = PS["Data.Functor"];
  var Data_HeytingAlgebra = PS["Data.HeytingAlgebra"];
  var Data_Maybe = PS["Data.Maybe"];
  var Data_Newtype = PS["Data.Newtype"];
  var Data_Ord = PS["Data.Ord"];
  var Data_Ordering = PS["Data.Ordering"];
  var Data_Ring = PS["Data.Ring"];
  var Data_Semigroup = PS["Data.Semigroup"];
  var Data_Semiring = PS["Data.Semiring"];
  var Data_Show = PS["Data.Show"];
  var Data_Tuple = PS["Data.Tuple"];
  var Data_Unfoldable = PS["Data.Unfoldable"];
  var Data_Unfoldable1 = PS["Data.Unfoldable1"];
  var Data_Unit = PS["Data.Unit"];
  var Partial_Unsafe = PS["Partial.Unsafe"];
  var Prelude = PS["Prelude"];
  var Enum = function (Ord0, pred, succ) {
      this.Ord0 = Ord0;
      this.pred = pred;
      this.succ = succ;
  };
  var BoundedEnum = function (Bounded0, Enum1, cardinality, fromEnum, toEnum) {
      this.Bounded0 = Bounded0;
      this.Enum1 = Enum1;
      this.cardinality = cardinality;
      this.fromEnum = fromEnum;
      this.toEnum = toEnum;
  };
  var toEnum = function (dict) {
      return dict.toEnum;
  };
  var succ = function (dict) {
      return dict.succ;
  }; 
  var pred = function (dict) {
      return dict.pred;
  };              
  var fromEnum = function (dict) {
      return dict.fromEnum;
  };
  var toEnumWithDefaults = function (dictBoundedEnum) {
      return function (low) {
          return function (high) {
              return function (x) {
                  var v = toEnum(dictBoundedEnum)(x);
                  if (v instanceof Data_Maybe.Just) {
                      return v.value0;
                  };
                  if (v instanceof Data_Maybe.Nothing) {
                      var $51 = x < fromEnum(dictBoundedEnum)(Data_Bounded.bottom(dictBoundedEnum.Bounded0()));
                      if ($51) {
                          return low;
                      };
                      return high;
                  };
                  throw new Error("Failed pattern match at Data.Enum line 158, column 33 - line 160, column 62: " + [ v.constructor.name ]);
              };
          };
      };
  };
  var defaultSucc = function (toEnum$prime) {
      return function (fromEnum$prime) {
          return function (a) {
              return toEnum$prime(fromEnum$prime(a) + 1 | 0);
          };
      };
  };
  var defaultPred = function (toEnum$prime) {
      return function (fromEnum$prime) {
          return function (a) {
              return toEnum$prime(fromEnum$prime(a) - 1 | 0);
          };
      };
  };
  var charToEnum = function (v) {
      if (v >= Data_Bounded.bottom(Data_Bounded.boundedInt) && v <= Data_Bounded.top(Data_Bounded.boundedInt)) {
          return new Data_Maybe.Just($foreign.fromCharCode(v));
      };
      return Data_Maybe.Nothing.value;
  };
  var enumChar = new Enum(function () {
      return Data_Ord.ordChar;
  }, defaultPred(charToEnum)($foreign.toCharCode), defaultSucc(charToEnum)($foreign.toCharCode));
  var cardinality = function (dict) {
      return dict.cardinality;
  }; 
  var boundedEnumChar = new BoundedEnum(function () {
      return Data_Bounded.boundedChar;
  }, function () {
      return enumChar;
  }, $foreign.toCharCode(Data_Bounded.top(Data_Bounded.boundedChar)) - $foreign.toCharCode(Data_Bounded.bottom(Data_Bounded.boundedChar)) | 0, $foreign.toCharCode, charToEnum);
  exports["Enum"] = Enum;
  exports["succ"] = succ;
  exports["pred"] = pred;
  exports["BoundedEnum"] = BoundedEnum;
  exports["cardinality"] = cardinality;
  exports["toEnum"] = toEnum;
  exports["fromEnum"] = fromEnum;
  exports["toEnumWithDefaults"] = toEnumWithDefaults;
  exports["defaultSucc"] = defaultSucc;
  exports["defaultPred"] = defaultPred;
  exports["enumChar"] = enumChar;
  exports["boundedEnumChar"] = boundedEnumChar;
})(PS["Data.Enum"] = PS["Data.Enum"] || {});
(function(exports) {
    "use strict";

  exports.singleton = function (c) {
    return c;
  };

  exports.length = function (s) {
    return s.length;
  };

  exports._indexOf = function (just) {
    return function (nothing) {
      return function (x) {
        return function (s) {
          var i = s.indexOf(x);
          return i === -1 ? nothing : just(i);
        };
      };
    };
  };

  exports.drop = function (n) {
    return function (s) {
      return s.substring(n);
    };
  };
})(PS["Data.String.CodeUnits"] = PS["Data.String.CodeUnits"] || {});
(function(exports) {
  // Generated by purs version 0.12.0
  "use strict";
  var Data_Eq = PS["Data.Eq"];
  var Data_Newtype = PS["Data.Newtype"];
  var Data_Ord = PS["Data.Ord"];
  var Data_Semigroup = PS["Data.Semigroup"];
  var Data_Show = PS["Data.Show"];
  var Prelude = PS["Prelude"];
  var Pattern = function (x) {
      return x;
  };              
  var newtypePattern = new Data_Newtype.Newtype(function (n) {
      return n;
  }, Pattern);
  exports["Pattern"] = Pattern;
  exports["newtypePattern"] = newtypePattern;
})(PS["Data.String.Pattern"] = PS["Data.String.Pattern"] || {});
(function(exports) {
    "use strict";

  exports.charAt = function (i) {
    return function (s) {
      if (i >= 0 && i < s.length) return s.charAt(i);
      throw new Error("Data.String.Unsafe.charAt: Invalid index.");
    };
  };
})(PS["Data.String.Unsafe"] = PS["Data.String.Unsafe"] || {});
(function(exports) {
  // Generated by purs version 0.12.0
  "use strict";
  var $foreign = PS["Data.String.Unsafe"];
  exports["charAt"] = $foreign.charAt;
})(PS["Data.String.Unsafe"] = PS["Data.String.Unsafe"] || {});
(function(exports) {
  // Generated by purs version 0.12.0
  "use strict";
  var $foreign = PS["Data.String.CodeUnits"];
  var Control_Semigroupoid = PS["Control.Semigroupoid"];
  var Data_Boolean = PS["Data.Boolean"];
  var Data_Eq = PS["Data.Eq"];
  var Data_Function = PS["Data.Function"];
  var Data_HeytingAlgebra = PS["Data.HeytingAlgebra"];
  var Data_Maybe = PS["Data.Maybe"];
  var Data_Ord = PS["Data.Ord"];
  var Data_Ring = PS["Data.Ring"];
  var Data_Semiring = PS["Data.Semiring"];
  var Data_String_Pattern = PS["Data.String.Pattern"];
  var Data_String_Unsafe = PS["Data.String.Unsafe"];
  var Prelude = PS["Prelude"];                                                                
  var indexOf = $foreign._indexOf(Data_Maybe.Just.create)(Data_Maybe.Nothing.value);
  var stripPrefix = function (v) {
      return function (str) {
          var v1 = indexOf(v)(str);
          if (v1 instanceof Data_Maybe.Just && v1.value0 === 0) {
              return Data_Maybe.Just.create($foreign.drop($foreign.length(v))(str));
          };
          return Data_Maybe.Nothing.value;
      };
  };
  var contains = function (pat) {
      return function ($16) {
          return Data_Maybe.isJust(indexOf(pat)($16));
      };
  };
  exports["stripPrefix"] = stripPrefix;
  exports["contains"] = contains;
  exports["indexOf"] = indexOf;
  exports["singleton"] = $foreign.singleton;
  exports["length"] = $foreign.length;
  exports["drop"] = $foreign.drop;
})(PS["Data.String.CodeUnits"] = PS["Data.String.CodeUnits"] || {});
(function(exports) {
    "use strict";

  exports.split = function (sep) {
    return function (s) {
      return s.split(sep);
    };
  };

  exports.toLower = function (s) {
    return s.toLowerCase();
  };

  exports.joinWith = function (s) {
    return function (xs) {
      return xs.join(s);
    };
  };
})(PS["Data.String.Common"] = PS["Data.String.Common"] || {});
(function(exports) {
  // Generated by purs version 0.12.0
  "use strict";
  var $foreign = PS["Data.String.Common"];
  var Data_Eq = PS["Data.Eq"];
  var Data_Ordering = PS["Data.Ordering"];
  var Data_String_Pattern = PS["Data.String.Pattern"];
  var Prelude = PS["Prelude"];
  exports["split"] = $foreign.split;
  exports["toLower"] = $foreign.toLower;
  exports["joinWith"] = $foreign.joinWith;
})(PS["Data.String.Common"] = PS["Data.String.Common"] || {});
(function(exports) {
  // Generated by purs version 0.12.0
  "use strict";
  var $foreign = PS["Data.String.CodePoints"];
  var Control_Semigroupoid = PS["Control.Semigroupoid"];
  var Data_Array = PS["Data.Array"];
  var Data_Boolean = PS["Data.Boolean"];
  var Data_Bounded = PS["Data.Bounded"];
  var Data_Enum = PS["Data.Enum"];
  var Data_Eq = PS["Data.Eq"];
  var Data_EuclideanRing = PS["Data.EuclideanRing"];
  var Data_Functor = PS["Data.Functor"];
  var Data_HeytingAlgebra = PS["Data.HeytingAlgebra"];
  var Data_Int = PS["Data.Int"];
  var Data_Maybe = PS["Data.Maybe"];
  var Data_Ord = PS["Data.Ord"];
  var Data_Ring = PS["Data.Ring"];
  var Data_Semigroup = PS["Data.Semigroup"];
  var Data_Semiring = PS["Data.Semiring"];
  var Data_Show = PS["Data.Show"];
  var Data_String_CodeUnits = PS["Data.String.CodeUnits"];
  var Data_String_Common = PS["Data.String.Common"];
  var Data_String_Pattern = PS["Data.String.Pattern"];
  var Data_String_Unsafe = PS["Data.String.Unsafe"];
  var Data_Tuple = PS["Data.Tuple"];
  var Data_Unfoldable = PS["Data.Unfoldable"];
  var Prelude = PS["Prelude"];
  var unsurrogate = function (lead) {
      return function (trail) {
          return (((lead - 55296 | 0) * 1024 | 0) + (trail - 56320 | 0) | 0) + 65536 | 0;
      };
  }; 
  var isTrail = function (cu) {
      return 56320 <= cu && cu <= 57343;
  };
  var isLead = function (cu) {
      return 55296 <= cu && cu <= 56319;
  };
  var uncons = function (s) {
      var v = Data_String_CodeUnits.length(s);
      if (v === 0) {
          return Data_Maybe.Nothing.value;
      };
      if (v === 1) {
          return new Data_Maybe.Just({
              head: Data_Enum.fromEnum(Data_Enum.boundedEnumChar)(Data_String_Unsafe.charAt(0)(s)),
              tail: ""
          });
      };
      var cu1 = Data_Enum.fromEnum(Data_Enum.boundedEnumChar)(Data_String_Unsafe.charAt(1)(s));
      var cu0 = Data_Enum.fromEnum(Data_Enum.boundedEnumChar)(Data_String_Unsafe.charAt(0)(s));
      var $21 = isLead(cu0) && isTrail(cu1);
      if ($21) {
          return new Data_Maybe.Just({
              head: unsurrogate(cu0)(cu1),
              tail: Data_String_CodeUnits.drop(2)(s)
          });
      };
      return new Data_Maybe.Just({
          head: cu0,
          tail: Data_String_CodeUnits.drop(1)(s)
      });
  };
  var unconsButWithTuple = function (s) {
      return Data_Functor.map(Data_Maybe.functorMaybe)(function (v) {
          return new Data_Tuple.Tuple(v.head, v.tail);
      })(uncons(s));
  };
  var toCodePointArrayFallback = function (s) {
      return Data_Unfoldable.unfoldr(Data_Unfoldable.unfoldableArray)(unconsButWithTuple)(s);
  };
  var unsafeCodePointAt0Fallback = function (s) {
      var cu1 = Data_Enum.fromEnum(Data_Enum.boundedEnumChar)(Data_String_Unsafe.charAt(1)(s));
      var cu0 = Data_Enum.fromEnum(Data_Enum.boundedEnumChar)(Data_String_Unsafe.charAt(0)(s));
      var $25 = isLead(cu0) && isTrail(cu1);
      if ($25) {
          return unsurrogate(cu0)(cu1);
      };
      return cu0;
  };
  var unsafeCodePointAt0 = $foreign._unsafeCodePointAt0(unsafeCodePointAt0Fallback);
  var toCodePointArray = $foreign._toCodePointArray(toCodePointArrayFallback)(unsafeCodePointAt0);
  var length = function ($51) {
      return Data_Array.length(toCodePointArray($51));
  };
  var fromCharCode = function ($52) {
      return Data_String_CodeUnits.singleton(Data_Enum.toEnumWithDefaults(Data_Enum.boundedEnumChar)(Data_Bounded.bottom(Data_Bounded.boundedChar))(Data_Bounded.top(Data_Bounded.boundedChar))($52));
  };
  var singletonFallback = function (v) {
      if (v <= 65535) {
          return fromCharCode(v);
      };
      var lead = Data_EuclideanRing.div(Data_EuclideanRing.euclideanRingInt)(v - 65536 | 0)(1024) + 55296 | 0;
      var trail = Data_EuclideanRing.mod(Data_EuclideanRing.euclideanRingInt)(v - 65536 | 0)(1024) + 56320 | 0;
      return fromCharCode(lead) + fromCharCode(trail);
  };                                                                       
  var singleton = $foreign._singleton(singletonFallback);
  var takeFallback = function (n) {
      return function (v) {
          if (n < 1) {
              return "";
          };
          var v1 = uncons(v);
          if (v1 instanceof Data_Maybe.Just) {
              return singleton(v1.value0.head) + takeFallback(n - 1 | 0)(v1.value0.tail);
          };
          return v;
      };
  };
  var take = $foreign._take(takeFallback);
  var drop = function (n) {
      return function (s) {
          return Data_String_CodeUnits.drop(Data_String_CodeUnits.length(take(n)(s)))(s);
      };
  };
  exports["singleton"] = singleton;
  exports["toCodePointArray"] = toCodePointArray;
  exports["uncons"] = uncons;
  exports["length"] = length;
  exports["take"] = take;
  exports["drop"] = drop;
})(PS["Data.String.CodePoints"] = PS["Data.String.CodePoints"] || {});
(function(exports) {
    "use strict";

  exports["regex'"] = function (left) {
    return function (right) {
      return function (s1) {
        return function (s2) {
          try {
            return right(new RegExp(s1, s2));
          } catch (e) {
            return left(e.message);
          }
        };
      };
    };
  };

  exports._match = function (just) {
    return function (nothing) {
      return function (r) {
        return function (s) {
          var m = s.match(r);
          if (m == null || m.length === 0) {
            return nothing;
          } else {
            for (var i = 0; i < m.length; i++) {
              m[i] = m[i] == null ? nothing : just(m[i]);
            }
            return just(m);
          }
        };
      };
    };
  };
})(PS["Data.String.Regex"] = PS["Data.String.Regex"] || {});
(function(exports) {
  // Generated by purs version 0.12.0
  "use strict";
  var Control_MonadPlus = PS["Control.MonadPlus"];
  var Control_MonadZero = PS["Control.MonadZero"];
  var Data_Eq = PS["Data.Eq"];
  var Data_Functor = PS["Data.Functor"];
  var Data_HeytingAlgebra = PS["Data.HeytingAlgebra"];
  var Data_Monoid = PS["Data.Monoid"];
  var Data_Semigroup = PS["Data.Semigroup"];
  var Data_Show = PS["Data.Show"];
  var Data_String = PS["Data.String"];
  var Data_String_Common = PS["Data.String.Common"];
  var Prelude = PS["Prelude"];                 
  var RegexFlags = (function () {
      function RegexFlags(value0) {
          this.value0 = value0;
      };
      RegexFlags.create = function (value0) {
          return new RegexFlags(value0);
      };
      return RegexFlags;
  })();
  exports["RegexFlags"] = RegexFlags;
})(PS["Data.String.Regex.Flags"] = PS["Data.String.Regex.Flags"] || {});
(function(exports) {
  // Generated by purs version 0.12.0
  "use strict";
  var $foreign = PS["Data.String.Regex"];
  var Control_Semigroupoid = PS["Control.Semigroupoid"];
  var Data_Array_NonEmpty = PS["Data.Array.NonEmpty"];
  var Data_Either = PS["Data.Either"];
  var Data_Function = PS["Data.Function"];
  var Data_Maybe = PS["Data.Maybe"];
  var Data_Semigroup = PS["Data.Semigroup"];
  var Data_Show = PS["Data.Show"];
  var Data_String = PS["Data.String"];
  var Data_String_CodeUnits = PS["Data.String.CodeUnits"];
  var Data_String_Pattern = PS["Data.String.Pattern"];
  var Data_String_Regex_Flags = PS["Data.String.Regex.Flags"];
  var Prelude = PS["Prelude"];                                                    
  var renderFlags = function (v) {
      return (function () {
          if (v.value0.global) {
              return "g";
          };
          return "";
      })() + ((function () {
          if (v.value0.ignoreCase) {
              return "i";
          };
          return "";
      })() + ((function () {
          if (v.value0.multiline) {
              return "m";
          };
          return "";
      })() + ((function () {
          if (v.value0.sticky) {
              return "y";
          };
          return "";
      })() + (function () {
          if (v.value0.unicode) {
              return "u";
          };
          return "";
      })())));
  };
  var regex = function (s) {
      return function (f) {
          return $foreign["regex'"](Data_Either.Left.create)(Data_Either.Right.create)(s)(renderFlags(f));
      };
  };
  var parseFlags = function (s) {
      return new Data_String_Regex_Flags.RegexFlags({
          global: Data_String_CodeUnits.contains("g")(s),
          ignoreCase: Data_String_CodeUnits.contains("i")(s),
          multiline: Data_String_CodeUnits.contains("m")(s),
          sticky: Data_String_CodeUnits.contains("y")(s),
          unicode: Data_String_CodeUnits.contains("u")(s)
      });
  };
  var match = $foreign._match(Data_Maybe.Just.create)(Data_Maybe.Nothing.value);
  exports["regex"] = regex;
  exports["renderFlags"] = renderFlags;
  exports["parseFlags"] = parseFlags;
  exports["match"] = match;
})(PS["Data.String.Regex"] = PS["Data.String.Regex"] || {});
(function(exports) {
  // Generated by purs version 0.12.0
  "use strict";
  var Control_Applicative = PS["Control.Applicative"];
  var Control_Bind = PS["Control.Bind"];
  var Control_Semigroupoid = PS["Control.Semigroupoid"];
  var Data_Array_NonEmpty = PS["Data.Array.NonEmpty"];
  var Data_Boolean = PS["Data.Boolean"];
  var Data_Either = PS["Data.Either"];
  var Data_Eq = PS["Data.Eq"];
  var Data_EuclideanRing = PS["Data.EuclideanRing"];
  var Data_Foldable = PS["Data.Foldable"];
  var Data_Function = PS["Data.Function"];
  var Data_Functor = PS["Data.Functor"];
  var Data_HeytingAlgebra = PS["Data.HeytingAlgebra"];
  var Data_Int = PS["Data.Int"];
  var Data_Int_Bits = PS["Data.Int.Bits"];
  var Data_Maybe = PS["Data.Maybe"];
  var Data_Ord = PS["Data.Ord"];
  var Data_Ring = PS["Data.Ring"];
  var Data_Semigroup = PS["Data.Semigroup"];
  var Data_Semiring = PS["Data.Semiring"];
  var Data_Show = PS["Data.Show"];
  var Data_String = PS["Data.String"];
  var Data_String_CodePoints = PS["Data.String.CodePoints"];
  var Data_String_Regex = PS["Data.String.Regex"];
  var $$Math = PS["Math"];
  var Partial_Unsafe = PS["Partial.Unsafe"];
  var Prelude = PS["Prelude"];
  var HSLA = (function () {
      function HSLA(value0, value1, value2, value3) {
          this.value0 = value0;
          this.value1 = value1;
          this.value2 = value2;
          this.value3 = value3;
      };
      HSLA.create = function (value0) {
          return function (value1) {
              return function (value2) {
                  return function (value3) {
                      return new HSLA(value0, value1, value2, value3);
                  };
              };
          };
      };
      return HSLA;
  })();
  var modPos = function (x) {
      return function (y) {
          return $$Math.remainder($$Math.remainder(x)(y) + y)(y);
      };
  };
  var rgba = function (red$prime) {
      return function (green$prime) {
          return function (blue$prime) {
              return function (alpha) {
                  var red = Data_Ord.clamp(Data_Ord.ordInt)(0)(255)(red$prime);
                  var r = Data_Int.toNumber(red) / 255.0;
                  var green = Data_Ord.clamp(Data_Ord.ordInt)(0)(255)(green$prime);
                  var g = Data_Int.toNumber(green) / 255.0;
                  var blue = Data_Ord.clamp(Data_Ord.ordInt)(0)(255)(blue$prime);
                  var maxChroma = Data_Ord.max(Data_Ord.ordInt)(Data_Ord.max(Data_Ord.ordInt)(red)(green))(blue);
                  var minChroma = Data_Ord.min(Data_Ord.ordInt)(Data_Ord.min(Data_Ord.ordInt)(red)(green))(blue);
                  var chroma = maxChroma - minChroma | 0;
                  var chroma$prime = Data_Int.toNumber(chroma) / 255.0;
                  var lightness = Data_Int.toNumber(maxChroma + minChroma | 0) / (255.0 * 2.0);
                  var saturation = (function () {
                      if (chroma === 0) {
                          return 0.0;
                      };
                      if (Data_Boolean.otherwise) {
                          return chroma$prime / (1.0 - $$Math.abs(2.0 * lightness - 1.0));
                      };
                      throw new Error("Failed pattern match at Color line 157, column 5 - line 158, column 75: " + [  ]);
                  })();
                  var b = Data_Int.toNumber(blue) / 255.0;
                  var hue$prime = function (v) {
                      if (v === 0) {
                          return 0.0;
                      };
                      if (maxChroma === red) {
                          return modPos((g - b) / chroma$prime)(6.0);
                      };
                      if (maxChroma === green) {
                          return (b - r) / chroma$prime + 2.0;
                      };
                      if (Data_Boolean.otherwise) {
                          return (r - g) / chroma$prime + 4.0;
                      };
                      throw new Error("Failed pattern match at Color line 148, column 5 - line 149, column 5: " + [ v.constructor.name ]);
                  };
                  var hue = 60.0 * hue$prime(chroma);
                  return new HSLA(hue, saturation, lightness, alpha);
              };
          };
      };
  };
  var rgb = function (r) {
      return function (g) {
          return function (b) {
              return rgba(r)(g)(b)(1.0);
          };
      };
  };
  var hsla = function (h) {
      return function (s) {
          return function (l) {
              return function (a) {
                  var s$prime = Data_Ord.clamp(Data_Ord.ordNumber)(0.0)(1.0)(s);
                  var l$prime = Data_Ord.clamp(Data_Ord.ordNumber)(0.0)(1.0)(l);
                  var a$prime = Data_Ord.clamp(Data_Ord.ordNumber)(0.0)(1.0)(a);
                  return new HSLA(h, s$prime, l$prime, a$prime);
              };
          };
      };
  };
  var hsl = function (h) {
      return function (s) {
          return function (l) {
              return hsla(h)(s)(l)(1.0);
          };
      };
  };
  var white = hsl(0.0)(0.0)(1.0);
  var fromInt = function (m) {
      var n = Data_Ord.clamp(Data_Ord.ordInt)(0)(16777215)(m);
      var r = n >> 16 & 255;
      var g = n >> 8 & 255;
      var b = n & 255;
      return rgb(r)(g)(b);
  };
  var fromHexString = function (str) {
      var parseHex = function ($111) {
          return Data_Maybe.fromMaybe(0)(Data_Int.fromStringAs(Data_Int.hexadecimal)($111));
      };
      var isShort = Data_String_CodePoints.length(str) === 4;
      var hush = Data_Either.either(Data_Function["const"](Data_Maybe.Nothing.value))(Data_Maybe.Just.create);
      var pair = "(" + ("[0-9a-f]" + ("[0-9a-f]" + ")"));
      var single = "(" + ("[0-9a-f]" + ")");
      var variant = (function () {
          if (isShort) {
              return single + (single + single);
          };
          return pair + (pair + pair);
      })();
      var mPattern = Data_String_Regex.regex("^#(?:" + (variant + ")$"))(Data_String_Regex.parseFlags("i"));
      return Control_Bind.bind(Data_Maybe.bindMaybe)(hush(mPattern))(function (v) {
          return Control_Bind.bind(Data_Maybe.bindMaybe)(Data_String_Regex.match(v)(str))(function (v1) {
              return Control_Bind.bind(Data_Maybe.bindMaybe)(Data_Functor.map(Data_Maybe.functorMaybe)(parseHex)(Control_Bind.join(Data_Maybe.bindMaybe)(Data_Array_NonEmpty.index(v1)(1))))(function (v2) {
                  return Control_Bind.bind(Data_Maybe.bindMaybe)(Data_Functor.map(Data_Maybe.functorMaybe)(parseHex)(Control_Bind.join(Data_Maybe.bindMaybe)(Data_Array_NonEmpty.index(v1)(2))))(function (v3) {
                      return Control_Bind.bind(Data_Maybe.bindMaybe)(Data_Functor.map(Data_Maybe.functorMaybe)(parseHex)(Control_Bind.join(Data_Maybe.bindMaybe)(Data_Array_NonEmpty.index(v1)(3))))(function (v4) {
                          if (isShort) {
                              return Control_Applicative.pure(Data_Maybe.applicativeMaybe)(rgb((16 * v2 | 0) + v2 | 0)((16 * v3 | 0) + v3 | 0)((16 * v4 | 0) + v4 | 0));
                          };
                          return Control_Applicative.pure(Data_Maybe.applicativeMaybe)(rgb(v2)(v3)(v4));
                      });
                  });
              });
          });
      });
  };
  var cssStringHSLA = function (v) {
      var toString = function (n) {
          return Data_Show.show(Data_Show.showNumber)(Data_Int.toNumber(Data_Int.round(100.0 * n)) / 100.0);
      };
      var saturation = toString(v.value1 * 100.0) + "%";
      var lightness = toString(v.value2 * 100.0) + "%";
      var hue = toString(v.value0);
      var alpha = Data_Show.show(Data_Show.showNumber)(v.value3);
      var $69 = v.value3 === 1.0;
      if ($69) {
          return "hsl(" + (hue + (", " + (saturation + (", " + (lightness + ")")))));
      };
      return "hsla(" + (hue + (", " + (saturation + (", " + (lightness + (", " + (alpha + ")")))))));
  };
  var black = hsl(0.0)(0.0)(0.0);
  exports["rgba"] = rgba;
  exports["rgb"] = rgb;
  exports["hsla"] = hsla;
  exports["hsl"] = hsl;
  exports["fromHexString"] = fromHexString;
  exports["fromInt"] = fromInt;
  exports["cssStringHSLA"] = cssStringHSLA;
  exports["black"] = black;
  exports["white"] = white;
})(PS["Color"] = PS["Color"] || {});
(function(exports) {
  // Generated by purs version 0.12.0
  "use strict";
  var Color = PS["Color"];             
  var red = Color.fromInt(16728374); 
  var gray = Color.fromInt(11184810);
  exports["red"] = red;
  exports["gray"] = gray;
})(PS["Color.Scheme.Clrs"] = PS["Color.Scheme.Clrs"] || {});
(function(exports) {
  // Generated by purs version 0.12.0
  "use strict";
  var Color = PS["Color"];                  
  var lightgray = Color.rgb(211)(211)(211);
  exports["lightgray"] = lightgray;
})(PS["Color.Scheme.X11"] = PS["Color.Scheme.X11"] || {});
(function(exports) {
  // Generated by purs version 0.12.0
  "use strict";
  var Control_Applicative = PS["Control.Applicative"];
  var Control_Bind = PS["Control.Bind"];
  var Control_Semigroupoid = PS["Control.Semigroupoid"];
  var Data_Either = PS["Data.Either"];
  var Data_Function = PS["Data.Function"];
  var Data_Functor = PS["Data.Functor"];
  var Data_Maybe = PS["Data.Maybe"];
  var Data_Unit = PS["Data.Unit"];
  var Prelude = PS["Prelude"];                 
  var MonadThrow = function (Monad0, throwError) {
      this.Monad0 = Monad0;
      this.throwError = throwError;
  };
  var throwError = function (dict) {
      return dict.throwError;
  };
  exports["throwError"] = throwError;
  exports["MonadThrow"] = MonadThrow;
})(PS["Control.Monad.Error.Class"] = PS["Control.Monad.Error.Class"] || {});
(function(exports) {
  // Generated by purs version 0.12.0
  "use strict";
  var Data_Tuple = PS["Data.Tuple"];
  var Data_Unit = PS["Data.Unit"];
  var Prelude = PS["Prelude"];                 
  var MonadState = function (Monad0, state) {
      this.Monad0 = Monad0;
      this.state = state;
  };
  var state = function (dict) {
      return dict.state;
  };
  var modify_ = function (dictMonadState) {
      return function (f) {
          return state(dictMonadState)(function (s) {
              return new Data_Tuple.Tuple(Data_Unit.unit, f(s));
          });
      };
  };
  var get = function (dictMonadState) {
      return state(dictMonadState)(function (s) {
          return new Data_Tuple.Tuple(s, s);
      });
  };
  exports["state"] = state;
  exports["MonadState"] = MonadState;
  exports["get"] = get;
  exports["modify_"] = modify_;
})(PS["Control.Monad.State.Class"] = PS["Control.Monad.State.Class"] || {});
(function(exports) {
    "use strict";

  exports.pureE = function (a) {
    return function () {
      return a;
    };
  };

  exports.bindE = function (a) {
    return function (f) {
      return function () {
        return f(a())();
      };
    };
  };
})(PS["Effect"] = PS["Effect"] || {});
(function(exports) {
  // Generated by purs version 0.12.0
  "use strict";
  var $foreign = PS["Effect"];
  var Control_Applicative = PS["Control.Applicative"];
  var Control_Apply = PS["Control.Apply"];
  var Control_Bind = PS["Control.Bind"];
  var Control_Monad = PS["Control.Monad"];
  var Data_Functor = PS["Data.Functor"];
  var Data_Monoid = PS["Data.Monoid"];
  var Data_Semigroup = PS["Data.Semigroup"];
  var Prelude = PS["Prelude"];                 
  var monadEffect = new Control_Monad.Monad(function () {
      return applicativeEffect;
  }, function () {
      return bindEffect;
  });
  var bindEffect = new Control_Bind.Bind(function () {
      return applyEffect;
  }, $foreign.bindE);
  var applyEffect = new Control_Apply.Apply(function () {
      return functorEffect;
  }, Control_Monad.ap(monadEffect));
  var applicativeEffect = new Control_Applicative.Applicative(function () {
      return applyEffect;
  }, $foreign.pureE);
  var functorEffect = new Data_Functor.Functor(Control_Applicative.liftA1(applicativeEffect));
  exports["functorEffect"] = functorEffect;
  exports["applyEffect"] = applyEffect;
  exports["applicativeEffect"] = applicativeEffect;
  exports["bindEffect"] = bindEffect;
  exports["monadEffect"] = monadEffect;
})(PS["Effect"] = PS["Effect"] || {});
(function(exports) {
  // Generated by purs version 0.12.0
  "use strict";
  var Control_Category = PS["Control.Category"];
  var Control_Monad = PS["Control.Monad"];
  var Effect = PS["Effect"];                 
  var MonadEffect = function (Monad0, liftEffect) {
      this.Monad0 = Monad0;
      this.liftEffect = liftEffect;
  };
  var monadEffectEffect = new MonadEffect(function () {
      return Effect.monadEffect;
  }, Control_Category.identity(Control_Category.categoryFn));
  var liftEffect = function (dict) {
      return dict.liftEffect;
  };
  exports["liftEffect"] = liftEffect;
  exports["MonadEffect"] = MonadEffect;
  exports["monadEffectEffect"] = monadEffectEffect;
})(PS["Effect.Class"] = PS["Effect.Class"] || {});
(function(exports) {
  // Generated by purs version 0.12.0
  "use strict";
  var Control_Alt = PS["Control.Alt"];
  var Control_Alternative = PS["Control.Alternative"];
  var Control_Applicative = PS["Control.Applicative"];
  var Control_Apply = PS["Control.Apply"];
  var Control_Bind = PS["Control.Bind"];
  var Control_Category = PS["Control.Category"];
  var Control_Monad = PS["Control.Monad"];
  var Control_Monad_Cont_Class = PS["Control.Monad.Cont.Class"];
  var Control_Monad_Error_Class = PS["Control.Monad.Error.Class"];
  var Control_Monad_Reader_Class = PS["Control.Monad.Reader.Class"];
  var Control_Monad_Rec_Class = PS["Control.Monad.Rec.Class"];
  var Control_Monad_State_Class = PS["Control.Monad.State.Class"];
  var Control_Monad_Trans_Class = PS["Control.Monad.Trans.Class"];
  var Control_Monad_Writer_Class = PS["Control.Monad.Writer.Class"];
  var Control_MonadPlus = PS["Control.MonadPlus"];
  var Control_MonadZero = PS["Control.MonadZero"];
  var Control_Plus = PS["Control.Plus"];
  var Control_Semigroupoid = PS["Control.Semigroupoid"];
  var Data_Either = PS["Data.Either"];
  var Data_Function = PS["Data.Function"];
  var Data_Functor = PS["Data.Functor"];
  var Data_Monoid = PS["Data.Monoid"];
  var Data_Newtype = PS["Data.Newtype"];
  var Data_Semigroup = PS["Data.Semigroup"];
  var Data_Tuple = PS["Data.Tuple"];
  var Effect_Class = PS["Effect.Class"];
  var Prelude = PS["Prelude"];                 
  var ExceptT = function (x) {
      return x;
  };
  var withExceptT = function (dictFunctor) {
      return function (f) {
          return function (v) {
              var mapLeft = function (v1) {
                  return function (v2) {
                      if (v2 instanceof Data_Either.Right) {
                          return new Data_Either.Right(v2.value0);
                      };
                      if (v2 instanceof Data_Either.Left) {
                          return new Data_Either.Left(v1(v2.value0));
                      };
                      throw new Error("Failed pattern match at Control.Monad.Except.Trans line 42, column 3 - line 42, column 32: " + [ v1.constructor.name, v2.constructor.name ]);
                  };
              };
              return ExceptT(Data_Functor.map(dictFunctor)(mapLeft(f))(v));
          };
      };
  };
  var runExceptT = function (v) {
      return v;
  }; 
  var mapExceptT = function (f) {
      return function (v) {
          return f(v);
      };
  };
  var functorExceptT = function (dictFunctor) {
      return new Data_Functor.Functor(function (f) {
          return mapExceptT(Data_Functor.map(dictFunctor)(Data_Functor.map(Data_Either.functorEither)(f)));
      });
  };
  var except = function (dictApplicative) {
      return function ($96) {
          return ExceptT(Control_Applicative.pure(dictApplicative)($96));
      };
  };
  var monadExceptT = function (dictMonad) {
      return new Control_Monad.Monad(function () {
          return applicativeExceptT(dictMonad);
      }, function () {
          return bindExceptT(dictMonad);
      });
  };
  var bindExceptT = function (dictMonad) {
      return new Control_Bind.Bind(function () {
          return applyExceptT(dictMonad);
      }, function (v) {
          return function (k) {
              return Control_Bind.bind(dictMonad.Bind1())(v)(Data_Either.either(function ($97) {
                  return Control_Applicative.pure(dictMonad.Applicative0())(Data_Either.Left.create($97));
              })(function (a) {
                  var v1 = k(a);
                  return v1;
              }));
          };
      });
  };
  var applyExceptT = function (dictMonad) {
      return new Control_Apply.Apply(function () {
          return functorExceptT(((dictMonad.Bind1()).Apply0()).Functor0());
      }, Control_Monad.ap(monadExceptT(dictMonad)));
  };
  var applicativeExceptT = function (dictMonad) {
      return new Control_Applicative.Applicative(function () {
          return applyExceptT(dictMonad);
      }, function ($98) {
          return ExceptT(Control_Applicative.pure(dictMonad.Applicative0())(Data_Either.Right.create($98)));
      });
  };
  var monadThrowExceptT = function (dictMonad) {
      return new Control_Monad_Error_Class.MonadThrow(function () {
          return monadExceptT(dictMonad);
      }, function ($102) {
          return ExceptT(Control_Applicative.pure(dictMonad.Applicative0())(Data_Either.Left.create($102)));
      });
  };
  exports["ExceptT"] = ExceptT;
  exports["runExceptT"] = runExceptT;
  exports["withExceptT"] = withExceptT;
  exports["mapExceptT"] = mapExceptT;
  exports["except"] = except;
  exports["functorExceptT"] = functorExceptT;
  exports["applyExceptT"] = applyExceptT;
  exports["applicativeExceptT"] = applicativeExceptT;
  exports["bindExceptT"] = bindExceptT;
  exports["monadExceptT"] = monadExceptT;
  exports["monadThrowExceptT"] = monadThrowExceptT;
})(PS["Control.Monad.Except.Trans"] = PS["Control.Monad.Except.Trans"] || {});
(function(exports) {
  // Generated by purs version 0.12.0
  "use strict";
  var Control_Alt = PS["Control.Alt"];
  var Control_Applicative = PS["Control.Applicative"];
  var Control_Apply = PS["Control.Apply"];
  var Control_Bind = PS["Control.Bind"];
  var Control_Comonad = PS["Control.Comonad"];
  var Control_Extend = PS["Control.Extend"];
  var Control_Lazy = PS["Control.Lazy"];
  var Control_Monad = PS["Control.Monad"];
  var Data_BooleanAlgebra = PS["Data.BooleanAlgebra"];
  var Data_Bounded = PS["Data.Bounded"];
  var Data_CommutativeRing = PS["Data.CommutativeRing"];
  var Data_Eq = PS["Data.Eq"];
  var Data_EuclideanRing = PS["Data.EuclideanRing"];
  var Data_Foldable = PS["Data.Foldable"];
  var Data_Functor = PS["Data.Functor"];
  var Data_Functor_Invariant = PS["Data.Functor.Invariant"];
  var Data_HeytingAlgebra = PS["Data.HeytingAlgebra"];
  var Data_Monoid = PS["Data.Monoid"];
  var Data_Newtype = PS["Data.Newtype"];
  var Data_Ord = PS["Data.Ord"];
  var Data_Ring = PS["Data.Ring"];
  var Data_Semigroup = PS["Data.Semigroup"];
  var Data_Semiring = PS["Data.Semiring"];
  var Data_Show = PS["Data.Show"];
  var Data_Traversable = PS["Data.Traversable"];
  var Prelude = PS["Prelude"];                 
  var Identity = function (x) {
      return x;
  };
  var newtypeIdentity = new Data_Newtype.Newtype(function (n) {
      return n;
  }, Identity);
  var functorIdentity = new Data_Functor.Functor(function (f) {
      return function (m) {
          return f(m);
      };
  });
  var applyIdentity = new Control_Apply.Apply(function () {
      return functorIdentity;
  }, function (v) {
      return function (v1) {
          return v(v1);
      };
  });
  var bindIdentity = new Control_Bind.Bind(function () {
      return applyIdentity;
  }, function (v) {
      return function (f) {
          return f(v);
      };
  });
  var applicativeIdentity = new Control_Applicative.Applicative(function () {
      return applyIdentity;
  }, Identity);
  var monadIdentity = new Control_Monad.Monad(function () {
      return applicativeIdentity;
  }, function () {
      return bindIdentity;
  });
  exports["Identity"] = Identity;
  exports["newtypeIdentity"] = newtypeIdentity;
  exports["functorIdentity"] = functorIdentity;
  exports["applyIdentity"] = applyIdentity;
  exports["applicativeIdentity"] = applicativeIdentity;
  exports["bindIdentity"] = bindIdentity;
  exports["monadIdentity"] = monadIdentity;
})(PS["Data.Identity"] = PS["Data.Identity"] || {});
(function(exports) {
  // Generated by purs version 0.12.0
  "use strict";
  var Control_Monad_Error_Class = PS["Control.Monad.Error.Class"];
  var Control_Monad_Except_Trans = PS["Control.Monad.Except.Trans"];
  var Control_Semigroupoid = PS["Control.Semigroupoid"];
  var Data_Either = PS["Data.Either"];
  var Data_Identity = PS["Data.Identity"];
  var Data_Newtype = PS["Data.Newtype"];
  var Prelude = PS["Prelude"];                 
  var withExcept = Control_Monad_Except_Trans.withExceptT(Data_Identity.functorIdentity);
  var runExcept = function ($0) {
      return Data_Newtype.unwrap(Data_Identity.newtypeIdentity)(Control_Monad_Except_Trans.runExceptT($0));
  };
  var mapExcept = function (f) {
      return Control_Monad_Except_Trans.mapExceptT(function ($1) {
          return Data_Identity.Identity(f(Data_Newtype.unwrap(Data_Identity.newtypeIdentity)($1)));
      });
  };
  exports["runExcept"] = runExcept;
  exports["mapExcept"] = mapExcept;
  exports["withExcept"] = withExcept;
})(PS["Control.Monad.Except"] = PS["Control.Monad.Except"] || {});
(function(exports) {
  // Generated by purs version 0.12.0
  "use strict";
  var Control_Alt = PS["Control.Alt"];
  var Control_Alternative = PS["Control.Alternative"];
  var Control_Applicative = PS["Control.Applicative"];
  var Control_Apply = PS["Control.Apply"];
  var Control_Bind = PS["Control.Bind"];
  var Control_Lazy = PS["Control.Lazy"];
  var Control_Monad = PS["Control.Monad"];
  var Control_Monad_Cont_Class = PS["Control.Monad.Cont.Class"];
  var Control_Monad_Error_Class = PS["Control.Monad.Error.Class"];
  var Control_Monad_Reader_Class = PS["Control.Monad.Reader.Class"];
  var Control_Monad_Rec_Class = PS["Control.Monad.Rec.Class"];
  var Control_Monad_State_Class = PS["Control.Monad.State.Class"];
  var Control_Monad_Trans_Class = PS["Control.Monad.Trans.Class"];
  var Control_Monad_Writer_Class = PS["Control.Monad.Writer.Class"];
  var Control_MonadPlus = PS["Control.MonadPlus"];
  var Control_MonadZero = PS["Control.MonadZero"];
  var Control_Plus = PS["Control.Plus"];
  var Control_Semigroupoid = PS["Control.Semigroupoid"];
  var Data_Function = PS["Data.Function"];
  var Data_Functor = PS["Data.Functor"];
  var Data_Newtype = PS["Data.Newtype"];
  var Data_Tuple = PS["Data.Tuple"];
  var Data_Unit = PS["Data.Unit"];
  var Effect_Class = PS["Effect.Class"];
  var Prelude = PS["Prelude"];                 
  var StateT = function (x) {
      return x;
  }; 
  var functorStateT = function (dictFunctor) {
      return new Data_Functor.Functor(function (f) {
          return function (v) {
              return function (s) {
                  return Data_Functor.map(dictFunctor)(function (v1) {
                      return new Data_Tuple.Tuple(f(v1.value0), v1.value1);
                  })(v(s));
              };
          };
      });
  };
  var monadStateT = function (dictMonad) {
      return new Control_Monad.Monad(function () {
          return applicativeStateT(dictMonad);
      }, function () {
          return bindStateT(dictMonad);
      });
  };
  var bindStateT = function (dictMonad) {
      return new Control_Bind.Bind(function () {
          return applyStateT(dictMonad);
      }, function (v) {
          return function (f) {
              return function (s) {
                  return Control_Bind.bind(dictMonad.Bind1())(v(s))(function (v1) {
                      var v3 = f(v1.value0);
                      return v3(v1.value1);
                  });
              };
          };
      });
  };
  var applyStateT = function (dictMonad) {
      return new Control_Apply.Apply(function () {
          return functorStateT(((dictMonad.Bind1()).Apply0()).Functor0());
      }, Control_Monad.ap(monadStateT(dictMonad)));
  };
  var applicativeStateT = function (dictMonad) {
      return new Control_Applicative.Applicative(function () {
          return applyStateT(dictMonad);
      }, function (a) {
          return function (s) {
              return Control_Applicative.pure(dictMonad.Applicative0())(new Data_Tuple.Tuple(a, s));
          };
      });
  };
  var monadStateStateT = function (dictMonad) {
      return new Control_Monad_State_Class.MonadState(function () {
          return monadStateT(dictMonad);
      }, function (f) {
          return StateT(function ($111) {
              return Control_Applicative.pure(dictMonad.Applicative0())(f($111));
          });
      });
  };
  exports["StateT"] = StateT;
  exports["functorStateT"] = functorStateT;
  exports["applyStateT"] = applyStateT;
  exports["applicativeStateT"] = applicativeStateT;
  exports["bindStateT"] = bindStateT;
  exports["monadStateT"] = monadStateT;
  exports["monadStateStateT"] = monadStateStateT;
})(PS["Control.Monad.State.Trans"] = PS["Control.Monad.State.Trans"] || {});
(function(exports) {
  // Generated by purs version 0.12.0
  "use strict";
  var Control_Monad_State_Class = PS["Control.Monad.State.Class"];
  var Control_Monad_State_Trans = PS["Control.Monad.State.Trans"];
  var Control_Semigroupoid = PS["Control.Semigroupoid"];
  var Data_Identity = PS["Data.Identity"];
  var Data_Newtype = PS["Data.Newtype"];
  var Data_Tuple = PS["Data.Tuple"];
  var Prelude = PS["Prelude"];
  var evalState = function (v) {
      return function (s) {
          var v1 = v(s);
          return v1.value0;
      };
  };
  exports["evalState"] = evalState;
})(PS["Control.Monad.State"] = PS["Control.Monad.State"] || {});
(function(exports) {
    "use strict";

  function id(x) {
    return x;
  }                      
  exports.fromObject = id;

  exports.stringify = function (j) {
    return JSON.stringify(j);
  };                        

  function isArray(a) {
    return objToString.call(a) === "[object Array]";
  }
})(PS["Data.Argonaut.Core"] = PS["Data.Argonaut.Core"] || {});
(function(exports) {
    "use strict";

  exports.empty = {};

  function toArrayWithKey(f) {
    return function (m) {
      var r = [];
      for (var k in m) {
        if (hasOwnProperty.call(m, k)) {
          r.push(f(k)(m[k]));
        }
      }
      return r;
    };
  }
})(PS["Foreign.Object"] = PS["Foreign.Object"] || {});
(function(exports) {
  // Generated by purs version 0.12.0
  "use strict";
  var $foreign = PS["Foreign.Object"];
  var Control_Applicative = PS["Control.Applicative"];
  var Control_Apply = PS["Control.Apply"];
  var Control_Bind = PS["Control.Bind"];
  var Control_Category = PS["Control.Category"];
  var Control_Monad_ST = PS["Control.Monad.ST"];
  var Control_Monad_ST_Internal = PS["Control.Monad.ST.Internal"];
  var Control_Semigroupoid = PS["Control.Semigroupoid"];
  var Data_Array = PS["Data.Array"];
  var Data_Eq = PS["Data.Eq"];
  var Data_Foldable = PS["Data.Foldable"];
  var Data_FoldableWithIndex = PS["Data.FoldableWithIndex"];
  var Data_Function = PS["Data.Function"];
  var Data_Function_Uncurried = PS["Data.Function.Uncurried"];
  var Data_Functor = PS["Data.Functor"];
  var Data_FunctorWithIndex = PS["Data.FunctorWithIndex"];
  var Data_HeytingAlgebra = PS["Data.HeytingAlgebra"];
  var Data_Maybe = PS["Data.Maybe"];
  var Data_Monoid = PS["Data.Monoid"];
  var Data_Ord = PS["Data.Ord"];
  var Data_Semigroup = PS["Data.Semigroup"];
  var Data_Show = PS["Data.Show"];
  var Data_Traversable = PS["Data.Traversable"];
  var Data_TraversableWithIndex = PS["Data.TraversableWithIndex"];
  var Data_Tuple = PS["Data.Tuple"];
  var Data_Unfoldable = PS["Data.Unfoldable"];
  var Foreign_Object_ST = PS["Foreign.Object.ST"];
  var Prelude = PS["Prelude"];
  exports["empty"] = $foreign.empty;
})(PS["Foreign.Object"] = PS["Foreign.Object"] || {});
(function(exports) {
  // Generated by purs version 0.12.0
  "use strict";
  var $foreign = PS["Data.Argonaut.Core"];
  var Data_Eq = PS["Data.Eq"];
  var Data_Function = PS["Data.Function"];
  var Data_Function_Uncurried = PS["Data.Function.Uncurried"];
  var Data_Maybe = PS["Data.Maybe"];
  var Data_Ord = PS["Data.Ord"];
  var Data_Ordering = PS["Data.Ordering"];
  var Foreign_Object = PS["Foreign.Object"];
  var Prelude = PS["Prelude"];                  
  var jsonEmptyObject = $foreign.fromObject(Foreign_Object.empty);
  exports["jsonEmptyObject"] = jsonEmptyObject;
  exports["stringify"] = $foreign.stringify;
})(PS["Data.Argonaut.Core"] = PS["Data.Argonaut.Core"] || {});
(function(exports) {
    "use strict";

  exports._jsonParser = function (fail, succ, s) {
    try {
      return succ(JSON.parse(s));
    }
    catch (e) {
      return fail(e.message);
    }
  };
})(PS["Data.Argonaut.Parser"] = PS["Data.Argonaut.Parser"] || {});
(function(exports) {
  // Generated by purs version 0.12.0
  "use strict";
  var $foreign = PS["Data.Argonaut.Parser"];
  var Data_Argonaut_Core = PS["Data.Argonaut.Core"];
  var Data_Either = PS["Data.Either"];
  var Data_Function_Uncurried = PS["Data.Function.Uncurried"];                 
  var jsonParser = function (j) {
      return $foreign._jsonParser(Data_Either.Left.create, Data_Either.Right.create, j);
  };
  exports["jsonParser"] = jsonParser;
})(PS["Data.Argonaut.Parser"] = PS["Data.Argonaut.Parser"] || {});
(function(exports) {
  var bigInt =require("big-integer"); 

  exports["fromBase'"] = function(just) {
    return function(nothing) {
      return function(b) {
        return function(s) {
          try {
            var x = bigInt(s, b);
            return just(x);
          } catch (err) {
            return nothing;
          }
        };
      };
    };
  };

  function truncate(n) {
    if (n > 0) return Math.floor(n);
    return Math.ceil(n);
  }

  exports["fromNumber'"] = function(just) {
    return function(nothing) {
        return function(n) {
          try {
            var x = bigInt(truncate(n));
            return just(x);
          } catch (err) {
            return nothing;
          }
        };
    };
  };

  exports.fromInt = function(n) {
    return bigInt(n);
  };

  exports.toBase = function(base) {
    return function (x) {
      return x.toString(base);
    };
  };

  exports.toNumber = function(x) {
    return x.toJSNumber();
  };

  exports.biAdd = function(x) {
    return function(y) {
      return x.add(y);
    };
  };

  exports.biMul = function(x) {
    return function(y) {
      return x.multiply(y);
    };
  };

  exports.biSub = function(x) {
    return function(y) {
      return x.minus(y);
    };
  };

  exports.biMod = function(x) {
    return function(y) {
      return x.mod(y);
    };
  };

  exports.biDiv = function(x) {
    return function(y) {
      return x.divide(y);
    };
  };

  exports.biEquals = function(x) {
    return function(y) {
      return x.equals(y);
    };
  };

  exports.biCompare = function(x) {
    return function(y) {
      return x.compare(y);
    };
  };

  exports.abs = function(x) {
    return x.abs();
  };
})(PS["Data.BigInt"] = PS["Data.BigInt"] || {});
(function(exports) {
  // Generated by purs version 0.12.0
  "use strict";
  var $foreign = PS["Data.BigInt"];
  var Control_Semigroupoid = PS["Control.Semigroupoid"];
  var Data_Array_NonEmpty = PS["Data.Array.NonEmpty"];
  var Data_CommutativeRing = PS["Data.CommutativeRing"];
  var Data_Eq = PS["Data.Eq"];
  var Data_EuclideanRing = PS["Data.EuclideanRing"];
  var Data_Function = PS["Data.Function"];
  var Data_Int = PS["Data.Int"];
  var Data_Maybe = PS["Data.Maybe"];
  var Data_Ord = PS["Data.Ord"];
  var Data_Ordering = PS["Data.Ordering"];
  var Data_Ring = PS["Data.Ring"];
  var Data_Semigroup = PS["Data.Semigroup"];
  var Data_Semiring = PS["Data.Semiring"];
  var Data_Show = PS["Data.Show"];
  var Data_String_NonEmpty = PS["Data.String.NonEmpty"];
  var Data_String_NonEmpty_Internal = PS["Data.String.NonEmpty.Internal"];
  var Partial_Unsafe = PS["Partial.Unsafe"];
  var Prelude = PS["Prelude"];                 
  var toString = $foreign.toBase(10);
  var semiringBigInt = new Data_Semiring.Semiring($foreign.biAdd, $foreign.biMul, $foreign.fromInt(1), $foreign.fromInt(0));
  var ringBigInt = new Data_Ring.Ring(function () {
      return semiringBigInt;
  }, $foreign.biSub);       
  var fromNumber = $foreign["fromNumber'"](Data_Maybe.Just.create)(Data_Maybe.Nothing.value);
  var fromBase = $foreign["fromBase'"](Data_Maybe.Just.create)(Data_Maybe.Nothing.value);
  var fromString = fromBase(10);
  var eqBigInt = new Data_Eq.Eq($foreign.biEquals);
  var ordBigInt = new Data_Ord.Ord(function () {
      return eqBigInt;
  }, function (x) {
      return function (y) {
          var v = $foreign.biCompare(x)(y);
          if (v === 1) {
              return Data_Ordering.GT.value;
          };
          if (v === 0) {
              return Data_Ordering.EQ.value;
          };
          return Data_Ordering.LT.value;
      };
  });
  var commutativeRingBigInt = new Data_CommutativeRing.CommutativeRing(function () {
      return ringBigInt;
  });
  var euclideanRingBigInt = new Data_EuclideanRing.EuclideanRing(function () {
      return commutativeRingBigInt;
  }, function ($4) {
      return Data_Int.floor($foreign.toNumber($foreign.abs($4)));
  }, function (x) {
      return function (y) {
          return $foreign.biDiv(Data_Ring.sub(ringBigInt)(x)(Data_EuclideanRing.mod(euclideanRingBigInt)(x)(y)))(y);
      };
  }, function (x) {
      return function (y) {
          var yy = $foreign.abs(y);
          return $foreign.biMod(Data_Semiring.add(semiringBigInt)($foreign.biMod(x)(yy))(yy))(yy);
      };
  });
  exports["fromString"] = fromString;
  exports["fromBase"] = fromBase;
  exports["fromNumber"] = fromNumber;
  exports["toString"] = toString;
  exports["eqBigInt"] = eqBigInt;
  exports["ordBigInt"] = ordBigInt;
  exports["semiringBigInt"] = semiringBigInt;
  exports["ringBigInt"] = ringBigInt;
  exports["commutativeRingBigInt"] = commutativeRingBigInt;
  exports["euclideanRingBigInt"] = euclideanRingBigInt;
  exports["fromInt"] = $foreign.fromInt;
  exports["toNumber"] = $foreign.toNumber;
})(PS["Data.BigInt"] = PS["Data.BigInt"] || {});
(function(exports) {
  // Generated by purs version 0.12.0
  "use strict";
  var Control_Alt = PS["Control.Alt"];
  var Control_Alternative = PS["Control.Alternative"];
  var Control_Applicative = PS["Control.Applicative"];
  var Control_Apply = PS["Control.Apply"];
  var Control_Bind = PS["Control.Bind"];
  var Control_Category = PS["Control.Category"];
  var Control_Comonad = PS["Control.Comonad"];
  var Control_Extend = PS["Control.Extend"];
  var Control_Monad = PS["Control.Monad"];
  var Control_MonadPlus = PS["Control.MonadPlus"];
  var Control_MonadZero = PS["Control.MonadZero"];
  var Control_Plus = PS["Control.Plus"];
  var Control_Semigroupoid = PS["Control.Semigroupoid"];
  var Data_Eq = PS["Data.Eq"];
  var Data_Foldable = PS["Data.Foldable"];
  var Data_FoldableWithIndex = PS["Data.FoldableWithIndex"];
  var Data_Function = PS["Data.Function"];
  var Data_Functor = PS["Data.Functor"];
  var Data_FunctorWithIndex = PS["Data.FunctorWithIndex"];
  var Data_HeytingAlgebra = PS["Data.HeytingAlgebra"];
  var Data_Maybe = PS["Data.Maybe"];
  var Data_Monoid = PS["Data.Monoid"];
  var Data_Newtype = PS["Data.Newtype"];
  var Data_NonEmpty = PS["Data.NonEmpty"];
  var Data_Ord = PS["Data.Ord"];
  var Data_Ordering = PS["Data.Ordering"];
  var Data_Ring = PS["Data.Ring"];
  var Data_Semigroup = PS["Data.Semigroup"];
  var Data_Semigroup_Foldable = PS["Data.Semigroup.Foldable"];
  var Data_Semigroup_Traversable = PS["Data.Semigroup.Traversable"];
  var Data_Semiring = PS["Data.Semiring"];
  var Data_Show = PS["Data.Show"];
  var Data_Traversable = PS["Data.Traversable"];
  var Data_TraversableWithIndex = PS["Data.TraversableWithIndex"];
  var Data_Tuple = PS["Data.Tuple"];
  var Data_Unfoldable = PS["Data.Unfoldable"];
  var Data_Unfoldable1 = PS["Data.Unfoldable1"];
  var Prelude = PS["Prelude"];                 
  var Nil = (function () {
      function Nil() {

      };
      Nil.value = new Nil();
      return Nil;
  })();
  var Cons = (function () {
      function Cons(value0, value1) {
          this.value0 = value0;
          this.value1 = value1;
      };
      Cons.create = function (value0) {
          return function (value1) {
              return new Cons(value0, value1);
          };
      };
      return Cons;
  })();
  var NonEmptyList = function (x) {
      return x;
  };
  var toList = function (v) {
      return new Cons(v.value0, v.value1);
  };
  var foldableList = new Data_Foldable.Foldable(function (dictMonoid) {
      return function (f) {
          return Data_Foldable.foldl(foldableList)(function (acc) {
              return function ($155) {
                  return Data_Semigroup.append(dictMonoid.Semigroup0())(acc)(f($155));
              };
          })(Data_Monoid.mempty(dictMonoid));
      };
  }, function (f) {
      var go = function ($copy_b) {
          return function ($copy_v) {
              var $tco_var_b = $copy_b;
              var $tco_done = false;
              var $tco_result;
              function $tco_loop(b, v) {
                  if (v instanceof Nil) {
                      $tco_done = true;
                      return b;
                  };
                  if (v instanceof Cons) {
                      $tco_var_b = f(b)(v.value0);
                      $copy_v = v.value1;
                      return;
                  };
                  throw new Error("Failed pattern match at Data.List.Types line 81, column 12 - line 83, column 30: " + [ v.constructor.name ]);
              };
              while (!$tco_done) {
                  $tco_result = $tco_loop($tco_var_b, $copy_v);
              };
              return $tco_result;
          };
      };
      return go;
  }, function (f) {
      return function (b) {
          var rev = Data_Foldable.foldl(foldableList)(Data_Function.flip(Cons.create))(Nil.value);
          return function ($156) {
              return Data_Foldable.foldl(foldableList)(Data_Function.flip(f))(b)(rev($156));
          };
      };
  });
  var foldableNonEmptyList = Data_NonEmpty.foldableNonEmpty(foldableList);
  var functorList = new Data_Functor.Functor(function (f) {
      return Data_Foldable.foldr(foldableList)(function (x) {
          return function (acc) {
              return new Cons(f(x), acc);
          };
      })(Nil.value);
  });
  var functorNonEmptyList = Data_NonEmpty.functorNonEmpty(functorList);
  var semigroupList = new Data_Semigroup.Semigroup(function (xs) {
      return function (ys) {
          return Data_Foldable.foldr(foldableList)(Cons.create)(ys)(xs);
      };
  });
  var monoidList = new Data_Monoid.Monoid(function () {
      return semigroupList;
  }, Nil.value);
  var semigroupNonEmptyList = new Data_Semigroup.Semigroup(function (v) {
      return function (as$prime) {
          return new Data_NonEmpty.NonEmpty(v.value0, Data_Semigroup.append(semigroupList)(v.value1)(toList(as$prime)));
      };
  });
  var traversableList = new Data_Traversable.Traversable(function () {
      return foldableList;
  }, function () {
      return functorList;
  }, function (dictApplicative) {
      return Data_Traversable.traverse(traversableList)(dictApplicative)(Control_Category.identity(Control_Category.categoryFn));
  }, function (dictApplicative) {
      return function (f) {
          return function ($159) {
              return Data_Functor.map((dictApplicative.Apply0()).Functor0())(Data_Foldable.foldl(foldableList)(Data_Function.flip(Cons.create))(Nil.value))(Data_Foldable.foldl(foldableList)(function (acc) {
                  return function ($160) {
                      return Control_Apply.lift2(dictApplicative.Apply0())(Data_Function.flip(Cons.create))(acc)(f($160));
                  };
              })(Control_Applicative.pure(dictApplicative)(Nil.value))($159));
          };
      };
  });
  var unfoldable1List = new Data_Unfoldable1.Unfoldable1(function (f) {
      return function (b) {
          var go = function ($copy_source) {
              return function ($copy_memo) {
                  var $tco_var_source = $copy_source;
                  var $tco_done = false;
                  var $tco_result;
                  function $tco_loop(source, memo) {
                      var v = f(source);
                      if (v.value1 instanceof Data_Maybe.Just) {
                          $tco_var_source = v.value1.value0;
                          $copy_memo = new Cons(v.value0, memo);
                          return;
                      };
                      if (v.value1 instanceof Data_Maybe.Nothing) {
                          $tco_done = true;
                          return Data_Foldable.foldl(foldableList)(Data_Function.flip(Cons.create))(Nil.value)(new Cons(v.value0, memo));
                      };
                      throw new Error("Failed pattern match at Data.List.Types line 105, column 22 - line 107, column 61: " + [ v.constructor.name ]);
                  };
                  while (!$tco_done) {
                      $tco_result = $tco_loop($tco_var_source, $copy_memo);
                  };
                  return $tco_result;
              };
          };
          return go(b)(Nil.value);
      };
  });
  var unfoldableList = new Data_Unfoldable.Unfoldable(function () {
      return unfoldable1List;
  }, function (f) {
      return function (b) {
          var go = function ($copy_source) {
              return function ($copy_memo) {
                  var $tco_var_source = $copy_source;
                  var $tco_done = false;
                  var $tco_result;
                  function $tco_loop(source, memo) {
                      var v = f(source);
                      if (v instanceof Data_Maybe.Nothing) {
                          $tco_done = true;
                          return Data_Foldable.foldl(foldableList)(Data_Function.flip(Cons.create))(Nil.value)(memo);
                      };
                      if (v instanceof Data_Maybe.Just) {
                          $tco_var_source = v.value0.value1;
                          $copy_memo = new Cons(v.value0.value0, memo);
                          return;
                      };
                      throw new Error("Failed pattern match at Data.List.Types line 112, column 22 - line 114, column 52: " + [ v.constructor.name ]);
                  };
                  while (!$tco_done) {
                      $tco_result = $tco_loop($tco_var_source, $copy_memo);
                  };
                  return $tco_result;
              };
          };
          return go(b)(Nil.value);
      };
  });
  var applyList = new Control_Apply.Apply(function () {
      return functorList;
  }, function (v) {
      return function (v1) {
          if (v instanceof Nil) {
              return Nil.value;
          };
          if (v instanceof Cons) {
              return Data_Semigroup.append(semigroupList)(Data_Functor.map(functorList)(v.value0)(v1))(Control_Apply.apply(applyList)(v.value1)(v1));
          };
          throw new Error("Failed pattern match at Data.List.Types line 127, column 1 - line 127, column 33: " + [ v.constructor.name, v1.constructor.name ]);
      };
  });
  var applyNonEmptyList = new Control_Apply.Apply(function () {
      return functorNonEmptyList;
  }, function (v) {
      return function (v1) {
          return new Data_NonEmpty.NonEmpty(v.value0(v1.value0), Data_Semigroup.append(semigroupList)(Control_Apply.apply(applyList)(v.value1)(new Cons(v1.value0, Nil.value)))(Control_Apply.apply(applyList)(new Cons(v.value0, v.value1))(v1.value1)));
      };
  });
  var applicativeList = new Control_Applicative.Applicative(function () {
      return applyList;
  }, function (a) {
      return new Cons(a, Nil.value);
  });                                              
  var altList = new Control_Alt.Alt(function () {
      return functorList;
  }, Data_Semigroup.append(semigroupList));
  var plusList = new Control_Plus.Plus(function () {
      return altList;
  }, Nil.value);
  var applicativeNonEmptyList = new Control_Applicative.Applicative(function () {
      return applyNonEmptyList;
  }, function ($164) {
      return NonEmptyList(Data_NonEmpty.singleton(plusList)($164));
  });
  exports["Nil"] = Nil;
  exports["Cons"] = Cons;
  exports["NonEmptyList"] = NonEmptyList;
  exports["toList"] = toList;
  exports["semigroupList"] = semigroupList;
  exports["monoidList"] = monoidList;
  exports["functorList"] = functorList;
  exports["foldableList"] = foldableList;
  exports["unfoldable1List"] = unfoldable1List;
  exports["unfoldableList"] = unfoldableList;
  exports["traversableList"] = traversableList;
  exports["applyList"] = applyList;
  exports["applicativeList"] = applicativeList;
  exports["altList"] = altList;
  exports["plusList"] = plusList;
  exports["functorNonEmptyList"] = functorNonEmptyList;
  exports["applyNonEmptyList"] = applyNonEmptyList;
  exports["applicativeNonEmptyList"] = applicativeNonEmptyList;
  exports["semigroupNonEmptyList"] = semigroupNonEmptyList;
  exports["foldableNonEmptyList"] = foldableNonEmptyList;
})(PS["Data.List.Types"] = PS["Data.List.Types"] || {});
(function(exports) {
  // Generated by purs version 0.12.0
  "use strict";
  var Control_Alt = PS["Control.Alt"];
  var Control_Alternative = PS["Control.Alternative"];
  var Control_Applicative = PS["Control.Applicative"];
  var Control_Apply = PS["Control.Apply"];
  var Control_Bind = PS["Control.Bind"];
  var Control_Category = PS["Control.Category"];
  var Control_Lazy = PS["Control.Lazy"];
  var Control_Monad_Rec_Class = PS["Control.Monad.Rec.Class"];
  var Control_Semigroupoid = PS["Control.Semigroupoid"];
  var Data_Bifunctor = PS["Data.Bifunctor"];
  var Data_Boolean = PS["Data.Boolean"];
  var Data_Eq = PS["Data.Eq"];
  var Data_Foldable = PS["Data.Foldable"];
  var Data_Function = PS["Data.Function"];
  var Data_Functor = PS["Data.Functor"];
  var Data_FunctorWithIndex = PS["Data.FunctorWithIndex"];
  var Data_HeytingAlgebra = PS["Data.HeytingAlgebra"];
  var Data_List_Types = PS["Data.List.Types"];
  var Data_Maybe = PS["Data.Maybe"];
  var Data_Newtype = PS["Data.Newtype"];
  var Data_NonEmpty = PS["Data.NonEmpty"];
  var Data_Ord = PS["Data.Ord"];
  var Data_Ordering = PS["Data.Ordering"];
  var Data_Ring = PS["Data.Ring"];
  var Data_Semigroup = PS["Data.Semigroup"];
  var Data_Semiring = PS["Data.Semiring"];
  var Data_Show = PS["Data.Show"];
  var Data_Traversable = PS["Data.Traversable"];
  var Data_Tuple = PS["Data.Tuple"];
  var Data_Unfoldable = PS["Data.Unfoldable"];
  var Data_Unit = PS["Data.Unit"];
  var Prelude = PS["Prelude"];
  var singleton = function (a) {
      return new Data_List_Types.Cons(a, Data_List_Types.Nil.value);
  };
  var fromFoldable = function (dictFoldable) {
      return Data_Foldable.foldr(dictFoldable)(Data_List_Types.Cons.create)(Data_List_Types.Nil.value);
  };
  var deleteBy = function (v) {
      return function (v1) {
          return function (v2) {
              if (v2 instanceof Data_List_Types.Nil) {
                  return Data_List_Types.Nil.value;
              };
              if (v2 instanceof Data_List_Types.Cons && v(v1)(v2.value0)) {
                  return v2.value1;
              };
              if (v2 instanceof Data_List_Types.Cons) {
                  return new Data_List_Types.Cons(v2.value0, deleteBy(v)(v1)(v2.value1));
              };
              throw new Error("Failed pattern match at Data.List line 671, column 1 - line 671, column 67: " + [ v.constructor.name, v1.constructor.name, v2.constructor.name ]);
          };
      };
  };
  var $$delete = function (dictEq) {
      return deleteBy(Data_Eq.eq(dictEq));
  };
  var difference = function (dictEq) {
      return Data_Foldable.foldl(Data_List_Types.foldableList)(Data_Function.flip($$delete(dictEq)));
  };
  exports["fromFoldable"] = fromFoldable;
  exports["singleton"] = singleton;
  exports["deleteBy"] = deleteBy;
  exports["difference"] = difference;
})(PS["Data.List"] = PS["Data.List"] || {});
(function(exports) {
  // Generated by purs version 0.12.0
  "use strict";
  var Control_Applicative = PS["Control.Applicative"];
  var Control_Apply = PS["Control.Apply"];
  var Control_Category = PS["Control.Category"];
  var Control_Semigroupoid = PS["Control.Semigroupoid"];
  var Data_Eq = PS["Data.Eq"];
  var Data_Foldable = PS["Data.Foldable"];
  var Data_FoldableWithIndex = PS["Data.FoldableWithIndex"];
  var Data_Function = PS["Data.Function"];
  var Data_Functor = PS["Data.Functor"];
  var Data_FunctorWithIndex = PS["Data.FunctorWithIndex"];
  var Data_HeytingAlgebra = PS["Data.HeytingAlgebra"];
  var Data_List = PS["Data.List"];
  var Data_List_Lazy = PS["Data.List.Lazy"];
  var Data_List_Lazy_Types = PS["Data.List.Lazy.Types"];
  var Data_List_Types = PS["Data.List.Types"];
  var Data_Maybe = PS["Data.Maybe"];
  var Data_Monoid = PS["Data.Monoid"];
  var Data_Ord = PS["Data.Ord"];
  var Data_Ordering = PS["Data.Ordering"];
  var Data_Semigroup = PS["Data.Semigroup"];
  var Data_Semiring = PS["Data.Semiring"];
  var Data_Show = PS["Data.Show"];
  var Data_Traversable = PS["Data.Traversable"];
  var Data_TraversableWithIndex = PS["Data.TraversableWithIndex"];
  var Data_Tuple = PS["Data.Tuple"];
  var Data_Unfoldable = PS["Data.Unfoldable"];
  var Partial_Unsafe = PS["Partial.Unsafe"];
  var Prelude = PS["Prelude"];                 
  var Leaf = (function () {
      function Leaf() {

      };
      Leaf.value = new Leaf();
      return Leaf;
  })();
  var Two = (function () {
      function Two(value0, value1, value2, value3) {
          this.value0 = value0;
          this.value1 = value1;
          this.value2 = value2;
          this.value3 = value3;
      };
      Two.create = function (value0) {
          return function (value1) {
              return function (value2) {
                  return function (value3) {
                      return new Two(value0, value1, value2, value3);
                  };
              };
          };
      };
      return Two;
  })();
  var Three = (function () {
      function Three(value0, value1, value2, value3, value4, value5, value6) {
          this.value0 = value0;
          this.value1 = value1;
          this.value2 = value2;
          this.value3 = value3;
          this.value4 = value4;
          this.value5 = value5;
          this.value6 = value6;
      };
      Three.create = function (value0) {
          return function (value1) {
              return function (value2) {
                  return function (value3) {
                      return function (value4) {
                          return function (value5) {
                              return function (value6) {
                                  return new Three(value0, value1, value2, value3, value4, value5, value6);
                              };
                          };
                      };
                  };
              };
          };
      };
      return Three;
  })();
  var TwoLeft = (function () {
      function TwoLeft(value0, value1, value2) {
          this.value0 = value0;
          this.value1 = value1;
          this.value2 = value2;
      };
      TwoLeft.create = function (value0) {
          return function (value1) {
              return function (value2) {
                  return new TwoLeft(value0, value1, value2);
              };
          };
      };
      return TwoLeft;
  })();
  var TwoRight = (function () {
      function TwoRight(value0, value1, value2) {
          this.value0 = value0;
          this.value1 = value1;
          this.value2 = value2;
      };
      TwoRight.create = function (value0) {
          return function (value1) {
              return function (value2) {
                  return new TwoRight(value0, value1, value2);
              };
          };
      };
      return TwoRight;
  })();
  var ThreeLeft = (function () {
      function ThreeLeft(value0, value1, value2, value3, value4, value5) {
          this.value0 = value0;
          this.value1 = value1;
          this.value2 = value2;
          this.value3 = value3;
          this.value4 = value4;
          this.value5 = value5;
      };
      ThreeLeft.create = function (value0) {
          return function (value1) {
              return function (value2) {
                  return function (value3) {
                      return function (value4) {
                          return function (value5) {
                              return new ThreeLeft(value0, value1, value2, value3, value4, value5);
                          };
                      };
                  };
              };
          };
      };
      return ThreeLeft;
  })();
  var ThreeMiddle = (function () {
      function ThreeMiddle(value0, value1, value2, value3, value4, value5) {
          this.value0 = value0;
          this.value1 = value1;
          this.value2 = value2;
          this.value3 = value3;
          this.value4 = value4;
          this.value5 = value5;
      };
      ThreeMiddle.create = function (value0) {
          return function (value1) {
              return function (value2) {
                  return function (value3) {
                      return function (value4) {
                          return function (value5) {
                              return new ThreeMiddle(value0, value1, value2, value3, value4, value5);
                          };
                      };
                  };
              };
          };
      };
      return ThreeMiddle;
  })();
  var ThreeRight = (function () {
      function ThreeRight(value0, value1, value2, value3, value4, value5) {
          this.value0 = value0;
          this.value1 = value1;
          this.value2 = value2;
          this.value3 = value3;
          this.value4 = value4;
          this.value5 = value5;
      };
      ThreeRight.create = function (value0) {
          return function (value1) {
              return function (value2) {
                  return function (value3) {
                      return function (value4) {
                          return function (value5) {
                              return new ThreeRight(value0, value1, value2, value3, value4, value5);
                          };
                      };
                  };
              };
          };
      };
      return ThreeRight;
  })();
  var KickUp = (function () {
      function KickUp(value0, value1, value2, value3) {
          this.value0 = value0;
          this.value1 = value1;
          this.value2 = value2;
          this.value3 = value3;
      };
      KickUp.create = function (value0) {
          return function (value1) {
              return function (value2) {
                  return function (value3) {
                      return new KickUp(value0, value1, value2, value3);
                  };
              };
          };
      };
      return KickUp;
  })();
  var values = function (v) {
      if (v instanceof Leaf) {
          return Data_List_Types.Nil.value;
      };
      if (v instanceof Two) {
          return Data_Semigroup.append(Data_List_Types.semigroupList)(values(v.value0))(Data_Semigroup.append(Data_List_Types.semigroupList)(Control_Applicative.pure(Data_List_Types.applicativeList)(v.value2))(values(v.value3)));
      };
      if (v instanceof Three) {
          return Data_Semigroup.append(Data_List_Types.semigroupList)(values(v.value0))(Data_Semigroup.append(Data_List_Types.semigroupList)(Control_Applicative.pure(Data_List_Types.applicativeList)(v.value2))(Data_Semigroup.append(Data_List_Types.semigroupList)(values(v.value3))(Data_Semigroup.append(Data_List_Types.semigroupList)(Control_Applicative.pure(Data_List_Types.applicativeList)(v.value5))(values(v.value6)))));
      };
      throw new Error("Failed pattern match at Data.Map.Internal line 594, column 1 - line 594, column 40: " + [ v.constructor.name ]);
  };
  var singleton = function (k) {
      return function (v) {
          return new Two(Leaf.value, k, v, Leaf.value);
      };
  };
  var toUnfoldable = function (dictUnfoldable) {
      return function (m) {
          var go = function ($copy_v) {
              var $tco_done = false;
              var $tco_result;
              function $tco_loop(v) {
                  if (v instanceof Data_List_Types.Nil) {
                      $tco_done = true;
                      return Data_Maybe.Nothing.value;
                  };
                  if (v instanceof Data_List_Types.Cons) {
                      if (v.value0 instanceof Leaf) {
                          $copy_v = v.value1;
                          return;
                      };
                      if (v.value0 instanceof Two && (v.value0.value0 instanceof Leaf && v.value0.value3 instanceof Leaf)) {
                          $tco_done = true;
                          return Data_Maybe.Just.create(new Data_Tuple.Tuple(new Data_Tuple.Tuple(v.value0.value1, v.value0.value2), v.value1));
                      };
                      if (v.value0 instanceof Two && v.value0.value0 instanceof Leaf) {
                          $tco_done = true;
                          return Data_Maybe.Just.create(new Data_Tuple.Tuple(new Data_Tuple.Tuple(v.value0.value1, v.value0.value2), new Data_List_Types.Cons(v.value0.value3, v.value1)));
                      };
                      if (v.value0 instanceof Two) {
                          $copy_v = new Data_List_Types.Cons(v.value0.value0, new Data_List_Types.Cons(singleton(v.value0.value1)(v.value0.value2), new Data_List_Types.Cons(v.value0.value3, v.value1)));
                          return;
                      };
                      if (v.value0 instanceof Three) {
                          $copy_v = new Data_List_Types.Cons(v.value0.value0, new Data_List_Types.Cons(singleton(v.value0.value1)(v.value0.value2), new Data_List_Types.Cons(v.value0.value3, new Data_List_Types.Cons(singleton(v.value0.value4)(v.value0.value5), new Data_List_Types.Cons(v.value0.value6, v.value1)))));
                          return;
                      };
                      throw new Error("Failed pattern match at Data.Map.Internal line 559, column 18 - line 568, column 71: " + [ v.value0.constructor.name ]);
                  };
                  throw new Error("Failed pattern match at Data.Map.Internal line 558, column 3 - line 558, column 19: " + [ v.constructor.name ]);
              };
              while (!$tco_done) {
                  $tco_result = $tco_loop($copy_v);
              };
              return $tco_result;
          };
          return Data_Unfoldable.unfoldr(dictUnfoldable)(go)(new Data_List_Types.Cons(m, Data_List_Types.Nil.value));
      };
  };
  var lookup = function (dictOrd) {
      return function (k) {
          var comp = Data_Ord.compare(dictOrd);
          var go = function ($copy_v) {
              var $tco_done = false;
              var $tco_result;
              function $tco_loop(v) {
                  if (v instanceof Leaf) {
                      $tco_done = true;
                      return Data_Maybe.Nothing.value;
                  };
                  if (v instanceof Two) {
                      var v2 = comp(k)(v.value1);
                      if (v2 instanceof Data_Ordering.EQ) {
                          $tco_done = true;
                          return new Data_Maybe.Just(v.value2);
                      };
                      if (v2 instanceof Data_Ordering.LT) {
                          $copy_v = v.value0;
                          return;
                      };
                      $copy_v = v.value3;
                      return;
                  };
                  if (v instanceof Three) {
                      var v3 = comp(k)(v.value1);
                      if (v3 instanceof Data_Ordering.EQ) {
                          $tco_done = true;
                          return new Data_Maybe.Just(v.value2);
                      };
                      var v4 = comp(k)(v.value4);
                      if (v4 instanceof Data_Ordering.EQ) {
                          $tco_done = true;
                          return new Data_Maybe.Just(v.value5);
                      };
                      if (v3 instanceof Data_Ordering.LT) {
                          $copy_v = v.value0;
                          return;
                      };
                      if (v4 instanceof Data_Ordering.GT) {
                          $copy_v = v.value6;
                          return;
                      };
                      $copy_v = v.value3;
                      return;
                  };
                  throw new Error("Failed pattern match at Data.Map.Internal line 193, column 5 - line 193, column 22: " + [ v.constructor.name ]);
              };
              while (!$tco_done) {
                  $tco_result = $tco_loop($copy_v);
              };
              return $tco_result;
          };
          return go;
      };
  };
  var functorMap = new Data_Functor.Functor(function (v) {
      return function (v1) {
          if (v1 instanceof Leaf) {
              return Leaf.value;
          };
          if (v1 instanceof Two) {
              return new Two(Data_Functor.map(functorMap)(v)(v1.value0), v1.value1, v(v1.value2), Data_Functor.map(functorMap)(v)(v1.value3));
          };
          if (v1 instanceof Three) {
              return new Three(Data_Functor.map(functorMap)(v)(v1.value0), v1.value1, v(v1.value2), Data_Functor.map(functorMap)(v)(v1.value3), v1.value4, v(v1.value5), Data_Functor.map(functorMap)(v)(v1.value6));
          };
          throw new Error("Failed pattern match at Data.Map.Internal line 89, column 1 - line 89, column 39: " + [ v.constructor.name, v1.constructor.name ]);
      };
  });
  var functorWithIndexMap = new Data_FunctorWithIndex.FunctorWithIndex(function () {
      return functorMap;
  }, function (v) {
      return function (v1) {
          if (v1 instanceof Leaf) {
              return Leaf.value;
          };
          if (v1 instanceof Two) {
              return new Two(Data_FunctorWithIndex.mapWithIndex(functorWithIndexMap)(v)(v1.value0), v1.value1, v(v1.value1)(v1.value2), Data_FunctorWithIndex.mapWithIndex(functorWithIndexMap)(v)(v1.value3));
          };
          if (v1 instanceof Three) {
              return new Three(Data_FunctorWithIndex.mapWithIndex(functorWithIndexMap)(v)(v1.value0), v1.value1, v(v1.value1)(v1.value2), Data_FunctorWithIndex.mapWithIndex(functorWithIndexMap)(v)(v1.value3), v1.value4, v(v1.value4)(v1.value5), Data_FunctorWithIndex.mapWithIndex(functorWithIndexMap)(v)(v1.value6));
          };
          throw new Error("Failed pattern match at Data.Map.Internal line 94, column 1 - line 94, column 59: " + [ v.constructor.name, v1.constructor.name ]);
      };
  });
  var fromZipper = function ($copy_dictOrd) {
      return function ($copy_v) {
          return function ($copy_tree) {
              var $tco_var_dictOrd = $copy_dictOrd;
              var $tco_var_v = $copy_v;
              var $tco_done = false;
              var $tco_result;
              function $tco_loop(dictOrd, v, tree) {
                  if (v instanceof Data_List_Types.Nil) {
                      $tco_done = true;
                      return tree;
                  };
                  if (v instanceof Data_List_Types.Cons) {
                      if (v.value0 instanceof TwoLeft) {
                          $tco_var_dictOrd = dictOrd;
                          $tco_var_v = v.value1;
                          $copy_tree = new Two(tree, v.value0.value0, v.value0.value1, v.value0.value2);
                          return;
                      };
                      if (v.value0 instanceof TwoRight) {
                          $tco_var_dictOrd = dictOrd;
                          $tco_var_v = v.value1;
                          $copy_tree = new Two(v.value0.value0, v.value0.value1, v.value0.value2, tree);
                          return;
                      };
                      if (v.value0 instanceof ThreeLeft) {
                          $tco_var_dictOrd = dictOrd;
                          $tco_var_v = v.value1;
                          $copy_tree = new Three(tree, v.value0.value0, v.value0.value1, v.value0.value2, v.value0.value3, v.value0.value4, v.value0.value5);
                          return;
                      };
                      if (v.value0 instanceof ThreeMiddle) {
                          $tco_var_dictOrd = dictOrd;
                          $tco_var_v = v.value1;
                          $copy_tree = new Three(v.value0.value0, v.value0.value1, v.value0.value2, tree, v.value0.value3, v.value0.value4, v.value0.value5);
                          return;
                      };
                      if (v.value0 instanceof ThreeRight) {
                          $tco_var_dictOrd = dictOrd;
                          $tco_var_v = v.value1;
                          $copy_tree = new Three(v.value0.value0, v.value0.value1, v.value0.value2, v.value0.value3, v.value0.value4, v.value0.value5, tree);
                          return;
                      };
                      throw new Error("Failed pattern match at Data.Map.Internal line 411, column 3 - line 416, column 88: " + [ v.value0.constructor.name ]);
                  };
                  throw new Error("Failed pattern match at Data.Map.Internal line 408, column 1 - line 408, column 80: " + [ v.constructor.name, tree.constructor.name ]);
              };
              while (!$tco_done) {
                  $tco_result = $tco_loop($tco_var_dictOrd, $tco_var_v, $copy_tree);
              };
              return $tco_result;
          };
      };
  };
  var insert = function (dictOrd) {
      return function (k) {
          return function (v) {
              var up = function ($copy_v1) {
                  return function ($copy_v2) {
                      var $tco_var_v1 = $copy_v1;
                      var $tco_done = false;
                      var $tco_result;
                      function $tco_loop(v1, v2) {
                          if (v1 instanceof Data_List_Types.Nil) {
                              $tco_done = true;
                              return new Two(v2.value0, v2.value1, v2.value2, v2.value3);
                          };
                          if (v1 instanceof Data_List_Types.Cons) {
                              if (v1.value0 instanceof TwoLeft) {
                                  $tco_done = true;
                                  return fromZipper(dictOrd)(v1.value1)(new Three(v2.value0, v2.value1, v2.value2, v2.value3, v1.value0.value0, v1.value0.value1, v1.value0.value2));
                              };
                              if (v1.value0 instanceof TwoRight) {
                                  $tco_done = true;
                                  return fromZipper(dictOrd)(v1.value1)(new Three(v1.value0.value0, v1.value0.value1, v1.value0.value2, v2.value0, v2.value1, v2.value2, v2.value3));
                              };
                              if (v1.value0 instanceof ThreeLeft) {
                                  $tco_var_v1 = v1.value1;
                                  $copy_v2 = new KickUp(new Two(v2.value0, v2.value1, v2.value2, v2.value3), v1.value0.value0, v1.value0.value1, new Two(v1.value0.value2, v1.value0.value3, v1.value0.value4, v1.value0.value5));
                                  return;
                              };
                              if (v1.value0 instanceof ThreeMiddle) {
                                  $tco_var_v1 = v1.value1;
                                  $copy_v2 = new KickUp(new Two(v1.value0.value0, v1.value0.value1, v1.value0.value2, v2.value0), v2.value1, v2.value2, new Two(v2.value3, v1.value0.value3, v1.value0.value4, v1.value0.value5));
                                  return;
                              };
                              if (v1.value0 instanceof ThreeRight) {
                                  $tco_var_v1 = v1.value1;
                                  $copy_v2 = new KickUp(new Two(v1.value0.value0, v1.value0.value1, v1.value0.value2, v1.value0.value3), v1.value0.value4, v1.value0.value5, new Two(v2.value0, v2.value1, v2.value2, v2.value3));
                                  return;
                              };
                              throw new Error("Failed pattern match at Data.Map.Internal line 447, column 5 - line 452, column 108: " + [ v1.value0.constructor.name, v2.constructor.name ]);
                          };
                          throw new Error("Failed pattern match at Data.Map.Internal line 444, column 3 - line 444, column 56: " + [ v1.constructor.name, v2.constructor.name ]);
                      };
                      while (!$tco_done) {
                          $tco_result = $tco_loop($tco_var_v1, $copy_v2);
                      };
                      return $tco_result;
                  };
              };
              var comp = Data_Ord.compare(dictOrd);
              var down = function ($copy_ctx) {
                  return function ($copy_v1) {
                      var $tco_var_ctx = $copy_ctx;
                      var $tco_done = false;
                      var $tco_result;
                      function $tco_loop(ctx, v1) {
                          if (v1 instanceof Leaf) {
                              $tco_done = true;
                              return up(ctx)(new KickUp(Leaf.value, k, v, Leaf.value));
                          };
                          if (v1 instanceof Two) {
                              var v2 = comp(k)(v1.value1);
                              if (v2 instanceof Data_Ordering.EQ) {
                                  $tco_done = true;
                                  return fromZipper(dictOrd)(ctx)(new Two(v1.value0, k, v, v1.value3));
                              };
                              if (v2 instanceof Data_Ordering.LT) {
                                  $tco_var_ctx = new Data_List_Types.Cons(new TwoLeft(v1.value1, v1.value2, v1.value3), ctx);
                                  $copy_v1 = v1.value0;
                                  return;
                              };
                              $tco_var_ctx = new Data_List_Types.Cons(new TwoRight(v1.value0, v1.value1, v1.value2), ctx);
                              $copy_v1 = v1.value3;
                              return;
                          };
                          if (v1 instanceof Three) {
                              var v3 = comp(k)(v1.value1);
                              if (v3 instanceof Data_Ordering.EQ) {
                                  $tco_done = true;
                                  return fromZipper(dictOrd)(ctx)(new Three(v1.value0, k, v, v1.value3, v1.value4, v1.value5, v1.value6));
                              };
                              var v4 = comp(k)(v1.value4);
                              if (v4 instanceof Data_Ordering.EQ) {
                                  $tco_done = true;
                                  return fromZipper(dictOrd)(ctx)(new Three(v1.value0, v1.value1, v1.value2, v1.value3, k, v, v1.value6));
                              };
                              if (v3 instanceof Data_Ordering.LT) {
                                  $tco_var_ctx = new Data_List_Types.Cons(new ThreeLeft(v1.value1, v1.value2, v1.value3, v1.value4, v1.value5, v1.value6), ctx);
                                  $copy_v1 = v1.value0;
                                  return;
                              };
                              if (v3 instanceof Data_Ordering.GT && v4 instanceof Data_Ordering.LT) {
                                  $tco_var_ctx = new Data_List_Types.Cons(new ThreeMiddle(v1.value0, v1.value1, v1.value2, v1.value4, v1.value5, v1.value6), ctx);
                                  $copy_v1 = v1.value3;
                                  return;
                              };
                              $tco_var_ctx = new Data_List_Types.Cons(new ThreeRight(v1.value0, v1.value1, v1.value2, v1.value3, v1.value4, v1.value5), ctx);
                              $copy_v1 = v1.value6;
                              return;
                          };
                          throw new Error("Failed pattern match at Data.Map.Internal line 427, column 3 - line 427, column 55: " + [ ctx.constructor.name, v1.constructor.name ]);
                      };
                      while (!$tco_done) {
                          $tco_result = $tco_loop($tco_var_ctx, $copy_v1);
                      };
                      return $tco_result;
                  };
              };
              return down(Data_List_Types.Nil.value);
          };
      };
  };
  var pop = function (dictOrd) {
      return function (k) {
          var up = function (ctxs) {
              return function (tree) {
                  if (ctxs instanceof Data_List_Types.Nil) {
                      return tree;
                  };
                  if (ctxs instanceof Data_List_Types.Cons) {
                      var $__unused = function (dictPartial1) {
                          return function ($dollar55) {
                              return $dollar55;
                          };
                      };
                      return $__unused()((function () {
                          if (ctxs.value0 instanceof TwoLeft && (ctxs.value0.value2 instanceof Leaf && tree instanceof Leaf)) {
                              return fromZipper(dictOrd)(ctxs.value1)(new Two(Leaf.value, ctxs.value0.value0, ctxs.value0.value1, Leaf.value));
                          };
                          if (ctxs.value0 instanceof TwoRight && (ctxs.value0.value0 instanceof Leaf && tree instanceof Leaf)) {
                              return fromZipper(dictOrd)(ctxs.value1)(new Two(Leaf.value, ctxs.value0.value1, ctxs.value0.value2, Leaf.value));
                          };
                          if (ctxs.value0 instanceof TwoLeft && ctxs.value0.value2 instanceof Two) {
                              return up(ctxs.value1)(new Three(tree, ctxs.value0.value0, ctxs.value0.value1, ctxs.value0.value2.value0, ctxs.value0.value2.value1, ctxs.value0.value2.value2, ctxs.value0.value2.value3));
                          };
                          if (ctxs.value0 instanceof TwoRight && ctxs.value0.value0 instanceof Two) {
                              return up(ctxs.value1)(new Three(ctxs.value0.value0.value0, ctxs.value0.value0.value1, ctxs.value0.value0.value2, ctxs.value0.value0.value3, ctxs.value0.value1, ctxs.value0.value2, tree));
                          };
                          if (ctxs.value0 instanceof TwoLeft && ctxs.value0.value2 instanceof Three) {
                              return fromZipper(dictOrd)(ctxs.value1)(new Two(new Two(tree, ctxs.value0.value0, ctxs.value0.value1, ctxs.value0.value2.value0), ctxs.value0.value2.value1, ctxs.value0.value2.value2, new Two(ctxs.value0.value2.value3, ctxs.value0.value2.value4, ctxs.value0.value2.value5, ctxs.value0.value2.value6)));
                          };
                          if (ctxs.value0 instanceof TwoRight && ctxs.value0.value0 instanceof Three) {
                              return fromZipper(dictOrd)(ctxs.value1)(new Two(new Two(ctxs.value0.value0.value0, ctxs.value0.value0.value1, ctxs.value0.value0.value2, ctxs.value0.value0.value3), ctxs.value0.value0.value4, ctxs.value0.value0.value5, new Two(ctxs.value0.value0.value6, ctxs.value0.value1, ctxs.value0.value2, tree)));
                          };
                          if (ctxs.value0 instanceof ThreeLeft && (ctxs.value0.value2 instanceof Leaf && (ctxs.value0.value5 instanceof Leaf && tree instanceof Leaf))) {
                              return fromZipper(dictOrd)(ctxs.value1)(new Three(Leaf.value, ctxs.value0.value0, ctxs.value0.value1, Leaf.value, ctxs.value0.value3, ctxs.value0.value4, Leaf.value));
                          };
                          if (ctxs.value0 instanceof ThreeMiddle && (ctxs.value0.value0 instanceof Leaf && (ctxs.value0.value5 instanceof Leaf && tree instanceof Leaf))) {
                              return fromZipper(dictOrd)(ctxs.value1)(new Three(Leaf.value, ctxs.value0.value1, ctxs.value0.value2, Leaf.value, ctxs.value0.value3, ctxs.value0.value4, Leaf.value));
                          };
                          if (ctxs.value0 instanceof ThreeRight && (ctxs.value0.value0 instanceof Leaf && (ctxs.value0.value3 instanceof Leaf && tree instanceof Leaf))) {
                              return fromZipper(dictOrd)(ctxs.value1)(new Three(Leaf.value, ctxs.value0.value1, ctxs.value0.value2, Leaf.value, ctxs.value0.value4, ctxs.value0.value5, Leaf.value));
                          };
                          if (ctxs.value0 instanceof ThreeLeft && ctxs.value0.value2 instanceof Two) {
                              return fromZipper(dictOrd)(ctxs.value1)(new Two(new Three(tree, ctxs.value0.value0, ctxs.value0.value1, ctxs.value0.value2.value0, ctxs.value0.value2.value1, ctxs.value0.value2.value2, ctxs.value0.value2.value3), ctxs.value0.value3, ctxs.value0.value4, ctxs.value0.value5));
                          };
                          if (ctxs.value0 instanceof ThreeMiddle && ctxs.value0.value0 instanceof Two) {
                              return fromZipper(dictOrd)(ctxs.value1)(new Two(new Three(ctxs.value0.value0.value0, ctxs.value0.value0.value1, ctxs.value0.value0.value2, ctxs.value0.value0.value3, ctxs.value0.value1, ctxs.value0.value2, tree), ctxs.value0.value3, ctxs.value0.value4, ctxs.value0.value5));
                          };
                          if (ctxs.value0 instanceof ThreeMiddle && ctxs.value0.value5 instanceof Two) {
                              return fromZipper(dictOrd)(ctxs.value1)(new Two(ctxs.value0.value0, ctxs.value0.value1, ctxs.value0.value2, new Three(tree, ctxs.value0.value3, ctxs.value0.value4, ctxs.value0.value5.value0, ctxs.value0.value5.value1, ctxs.value0.value5.value2, ctxs.value0.value5.value3)));
                          };
                          if (ctxs.value0 instanceof ThreeRight && ctxs.value0.value3 instanceof Two) {
                              return fromZipper(dictOrd)(ctxs.value1)(new Two(ctxs.value0.value0, ctxs.value0.value1, ctxs.value0.value2, new Three(ctxs.value0.value3.value0, ctxs.value0.value3.value1, ctxs.value0.value3.value2, ctxs.value0.value3.value3, ctxs.value0.value4, ctxs.value0.value5, tree)));
                          };
                          if (ctxs.value0 instanceof ThreeLeft && ctxs.value0.value2 instanceof Three) {
                              return fromZipper(dictOrd)(ctxs.value1)(new Three(new Two(tree, ctxs.value0.value0, ctxs.value0.value1, ctxs.value0.value2.value0), ctxs.value0.value2.value1, ctxs.value0.value2.value2, new Two(ctxs.value0.value2.value3, ctxs.value0.value2.value4, ctxs.value0.value2.value5, ctxs.value0.value2.value6), ctxs.value0.value3, ctxs.value0.value4, ctxs.value0.value5));
                          };
                          if (ctxs.value0 instanceof ThreeMiddle && ctxs.value0.value0 instanceof Three) {
                              return fromZipper(dictOrd)(ctxs.value1)(new Three(new Two(ctxs.value0.value0.value0, ctxs.value0.value0.value1, ctxs.value0.value0.value2, ctxs.value0.value0.value3), ctxs.value0.value0.value4, ctxs.value0.value0.value5, new Two(ctxs.value0.value0.value6, ctxs.value0.value1, ctxs.value0.value2, tree), ctxs.value0.value3, ctxs.value0.value4, ctxs.value0.value5));
                          };
                          if (ctxs.value0 instanceof ThreeMiddle && ctxs.value0.value5 instanceof Three) {
                              return fromZipper(dictOrd)(ctxs.value1)(new Three(ctxs.value0.value0, ctxs.value0.value1, ctxs.value0.value2, new Two(tree, ctxs.value0.value3, ctxs.value0.value4, ctxs.value0.value5.value0), ctxs.value0.value5.value1, ctxs.value0.value5.value2, new Two(ctxs.value0.value5.value3, ctxs.value0.value5.value4, ctxs.value0.value5.value5, ctxs.value0.value5.value6)));
                          };
                          if (ctxs.value0 instanceof ThreeRight && ctxs.value0.value3 instanceof Three) {
                              return fromZipper(dictOrd)(ctxs.value1)(new Three(ctxs.value0.value0, ctxs.value0.value1, ctxs.value0.value2, new Two(ctxs.value0.value3.value0, ctxs.value0.value3.value1, ctxs.value0.value3.value2, ctxs.value0.value3.value3), ctxs.value0.value3.value4, ctxs.value0.value3.value5, new Two(ctxs.value0.value3.value6, ctxs.value0.value4, ctxs.value0.value5, tree)));
                          };
                          throw new Error("Failed pattern match at Data.Map.Internal line 497, column 9 - line 514, column 136: " + [ ctxs.value0.constructor.name, tree.constructor.name ]);
                      })());
                  };
                  throw new Error("Failed pattern match at Data.Map.Internal line 494, column 5 - line 514, column 136: " + [ ctxs.constructor.name ]);
              };
          };
          var removeMaxNode = function (ctx) {
              return function (m) {
                  var $__unused = function (dictPartial1) {
                      return function ($dollar57) {
                          return $dollar57;
                      };
                  };
                  return $__unused()((function () {
                      if (m instanceof Two && (m.value0 instanceof Leaf && m.value3 instanceof Leaf)) {
                          return up(ctx)(Leaf.value);
                      };
                      if (m instanceof Two) {
                          return removeMaxNode(new Data_List_Types.Cons(new TwoRight(m.value0, m.value1, m.value2), ctx))(m.value3);
                      };
                      if (m instanceof Three && (m.value0 instanceof Leaf && (m.value3 instanceof Leaf && m.value6 instanceof Leaf))) {
                          return up(new Data_List_Types.Cons(new TwoRight(Leaf.value, m.value1, m.value2), ctx))(Leaf.value);
                      };
                      if (m instanceof Three) {
                          return removeMaxNode(new Data_List_Types.Cons(new ThreeRight(m.value0, m.value1, m.value2, m.value3, m.value4, m.value5), ctx))(m.value6);
                      };
                      throw new Error("Failed pattern match at Data.Map.Internal line 526, column 5 - line 530, column 107: " + [ m.constructor.name ]);
                  })());
              };
          };
          var maxNode = function (m) {
              var $__unused = function (dictPartial1) {
                  return function ($dollar59) {
                      return $dollar59;
                  };
              };
              return $__unused()((function () {
                  if (m instanceof Two && m.value3 instanceof Leaf) {
                      return {
                          key: m.value1,
                          value: m.value2
                      };
                  };
                  if (m instanceof Two) {
                      return maxNode(m.value3);
                  };
                  if (m instanceof Three && m.value6 instanceof Leaf) {
                      return {
                          key: m.value4,
                          value: m.value5
                      };
                  };
                  if (m instanceof Three) {
                      return maxNode(m.value6);
                  };
                  throw new Error("Failed pattern match at Data.Map.Internal line 517, column 33 - line 521, column 45: " + [ m.constructor.name ]);
              })());
          };
          var comp = Data_Ord.compare(dictOrd);
          var down = function ($copy_ctx) {
              return function ($copy_m) {
                  var $tco_var_ctx = $copy_ctx;
                  var $tco_done = false;
                  var $tco_result;
                  function $tco_loop(ctx, m) {
                      if (m instanceof Leaf) {
                          $tco_done = true;
                          return Data_Maybe.Nothing.value;
                      };
                      if (m instanceof Two) {
                          var v = comp(k)(m.value1);
                          if (m.value3 instanceof Leaf && v instanceof Data_Ordering.EQ) {
                              $tco_done = true;
                              return new Data_Maybe.Just(new Data_Tuple.Tuple(m.value2, up(ctx)(Leaf.value)));
                          };
                          if (v instanceof Data_Ordering.EQ) {
                              var max = maxNode(m.value0);
                              $tco_done = true;
                              return new Data_Maybe.Just(new Data_Tuple.Tuple(m.value2, removeMaxNode(new Data_List_Types.Cons(new TwoLeft(max.key, max.value, m.value3), ctx))(m.value0)));
                          };
                          if (v instanceof Data_Ordering.LT) {
                              $tco_var_ctx = new Data_List_Types.Cons(new TwoLeft(m.value1, m.value2, m.value3), ctx);
                              $copy_m = m.value0;
                              return;
                          };
                          $tco_var_ctx = new Data_List_Types.Cons(new TwoRight(m.value0, m.value1, m.value2), ctx);
                          $copy_m = m.value3;
                          return;
                      };
                      if (m instanceof Three) {
                          var leaves = (function () {
                              if (m.value0 instanceof Leaf && (m.value3 instanceof Leaf && m.value6 instanceof Leaf)) {
                                  return true;
                              };
                              return false;
                          })();
                          var v = comp(k)(m.value4);
                          var v3 = comp(k)(m.value1);
                          if (leaves && v3 instanceof Data_Ordering.EQ) {
                              $tco_done = true;
                              return new Data_Maybe.Just(new Data_Tuple.Tuple(m.value2, fromZipper(dictOrd)(ctx)(new Two(Leaf.value, m.value4, m.value5, Leaf.value))));
                          };
                          if (leaves && v instanceof Data_Ordering.EQ) {
                              $tco_done = true;
                              return new Data_Maybe.Just(new Data_Tuple.Tuple(m.value5, fromZipper(dictOrd)(ctx)(new Two(Leaf.value, m.value1, m.value2, Leaf.value))));
                          };
                          if (v3 instanceof Data_Ordering.EQ) {
                              var max = maxNode(m.value0);
                              $tco_done = true;
                              return new Data_Maybe.Just(new Data_Tuple.Tuple(m.value2, removeMaxNode(new Data_List_Types.Cons(new ThreeLeft(max.key, max.value, m.value3, m.value4, m.value5, m.value6), ctx))(m.value0)));
                          };
                          if (v instanceof Data_Ordering.EQ) {
                              var max = maxNode(m.value3);
                              $tco_done = true;
                              return new Data_Maybe.Just(new Data_Tuple.Tuple(m.value5, removeMaxNode(new Data_List_Types.Cons(new ThreeMiddle(m.value0, m.value1, m.value2, max.key, max.value, m.value6), ctx))(m.value3)));
                          };
                          if (v3 instanceof Data_Ordering.LT) {
                              $tco_var_ctx = new Data_List_Types.Cons(new ThreeLeft(m.value1, m.value2, m.value3, m.value4, m.value5, m.value6), ctx);
                              $copy_m = m.value0;
                              return;
                          };
                          if (v3 instanceof Data_Ordering.GT && v instanceof Data_Ordering.LT) {
                              $tco_var_ctx = new Data_List_Types.Cons(new ThreeMiddle(m.value0, m.value1, m.value2, m.value4, m.value5, m.value6), ctx);
                              $copy_m = m.value3;
                              return;
                          };
                          $tco_var_ctx = new Data_List_Types.Cons(new ThreeRight(m.value0, m.value1, m.value2, m.value3, m.value4, m.value5), ctx);
                          $copy_m = m.value6;
                          return;
                      };
                      throw new Error("Failed pattern match at Data.Map.Internal line 467, column 34 - line 490, column 80: " + [ m.constructor.name ]);
                  };
                  while (!$tco_done) {
                      $tco_result = $tco_loop($tco_var_ctx, $copy_m);
                  };
                  return $tco_result;
              };
          };
          return down(Data_List_Types.Nil.value);
      };
  };
  var foldableMap = new Data_Foldable.Foldable(function (dictMonoid) {
      return function (f) {
          return function (m) {
              return Data_Foldable.foldMap(Data_List_Types.foldableList)(dictMonoid)(f)(values(m));
          };
      };
  }, function (f) {
      return function (z) {
          return function (m) {
              return Data_Foldable.foldl(Data_List_Types.foldableList)(f)(z)(values(m));
          };
      };
  }, function (f) {
      return function (z) {
          return function (m) {
              return Data_Foldable.foldr(Data_List_Types.foldableList)(f)(z)(values(m));
          };
      };
  });
  var empty = Leaf.value;
  var fromFoldable = function (dictOrd) {
      return function (dictFoldable) {
          return Data_Foldable.foldl(dictFoldable)(function (m) {
              return function (v) {
                  return insert(dictOrd)(v.value0)(v.value1)(m);
              };
          })(empty);
      };
  };
  var $$delete = function (dictOrd) {
      return function (k) {
          return function (m) {
              return Data_Maybe.maybe(m)(Data_Tuple.snd)(pop(dictOrd)(k)(m));
          };
      };
  };
  var asList = Control_Category.identity(Control_Category.categoryFn);
  var foldableWithIndexMap = new Data_FoldableWithIndex.FoldableWithIndex(function () {
      return foldableMap;
  }, function (dictMonoid) {
      return function (f) {
          return function (m) {
              return Data_Foldable.foldMap(Data_List_Types.foldableList)(dictMonoid)(Data_Tuple.uncurry(f))(asList(toUnfoldable(Data_List_Types.unfoldableList)(m)));
          };
      };
  }, function (f) {
      return function (z) {
          return function (m) {
              return Data_Foldable.foldl(Data_List_Types.foldableList)(function ($737) {
                  return Data_Tuple.uncurry(Data_Function.flip(f)($737));
              })(z)(asList(toUnfoldable(Data_List_Types.unfoldableList)(m)));
          };
      };
  }, function (f) {
      return function (z) {
          return function (m) {
              return Data_Foldable.foldr(Data_List_Types.foldableList)(Data_Tuple.uncurry(f))(z)(asList(toUnfoldable(Data_List_Types.unfoldableList)(m)));
          };
      };
  });
  var alter = function (dictOrd) {
      return function (f) {
          return function (k) {
              return function (m) {
                  var v = f(lookup(dictOrd)(k)(m));
                  if (v instanceof Data_Maybe.Nothing) {
                      return $$delete(dictOrd)(k)(m);
                  };
                  if (v instanceof Data_Maybe.Just) {
                      return insert(dictOrd)(k)(v.value0)(m);
                  };
                  throw new Error("Failed pattern match at Data.Map.Internal line 535, column 15 - line 537, column 25: " + [ v.constructor.name ]);
              };
          };
      };
  };
  var unionWith = function (dictOrd) {
      return function (f) {
          return function (m1) {
              return function (m2) {
                  var go = function (m) {
                      return function (v) {
                          return alter(dictOrd)(function ($738) {
                              return Data_Maybe.Just.create(Data_Maybe.maybe(v.value1)(f(v.value1))($738));
                          })(v.value0)(m);
                      };
                  };
                  return Data_Foldable.foldl(Data_List_Types.foldableList)(go)(m2)(toUnfoldable(Data_List_Types.unfoldableList)(m1));
              };
          };
      };
  };
  var union = function (dictOrd) {
      return unionWith(dictOrd)(Data_Function["const"]);
  };
  var semigroupMap = function (dictOrd) {
      return new Data_Semigroup.Semigroup(union(dictOrd));
  };
  var monoidMap = function (dictOrd) {
      return new Data_Monoid.Monoid(function () {
          return semigroupMap(dictOrd);
      }, empty);
  };
  exports["empty"] = empty;
  exports["singleton"] = singleton;
  exports["insert"] = insert;
  exports["lookup"] = lookup;
  exports["fromFoldable"] = fromFoldable;
  exports["toUnfoldable"] = toUnfoldable;
  exports["pop"] = pop;
  exports["alter"] = alter;
  exports["values"] = values;
  exports["union"] = union;
  exports["unionWith"] = unionWith;
  exports["semigroupMap"] = semigroupMap;
  exports["monoidMap"] = monoidMap;
  exports["functorMap"] = functorMap;
  exports["functorWithIndexMap"] = functorWithIndexMap;
  exports["foldableMap"] = foldableMap;
  exports["foldableWithIndexMap"] = foldableWithIndexMap;
})(PS["Data.Map.Internal"] = PS["Data.Map.Internal"] || {});
(function(exports) {
  // Generated by purs version 0.12.0
  "use strict";
  var Control_Alt = PS["Control.Alt"];
  var Control_Alternative = PS["Control.Alternative"];
  var Control_Applicative = PS["Control.Applicative"];
  var Control_Apply = PS["Control.Apply"];
  var Control_Bind = PS["Control.Bind"];
  var Control_Plus = PS["Control.Plus"];
  var Control_Semigroupoid = PS["Control.Semigroupoid"];
  var Data_Array = PS["Data.Array"];
  var Data_Either = PS["Data.Either"];
  var Data_Foldable = PS["Data.Foldable"];
  var Data_Function = PS["Data.Function"];
  var Data_Functor = PS["Data.Functor"];
  var Data_List = PS["Data.List"];
  var Data_List_Types = PS["Data.List.Types"];
  var Data_Map = PS["Data.Map"];
  var Data_Map_Internal = PS["Data.Map.Internal"];
  var Data_Maybe = PS["Data.Maybe"];
  var Data_Monoid = PS["Data.Monoid"];
  var Data_Tuple = PS["Data.Tuple"];
  var Data_Unit = PS["Data.Unit"];
  var Prelude = PS["Prelude"];                 
  var Compactable = function (compact, separate) {
      this.compact = compact;
      this.separate = separate;
  };
  var separateSequence = function (dictAlternative) {
      return function (dictFoldable) {
          return function (dictCompactable) {
              var go = function (acc) {
                  return function (v) {
                      if (v instanceof Data_Either.Left) {
                          return {
                              left: Control_Alt.alt((dictAlternative.Plus1()).Alt0())(acc.left)(Control_Applicative.pure(dictAlternative.Applicative0())(v.value0)),
                              right: acc.right
                          };
                      };
                      if (v instanceof Data_Either.Right) {
                          return {
                              right: Control_Alt.alt((dictAlternative.Plus1()).Alt0())(acc.right)(Control_Applicative.pure(dictAlternative.Applicative0())(v.value0)),
                              left: acc.left
                          };
                      };
                      throw new Error("Failed pattern match at Data.Compactable line 109, column 14 - line 111, column 54: " + [ v.constructor.name ]);
                  };
              };
              return Data_Foldable.foldl(dictFoldable)(go)({
                  left: Control_Plus.empty(dictAlternative.Plus1()),
                  right: Control_Plus.empty(dictAlternative.Plus1())
              });
          };
      };
  };
  var separate = function (dict) {
      return dict.separate;
  };
  var mapToList = function (dictOrd) {
      return Data_Map_Internal.toUnfoldable(Data_List_Types.unfoldableList);
  }; 
  var compactableMap = function (dictOrd) {
      return new Compactable((function () {
          var select = function (v) {
              return function (m) {
                  return Data_Map_Internal.alter(dictOrd)(Data_Function["const"](v.value1))(v.value0)(m);
              };
          };
          return function ($63) {
              return Data_Foldable.foldr(Data_List_Types.foldableList)(select)(Data_Map_Internal.empty)(mapToList(dictOrd)($63));
          };
      })(), (function () {
          var select = function (v) {
              return function (v1) {
                  if (v.value1 instanceof Data_Either.Left) {
                      return {
                          left: Data_Map_Internal.insert(dictOrd)(v.value0)(v.value1.value0)(v1.left),
                          right: v1.right
                      };
                  };
                  if (v.value1 instanceof Data_Either.Right) {
                      return {
                          left: v1.left,
                          right: Data_Map_Internal.insert(dictOrd)(v.value0)(v.value1.value0)(v1.right)
                      };
                  };
                  throw new Error("Failed pattern match at Data.Compactable line 120, column 44 - line 122, column 63: " + [ v.value1.constructor.name ]);
              };
          };
          return function ($64) {
              return Data_Foldable.foldr(Data_List_Types.foldableList)(select)({
                  left: Data_Map_Internal.empty,
                  right: Data_Map_Internal.empty
              })(mapToList(dictOrd)($64));
          };
      })());
  };
  var compactableArray = new Compactable(Data_Array.catMaybes, function (xs) {
      return separateSequence(Control_Alternative.alternativeArray)(Data_Foldable.foldableArray)(compactableArray)(xs);
  });
  var compact = function (dict) {
      return dict.compact;
  };
  exports["Compactable"] = Compactable;
  exports["compact"] = compact;
  exports["separate"] = separate;
  exports["compactableArray"] = compactableArray;
  exports["compactableMap"] = compactableMap;
})(PS["Data.Compactable"] = PS["Data.Compactable"] || {});
(function(exports) {
  // Generated by purs version 0.12.0
  "use strict";
  var Control_Applicative = PS["Control.Applicative"];
  var Control_Apply = PS["Control.Apply"];
  var Control_Semigroupoid = PS["Control.Semigroupoid"];
  var Data_BooleanAlgebra = PS["Data.BooleanAlgebra"];
  var Data_Bounded = PS["Data.Bounded"];
  var Data_CommutativeRing = PS["Data.CommutativeRing"];
  var Data_Eq = PS["Data.Eq"];
  var Data_EuclideanRing = PS["Data.EuclideanRing"];
  var Data_Foldable = PS["Data.Foldable"];
  var Data_Functor = PS["Data.Functor"];
  var Data_Functor_Contravariant = PS["Data.Functor.Contravariant"];
  var Data_Functor_Invariant = PS["Data.Functor.Invariant"];
  var Data_HeytingAlgebra = PS["Data.HeytingAlgebra"];
  var Data_Monoid = PS["Data.Monoid"];
  var Data_Newtype = PS["Data.Newtype"];
  var Data_Ord = PS["Data.Ord"];
  var Data_Ring = PS["Data.Ring"];
  var Data_Semigroup = PS["Data.Semigroup"];
  var Data_Semiring = PS["Data.Semiring"];
  var Data_Show = PS["Data.Show"];
  var Data_Traversable = PS["Data.Traversable"];
  var Prelude = PS["Prelude"];                 
  var Const = function (x) {
      return x;
  };
  var newtypeConst = new Data_Newtype.Newtype(function (n) {
      return n;
  }, Const);
  var functorConst = new Data_Functor.Functor(function (f) {
      return function (m) {
          return m;
      };
  });
  var applyConst = function (dictSemigroup) {
      return new Control_Apply.Apply(function () {
          return functorConst;
      }, function (v) {
          return function (v1) {
              return Data_Semigroup.append(dictSemigroup)(v)(v1);
          };
      });
  };
  var applicativeConst = function (dictMonoid) {
      return new Control_Applicative.Applicative(function () {
          return applyConst(dictMonoid.Semigroup0());
      }, function (v) {
          return Data_Monoid.mempty(dictMonoid);
      });
  };
  exports["Const"] = Const;
  exports["newtypeConst"] = newtypeConst;
  exports["functorConst"] = functorConst;
  exports["applyConst"] = applyConst;
  exports["applicativeConst"] = applicativeConst;
})(PS["Data.Const"] = PS["Data.Const"] || {});
(function(exports) {
  // Generated by purs version 0.12.0
  "use strict";
  var Control_Bind = PS["Control.Bind"];
  var Control_Category = PS["Control.Category"];
  var Control_Semigroupoid = PS["Control.Semigroupoid"];
  var Data_Array = PS["Data.Array"];
  var Data_Compactable = PS["Data.Compactable"];
  var Data_Either = PS["Data.Either"];
  var Data_Foldable = PS["Data.Foldable"];
  var Data_Function = PS["Data.Function"];
  var Data_Functor = PS["Data.Functor"];
  var Data_HeytingAlgebra = PS["Data.HeytingAlgebra"];
  var Data_List = PS["Data.List"];
  var Data_List_Types = PS["Data.List.Types"];
  var Data_Map = PS["Data.Map"];
  var Data_Map_Internal = PS["Data.Map.Internal"];
  var Data_Maybe = PS["Data.Maybe"];
  var Data_Monoid = PS["Data.Monoid"];
  var Data_Semigroup = PS["Data.Semigroup"];
  var Data_Tuple = PS["Data.Tuple"];
  var Prelude = PS["Prelude"];                 
  var Filterable = function (Compactable0, Functor1, filter, filterMap, partition, partitionMap) {
      this.Compactable0 = Compactable0;
      this.Functor1 = Functor1;
      this.filter = filter;
      this.filterMap = filterMap;
      this.partition = partition;
      this.partitionMap = partitionMap;
  };
  var partitionMap = function (dict) {
      return dict.partitionMap;
  };
  var partition = function (dict) {
      return dict.partition;
  };
  var maybeBool = function (p) {
      return function (x) {
          var $33 = p(x);
          if ($33) {
              return new Data_Maybe.Just(x);
          };
          return Data_Maybe.Nothing.value;
      };
  }; 
  var filterableArray = new Filterable(function () {
      return Data_Compactable.compactableArray;
  }, function () {
      return Data_Functor.functorArray;
  }, Data_Array.filter, Data_Array.mapMaybe, Data_Array.partition, function (p) {
      var go = function (acc) {
          return function (x) {
              var v = p(x);
              if (v instanceof Data_Either.Left) {
                  return {
                      left: Data_Semigroup.append(Data_Semigroup.semigroupArray)(acc.left)([ v.value0 ]),
                      right: acc.right
                  };
              };
              if (v instanceof Data_Either.Right) {
                  return {
                      right: Data_Semigroup.append(Data_Semigroup.semigroupArray)(acc.right)([ v.value0 ]),
                      left: acc.left
                  };
              };
              throw new Error("Failed pattern match at Data.Filterable line 149, column 16 - line 151, column 50: " + [ v.constructor.name ]);
          };
      };
      return Data_Foldable.foldl(Data_Foldable.foldableArray)(go)({
          left: [  ],
          right: [  ]
      });
  });
  var filterMap = function (dict) {
      return dict.filterMap;
  };
  var filterDefault = function (dictFilterable) {
      return function ($84) {
          return filterMap(dictFilterable)(maybeBool($84));
      };
  };
  var filter = function (dict) {
      return dict.filter;
  };
  var eitherBool = function (p) {
      return function (x) {
          var $49 = p(x);
          if ($49) {
              return new Data_Either.Right(x);
          };
          return new Data_Either.Left(x);
      };
  };
  var partitionDefault = function (dictFilterable) {
      return function (p) {
          return function (xs) {
              var o = partitionMap(dictFilterable)(eitherBool(p))(xs);
              return {
                  no: o.left,
                  yes: o.right
              };
          };
      };
  };
  var filterableMap = function (dictOrd) {
      return new Filterable(function () {
          return Data_Compactable.compactableMap(dictOrd);
      }, function () {
          return Data_Map_Internal.functorMap;
      }, function (p) {
          return filterDefault(filterableMap(dictOrd))(p);
      }, function (p) {
          return function (xs) {
              var toList = Data_Map_Internal.toUnfoldable(Data_List_Types.unfoldableList);
              var select = function (v) {
                  return function (m) {
                      return Data_Map_Internal.alter(dictOrd)(Data_Function["const"](p(v.value1)))(v.value0)(m);
                  };
              };
              return Data_Foldable.foldr(Data_List_Types.foldableList)(select)(Data_Map_Internal.empty)(toList(xs));
          };
      }, function (p) {
          return partitionDefault(filterableMap(dictOrd))(p);
      }, function (p) {
          return function (xs) {
              var toList = Data_Map_Internal.toUnfoldable(Data_List_Types.unfoldableList);
              var select = function (v) {
                  return function (v1) {
                      var v2 = p(v.value1);
                      if (v2 instanceof Data_Either.Left) {
                          return {
                              left: Data_Map_Internal.insert(dictOrd)(v.value0)(v2.value0)(v1.left),
                              right: v1.right
                          };
                      };
                      if (v2 instanceof Data_Either.Right) {
                          return {
                              left: v1.left,
                              right: Data_Map_Internal.insert(dictOrd)(v.value0)(v2.value0)(v1.right)
                          };
                      };
                      throw new Error("Failed pattern match at Data.Filterable line 215, column 44 - line 217, column 57: " + [ v2.constructor.name ]);
                  };
              };
              return Data_Foldable.foldr(Data_List_Types.foldableList)(select)({
                  left: Data_Map_Internal.empty,
                  right: Data_Map_Internal.empty
              })(toList(xs));
          };
      });
  };
  exports["Filterable"] = Filterable;
  exports["partitionMap"] = partitionMap;
  exports["partition"] = partition;
  exports["filterMap"] = filterMap;
  exports["filter"] = filter;
  exports["eitherBool"] = eitherBool;
  exports["partitionDefault"] = partitionDefault;
  exports["maybeBool"] = maybeBool;
  exports["filterDefault"] = filterDefault;
  exports["filterableArray"] = filterableArray;
  exports["filterableMap"] = filterableMap;
})(PS["Data.Filterable"] = PS["Data.Filterable"] || {});
(function(exports) {
  /* globals exports, JSON */
  "use strict";

  exports.unsafeStringify = function (x) {
    return JSON.stringify(x);
  };                                                    
  exports.unsafeEncodeURIComponent = encodeURIComponent;
})(PS["Global.Unsafe"] = PS["Global.Unsafe"] || {});
(function(exports) {
  // Generated by purs version 0.12.0
  "use strict";
  var $foreign = PS["Global.Unsafe"];
  exports["unsafeStringify"] = $foreign.unsafeStringify;
  exports["unsafeEncodeURIComponent"] = $foreign.unsafeEncodeURIComponent;
})(PS["Global.Unsafe"] = PS["Global.Unsafe"] || {});
(function(exports) {
  // Generated by purs version 0.12.0
  "use strict";
  var Control_Semigroupoid = PS["Control.Semigroupoid"];
  var Data_Eq = PS["Data.Eq"];
  var Data_Functor = PS["Data.Functor"];
  var Data_Maybe = PS["Data.Maybe"];
  var Data_Monoid = PS["Data.Monoid"];
  var Data_Newtype = PS["Data.Newtype"];
  var Data_Ord = PS["Data.Ord"];
  var Data_Semigroup = PS["Data.Semigroup"];
  var Data_Show = PS["Data.Show"];
  var Data_String = PS["Data.String"];
  var Data_String_Common = PS["Data.String.Common"];
  var Data_Tuple = PS["Data.Tuple"];
  var Global_Unsafe = PS["Global.Unsafe"];
  var Prelude = PS["Prelude"];
  var toArray = function (v) {
      return v;
  };                                                                                                                 
  var encode = (function () {
      var encodePart = function (v) {
          if (v.value1 instanceof Data_Maybe.Nothing) {
              return Global_Unsafe.unsafeEncodeURIComponent(v.value0);
          };
          if (v.value1 instanceof Data_Maybe.Just) {
              return Global_Unsafe.unsafeEncodeURIComponent(v.value0) + ("=" + Global_Unsafe.unsafeEncodeURIComponent(v.value1.value0));
          };
          throw new Error("Failed pattern match at Data.FormURLEncoded line 35, column 18 - line 37, column 89: " + [ v.constructor.name ]);
      };
      return function ($14) {
          return Data_String_Common.joinWith("&")(Data_Functor.map(Data_Functor.functorArray)(encodePart)(toArray($14)));
      };
  })();
  exports["toArray"] = toArray;
  exports["encode"] = encode;
})(PS["Data.FormURLEncoded"] = PS["Data.FormURLEncoded"] || {});
(function(exports) {
  // Generated by purs version 0.12.0
  "use strict";
  var Data_Maybe = PS["Data.Maybe"];                 
  var Inl = (function () {
      function Inl(value0) {
          this.value0 = value0;
      };
      Inl.create = function (value0) {
          return new Inl(value0);
      };
      return Inl;
  })();
  var Inr = (function () {
      function Inr(value0) {
          this.value0 = value0;
      };
      Inr.create = function (value0) {
          return new Inr(value0);
      };
      return Inr;
  })();
  var NoArguments = (function () {
      function NoArguments() {

      };
      NoArguments.value = new NoArguments();
      return NoArguments;
  })();
  var Generic = function (from, to) {
      this.from = from;
      this.to = to;
  };
  var to = function (dict) {
      return dict.to;
  }; 
  var from = function (dict) {
      return dict.from;
  };
  exports["Generic"] = Generic;
  exports["to"] = to;
  exports["from"] = from;
  exports["NoArguments"] = NoArguments;
  exports["Inl"] = Inl;
  exports["Inr"] = Inr;
})(PS["Data.Generic.Rep"] = PS["Data.Generic.Rep"] || {});
(function(exports) {
  // Generated by purs version 0.12.0
  "use strict";
  var Data_Foldable = PS["Data.Foldable"];
  var Data_Generic_Rep = PS["Data.Generic.Rep"];
  var Data_Monoid = PS["Data.Monoid"];
  var Data_Semigroup = PS["Data.Semigroup"];
  var Data_Show = PS["Data.Show"];
  var Data_Symbol = PS["Data.Symbol"];
  var Prelude = PS["Prelude"];                 
  var GenericShow = function (genericShow$prime) {
      this["genericShow'"] = genericShow$prime;
  };
  var GenericShowArgs = function (genericShowArgs) {
      this.genericShowArgs = genericShowArgs;
  };
  var genericShowArgsNoArguments = new GenericShowArgs(function (v) {
      return [  ];
  });
  var genericShowArgsArgument = function (dictShow) {
      return new GenericShowArgs(function (v) {
          return [ Data_Show.show(dictShow)(v) ];
      });
  };
  var genericShowArgs = function (dict) {
      return dict.genericShowArgs;
  };
  var genericShowConstructor = function (dictGenericShowArgs) {
      return function (dictIsSymbol) {
          return new GenericShow(function (v) {
              var ctor = Data_Symbol.reflectSymbol(dictIsSymbol)(Data_Symbol.SProxy.value);
              var v1 = genericShowArgs(dictGenericShowArgs)(v);
              if (v1.length === 0) {
                  return ctor;
              };
              return "(" + (Data_Foldable.intercalate(Data_Foldable.foldableArray)(Data_Monoid.monoidString)(" ")(Data_Semigroup.append(Data_Semigroup.semigroupArray)([ ctor ])(v1)) + ")");
          });
      };
  };
  var genericShow$prime = function (dict) {
      return dict["genericShow'"];
  }; 
  var genericShowSum = function (dictGenericShow) {
      return function (dictGenericShow1) {
          return new GenericShow(function (v) {
              if (v instanceof Data_Generic_Rep.Inl) {
                  return genericShow$prime(dictGenericShow)(v.value0);
              };
              if (v instanceof Data_Generic_Rep.Inr) {
                  return genericShow$prime(dictGenericShow1)(v.value0);
              };
              throw new Error("Failed pattern match at Data.Generic.Rep.Show line 26, column 1 - line 26, column 83: " + [ v.constructor.name ]);
          });
      };
  };
  var genericShow = function (dictGeneric) {
      return function (dictGenericShow) {
          return function (x) {
              return genericShow$prime(dictGenericShow)(Data_Generic_Rep.from(dictGeneric)(x));
          };
      };
  };
  exports["GenericShow"] = GenericShow;
  exports["genericShow"] = genericShow;
  exports["GenericShowArgs"] = GenericShowArgs;
  exports["genericShowArgs"] = genericShowArgs;
  exports["genericShowArgsNoArguments"] = genericShowArgsNoArguments;
  exports["genericShowSum"] = genericShowSum;
  exports["genericShowConstructor"] = genericShowConstructor;
  exports["genericShowArgsArgument"] = genericShowArgsArgument;
})(PS["Data.Generic.Rep.Show"] = PS["Data.Generic.Rep.Show"] || {});
(function(exports) {
  // Generated by purs version 0.12.0
  "use strict";
  var Data_Either = PS["Data.Either"];
  var Data_Eq = PS["Data.Eq"];
  var Data_Ord = PS["Data.Ord"];
  var Data_Ordering = PS["Data.Ordering"];
  var Data_Semigroup = PS["Data.Semigroup"];
  var Data_Show = PS["Data.Show"];
  var Data_String = PS["Data.String"];
  var Data_String_Common = PS["Data.String.Common"];
  var Prelude = PS["Prelude"];                 
  var OPTIONS = (function () {
      function OPTIONS() {

      };
      OPTIONS.value = new OPTIONS();
      return OPTIONS;
  })();
  var GET = (function () {
      function GET() {

      };
      GET.value = new GET();
      return GET;
  })();
  var HEAD = (function () {
      function HEAD() {

      };
      HEAD.value = new HEAD();
      return HEAD;
  })();
  var POST = (function () {
      function POST() {

      };
      POST.value = new POST();
      return POST;
  })();
  var PUT = (function () {
      function PUT() {

      };
      PUT.value = new PUT();
      return PUT;
  })();
  var DELETE = (function () {
      function DELETE() {

      };
      DELETE.value = new DELETE();
      return DELETE;
  })();
  var TRACE = (function () {
      function TRACE() {

      };
      TRACE.value = new TRACE();
      return TRACE;
  })();
  var CONNECT = (function () {
      function CONNECT() {

      };
      CONNECT.value = new CONNECT();
      return CONNECT;
  })();
  var PROPFIND = (function () {
      function PROPFIND() {

      };
      PROPFIND.value = new PROPFIND();
      return PROPFIND;
  })();
  var PROPPATCH = (function () {
      function PROPPATCH() {

      };
      PROPPATCH.value = new PROPPATCH();
      return PROPPATCH;
  })();
  var MKCOL = (function () {
      function MKCOL() {

      };
      MKCOL.value = new MKCOL();
      return MKCOL;
  })();
  var COPY = (function () {
      function COPY() {

      };
      COPY.value = new COPY();
      return COPY;
  })();
  var MOVE = (function () {
      function MOVE() {

      };
      MOVE.value = new MOVE();
      return MOVE;
  })();
  var LOCK = (function () {
      function LOCK() {

      };
      LOCK.value = new LOCK();
      return LOCK;
  })();
  var UNLOCK = (function () {
      function UNLOCK() {

      };
      UNLOCK.value = new UNLOCK();
      return UNLOCK;
  })();
  var PATCH = (function () {
      function PATCH() {

      };
      PATCH.value = new PATCH();
      return PATCH;
  })();
  var unCustomMethod = function (v) {
      return v;
  };
  var showMethod = new Data_Show.Show(function (v) {
      if (v instanceof OPTIONS) {
          return "OPTIONS";
      };
      if (v instanceof GET) {
          return "GET";
      };
      if (v instanceof HEAD) {
          return "HEAD";
      };
      if (v instanceof POST) {
          return "POST";
      };
      if (v instanceof PUT) {
          return "PUT";
      };
      if (v instanceof DELETE) {
          return "DELETE";
      };
      if (v instanceof TRACE) {
          return "TRACE";
      };
      if (v instanceof CONNECT) {
          return "CONNECT";
      };
      if (v instanceof PROPFIND) {
          return "PROPFIND";
      };
      if (v instanceof PROPPATCH) {
          return "PROPPATCH";
      };
      if (v instanceof MKCOL) {
          return "MKCOL";
      };
      if (v instanceof COPY) {
          return "COPY";
      };
      if (v instanceof MOVE) {
          return "MOVE";
      };
      if (v instanceof LOCK) {
          return "LOCK";
      };
      if (v instanceof UNLOCK) {
          return "UNLOCK";
      };
      if (v instanceof PATCH) {
          return "PATCH";
      };
      throw new Error("Failed pattern match at Data.HTTP.Method line 40, column 1 - line 40, column 35: " + [ v.constructor.name ]);
  });
  var print = Data_Either.either(Data_Show.show(showMethod))(unCustomMethod);
  exports["OPTIONS"] = OPTIONS;
  exports["GET"] = GET;
  exports["HEAD"] = HEAD;
  exports["POST"] = POST;
  exports["PUT"] = PUT;
  exports["DELETE"] = DELETE;
  exports["TRACE"] = TRACE;
  exports["CONNECT"] = CONNECT;
  exports["PROPFIND"] = PROPFIND;
  exports["PROPPATCH"] = PROPPATCH;
  exports["MKCOL"] = MKCOL;
  exports["COPY"] = COPY;
  exports["MOVE"] = MOVE;
  exports["LOCK"] = LOCK;
  exports["UNLOCK"] = UNLOCK;
  exports["PATCH"] = PATCH;
  exports["unCustomMethod"] = unCustomMethod;
  exports["print"] = print;
  exports["showMethod"] = showMethod;
})(PS["Data.HTTP.Method"] = PS["Data.HTTP.Method"] || {});
(function(exports) {
  // Generated by purs version 0.12.0
  "use strict";
  var Control_Category = PS["Control.Category"];
  var Control_Semigroupoid = PS["Control.Semigroupoid"];
  var Data_Newtype = PS["Data.Newtype"];
  var Prelude = PS["Prelude"];                 
  var Profunctor = function (dimap) {
      this.dimap = dimap;
  };
  var profunctorFn = new Profunctor(function (a2b) {
      return function (c2d) {
          return function (b2c) {
              return function ($9) {
                  return c2d(b2c(a2b($9)));
              };
          };
      };
  });
  var dimap = function (dict) {
      return dict.dimap;
  };
  var rmap = function (dictProfunctor) {
      return function (b2c) {
          return dimap(dictProfunctor)(Control_Category.identity(Control_Category.categoryFn))(b2c);
      };
  };
  exports["dimap"] = dimap;
  exports["Profunctor"] = Profunctor;
  exports["rmap"] = rmap;
  exports["profunctorFn"] = profunctorFn;
})(PS["Data.Profunctor"] = PS["Data.Profunctor"] || {});
(function(exports) {
  // Generated by purs version 0.12.0
  "use strict";
  var Control_Category = PS["Control.Category"];
  var Control_Semigroupoid = PS["Control.Semigroupoid"];
  var Data_Either = PS["Data.Either"];
  var Data_Function = PS["Data.Function"];
  var Data_Functor = PS["Data.Functor"];
  var Data_Profunctor = PS["Data.Profunctor"];
  var Prelude = PS["Prelude"];                 
  var Choice = function (Profunctor0, left, right) {
      this.Profunctor0 = Profunctor0;
      this.left = left;
      this.right = right;
  };
  var right = function (dict) {
      return dict.right;
  };
  var left = function (dict) {
      return dict.left;
  };
  exports["left"] = left;
  exports["right"] = right;
  exports["Choice"] = Choice;
})(PS["Data.Profunctor.Choice"] = PS["Data.Profunctor.Choice"] || {});
(function(exports) {
  // Generated by purs version 0.12.0
  "use strict";
  var Control_Category = PS["Control.Category"];
  var Control_Semigroupoid = PS["Control.Semigroupoid"];
  var Data_Functor = PS["Data.Functor"];
  var Data_Profunctor = PS["Data.Profunctor"];
  var Data_Tuple = PS["Data.Tuple"];
  var Prelude = PS["Prelude"];                 
  var Strong = function (Profunctor0, first, second) {
      this.Profunctor0 = Profunctor0;
      this.first = first;
      this.second = second;
  };
  var strongFn = new Strong(function () {
      return Data_Profunctor.profunctorFn;
  }, function (a2b) {
      return function (v) {
          return new Data_Tuple.Tuple(a2b(v.value0), v.value1);
      };
  }, Data_Functor.map(Data_Tuple.functorTuple));
  var second = function (dict) {
      return dict.second;
  };
  var first = function (dict) {
      return dict.first;
  };
  var splitStrong = function (dictCategory) {
      return function (dictStrong) {
          return function (l) {
              return function (r) {
                  return Control_Semigroupoid.composeFlipped(dictCategory.Semigroupoid0())(first(dictStrong)(l))(second(dictStrong)(r));
              };
          };
      };
  };
  var fanout = function (dictCategory) {
      return function (dictStrong) {
          return function (l) {
              return function (r) {
                  var split = Data_Profunctor.dimap(dictStrong.Profunctor0())(Control_Category.identity(Control_Category.categoryFn))(function (a) {
                      return new Data_Tuple.Tuple(a, a);
                  })(Control_Category.identity(dictCategory));
                  return Control_Semigroupoid.composeFlipped(dictCategory.Semigroupoid0())(split)(splitStrong(dictCategory)(dictStrong)(l)(r));
              };
          };
      };
  };
  exports["first"] = first;
  exports["second"] = second;
  exports["Strong"] = Strong;
  exports["splitStrong"] = splitStrong;
  exports["fanout"] = fanout;
  exports["strongFn"] = strongFn;
})(PS["Data.Profunctor.Strong"] = PS["Data.Profunctor.Strong"] || {});
(function(exports) {
  // Generated by purs version 0.12.0
  "use strict";
  var Data_Functor = PS["Data.Functor"];
  var Data_Identity = PS["Data.Identity"];
  var Data_Newtype = PS["Data.Newtype"];
  var Data_Profunctor_Choice = PS["Data.Profunctor.Choice"];
  var Data_Profunctor_Star = PS["Data.Profunctor.Star"];
  var Data_Profunctor_Strong = PS["Data.Profunctor.Strong"];
  var Prelude = PS["Prelude"];                 
  var Wander = function (Choice1, Strong0, wander) {
      this.Choice1 = Choice1;
      this.Strong0 = Strong0;
      this.wander = wander;
  }; 
  var wander = function (dict) {
      return dict.wander;
  };
  exports["wander"] = wander;
  exports["Wander"] = Wander;
})(PS["Data.Lens.Internal.Wander"] = PS["Data.Lens.Internal.Wander"] || {});
(function(exports) {
  // Generated by purs version 0.12.0
  "use strict";
  var Control_Semigroupoid = PS["Control.Semigroupoid"];
  var Data_Const = PS["Data.Const"];
  var Data_Either = PS["Data.Either"];
  var Data_Functor = PS["Data.Functor"];
  var Data_Lens_Internal_Wander = PS["Data.Lens.Internal.Wander"];
  var Data_Monoid = PS["Data.Monoid"];
  var Data_Newtype = PS["Data.Newtype"];
  var Data_Profunctor = PS["Data.Profunctor"];
  var Data_Profunctor_Choice = PS["Data.Profunctor.Choice"];
  var Data_Profunctor_Cochoice = PS["Data.Profunctor.Cochoice"];
  var Data_Profunctor_Strong = PS["Data.Profunctor.Strong"];
  var Data_Semigroup = PS["Data.Semigroup"];
  var Data_Tuple = PS["Data.Tuple"];
  var Prelude = PS["Prelude"];                 
  var Forget = function (x) {
      return x;
  };
  var profunctorForget = new Data_Profunctor.Profunctor(function (f) {
      return function (v) {
          return function (v1) {
              return function ($27) {
                  return v1(f($27));
              };
          };
      };
  });
  var strongForget = new Data_Profunctor_Strong.Strong(function () {
      return profunctorForget;
  }, function (v) {
      return function ($28) {
          return v(Data_Tuple.fst($28));
      };
  }, function (v) {
      return function ($29) {
          return v(Data_Tuple.snd($29));
      };
  });
  var newtypeForget = new Data_Newtype.Newtype(function (n) {
      return n;
  }, Forget);
  var choiceForget = function (dictMonoid) {
      return new Data_Profunctor_Choice.Choice(function () {
          return profunctorForget;
      }, function (v) {
          return Data_Either.either(v)(Data_Monoid.mempty(Data_Monoid.monoidFn(dictMonoid)));
      }, function (v) {
          return Data_Either.either(Data_Monoid.mempty(Data_Monoid.monoidFn(dictMonoid)))(v);
      });
  };
  var wanderForget = function (dictMonoid) {
      return new Data_Lens_Internal_Wander.Wander(function () {
          return choiceForget(dictMonoid);
      }, function () {
          return strongForget;
      }, function (f) {
          return function (v) {
              return Data_Newtype.alaF(Data_Functor.functorFn)(Data_Functor.functorFn)(Data_Const.newtypeConst)(Data_Const.newtypeConst)(Data_Const.Const)(f(Data_Const.applicativeConst(dictMonoid)))(v);
          };
      });
  };
  exports["Forget"] = Forget;
  exports["newtypeForget"] = newtypeForget;
  exports["profunctorForget"] = profunctorForget;
  exports["choiceForget"] = choiceForget;
  exports["strongForget"] = strongForget;
  exports["wanderForget"] = wanderForget;
})(PS["Data.Lens.Internal.Forget"] = PS["Data.Lens.Internal.Forget"] || {});
(function(exports) {
  // Generated by purs version 0.12.0
  "use strict";
  var Control_Applicative = PS["Control.Applicative"];
  var Control_Apply = PS["Control.Apply"];
  var Control_Category = PS["Control.Category"];
  var Control_Semigroupoid = PS["Control.Semigroupoid"];
  var Data_Either = PS["Data.Either"];
  var Data_Eq = PS["Data.Eq"];
  var Data_Foldable = PS["Data.Foldable"];
  var Data_Function = PS["Data.Function"];
  var Data_Functor = PS["Data.Functor"];
  var Data_HeytingAlgebra = PS["Data.HeytingAlgebra"];
  var Data_Lens_Internal_Forget = PS["Data.Lens.Internal.Forget"];
  var Data_Lens_Internal_Indexed = PS["Data.Lens.Internal.Indexed"];
  var Data_Lens_Types = PS["Data.Lens.Types"];
  var Data_List = PS["Data.List"];
  var Data_List_Types = PS["Data.List.Types"];
  var Data_Maybe = PS["Data.Maybe"];
  var Data_Maybe_First = PS["Data.Maybe.First"];
  var Data_Maybe_Last = PS["Data.Maybe.Last"];
  var Data_Monoid = PS["Data.Monoid"];
  var Data_Monoid_Additive = PS["Data.Monoid.Additive"];
  var Data_Monoid_Conj = PS["Data.Monoid.Conj"];
  var Data_Monoid_Disj = PS["Data.Monoid.Disj"];
  var Data_Monoid_Dual = PS["Data.Monoid.Dual"];
  var Data_Monoid_Endo = PS["Data.Monoid.Endo"];
  var Data_Monoid_Multiplicative = PS["Data.Monoid.Multiplicative"];
  var Data_Newtype = PS["Data.Newtype"];
  var Data_Ord = PS["Data.Ord"];
  var Data_Profunctor = PS["Data.Profunctor"];
  var Data_Profunctor_Choice = PS["Data.Profunctor.Choice"];
  var Data_Ring = PS["Data.Ring"];
  var Data_Semigroup = PS["Data.Semigroup"];
  var Data_Tuple = PS["Data.Tuple"];
  var Data_Unit = PS["Data.Unit"];
  var Prelude = PS["Prelude"];
  var foldMapOf = Data_Newtype.under(Data_Lens_Internal_Forget.newtypeForget)(Data_Lens_Internal_Forget.newtypeForget)(Data_Lens_Internal_Forget.Forget);
  var preview = function (p) {
      return function ($64) {
          return Data_Newtype.unwrap(Data_Maybe_First.newtypeFirst)(foldMapOf(p)(function ($65) {
              return Data_Maybe_First.First(Data_Maybe.Just.create($65));
          })($64));
      };
  };
  var previewOn = function (s) {
      return function (p) {
          return preview(p)(s);
      };
  };
  exports["previewOn"] = previewOn;
  exports["preview"] = preview;
  exports["foldMapOf"] = foldMapOf;
})(PS["Data.Lens.Fold"] = PS["Data.Lens.Fold"] || {});
(function(exports) {
  // Generated by purs version 0.12.0
  "use strict";
  var Control_Category = PS["Control.Category"];
  var Control_Monad_State_Class = PS["Control.Monad.State.Class"];
  var Control_Semigroupoid = PS["Control.Semigroupoid"];
  var Data_Function = PS["Data.Function"];
  var Data_Lens_Internal_Forget = PS["Data.Lens.Internal.Forget"];
  var Data_Lens_Internal_Indexed = PS["Data.Lens.Internal.Indexed"];
  var Data_Lens_Types = PS["Data.Lens.Types"];
  var Data_Newtype = PS["Data.Newtype"];
  var Data_Profunctor_Strong = PS["Data.Profunctor.Strong"];
  var Data_Tuple = PS["Data.Tuple"];
  var Prelude = PS["Prelude"];                 
  var view = function (l) {
      return Data_Newtype.unwrap(Data_Lens_Internal_Forget.newtypeForget)(l(Control_Category.identity(Control_Category.categoryFn)));
  };
  var viewOn = function (s) {
      return function (l) {
          return view(l)(s);
      };
  };
  var to = function (f) {
      return function (p) {
          return function ($7) {
              return Data_Newtype.unwrap(Data_Lens_Internal_Forget.newtypeForget)(p)(f($7));
          };
      };
  };
  exports["viewOn"] = viewOn;
  exports["view"] = view;
  exports["to"] = to;
})(PS["Data.Lens.Getter"] = PS["Data.Lens.Getter"] || {});
(function(exports) {
  // Generated by purs version 0.12.0
  "use strict";
  var Control_Applicative = PS["Control.Applicative"];
  var Control_Semigroupoid = PS["Control.Semigroupoid"];
  var Data_Array = PS["Data.Array"];
  var Data_Eq = PS["Data.Eq"];
  var Data_Function = PS["Data.Function"];
  var Data_Functor = PS["Data.Functor"];
  var Data_Identity = PS["Data.Identity"];
  var Data_Lens_Internal_Wander = PS["Data.Lens.Internal.Wander"];
  var Data_Lens_Types = PS["Data.Lens.Types"];
  var Data_Map = PS["Data.Map"];
  var Data_Map_Internal = PS["Data.Map.Internal"];
  var Data_Maybe = PS["Data.Maybe"];
  var Data_Set = PS["Data.Set"];
  var Data_Traversable = PS["Data.Traversable"];
  var Foreign_Object = PS["Foreign.Object"];
  var Prelude = PS["Prelude"];                 
  var Index = function (ix) {
      this.ix = ix;
  };
  var ix = function (dict) {
      return dict.ix;
  }; 
  var indexMap = function (dictOrd) {
      return new Index(function (k) {
          return function (dictWander) {
              return Data_Lens_Internal_Wander.wander(dictWander)(function (dictApplicative) {
                  return function (coalg) {
                      return function (m) {
                          return Data_Maybe.maybe(Control_Applicative.pure(dictApplicative)(m))(function ($21) {
                              return Data_Functor.map((dictApplicative.Apply0()).Functor0())(function (v) {
                                  return Data_Map_Internal.insert(dictOrd)(k)(v)(m);
                              })(coalg($21));
                          })(Data_Map_Internal.lookup(dictOrd)(k)(m));
                      };
                  };
              });
          };
      });
  };
  exports["Index"] = Index;
  exports["ix"] = ix;
  exports["indexMap"] = indexMap;
})(PS["Data.Lens.Index"] = PS["Data.Lens.Index"] || {});
(function(exports) {
  // Generated by purs version 0.12.0
  "use strict";
  var Control_Semigroupoid = PS["Control.Semigroupoid"];
  var Data_Newtype = PS["Data.Newtype"];
  var Data_Profunctor = PS["Data.Profunctor"];
  var Data_Profunctor_Choice = PS["Data.Profunctor.Choice"];
  var Data_Profunctor_Cochoice = PS["Data.Profunctor.Cochoice"];
  var Data_Profunctor_Costrong = PS["Data.Profunctor.Costrong"];
  var Data_Profunctor_Strong = PS["Data.Profunctor.Strong"];
  var Prelude = PS["Prelude"];                 
  var Re = function (x) {
      return x;
  };
  var profunctorRe = function (dictProfunctor) {
      return new Data_Profunctor.Profunctor(function (f) {
          return function (g) {
              return function (v) {
                  return function ($28) {
                      return v(Data_Profunctor.dimap(dictProfunctor)(g)(f)($28));
                  };
              };
          };
      });
  };
  var newtypeRe = new Data_Newtype.Newtype(function (n) {
      return n;
  }, Re);
  exports["Re"] = Re;
  exports["newtypeRe"] = newtypeRe;
  exports["profunctorRe"] = profunctorRe;
})(PS["Data.Lens.Internal.Re"] = PS["Data.Lens.Internal.Re"] || {});
(function(exports) {
  // Generated by purs version 0.12.0
  "use strict";
  var Control_Category = PS["Control.Category"];
  var Control_Semigroupoid = PS["Control.Semigroupoid"];
  var Data_Boolean = PS["Data.Boolean"];
  var Data_Eq = PS["Data.Eq"];
  var Data_Function = PS["Data.Function"];
  var Data_Functor = PS["Data.Functor"];
  var Data_Lens_Internal_Exchange = PS["Data.Lens.Internal.Exchange"];
  var Data_Lens_Internal_Re = PS["Data.Lens.Internal.Re"];
  var Data_Lens_Types = PS["Data.Lens.Types"];
  var Data_Maybe = PS["Data.Maybe"];
  var Data_Newtype = PS["Data.Newtype"];
  var Data_Profunctor = PS["Data.Profunctor"];
  var Data_Tuple = PS["Data.Tuple"];
  var Prelude = PS["Prelude"];
  var re = function (t) {
      return Data_Newtype.unwrap(Data_Lens_Internal_Re.newtypeRe)(t(Control_Category.identity(Control_Category.categoryFn)));
  };
  var iso = function (f) {
      return function (g) {
          return function (dictProfunctor) {
              return function (pab) {
                  return Data_Profunctor.dimap(dictProfunctor)(f)(g)(pab);
              };
          };
      };
  };
  exports["iso"] = iso;
  exports["re"] = re;
})(PS["Data.Lens.Iso"] = PS["Data.Lens.Iso"] || {});
(function(exports) {
  // Generated by purs version 0.12.0
  "use strict";
  var Data_Lens_Iso = PS["Data.Lens.Iso"];
  var Data_Newtype = PS["Data.Newtype"];                 
  var _Newtype = function (dictNewtype) {
      return function (dictNewtype1) {
          return function (dictProfunctor) {
              return Data_Lens_Iso.iso(Data_Newtype.unwrap(dictNewtype))(Data_Newtype.wrap(dictNewtype1))(dictProfunctor);
          };
      };
  };
  exports["_Newtype"] = _Newtype;
})(PS["Data.Lens.Iso.Newtype"] = PS["Data.Lens.Iso.Newtype"] || {});
(function(exports) {
  // Generated by purs version 0.12.0
  "use strict";
  var Control_Category = PS["Control.Category"];
  var Data_Lens_Internal_Indexed = PS["Data.Lens.Internal.Indexed"];
  var Data_Lens_Internal_Shop = PS["Data.Lens.Internal.Shop"];
  var Data_Lens_Types = PS["Data.Lens.Types"];
  var Data_Newtype = PS["Data.Newtype"];
  var Data_Profunctor = PS["Data.Profunctor"];
  var Data_Profunctor_Strong = PS["Data.Profunctor.Strong"];
  var Data_Tuple = PS["Data.Tuple"];
  var Prelude = PS["Prelude"];
  var lens$prime = function (to) {
      return function (dictStrong) {
          return function (pab) {
              return Data_Profunctor.dimap(dictStrong.Profunctor0())(to)(function (v) {
                  return v.value1(v.value0);
              })(Data_Profunctor_Strong.first(dictStrong)(pab));
          };
      };
  };
  var lens = function (get) {
      return function (set) {
          return function (dictStrong) {
              return lens$prime(function (s) {
                  return new Data_Tuple.Tuple(get(s), function (b) {
                      return set(s)(b);
                  });
              })(dictStrong);
          };
      };
  };
  exports["lens"] = lens;
})(PS["Data.Lens.Lens"] = PS["Data.Lens.Lens"] || {});
(function(exports) {
  // Generated by purs version 0.12.0
  "use strict";
  var Data_Lens_Lens = PS["Data.Lens.Lens"];
  var Data_Profunctor_Strong = PS["Data.Profunctor.Strong"];
  var Data_Tuple = PS["Data.Tuple"];                 
  var _2 = function (dictStrong) {
      return Data_Profunctor_Strong.second(dictStrong);
  };
  exports["_2"] = _2;
})(PS["Data.Lens.Lens.Tuple"] = PS["Data.Lens.Lens.Tuple"] || {});
(function(exports) {
  // Generated by purs version 0.12.0
  "use strict";
  var Control_Category = PS["Control.Category"];
  var Control_MonadPlus = PS["Control.MonadPlus"];
  var Control_MonadZero = PS["Control.MonadZero"];
  var Control_Semigroupoid = PS["Control.Semigroupoid"];
  var Data_Either = PS["Data.Either"];
  var Data_Eq = PS["Data.Eq"];
  var Data_Function = PS["Data.Function"];
  var Data_HeytingAlgebra = PS["Data.HeytingAlgebra"];
  var Data_Lens_Internal_Market = PS["Data.Lens.Internal.Market"];
  var Data_Lens_Internal_Tagged = PS["Data.Lens.Internal.Tagged"];
  var Data_Lens_Types = PS["Data.Lens.Types"];
  var Data_Maybe = PS["Data.Maybe"];
  var Data_Newtype = PS["Data.Newtype"];
  var Data_Profunctor = PS["Data.Profunctor"];
  var Data_Profunctor_Choice = PS["Data.Profunctor.Choice"];
  var Prelude = PS["Prelude"];                                                                                                                        
  var prism = function (to) {
      return function (fro) {
          return function (dictChoice) {
              return function (pab) {
                  return Data_Profunctor.dimap(dictChoice.Profunctor0())(fro)(Data_Either.either(Control_Category.identity(Control_Category.categoryFn))(Control_Category.identity(Control_Category.categoryFn)))(Data_Profunctor_Choice.right(dictChoice)(Data_Profunctor.rmap(dictChoice.Profunctor0())(to)(pab)));
              };
          };
      };
  };
  var prism$prime = function (to) {
      return function (fro) {
          return function (dictChoice) {
              return prism(to)(function (s) {
                  return Data_Maybe.maybe(new Data_Either.Left(s))(Data_Either.Right.create)(fro(s));
              })(dictChoice);
          };
      };
  };
  exports["prism'"] = prism$prime;
  exports["prism"] = prism;
})(PS["Data.Lens.Prism"] = PS["Data.Lens.Prism"] || {});
(function(exports) {
    "use strict";

  exports.unsafeUnionFn = function(r1, r2) {
    var copy = {};
    for (var k1 in r2) {
      if ({}.hasOwnProperty.call(r2, k1)) {
        copy[k1] = r2[k1];
      }
    }
    for (var k2 in r1) {
      if ({}.hasOwnProperty.call(r1, k2)) {
        copy[k2] = r1[k2];
      }
    }
    return copy;
  };
})(PS["Record.Unsafe.Union"] = PS["Record.Unsafe.Union"] || {});
(function(exports) {
  // Generated by purs version 0.12.0
  "use strict";
  var $foreign = PS["Record.Unsafe.Union"];
  var Data_Function_Uncurried = PS["Data.Function.Uncurried"];
  exports["unsafeUnionFn"] = $foreign.unsafeUnionFn;
})(PS["Record.Unsafe.Union"] = PS["Record.Unsafe.Union"] || {});
(function(exports) {
  // Generated by purs version 0.12.0
  "use strict";
  var Type_Data_Boolean = PS["Type.Data.Boolean"];
  var Type_Data_Symbol = PS["Type.Data.Symbol"];
  var Type_Equality = PS["Type.Equality"];
  var RLProxy = (function () {
      function RLProxy() {

      };
      RLProxy.value = new RLProxy();
      return RLProxy;
  })();
  exports["RLProxy"] = RLProxy;
})(PS["Type.Row"] = PS["Type.Row"] || {});
(function(exports) {
  // Generated by purs version 0.12.0
  "use strict";
  var Data_Eq = PS["Data.Eq"];
  var Data_Function_Uncurried = PS["Data.Function.Uncurried"];
  var Data_HeytingAlgebra = PS["Data.HeytingAlgebra"];
  var Data_Symbol = PS["Data.Symbol"];
  var Prelude = PS["Prelude"];
  var Record_Unsafe = PS["Record.Unsafe"];
  var Record_Unsafe_Union = PS["Record.Unsafe.Union"];
  var Type_Row = PS["Type.Row"];
  var Unsafe_Coerce = PS["Unsafe.Coerce"];
  var set = function (dictIsSymbol) {
      return function (dictCons) {
          return function (dictCons1) {
              return function (l) {
                  return function (b) {
                      return function (r) {
                          return Record_Unsafe.unsafeSet(Data_Symbol.reflectSymbol(dictIsSymbol)(l))(b)(r);
                      };
                  };
              };
          };
      };
  };
  var merge = function (dictUnion) {
      return function (dictNub) {
          return function (l) {
              return function (r) {
                  return Record_Unsafe_Union.unsafeUnionFn(l, r);
              };
          };
      };
  };
  var insert = function (dictIsSymbol) {
      return function (dictLacks) {
          return function (dictCons) {
              return function (l) {
                  return function (a) {
                      return function (r) {
                          return Record_Unsafe.unsafeSet(Data_Symbol.reflectSymbol(dictIsSymbol)(l))(a)(r);
                      };
                  };
              };
          };
      };
  };
  var get = function (dictIsSymbol) {
      return function (dictCons) {
          return function (l) {
              return function (r) {
                  return Record_Unsafe.unsafeGet(Data_Symbol.reflectSymbol(dictIsSymbol)(l))(r);
              };
          };
      };
  };
  exports["get"] = get;
  exports["set"] = set;
  exports["insert"] = insert;
  exports["merge"] = merge;
})(PS["Record"] = PS["Record"] || {});
(function(exports) {
  // Generated by purs version 0.12.0
  "use strict";
  var Data_Function = PS["Data.Function"];
  var Data_Lens = PS["Data.Lens"];
  var Data_Lens_Lens = PS["Data.Lens.Lens"];
  var Data_Symbol = PS["Data.Symbol"];
  var Prelude = PS["Prelude"];
  var Record = PS["Record"];                 
  var prop = function (dictIsSymbol) {
      return function (dictCons) {
          return function (dictCons1) {
              return function (l) {
                  return function (dictStrong) {
                      return Data_Lens_Lens.lens(Record.get(dictIsSymbol)(dictCons)(l))(Data_Function.flip(Record.set(dictIsSymbol)(dictCons)(dictCons1)(l)))(dictStrong);
                  };
              };
          };
      };
  };
  exports["prop"] = prop;
})(PS["Data.Lens.Record"] = PS["Data.Lens.Record"] || {});
(function(exports) {
  // Generated by purs version 0.12.0
  "use strict";
  var Control_Bind = PS["Control.Bind"];
  var Control_Category = PS["Control.Category"];
  var Control_Semigroupoid = PS["Control.Semigroupoid"];
  var Data_Boolean = PS["Data.Boolean"];
  var Data_Eq = PS["Data.Eq"];
  var Data_Foldable = PS["Data.Foldable"];
  var Data_Function = PS["Data.Function"];
  var Data_Functor = PS["Data.Functor"];
  var Data_List = PS["Data.List"];
  var Data_List_Types = PS["Data.List.Types"];
  var Data_Maybe = PS["Data.Maybe"];
  var Data_NonEmpty = PS["Data.NonEmpty"];
  var Data_Ord = PS["Data.Ord"];
  var Data_Ring = PS["Data.Ring"];
  var Data_Semigroup = PS["Data.Semigroup"];
  var Data_Semigroup_Foldable = PS["Data.Semigroup.Foldable"];
  var Data_Semigroup_Traversable = PS["Data.Semigroup.Traversable"];
  var Data_Semiring = PS["Data.Semiring"];
  var Data_Traversable = PS["Data.Traversable"];
  var Data_Tuple = PS["Data.Tuple"];
  var Data_Unfoldable = PS["Data.Unfoldable"];
  var Partial_Unsafe = PS["Partial.Unsafe"];
  var Prelude = PS["Prelude"];
  var singleton = function ($160) {
      return Data_List_Types.NonEmptyList(Data_NonEmpty.singleton(Data_List_Types.plusList)($160));
  };
  exports["singleton"] = singleton;
})(PS["Data.List.NonEmpty"] = PS["Data.List.NonEmpty"] || {});
(function(exports) {
  // Generated by purs version 0.12.0
  "use strict";
  var Data_Eq = PS["Data.Eq"];
  var Data_Newtype = PS["Data.Newtype"];
  var Data_Ord = PS["Data.Ord"];
  var Data_Semigroup = PS["Data.Semigroup"];
  var Data_Show = PS["Data.Show"];
  var Prelude = PS["Prelude"];                 
  var MediaType = function (x) {
      return x;
  }; 
  var newtypeMediaType = new Data_Newtype.Newtype(function (n) {
      return n;
  }, MediaType);
  exports["MediaType"] = MediaType;
  exports["newtypeMediaType"] = newtypeMediaType;
})(PS["Data.MediaType"] = PS["Data.MediaType"] || {});
(function(exports) {
  // Generated by purs version 0.12.0
  "use strict";
  var Data_MediaType = PS["Data.MediaType"];           
  var applicationJSON = "application/json";
  var applicationFormURLEncoded = "application/x-www-form-urlencoded";
  exports["applicationFormURLEncoded"] = applicationFormURLEncoded;
  exports["applicationJSON"] = applicationJSON;
})(PS["Data.MediaType.Common"] = PS["Data.MediaType.Common"] || {});
(function(exports) {
    "use strict";

  exports["null"] = null;

  exports.nullable = function (a, r, f) {
    return a == null ? r : f(a);
  };

  exports.notNull = function (x) {
    return x;
  };
})(PS["Data.Nullable"] = PS["Data.Nullable"] || {});
(function(exports) {
  // Generated by purs version 0.12.0
  "use strict";
  var $foreign = PS["Data.Nullable"];
  var Control_Semigroupoid = PS["Control.Semigroupoid"];
  var Data_Eq = PS["Data.Eq"];
  var Data_Function = PS["Data.Function"];
  var Data_Function_Uncurried = PS["Data.Function.Uncurried"];
  var Data_Maybe = PS["Data.Maybe"];
  var Data_Ord = PS["Data.Ord"];
  var Data_Show = PS["Data.Show"];
  var Prelude = PS["Prelude"];                 
  var toNullable = Data_Maybe.maybe($foreign["null"])($foreign.notNull);
  var toMaybe = function (n) {
      return $foreign.nullable(n, Data_Maybe.Nothing.value, Data_Maybe.Just.create);
  };
  exports["toMaybe"] = toMaybe;
  exports["toNullable"] = toNullable;
})(PS["Data.Nullable"] = PS["Data.Nullable"] || {});
(function(exports) {function wrap(method) {
    return function(d) {
      return function(num) {
        return method.apply(num, [d]);
      };
    };
  }

  exports.toPrecisionNative   = wrap(Number.prototype.toPrecision);
  exports.toFixedNative       = wrap(Number.prototype.toFixed);
  exports.toExponentialNative = wrap(Number.prototype.toExponential);
})(PS["Data.Number.Format"] = PS["Data.Number.Format"] || {});
(function(exports) {
  // Generated by purs version 0.12.0
  "use strict";
  var $foreign = PS["Data.Number.Format"];
  var Control_Semigroupoid = PS["Control.Semigroupoid"];
  var Data_Ord = PS["Data.Ord"];
  var Prelude = PS["Prelude"];                 
  var Precision = (function () {
      function Precision(value0) {
          this.value0 = value0;
      };
      Precision.create = function (value0) {
          return new Precision(value0);
      };
      return Precision;
  })();
  var Fixed = (function () {
      function Fixed(value0) {
          this.value0 = value0;
      };
      Fixed.create = function (value0) {
          return new Fixed(value0);
      };
      return Fixed;
  })();
  var Exponential = (function () {
      function Exponential(value0) {
          this.value0 = value0;
      };
      Exponential.create = function (value0) {
          return new Exponential(value0);
      };
      return Exponential;
  })();
  var toStringWith = function (v) {
      if (v instanceof Precision) {
          return $foreign.toPrecisionNative(v.value0);
      };
      if (v instanceof Fixed) {
          return $foreign.toFixedNative(v.value0);
      };
      if (v instanceof Exponential) {
          return $foreign.toExponentialNative(v.value0);
      };
      throw new Error("Failed pattern match at Data.Number.Format line 59, column 1 - line 59, column 40: " + [ v.constructor.name ]);
  };
  var precision = function ($5) {
      return Precision.create(Data_Ord.clamp(Data_Ord.ordInt)(1)(21)($5));
  };
  var fixed = function ($6) {
      return Fixed.create(Data_Ord.clamp(Data_Ord.ordInt)(0)(20)($6));
  };
  var exponential = function ($7) {
      return Exponential.create(Data_Ord.clamp(Data_Ord.ordInt)(0)(20)($7));
  };
  exports["precision"] = precision;
  exports["fixed"] = fixed;
  exports["exponential"] = exponential;
  exports["toStringWith"] = toStringWith;
})(PS["Data.Number.Format"] = PS["Data.Number.Format"] || {});
(function(exports) {
  // Generated by purs version 0.12.0
  "use strict";
  var Control_Applicative = PS["Control.Applicative"];
  var Control_Apply = PS["Control.Apply"];
  var Control_Bind = PS["Control.Bind"];
  var Control_Monad = PS["Control.Monad"];
  var Control_Semigroupoid = PS["Control.Semigroupoid"];
  var Data_Distributive = PS["Data.Distributive"];
  var Data_Eq = PS["Data.Eq"];
  var Data_Foldable = PS["Data.Foldable"];
  var Data_Functor = PS["Data.Functor"];
  var Data_HeytingAlgebra = PS["Data.HeytingAlgebra"];
  var Data_Monoid = PS["Data.Monoid"];
  var Data_Ord = PS["Data.Ord"];
  var Data_Ordering = PS["Data.Ordering"];
  var Data_Semigroup = PS["Data.Semigroup"];
  var Data_Show = PS["Data.Show"];
  var Data_Traversable = PS["Data.Traversable"];
  var Prelude = PS["Prelude"];
  var Test_QuickCheck_Arbitrary = PS["Test.QuickCheck.Arbitrary"];
  var Test_QuickCheck_Gen = PS["Test.QuickCheck.Gen"];                 
  var Pair = (function () {
      function Pair(value0, value1) {
          this.value0 = value0;
          this.value1 = value1;
      };
      Pair.create = function (value0) {
          return function (value1) {
              return new Pair(value0, value1);
          };
      };
      return Pair;
  })();
  var showPair = function (dictShow) {
      return new Data_Show.Show(function (v) {
          return "(" + (Data_Show.show(dictShow)(v.value0) + (" ~ " + (Data_Show.show(dictShow)(v.value1) + ")")));
      });
  };
  var functorPair = new Data_Functor.Functor(function (f) {
      return function (v) {
          return new Pair(f(v.value0), f(v.value1));
      };
  });
  var fst = function (v) {
      return v.value0;
  };
  exports["Pair"] = Pair;
  exports["fst"] = fst;
  exports["showPair"] = showPair;
  exports["functorPair"] = functorPair;
})(PS["Data.Pair"] = PS["Data.Pair"] || {});
(function(exports) {
  // Generated by purs version 0.12.0
  "use strict";
  var Control_Category = PS["Control.Category"];
  var Control_Semigroupoid = PS["Control.Semigroupoid"];
  var Data_Eq = PS["Data.Eq"];
  var Data_EuclideanRing = PS["Data.EuclideanRing"];
  var Data_Monoid = PS["Data.Monoid"];
  var Data_Newtype = PS["Data.Newtype"];
  var Data_Ord = PS["Data.Ord"];
  var Data_Ring = PS["Data.Ring"];
  var Data_Semigroup = PS["Data.Semigroup"];
  var Data_Semiring = PS["Data.Semiring"];
  var Data_Show = PS["Data.Show"];
  var Prelude = PS["Prelude"];
  var Milliseconds = function (x) {
      return x;
  };          
  var newtypeMilliseconds = new Data_Newtype.Newtype(function (n) {
      return n;
  }, Milliseconds);
  exports["Milliseconds"] = Milliseconds;
  exports["newtypeMilliseconds"] = newtypeMilliseconds;
})(PS["Data.Time.Duration"] = PS["Data.Time.Duration"] || {});
(function(exports) {
  // Generated by purs version 0.12.0
  "use strict";
  var Control_Applicative = PS["Control.Applicative"];
  var Control_Apply = PS["Control.Apply"];
  var Control_Semigroupoid = PS["Control.Semigroupoid"];
  var Data_Bifunctor = PS["Data.Bifunctor"];
  var Data_Either = PS["Data.Either"];
  var Data_Eq = PS["Data.Eq"];
  var Data_Foldable = PS["Data.Foldable"];
  var Data_Function = PS["Data.Function"];
  var Data_Functor = PS["Data.Functor"];
  var Data_Monoid = PS["Data.Monoid"];
  var Data_Ord = PS["Data.Ord"];
  var Data_Semigroup = PS["Data.Semigroup"];
  var Data_Show = PS["Data.Show"];
  var Data_Traversable = PS["Data.Traversable"];
  var Prelude = PS["Prelude"];                 
  var V = function (x) {
      return x;
  };
  var unV = function (v) {
      return function (v1) {
          return function (v2) {
              if (v2 instanceof Data_Either.Left) {
                  return v(v2.value0);
              };
              if (v2 instanceof Data_Either.Right) {
                  return v1(v2.value0);
              };
              throw new Error("Failed pattern match at Data.Validation.Semigroup line 43, column 1 - line 43, column 77: " + [ v.constructor.name, v1.constructor.name, v2.constructor.name ]);
          };
      };
  };
  var invalid = function ($58) {
      return V(Data_Either.Left.create($58));
  };
  var functorV = Data_Either.functorEither;    
  var applyV = function (dictSemigroup) {
      return new Control_Apply.Apply(function () {
          return functorV;
      }, function (v) {
          return function (v1) {
              if (v instanceof Data_Either.Left && v1 instanceof Data_Either.Left) {
                  return new Data_Either.Left(Data_Semigroup.append(dictSemigroup)(v.value0)(v1.value0));
              };
              if (v instanceof Data_Either.Left) {
                  return new Data_Either.Left(v.value0);
              };
              if (v1 instanceof Data_Either.Left) {
                  return new Data_Either.Left(v1.value0);
              };
              if (v instanceof Data_Either.Right && v1 instanceof Data_Either.Right) {
                  return new Data_Either.Right(v.value0(v1.value0));
              };
              throw new Error("Failed pattern match at Data.Validation.Semigroup line 74, column 1 - line 74, column 50: " + [ v.constructor.name, v1.constructor.name ]);
          };
      });
  };
  var applicativeV = function (dictSemigroup) {
      return new Control_Applicative.Applicative(function () {
          return applyV(dictSemigroup);
      }, function ($64) {
          return V(Data_Either.Right.create($64));
      });
  };
  exports["unV"] = unV;
  exports["invalid"] = invalid;
  exports["functorV"] = functorV;
  exports["applyV"] = applyV;
  exports["applicativeV"] = applicativeV;
})(PS["Data.Validation.Semigroup"] = PS["Data.Validation.Semigroup"] || {});
(function(exports) {
  // Generated by purs version 0.12.0
  "use strict";
  var Control_Alternative = PS["Control.Alternative"];
  var Control_Applicative = PS["Control.Applicative"];
  var Control_Plus = PS["Control.Plus"];
  var Data_Boolean = PS["Data.Boolean"];
  var Data_Eq = PS["Data.Eq"];
  var Data_Function = PS["Data.Function"];
  var Data_List = PS["Data.List"];
  var Data_List_Types = PS["Data.List.Types"];
  var Data_Maybe = PS["Data.Maybe"];
  var Data_Ord = PS["Data.Ord"];
  var Data_Ordering = PS["Data.Ordering"];
  var Data_Ring = PS["Data.Ring"];
  var Data_Semigroup = PS["Data.Semigroup"];
  var Data_Semiring = PS["Data.Semiring"];
  var Data_Symbol = PS["Data.Symbol"];
  var Partial_Unsafe = PS["Partial.Unsafe"];
  var Prelude = PS["Prelude"];
  var Record_Unsafe = PS["Record.Unsafe"];
  var Type_Equality = PS["Type.Equality"];
  var Type_Row = PS["Type.Row"];
  var VariantMatchCases = {};
  var variantMatchNil = VariantMatchCases;
  var variantMatchCons = function (dictVariantMatchCases) {
      return function (dictCons) {
          return function (dictTypeEquals) {
              return VariantMatchCases;
          };
      };
  };
  exports["VariantMatchCases"] = VariantMatchCases;
  exports["variantMatchCons"] = variantMatchCons;
  exports["variantMatchNil"] = variantMatchNil;
})(PS["Data.Variant.Internal"] = PS["Data.Variant.Internal"] || {});
(function(exports) {
  // Generated by purs version 0.12.0
  "use strict";
  var Control_Alternative = PS["Control.Alternative"];
  var Control_Applicative = PS["Control.Applicative"];
  var Control_Plus = PS["Control.Plus"];
  var Data_Bounded = PS["Data.Bounded"];
  var Data_Enum = PS["Data.Enum"];
  var Data_Eq = PS["Data.Eq"];
  var Data_Function = PS["Data.Function"];
  var Data_List = PS["Data.List"];
  var Data_List_Types = PS["Data.List.Types"];
  var Data_Maybe = PS["Data.Maybe"];
  var Data_Ord = PS["Data.Ord"];
  var Data_Semigroup = PS["Data.Semigroup"];
  var Data_Show = PS["Data.Show"];
  var Data_Symbol = PS["Data.Symbol"];
  var Data_Variant_Internal = PS["Data.Variant.Internal"];
  var Partial_Unsafe = PS["Partial.Unsafe"];
  var Prelude = PS["Prelude"];
  var Record_Unsafe = PS["Record.Unsafe"];
  var Type_Row = PS["Type.Row"];
  var Unsafe_Coerce = PS["Unsafe.Coerce"];
  var onMatch = function (dictRowToList) {
      return function (dictVariantMatchCases) {
          return function (dictUnion) {
              return function (r) {
                  return function (k) {
                      return function (v) {
                          if (Record_Unsafe.unsafeHas(v.type)(r)) {
                              return Record_Unsafe.unsafeGet(v.type)(r)(v.value);
                          };
                          return k(v);
                      };
                  };
              };
          };
      };
  };
  var on = function (dictCons) {
      return function (dictIsSymbol) {
          return function (p) {
              return function (f) {
                  return function (g) {
                      return function (r) {
                          if (r.type === Data_Symbol.reflectSymbol(dictIsSymbol)(p)) {
                              return f(r.value);
                          };
                          return g(r);
                      };
                  };
              };
          };
      };
  };
  var inj = function (dictCons) {
      return function (dictIsSymbol) {
          return function (p) {
              return function (value) {
                  return {
                      type: Data_Symbol.reflectSymbol(dictIsSymbol)(p),
                      value: value
                  };
              };
          };
      };
  };
  var case_ = function (r) {
      return Partial_Unsafe.unsafeCrashWith("Data.Variant: pattern match failure [" + (r.type + "]"));
  };
  exports["inj"] = inj;
  exports["on"] = on;
  exports["onMatch"] = onMatch;
  exports["case_"] = case_;
})(PS["Data.Variant"] = PS["Data.Variant"] || {});
(function(exports) {
    "use strict";

  // Alias require to prevent webpack or browserify from actually requiring.
  var req = typeof module === "undefined" ? undefined : module.require;
  var util = req === undefined ? undefined : req("util");

  exports.trace = function () {
    return function (x) {
      return function (k) {
        // node only recurses two levels into an object before printing
        // "[object]" for further objects when using console.log()
        if (util !== undefined) {
          console.log(util.inspect(x, { depth: null, colors: true }));
        } else {
          console.log(x);
        }
        return k({});
      };
    };
  };
})(PS["Debug.Trace"] = PS["Debug.Trace"] || {});
(function(exports) {
  // Generated by purs version 0.12.0
  "use strict";
  var $foreign = PS["Debug.Trace"];
  var Control_Applicative = PS["Control.Applicative"];
  var Control_Bind = PS["Control.Bind"];
  var Data_Unit = PS["Data.Unit"];
  var Prelude = PS["Prelude"];                 
  var DebugWarning = {};
  var warn = function (dictWarn) {
      return DebugWarning;
  };
  exports["DebugWarning"] = DebugWarning;
  exports["warn"] = warn;
  exports["trace"] = $foreign.trace;
})(PS["Debug.Trace"] = PS["Debug.Trace"] || {});
(function(exports) {
  /* globals exports, setTimeout */
  "use strict";

  var AVar = function () {

    function MutableQueue () {
      this.head = null;
      this.last = null;
      this.size = 0;
    }

    function MutableCell (queue, value) {
      this.queue = queue;
      this.value = value;
      this.next  = null;
      this.prev  = null;
    }

    function AVar (value) {
      this.draining = false;
      this.error    = null;
      this.value    = value;
      this.takes    = new MutableQueue();
      this.reads    = new MutableQueue();
      this.puts     = new MutableQueue();
    }

    var EMPTY = {};

    function runEff(eff) {
      try {
        eff();
      } catch (error) {
        setTimeout(function () {
          throw error;
        }, 0);
      }
    }

    function putLast (queue, value) {
      var cell = new MutableCell(queue, value);
      switch (queue.size) {
      case 0:
        queue.head = cell;
        break;
      case 1:
        cell.prev = queue.head;
        queue.head.next = cell;
        queue.last = cell;
        break;
      default:
        cell.prev = queue.last;
        queue.last.next = cell;
        queue.last = cell;
      }
      queue.size++;
      return cell;
    }

    function takeLast (queue) {
      var cell;
      switch (queue.size) {
      case 0:
        return null;
      case 1:
        cell = queue.head;
        queue.head = null;
        break;
      case 2:
        cell = queue.last;
        queue.head.next = null;
        queue.last = null;
        break;
      default:
        cell = queue.last;
        queue.last = cell.prev;
        queue.last.next = null;
      }
      cell.prev = null;
      cell.queue = null;
      queue.size--;
      return cell.value;
    }

    function takeHead (queue) {
      var cell;
      switch (queue.size) {
      case 0:
        return null;
      case 1:
        cell = queue.head;
        queue.head = null;
        break;
      case 2:
        cell = queue.head;
        queue.last.prev = null;
        queue.head = queue.last;
        queue.last = null;
        break;
      default:
        cell = queue.head;
        queue.head = cell.next;
        queue.head.prev = null;
      }
      cell.next = null;
      cell.queue = null;
      queue.size--;
      return cell.value;
    }

    function deleteCell (cell) {
      if (cell.queue === null) {
        return;
      }
      if (cell.queue.last === cell) {
        takeLast(cell.queue);
        return;
      }
      if (cell.queue.head === cell) {
        takeHead(cell.queue);
        return;
      }
      if (cell.prev) {
        cell.prev.next = cell.next;
      }
      if (cell.next) {
        cell.next.prev = cell.prev;
      }
      cell.queue.size--;
      cell.queue = null;
      cell.value = null;
      cell.next  = null;
      cell.prev  = null;
    }

    function drainVar (util, avar) {
      if (avar.draining) {
        return;
      }

      var ps = avar.puts;
      var ts = avar.takes;
      var rs = avar.reads;
      var p, r, t, value, rsize;

      avar.draining = true;

      while (1) { // eslint-disable-line no-constant-condition
        p = null;
        r = null;
        t = null;
        value = avar.value;
        rsize = rs.size;

        if (avar.error !== null) {
          value = util.left(avar.error);
          while (p = takeHead(ps)) { // eslint-disable-line no-cond-assign
            runEff(p.cb(value));
          }
          while (r = takeHead(rs)) { // eslint-disable-line no-cond-assign
            runEff(r(value));
          }
          while (t = takeHead(ts)) { // eslint-disable-line no-cond-assign
            runEff(t(value));
          }
          break;
        }

        // Process the next put. We do not immediately invoke the callback
        // because we want to preserve ordering. If there are takes/reads
        // we want to run those first.
        if (value === EMPTY && (p = takeHead(ps))) {
          avar.value = value = p.value;
        }

        if (value !== EMPTY) {
          // We go ahead and queue up the next take for the same reasons as
          // above. Invoking the read callbacks can affect the mutable queue.
          t = takeHead(ts);
          // We only want to process the reads queued up before running these
          // callbacks so we guard on rsize.
          while (rsize-- && (r = takeHead(rs))) {
            runEff(r(util.right(value)));
          }
          if (t !== null) {
            avar.value = EMPTY;
            runEff(t(util.right(value)));
          }
        }

        if (p !== null) {
          runEff(p.cb(util.right(void 0)));
        }

        // Callbacks could have queued up more items so we need to guard on the
        // actual mutable properties.
        if (avar.value === EMPTY && ps.size === 0 || avar.value !== EMPTY && ts.size === 0) {
          break;
        }
      }
      avar.draining = false;
    }

    AVar.EMPTY      = EMPTY;
    AVar.putLast    = putLast;
    AVar.takeLast   = takeLast;
    AVar.takeHead   = takeHead;
    AVar.deleteCell = deleteCell;
    AVar.drainVar   = drainVar;

    return AVar;
  }();

  exports.empty = function () {
    return new AVar(AVar.EMPTY);
  };

  exports._newVar = function (value) {
    return function () {
      return new AVar(value);
    };
  };

  exports._putVar = function (util, value, avar, cb) {
    return function () {
      var cell = AVar.putLast(avar.puts, { cb: cb, value: value });
      AVar.drainVar(util, avar);
      return function () {
        AVar.deleteCell(cell);
      };
    };
  };

  exports._takeVar = function (util, avar, cb) {
    return function () {
      var cell = AVar.putLast(avar.takes, cb);
      AVar.drainVar(util, avar);
      return function () {
        AVar.deleteCell(cell);
      };
    };
  };

  exports._tryTakeVar = function (util, avar) {
    return function () {
      var value = avar.value;
      if (value === AVar.EMPTY) {
        return util.nothing;
      } else {
        avar.value = AVar.EMPTY;
        AVar.drainVar(util, avar);
        return util.just(value);
      }
    };
  };
})(PS["Effect.AVar"] = PS["Effect.AVar"] || {});
(function(exports) {
    "use strict";

  exports.error = function (msg) {
    return new Error(msg);
  };

  exports.throwException = function (e) {
    return function () {
      throw e;
    };
  };
})(PS["Effect.Exception"] = PS["Effect.Exception"] || {});
(function(exports) {
  // Generated by purs version 0.12.0
  "use strict";
  var $foreign = PS["Effect.Exception"];
  var Control_Applicative = PS["Control.Applicative"];
  var Control_Semigroupoid = PS["Control.Semigroupoid"];
  var Data_Either = PS["Data.Either"];
  var Data_Functor = PS["Data.Functor"];
  var Data_Maybe = PS["Data.Maybe"];
  var Data_Show = PS["Data.Show"];
  var Effect = PS["Effect"];
  var Prelude = PS["Prelude"];
  var $$throw = function ($1) {
      return $foreign.throwException($foreign.error($1));
  };
  exports["throw"] = $$throw;
  exports["error"] = $foreign.error;
})(PS["Effect.Exception"] = PS["Effect.Exception"] || {});
(function(exports) {
  // Generated by purs version 0.12.0
  "use strict";
  var $foreign = PS["Effect.AVar"];
  var Data_Either = PS["Data.Either"];
  var Data_Function_Uncurried = PS["Data.Function.Uncurried"];
  var Data_Maybe = PS["Data.Maybe"];
  var Effect = PS["Effect"];
  var Effect_Exception = PS["Effect.Exception"];
  var Prelude = PS["Prelude"];                 
  var Killed = (function () {
      function Killed(value0) {
          this.value0 = value0;
      };
      Killed.create = function (value0) {
          return new Killed(value0);
      };
      return Killed;
  })();
  var Filled = (function () {
      function Filled(value0) {
          this.value0 = value0;
      };
      Filled.create = function (value0) {
          return new Filled(value0);
      };
      return Filled;
  })();
  var Empty = (function () {
      function Empty() {

      };
      Empty.value = new Empty();
      return Empty;
  })();
  var $$new = $foreign._newVar;
  var ffiUtil = {
      left: Data_Either.Left.create,
      right: Data_Either.Right.create,
      nothing: Data_Maybe.Nothing.value,
      just: Data_Maybe.Just.create,
      killed: Killed.create,
      filled: Filled.create,
      empty: Empty.value
  };
  var put = function (value) {
      return function (avar) {
          return function (cb) {
              return $foreign._putVar(ffiUtil, value, avar, cb);
          };
      };
  };
  var take = function (avar) {
      return function (cb) {
          return $foreign._takeVar(ffiUtil, avar, cb);
      };
  };
  var tryTake = function (avar) {
      return $foreign._tryTakeVar(ffiUtil, avar);
  };
  exports["Killed"] = Killed;
  exports["Filled"] = Filled;
  exports["Empty"] = Empty;
  exports["new"] = $$new;
  exports["take"] = take;
  exports["tryTake"] = tryTake;
  exports["put"] = put;
  exports["empty"] = $foreign.empty;
})(PS["Effect.AVar"] = PS["Effect.AVar"] || {});
(function(exports) {
  /* globals setImmediate, clearImmediate, setTimeout, clearTimeout */
  /* jshint -W083, -W098, -W003 */
  "use strict";

  var Aff = function () {
    // A unique value for empty.
    var EMPTY = {};

    /*

  An awkward approximation. We elide evidence we would otherwise need in PS for
  efficiency sake.

  data Aff eff a
    = Pure a
    | Throw Error
    | Catch (Aff eff a) (Error -> Aff eff a)
    | Sync (Eff eff a)
    | Async ((Either Error a -> Eff eff Unit) -> Eff eff (Canceler eff))
    | forall b. Bind (Aff eff b) (b -> Aff eff a)
    | forall b. Bracket (Aff eff b) (BracketConditions eff b) (b -> Aff eff a)
    | forall b. Fork Boolean (Aff eff b) ?(Fiber eff b -> a)
    | Sequential (ParAff aff a)

  */  
    var PURE    = "Pure";
    var THROW   = "Throw";
    var CATCH   = "Catch";
    var SYNC    = "Sync";
    var ASYNC   = "Async";
    var BIND    = "Bind";
    var BRACKET = "Bracket";
    var FORK    = "Fork";
    var SEQ     = "Sequential";

    /*

  data ParAff eff a
    = forall b. Map (b -> a) (ParAff eff b)
    | forall b. Apply (ParAff eff (b -> a)) (ParAff eff b)
    | Alt (ParAff eff a) (ParAff eff a)
    | ?Par (Aff eff a)

  */  
    var MAP   = "Map";
    var APPLY = "Apply";
    var ALT   = "Alt";

    // Various constructors used in interpretation
    var CONS      = "Cons";      // Cons-list, for stacks
    var RESUME    = "Resume";    // Continue indiscriminately
    var RELEASE   = "Release";   // Continue with bracket finalizers
    var FINALIZER = "Finalizer"; // A non-interruptible effect
    var FINALIZED = "Finalized"; // Marker for finalization
    var FORKED    = "Forked";    // Reference to a forked fiber, with resumption stack
    var FIBER     = "Fiber";     // Actual fiber reference
    var THUNK     = "Thunk";     // Primed effect, ready to invoke

    function Aff(tag, _1, _2, _3) {
      this.tag = tag;
      this._1  = _1;
      this._2  = _2;
      this._3  = _3;
    }

    function AffCtr(tag) {
      var fn = function (_1, _2, _3) {
        return new Aff(tag, _1, _2, _3);
      };
      fn.tag = tag;
      return fn;
    }

    function nonCanceler(error) {
      return new Aff(PURE, void 0);
    }

    function runEff(eff) {
      try {
        eff();
      } catch (error) {
        setTimeout(function () {
          throw error;
        }, 0);
      }
    }

    function runSync(left, right, eff) {
      try {
        return right(eff());
      } catch (error) {
        return left(error);
      }
    }

    function runAsync(left, eff, k) {
      try {
        return eff(k)();
      } catch (error) {
        k(left(error))();
        return nonCanceler;
      }
    }

    var Scheduler = function () {
      var limit    = 1024;
      var size     = 0;
      var ix       = 0;
      var queue    = new Array(limit);
      var draining = false;

      function drain() {
        var thunk;
        draining = true;
        while (size !== 0) {
          size--;
          thunk     = queue[ix];
          queue[ix] = void 0;
          ix        = (ix + 1) % limit;
          thunk();
        }
        draining = false;
      }

      return {
        isDraining: function () {
          return draining;
        },
        enqueue: function (cb) {
          var i, tmp;
          if (size === limit) {
            tmp = draining;
            drain();
            draining = tmp;
          }

          queue[(ix + size) % limit] = cb;
          size++;

          if (!draining) {
            drain();
          }
        }
      };
    }();

    function Supervisor(util) {
      var fibers  = {};
      var fiberId = 0;
      var count   = 0;

      return {
        register: function (fiber) {
          var fid = fiberId++;
          fiber.onComplete({
            rethrow: true,
            handler: function (result) {
              return function () {
                count--;
                delete fibers[fid];
              };
            }
          });
          fibers[fid] = fiber;
          count++;
        },
        isEmpty: function () {
          return count === 0;
        },
        killAll: function (killError, cb) {
          return function () {
            var killCount = 0;
            var kills     = {};

            function kill(fid) {
              kills[fid] = fibers[fid].kill(killError, function (result) {
                return function () {
                  delete kills[fid];
                  killCount--;
                  if (util.isLeft(result) && util.fromLeft(result)) {
                    setTimeout(function () {
                      throw util.fromLeft(result);
                    }, 0);
                  }
                  if (killCount === 0) {
                    cb();
                  }
                };
              })();
            }

            for (var k in fibers) {
              if (fibers.hasOwnProperty(k)) {
                killCount++;
                kill(k);
              }
            }

            fibers  = {};
            fiberId = 0;
            count   = 0;

            return function (error) {
              return new Aff(SYNC, function () {
                for (var k in kills) {
                  if (kills.hasOwnProperty(k)) {
                    kills[k]();
                  }
                }
              });
            };
          };
        }
      };
    }

    // Fiber state machine
    var SUSPENDED   = 0; // Suspended, pending a join.
    var CONTINUE    = 1; // Interpret the next instruction.
    var STEP_BIND   = 2; // Apply the next bind.
    var STEP_RESULT = 3; // Handle potential failure from a result.
    var PENDING     = 4; // An async effect is running.
    var RETURN      = 5; // The current stack has returned.
    var COMPLETED   = 6; // The entire fiber has completed.

    function Fiber(util, supervisor, aff) {
      // Monotonically increasing tick, increased on each asynchronous turn.
      var runTick = 0;

      // The current branch of the state machine.
      var status = SUSPENDED;

      // The current point of interest for the state machine branch.
      var step      = aff;  // Successful step
      var fail      = null; // Failure step
      var interrupt = null; // Asynchronous interrupt

      // Stack of continuations for the current fiber.
      var bhead = null;
      var btail = null;

      // Stack of attempts and finalizers for error recovery. Every `Cons` is also
      // tagged with current `interrupt` state. We use this to track which items
      // should be ignored or evaluated as a result of a kill.
      var attempts = null;

      // A special state is needed for Bracket, because it cannot be killed. When
      // we enter a bracket acquisition or finalizer, we increment the counter,
      // and then decrement once complete.
      var bracketCount = 0;

      // Each join gets a new id so they can be revoked.
      var joinId  = 0;
      var joins   = null;
      var rethrow = true;

      // Each invocation of `run` requires a tick. When an asynchronous effect is
      // resolved, we must check that the local tick coincides with the fiber
      // tick before resuming. This prevents multiple async continuations from
      // accidentally resuming the same fiber. A common example may be invoking
      // the provided callback in `makeAff` more than once, but it may also be an
      // async effect resuming after the fiber was already cancelled.
      function run(localRunTick) {
        var tmp, result, attempt, canceler;
        while (true) {
          tmp       = null;
          result    = null;
          attempt   = null;
          canceler  = null;

          switch (status) {
          case STEP_BIND:
            status = CONTINUE;
            step   = bhead(step);
            if (btail === null) {
              bhead = null;
            } else {
              bhead = btail._1;
              btail = btail._2;
            }
            break;

          case STEP_RESULT:
            if (util.isLeft(step)) {
              status = RETURN;
              fail   = step;
              step   = null;
            } else if (bhead === null) {
              status = RETURN;
            } else {
              status = STEP_BIND;
              step   = util.fromRight(step);
            }
            break;

          case CONTINUE:
            switch (step.tag) {
            case BIND:
              if (bhead) {
                btail = new Aff(CONS, bhead, btail);
              }
              bhead  = step._2;
              status = CONTINUE;
              step   = step._1;
              break;

            case PURE:
              if (bhead === null) {
                status = RETURN;
                step   = util.right(step._1);
              } else {
                status = STEP_BIND;
                step   = step._1;
              }
              break;

            case SYNC:
              status = STEP_RESULT;
              step   = runSync(util.left, util.right, step._1);
              break;

            case ASYNC:
              status = PENDING;
              step   = runAsync(util.left, step._1, function (result) {
                return function () {
                  if (runTick !== localRunTick) {
                    return;
                  }
                  runTick++;
                  Scheduler.enqueue(function () {
                    status = STEP_RESULT;
                    step   = result;
                    run(runTick);
                  });
                };
              });
              return;

            case THROW:
              status = RETURN;
              fail   = util.left(step._1);
              step   = null;
              break;

            // Enqueue the Catch so that we can call the error handler later on
            // in case of an exception.
            case CATCH:
              if (bhead === null) {
                attempts = new Aff(CONS, step, attempts, interrupt);
              } else {
                attempts = new Aff(CONS, step, new Aff(CONS, new Aff(RESUME, bhead, btail), attempts, interrupt), interrupt);
              }
              bhead    = null;
              btail    = null;
              status   = CONTINUE;
              step     = step._1;
              break;

            // Enqueue the Bracket so that we can call the appropriate handlers
            // after resource acquisition.
            case BRACKET:
              bracketCount++;
              if (bhead === null) {
                attempts = new Aff(CONS, step, attempts, interrupt);
              } else {
                attempts = new Aff(CONS, step, new Aff(CONS, new Aff(RESUME, bhead, btail), attempts, interrupt), interrupt);
              }
              bhead  = null;
              btail  = null;
              status = CONTINUE;
              step   = step._1;
              break;

            case FORK:
              status = STEP_RESULT;
              tmp    = Fiber(util, supervisor, step._2);
              if (supervisor) {
                supervisor.register(tmp);
              }
              if (step._1) {
                tmp.run();
              }
              step = util.right(tmp);
              break;

            case SEQ:
              status = CONTINUE;
              step   = sequential(util, supervisor, step._1);
              break;
            }
            break;

          case RETURN:
            bhead = null;
            btail = null;
            // If the current stack has returned, and we have no other stacks to
            // resume or finalizers to run, the fiber has halted and we can
            // invoke all join callbacks. Otherwise we need to resume.
            if (attempts === null) {
              status = COMPLETED;
              step   = interrupt || fail || step;
            } else {
              // The interrupt status for the enqueued item.
              tmp      = attempts._3;
              attempt  = attempts._1;
              attempts = attempts._2;

              switch (attempt.tag) {
              // We cannot recover from an interrupt. Otherwise we should
              // continue stepping, or run the exception handler if an exception
              // was raised.
              case CATCH:
                // We should compare the interrupt status as well because we
                // only want it to apply if there has been an interrupt since
                // enqueuing the catch.
                if (interrupt && interrupt !== tmp) {
                  status = RETURN;
                } else if (fail) {
                  status = CONTINUE;
                  step   = attempt._2(util.fromLeft(fail));
                  fail   = null;
                }
                break;

              // We cannot resume from an interrupt or exception.
              case RESUME:
                // As with Catch, we only want to ignore in the case of an
                // interrupt since enqueing the item.
                if (interrupt && interrupt !== tmp || fail) {
                  status = RETURN;
                } else {
                  bhead  = attempt._1;
                  btail  = attempt._2;
                  status = STEP_BIND;
                  step   = util.fromRight(step);
                }
                break;

              // If we have a bracket, we should enqueue the handlers,
              // and continue with the success branch only if the fiber has
              // not been interrupted. If the bracket acquisition failed, we
              // should not run either.
              case BRACKET:
                bracketCount--;
                if (fail === null) {
                  result   = util.fromRight(step);
                  // We need to enqueue the Release with the same interrupt
                  // status as the Bracket that is initiating it.
                  attempts = new Aff(CONS, new Aff(RELEASE, attempt._2, result), attempts, tmp);
                  // We should only coninue as long as the interrupt status has not changed or
                  // we are currently within a non-interruptable finalizer.
                  if (interrupt === tmp || bracketCount > 0) {
                    status = CONTINUE;
                    step   = attempt._3(result);
                  }
                }
                break;

              // Enqueue the appropriate handler. We increase the bracket count
              // because it should not be cancelled.
              case RELEASE:
                bracketCount++;
                attempts = new Aff(CONS, new Aff(FINALIZED, step), attempts, interrupt);
                status   = CONTINUE;
                // It has only been killed if the interrupt status has changed
                // since we enqueued the item.
                if (interrupt && interrupt !== tmp) {
                  step = attempt._1.killed(util.fromLeft(interrupt))(attempt._2);
                } else if (fail) {
                  step = attempt._1.failed(util.fromLeft(fail))(attempt._2);
                } else {
                  step = attempt._1.completed(util.fromRight(step))(attempt._2);
                }
                break;

              case FINALIZER:
                bracketCount++;
                attempts = new Aff(CONS, new Aff(FINALIZED, step), attempts, interrupt);
                status   = CONTINUE;
                step     = attempt._1;
                break;

              case FINALIZED:
                bracketCount--;
                status = RETURN;
                step   = attempt._1;
                break;
              }
            }
            break;

          case COMPLETED:
            for (var k in joins) {
              if (joins.hasOwnProperty(k)) {
                rethrow = rethrow && joins[k].rethrow;
                runEff(joins[k].handler(step));
              }
            }
            joins = null;
            // If we have an interrupt and a fail, then the thread threw while
            // running finalizers. This should always rethrow in a fresh stack.
            if (interrupt && fail) {
              setTimeout(function () {
                throw util.fromLeft(fail);
              }, 0);
            // If we have an unhandled exception, and no other fiber has joined
            // then we need to throw the exception in a fresh stack.
            } else if (util.isLeft(step) && rethrow) {
              setTimeout(function () {
                // Guard on reathrow because a completely synchronous fiber can
                // still have an observer which was added after-the-fact.
                if (rethrow) {
                  throw util.fromLeft(step);
                }
              }, 0);
            }
            return;
          case SUSPENDED:
            status = CONTINUE;
            break;
          case PENDING: return;
          }
        }
      }

      function onComplete(join) {
        return function () {
          if (status === COMPLETED) {
            rethrow = rethrow && join.rethrow;
            join.handler(step)();
            return function () {};
          }

          var jid    = joinId++;
          joins      = joins || {};
          joins[jid] = join;

          return function() {
            if (joins !== null) {
              delete joins[jid];
            }
          };
        };
      }

      function kill(error, cb) {
        return function () {
          if (status === COMPLETED) {
            cb(util.right(void 0))();
            return function () {};
          }

          var canceler = onComplete({
            rethrow: false,
            handler: function (/* unused */) {
              return cb(util.right(void 0));
            }
          })();

          switch (status) {
          case SUSPENDED:
            interrupt = util.left(error);
            status    = COMPLETED;
            step      = interrupt;
            run(runTick);
            break;
          case PENDING:
            if (interrupt === null) {
              interrupt = util.left(error);
            }
            if (bracketCount === 0) {
              if (status === PENDING) {
                attempts = new Aff(CONS, new Aff(FINALIZER, step(error)), attempts, interrupt);
              }
              status   = RETURN;
              step     = null;
              fail     = null;
              run(++runTick);
            }
            break;
          default:
            if (interrupt === null) {
              interrupt = util.left(error);
            }
            if (bracketCount === 0) {
              status = RETURN;
              step   = null;
              fail   = null;
            }
          }

          return canceler;
        };
      }

      function join(cb) {
        return function () {
          var canceler = onComplete({
            rethrow: false,
            handler: cb
          })();
          if (status === SUSPENDED) {
            run(runTick);
          }
          return canceler;
        };
      }

      return {
        kill: kill,
        join: join,
        onComplete: onComplete,
        isSuspended: function () {
          return status === SUSPENDED;
        },
        run: function () {
          if (status === SUSPENDED) {
            if (!Scheduler.isDraining()) {
              Scheduler.enqueue(function () {
                run(runTick);
              });
            } else {
              run(runTick);
            }
          }
        }
      };
    }

    function runPar(util, supervisor, par, cb) {
      // Table of all forked fibers.
      var fiberId   = 0;
      var fibers    = {};

      // Table of currently running cancelers, as a product of `Alt` behavior.
      var killId    = 0;
      var kills     = {};

      // Error used for early cancelation on Alt branches.
      var early     = new Error("[ParAff] Early exit");

      // Error used to kill the entire tree.
      var interrupt = null;

      // The root pointer of the tree.
      var root      = EMPTY;

      // Walks a tree, invoking all the cancelers. Returns the table of pending
      // cancellation fibers.
      function kill(error, par, cb) {
        var step  = par;
        var head  = null;
        var tail  = null;
        var count = 0;
        var kills = {};
        var tmp, kid;

        loop: while (true) {
          tmp = null;

          switch (step.tag) {
          case FORKED:
            if (step._3 === EMPTY) {
              tmp = fibers[step._1];
              kills[count++] = tmp.kill(error, function (result) {
                return function () {
                  count--;
                  if (count === 0) {
                    cb(result)();
                  }
                };
              });
            }
            // Terminal case.
            if (head === null) {
              break loop;
            }
            // Go down the right side of the tree.
            step = head._2;
            if (tail === null) {
              head = null;
            } else {
              head = tail._1;
              tail = tail._2;
            }
            break;
          case MAP:
            step = step._2;
            break;
          case APPLY:
          case ALT:
            if (head) {
              tail = new Aff(CONS, head, tail);
            }
            head = step;
            step = step._1;
            break;
          }
        }

        if (count === 0) {
          cb(util.right(void 0))();
        } else {
          // Run the cancelation effects. We alias `count` because it's mutable.
          kid = 0;
          tmp = count;
          for (; kid < tmp; kid++) {
            kills[kid] = kills[kid]();
          }
        }

        return kills;
      }

      // When a fiber resolves, we need to bubble back up the tree with the
      // result, computing the applicative nodes.
      function join(result, head, tail) {
        var fail, step, lhs, rhs, tmp, kid;

        if (util.isLeft(result)) {
          fail = result;
          step = null;
        } else {
          step = result;
          fail = null;
        }

        loop: while (true) {
          lhs = null;
          rhs = null;
          tmp = null;
          kid = null;

          // We should never continue if the entire tree has been interrupted.
          if (interrupt !== null) {
            return;
          }

          // We've made it all the way to the root of the tree, which means
          // the tree has fully evaluated.
          if (head === null) {
            cb(fail || step)();
            return;
          }

          // The tree has already been computed, so we shouldn't try to do it
          // again. This should never happen.
          // TODO: Remove this?
          if (head._3 !== EMPTY) {
            return;
          }

          switch (head.tag) {
          case MAP:
            if (fail === null) {
              head._3 = util.right(head._1(util.fromRight(step)));
              step    = head._3;
            } else {
              head._3 = fail;
            }
            break;
          case APPLY:
            lhs = head._1._3;
            rhs = head._2._3;
            // If we have a failure we should kill the other side because we
            // can't possible yield a result anymore.
            if (fail) {
              head._3 = fail;
              tmp     = true;
              kid     = killId++;

              kills[kid] = kill(early, fail === lhs ? head._2 : head._1, function (/* unused */) {
                return function () {
                  delete kills[kid];
                  if (tmp) {
                    tmp = false;
                  } else if (tail === null) {
                    join(step, null, null);
                  } else {
                    join(step, tail._1, tail._2);
                  }
                };
              });

              if (tmp) {
                tmp = false;
                return;
              }
            } else if (lhs === EMPTY || rhs === EMPTY) {
              // We can only proceed if both sides have resolved.
              return;
            } else {
              step    = util.right(util.fromRight(lhs)(util.fromRight(rhs)));
              head._3 = step;
            }
            break;
          case ALT:
            lhs = head._1._3;
            rhs = head._2._3;
            // We can only proceed if both have resolved or we have a success
            if (lhs === EMPTY && util.isLeft(rhs) || rhs === EMPTY && util.isLeft(lhs)) {
              return;
            }
            // If both sides resolve with an error, we should continue with the
            // first error
            if (lhs !== EMPTY && util.isLeft(lhs) && rhs !== EMPTY && util.isLeft(rhs)) {
              fail    = step === lhs ? rhs : lhs;
              step    = null;
              head._3 = fail;
            } else {
              head._3 = step;
              tmp     = true;
              kid     = killId++;
              // Once a side has resolved, we need to cancel the side that is still
              // pending before we can continue.
              kills[kid] = kill(early, step === lhs ? head._2 : head._1, function (/* unused */) {
                return function () {
                  delete kills[kid];
                  if (tmp) {
                    tmp = false;
                  } else if (tail === null) {
                    join(step, null, null);
                  } else {
                    join(step, tail._1, tail._2);
                  }
                };
              });

              if (tmp) {
                tmp = false;
                return;
              }
            }
            break;
          }

          if (tail === null) {
            head = null;
          } else {
            head = tail._1;
            tail = tail._2;
          }
        }
      }

      function resolve(fiber) {
        return function (result) {
          return function () {
            delete fibers[fiber._1];
            fiber._3 = result;
            join(result, fiber._2._1, fiber._2._2);
          };
        };
      }

      // Walks the applicative tree, substituting non-applicative nodes with
      // `FORKED` nodes. In this tree, all applicative nodes use the `_3` slot
      // as a mutable slot for memoization. In an unresolved state, the `_3`
      // slot is `EMPTY`. In the cases of `ALT` and `APPLY`, we always walk
      // the left side first, because both operations are left-associative. As
      // we `RETURN` from those branches, we then walk the right side.
      function run() {
        var status = CONTINUE;
        var step   = par;
        var head   = null;
        var tail   = null;
        var tmp, fid;

        loop: while (true) {
          tmp = null;
          fid = null;

          switch (status) {
          case CONTINUE:
            switch (step.tag) {
            case MAP:
              if (head) {
                tail = new Aff(CONS, head, tail);
              }
              head = new Aff(MAP, step._1, EMPTY, EMPTY);
              step = step._2;
              break;
            case APPLY:
              if (head) {
                tail = new Aff(CONS, head, tail);
              }
              head = new Aff(APPLY, EMPTY, step._2, EMPTY);
              step = step._1;
              break;
            case ALT:
              if (head) {
                tail = new Aff(CONS, head, tail);
              }
              head = new Aff(ALT, EMPTY, step._2, EMPTY);
              step = step._1;
              break;
            default:
              // When we hit a leaf value, we suspend the stack in the `FORKED`.
              // When the fiber resolves, it can bubble back up the tree.
              fid    = fiberId++;
              status = RETURN;
              tmp    = step;
              step   = new Aff(FORKED, fid, new Aff(CONS, head, tail), EMPTY);
              tmp    = Fiber(util, supervisor, tmp);
              tmp.onComplete({
                rethrow: false,
                handler: resolve(step)
              })();
              fibers[fid] = tmp;
              if (supervisor) {
                supervisor.register(tmp);
              }
            }
            break;
          case RETURN:
            // Terminal case, we are back at the root.
            if (head === null) {
              break loop;
            }
            // If we are done with the right side, we need to continue down the
            // left. Otherwise we should continue up the stack.
            if (head._1 === EMPTY) {
              head._1 = step;
              status  = CONTINUE;
              step    = head._2;
              head._2 = EMPTY;
            } else {
              head._2 = step;
              step    = head;
              if (tail === null) {
                head  = null;
              } else {
                head  = tail._1;
                tail  = tail._2;
              }
            }
          }
        }

        // Keep a reference to the tree root so it can be cancelled.
        root = step;

        for (fid = 0; fid < fiberId; fid++) {
          fibers[fid].run();
        }
      }

      // Cancels the entire tree. If there are already subtrees being canceled,
      // we need to first cancel those joins. We will then add fresh joins for
      // all pending branches including those that were in the process of being
      // canceled.
      function cancel(error, cb) {
        interrupt = util.left(error);
        var innerKills;
        for (var kid in kills) {
          if (kills.hasOwnProperty(kid)) {
            innerKills = kills[kid];
            for (kid in innerKills) {
              if (innerKills.hasOwnProperty(kid)) {
                innerKills[kid]();
              }
            }
          }
        }

        kills = null;
        var newKills = kill(error, root, cb);

        return function (killError) {
          return new Aff(ASYNC, function (killCb) {
            return function () {
              for (var kid in newKills) {
                if (newKills.hasOwnProperty(kid)) {
                  newKills[kid]();
                }
              }
              return nonCanceler;
            };
          });
        };
      }

      run();

      return function (killError) {
        return new Aff(ASYNC, function (killCb) {
          return function () {
            return cancel(killError, killCb);
          };
        });
      };
    }

    function sequential(util, supervisor, par) {
      return new Aff(ASYNC, function (cb) {
        return function () {
          return runPar(util, supervisor, par, cb);
        };
      });
    }

    Aff.EMPTY       = EMPTY;
    Aff.Pure        = AffCtr(PURE);
    Aff.Throw       = AffCtr(THROW);
    Aff.Catch       = AffCtr(CATCH);
    Aff.Sync        = AffCtr(SYNC);
    Aff.Async       = AffCtr(ASYNC);
    Aff.Bind        = AffCtr(BIND);
    Aff.Bracket     = AffCtr(BRACKET);
    Aff.Fork        = AffCtr(FORK);
    Aff.Seq         = AffCtr(SEQ);
    Aff.ParMap      = AffCtr(MAP);
    Aff.ParApply    = AffCtr(APPLY);
    Aff.ParAlt      = AffCtr(ALT);
    Aff.Fiber       = Fiber;
    Aff.Supervisor  = Supervisor;
    Aff.Scheduler   = Scheduler;
    Aff.nonCanceler = nonCanceler;

    return Aff;
  }();

  exports._pure = Aff.Pure;

  exports._throwError = Aff.Throw;

  exports._map = function (f) {
    return function (aff) {
      if (aff.tag === Aff.Pure.tag) {
        return Aff.Pure(f(aff._1));
      } else {
        return Aff.Bind(aff, function (value) {
          return Aff.Pure(f(value));
        });
      }
    };
  };

  exports._bind = function (aff) {
    return function (k) {
      return Aff.Bind(aff, k);
    };
  };

  exports._fork = function (immediate) {
    return function (aff) {
      return Aff.Fork(immediate, aff);
    };
  };

  exports._liftEffect = Aff.Sync;

  exports.makeAff = Aff.Async;

  exports._makeFiber = function (util, aff) {
    return function () {
      return Aff.Fiber(util, null, aff);
    };
  };
})(PS["Effect.Aff"] = PS["Effect.Aff"] || {});
(function(exports) {
  // Generated by purs version 0.12.0
  "use strict";
  var $foreign = PS["Effect.Aff"];
  var Control_Alt = PS["Control.Alt"];
  var Control_Alternative = PS["Control.Alternative"];
  var Control_Applicative = PS["Control.Applicative"];
  var Control_Apply = PS["Control.Apply"];
  var Control_Bind = PS["Control.Bind"];
  var Control_Lazy = PS["Control.Lazy"];
  var Control_Monad = PS["Control.Monad"];
  var Control_Monad_Error_Class = PS["Control.Monad.Error.Class"];
  var Control_Monad_Rec_Class = PS["Control.Monad.Rec.Class"];
  var Control_Parallel = PS["Control.Parallel"];
  var Control_Parallel_Class = PS["Control.Parallel.Class"];
  var Control_Plus = PS["Control.Plus"];
  var Control_Semigroupoid = PS["Control.Semigroupoid"];
  var Data_Either = PS["Data.Either"];
  var Data_Foldable = PS["Data.Foldable"];
  var Data_Function = PS["Data.Function"];
  var Data_Function_Uncurried = PS["Data.Function.Uncurried"];
  var Data_Functor = PS["Data.Functor"];
  var Data_Monoid = PS["Data.Monoid"];
  var Data_Newtype = PS["Data.Newtype"];
  var Data_Semigroup = PS["Data.Semigroup"];
  var Data_Time_Duration = PS["Data.Time.Duration"];
  var Data_Unit = PS["Data.Unit"];
  var Effect = PS["Effect"];
  var Effect_Class = PS["Effect.Class"];
  var Effect_Exception = PS["Effect.Exception"];
  var Effect_Unsafe = PS["Effect.Unsafe"];
  var Partial_Unsafe = PS["Partial.Unsafe"];
  var Prelude = PS["Prelude"];
  var Unsafe_Coerce = PS["Unsafe.Coerce"];
  var Canceler = function (x) {
      return x;
  };                                                                
  var functorAff = new Data_Functor.Functor($foreign._map);
  var forkAff = $foreign._fork(true);
  var ffiUtil = (function () {
      var unsafeFromRight = function (v) {
          if (v instanceof Data_Either.Right) {
              return v.value0;
          };
          if (v instanceof Data_Either.Left) {
              return Partial_Unsafe.unsafeCrashWith("unsafeFromRight: Left");
          };
          throw new Error("Failed pattern match at Effect.Aff line 395, column 21 - line 397, column 31: " + [ v.constructor.name ]);
      };
      var unsafeFromLeft = function (v) {
          if (v instanceof Data_Either.Left) {
              return v.value0;
          };
          if (v instanceof Data_Either.Right) {
              return Partial_Unsafe.unsafeCrashWith("unsafeFromLeft: Right");
          };
          throw new Error("Failed pattern match at Effect.Aff line 390, column 20 - line 394, column 3: " + [ v.constructor.name ]);
      };
      var isLeft = function (v) {
          if (v instanceof Data_Either.Left) {
              return true;
          };
          if (v instanceof Data_Either.Right) {
              return false;
          };
          throw new Error("Failed pattern match at Effect.Aff line 385, column 12 - line 387, column 20: " + [ v.constructor.name ]);
      };
      return {
          isLeft: isLeft,
          fromLeft: unsafeFromLeft,
          fromRight: unsafeFromRight,
          left: Data_Either.Left.create,
          right: Data_Either.Right.create
      };
  })();
  var makeFiber = function (aff) {
      return $foreign._makeFiber(ffiUtil, aff);
  };
  var launchAff = function (aff) {
      return function __do() {
          var v = makeFiber(aff)();
          v.run();
          return v;
      };
  };
  var launchAff_ = function ($49) {
      return Data_Functor["void"](Effect.functorEffect)(launchAff($49));
  };
  var monadAff = new Control_Monad.Monad(function () {
      return applicativeAff;
  }, function () {
      return bindAff;
  });
  var bindAff = new Control_Bind.Bind(function () {
      return applyAff;
  }, $foreign._bind);
  var applyAff = new Control_Apply.Apply(function () {
      return functorAff;
  }, Control_Monad.ap(monadAff));
  var applicativeAff = new Control_Applicative.Applicative(function () {
      return applyAff;
  }, $foreign._pure);
  var semigroupAff = function (dictSemigroup) {
      return new Data_Semigroup.Semigroup(Control_Apply.lift2(applyAff)(Data_Semigroup.append(dictSemigroup)));
  };
  var monadEffectAff = new Effect_Class.MonadEffect(function () {
      return monadAff;
  }, $foreign._liftEffect);
  var effectCanceler = function ($50) {
      return Canceler(Data_Function["const"](Effect_Class.liftEffect(monadEffectAff)($50)));
  }; 
  var killFiber = function (e) {
      return function (v) {
          return Control_Bind.bind(bindAff)(Effect_Class.liftEffect(monadEffectAff)(v.isSuspended))(function (v1) {
              if (v1) {
                  return Effect_Class.liftEffect(monadEffectAff)(Data_Functor["void"](Effect.functorEffect)(v.kill(e, Data_Function["const"](Control_Applicative.pure(Effect.applicativeEffect)(Data_Unit.unit)))));
              };
              return $foreign.makeAff(function (k) {
                  return Data_Functor.map(Effect.functorEffect)(effectCanceler)(v.kill(e, k));
              });
          });
      };
  };
  var monadThrowAff = new Control_Monad_Error_Class.MonadThrow(function () {
      return monadAff;
  }, $foreign._throwError);
  var monoidAff = function (dictMonoid) {
      return new Data_Monoid.Monoid(function () {
          return semigroupAff(dictMonoid.Semigroup0());
      }, Control_Applicative.pure(applicativeAff)(Data_Monoid.mempty(dictMonoid)));
  };
  var nonCanceler = Data_Function["const"](Control_Applicative.pure(applicativeAff)(Data_Unit.unit));
  exports["Canceler"] = Canceler;
  exports["launchAff"] = launchAff;
  exports["launchAff_"] = launchAff_;
  exports["forkAff"] = forkAff;
  exports["killFiber"] = killFiber;
  exports["nonCanceler"] = nonCanceler;
  exports["effectCanceler"] = effectCanceler;
  exports["functorAff"] = functorAff;
  exports["applyAff"] = applyAff;
  exports["applicativeAff"] = applicativeAff;
  exports["bindAff"] = bindAff;
  exports["monadAff"] = monadAff;
  exports["semigroupAff"] = semigroupAff;
  exports["monoidAff"] = monoidAff;
  exports["monadThrowAff"] = monadThrowAff;
  exports["monadEffectAff"] = monadEffectAff;
  exports["makeAff"] = $foreign.makeAff;
})(PS["Effect.Aff"] = PS["Effect.Aff"] || {});
(function(exports) {
  // Generated by purs version 0.12.0
  "use strict";
  var Control_Applicative = PS["Control.Applicative"];
  var Control_Bind = PS["Control.Bind"];
  var Control_Semigroupoid = PS["Control.Semigroupoid"];
  var Data_Maybe = PS["Data.Maybe"];
  var Effect = PS["Effect"];
  var Effect_AVar = PS["Effect.AVar"];
  var Effect_Aff = PS["Effect.Aff"];
  var Effect_Class = PS["Effect.Class"];
  var Effect_Exception = PS["Effect.Exception"];
  var Prelude = PS["Prelude"];                 
  var tryTake = function ($6) {
      return Effect_Class.liftEffect(Effect_Aff.monadEffectAff)(Effect_AVar.tryTake($6));
  };
  var take = function (avar) {
      return Effect_Aff.makeAff(function (k) {
          return function __do() {
              var v = Effect_AVar.take(avar)(k)();
              return Effect_Aff.effectCanceler(v);
          };
      });
  };
  var put = function (value) {
      return function (avar) {
          return Effect_Aff.makeAff(function (k) {
              return function __do() {
                  var v = Effect_AVar.put(value)(avar)(k)();
                  return Effect_Aff.effectCanceler(v);
              };
          });
      };
  };
  var $$new = function ($10) {
      return Effect_Class.liftEffect(Effect_Aff.monadEffectAff)(Effect_AVar["new"]($10));
  };
  var empty = Effect_Class.liftEffect(Effect_Aff.monadEffectAff)(Effect_AVar.empty);
  exports["new"] = $$new;
  exports["empty"] = empty;
  exports["take"] = take;
  exports["tryTake"] = tryTake;
  exports["put"] = put;
})(PS["Effect.Aff.AVar"] = PS["Effect.Aff.AVar"] || {});
(function(exports) {
    "use strict";

  exports.runEffectFn2 = function runEffectFn2(fn) {
    return function(a) {
      return function(b) {
        return function() {
          return fn(a, b);
        };
      };
    };
  };

  exports.runEffectFn3 = function runEffectFn3(fn) {
    return function(a) {
      return function(b) {
        return function(c) {
          return function() {
            return fn(a, b, c);
          };
        };
      };
    };
  };
})(PS["Effect.Uncurried"] = PS["Effect.Uncurried"] || {});
(function(exports) {
  // Generated by purs version 0.12.0
  "use strict";
  var $foreign = PS["Effect.Uncurried"];
  var Effect = PS["Effect"];
  exports["runEffectFn2"] = $foreign.runEffectFn2;
  exports["runEffectFn3"] = $foreign.runEffectFn3;
})(PS["Effect.Uncurried"] = PS["Effect.Uncurried"] || {});
(function(exports) {
  // Generated by purs version 0.12.0
  "use strict";
  var Control_Applicative = PS["Control.Applicative"];
  var Control_Bind = PS["Control.Bind"];
  var Control_Semigroupoid = PS["Control.Semigroupoid"];
  var Data_Either = PS["Data.Either"];
  var Data_Function = PS["Data.Function"];
  var Effect = PS["Effect"];
  var Effect_Aff = PS["Effect.Aff"];
  var Effect_Exception = PS["Effect.Exception"];
  var Effect_Uncurried = PS["Effect.Uncurried"];
  var Prelude = PS["Prelude"];
  var fromEffectFnAff = function (v) {
      return Effect_Aff.makeAff(function (k) {
          return function __do() {
              var v1 = v(function ($4) {
                  return k(Data_Either.Left.create($4))();
              }, function ($5) {
                  return k(Data_Either.Right.create($5))();
              });
              return function (e) {
                  return Effect_Aff.makeAff(function (k2) {
                      return function __do() {
                          v1(e, function ($6) {
                              return k2(Data_Either.Left.create($6))();
                          }, function ($7) {
                              return k2(Data_Either.Right.create($7))();
                          });
                          return Effect_Aff.nonCanceler;
                      };
                  });
              };
          };
      });
  };
  exports["fromEffectFnAff"] = fromEffectFnAff;
})(PS["Effect.Aff.Compat"] = PS["Effect.Aff.Compat"] || {});
(function(exports) {
    "use strict";

  exports.log = function (s) {
    return function () {
      console.log(s);
      return {};
    };
  };
})(PS["Effect.Console"] = PS["Effect.Console"] || {});
(function(exports) {
  // Generated by purs version 0.12.0
  "use strict";
  var $foreign = PS["Effect.Console"];
  var Data_Show = PS["Data.Show"];
  var Data_Unit = PS["Data.Unit"];
  var Effect = PS["Effect"];
  exports["log"] = $foreign.log;
})(PS["Effect.Console"] = PS["Effect.Console"] || {});
(function(exports) {
    "use strict";

  exports.new = function (val) {
    return function () {
      return { value: val };
    };
  };

  exports.read = function (ref) {
    return function () {
      return ref.value;
    };
  };

  exports["modify'"] = function (f) {
    return function (ref) {
      return function () {
        var t = f(ref.value);
        ref.value = t.state;
        return t.value;
      };
    };
  };

  exports.write = function (val) {
    return function (ref) {
      return function () {
        ref.value = val;
        return {};
      };
    };
  };
})(PS["Effect.Ref"] = PS["Effect.Ref"] || {});
(function(exports) {
  // Generated by purs version 0.12.0
  "use strict";
  var $foreign = PS["Effect.Ref"];
  var Data_Function = PS["Data.Function"];
  var Data_Functor = PS["Data.Functor"];
  var Effect = PS["Effect"];
  var Prelude = PS["Prelude"];                 
  var modify = function (f) {
      return $foreign["modify'"](function (s) {
          var s$prime = f(s);
          return {
              state: s$prime,
              value: s$prime
          };
      });
  };
  var modify_ = function (f) {
      return function (s) {
          return Data_Functor["void"](Effect.functorEffect)(modify(f)(s));
      };
  };
  exports["modify"] = modify;
  exports["modify_"] = modify_;
  exports["new"] = $foreign["new"];
  exports["read"] = $foreign.read;
  exports["write"] = $foreign.write;
})(PS["Effect.Ref"] = PS["Effect.Ref"] || {});
(function(exports) {
    "use strict";

  exports.unsafeToForeign = function (value) {
    return value;
  };

  exports.unsafeFromForeign = function (value) {
    return value;
  };

  exports.typeOf = function (value) {
    return typeof value;
  };

  exports.tagOf = function (value) {
    return Object.prototype.toString.call(value).slice(8, -1);
  };

  exports.isNull = function (value) {
    return value === null;
  };

  exports.isUndefined = function (value) {
    return value === undefined;
  };

  exports.isArray = Array.isArray || function (value) {
    return Object.prototype.toString.call(value) === "[object Array]";
  };
})(PS["Foreign"] = PS["Foreign"] || {});
(function(exports) {
  // Generated by purs version 0.12.0
  "use strict";
  var $foreign = PS["Foreign"];
  var Control_Applicative = PS["Control.Applicative"];
  var Control_Monad_Error_Class = PS["Control.Monad.Error.Class"];
  var Control_Monad_Except = PS["Control.Monad.Except"];
  var Control_Monad_Except_Trans = PS["Control.Monad.Except.Trans"];
  var Control_Semigroupoid = PS["Control.Semigroupoid"];
  var Data_Boolean = PS["Data.Boolean"];
  var Data_Either = PS["Data.Either"];
  var Data_Eq = PS["Data.Eq"];
  var Data_Function = PS["Data.Function"];
  var Data_HeytingAlgebra = PS["Data.HeytingAlgebra"];
  var Data_Identity = PS["Data.Identity"];
  var Data_Int = PS["Data.Int"];
  var Data_List_NonEmpty = PS["Data.List.NonEmpty"];
  var Data_Maybe = PS["Data.Maybe"];
  var Data_Ord = PS["Data.Ord"];
  var Data_Ordering = PS["Data.Ordering"];
  var Data_Semigroup = PS["Data.Semigroup"];
  var Data_Show = PS["Data.Show"];
  var Data_String_CodeUnits = PS["Data.String.CodeUnits"];
  var Prelude = PS["Prelude"];                 
  var ForeignError = (function () {
      function ForeignError(value0) {
          this.value0 = value0;
      };
      ForeignError.create = function (value0) {
          return new ForeignError(value0);
      };
      return ForeignError;
  })();
  var TypeMismatch = (function () {
      function TypeMismatch(value0, value1) {
          this.value0 = value0;
          this.value1 = value1;
      };
      TypeMismatch.create = function (value0) {
          return function (value1) {
              return new TypeMismatch(value0, value1);
          };
      };
      return TypeMismatch;
  })();
  var ErrorAtIndex = (function () {
      function ErrorAtIndex(value0, value1) {
          this.value0 = value0;
          this.value1 = value1;
      };
      ErrorAtIndex.create = function (value0) {
          return function (value1) {
              return new ErrorAtIndex(value0, value1);
          };
      };
      return ErrorAtIndex;
  })();
  var ErrorAtProperty = (function () {
      function ErrorAtProperty(value0, value1) {
          this.value0 = value0;
          this.value1 = value1;
      };
      ErrorAtProperty.create = function (value0) {
          return function (value1) {
              return new ErrorAtProperty(value0, value1);
          };
      };
      return ErrorAtProperty;
  })();
  var renderForeignError = function (v) {
      if (v instanceof ForeignError) {
          return v.value0;
      };
      if (v instanceof ErrorAtIndex) {
          return "Error at array index " + (Data_Show.show(Data_Show.showInt)(v.value0) + (": " + renderForeignError(v.value1)));
      };
      if (v instanceof ErrorAtProperty) {
          return "Error at property " + (Data_Show.show(Data_Show.showString)(v.value0) + (": " + renderForeignError(v.value1)));
      };
      if (v instanceof TypeMismatch) {
          return "Type mismatch: expected " + (v.value0 + (", found " + v.value1));
      };
      throw new Error("Failed pattern match at Foreign line 72, column 1 - line 72, column 45: " + [ v.constructor.name ]);
  };
  var fail = function ($107) {
      return Control_Monad_Error_Class.throwError(Control_Monad_Except_Trans.monadThrowExceptT(Data_Identity.monadIdentity))(Data_List_NonEmpty.singleton($107));
  };
  var readArray = function (value) {
      if ($foreign.isArray(value)) {
          return Control_Applicative.pure(Control_Monad_Except_Trans.applicativeExceptT(Data_Identity.monadIdentity))($foreign.unsafeFromForeign(value));
      };
      if (Data_Boolean.otherwise) {
          return fail(new TypeMismatch("array", $foreign.tagOf(value)));
      };
      throw new Error("Failed pattern match at Foreign line 147, column 1 - line 147, column 42: " + [ value.constructor.name ]);
  };
  var unsafeReadTagged = function (tag) {
      return function (value) {
          if ($foreign.tagOf(value) === tag) {
              return Control_Applicative.pure(Control_Monad_Except_Trans.applicativeExceptT(Data_Identity.monadIdentity))($foreign.unsafeFromForeign(value));
          };
          if (Data_Boolean.otherwise) {
              return fail(new TypeMismatch(tag, $foreign.tagOf(value)));
          };
          throw new Error("Failed pattern match at Foreign line 106, column 1 - line 106, column 55: " + [ tag.constructor.name, value.constructor.name ]);
      };
  };                                            
  var readNumber = unsafeReadTagged("Number");
  var readInt = function (value) {
      var error = Data_Either.Left.create(Data_List_NonEmpty.singleton(new TypeMismatch("Int", $foreign.tagOf(value))));
      var fromNumber = function ($108) {
          return Data_Maybe.maybe(error)(Control_Applicative.pure(Data_Either.applicativeEither))(Data_Int.fromNumber($108));
      };
      return Control_Monad_Except.mapExcept(Data_Either.either(Data_Function["const"](error))(fromNumber))(readNumber(value));
  };
  var readString = unsafeReadTagged("String");
  exports["ForeignError"] = ForeignError;
  exports["TypeMismatch"] = TypeMismatch;
  exports["ErrorAtIndex"] = ErrorAtIndex;
  exports["ErrorAtProperty"] = ErrorAtProperty;
  exports["renderForeignError"] = renderForeignError;
  exports["unsafeReadTagged"] = unsafeReadTagged;
  exports["readString"] = readString;
  exports["readNumber"] = readNumber;
  exports["readInt"] = readInt;
  exports["readArray"] = readArray;
  exports["fail"] = fail;
  exports["unsafeToForeign"] = $foreign.unsafeToForeign;
  exports["typeOf"] = $foreign.typeOf;
  exports["isNull"] = $foreign.isNull;
  exports["isUndefined"] = $foreign.isUndefined;
})(PS["Foreign"] = PS["Foreign"] || {});
(function(exports) {
    "use strict";

  exports.unsafeReadPropImpl = function (f, s, key, value) {
    return value == null ? f : s(value[key]);
  };
})(PS["Foreign.Index"] = PS["Foreign.Index"] || {});
(function(exports) {
  // Generated by purs version 0.12.0
  "use strict";
  var $foreign = PS["Foreign.Index"];
  var Control_Applicative = PS["Control.Applicative"];
  var Control_Bind = PS["Control.Bind"];
  var Control_Monad_Except_Trans = PS["Control.Monad.Except.Trans"];
  var Data_Eq = PS["Data.Eq"];
  var Data_Function = PS["Data.Function"];
  var Data_Function_Uncurried = PS["Data.Function.Uncurried"];
  var Data_HeytingAlgebra = PS["Data.HeytingAlgebra"];
  var Data_Identity = PS["Data.Identity"];
  var Data_List_NonEmpty = PS["Data.List.NonEmpty"];
  var Foreign = PS["Foreign"];
  var Prelude = PS["Prelude"];
  var unsafeReadProp = function (k) {
      return function (value) {
          return $foreign.unsafeReadPropImpl(Foreign.fail(new Foreign.TypeMismatch("object", Foreign.typeOf(value))), Control_Applicative.pure(Control_Monad_Except_Trans.applicativeExceptT(Data_Identity.monadIdentity)), k, value);
      };
  };
  var readProp = unsafeReadProp;
  exports["readProp"] = readProp;
})(PS["Foreign.Index"] = PS["Foreign.Index"] || {});
(function(exports) {
    "use strict";

  exports.unsafeKeys = Object.keys || function (value) {
    var keys = [];
    for (var prop in value) {
      if (Object.prototype.hasOwnProperty.call(value, prop)) {
        keys.push(prop);
      }
    }
    return keys;
  };
})(PS["Foreign.Keys"] = PS["Foreign.Keys"] || {});
(function(exports) {
  // Generated by purs version 0.12.0
  "use strict";
  var $foreign = PS["Foreign.Keys"];
  var Control_Applicative = PS["Control.Applicative"];
  var Control_Monad_Except_Trans = PS["Control.Monad.Except.Trans"];
  var Data_Boolean = PS["Data.Boolean"];
  var Data_Eq = PS["Data.Eq"];
  var Data_Function = PS["Data.Function"];
  var Data_Identity = PS["Data.Identity"];
  var Foreign = PS["Foreign"];
  var Prelude = PS["Prelude"];                 
  var keys = function (value) {
      if (Foreign.isNull(value)) {
          return Foreign.fail(new Foreign.TypeMismatch("object", "null"));
      };
      if (Foreign.isUndefined(value)) {
          return Foreign.fail(new Foreign.TypeMismatch("object", "undefined"));
      };
      if (Foreign.typeOf(value) === "object") {
          return Control_Applicative.pure(Control_Monad_Except_Trans.applicativeExceptT(Data_Identity.monadIdentity))($foreign.unsafeKeys(value));
      };
      if (Data_Boolean.otherwise) {
          return Foreign.fail(new Foreign.TypeMismatch("object", Foreign.typeOf(value)));
      };
      throw new Error("Failed pattern match at Foreign.Keys line 15, column 1 - line 15, column 36: " + [ value.constructor.name ]);
  };
  exports["keys"] = keys;
})(PS["Foreign.Keys"] = PS["Foreign.Keys"] || {});
(function(exports) {
    "use strict";

  exports.createCanvas = function(size) {
      return function(className) {
          return function() {
              var c = document.createElement('canvas');
              c.width  = size.width;
              c.height = size.height;
              c.className = className;

              var ctx = c.getContext("2d");
              if (ctx.imageSmoothingEnabled === true) {
                  ctx.imageSmoothingEnabled = false;
              };
              return c;
          };
      };
  };

  exports.setElementStyleImpl = function(e,k,v) {
      e.style[k] = v;
  }

  exports.appendCanvasElem = function(cont) {
      return function(canv) {
          return function() {
              cont.appendChild(canv);
          };
      };
  }

  exports.setContainerStyle = function(e) {
      return function(dim) {
          return function() {
              e.style.position = "relative";
              e.style.border   = "1px solid black";
              e.style.display  = "block";
              e.style.margin   = "0";
              e.style.padding  = "0";
              e.style.width = (dim.width - 2) + "px"; // remove 2px for the border
              e.style.height = dim.height + "px";
          };
      };
  };


  exports.drawCopies = function(bfr, bfrDim, ctx, pred, ps) {
      var w = Math.round(bfrDim.width);
      var h = Math.round(bfrDim.height);

      ps.forEach(function(p) {
          if (pred(p)) {
              ctx.drawImage(bfr,
                            Math.floor(p.x - (bfrDim.width  / 2.0)),
                            Math.floor(p.y - (bfrDim.height / 2.0)));
          }
      });
  };

  exports.setCanvasTranslation = function(p) {
      return function(c) {
          return function() {
              var ctx = c.getContext('2d');
              ctx.setTransform(1, 0, 0, 1, p.x, p.y);
          };
      };
  };


  exports.elementClickImpl = function(el, cb) {
      var rect = el.getBoundingClientRect();
      el.addEventListener('mousedown', function(e) {
          var x = e.clientX - rect.left + window.scrollX;
          var y = e.clientY - rect.top  + window.scrollY;
          cb({x: x, y: y})();
      });
  };



  // scrolls a canvas, given a "back buffer" canvas to copy the current context to
  exports.scrollCanvasImpl = function(backCanvas, canvas, p) {

      var bCtx = backCanvas.getContext('2d');
      bCtx.save();
      bCtx.globalCompositeOperation = "copy";
      bCtx.drawImage(canvas, 0, 0);
      bCtx.restore();

      var ctx = canvas.getContext('2d');

      ctx.save();
      ctx.globalCompositeOperation = "copy";
      ctx.setTransform(1,0,0,1,0,0);
      ctx.drawImage(backCanvas, p.x, p.y);
      ctx.restore();
  };



  exports.canvasDragImpl = function(canvas) {
      return function(cb) {
          return function() {
              var cbInner = function(e) {
                  var startX = e.clientX;
                  var startY = e.clientY;
                  var lastX = e.clientX;
                  var lastY = e.clientY;

                  var f = function(e2) {
                      cb({during: {x: lastX - e2.clientX, y: lastY - e2.clientY}})();
                      lastX = e2.clientX;
                      lastY = e2.clientY;
                  };

                  document.addEventListener('mousemove', f);

                  document.addEventListener('mouseup', function(e2) {
                      document.removeEventListener('mousemove', f);
                      cb({total: {x: e2.clientX-startX, y: e2.clientY-startY}})();
                  }, { once: true });
              };

              canvas.addEventListener('mousedown', cbInner);
              return function() {
                  canvas.removeEventListener('mousedown', cbInner);
              }
          };
      };
  };


  exports.canvasWheelCBImpl = function(canvas) {
      return function(cb) {
          return function() {
              var evCb = function(e) {
                  e.preventDefault();
                  cb(Math.sign(e.deltaY))();
              };

              canvas.addEventListener("wheel", evCb);
          }
      };
  };
})(PS["Genetics.Browser.Canvas"] = PS["Genetics.Browser.Canvas"] || {});
(function(exports) {
    "use strict";

  exports.setContextTranslation = function(p) {
      return function(ctx) {
          return function() {
              ctx.setTransform(1, 0, 0, 1, p.x, p.y);
          };
      };
  };
})(PS["Genetics.Browser.Layer"] = PS["Genetics.Browser.Layer"] || {});
(function(exports) {
  /* global exports */
  "use strict";

  exports.getContext2D = function(c) {
      return function() {
          return c.getContext('2d');
      };
  };

  exports.getCanvasWidth = function(canvas) {
      return function() {
          return canvas.width;
      };
  };

  exports.getCanvasHeight = function(canvas) {
      return function() {
          return canvas.height;
      };
  };

  exports.setCanvasWidth = function(canvas) {
      return function(width) {
          return function() {
              canvas.width = width;
          };
      };
  };

  exports.setCanvasHeight = function(canvas) {
      return function(height) {
          return function() {
              canvas.height = height;
          };
      };
  };

  exports.setLineWidth = function(ctx) {
      return function(width) {
          return function() {
              ctx.lineWidth = width;
          };
      };
  };

  exports.setFillStyle = function(ctx) {
      return function(style) {
          return function() {
              ctx.fillStyle = style;
          };
      };
  };

  exports.setStrokeStyle = function(ctx) {
      return function(style) {
          return function() {
              ctx.strokeStyle = style;
          };
      };
  };

  exports.setShadowColor = function(ctx) {
      return function(color) {
          return function() {
              ctx.shadowColor = color;
          };
      };
  };

  exports.setShadowBlur = function(ctx) {
      return function(blur) {
          return function() {
              ctx.shadowBlur = blur;
          };
      };
  };

  exports.setShadowOffsetX = function(ctx) {
      return function(offsetX) {
          return function() {
              ctx.shadowOffsetX = offsetX;
          };
      };
  };

  exports.setShadowOffsetY = function(ctx) {
      return function(offsetY) {
          return function() {
              ctx.shadowOffsetY = offsetY;
          };
      };
  };

  exports.beginPath = function(ctx) {
      return function() {
          ctx.beginPath();
      };
  };

  exports.stroke = function(ctx) {
      return function() {
          ctx.stroke();
      };
  };

  exports.fill = function(ctx) {
      return function() {
          ctx.fill();
      };
  };

  exports.clip = function(ctx) {
      return function() {
          ctx.clip();
      };
  };

  exports.lineTo = function(ctx) {
      return function(x) {
          return function(y) {
              return function() {
                  ctx.lineTo(x, y);
              };
          };
      };
  };

  exports.moveTo = function(ctx) {
      return function(x) {
          return function(y) {
              return function() {
                  ctx.moveTo(x, y);
              };
          };
      };
  };

  exports.closePath = function(ctx) {
      return function() {
          ctx.closePath();
      };
  };

  exports.arc = function(ctx) {
      return function(a) {
          return function() {
              ctx.arc(a.x, a.y, a.radius, a.start, a.end);
          };
      };
  };

  exports.rect = function(ctx) {
      return function(r) {
          return function() {
              ctx.rect(r.x, r.y, r.width, r.height);
          };
      };
  };

  exports.clearRect = function(ctx) {
      return function(r) {
          return function() {
              ctx.clearRect(r.x, r.y, r.width, r.height);
          };
      };
  };

  exports.scale = function(ctx) {
      return function(t) {
          return function() {
              ctx.scale(t.scaleX, t.scaleY);
          };
      };
  };

  exports.rotate = function(ctx) {
      return function(angle) {
          return function() {
              ctx.rotate(angle);
          };
      };
  };

  exports.translate = function(ctx) {
      return function(t) {
          return function() {
              ctx.translate(t.translateX, t.translateY);
          };
      };
  };

  exports.font = function(ctx) {
      return function() {
          return ctx.font;
      };
  };

  exports.setFont = function(ctx) {
      return function(fontspec) {
          return function() {
              ctx.font = fontspec;
          };
      };
  };

  exports.fillText = function(ctx) {
      return function(text) {
          return function(x) {
              return function(y) {
                  return function() {
                      ctx.fillText(text, x, y);
                  };
              };
          };
      };
  };

  exports.measureText = function(ctx) {
      return function(text) {
          return function() {
              return ctx.measureText(text);
          };
      };
  };

  exports.save = function(ctx) {
      return function() {
          ctx.save();
      };
  };

  exports.restore = function(ctx) {
      return function() {
          ctx.restore();
      };
  };
})(PS["Graphics.Canvas"] = PS["Graphics.Canvas"] || {});
(function(exports) {
  // Generated by purs version 0.12.0
  "use strict";
  var $foreign = PS["Graphics.Canvas"];
  var Control_Applicative = PS["Control.Applicative"];
  var Control_Apply = PS["Control.Apply"];
  var Control_Bind = PS["Control.Bind"];
  var Control_Semigroupoid = PS["Control.Semigroupoid"];
  var Data_ArrayBuffer_Types = PS["Data.ArrayBuffer.Types"];
  var Data_Eq = PS["Data.Eq"];
  var Data_Function = PS["Data.Function"];
  var Data_Function_Uncurried = PS["Data.Function.Uncurried"];
  var Data_Functor = PS["Data.Functor"];
  var Data_Maybe = PS["Data.Maybe"];
  var Data_Semigroup = PS["Data.Semigroup"];
  var Data_Show = PS["Data.Show"];
  var Effect = PS["Effect"];
  var Effect_Exception_Unsafe = PS["Effect.Exception.Unsafe"];
  var Prelude = PS["Prelude"];
  var withContext = function (ctx) {
      return function (action) {
          return function __do() {
              var v = $foreign.save(ctx)();
              var v1 = action();
              var v2 = $foreign.restore(ctx)();
              return v1;
          };
      };
  };
  var strokePath = function (ctx) {
      return function (path) {
          return function __do() {
              var v = $foreign.beginPath(ctx)();
              var v1 = path();
              var v2 = $foreign.stroke(ctx)();
              return v1;
          };
      };
  };
  var setCanvasDimensions = function (ce) {
      return function (d) {
          return Control_Apply.applySecond(Effect.applyEffect)($foreign.setCanvasHeight(ce)(d.height))($foreign.setCanvasWidth(ce)(d.width));
      };
  };
  var getCanvasDimensions = function (ce) {
      return function __do() {
          var v = $foreign.getCanvasWidth(ce)();
          var v1 = $foreign.getCanvasHeight(ce)();
          return {
              width: v,
              height: v1
          };
      };
  };
  var fillPath = function (ctx) {
      return function (path) {
          return function __do() {
              var v = $foreign.beginPath(ctx)();
              var v1 = path();
              var v2 = $foreign.fill(ctx)();
              return v1;
          };
      };
  };
  exports["getCanvasDimensions"] = getCanvasDimensions;
  exports["setCanvasDimensions"] = setCanvasDimensions;
  exports["strokePath"] = strokePath;
  exports["fillPath"] = fillPath;
  exports["withContext"] = withContext;
  exports["getContext2D"] = $foreign.getContext2D;
  exports["setLineWidth"] = $foreign.setLineWidth;
  exports["setFillStyle"] = $foreign.setFillStyle;
  exports["setStrokeStyle"] = $foreign.setStrokeStyle;
  exports["setShadowBlur"] = $foreign.setShadowBlur;
  exports["setShadowOffsetX"] = $foreign.setShadowOffsetX;
  exports["setShadowOffsetY"] = $foreign.setShadowOffsetY;
  exports["setShadowColor"] = $foreign.setShadowColor;
  exports["beginPath"] = $foreign.beginPath;
  exports["clip"] = $foreign.clip;
  exports["lineTo"] = $foreign.lineTo;
  exports["moveTo"] = $foreign.moveTo;
  exports["closePath"] = $foreign.closePath;
  exports["arc"] = $foreign.arc;
  exports["rect"] = $foreign.rect;
  exports["clearRect"] = $foreign.clearRect;
  exports["scale"] = $foreign.scale;
  exports["rotate"] = $foreign.rotate;
  exports["translate"] = $foreign.translate;
  exports["setFont"] = $foreign.setFont;
  exports["fillText"] = $foreign.fillText;
  exports["measureText"] = $foreign.measureText;
})(PS["Graphics.Canvas"] = PS["Graphics.Canvas"] || {});
(function(exports) {
  // Generated by purs version 0.12.0
  "use strict";
  var $foreign = PS["Genetics.Browser.Layer"];
  var Control_Applicative = PS["Control.Applicative"];
  var Control_Bind = PS["Control.Bind"];
  var Data_Eq = PS["Data.Eq"];
  var Data_Foldable = PS["Data.Foldable"];
  var Data_Function = PS["Data.Function"];
  var Data_Functor = PS["Data.Functor"];
  var Data_Generic_Rep = PS["Data.Generic.Rep"];
  var Data_HeytingAlgebra = PS["Data.HeytingAlgebra"];
  var Data_Lens = PS["Data.Lens"];
  var Data_Lens_Getter = PS["Data.Lens.Getter"];
  var Data_Ord = PS["Data.Ord"];
  var Data_Ordering = PS["Data.Ordering"];
  var Data_Ring = PS["Data.Ring"];
  var Data_Semiring = PS["Data.Semiring"];
  var Data_Symbol = PS["Data.Symbol"];
  var Data_Traversable = PS["Data.Traversable"];
  var Data_Variant = PS["Data.Variant"];
  var Data_Variant_Internal = PS["Data.Variant.Internal"];
  var Effect = PS["Effect"];
  var Effect_Class = PS["Effect.Class"];
  var Graphics_Canvas = PS["Graphics.Canvas"];
  var Prelude = PS["Prelude"];
  var Type_Equality = PS["Type.Equality"];
  var Type_Prelude = PS["Type.Prelude"];                 
  var Fixed = (function () {
      function Fixed() {

      };
      Fixed.value = new Fixed();
      return Fixed;
  })();
  var Scrolling = (function () {
      function Scrolling() {

      };
      Scrolling.value = new Scrolling();
      return Scrolling;
  })();
  var NoMask = (function () {
      function NoMask() {

      };
      NoMask.value = new NoMask();
      return NoMask;
  })();
  var Masked = (function () {
      function Masked() {

      };
      Masked.value = new Masked();
      return Masked;
  })();
  var Full = (function () {
      function Full(value0) {
          this.value0 = value0;
      };
      Full.create = function (value0) {
          return new Full(value0);
      };
      return Full;
  })();
  var Padded = (function () {
      function Padded(value0, value1) {
          this.value0 = value0;
          this.value1 = value1;
      };
      Padded.create = function (value0) {
          return function (value1) {
              return new Padded(value0, value1);
          };
      };
      return Padded;
  })();
  var CTop = (function () {
      function CTop(value0) {
          this.value0 = value0;
      };
      CTop.create = function (value0) {
          return new CTop(value0);
      };
      return CTop;
  })();
  var CRight = (function () {
      function CRight(value0) {
          this.value0 = value0;
      };
      CRight.create = function (value0) {
          return new CRight(value0);
      };
      return CRight;
  })();
  var CBottom = (function () {
      function CBottom(value0) {
          this.value0 = value0;
      };
      CBottom.create = function (value0) {
          return new CBottom(value0);
      };
      return CBottom;
  })();
  var CLeft = (function () {
      function CLeft(value0) {
          this.value0 = value0;
      };
      CLeft.create = function (value0) {
          return new CLeft(value0);
      };
      return CLeft;
  })();
  var Layer = (function () {
      function Layer(value0, value1, value2) {
          this.value0 = value0;
          this.value1 = value1;
          this.value2 = value2;
      };
      Layer.create = function (value0) {
          return function (value1) {
              return function (value2) {
                  return new Layer(value0, value1, value2);
              };
          };
      };
      return Layer;
  })();
  var slotRelative = function (v) {
      return Data_Variant.onMatch()(Data_Variant_Internal.variantMatchCons(Data_Variant_Internal.variantMatchCons(Data_Variant_Internal.variantMatchCons(Data_Variant_Internal.variantMatchCons(Data_Variant_Internal.variantMatchCons(Data_Variant_Internal.variantMatchCons(Data_Variant_Internal.variantMatchNil)()(Type_Equality.refl))()(Type_Equality.refl))()(Type_Equality.refl))()(Type_Equality.refl))()(Type_Equality.refl))()(Type_Equality.refl))()({
          full: function (v1) {
              return function (p) {
                  return p;
              };
          },
          padded: function (v1) {
              return function (p) {
                  return {
                      x: p.x - v.padding.left,
                      y: p.y - v.padding.top
                  };
              };
          },
          top: function (v1) {
              return function (p) {
                  return {
                      x: p.x - v.padding.left,
                      y: p.y
                  };
              };
          },
          right: function (v1) {
              return function (p) {
                  return {
                      x: p.x - (v.size.width - v.padding.right),
                      y: p.y
                  };
              };
          },
          bottom: function (v1) {
              return function (p) {
                  return {
                      x: p.x - v.padding.left,
                      y: p.y - (v.size.height - v.padding.bottom)
                  };
              };
          },
          left: function (v1) {
              return function (p) {
                  return p;
              };
          }
      })(Data_Variant.case_);
  }; 
  var functorComponent = new Data_Functor.Functor(function (f) {
      return function (m) {
          if (m instanceof Full) {
              return new Full(f(m.value0));
          };
          if (m instanceof Padded) {
              return new Padded(m.value0, f(m.value1));
          };
          if (m instanceof CTop) {
              return new CTop(f(m.value0));
          };
          if (m instanceof CRight) {
              return new CRight(f(m.value0));
          };
          if (m instanceof CBottom) {
              return new CBottom(f(m.value0));
          };
          if (m instanceof CLeft) {
              return new CLeft(f(m.value0));
          };
          throw new Error("Failed pattern match at Genetics.Browser.Layer line 50, column 8 - line 50, column 54: " + [ m.constructor.name ]);
      };
  });
  var functorLayer = new Data_Functor.Functor(function (f) {
      return function (m) {
          return new Layer(m.value0, m.value1, Data_Functor.map(functorComponent)(f)(m.value2));
      };
  });
  var eqLayerMask = new Data_Eq.Eq(function (x) {
      return function (y) {
          if (x instanceof NoMask && y instanceof NoMask) {
              return true;
          };
          if (x instanceof Masked && y instanceof Masked) {
              return true;
          };
          return false;
      };
  });
  var browserSlots = function (v) {
      var wC = v.size.width - v.padding.right - v.padding.left;
      var p0 = {
          x: 0.0,
          y: 0.0
      };
      var top = {
          offset: {
              x: v.padding.left,
              y: p0.y
          },
          size: {
              width: wC,
              height: v.padding.top
          }
      };
      var left = {
          offset: {
              y: v.padding.top,
              x: p0.x
          },
          size: {
              width: v.padding.left,
              height: v.size.height - (v.padding.top + v.padding.bottom)
          }
      };
      var padded = {
          offset: {
              x: v.padding.left,
              y: v.padding.top
          },
          size: {
              width: wC,
              height: v.size.height - v.padding.top - v.padding.bottom
          }
      };
      var right = {
          offset: {
              x: v.size.width - v.padding.right,
              y: v.padding.top
          },
          size: {
              width: v.padding.right,
              height: v.size.height - (v.padding.top + v.padding.bottom)
          }
      };
      var full = {
          offset: p0,
          size: v.size
      };
      var bottom = {
          offset: {
              x: v.padding.left,
              y: v.size.height - v.padding.bottom
          },
          size: {
              width: wC,
              height: v.padding.bottom
          }
      };
      return {
          full: full,
          padded: padded,
          top: top,
          right: right,
          bottom: bottom,
          left: left
      };
  };
  var slotContext = function (dictMonadEffect) {
      return function (v) {
          return function (dims) {
              return function (el) {
                  return Effect_Class.liftEffect(dictMonadEffect)(function __do() {
                      var v1 = Graphics_Canvas.getContext2D(el)();
                      var slots = browserSlots(dims);
                      var clipMask = function (p0) {
                          return function (p1) {
                              return function __do() {
                                  var v2 = Graphics_Canvas.beginPath(v1)();
                                  var v3 = Graphics_Canvas.moveTo(v1)(p0.x)(p0.y)();
                                  var v4 = Graphics_Canvas.lineTo(v1)(p1.x)(p0.y)();
                                  var v5 = Graphics_Canvas.lineTo(v1)(p1.x)(p1.y)();
                                  var v6 = Graphics_Canvas.lineTo(v1)(p0.x)(p1.y)();
                                  var v7 = Graphics_Canvas.clip(v1)();
                                  return Data_Functor["void"](Effect.functorEffect)(Graphics_Canvas.closePath(v1))();
                              };
                          };
                      };
                      if (v.value2 instanceof Full) {
                          return v1;
                      };
                      if (v.value2 instanceof Padded) {
                          $foreign.setContextTranslation({
                              x: slots.padded.offset.x,
                              y: slots.padded.offset.y
                          })(v1)();
                          Control_Applicative.when(Effect.applicativeEffect)(Data_Eq.eq(eqLayerMask)(v.value1)(Masked.value))(clipMask({
                              x: -v.value2.value0,
                              y: -v.value2.value0
                          })({
                              x: slots.padded.size.width + v.value2.value0,
                              y: slots.padded.size.height + v.value2.value0
                          }))();
                          return v1;
                      };
                      if (v.value2 instanceof CTop) {
                          $foreign.setContextTranslation({
                              x: slots.top.offset.x,
                              y: slots.top.offset.y
                          })(v1)();
                          return v1;
                      };
                      if (v.value2 instanceof CRight) {
                          $foreign.setContextTranslation({
                              x: slots.right.offset.x,
                              y: slots.right.offset.y
                          })(v1)();
                          return v1;
                      };
                      if (v.value2 instanceof CBottom) {
                          $foreign.setContextTranslation({
                              x: slots.bottom.offset.x,
                              y: slots.bottom.offset.y
                          })(v1)();
                          Control_Applicative.when(Effect.applicativeEffect)(Data_Eq.eq(eqLayerMask)(v.value1)(Masked.value))(clipMask({
                              x: 0.0,
                              y: 0.0
                          })({
                              x: slots.bottom.size.width,
                              y: slots.bottom.size.height
                          }))();
                          return v1;
                      };
                      if (v.value2 instanceof CLeft) {
                          $foreign.setContextTranslation({
                              x: slots.left.offset.x,
                              y: slots.left.offset.y
                          })(v1)();
                          return v1;
                      };
                      throw new Error("Failed pattern match at Genetics.Browser.Layer line 206, column 3 - line 238, column 12: " + [ v.value2.constructor.name ]);
                  });
              };
          };
      };
  };
  var _top = Data_Symbol.SProxy.value;
  var _right = Data_Symbol.SProxy.value;
  var _padded = Data_Symbol.SProxy.value;
  var _left = Data_Symbol.SProxy.value;
  var _full = Data_Symbol.SProxy.value;
  var _bottom = Data_Symbol.SProxy.value;
  var asSlot = function (v) {
      if (v instanceof Full) {
          return Data_Variant.inj()(new Data_Symbol.IsSymbol(function () {
              return "full";
          }))(_full)(v.value0);
      };
      if (v instanceof Padded) {
          return Data_Variant.inj()(new Data_Symbol.IsSymbol(function () {
              return "padded";
          }))(_padded)(v.value1);
      };
      if (v instanceof CTop) {
          return Data_Variant.inj()(new Data_Symbol.IsSymbol(function () {
              return "top";
          }))(_top)(v.value0);
      };
      if (v instanceof CRight) {
          return Data_Variant.inj()(new Data_Symbol.IsSymbol(function () {
              return "right";
          }))(_right)(v.value0);
      };
      if (v instanceof CBottom) {
          return Data_Variant.inj()(new Data_Symbol.IsSymbol(function () {
              return "bottom";
          }))(_bottom)(v.value0);
      };
      if (v instanceof CLeft) {
          return Data_Variant.inj()(new Data_Symbol.IsSymbol(function () {
              return "left";
          }))(_left)(v.value0);
      };
      throw new Error("Failed pattern match at Genetics.Browser.Layer line 105, column 10 - line 111, column 30: " + [ v.constructor.name ]);
  };
  var _Component = Data_Lens_Getter.to(function (v) {
      if (v instanceof Full) {
          return v.value0;
      };
      if (v instanceof Padded) {
          return v.value1;
      };
      if (v instanceof CTop) {
          return v.value0;
      };
      if (v instanceof CRight) {
          return v.value0;
      };
      if (v instanceof CBottom) {
          return v.value0;
      };
      if (v instanceof CLeft) {
          return v.value0;
      };
      throw new Error("Failed pattern match at Genetics.Browser.Layer line 40, column 17 - line 46, column 18: " + [ v.constructor.name ]);
  });
  exports["Full"] = Full;
  exports["Padded"] = Padded;
  exports["CTop"] = CTop;
  exports["CRight"] = CRight;
  exports["CBottom"] = CBottom;
  exports["CLeft"] = CLeft;
  exports["_Component"] = _Component;
  exports["Layer"] = Layer;
  exports["Fixed"] = Fixed;
  exports["Scrolling"] = Scrolling;
  exports["NoMask"] = NoMask;
  exports["Masked"] = Masked;
  exports["_full"] = _full;
  exports["_padded"] = _padded;
  exports["_top"] = _top;
  exports["_right"] = _right;
  exports["_bottom"] = _bottom;
  exports["_left"] = _left;
  exports["asSlot"] = asSlot;
  exports["slotRelative"] = slotRelative;
  exports["browserSlots"] = browserSlots;
  exports["slotContext"] = slotContext;
  exports["functorComponent"] = functorComponent;
  exports["functorLayer"] = functorLayer;
  exports["eqLayerMask"] = eqLayerMask;
  exports["setContextTranslation"] = $foreign.setContextTranslation;
})(PS["Genetics.Browser.Layer"] = PS["Genetics.Browser.Layer"] || {});
(function(exports) {
  // Generated by purs version 0.12.0
  "use strict";
  var Control_Alt = PS["Control.Alt"];
  var Data_Eq = PS["Data.Eq"];
  var Data_Foldable = PS["Data.Foldable"];
  var Data_HeytingAlgebra = PS["Data.HeytingAlgebra"];
  var Data_Maybe = PS["Data.Maybe"];
  var Data_Monoid = PS["Data.Monoid"];
  var Data_Semigroup = PS["Data.Semigroup"];
  var Data_Show = PS["Data.Show"];
  var Prelude = PS["Prelude"];
  var Font = (function () {
      function Font(value0, value1, value2) {
          this.value0 = value0;
          this.value1 = value1;
          this.value2 = value2;
      };
      Font.create = function (value0) {
          return function (value1) {
              return function (value2) {
                  return new Font(value0, value1, value2);
              };
          };
      };
      return Font;
  })();               
  var semigroupFontOptions = new Data_Semigroup.Semigroup(function (v) {
      return function (v1) {
          return {
              style: Control_Alt.alt(Data_Maybe.altMaybe)(v.style)(v1.style),
              variant: Control_Alt.alt(Data_Maybe.altMaybe)(v.variant)(v1.variant),
              weight: Control_Alt.alt(Data_Maybe.altMaybe)(v.weight)(v1.weight)
          };
      };
  });
  var sansSerif = "sans-serif";
  var optionsString = function (v) {
      return Data_Foldable.intercalate(Data_Foldable.foldableArray)(Data_Monoid.monoidString)(" ")([ Data_Foldable.fold(Data_Foldable.foldableMaybe)(Data_Monoid.monoidString)(v.style), Data_Foldable.fold(Data_Foldable.foldableMaybe)(Data_Monoid.monoidString)(v.variant), Data_Foldable.fold(Data_Foldable.foldableMaybe)(Data_Monoid.monoidString)(v.weight) ]);
  };                          
  var monoidFontOptions = new Data_Monoid.Monoid(function () {
      return semigroupFontOptions;
  }, {
      style: Data_Maybe.Nothing.value,
      variant: Data_Maybe.Nothing.value,
      weight: Data_Maybe.Nothing.value
  });
  var fontString = function (v) {
      return optionsString(v.value2) + (" " + (Data_Show.show(Data_Show.showInt)(v.value1) + ("px " + v.value0)));
  };
  var font = Font.create;
  exports["font"] = font;
  exports["fontString"] = fontString;
  exports["sansSerif"] = sansSerif;
  exports["semigroupFontOptions"] = semigroupFontOptions;
  exports["monoidFontOptions"] = monoidFontOptions;
})(PS["Graphics.Drawing.Font"] = PS["Graphics.Drawing.Font"] || {});
(function(exports) {
  // Generated by purs version 0.12.0
  "use strict";
  var Color = PS["Color"];
  var Control_Alt = PS["Control.Alt"];
  var Control_Applicative = PS["Control.Applicative"];
  var Control_Bind = PS["Control.Bind"];
  var Control_Semigroupoid = PS["Control.Semigroupoid"];
  var Data_Eq = PS["Data.Eq"];
  var Data_Foldable = PS["Data.Foldable"];
  var Data_Function = PS["Data.Function"];
  var Data_Functor = PS["Data.Functor"];
  var Data_HeytingAlgebra = PS["Data.HeytingAlgebra"];
  var Data_List = PS["Data.List"];
  var Data_List_Types = PS["Data.List.Types"];
  var Data_Maybe = PS["Data.Maybe"];
  var Data_Monoid = PS["Data.Monoid"];
  var Data_Semigroup = PS["Data.Semigroup"];
  var Data_Semiring = PS["Data.Semiring"];
  var Data_Symbol = PS["Data.Symbol"];
  var Data_Unit = PS["Data.Unit"];
  var Effect = PS["Effect"];
  var Graphics_Canvas = PS["Graphics.Canvas"];
  var Graphics_Drawing_Font = PS["Graphics.Drawing.Font"];
  var $$Math = PS["Math"];
  var Prelude = PS["Prelude"];
  var Path = (function () {
      function Path(value0, value1) {
          this.value0 = value0;
          this.value1 = value1;
      };
      Path.create = function (value0) {
          return function (value1) {
              return new Path(value0, value1);
          };
      };
      return Path;
  })();
  var Rectangle = (function () {
      function Rectangle(value0) {
          this.value0 = value0;
      };
      Rectangle.create = function (value0) {
          return new Rectangle(value0);
      };
      return Rectangle;
  })();
  var Arc = (function () {
      function Arc(value0) {
          this.value0 = value0;
      };
      Arc.create = function (value0) {
          return new Arc(value0);
      };
      return Arc;
  })();
  var Composite = (function () {
      function Composite(value0) {
          this.value0 = value0;
      };
      Composite.create = function (value0) {
          return new Composite(value0);
      };
      return Composite;
  })();
  var Fill = (function () {
      function Fill(value0, value1) {
          this.value0 = value0;
          this.value1 = value1;
      };
      Fill.create = function (value0) {
          return function (value1) {
              return new Fill(value0, value1);
          };
      };
      return Fill;
  })();
  var Outline = (function () {
      function Outline(value0, value1) {
          this.value0 = value0;
          this.value1 = value1;
      };
      Outline.create = function (value0) {
          return function (value1) {
              return new Outline(value0, value1);
          };
      };
      return Outline;
  })();
  var Text = (function () {
      function Text(value0, value1, value2, value3, value4) {
          this.value0 = value0;
          this.value1 = value1;
          this.value2 = value2;
          this.value3 = value3;
          this.value4 = value4;
      };
      Text.create = function (value0) {
          return function (value1) {
              return function (value2) {
                  return function (value3) {
                      return function (value4) {
                          return new Text(value0, value1, value2, value3, value4);
                      };
                  };
              };
          };
      };
      return Text;
  })();
  var Many = (function () {
      function Many(value0) {
          this.value0 = value0;
      };
      Many.create = function (value0) {
          return new Many(value0);
      };
      return Many;
  })();
  var Scale = (function () {
      function Scale(value0, value1) {
          this.value0 = value0;
          this.value1 = value1;
      };
      Scale.create = function (value0) {
          return function (value1) {
              return new Scale(value0, value1);
          };
      };
      return Scale;
  })();
  var Translate = (function () {
      function Translate(value0, value1) {
          this.value0 = value0;
          this.value1 = value1;
      };
      Translate.create = function (value0) {
          return function (value1) {
              return new Translate(value0, value1);
          };
      };
      return Translate;
  })();
  var Rotate = (function () {
      function Rotate(value0, value1) {
          this.value0 = value0;
          this.value1 = value1;
      };
      Rotate.create = function (value0) {
          return function (value1) {
              return new Rotate(value0, value1);
          };
      };
      return Rotate;
  })();
  var Clipped = (function () {
      function Clipped(value0, value1) {
          this.value0 = value0;
          this.value1 = value1;
      };
      Clipped.create = function (value0) {
          return function (value1) {
              return new Clipped(value0, value1);
          };
      };
      return Clipped;
  })();
  var WithShadow = (function () {
      function WithShadow(value0, value1) {
          this.value0 = value0;
          this.value1 = value1;
      };
      WithShadow.create = function (value0) {
          return function (value1) {
              return new WithShadow(value0, value1);
          };
      };
      return WithShadow;
  })();
  var translate = function (tx) {
      return function (ty) {
          return Translate.create({
              translateX: tx,
              translateY: ty
          });
      };
  };
  var text = Text.create;        
  var semigroupShape = new Data_Semigroup.Semigroup(function (v) {
      return function (v1) {
          if (v instanceof Composite) {
              return new Composite(Data_Semigroup.append(Data_List_Types.semigroupList)(v.value0)(Data_List.singleton(v1)));
          };
          if (v1 instanceof Composite) {
              return new Composite(new Data_List_Types.Cons(v, v1.value0));
          };
          return new Composite(new Data_List_Types.Cons(v, new Data_List_Types.Cons(v1, Data_List_Types.Nil.value)));
      };
  });
  var semigroupOutlineStyle = new Data_Semigroup.Semigroup(function (v) {
      return function (v1) {
          return {
              color: Control_Alt.alt(Data_Maybe.altMaybe)(v.color)(v1.color),
              lineWidth: Control_Alt.alt(Data_Maybe.altMaybe)(v.lineWidth)(v1.lineWidth)
          };
      };
  });
  var semigroupDrawing = new Data_Semigroup.Semigroup(function (v) {
      return function (v1) {
          if (v instanceof Many) {
              return new Many(Data_Semigroup.append(Data_List_Types.semigroupList)(v.value0)(Data_List.singleton(v1)));
          };
          if (v1 instanceof Many) {
              return new Many(new Data_List_Types.Cons(v, v1.value0));
          };
          return new Many(new Data_List_Types.Cons(v, new Data_List_Types.Cons(v1, Data_List_Types.Nil.value)));
      };
  });
  var scale = function (sx) {
      return function (sy) {
          return Scale.create({
              scaleX: sx,
              scaleY: sy
          });
      };
  };
  var rotate = Rotate.create;
  var render = function (ctx) {
      var renderShape = function (v) {
          if (v instanceof Path && v.value1 instanceof Data_List_Types.Nil) {
              return Control_Applicative.pure(Effect.applicativeEffect)(Data_Unit.unit);
          };
          if (v instanceof Path && v.value1 instanceof Data_List_Types.Cons) {
              return function __do() {
                  var v1 = Graphics_Canvas.moveTo(ctx)(v.value1.value0.x)(v.value1.value0.y)();
                  Data_Foldable.for_(Effect.applicativeEffect)(Data_List_Types.foldableList)(v.value1.value1)(function (pt) {
                      return Graphics_Canvas.lineTo(ctx)(pt.x)(pt.y);
                  })();
                  return Control_Applicative.when(Effect.applicativeEffect)(v.value0)(Data_Functor["void"](Effect.functorEffect)(Graphics_Canvas.closePath(ctx)))();
              };
          };
          if (v instanceof Rectangle) {
              return Data_Functor["void"](Effect.functorEffect)(Graphics_Canvas.rect(ctx)(v.value0));
          };
          if (v instanceof Arc) {
              return Data_Functor["void"](Effect.functorEffect)(Graphics_Canvas.arc(ctx)(v.value0));
          };
          if (v instanceof Composite) {
              return Data_Foldable.for_(Effect.applicativeEffect)(Data_List_Types.foldableList)(v.value0)(renderShape);
          };
          throw new Error("Failed pattern match at Graphics.Drawing line 268, column 3 - line 268, column 38: " + [ v.constructor.name ]);
      };
      var applyShadow = function (v) {
          return function __do() {
              Data_Foldable.for_(Effect.applicativeEffect)(Data_Foldable.foldableMaybe)(v.color)(function (color) {
                  return Graphics_Canvas.setShadowColor(ctx)(Color.cssStringHSLA(color));
              })();
              Data_Foldable.for_(Effect.applicativeEffect)(Data_Foldable.foldableMaybe)(v.blur)(function (blur) {
                  return Graphics_Canvas.setShadowBlur(ctx)(blur);
              })();
              return Data_Foldable.for_(Effect.applicativeEffect)(Data_Foldable.foldableMaybe)(v.offset)(function (offset) {
                  return function __do() {
                      var v1 = Graphics_Canvas.setShadowOffsetX(ctx)(offset.x)();
                      return Graphics_Canvas.setShadowOffsetY(ctx)(offset.y)();
                  };
              })();
          };
      };
      var applyOutlineStyle = function (v) {
          return function __do() {
              Data_Foldable.for_(Effect.applicativeEffect)(Data_Foldable.foldableMaybe)(v.color)(function (color) {
                  return Graphics_Canvas.setStrokeStyle(ctx)(Color.cssStringHSLA(color));
              })();
              return Data_Foldable.for_(Effect.applicativeEffect)(Data_Foldable.foldableMaybe)(v.lineWidth)(function (width) {
                  return Graphics_Canvas.setLineWidth(ctx)(width);
              })();
          };
      };
      var applyFillStyle = function (v) {
          return Data_Foldable.for_(Effect.applicativeEffect)(Data_Foldable.foldableMaybe)(v.color)(function (color) {
              return Graphics_Canvas.setFillStyle(ctx)(Color.cssStringHSLA(color));
          });
      };
      var go = function (v) {
          if (v instanceof Fill) {
              return Data_Functor["void"](Effect.functorEffect)(Graphics_Canvas.withContext(ctx)(function __do() {
                  applyFillStyle(v.value1)();
                  return Graphics_Canvas.fillPath(ctx)(renderShape(v.value0))();
              }));
          };
          if (v instanceof Outline) {
              return Data_Functor["void"](Effect.functorEffect)(Graphics_Canvas.withContext(ctx)(function __do() {
                  applyOutlineStyle(v.value1)();
                  return Graphics_Canvas.strokePath(ctx)(renderShape(v.value0))();
              }));
          };
          if (v instanceof Many) {
              return Data_Foldable.for_(Effect.applicativeEffect)(Data_List_Types.foldableList)(v.value0)(go);
          };
          if (v instanceof Scale) {
              return Data_Functor["void"](Effect.functorEffect)(Graphics_Canvas.withContext(ctx)(function __do() {
                  var v1 = Graphics_Canvas.scale(ctx)(v.value0)();
                  return go(v.value1)();
              }));
          };
          if (v instanceof Translate) {
              return Data_Functor["void"](Effect.functorEffect)(Graphics_Canvas.withContext(ctx)(function __do() {
                  var v1 = Graphics_Canvas.translate(ctx)(v.value0)();
                  return go(v.value1)();
              }));
          };
          if (v instanceof Rotate) {
              return Data_Functor["void"](Effect.functorEffect)(Graphics_Canvas.withContext(ctx)(function __do() {
                  var v1 = Graphics_Canvas.rotate(ctx)(v.value0)();
                  return go(v.value1)();
              }));
          };
          if (v instanceof Clipped) {
              return Data_Functor["void"](Effect.functorEffect)(Graphics_Canvas.withContext(ctx)(function __do() {
                  renderShape(v.value0)();
                  var v1 = Graphics_Canvas.clip(ctx)();
                  return go(v.value1)();
              }));
          };
          if (v instanceof WithShadow) {
              return Data_Functor["void"](Effect.functorEffect)(Graphics_Canvas.withContext(ctx)(function __do() {
                  applyShadow(v.value0)();
                  return go(v.value1)();
              }));
          };
          if (v instanceof Text) {
              return Data_Functor["void"](Effect.functorEffect)(Graphics_Canvas.withContext(ctx)(function __do() {
                  var v1 = Graphics_Canvas.setFont(ctx)(Graphics_Drawing_Font.fontString(v.value0))();
                  applyFillStyle(v.value3)();
                  return Graphics_Canvas.fillText(ctx)(v.value4)(v.value1)(v.value2)();
              }));
          };
          throw new Error("Failed pattern match at Graphics.Drawing line 221, column 3 - line 224, column 21: " + [ v.constructor.name ]);
      };
      return go;
  };
  var rectangle = function (x) {
      return function (y) {
          return function (width) {
              return function (height) {
                  return new Rectangle({
                      x: x,
                      y: y,
                      width: width,
                      height: height
                  });
              };
          };
      };
  };
  var path = function (dictFoldable) {
      return function ($211) {
          return Path.create(false)(Data_List.fromFoldable(dictFoldable)($211));
      };
  };
  var outlined = Data_Function.flip(Outline.create);
  var outlineColor = function (c) {
      return {
          color: new Data_Maybe.Just(c),
          lineWidth: Data_Maybe.Nothing.value
      };
  };
  var monoidShape = new Data_Monoid.Monoid(function () {
      return semigroupShape;
  }, new Composite(Data_Monoid.mempty(Data_List_Types.monoidList)));
  var monoidDrawing = new Data_Monoid.Monoid(function () {
      return semigroupDrawing;
  }, new Many(Data_Monoid.mempty(Data_List_Types.monoidList)));
  var lineWidth = function (c) {
      return {
          color: Data_Maybe.Nothing.value,
          lineWidth: new Data_Maybe.Just(c)
      };
  };
  var filled = Data_Function.flip(Fill.create);
  var fillColor = function (c) {
      return {
          color: new Data_Maybe.Just(c)
      };
  };                           
  var arc = function (x) {
      return function (y) {
          return function (start) {
              return function (end) {
                  return function (radius) {
                      return new Arc({
                          x: x,
                          y: y,
                          start: start,
                          end: end,
                          radius: radius
                      });
                  };
              };
          };
      };
  };
  var circle = function (x) {
      return function (y) {
          return arc(x)(y)(0.0)($$Math.pi * 2.0);
      };
  };
  exports["path"] = path;
  exports["rectangle"] = rectangle;
  exports["circle"] = circle;
  exports["arc"] = arc;
  exports["fillColor"] = fillColor;
  exports["outlineColor"] = outlineColor;
  exports["lineWidth"] = lineWidth;
  exports["filled"] = filled;
  exports["outlined"] = outlined;
  exports["scale"] = scale;
  exports["translate"] = translate;
  exports["rotate"] = rotate;
  exports["text"] = text;
  exports["render"] = render;
  exports["semigroupShape"] = semigroupShape;
  exports["monoidShape"] = monoidShape;
  exports["semigroupOutlineStyle"] = semigroupOutlineStyle;
  exports["semigroupDrawing"] = semigroupDrawing;
  exports["monoidDrawing"] = monoidDrawing;
})(PS["Graphics.Drawing"] = PS["Graphics.Drawing"] || {});
(function(exports) {
    "use strict";

  exports.appendChild = function (node) {
    return function (parent) {
      return function () {
        return parent.appendChild(node);
      };
    };
  };
})(PS["Web.DOM.Node"] = PS["Web.DOM.Node"] || {});
(function(exports) {
    "use strict";

  var getEffProp = function (name) {
    return function (doc) {
      return function () {
        return doc[name];
      };
    };
  };                                       
  exports._documentElement = getEffProp("documentElement");

  exports.createElement = function (localName) {
    return function (doc) {
      return function () {
        return doc.createElement(localName);
      };
    };
  };
})(PS["Web.DOM.Document"] = PS["Web.DOM.Document"] || {});
(function(exports) {
    "use strict";                      

  exports.id = function (node) {
    return function () {
      return node.id;
    };
  };

  exports.setId = function (id) {
    return function (node) {
      return function () {
        node.id = id;
        return {};
      };
    };
  };
})(PS["Web.DOM.Element"] = PS["Web.DOM.Element"] || {});
(function(exports) {
    "use strict";                                             

  exports._querySelector = function (selector) {
    return function (node) {
      return function () {
        return node.querySelector(selector);
      };
    };
  };
})(PS["Web.DOM.ParentNode"] = PS["Web.DOM.ParentNode"] || {});
(function(exports) {
  // Generated by purs version 0.12.0
  "use strict";
  var $foreign = PS["Web.DOM.ParentNode"];
  var Control_Semigroupoid = PS["Control.Semigroupoid"];
  var Data_Eq = PS["Data.Eq"];
  var Data_Functor = PS["Data.Functor"];
  var Data_Maybe = PS["Data.Maybe"];
  var Data_Newtype = PS["Data.Newtype"];
  var Data_Nullable = PS["Data.Nullable"];
  var Data_Ord = PS["Data.Ord"];
  var Effect = PS["Effect"];
  var Prelude = PS["Prelude"];
  var Web_DOM_HTMLCollection = PS["Web.DOM.HTMLCollection"];
  var Web_DOM_Internal_Types = PS["Web.DOM.Internal.Types"];
  var Web_DOM_NodeList = PS["Web.DOM.NodeList"];                 
  var QuerySelector = function (x) {
      return x;
  };
  var querySelector = function (qs) {
      return function ($3) {
          return Data_Functor.map(Effect.functorEffect)(Data_Nullable.toMaybe)($foreign._querySelector(qs)($3));
      };
  };                                        
  var newtypeQuerySelector = new Data_Newtype.Newtype(function (n) {
      return n;
  }, QuerySelector);
  exports["QuerySelector"] = QuerySelector;
  exports["querySelector"] = querySelector;
  exports["newtypeQuerySelector"] = newtypeQuerySelector;
})(PS["Web.DOM.ParentNode"] = PS["Web.DOM.ParentNode"] || {});
(function(exports) {
  // Generated by purs version 0.12.0
  "use strict";
  var $foreign = PS["Web.DOM.Element"];
  var Control_Semigroupoid = PS["Control.Semigroupoid"];
  var Data_Functor = PS["Data.Functor"];
  var Data_Maybe = PS["Data.Maybe"];
  var Data_Nullable = PS["Data.Nullable"];
  var Effect = PS["Effect"];
  var Prelude = PS["Prelude"];
  var Unsafe_Coerce = PS["Unsafe.Coerce"];
  var Web_DOM_ChildNode = PS["Web.DOM.ChildNode"];
  var Web_DOM_Internal_Types = PS["Web.DOM.Internal.Types"];
  var Web_DOM_NonDocumentTypeChildNode = PS["Web.DOM.NonDocumentTypeChildNode"];
  var Web_DOM_ParentNode = PS["Web.DOM.ParentNode"];
  var Web_Event_EventTarget = PS["Web.Event.EventTarget"];
  var Web_Internal_FFI = PS["Web.Internal.FFI"];              
  var toNode = Unsafe_Coerce.unsafeCoerce;
  exports["toNode"] = toNode;
  exports["setId"] = $foreign.setId;
})(PS["Web.DOM.Element"] = PS["Web.DOM.Element"] || {});
(function(exports) {
  // Generated by purs version 0.12.0
  "use strict";
  var $foreign = PS["Web.DOM.Document"];
  var Control_Semigroupoid = PS["Control.Semigroupoid"];
  var Data_Functor = PS["Data.Functor"];
  var Data_Maybe = PS["Data.Maybe"];
  var Data_Nullable = PS["Data.Nullable"];
  var Effect = PS["Effect"];
  var Prelude = PS["Prelude"];
  var Unsafe_Coerce = PS["Unsafe.Coerce"];
  var Web_DOM_Comment = PS["Web.DOM.Comment"];
  var Web_DOM_DocumentFragment = PS["Web.DOM.DocumentFragment"];
  var Web_DOM_DocumentType = PS["Web.DOM.DocumentType"];
  var Web_DOM_Element = PS["Web.DOM.Element"];
  var Web_DOM_HTMLCollection = PS["Web.DOM.HTMLCollection"];
  var Web_DOM_Internal_Types = PS["Web.DOM.Internal.Types"];
  var Web_DOM_NonElementParentNode = PS["Web.DOM.NonElementParentNode"];
  var Web_DOM_ParentNode = PS["Web.DOM.ParentNode"];
  var Web_DOM_ProcessingInstruction = PS["Web.DOM.ProcessingInstruction"];
  var Web_DOM_Text = PS["Web.DOM.Text"];
  var Web_Event_EventTarget = PS["Web.Event.EventTarget"];
  var Web_Internal_FFI = PS["Web.Internal.FFI"];                 
  var toParentNode = Unsafe_Coerce.unsafeCoerce;                           
  var documentElement = function ($1) {
      return Data_Functor.map(Effect.functorEffect)(Data_Nullable.toMaybe)($foreign._documentElement($1));
  };
  exports["toParentNode"] = toParentNode;
  exports["documentElement"] = documentElement;
  exports["createElement"] = $foreign.createElement;
})(PS["Web.DOM.Document"] = PS["Web.DOM.Document"] || {});
(function(exports) {
  // Generated by purs version 0.12.0
  "use strict";
  var $foreign = PS["Web.DOM.Node"];
  var Control_Semigroupoid = PS["Control.Semigroupoid"];
  var Data_Enum = PS["Data.Enum"];
  var Data_Functor = PS["Data.Functor"];
  var Data_Maybe = PS["Data.Maybe"];
  var Data_Nullable = PS["Data.Nullable"];
  var Effect = PS["Effect"];
  var Prelude = PS["Prelude"];
  var Unsafe_Coerce = PS["Unsafe.Coerce"];
  var Web_DOM_Document = PS["Web.DOM.Document"];
  var Web_DOM_Element = PS["Web.DOM.Element"];
  var Web_DOM_Internal_Types = PS["Web.DOM.Internal.Types"];
  var Web_DOM_NodeType = PS["Web.DOM.NodeType"];
  var Web_Event_EventTarget = PS["Web.Event.EventTarget"];
  var Web_Internal_FFI = PS["Web.Internal.FFI"];
  exports["appendChild"] = $foreign.appendChild;
})(PS["Web.DOM.Node"] = PS["Web.DOM.Node"] || {});
(function(exports) {
  // Generated by purs version 0.12.0
  "use strict";
  var $foreign = PS["Genetics.Browser.Canvas"];
  var Control_Applicative = PS["Control.Applicative"];
  var Control_Bind = PS["Control.Bind"];
  var Control_Semigroupoid = PS["Control.Semigroupoid"];
  var Data_Either = PS["Data.Either"];
  var Data_Eq = PS["Data.Eq"];
  var Data_EuclideanRing = PS["Data.EuclideanRing"];
  var Data_Filterable = PS["Data.Filterable"];
  var Data_Foldable = PS["Data.Foldable"];
  var Data_Function = PS["Data.Function"];
  var Data_Functor = PS["Data.Functor"];
  var Data_HeytingAlgebra = PS["Data.HeytingAlgebra"];
  var Data_Int = PS["Data.Int"];
  var Data_Lens = PS["Data.Lens"];
  var Data_Lens_Fold = PS["Data.Lens.Fold"];
  var Data_Lens_Getter = PS["Data.Lens.Getter"];
  var Data_Lens_Internal_Forget = PS["Data.Lens.Internal.Forget"];
  var Data_Lens_Iso_Newtype = PS["Data.Lens.Iso.Newtype"];
  var Data_Lens_Prism = PS["Data.Lens.Prism"];
  var Data_Lens_Record = PS["Data.Lens.Record"];
  var Data_List = PS["Data.List"];
  var Data_List_Types = PS["Data.List.Types"];
  var Data_Map = PS["Data.Map"];
  var Data_Map_Internal = PS["Data.Map.Internal"];
  var Data_Maybe = PS["Data.Maybe"];
  var Data_Maybe_First = PS["Data.Maybe.First"];
  var Data_Monoid = PS["Data.Monoid"];
  var Data_Newtype = PS["Data.Newtype"];
  var Data_Nullable = PS["Data.Nullable"];
  var Data_Ord = PS["Data.Ord"];
  var Data_Pair = PS["Data.Pair"];
  var Data_Ring = PS["Data.Ring"];
  var Data_Semigroup = PS["Data.Semigroup"];
  var Data_Semiring = PS["Data.Semiring"];
  var Data_Set = PS["Data.Set"];
  var Data_Show = PS["Data.Show"];
  var Data_Symbol = PS["Data.Symbol"];
  var Data_Time_Duration = PS["Data.Time.Duration"];
  var Data_Traversable = PS["Data.Traversable"];
  var Data_TraversableWithIndex = PS["Data.TraversableWithIndex"];
  var Data_Tuple = PS["Data.Tuple"];
  var Data_Unit = PS["Data.Unit"];
  var Data_Variant = PS["Data.Variant"];
  var Data_Variant_Internal = PS["Data.Variant.Internal"];
  var Effect = PS["Effect"];
  var Effect_Class = PS["Effect.Class"];
  var Effect_Ref = PS["Effect.Ref"];
  var Effect_Uncurried = PS["Effect.Uncurried"];
  var Genetics_Browser_Layer = PS["Genetics.Browser.Layer"];
  var Graphics_Canvas = PS["Graphics.Canvas"];
  var Graphics_Drawing = PS["Graphics.Drawing"];
  var Graphics_Drawing_Font = PS["Graphics.Drawing.Font"];
  var Partial_Unsafe = PS["Partial.Unsafe"];
  var Prelude = PS["Prelude"];
  var Record = PS["Record"];
  var Type_Equality = PS["Type.Equality"];
  var Unsafe_Coerce = PS["Unsafe.Coerce"];
  var Web_DOM = PS["Web.DOM"];
  var Web_DOM_Node = PS["Web.DOM.Node"];                 
  var LLeft = (function () {
      function LLeft() {

      };
      LLeft.value = new LLeft();
      return LLeft;
  })();
  var LCenter = (function () {
      function LCenter() {

      };
      LCenter.value = new LCenter();
      return LCenter;
  })();
  var LRight = (function () {
      function LRight() {

      };
      LRight.value = new LRight();
      return LRight;
  })();
  var BufferedCanvas = function (x) {
      return x;
  };
  var Static = (function () {
      function Static(value0) {
          this.value0 = value0;
      };
      Static.create = function (value0) {
          return new Static(value0);
      };
      return Static;
  })();
  var Buffer = (function () {
      function Buffer(value0) {
          this.value0 = value0;
      };
      Buffer.create = function (value0) {
          return new Buffer(value0);
      };
      return Buffer;
  })();
  var BrowserContainer = function (x) {
      return x;
  };
  var translateBuffer = function (p) {
      return function (v) {
          return function __do() {
              $foreign.setCanvasTranslation(p)(v.back)();
              return $foreign.setCanvasTranslation(p)(v.front)();
          };
      };
  };
  var setElementStyle = Effect_Uncurried.runEffectFn3($foreign.setElementStyleImpl);
  var setElementStyles = function (el) {
      return Data_Foldable.traverse_(Effect.applicativeEffect)(Data_Foldable.foldableArray)(Data_Tuple.uncurry(setElementStyle(el)));
  };
  var setCanvasStyles = function ($241) {
      return setElementStyles($241);
  };
  var setCanvasPosition = function (v) {
      return function (ce) {
          return setCanvasStyles(ce)([ new Data_Tuple.Tuple("position", "absolute"), new Data_Tuple.Tuple("top", Data_Show.show(Data_Show.showNumber)(v.top) + "px"), new Data_Tuple.Tuple("left", Data_Show.show(Data_Show.showNumber)(v.left) + "px") ]);
      };
  };
  var scrollCanvas = function (v) {
      return Effect_Uncurried.runEffectFn3($foreign.scrollCanvasImpl)(v.back)(v.front);
  };              
  var newtypeBufferedCanvas = new Data_Newtype.Newtype(function (n) {
      return n;
  }, BufferedCanvas);
  var newtypeBrowserContainer = new Data_Newtype.Newtype(function (n) {
      return n;
  }, BrowserContainer);
  var wheelZoom = function (bc) {
      return function (cb) {
          return $foreign.canvasWheelCBImpl((function (v) {
              return v.element;
          })(Data_Newtype.unwrap(newtypeBrowserContainer)(bc)))(cb);
      };
  };
  var labelFontSize = 14;
  var labelFont = Graphics_Drawing_Font.fontString(Graphics_Drawing_Font.font(Graphics_Drawing_Font.sansSerif)(labelFontSize)(Data_Monoid.mempty(Graphics_Drawing_Font.monoidFontOptions)));
  var labelBox = function (ctx) {
      return function (v) {
          return function __do() {
              var v1 = Graphics_Canvas.withContext(ctx)(function __do() {
                  var v1 = Graphics_Canvas.setFont(ctx)(labelFont)();
                  return Graphics_Canvas.measureText(ctx)(v.text)();
              })();
              var pad = 14.0 + v1.width / 2.0;
              var x = (function () {
                  if (v.gravity instanceof LCenter) {
                      return v.point.x;
                  };
                  if (v.gravity instanceof LLeft) {
                      return v.point.x - pad;
                  };
                  if (v.gravity instanceof LRight) {
                      return v.point.x + pad;
                  };
                  throw new Error("Failed pattern match at Genetics.Browser.Canvas line 543, column 11 - line 546, column 33: " + [ v.gravity.constructor.name ]);
              })();
              var height = Data_Int.toNumber(labelFontSize);
              return {
                  x: x,
                  y: v.point.y - height,
                  width: v1.width,
                  height: height
              };
          };
      };
  };
  var isOverlapping = function (r1) {
      return function (r2) {
          return r1.x < r2.x + r2.width && (r1.x + r1.width > r2.x && (r1.y < r2.y + r2.height && r1.height + r1.y > r2.y));
      };
  };
  var glyphBufferSize = {
      width: 15.0,
      height: 300.0
  };
  var getLayers = function (dictMonadEffect) {
      return function (v) {
          return Effect_Class.liftEffect(dictMonadEffect)(Effect_Ref.read(v.layers));
      };
  };
  var getDimensions = function (dictMonadEffect) {
      return function (v) {
          return Effect_Class.liftEffect(dictMonadEffect)(Effect_Ref.read(v.dimensions));
      };
  }; 
  var elementClick = function (e) {
      return Effect_Uncurried.runEffectFn2($foreign.elementClickImpl)(e);
  };
  var clearCanvas = function (ctx) {
      return function (v) {
          return Data_Functor["void"](Effect.functorEffect)(Graphics_Canvas.clearRect(ctx)({
              x: 0.0,
              y: 0.0,
              width: v.width,
              height: v.height
          }));
      };
  };
  var renderGlyphs = function (glyphBuffer) {
      return function (ctx) {
          return function (v) {
              return function (v1) {
                  return function __do() {
                      var v2 = Graphics_Canvas.getContext2D(glyphBuffer)();
                      var x0 = glyphBufferSize.width / 2.0;
                      var y0 = glyphBufferSize.height / 2.0;
                      clearCanvas(v2)(glyphBufferSize)();
                      Graphics_Drawing.render(v2)(Graphics_Drawing.translate(x0)(y0)(v1.drawing))();
                      var pred = function (v3) {
                          return v3.x >= v.value0 && v3.x <= v.value1;
                      };
                      return $foreign.drawCopies(glyphBuffer, glyphBufferSize, ctx, pred, v1.points);
                  };
              };
          };
      };
  };
  var canvasDrag = function (el) {
      return function (f) {
          var toEither = function (g) {
              return function (v) {
                  var v1 = Data_Nullable.toMaybe(v.during);
                  if (v1 instanceof Data_Maybe.Just) {
                      return g(new Data_Either.Right(v1.value0));
                  };
                  if (v1 instanceof Data_Maybe.Nothing) {
                      return g(Data_Either.Left.create(Data_Maybe.fromMaybe({
                          x: 0,
                          y: 0
                      })(Data_Nullable.toMaybe(v.total))));
                  };
                  throw new Error("Failed pattern match at Genetics.Browser.Canvas line 210, column 36 - line 212, column 73: " + [ v1.constructor.name ]);
              };
          };
          return $foreign.canvasDragImpl(el)(toEither(f));
      };
  };
  var browserContainer = function (size) {
      return function (padding) {
          return function (element) {
              return function __do() {
                  $foreign.setContainerStyle(element)(size)();
                  var v = $foreign.createCanvas(glyphBufferSize)("glyphBuffer")();
                  var v1 = Effect_Ref["new"]({
                      size: size,
                      padding: padding
                  })();
                  var v2 = Effect_Ref["new"](Data_Monoid.mempty(Data_Map_Internal.monoidMap(Data_Ord.ordString)))();
                  return {
                      layers: v2,
                      dimensions: v1,
                      element: element,
                      glyphBuffer: v
                  };
              };
          };
      };
  };
  var blankBuffer = function (v) {
      return function __do() {
          translateBuffer({
              x: 0,
              y: 0
          })(v)();
          var v1 = Graphics_Canvas.getCanvasDimensions(v.back)();
          return Data_Foldable.for_(Effect.applicativeEffect)(Data_Foldable.foldableArray)([ v.back, v.front ])(Control_Bind.composeKleisliFlipped(Effect.bindEffect)(Data_Function.flip(clearCanvas)(v1))(Graphics_Canvas.getContext2D))();
      };
  };
  var createBufferedCanvas = function (dim) {
      return function (name) {
          return function __do() {
              var v = $foreign.createCanvas(dim)(name + "-buffer")();
              var v1 = $foreign.createCanvas(dim)(name)();
              var bc = {
                  back: v,
                  front: v1
              };
              blankBuffer(bc)();
              return bc;
          };
      };
  };
  var setBufferedCanvasSize = function (dim) {
      return function (v) {
          return function __do() {
              var v1 = Graphics_Canvas.setCanvasDimensions(v.back)(dim)();
              var v2 = Graphics_Canvas.setCanvasDimensions(v.front)(dim)();
              blankBuffer(v)();
              return Data_Unit.unit;
          };
      };
  };
  var resizeLayer = function (dictMonadEffect) {
      return function (dims) {
          return function (lc) {
              return Effect_Class.liftEffect(dictMonadEffect)((function () {
                  if (lc instanceof Static) {
                      return Data_Functor["void"](Effect.functorEffect)(Graphics_Canvas.setCanvasDimensions(lc.value0)(dims));
                  };
                  if (lc instanceof Buffer) {
                      return setBufferedCanvasSize(dims)(lc.value0);
                  };
                  throw new Error("Failed pattern match at Genetics.Browser.Canvas line 449, column 3 - line 451, column 45: " + [ lc.constructor.name ]);
              })());
          };
      };
  };
  var setBrowserContainerSize = function (dictMonadEffect) {
      return function (dim) {
          return function (v) {
              return Effect_Class.liftEffect(dictMonadEffect)(function __do() {
                  Effect_Ref.modify_(function (v1) {
                      return {
                          size: dim,
                          padding: v1.padding
                      };
                  })(v.dimensions)();
                  $foreign.setContainerStyle(v.element)(dim)();
                  return Control_Bind.bindFlipped(Effect.bindEffect)(Data_Foldable.traverse_(Effect.applicativeEffect)(Data_Map_Internal.foldableMap)(resizeLayer(Effect_Class.monadEffectEffect)(dim)))(getLayers(Effect_Class.monadEffectEffect)(v))();
              });
          };
      };
  };                            
  var appendBoxed = function (sofar) {
      return function (next) {
          var overlapsAny = (function () {
              var overlaps = function (r$prime) {
                  return !Data_Eq.eq(Data_Eq.eqRec()(Data_Eq.eqRowCons(Data_Eq.eqRowCons(Data_Eq.eqRowCons(Data_Eq.eqRowCons(Data_Eq.eqRowNil)()(new Data_Symbol.IsSymbol(function () {
                      return "y";
                  }))(Data_Eq.eqNumber))()(new Data_Symbol.IsSymbol(function () {
                      return "x";
                  }))(Data_Eq.eqNumber))()(new Data_Symbol.IsSymbol(function () {
                      return "width";
                  }))(Data_Eq.eqNumber))()(new Data_Symbol.IsSymbol(function () {
                      return "height";
                  }))(Data_Eq.eqNumber)))(next.rect)(r$prime.rect) && isOverlapping(next.rect)(r$prime.rect);
              };
              return Data_Foldable.any(Data_Foldable.foldableArray)(Data_HeytingAlgebra.heytingAlgebraBoolean)(overlaps)(sofar);
          })();
          if (overlapsAny) {
              return sofar;
          };
          return Data_Semigroup.append(Data_Semigroup.semigroupArray)(sofar)([ next ]);
      };
  };
  var renderLabels = function (ls) {
      return function (ctx) {
          return function __do() {
              var v = Data_Traversable.traverse(Data_Traversable.traversableArray)(Effect.applicativeEffect)(function (l) {
                  return Data_Functor.map(Effect.functorEffect)(function (v) {
                      return {
                          text: l.text,
                          rect: v
                      };
                  })(labelBox(ctx)(l));
              })(ls)();
              var toRender = Data_Foldable.foldl(Data_Foldable.foldableArray)(appendBoxed)([  ])(v);
              return Graphics_Canvas.withContext(ctx)(function __do() {
                  var v1 = Graphics_Canvas.setFont(ctx)(labelFont)();
                  return Data_Foldable.for_(Effect.applicativeEffect)(Data_Foldable.foldableArray)(toRender)(function (box) {
                      return Graphics_Canvas.fillText(ctx)(box.text)(box.rect.x - box.rect.width / 2.0)(box.rect.y);
                  })();
              })();
          };
      };
  };
  var _static = Data_Symbol.SProxy.value;
  var _labels = Data_Symbol.SProxy.value;
  var _drawings = Data_Symbol.SProxy.value;
  var _FrontCanvas = Data_Lens_Getter.to(function (v) {
      if (v instanceof Static) {
          return v.value0;
      };
      if (v instanceof Buffer) {
          return (Data_Newtype.unwrap(newtypeBufferedCanvas)(v.value0)).front;
      };
      throw new Error("Failed pattern match at Genetics.Browser.Canvas line 603, column 19 - line 605, column 31: " + [ v.constructor.name ]);
  });
  var createAndAddLayer = function (dictMonadEffect) {
      return function (bc) {
          return function (name) {
              return function (v) {
                  return Control_Bind.bind((dictMonadEffect.Monad0()).Bind1())(getDimensions(dictMonadEffect)(bc))(function (v1) {
                      var slots = Genetics_Browser_Layer.browserSlots(v1);
                      var $173 = {
                          size: slots.full.size,
                          pos: {
                              left: 0.0,
                              top: 0.0
                          }
                      };
                      return Control_Bind.bind((dictMonadEffect.Monad0()).Bind1())(Effect_Class.liftEffect(dictMonadEffect)(function __do() {
                          var v2 = (function () {
                              if (v.value0 instanceof Genetics_Browser_Layer.Fixed) {
                                  return Data_Functor.map(Effect.functorEffect)(Static.create)($foreign.createCanvas($173.size)(name))();
                              };
                              if (v.value0 instanceof Genetics_Browser_Layer.Scrolling) {
                                  return Data_Functor.map(Effect.functorEffect)(Buffer.create)(createBufferedCanvas($173.size)(name))();
                              };
                              throw new Error("Failed pattern match at Genetics.Browser.Canvas line 663, column 11 - line 665, column 61: " + [ v.value0.constructor.name ]);
                          })();
                          setCanvasPosition($173.pos)(Data_Lens_Getter.viewOn(v2)(_FrontCanvas))();
                          return v2;
                      }))(function (v2) {
                          return Control_Bind.bind((dictMonadEffect.Monad0()).Bind1())(Effect_Class.liftEffect(dictMonadEffect)(Effect_Ref["new"]({
                              offset: 0.0,
                              hotspots: function (r) {
                                  return function (p) {
                                      return [  ];
                                  };
                              }
                          })))(function (v3) {
                              var lastHotspots = Effect_Class.liftEffect(dictMonadEffect)(function __do() {
                                  var v4 = Effect_Ref.read(v3)();
                                  return function (r) {
                                      return function (v5) {
                                          return v4.hotspots(r)({
                                              x: v5.x + v4.offset,
                                              y: v5.y
                                          });
                                      };
                                  };
                              });
                              var layerRef = (function (v4) {
                                  return v4.layers;
                              })(Data_Newtype.unwrap(newtypeBrowserContainer)(bc));
                              return Control_Bind.discard(Control_Bind.discardUnit)((dictMonadEffect.Monad0()).Bind1())(Effect_Class.liftEffect(dictMonadEffect)(function __do() {
                                  Effect_Ref.modify_(Data_Map_Internal.insert(Data_Ord.ordString)(name)(v2))(layerRef)();
                                  return $foreign.appendCanvasElem((Data_Newtype.unwrap(newtypeBrowserContainer)(bc)).element)(Data_Lens_Getter.viewOn(v2)(_FrontCanvas))();
                              }))(function () {
                                  var render = function (c) {
                                      return Control_Bind.bind((dictMonadEffect.Monad0()).Bind1())(getDimensions(dictMonadEffect)(bc))(function (v4) {
                                          var slots$prime = Genetics_Browser_Layer.browserSlots(v4);
                                          var toRender = Data_Lens_Getter.viewOn(v.value2)(Genetics_Browser_Layer._Component)(c)((function () {
                                              if (v.value2 instanceof Genetics_Browser_Layer.Full) {
                                                  return slots$prime.full.size;
                                              };
                                              if (v.value2 instanceof Genetics_Browser_Layer.Padded) {
                                                  return slots$prime.padded.size;
                                              };
                                              if (v.value2 instanceof Genetics_Browser_Layer.CTop) {
                                                  return slots$prime.top.size;
                                              };
                                              if (v.value2 instanceof Genetics_Browser_Layer.CLeft) {
                                                  return slots$prime.left.size;
                                              };
                                              if (v.value2 instanceof Genetics_Browser_Layer.CRight) {
                                                  return slots$prime.right.size;
                                              };
                                              if (v.value2 instanceof Genetics_Browser_Layer.CBottom) {
                                                  return slots$prime.bottom.size;
                                              };
                                              throw new Error("Failed pattern match at Genetics.Browser.Canvas line 688, column 48 - line 694, column 47: " + [ v.value2.constructor.name ]);
                                          })());
                                          return Control_Bind.discard(Control_Bind.discardUnit)((dictMonadEffect.Monad0()).Bind1())(Effect_Class.liftEffect(dictMonadEffect)(Effect_Ref.modify_(function (v5) {
                                              return {
                                                  hotspots: toRender.hotspots,
                                                  offset: v5.offset
                                              };
                                          })(v3)))(function () {
                                              return Control_Applicative.pure((dictMonadEffect.Monad0()).Applicative0())(toRender.renderables);
                                          });
                                      });
                                  };
                                  var drawOnCanvas = function (v4) {
                                      return function (renderables) {
                                          return Control_Bind.bind((dictMonadEffect.Monad0()).Bind1())(getLayers(dictMonadEffect)(bc))(function (v5) {
                                              return Control_Bind.discard(Control_Bind.discardUnit)((dictMonadEffect.Monad0()).Bind1())(Effect_Class.liftEffect(dictMonadEffect)(Effect_Ref.modify_(function (v6) {
                                                  return {
                                                      offset: v4.value0,
                                                      hotspots: v6.hotspots
                                                  };
                                              })(v3)))(function () {
                                                  return Control_Bind.bind((dictMonadEffect.Monad0()).Bind1())((function () {
                                                      var v6 = Data_Map_Internal.lookup(Data_Ord.ordString)(name)(v5);
                                                      if (v6 instanceof Data_Maybe.Nothing) {
                                                          return Partial_Unsafe.unsafeCrashWith("Tried to render layer '" + (name + "', but it did not exist!"));
                                                      };
                                                      if (v6 instanceof Data_Maybe.Just) {
                                                          return Control_Applicative.pure((dictMonadEffect.Monad0()).Applicative0())(Data_Lens_Getter.viewOn(v6.value0)(_FrontCanvas));
                                                      };
                                                      throw new Error("Failed pattern match at Genetics.Browser.Canvas line 708, column 16 - line 710, column 53: " + [ v6.constructor.name ]);
                                                  })())(function (v6) {
                                                      return Control_Bind.bind((dictMonadEffect.Monad0()).Bind1())(getDimensions(dictMonadEffect)(bc))(function (v7) {
                                                          return Control_Bind.bind((dictMonadEffect.Monad0()).Bind1())(Genetics_Browser_Layer.slotContext(dictMonadEffect)(v)(v7)(v6))(function (v8) {
                                                              return Control_Bind.discard(Control_Bind.discardUnit)((dictMonadEffect.Monad0()).Bind1())(Effect_Class.liftEffect(dictMonadEffect)(Graphics_Canvas.withContext(v8)(function __do() {
                                                                  Genetics_Browser_Layer.setContextTranslation({
                                                                      x: 0,
                                                                      y: 0
                                                                  })(v8)();
                                                                  return Data_Functor["void"](Effect.functorEffect)(Graphics_Canvas.clearRect(v8)(Record.merge()()({
                                                                      x: 0.0,
                                                                      y: 0.0
                                                                  })(slots.full.size)))();
                                                              })))(function () {
                                                                  return Control_Bind.bind((dictMonadEffect.Monad0()).Bind1())(Effect_Class.liftEffect(dictMonadEffect)(Graphics_Canvas.translate(v8)({
                                                                      translateX: -v4.value0,
                                                                      translateY: 0.0
                                                                  })))(function (v9) {
                                                                      var $$static = function (d) {
                                                                          return Effect_Class.liftEffect(dictMonadEffect)(Graphics_Drawing.render(v8)(d));
                                                                      };
                                                                      var labels = function (ls) {
                                                                          return Effect_Class.liftEffect(dictMonadEffect)(renderLabels(ls)(v8));
                                                                      };
                                                                      var drawings = function (ds) {
                                                                          return Effect_Class.liftEffect(dictMonadEffect)(Data_Foldable.for_(Effect.applicativeEffect)(Data_Foldable.foldableArray)(ds)(renderGlyphs((function (v10) {
                                                                              return v10.glyphBuffer;
                                                                          })(Data_Newtype.unwrap(newtypeBrowserContainer)(bc)))(v8)(new Data_Pair.Pair(v4.value0, v4.value1))));
                                                                      };
                                                                      return Data_Foldable.for_((dictMonadEffect.Monad0()).Applicative0())(Data_List_Types.foldableList)(renderables)(Data_Variant.onMatch()(Data_Variant_Internal.variantMatchCons(Data_Variant_Internal.variantMatchCons(Data_Variant_Internal.variantMatchCons(Data_Variant_Internal.variantMatchNil)()(Type_Equality.refl))()(Type_Equality.refl))()(Type_Equality.refl))()({
                                                                          "static": $$static,
                                                                          drawings: drawings,
                                                                          labels: labels
                                                                      })(Data_Variant.case_));
                                                                  });
                                                              });
                                                          });
                                                      });
                                                  });
                                              });
                                          });
                                      };
                                  };
                                  return Control_Applicative.pure((dictMonadEffect.Monad0()).Applicative0())({
                                      render: render,
                                      drawOnCanvas: drawOnCanvas,
                                      lastHotspots: lastHotspots
                                  });
                              });
                          });
                      });
                  });
              };
          };
      };
  };
  var createAndAddLayer_ = function (dictMonadEffect) {
      return function (bc) {
          return function (name) {
              return function (v) {
                  var layer$prime = Data_Functor.map(Genetics_Browser_Layer.functorLayer)(Data_Functor.map(Data_Functor.functorFn)(Data_Functor.map(Data_Functor.functorFn)(function (renderables) {
                      return {
                          renderables: renderables,
                          hotspots: function (r) {
                              return function (p) {
                                  return [  ];
                              };
                          }
                      };
                  })))(v);
                  return Control_Bind.bind((dictMonadEffect.Monad0()).Bind1())(createAndAddLayer(dictMonadEffect)(bc)(name)(layer$prime))(function (v1) {
                      return Control_Applicative.pure((dictMonadEffect.Monad0()).Applicative0())({
                          render: v1.render,
                          drawOnCanvas: v1.drawOnCanvas
                      });
                  });
              };
          };
      };
  };
  var _Container = function (dictStrong) {
      return function ($246) {
          return Data_Lens_Iso_Newtype._Newtype(newtypeBrowserContainer)(newtypeBrowserContainer)(dictStrong.Profunctor0())(Data_Lens_Record.prop(new Data_Symbol.IsSymbol(function () {
              return "element";
          }))()()(Data_Symbol.SProxy.value)(dictStrong)($246));
      };
  };
  var browserClickHandler = function (dictMonadEffect) {
      return function (bc) {
          return function (com) {
              return Effect_Class.liftEffect(dictMonadEffect)(function __do() {
                  var v = getDimensions(Effect_Class.monadEffectEffect)(bc)();
                  var translate = Genetics_Browser_Layer.slotRelative(v)(Genetics_Browser_Layer.asSlot(com));
                  var cb = Data_Lens_Getter.viewOn(com)(Genetics_Browser_Layer._Component);
                  return elementClick(Data_Lens_Getter.viewOn(bc)(_Container(Data_Lens_Internal_Forget.strongForget)))(function ($247) {
                      return cb(translate($247));
                  })();
              });
          };
      };
  };
  var _Buffer = function (dictChoice) {
      var from = function (v) {
          if (v instanceof Static) {
              return Data_Maybe.Nothing.value;
          };
          if (v instanceof Buffer) {
              return new Data_Maybe.Just(v.value0);
          };
          throw new Error("Failed pattern match at Genetics.Browser.Canvas line 609, column 9 - line 609, column 34: " + [ v.constructor.name ]);
      };
      return Data_Lens_Prism["prism'"](Buffer.create)(from)(dictChoice);
  };
  var scrollBrowser = function (v) {
      return function (pt) {
          return function __do() {
              var v1 = Effect_Ref.read(v.layers)();
              var scrolling = Data_Filterable.filterMap(Data_Filterable.filterableMap(Data_Ord.ordString))(Data_Lens_Fold.preview(_Buffer(Data_Lens_Internal_Forget.choiceForget(Data_Maybe_First.monoidFirst))))(v1);
              return Data_Foldable.for_(Effect.applicativeEffect)(Data_Map_Internal.foldableMap)(scrolling)(function (bc$prime) {
                  return scrollCanvas(bc$prime)(pt);
              })();
          };
      };
  };
  var dragScroll = function (v) {
      return function (cb) {
          return canvasDrag(v.element)(function (v1) {
              if (v1 instanceof Data_Either.Left) {
                  return cb(v1.value0);
              };
              if (v1 instanceof Data_Either.Right) {
                  var p$prime = {
                      x: -v1.value0.x,
                      y: 0.0
                  };
                  return scrollBrowser(v)(p$prime);
              };
              throw new Error("Failed pattern match at Genetics.Browser.Canvas line 222, column 37 - line 226, column 27: " + [ v1.constructor.name ]);
          });
      };
  };
  exports["LLeft"] = LLeft;
  exports["LCenter"] = LCenter;
  exports["LRight"] = LRight;
  exports["_static"] = _static;
  exports["_drawings"] = _drawings;
  exports["_labels"] = _labels;
  exports["createAndAddLayer"] = createAndAddLayer;
  exports["createAndAddLayer_"] = createAndAddLayer_;
  exports["getDimensions"] = getDimensions;
  exports["_Container"] = _Container;
  exports["dragScroll"] = dragScroll;
  exports["wheelZoom"] = wheelZoom;
  exports["browserClickHandler"] = browserClickHandler;
  exports["browserContainer"] = browserContainer;
  exports["setBrowserContainerSize"] = setBrowserContainerSize;
  exports["setElementStyle"] = setElementStyle;
})(PS["Genetics.Browser.Canvas"] = PS["Genetics.Browser.Canvas"] || {});
(function(exports) {
  // Generated by purs version 0.12.0
  "use strict";
  var Control_Category = PS["Control.Category"];
  var Data_CommutativeRing = PS["Data.CommutativeRing"];
  var Data_DivisionRing = PS["Data.DivisionRing"];
  var Data_Eq = PS["Data.Eq"];
  var Data_EuclideanRing = PS["Data.EuclideanRing"];
  var Data_Field = PS["Data.Field"];
  var Data_Function = PS["Data.Function"];
  var Data_Lens = PS["Data.Lens"];
  var Data_Lens_Getter = PS["Data.Lens.Getter"];
  var Data_Lens_Iso = PS["Data.Lens.Iso"];
  var Data_Lens_Iso_Newtype = PS["Data.Lens.Iso.Newtype"];
  var Data_Lens_Types = PS["Data.Lens.Types"];
  var Data_Maybe = PS["Data.Maybe"];
  var Data_Newtype = PS["Data.Newtype"];
  var Data_Number_Format = PS["Data.Number.Format"];
  var Data_Ord = PS["Data.Ord"];
  var Data_Ring = PS["Data.Ring"];
  var Data_Semigroup = PS["Data.Semigroup"];
  var Data_Semiring = PS["Data.Semiring"];
  var Data_Show = PS["Data.Show"];
  var Data_String = PS["Data.String"];
  var Data_String_CodeUnits = PS["Data.String.CodeUnits"];
  var Data_String_Common = PS["Data.String.Common"];
  var Data_String_Pattern = PS["Data.String.Pattern"];
  var Foreign_Class = PS["Foreign.Class"];
  var $$Math = PS["Math"];
  var Prelude = PS["Prelude"];                 
  var NegLog10 = function (x) {
      return x;
  };
  var ChrId = function (x) {
      return x;
  };
  var Bp = function (x) {
      return x;
  }; 
  var showChrId = new Data_Show.Show(function (v) {
      return v;
  });
  var showBp = new Data_Show.Show(function (v) {
      return Data_Number_Format.toStringWith(Data_Number_Format.fixed(0))(v) + " Bp";
  });                                            
  var semiringBp = Data_Semiring.semiringNumber;
  var ringBp = Data_Ring.ringNumber;
  var ordBp = Data_Ord.ordNumber;
  var newtypeNegLog10 = new Data_Newtype.Newtype(function (n) {
      return n;
  }, NegLog10);
  var newtypeChrId = new Data_Newtype.Newtype(function (n) {
      return n;
  }, ChrId);
  var validChrId = function (chr) {
      var chr$prime = Data_String_Common.toLower(Data_Newtype.unwrap(newtypeChrId)(chr));
      var v = Data_String_CodeUnits.stripPrefix(Data_Newtype.wrap(Data_String_Pattern.newtypePattern)("chr"))(chr$prime);
      if (v instanceof Data_Maybe.Nothing) {
          return Data_Newtype.wrap(newtypeChrId)("chr" + chr$prime);
      };
      if (v instanceof Data_Maybe.Just) {
          return Data_Newtype.wrap(newtypeChrId)(v.value0);
      };
      throw new Error("Failed pattern match at Genetics.Browser.Types line 98, column 6 - line 100, column 27: " + [ v.constructor.name ]);
  };             
  var newtypeBp = new Data_Newtype.Newtype(function (n) {
      return n;
  }, Bp);                                                       
  var euclideanRingBp = Data_EuclideanRing.euclideanRingNumber;
  var eqChrId = new Data_Eq.Eq(function (chrA) {
      return function (chrB) {
          var v = validChrId(chrA);
          var v1 = validChrId(chrB);
          return v === v1;
      };
  });
  var ordChrId = new Data_Ord.Ord(function () {
      return eqChrId;
  }, function (chrA) {
      return function (chrB) {
          var v = validChrId(chrA);
          var v1 = validChrId(chrB);
          return Data_Ord.compare(Data_Ord.ordString)(v)(v1);
      };
  });
  var _prec = function (i) {
      return Data_Lens_Getter.to(Data_Number_Format.toStringWith(Data_Number_Format.precision(i)));
  };
  var _exp = function (i) {
      return Data_Lens_Getter.to(Data_Number_Format.toStringWith(Data_Number_Format.exponential(i)));
  };
  var _NegLog10 = function (dictProfunctor) {
      var to = function (p) {
          return Data_Newtype.wrap(newtypeNegLog10)(-($$Math.log(p) / $$Math.ln10));
      };
      var from = function (v) {
          return $$Math.pow(10.0)(-v);
      };
      return Data_Lens_Iso.iso(to)(from)(dictProfunctor);
  };
  exports["Bp"] = Bp;
  exports["ChrId"] = ChrId;
  exports["validChrId"] = validChrId;
  exports["NegLog10"] = NegLog10;
  exports["_NegLog10"] = _NegLog10;
  exports["_prec"] = _prec;
  exports["_exp"] = _exp;
  exports["newtypeBp"] = newtypeBp;
  exports["ordBp"] = ordBp;
  exports["euclideanRingBp"] = euclideanRingBp;
  exports["semiringBp"] = semiringBp;
  exports["ringBp"] = ringBp;
  exports["showBp"] = showBp;
  exports["newtypeChrId"] = newtypeChrId;
  exports["eqChrId"] = eqChrId;
  exports["ordChrId"] = ordChrId;
  exports["showChrId"] = showChrId;
  exports["newtypeNegLog10"] = newtypeNegLog10;
})(PS["Genetics.Browser.Types"] = PS["Genetics.Browser.Types"] || {});
(function(exports) {
  // Generated by purs version 0.12.0
  "use strict";
  var Control_Category = PS["Control.Category"];
  var Control_Semigroupoid = PS["Control.Semigroupoid"];
  var Data_Array = PS["Data.Array"];
  var Data_BigInt = PS["Data.BigInt"];
  var Data_Eq = PS["Data.Eq"];
  var Data_EuclideanRing = PS["Data.EuclideanRing"];
  var Data_Foldable = PS["Data.Foldable"];
  var Data_Function = PS["Data.Function"];
  var Data_Functor = PS["Data.Functor"];
  var Data_Generic_Rep = PS["Data.Generic.Rep"];
  var Data_HeytingAlgebra = PS["Data.HeytingAlgebra"];
  var Data_Lens = PS["Data.Lens"];
  var Data_Lens_Fold = PS["Data.Lens.Fold"];
  var Data_Lens_Getter = PS["Data.Lens.Getter"];
  var Data_Lens_Internal_Forget = PS["Data.Lens.Internal.Forget"];
  var Data_Lens_Iso_Newtype = PS["Data.Lens.Iso.Newtype"];
  var Data_Lens_Lens_Tuple = PS["Data.Lens.Lens.Tuple"];
  var Data_Map = PS["Data.Map"];
  var Data_Map_Internal = PS["Data.Map.Internal"];
  var Data_Maybe = PS["Data.Maybe"];
  var Data_Monoid_Additive = PS["Data.Monoid.Additive"];
  var Data_Monoid_Endo = PS["Data.Monoid.Endo"];
  var Data_Newtype = PS["Data.Newtype"];
  var Data_Ord = PS["Data.Ord"];
  var Data_Pair = PS["Data.Pair"];
  var Data_Ring = PS["Data.Ring"];
  var Data_Semiring = PS["Data.Semiring"];
  var Data_Traversable = PS["Data.Traversable"];
  var Data_Tuple = PS["Data.Tuple"];
  var Data_Unfoldable = PS["Data.Unfoldable"];
  var Genetics_Browser_Types = PS["Genetics.Browser.Types"];
  var Global_Unsafe = PS["Global.Unsafe"];
  var Partial_Unsafe = PS["Partial.Unsafe"];
  var Prelude = PS["Prelude"];
  var Normalized = function (x) {
      return x;
  };
  var CoordSysView = function (x) {
      return x;
  };
  var CoordSys = function (x) {
      return x;
  };
  var xPerPixel = function (v) {
      return Data_BigInt.toNumber(v.coordWidth) / v.pixelWidth;
  };                                                
  var scaleToScreen = function (v) {
      return function (x) {
          return Data_BigInt.toNumber(x) * (v.pixelWidth / Data_BigInt.toNumber(v.coordWidth));
      };
  };
  var pairsOverlap = function (dictOrd) {
      return function (v) {
          return function (v1) {
              var v2 = new Data_Pair.Pair(Data_Ord.min(dictOrd)(v.value0)(v1.value0), Data_Ord.min(dictOrd)(v.value1)(v1.value1));
              var v3 = new Data_Pair.Pair(Data_Ord.max(dictOrd)(v.value0)(v1.value0), Data_Ord.max(dictOrd)(v.value1)(v1.value1));
              return Data_Ord.greaterThanOrEq(dictOrd)(v2.value1)(v3.value0);
          };
      };
  };
  var pairSize = function (dictRing) {
      return function (v) {
          return Data_Ring.sub(dictRing)(v.value1)(v.value0);
      };
  };
  var scalePairBy = function (p) {
      return function (x) {
          var x$prime = Data_Ord.max(Data_Ord.ordNumber)(0)(x);
          var v = Data_Functor.map(Data_Pair.functorPair)(Data_BigInt.toNumber)(p);
          var delta = (pairSize(Data_Ring.ringNumber)(v) * x$prime - pairSize(Data_Ring.ringNumber)(v)) / 2.0;
          var result = Data_Functor.map(Data_Pair.functorPair)(Data_BigInt.fromNumber)(new Data_Pair.Pair(v.value0 - delta, v.value1 + delta));
          return Data_Functor.map(Data_Pair.functorPair)(Data_Maybe.fromJust())(result);
      };
  };
  var setViewWidth = function (newW) {
      return function (v) {
          var oldW = pairSize(Data_BigInt.ringBigInt)(v);
          var d = Data_EuclideanRing.div(Data_BigInt.euclideanRingBigInt)(Data_Ring.sub(Data_BigInt.ringBigInt)(newW)(oldW))(Data_BigInt.fromInt(2));
          return new Data_Pair.Pair(Data_Ring.sub(Data_BigInt.ringBigInt)(v.value0)(d), Data_Semiring.add(Data_BigInt.semiringBigInt)(v.value1)(d));
      };
  };
  var translatePairBy = function (p) {
      return function (x) {
          var delta = Data_Functor.map(Data_Functor.functorFn)(Data_Maybe.fromJust())(Data_BigInt.fromNumber)(x * Data_BigInt.toNumber(pairSize(Data_BigInt.ringBigInt)(p)));
          return Data_Functor.map(Data_Pair.functorPair)(function (v) {
              return Data_Semiring.add(Data_BigInt.semiringBigInt)(v)(delta);
          })(p);
      };
  };
  var viewScale = function (v) {
      return function (v1) {
          var coordWidth = pairSize(Data_BigInt.ringBigInt)(v1);
          return {
              pixelWidth: v.width,
              coordWidth: coordWidth
          };
      };
  };
  var normalize = function (dictEuclideanRing) {
      return function (x0) {
          return function (x1) {
              return function (t) {
                  return Data_EuclideanRing.div(dictEuclideanRing)(Data_Ring.sub((dictEuclideanRing.CommutativeRing0()).Ring0())(t)(x0))(Data_Ring.sub((dictEuclideanRing.CommutativeRing0()).Ring0())(x1)(x0));
              };
          };
      };
  };
  var newtypeNormalized = new Data_Newtype.Newtype(function (n) {
      return n;
  }, Normalized);
  var newtypeCoordSys = new Data_Newtype.Newtype(function (n) {
      return n;
  }, CoordSys);
  var coordsysviewNewtype = new Data_Newtype.Newtype(function (n) {
      return n;
  }, CoordSysView);
  var coordSys = function (dictOrd) {
      return function (dictSemiring) {
          return function (segs) {
              var v = Data_Array.unzip(segs);
              var offsets = function (xs) {
                  var os = Data_Traversable.scanl(Data_Traversable.traversableArray)(function (x) {
                      return function (y) {
                          return Data_Semiring.add(dictSemiring)(x)(y);
                      };
                  })(Data_Semiring.zero(dictSemiring))(xs);
                  return Data_Array.zipWith(Data_Pair.Pair.create)(Data_Array.cons(Data_Semiring.zero(dictSemiring))(os))(os);
              };
              return CoordSys(Data_Map_Internal.fromFoldable(dictOrd)(Data_Foldable.foldableArray)(Data_Array.zip(v.value0)(offsets(v.value1))));
          };
      };
  };
  var aroundPair = function (dictRing) {
      return function (radius) {
          return function (v) {
              return new Data_Pair.Pair(Data_Ring.sub(dictRing)(v.value0)(radius), Data_Semiring.add(dictRing.Semiring0())(v.value1)(radius));
          };
      };
  };
  var _Segments = function (dictStrong) {
      return Data_Lens_Iso_Newtype._Newtype(newtypeCoordSys)(newtypeCoordSys)(dictStrong.Profunctor0());
  };
  var _TotalSize = function (dictRing) {
      return function ($118) {
          return _Segments(Data_Lens_Internal_Forget.strongForget)(Data_Lens_Getter.to(Data_Newtype.alaF(Data_Functor.functorFn)(Data_Functor.functorFn)(Data_Newtype.newtypeAdditive)(Data_Newtype.newtypeAdditive)(Data_Monoid_Additive.Additive)(Data_Foldable.foldMap(Data_Map_Internal.foldableMap)(Data_Monoid_Additive.monoidAdditive(dictRing.Semiring0())))(pairSize(dictRing)))($118));
      };
  };
  var normalizeView = function (cs) {
      return function (minWidth) {
          return function (csv) {
              var limR = Data_Lens_Getter.viewOn(cs)(_TotalSize(Data_BigInt.ringBigInt));
              var v = Data_Newtype.unwrap(coordsysviewNewtype)(csv);
              var width = Data_Ring.sub(Data_BigInt.ringBigInt)(v.value1)(v.value0);
              var v1 = (function () {
                  var v2 = Data_Ord.greaterThan(Data_BigInt.ordBigInt)(v.value1)(limR);
                  var v3 = Data_Ord.lessThan(Data_BigInt.ordBigInt)(v.value0)(Data_Semiring.zero(Data_BigInt.semiringBigInt));
                  if (v3 && !v2) {
                      return new Data_Pair.Pair(Data_Semiring.zero(Data_BigInt.semiringBigInt), width);
                  };
                  if (!v3 && v2) {
                      return new Data_Pair.Pair(Data_Ring.sub(Data_BigInt.ringBigInt)(limR)(width), limR);
                  };
                  if (v3 && v2) {
                      return new Data_Pair.Pair(Data_Semiring.zero(Data_BigInt.semiringBigInt), limR);
                  };
                  if (!v3 && !v2) {
                      return new Data_Pair.Pair(v.value0, v.value1);
                  };
                  throw new Error("Failed pattern match at Genetics.Browser.Coordinates line 224, column 22 - line 228, column 39: " + [ v3.constructor.name, v2.constructor.name ]);
              })();
              var vr$prime = setViewWidth(Data_Ord.min(Data_BigInt.ordBigInt)(limR)(Data_Ord.max(Data_BigInt.ordBigInt)(width)(minWidth)))(new Data_Pair.Pair(v1.value0, v1.value1));
              return vr$prime;
          };
      };
  };
  var scaledSegments = function (cs) {
      return function (scale) {
          return Data_Functor.map(Data_Map_Internal.functorMap)(Data_Functor.map(Data_Pair.functorPair)(scaleToScreen(scale)))(Data_Lens_Getter.viewOn(cs)(_Segments(Data_Lens_Internal_Forget.strongForget)));
      };
  };
  exports["pairSize"] = pairSize;
  exports["pairsOverlap"] = pairsOverlap;
  exports["aroundPair"] = aroundPair;
  exports["Normalized"] = Normalized;
  exports["CoordSys"] = CoordSys;
  exports["_Segments"] = _Segments;
  exports["_TotalSize"] = _TotalSize;
  exports["coordSys"] = coordSys;
  exports["CoordSysView"] = CoordSysView;
  exports["setViewWidth"] = setViewWidth;
  exports["normalizeView"] = normalizeView;
  exports["viewScale"] = viewScale;
  exports["xPerPixel"] = xPerPixel;
  exports["scaleToScreen"] = scaleToScreen;
  exports["scaledSegments"] = scaledSegments;
  exports["translatePairBy"] = translatePairBy;
  exports["scalePairBy"] = scalePairBy;
  exports["normalize"] = normalize;
  exports["newtypeNormalized"] = newtypeNormalized;
  exports["newtypeCoordSys"] = newtypeCoordSys;
  exports["coordsysviewNewtype"] = coordsysviewNewtype;
})(PS["Genetics.Browser.Coordinates"] = PS["Genetics.Browser.Coordinates"] || {});
(function(exports) {
    "use strict";

  exports.copyRecord = function(rec) {
    var copy = {};
    for (var key in rec) {
      if ({}.hasOwnProperty.call(rec, key)) {
        copy[key] = rec[key];
      }
    }
    return copy;
  };

  exports.unsafeInsert = function(l) {
    return function(a) {
      return function(rec) {
        rec[l] = a;
        return rec;
      };
    };
  };

  exports.unsafeModify = function(l) {
    return function (f) {
      return function(rec) {
        rec[l] = f(rec[l]);
        return rec;
      };
    };
  };
})(PS["Record.Builder"] = PS["Record.Builder"] || {});
(function(exports) {
  // Generated by purs version 0.12.0
  "use strict";
  var $foreign = PS["Record.Builder"];
  var Control_Category = PS["Control.Category"];
  var Control_Semigroupoid = PS["Control.Semigroupoid"];
  var Data_Function_Uncurried = PS["Data.Function.Uncurried"];
  var Data_Symbol = PS["Data.Symbol"];
  var Prelude = PS["Prelude"];
  var Record_Unsafe_Union = PS["Record.Unsafe.Union"];
  var Type_Row = PS["Type.Row"];
  var Unsafe_Coerce = PS["Unsafe.Coerce"];
  var semigroupoidBuilder = Control_Semigroupoid.semigroupoidFn;
  var modify = function (dictCons) {
      return function (dictCons1) {
          return function (dictIsSymbol) {
              return function (l) {
                  return function (f) {
                      return function (r1) {
                          return $foreign.unsafeModify(Data_Symbol.reflectSymbol(dictIsSymbol)(l))(f)(r1);
                      };
                  };
              };
          };
      };
  };
  var merge = function (dictUnion) {
      return function (dictNub) {
          return function (r2) {
              return function (r1) {
                  return Record_Unsafe_Union.unsafeUnionFn(r1, r2);
              };
          };
      };
  };
  var insert = function (dictCons) {
      return function (dictLacks) {
          return function (dictIsSymbol) {
              return function (l) {
                  return function (a) {
                      return function (r1) {
                          return $foreign.unsafeInsert(Data_Symbol.reflectSymbol(dictIsSymbol)(l))(a)(r1);
                      };
                  };
              };
          };
      };
  };
  var categoryBuilder = Control_Category.categoryFn;
  var build = function (v) {
      return function (r1) {
          return v($foreign.copyRecord(r1));
      };
  };
  exports["build"] = build;
  exports["insert"] = insert;
  exports["modify"] = modify;
  exports["merge"] = merge;
  exports["semigroupoidBuilder"] = semigroupoidBuilder;
  exports["categoryBuilder"] = categoryBuilder;
})(PS["Record.Builder"] = PS["Record.Builder"] || {});
(function(exports) {
  // Generated by purs version 0.12.0
  "use strict";
  var $foreign = PS["Simple.JSON"];
  var Control_Alt = PS["Control.Alt"];
  var Control_Applicative = PS["Control.Applicative"];
  var Control_Bind = PS["Control.Bind"];
  var Control_Category = PS["Control.Category"];
  var Control_Monad_Except = PS["Control.Monad.Except"];
  var Control_Monad_Except_Trans = PS["Control.Monad.Except.Trans"];
  var Control_Semigroupoid = PS["Control.Semigroupoid"];
  var Data_Bifunctor = PS["Data.Bifunctor"];
  var Data_Boolean = PS["Data.Boolean"];
  var Data_Either = PS["Data.Either"];
  var Data_Eq = PS["Data.Eq"];
  var Data_Function = PS["Data.Function"];
  var Data_Functor = PS["Data.Functor"];
  var Data_HeytingAlgebra = PS["Data.HeytingAlgebra"];
  var Data_Identity = PS["Data.Identity"];
  var Data_List_Types = PS["Data.List.Types"];
  var Data_Maybe = PS["Data.Maybe"];
  var Data_Nullable = PS["Data.Nullable"];
  var Data_Semigroup = PS["Data.Semigroup"];
  var Data_Symbol = PS["Data.Symbol"];
  var Data_Traversable = PS["Data.Traversable"];
  var Data_Variant = PS["Data.Variant"];
  var Effect_Exception = PS["Effect.Exception"];
  var Effect_Uncurried = PS["Effect.Uncurried"];
  var Effect_Unsafe = PS["Effect.Unsafe"];
  var Foreign = PS["Foreign"];
  var Foreign_Index = PS["Foreign.Index"];
  var Foreign_Object = PS["Foreign.Object"];
  var Global_Unsafe = PS["Global.Unsafe"];
  var Partial_Unsafe = PS["Partial.Unsafe"];
  var Prelude = PS["Prelude"];
  var Record = PS["Record"];
  var Record_Builder = PS["Record.Builder"];
  var Type_Prelude = PS["Type.Prelude"];
  var Type_Row = PS["Type.Row"];                 
  var ReadForeign = function (readImpl) {
      this.readImpl = readImpl;
  };
  var ReadForeignFields = function (getFields) {
      this.getFields = getFields;
  };
  var readString = new ReadForeign(Foreign.readString);
  var readNumber = new ReadForeign(Foreign.readNumber);
  var readInt = new ReadForeign(Foreign.readInt);
  var readImpl = function (dict) {
      return dict.readImpl;
  };
  var readMaybe = function (dictReadForeign) {
      return new ReadForeign((function () {
          var readNullOrUndefined = function (v) {
              return function (value) {
                  if (Foreign.isNull(value) || Foreign.isUndefined(value)) {
                      return Control_Applicative.pure(Control_Monad_Except_Trans.applicativeExceptT(Data_Identity.monadIdentity))(Data_Maybe.Nothing.value);
                  };
                  return Data_Functor.map(Control_Monad_Except_Trans.functorExceptT(Data_Identity.functorIdentity))(Data_Maybe.Just.create)(v(value));
              };
          };
          return readNullOrUndefined(readImpl(dictReadForeign));
      })());
  };                                                                                                                                      
  var readFieldsNil = new ReadForeignFields(function (v) {
      return function (v1) {
          return Control_Applicative.pure(Control_Monad_Except_Trans.applicativeExceptT(Data_Identity.monadIdentity))(Control_Category.identity(Record_Builder.categoryBuilder));
      };
  });
  var read$prime = function (dictReadForeign) {
      return readImpl(dictReadForeign);
  };
  var read = function (dictReadForeign) {
      return function ($75) {
          return Control_Monad_Except.runExcept(readImpl(dictReadForeign)($75));
      };
  }; 
  var getFields = function (dict) {
      return dict.getFields;
  };
  var readFieldsCons = function (dictIsSymbol) {
      return function (dictReadForeign) {
          return function (dictReadForeignFields) {
              return function (dictLacks) {
                  return function (dictCons) {
                      return new ReadForeignFields(function (v) {
                          return function (obj) {
                              var name = Data_Symbol.reflectSymbol(dictIsSymbol)(Data_Symbol.SProxy.value);
                              var withExcept$prime = Control_Monad_Except.withExcept(Data_Functor.map(Data_List_Types.functorNonEmptyList)(Foreign.ErrorAtProperty.create(name)));
                              return Control_Bind.bind(Control_Monad_Except_Trans.bindExceptT(Data_Identity.monadIdentity))(withExcept$prime(Control_Bind.bindFlipped(Control_Monad_Except_Trans.bindExceptT(Data_Identity.monadIdentity))(readImpl(dictReadForeign))(Foreign_Index.readProp(name)(obj))))(function (v1) {
                                  return Control_Bind.bind(Control_Monad_Except_Trans.bindExceptT(Data_Identity.monadIdentity))(getFields(dictReadForeignFields)(Type_Row.RLProxy.value)(obj))(function (v2) {
                                      var first = Record_Builder.insert(dictCons)(dictLacks)(dictIsSymbol)(Data_Symbol.SProxy.value)(v1);
                                      return Control_Applicative.pure(Control_Monad_Except_Trans.applicativeExceptT(Data_Identity.monadIdentity))(Control_Semigroupoid.compose(Record_Builder.semigroupoidBuilder)(first)(v2));
                                  });
                              });
                          };
                      });
                  };
              };
          };
      };
  };
  var readRecord = function (dictRowToList) {
      return function (dictReadForeignFields) {
          return new ReadForeign(function (o) {
              return Control_Bind.bind(Control_Monad_Except_Trans.bindExceptT(Data_Identity.monadIdentity))(getFields(dictReadForeignFields)(Type_Row.RLProxy.value)(o))(function (v) {
                  return Control_Applicative.pure(Control_Monad_Except_Trans.applicativeExceptT(Data_Identity.monadIdentity))(Record_Builder.build(v)({}));
              });
          });
      };
  };
  exports["read"] = read;
  exports["read'"] = read$prime;
  exports["ReadForeign"] = ReadForeign;
  exports["readImpl"] = readImpl;
  exports["ReadForeignFields"] = ReadForeignFields;
  exports["getFields"] = getFields;
  exports["readNumber"] = readNumber;
  exports["readInt"] = readInt;
  exports["readString"] = readString;
  exports["readMaybe"] = readMaybe;
  exports["readRecord"] = readRecord;
  exports["readFieldsCons"] = readFieldsCons;
  exports["readFieldsNil"] = readFieldsNil;
})(PS["Simple.JSON"] = PS["Simple.JSON"] || {});
(function(exports) {
  // Generated by purs version 0.12.0
  "use strict";
  var Color = PS["Color"];
  var Color_Scheme_Clrs = PS["Color.Scheme.Clrs"];
  var Control_Applicative = PS["Control.Applicative"];
  var Control_Bind = PS["Control.Bind"];
  var Control_Monad_Except = PS["Control.Monad.Except"];
  var Control_Monad_Except_Trans = PS["Control.Monad.Except.Trans"];
  var Control_Monad_State = PS["Control.Monad.State"];
  var Control_Monad_State_Class = PS["Control.Monad.State.Class"];
  var Control_Monad_State_Trans = PS["Control.Monad.State.Trans"];
  var Control_Semigroupoid = PS["Control.Semigroupoid"];
  var Data_Array = PS["Data.Array"];
  var Data_BigInt = PS["Data.BigInt"];
  var Data_Either = PS["Data.Either"];
  var Data_EuclideanRing = PS["Data.EuclideanRing"];
  var Data_Foldable = PS["Data.Foldable"];
  var Data_FoldableWithIndex = PS["Data.FoldableWithIndex"];
  var Data_Function = PS["Data.Function"];
  var Data_Functor = PS["Data.Functor"];
  var Data_FunctorWithIndex = PS["Data.FunctorWithIndex"];
  var Data_HeytingAlgebra = PS["Data.HeytingAlgebra"];
  var Data_Identity = PS["Data.Identity"];
  var Data_Int = PS["Data.Int"];
  var Data_Lens = PS["Data.Lens"];
  var Data_Lens_Getter = PS["Data.Lens.Getter"];
  var Data_List = PS["Data.List"];
  var Data_List_Types = PS["Data.List.Types"];
  var Data_Map = PS["Data.Map"];
  var Data_Map_Internal = PS["Data.Map.Internal"];
  var Data_Maybe = PS["Data.Maybe"];
  var Data_Monoid = PS["Data.Monoid"];
  var Data_Newtype = PS["Data.Newtype"];
  var Data_Number_Format = PS["Data.Number.Format"];
  var Data_Ord = PS["Data.Ord"];
  var Data_Pair = PS["Data.Pair"];
  var Data_Ring = PS["Data.Ring"];
  var Data_Semigroup = PS["Data.Semigroup"];
  var Data_Semiring = PS["Data.Semiring"];
  var Data_Show = PS["Data.Show"];
  var Data_String = PS["Data.String"];
  var Data_String_CodePoints = PS["Data.String.CodePoints"];
  var Data_Symbol = PS["Data.Symbol"];
  var Data_Traversable = PS["Data.Traversable"];
  var Data_Tuple = PS["Data.Tuple"];
  var Data_Variant = PS["Data.Variant"];
  var Data_Variant_Internal = PS["Data.Variant.Internal"];
  var Foreign = PS["Foreign"];
  var Genetics_Browser_Canvas = PS["Genetics.Browser.Canvas"];
  var Genetics_Browser_Coordinates = PS["Genetics.Browser.Coordinates"];
  var Genetics_Browser_Layer = PS["Genetics.Browser.Layer"];
  var Genetics_Browser_Types = PS["Genetics.Browser.Types"];
  var Graphics_Canvas = PS["Graphics.Canvas"];
  var Graphics_Drawing = PS["Graphics.Drawing"];
  var Graphics_Drawing_Font = PS["Graphics.Drawing.Font"];
  var $$Math = PS["Math"];
  var Partial_Unsafe = PS["Partial.Unsafe"];
  var Prelude = PS["Prelude"];
  var Record = PS["Record"];
  var Simple_JSON = PS["Simple.JSON"];
  var Type_Equality = PS["Type.Equality"];
  var Type_Prelude = PS["Type.Prelude"];                 
  var HexColor = function (x) {
      return x;
  };
  var trackLegend = function (dictFoldable) {
      return function (dictFunctor) {
          return function (f) {
              return function (as) {
                  return Data_Array.nubBy(Data_Function.on(Data_Ord.compare(Data_Ord.ordString))(function (v) {
                      return v.text;
                  }))(Data_Array.fromFoldable(dictFoldable)(Data_Functor.map(dictFunctor)(f)(as)));
              };
          };
      };
  };
  var renderFixedUI = function (com) {
      var f = function (draw) {
          return function (v) {
              return function (d) {
                  return Control_Applicative.pure(Data_List_Types.applicativeList)(Data_Variant.inj()(new Data_Symbol.IsSymbol(function () {
                      return "static";
                  }))(Genetics_Browser_Canvas._static)(draw(d)));
              };
          };
      };
      return Genetics_Browser_Layer.Layer.create(Genetics_Browser_Layer.Fixed.value)(Genetics_Browser_Layer.NoMask.value)(Data_Functor.map(Genetics_Browser_Layer.functorComponent)(f)(com));
  };
  var pixelSegments = function (conf) {
      return function (cSys) {
          return function (trackDim) {
              return function (csView) {
                  return Data_Functor.map(Data_Map_Internal.functorMap)(Genetics_Browser_Coordinates.aroundPair(Data_Ring.ringNumber)(-conf.segmentPadding))(Genetics_Browser_Coordinates.scaledSegments(cSys)(Genetics_Browser_Coordinates.viewScale(trackDim)(csView)));
              };
          };
      };
  };
  var renderHotspots = function (dictIsSymbol) {
      return function (dictCons) {
          return function (conf) {
              return function (cSys) {
                  return function (name) {
                      return function (com) {
                          var segs = pixelSegments(conf)(cSys);
                          if (com instanceof Genetics_Browser_Layer.Full) {
                              return Genetics_Browser_Layer.Layer.create(Genetics_Browser_Layer.Scrolling.value)(Genetics_Browser_Layer.NoMask.value)(new Genetics_Browser_Layer.Full(function (c) {
                                  return function (d) {
                                      return com.value0(Record.get(dictIsSymbol)(dictCons)(name)(c))(segs(d)(c.view))(d);
                                  };
                              }));
                          };
                          if (com instanceof Genetics_Browser_Layer.Padded) {
                              return Genetics_Browser_Layer.Layer.create(Genetics_Browser_Layer.Scrolling.value)(Genetics_Browser_Layer.Masked.value)(new Genetics_Browser_Layer.Padded(com.value0, function (c) {
                                  return function (d) {
                                      return com.value1(Record.get(dictIsSymbol)(dictCons)(name)(c))(segs(d)(c.view))(d);
                                  };
                              }));
                          };
                          return Partial_Unsafe.unsafeCrashWith("renderTrack' does not support UI slots yet");
                      };
                  };
              };
          };
      };
  };
  var renderTrack = function (dictIsSymbol) {
      return function (dictCons) {
          return function (conf) {
              return function (cSys) {
                  return function (name) {
                      return function (com) {
                          var segs = pixelSegments(conf)(cSys);
                          if (com instanceof Genetics_Browser_Layer.Full) {
                              return Genetics_Browser_Layer.Layer.create(Genetics_Browser_Layer.Scrolling.value)(Genetics_Browser_Layer.NoMask.value)(new Genetics_Browser_Layer.Full(function (c) {
                                  return function (d) {
                                      return com.value0(Record.get(dictIsSymbol)(dictCons)(name)(c))(segs(d)(c.view))(d);
                                  };
                              }));
                          };
                          if (com instanceof Genetics_Browser_Layer.Padded) {
                              return Genetics_Browser_Layer.Layer.create(Genetics_Browser_Layer.Scrolling.value)(Genetics_Browser_Layer.Masked.value)(new Genetics_Browser_Layer.Padded(com.value0, function (c) {
                                  return function (d) {
                                      return com.value1(Record.get(dictIsSymbol)(dictCons)(name)(c))(segs(d)(c.view))(d);
                                  };
                              }));
                          };
                          return Partial_Unsafe.unsafeCrashWith("renderTrack' does not support UI slots yet");
                      };
                  };
              };
          };
      };
  };
  var parseColor = (function () {
      var readColor = function (c) {
          return Control_Monad_Except_Trans.except(Data_Identity.applicativeIdentity)(Data_Either.note(Control_Applicative.pure(Data_List_Types.applicativeNonEmptyList)(new Foreign.ForeignError("Could not parse color: expected hex string")))(Color.fromHexString(c)));
      };
      return Control_Bind.composeKleisliFlipped(Control_Monad_Except_Trans.bindExceptT(Data_Identity.monadIdentity))(readColor)(Foreign.readString);
  })();
  var newtypeHexColor = new Data_Newtype.Newtype(function (n) {
      return n;
  }, HexColor);
  var readforeignHexColor = new Simple_JSON.ReadForeign(Data_Functor.map(Data_Functor.functorFn)(Data_Functor.map(Control_Monad_Except_Trans.functorExceptT(Data_Identity.functorIdentity))(Data_Newtype.wrap(newtypeHexColor)))(parseColor));
  var thresholdRuler = function (v) {
      return function (slot) {
          var y = slot.height - Genetics_Browser_Coordinates.normalize(Data_EuclideanRing.euclideanRingNumber)(v.threshold.min)(v.threshold.max)(v.threshold.sig) * slot.height;
          var text = "P = " + Data_Lens_Getter.viewOn($$Math.pow(10.0)(-v.threshold.sig))(Genetics_Browser_Types._exp(1));
          var outline = Data_Semigroup.append(Graphics_Drawing.semigroupOutlineStyle)(Graphics_Drawing.outlineColor(Data_Newtype.unwrap(newtypeHexColor)(v.rulerColor)))(Graphics_Drawing.lineWidth(2.0));
          var rulerDrawing = Graphics_Drawing.outlined(outline)(Graphics_Drawing.path(Data_Foldable.foldableArray)([ {
              x: -5.0,
              y: y
          }, {
              x: slot.width + 5.0,
              y: y
          } ]));
          var font$prime = Graphics_Drawing_Font.font(Graphics_Drawing_Font.sansSerif)(16)(Data_Monoid.mempty(Graphics_Drawing_Font.monoidFontOptions));
          var label = Graphics_Drawing.text(font$prime)(slot.width + 10.0)(y - 6.0)(Graphics_Drawing.fillColor(Data_Newtype.unwrap(newtypeHexColor)(v.rulerColor)))(text);
          return Data_List.fromFoldable(Data_Foldable.foldableArray)([ Data_Variant.inj()(new Data_Symbol.IsSymbol(function () {
              return "static";
          }))(Genetics_Browser_Canvas._static)(rulerDrawing), Data_Variant.inj()(new Data_Symbol.IsSymbol(function () {
              return "static";
          }))(Genetics_Browser_Canvas._static)(label) ]);
      };
  };
  var groupToMap = function (dictMonoid) {
      return function (dictOrd) {
          return function (dictFoldable) {
              return function (dictApplicative) {
                  return function (f) {
                      var add = function (x) {
                          return function (xs) {
                              return Data_Semigroup.append(Data_Maybe.semigroupMaybe(dictMonoid.Semigroup0()))(Control_Applicative.pure(Data_Maybe.applicativeMaybe)(Control_Applicative.pure(dictApplicative)(x)))(xs);
                          };
                      };
                      return Data_Foldable.foldl(dictFoldable)(function (grp) {
                          return function (a) {
                              return Data_Map_Internal.alter(dictOrd)(add(a))(f(a))(grp);
                          };
                      })(Data_Monoid.mempty(Data_Map_Internal.monoidMap(dictOrd)));
                  };
              };
          };
      };
  };
  var featureNormX = function (v) {
      return Data_Newtype.wrap(Genetics_Browser_Coordinates.newtypeNormalized)(Data_Newtype.unwrap(Genetics_Browser_Types.newtypeBp)(Data_EuclideanRing.div(Genetics_Browser_Types.euclideanRingBp)(v.position.value0)(v.frameSize)));
  };
  var drawVScaleInSlot = function (vscale) {
      return function (size) {
          var spokes = Data_Functor.map(Data_Functor.functorArray)(function ($98) {
              return (function (v) {
                  return v / Data_Int.toNumber(vscale.numSteps);
              })(Data_Int.toNumber($98));
          })(Data_Array.range(0)(vscale.numSteps));
          var hPad = size.width * vscale.hPad;
          var label = function (yN) {
              return Graphics_Drawing.text(Graphics_Drawing_Font.font(Graphics_Drawing_Font.sansSerif)(vscale.fonts.scaleSize)(Data_Monoid.mempty(Graphics_Drawing_Font.monoidFontOptions)))(size.width * 0.6 - hPad)(yN * size.height + 5.0)(Graphics_Drawing.fillColor(Color.black))(Data_Number_Format.toStringWith(Data_Number_Format.fixed(0))((function (p) {
                  return Data_Ord.min(Data_Ord.ordNumber)(vscale.max)(p);
              })(vscale.min + (1.0 - yN) * (vscale.max - vscale.min))));
          };
          var labels = Data_Foldable.foldMap(Data_Foldable.foldableArray)(Graphics_Drawing.monoidDrawing)(label)(spokes);
          var unitLabel = Graphics_Drawing.translate(size.width * 0.4 - hPad)(size.height * 0.72)(Graphics_Drawing.rotate(-$$Math.pi / 2.0)(Graphics_Drawing.text(Graphics_Drawing_Font.font(Graphics_Drawing_Font.sansSerif)(vscale.fonts.labelSize)(Data_Monoid.mempty(Graphics_Drawing_Font.monoidFontOptions)))(0.0)(0.0)(Graphics_Drawing.fillColor(Color.black))("-log10 (P value)")));
          var x = 7.0 * hPad;
          var vBar = Graphics_Drawing.path(Data_Foldable.foldableArray)([ {
              x: x,
              y: 0.0
          }, {
              x: x,
              y: size.height
          } ]);
          var hBar = function (w) {
              return function (y) {
                  return Graphics_Drawing.path(Data_Foldable.foldableArray)([ {
                      x: x - w,
                      y: y
                  }, {
                      x: x,
                      y: y
                  } ]);
              };
          };
          var bars = Data_Semigroup.append(Graphics_Drawing.semigroupShape)(vBar)(Data_Foldable.foldMap(Data_Foldable.foldableArray)(Graphics_Drawing.monoidShape)(function (i) {
              return hBar(8.0)(i * size.height);
          })(spokes));
          var barOutline = Data_Semigroup.append(Graphics_Drawing.semigroupOutlineStyle)(Graphics_Drawing.outlineColor(Data_Newtype.unwrap(newtypeHexColor)(vscale.color)))(Graphics_Drawing.lineWidth(2.0));
          return Data_Semigroup.append(Graphics_Drawing.semigroupDrawing)(Graphics_Drawing.outlined(barOutline)(bars))(Data_Semigroup.append(Graphics_Drawing.semigroupDrawing)(labels)(unitLabel));
      };
  };
  var drawLegendInSlot = function (v) {
      return function (size) {
          var vPad = size.height * v.vPad;
          var hPad = size.width * v.hPad;
          var font$prime = Graphics_Drawing_Font.font(Graphics_Drawing_Font.sansSerif)(v.fontSize)(Data_Monoid.mempty(Graphics_Drawing_Font.monoidFontOptions));
          var drawEntry = function (y) {
              return function (v1) {
                  return Graphics_Drawing.translate(hPad)(y)(Data_Semigroup.append(Graphics_Drawing.semigroupDrawing)(v1.icon)(Graphics_Drawing.text(font$prime)(12.0)(0.0)(Graphics_Drawing.fillColor(Color.black))(v1.text)));
              };
          };
          var ds = Data_FunctorWithIndex.mapWithIndex(Data_FunctorWithIndex.functorWithIndexArray)(function (i) {
              return function (ic) {
                  return drawEntry(vPad * Data_Int.toNumber(i + 1 | 0))(ic);
              };
          })(v.entries);
          var d = (size.height - 2.0 * vPad) / Data_Foldable.length(Data_Foldable.foldableArray)(Data_Semiring.semiringNumber)(v.entries);
          return Data_Foldable.fold(Data_Foldable.foldableArray)(Graphics_Drawing.monoidDrawing)(ds);
      };
  };
  var chrLabels = function (conf) {
      return function (cSys) {
          var viewPixels = function (d) {
              return function (v) {
                  var v$prime = Data_Functor.map(Data_Pair.functorPair)(Data_BigInt.toNumber)(Data_Newtype.unwrap(Genetics_Browser_Coordinates.coordsysviewNewtype)(v));
                  var s = Genetics_Browser_Coordinates.viewScale(d)(v);
                  return Data_Functor.map(Data_Pair.functorPair)(function (v1) {
                      return v1 / Genetics_Browser_Coordinates.xPerPixel(s);
                  })(v$prime);
              };
          };
          var segMidPoint = function (v) {
              return function (v1) {
                  var r$prime = Data_Ord.min(Data_Ord.ordNumber)(v.value1)(v1.value1);
                  var l$prime = Data_Ord.max(Data_Ord.ordNumber)(v.value0)(v1.value0);
                  return l$prime + (r$prime - l$prime) / 2.0;
              };
          };
          var labelOffset = function (chrId) {
              return 0.3 * Data_Int.toNumber(conf.fontSize * Data_String_CodePoints.length(Data_Show.show(Genetics_Browser_Types.showChrId)(chrId)) | 0);
          };
          var labelSeg = function (d) {
              return function (v) {
                  return function (v1) {
                      return Graphics_Drawing.text(Graphics_Drawing_Font.font(Graphics_Drawing_Font.sansSerif)(conf.fontSize)(Data_Monoid.mempty(Graphics_Drawing_Font.monoidFontOptions)))(segMidPoint(viewPixels(d)(v))(v1.value1) - labelOffset(v1.value0))(0.7 * d.height)(Graphics_Drawing.fillColor(Color.black))(Data_Show.show(Genetics_Browser_Types.showChrId)(v1.value0));
                  };
              };
          };
          return Genetics_Browser_Layer.Layer.create(Genetics_Browser_Layer.Scrolling.value)(Genetics_Browser_Layer.Masked.value)(new Genetics_Browser_Layer.CBottom(function (v) {
              return function (dim) {
                  return Data_Functor.map(Data_List_Types.functorList)(function ($99) {
                      return Data_Variant.inj()(new Data_Symbol.IsSymbol(function () {
                          return "static";
                      }))(Genetics_Browser_Canvas._static)(labelSeg(dim)(v.view)($99));
                  })(Data_Map_Internal.toUnfoldable(Data_List_Types.unfoldableList)(pixelSegments(conf)(cSys)(dim)(v.view)));
              };
          }));
      };
  };
  var chrBackgroundLayer = function (conf) {
      return function (seg) {
          return function (size) {
              var segBG = function (v) {
                  return Control_Bind.bind(Control_Monad_State_Trans.bindStateT(Data_Identity.monadIdentity))(Control_Monad_State_Class.get(Control_Monad_State_Trans.monadStateStateT(Data_Identity.monadIdentity)))(function (v1) {
                      return Control_Bind.discard(Control_Bind.discardUnit)(Control_Monad_State_Trans.bindStateT(Data_Identity.monadIdentity))(Control_Monad_State_Class.modify_(Control_Monad_State_Trans.monadStateStateT(Data_Identity.monadIdentity))(Data_HeytingAlgebra.not(Data_HeytingAlgebra.heytingAlgebraBoolean)))(function () {
                          return Control_Applicative.pure(Control_Monad_State_Trans.applicativeStateT(Data_Identity.monadIdentity))(new Data_Tuple.Tuple(Data_Newtype.unwrap(newtypeHexColor)((function () {
                              if (v1) {
                                  return conf.bg1;
                              };
                              return conf.bg2;
                          })()), Graphics_Drawing.rectangle(v.value0 - conf.segmentPadding)(-5.0)((v.value1 - v.value0) + 2.0 * conf.segmentPadding)(size.height + 10.0)));
                      });
                  });
              };
              var col = function (c) {
                  if (c) {
                      return Color.black;
                  };
                  return Color_Scheme_Clrs.gray;
              };
              return Data_Functor.map(Data_List_Types.functorList)(function ($100) {
                  return Data_Variant.inj()(new Data_Symbol.IsSymbol(function () {
                      return "static";
                  }))(Genetics_Browser_Canvas._static)(Data_Tuple.uncurry(function (c) {
                      return function (s) {
                          return Graphics_Drawing.filled(Graphics_Drawing.fillColor(c))(s);
                      };
                  })($100));
              })(Control_Monad_State.evalState(Data_Traversable.traverse(Data_List_Types.traversableList)(Control_Monad_State_Trans.applicativeStateT(Data_Identity.monadIdentity))(segBG)(Data_Map_Internal.values(seg)))(false));
          };
      };
  };
  exports["featureNormX"] = featureNormX;
  exports["thresholdRuler"] = thresholdRuler;
  exports["chrLabels"] = chrLabels;
  exports["chrBackgroundLayer"] = chrBackgroundLayer;
  exports["HexColor"] = HexColor;
  exports["parseColor"] = parseColor;
  exports["drawVScaleInSlot"] = drawVScaleInSlot;
  exports["drawLegendInSlot"] = drawLegendInSlot;
  exports["groupToMap"] = groupToMap;
  exports["trackLegend"] = trackLegend;
  exports["pixelSegments"] = pixelSegments;
  exports["renderHotspots"] = renderHotspots;
  exports["renderTrack"] = renderTrack;
  exports["renderFixedUI"] = renderFixedUI;
  exports["newtypeHexColor"] = newtypeHexColor;
  exports["readforeignHexColor"] = readforeignHexColor;
})(PS["Genetics.Browser"] = PS["Genetics.Browser"] || {});
(function(exports) {
  /* global exports */
  /* global XMLHttpRequest */
  /* global module */
  /* global process */
  "use strict";

  exports._ajax = function () {
    var platformSpecific = { };
    if (typeof module !== "undefined" && module.require && !(typeof process !== "undefined" && process.versions["electron"])) {
      // We are on node.js
      platformSpecific.newXHR = function () {
        var XHR = module.require("xhr2");
        return new XHR();
      };

      platformSpecific.fixupUrl = function (url) {
        var urllib = module.require("url");
        var u = urllib.parse(url);
        u.protocol = u.protocol || "http:";
        u.hostname = u.hostname || "localhost";
        return urllib.format(u);
      };

      platformSpecific.getResponse = function (xhr) {
        return xhr.response;
      };
    } else {
      // We are in the browser
      platformSpecific.newXHR = function () {
        return new XMLHttpRequest();
      };

      platformSpecific.fixupUrl = function (url) {
        return url || "/";
      };

      platformSpecific.getResponse = function (xhr) {
        return xhr.response;
      };
    }

    return function (mkHeader, options) {
      return function (errback, callback) {
        var xhr = platformSpecific.newXHR();
        var fixedUrl = platformSpecific.fixupUrl(options.url);
        xhr.open(options.method || "GET", fixedUrl, true, options.username, options.password);
        if (options.headers) {
          try {
            for (var i = 0, header; (header = options.headers[i]) != null; i++) {
              xhr.setRequestHeader(header.field, header.value);
            }
          } catch (e) {
            errback(e);
          }
        }
        xhr.onerror = function () {
          errback(new Error("AJAX request failed: " + options.method + " " + options.url));
        };
        xhr.onload = function () {
          callback({
            status: xhr.status,
            statusText: xhr.statusText,
            headers: xhr.getAllResponseHeaders().split("\r\n")
              .filter(function (header) {
                return header.length > 0;
              })
              .map(function (header) {
                var i = header.indexOf(":");
                return mkHeader(header.substring(0, i))(header.substring(i + 2));
              }),
            response: platformSpecific.getResponse(xhr)
          });
        };
        xhr.responseType = options.responseType;
        xhr.withCredentials = options.withCredentials;
        xhr.send(options.content);

        return function (error, cancelErrback, cancelCallback) {
          try {
            xhr.abort();
          } catch (e) {
            return cancelErrback(e);
          }
          return cancelCallback();
        };
      };
    };
  }();
})(PS["Network.HTTP.Affjax"] = PS["Network.HTTP.Affjax"] || {});
(function(exports) {
  // Generated by purs version 0.12.0
  "use strict";
  var Data_Argonaut_Core = PS["Data.Argonaut.Core"];
  var Data_ArrayBuffer_Types = PS["Data.ArrayBuffer.Types"];
  var Data_FormURLEncoded = PS["Data.FormURLEncoded"];
  var Data_Maybe = PS["Data.Maybe"];
  var Data_MediaType = PS["Data.MediaType"];
  var Data_MediaType_Common = PS["Data.MediaType.Common"];
  var Web_DOM_Document = PS["Web.DOM.Document"];
  var Web_File_Blob = PS["Web.File.Blob"];
  var Web_XHR_FormData = PS["Web.XHR.FormData"];                 
  var ArrayView = (function () {
      function ArrayView(value0) {
          this.value0 = value0;
      };
      ArrayView.create = function (value0) {
          return new ArrayView(value0);
      };
      return ArrayView;
  })();
  var Blob = (function () {
      function Blob(value0) {
          this.value0 = value0;
      };
      Blob.create = function (value0) {
          return new Blob(value0);
      };
      return Blob;
  })();
  var Document = (function () {
      function Document(value0) {
          this.value0 = value0;
      };
      Document.create = function (value0) {
          return new Document(value0);
      };
      return Document;
  })();
  var $$String = (function () {
      function $$String(value0) {
          this.value0 = value0;
      };
      $$String.create = function (value0) {
          return new $$String(value0);
      };
      return $$String;
  })();
  var FormData = (function () {
      function FormData(value0) {
          this.value0 = value0;
      };
      FormData.create = function (value0) {
          return new FormData(value0);
      };
      return FormData;
  })();
  var FormURLEncoded = (function () {
      function FormURLEncoded(value0) {
          this.value0 = value0;
      };
      FormURLEncoded.create = function (value0) {
          return new FormURLEncoded(value0);
      };
      return FormURLEncoded;
  })();
  var Json = (function () {
      function Json(value0) {
          this.value0 = value0;
      };
      Json.create = function (value0) {
          return new Json(value0);
      };
      return Json;
  })();
  var toMediaType = function (v) {
      if (v instanceof FormURLEncoded) {
          return new Data_Maybe.Just(Data_MediaType_Common.applicationFormURLEncoded);
      };
      if (v instanceof Json) {
          return new Data_Maybe.Just(Data_MediaType_Common.applicationJSON);
      };
      return Data_Maybe.Nothing.value;
  };
  exports["ArrayView"] = ArrayView;
  exports["Blob"] = Blob;
  exports["Document"] = Document;
  exports["String"] = $$String;
  exports["FormData"] = FormData;
  exports["FormURLEncoded"] = FormURLEncoded;
  exports["Json"] = Json;
  exports["toMediaType"] = toMediaType;
})(PS["Network.HTTP.Affjax.Request"] = PS["Network.HTTP.Affjax.Request"] || {});
(function(exports) {
  // Generated by purs version 0.12.0
  "use strict";
  var Control_Category = PS["Control.Category"];
  var Data_Argonaut_Core = PS["Data.Argonaut.Core"];
  var Data_ArrayBuffer_Types = PS["Data.ArrayBuffer.Types"];
  var Data_Maybe = PS["Data.Maybe"];
  var Data_MediaType = PS["Data.MediaType"];
  var Data_MediaType_Common = PS["Data.MediaType.Common"];
  var Prelude = PS["Prelude"];
  var Web_DOM_Document = PS["Web.DOM.Document"];
  var Web_File_Blob = PS["Web.File.Blob"];                 
  var $$ArrayBuffer = (function () {
      function $$ArrayBuffer(value0) {
          this.value0 = value0;
      };
      $$ArrayBuffer.create = function (value0) {
          return new $$ArrayBuffer(value0);
      };
      return $$ArrayBuffer;
  })();
  var Blob = (function () {
      function Blob(value0) {
          this.value0 = value0;
      };
      Blob.create = function (value0) {
          return new Blob(value0);
      };
      return Blob;
  })();
  var Document = (function () {
      function Document(value0) {
          this.value0 = value0;
      };
      Document.create = function (value0) {
          return new Document(value0);
      };
      return Document;
  })();
  var Json = (function () {
      function Json(value0) {
          this.value0 = value0;
      };
      Json.create = function (value0) {
          return new Json(value0);
      };
      return Json;
  })();
  var $$String = (function () {
      function $$String(value0) {
          this.value0 = value0;
      };
      $$String.create = function (value0) {
          return new $$String(value0);
      };
      return $$String;
  })();
  var Ignore = (function () {
      function Ignore(value0) {
          this.value0 = value0;
      };
      Ignore.create = function (value0) {
          return new Ignore(value0);
      };
      return Ignore;
  })();
  var toResponseType = function (v) {
      if (v instanceof $$ArrayBuffer) {
          return "arraybuffer";
      };
      if (v instanceof Blob) {
          return "blob";
      };
      if (v instanceof Document) {
          return "document";
      };
      if (v instanceof Json) {
          return "text";
      };
      if (v instanceof $$String) {
          return "text";
      };
      if (v instanceof Ignore) {
          return "";
      };
      throw new Error("Failed pattern match at Network.HTTP.Affjax.Response line 41, column 3 - line 49, column 1: " + [ v.constructor.name ]);
  };
  var toMediaType = function (v) {
      if (v instanceof Json) {
          return new Data_Maybe.Just(Data_MediaType_Common.applicationJSON);
      };
      return Data_Maybe.Nothing.value;
  };                                                                                
  var json = new Json(Control_Category.identity(Control_Category.categoryFn));
  exports["ArrayBuffer"] = $$ArrayBuffer;
  exports["Blob"] = Blob;
  exports["Document"] = Document;
  exports["Json"] = Json;
  exports["String"] = $$String;
  exports["Ignore"] = Ignore;
  exports["json"] = json;
  exports["toResponseType"] = toResponseType;
  exports["toMediaType"] = toMediaType;
})(PS["Network.HTTP.Affjax.Response"] = PS["Network.HTTP.Affjax.Response"] || {});
(function(exports) {
  // Generated by purs version 0.12.0
  "use strict";
  var Data_Eq = PS["Data.Eq"];
  var Data_HeytingAlgebra = PS["Data.HeytingAlgebra"];
  var Data_MediaType = PS["Data.MediaType"];
  var Data_Newtype = PS["Data.Newtype"];
  var Data_Semigroup = PS["Data.Semigroup"];
  var Data_Show = PS["Data.Show"];
  var Prelude = PS["Prelude"];                 
  var Accept = (function () {
      function Accept(value0) {
          this.value0 = value0;
      };
      Accept.create = function (value0) {
          return new Accept(value0);
      };
      return Accept;
  })();
  var ContentType = (function () {
      function ContentType(value0) {
          this.value0 = value0;
      };
      ContentType.create = function (value0) {
          return new ContentType(value0);
      };
      return ContentType;
  })();
  var RequestHeader = (function () {
      function RequestHeader(value0, value1) {
          this.value0 = value0;
          this.value1 = value1;
      };
      RequestHeader.create = function (value0) {
          return function (value1) {
              return new RequestHeader(value0, value1);
          };
      };
      return RequestHeader;
  })();
  var requestHeaderValue = function (v) {
      if (v instanceof Accept) {
          return Data_Newtype.unwrap(Data_MediaType.newtypeMediaType)(v.value0);
      };
      if (v instanceof ContentType) {
          return Data_Newtype.unwrap(Data_MediaType.newtypeMediaType)(v.value0);
      };
      if (v instanceof RequestHeader) {
          return v.value1;
      };
      throw new Error("Failed pattern match at Network.HTTP.RequestHeader line 29, column 1 - line 29, column 46: " + [ v.constructor.name ]);
  };
  var requestHeaderName = function (v) {
      if (v instanceof Accept) {
          return "Accept";
      };
      if (v instanceof ContentType) {
          return "Content-Type";
      };
      if (v instanceof RequestHeader) {
          return v.value0;
      };
      throw new Error("Failed pattern match at Network.HTTP.RequestHeader line 24, column 1 - line 24, column 45: " + [ v.constructor.name ]);
  };
  exports["Accept"] = Accept;
  exports["ContentType"] = ContentType;
  exports["RequestHeader"] = RequestHeader;
  exports["requestHeaderName"] = requestHeaderName;
  exports["requestHeaderValue"] = requestHeaderValue;
})(PS["Network.HTTP.RequestHeader"] = PS["Network.HTTP.RequestHeader"] || {});
(function(exports) {
  // Generated by purs version 0.12.0
  "use strict";
  var Data_Eq = PS["Data.Eq"];
  var Data_HeytingAlgebra = PS["Data.HeytingAlgebra"];
  var Data_Semigroup = PS["Data.Semigroup"];
  var Data_Show = PS["Data.Show"];
  var Prelude = PS["Prelude"];                 
  var ResponseHeader = (function () {
      function ResponseHeader(value0, value1) {
          this.value0 = value0;
          this.value1 = value1;
      };
      ResponseHeader.create = function (value0) {
          return function (value1) {
              return new ResponseHeader(value0, value1);
          };
      };
      return ResponseHeader;
  })();
  var responseHeader = function (field) {
      return function (value) {
          return new ResponseHeader(field, value);
      };
  };
  exports["responseHeader"] = responseHeader;
})(PS["Network.HTTP.ResponseHeader"] = PS["Network.HTTP.ResponseHeader"] || {});
(function(exports) {
  // Generated by purs version 0.12.0
  "use strict";
  var $foreign = PS["Network.HTTP.Affjax"];
  var Control_Applicative = PS["Control.Applicative"];
  var Control_Bind = PS["Control.Bind"];
  var Control_Monad_Error_Class = PS["Control.Monad.Error.Class"];
  var Control_Monad_Except = PS["Control.Monad.Except"];
  var Control_Monad_Except_Trans = PS["Control.Monad.Except.Trans"];
  var Control_Parallel = PS["Control.Parallel"];
  var Control_Semigroupoid = PS["Control.Semigroupoid"];
  var Data_Argonaut_Core = PS["Data.Argonaut.Core"];
  var Data_Argonaut_Parser = PS["Data.Argonaut.Parser"];
  var Data_Array = PS["Data.Array"];
  var Data_Either = PS["Data.Either"];
  var Data_Eq = PS["Data.Eq"];
  var Data_Foldable = PS["Data.Foldable"];
  var Data_FormURLEncoded = PS["Data.FormURLEncoded"];
  var Data_Function = PS["Data.Function"];
  var Data_Function_Uncurried = PS["Data.Function.Uncurried"];
  var Data_Functor = PS["Data.Functor"];
  var Data_HTTP_Method = PS["Data.HTTP.Method"];
  var Data_HeytingAlgebra = PS["Data.HeytingAlgebra"];
  var Data_Identity = PS["Data.Identity"];
  var Data_Int = PS["Data.Int"];
  var Data_List_Types = PS["Data.List.Types"];
  var Data_Maybe = PS["Data.Maybe"];
  var Data_Monoid = PS["Data.Monoid"];
  var Data_Nullable = PS["Data.Nullable"];
  var Data_Ord = PS["Data.Ord"];
  var Data_Ring = PS["Data.Ring"];
  var Data_Semiring = PS["Data.Semiring"];
  var Data_Time_Duration = PS["Data.Time.Duration"];
  var Data_Unit = PS["Data.Unit"];
  var Effect_Aff = PS["Effect.Aff"];
  var Effect_Aff_Compat = PS["Effect.Aff.Compat"];
  var Effect_Class = PS["Effect.Class"];
  var Effect_Exception = PS["Effect.Exception"];
  var Effect_Ref = PS["Effect.Ref"];
  var Foreign = PS["Foreign"];
  var $$Math = PS["Math"];
  var Network_HTTP_Affjax_Request = PS["Network.HTTP.Affjax.Request"];
  var Network_HTTP_Affjax_Response = PS["Network.HTTP.Affjax.Response"];
  var Network_HTTP_RequestHeader = PS["Network.HTTP.RequestHeader"];
  var Network_HTTP_ResponseHeader = PS["Network.HTTP.ResponseHeader"];
  var Network_HTTP_StatusCode = PS["Network.HTTP.StatusCode"];
  var Prelude = PS["Prelude"];
  var defaultRequest = {
      method: new Data_Either.Left(Data_HTTP_Method.GET.value),
      url: "/",
      headers: [  ],
      content: Data_Maybe.Nothing.value,
      username: Data_Maybe.Nothing.value,
      password: Data_Maybe.Nothing.value,
      withCredentials: false
  };
  var affjax = function (rt) {
      return function (req) {
          var parseJSON = function (v) {
              if (v === "") {
                  return Control_Applicative.pure(Control_Monad_Except_Trans.applicativeExceptT(Data_Identity.monadIdentity))(Data_Argonaut_Core.jsonEmptyObject);
              };
              return Data_Either.either(function ($58) {
                  return Foreign.fail(Foreign.ForeignError.create($58));
              })(Control_Applicative.pure(Control_Monad_Except_Trans.applicativeExceptT(Data_Identity.monadIdentity)))(Data_Argonaut_Parser.jsonParser(v));
          };
          var fromResponse$prime = (function () {
              if (rt instanceof Network_HTTP_Affjax_Response["ArrayBuffer"]) {
                  return Foreign.unsafeReadTagged("ArrayBuffer");
              };
              if (rt instanceof Network_HTTP_Affjax_Response.Blob) {
                  return Foreign.unsafeReadTagged("Blob");
              };
              if (rt instanceof Network_HTTP_Affjax_Response.Document) {
                  return Foreign.unsafeReadTagged("Document");
              };
              if (rt instanceof Network_HTTP_Affjax_Response.Json) {
                  return Control_Bind.composeKleisliFlipped(Control_Monad_Except_Trans.bindExceptT(Data_Identity.monadIdentity))(function ($59) {
                      return rt.value0(parseJSON($59));
                  })(Foreign.unsafeReadTagged("String"));
              };
              if (rt instanceof Network_HTTP_Affjax_Response["String"]) {
                  return Foreign.unsafeReadTagged("String");
              };
              if (rt instanceof Network_HTTP_Affjax_Response.Ignore) {
                  return Data_Function["const"](rt.value0(Control_Applicative.pure(Control_Monad_Except_Trans.applicativeExceptT(Data_Identity.monadIdentity))(Data_Unit.unit)));
              };
              throw new Error("Failed pattern match at Network.HTTP.Affjax line 261, column 19 - line 267, column 51: " + [ rt.constructor.name ]);
          })();
          var extractContent = function (v) {
              if (v instanceof Network_HTTP_Affjax_Request.ArrayView) {
                  return v.value0(Foreign.unsafeToForeign);
              };
              if (v instanceof Network_HTTP_Affjax_Request.Blob) {
                  return Foreign.unsafeToForeign(v.value0);
              };
              if (v instanceof Network_HTTP_Affjax_Request.Document) {
                  return Foreign.unsafeToForeign(v.value0);
              };
              if (v instanceof Network_HTTP_Affjax_Request["String"]) {
                  return Foreign.unsafeToForeign(v.value0);
              };
              if (v instanceof Network_HTTP_Affjax_Request.FormData) {
                  return Foreign.unsafeToForeign(v.value0);
              };
              if (v instanceof Network_HTTP_Affjax_Request.FormURLEncoded) {
                  return Foreign.unsafeToForeign(Data_FormURLEncoded.encode(v.value0));
              };
              if (v instanceof Network_HTTP_Affjax_Request.Json) {
                  return Foreign.unsafeToForeign(Data_Argonaut_Core.stringify(v.value0));
              };
              throw new Error("Failed pattern match at Network.HTTP.Affjax line 235, column 20 - line 242, column 53: " + [ v.constructor.name ]);
          };
          var addHeader = function (mh) {
              return function (hs) {
                  if (mh instanceof Data_Maybe.Just && !Data_Foldable.any(Data_Foldable.foldableArray)(Data_HeytingAlgebra.heytingAlgebraBoolean)(Data_Function.on(Data_Eq.eq(Data_Eq.eqString))(Network_HTTP_RequestHeader.requestHeaderName)(mh.value0))(hs)) {
                      return Data_Array.snoc(hs)(mh.value0);
                  };
                  return hs;
              };
          };
          var headers = function (reqContent) {
              return addHeader(Data_Functor.map(Data_Maybe.functorMaybe)(Network_HTTP_RequestHeader.ContentType.create)(Control_Bind.bindFlipped(Data_Maybe.bindMaybe)(Network_HTTP_Affjax_Request.toMediaType)(reqContent)))(addHeader(Data_Functor.map(Data_Maybe.functorMaybe)(Network_HTTP_RequestHeader.Accept.create)(Network_HTTP_Affjax_Response.toMediaType(rt)))(req.headers));
          };
          var req$prime = {
              method: Data_HTTP_Method.print(req.method),
              url: req.url,
              headers: Data_Functor.map(Data_Functor.functorArray)(function (h) {
                  return {
                      field: Network_HTTP_RequestHeader.requestHeaderName(h),
                      value: Network_HTTP_RequestHeader.requestHeaderValue(h)
                  };
              })(headers(req.content)),
              content: Data_Nullable.toNullable(Data_Functor.map(Data_Maybe.functorMaybe)(extractContent)(req.content)),
              responseType: Network_HTTP_Affjax_Response.toResponseType(rt),
              username: Data_Nullable.toNullable(req.username),
              password: Data_Nullable.toNullable(req.password),
              withCredentials: req.withCredentials
          };
          return Control_Bind.bind(Effect_Aff.bindAff)(Effect_Aff_Compat.fromEffectFnAff($foreign._ajax(Network_HTTP_ResponseHeader.responseHeader, req$prime)))(function (v) {
              var v1 = Control_Monad_Except.runExcept(fromResponse$prime(v.response));
              if (v1 instanceof Data_Either.Left) {
                  return Control_Monad_Error_Class.throwError(Effect_Aff.monadThrowAff)(Effect_Exception.error(Data_Foldable.intercalate(Data_List_Types.foldableNonEmptyList)(Data_Monoid.monoidString)("\x0a")(Data_Functor.map(Data_List_Types.functorNonEmptyList)(Foreign.renderForeignError)(v1.value0))));
              };
              if (v1 instanceof Data_Either.Right) {
                  return Control_Applicative.pure(Effect_Aff.applicativeAff)({
                      response: v1.value0,
                      headers: v.headers,
                      status: v.status,
                      statusText: v.statusText
                  });
              };
              throw new Error("Failed pattern match at Network.HTTP.Affjax line 217, column 3 - line 219, column 49: " + [ v1.constructor.name ]);
          });
      };
  };                                                          
  var get = function (rt) {
      return function (u) {
          return affjax(rt)({
              method: defaultRequest.method,
              url: u,
              headers: defaultRequest.headers,
              content: defaultRequest.content,
              username: defaultRequest.username,
              password: defaultRequest.password,
              withCredentials: defaultRequest.withCredentials
          });
      };
  };
  exports["defaultRequest"] = defaultRequest;
  exports["affjax"] = affjax;
  exports["get"] = get;
})(PS["Network.HTTP.Affjax"] = PS["Network.HTTP.Affjax"] || {});
(function(exports) {
  // Generated by purs version 0.12.0
  "use strict";
  var Control_Applicative = PS["Control.Applicative"];
  var Control_Apply = PS["Control.Apply"];
  var Control_Bind = PS["Control.Bind"];
  var Control_Coroutine = PS["Control.Coroutine"];
  var Control_Coroutine_Aff = PS["Control.Coroutine.Aff"];
  var Control_Monad_Error_Class = PS["Control.Monad.Error.Class"];
  var Control_Monad_Except = PS["Control.Monad.Except"];
  var Control_Semigroupoid = PS["Control.Semigroupoid"];
  var Data_Array = PS["Data.Array"];
  var Data_BigInt = PS["Data.BigInt"];
  var Data_Either = PS["Data.Either"];
  var Data_Foldable = PS["Data.Foldable"];
  var Data_Function = PS["Data.Function"];
  var Data_Functor = PS["Data.Functor"];
  var Data_Int = PS["Data.Int"];
  var Data_List_NonEmpty = PS["Data.List.NonEmpty"];
  var Data_List_Types = PS["Data.List.Types"];
  var Data_Maybe = PS["Data.Maybe"];
  var Data_Monoid = PS["Data.Monoid"];
  var Data_Newtype = PS["Data.Newtype"];
  var Data_Semigroup = PS["Data.Semigroup"];
  var Data_String = PS["Data.String"];
  var Data_String_CodePoints = PS["Data.String.CodePoints"];
  var Data_String_Common = PS["Data.String.Common"];
  var Data_String_Pattern = PS["Data.String.Pattern"];
  var Data_Symbol = PS["Data.Symbol"];
  var Data_Traversable = PS["Data.Traversable"];
  var Data_Unit = PS["Data.Unit"];
  var Data_Validation_Semigroup = PS["Data.Validation.Semigroup"];
  var Debug_Trace = PS["Debug.Trace"];
  var Effect_Aff = PS["Effect.Aff"];
  var Effect_Aff_AVar = PS["Effect.Aff.AVar"];
  var Effect_Exception = PS["Effect.Exception"];
  var Foreign = PS["Foreign"];
  var Genetics_Browser_Types = PS["Genetics.Browser.Types"];
  var Network_HTTP_Affjax = PS["Network.HTTP.Affjax"];
  var Network_HTTP_Affjax_Response = PS["Network.HTTP.Affjax.Response"];
  var Prelude = PS["Prelude"];
  var Simple_JSON = PS["Simple.JSON"];
  var Unsafe_Coerce = PS["Unsafe.Coerce"];                 
  var validInt = function (s) {
      var v = Data_Int.fromString(s);
      if (v instanceof Data_Maybe.Nothing) {
          return Data_Validation_Semigroup.invalid(Control_Applicative.pure(Data_List_Types.applicativeNonEmptyList)("Error parsing int " + s));
      };
      if (v instanceof Data_Maybe.Just) {
          return Control_Applicative.pure(Data_Validation_Semigroup.applicativeV(Data_List_Types.semigroupNonEmptyList))(v.value0);
      };
      throw new Error("Failed pattern match at Genetics.Browser.Bed line 90, column 14 - line 92, column 20: " + [ v.constructor.name ]);
  };
  var validChrId = function ($29) {
      return Control_Applicative.pure(Data_Validation_Semigroup.applicativeV(Data_List_Types.semigroupNonEmptyList))(Data_Newtype.wrap(Genetics_Browser_Types.newtypeChrId)(Data_String_CodePoints.drop(3)($29)));
  };
  var validBigInt = function (s) {
      var v = Data_BigInt.fromString(s);
      if (v instanceof Data_Maybe.Nothing) {
          return Data_Validation_Semigroup.invalid(Control_Applicative.pure(Data_List_Types.applicativeNonEmptyList)("Error parsing int " + s));
      };
      if (v instanceof Data_Maybe.Just) {
          return Control_Applicative.pure(Data_Validation_Semigroup.applicativeV(Data_List_Types.semigroupNonEmptyList))(v.value0);
      };
      throw new Error("Failed pattern match at Genetics.Browser.Bed line 95, column 17 - line 97, column 20: " + [ v.constructor.name ]);
  };
  var validList = function (x) {
      return Data_Traversable.traverse(Data_Traversable.traversableArray)(Data_Validation_Semigroup.applicativeV(Data_List_Types.semigroupNonEmptyList))(validBigInt)(Data_String_Common.split(Data_Newtype.wrap(Data_String_Pattern.newtypePattern)(","))(x));
  };
  var validLine = function (l) {
      return Control_Apply.apply(Data_Validation_Semigroup.applyV(Data_List_Types.semigroupNonEmptyList))(Control_Apply.apply(Data_Validation_Semigroup.applyV(Data_List_Types.semigroupNonEmptyList))(Control_Apply.apply(Data_Validation_Semigroup.applyV(Data_List_Types.semigroupNonEmptyList))(Control_Apply.apply(Data_Validation_Semigroup.applyV(Data_List_Types.semigroupNonEmptyList))(Control_Apply.apply(Data_Validation_Semigroup.applyV(Data_List_Types.semigroupNonEmptyList))(Control_Apply.apply(Data_Validation_Semigroup.applyV(Data_List_Types.semigroupNonEmptyList))(Control_Apply.apply(Data_Validation_Semigroup.applyV(Data_List_Types.semigroupNonEmptyList))(Control_Apply.apply(Data_Validation_Semigroup.applyV(Data_List_Types.semigroupNonEmptyList))(Data_Functor.map(Data_Validation_Semigroup.functorV)(function (v) {
          return function (v1) {
              return function (v2) {
                  return function (v3) {
                      return function (v4) {
                          return function (v5) {
                              return function (v6) {
                                  return function (v7) {
                                      return function (v8) {
                                          return {
                                              chrom: v,
                                              chromStart: v1,
                                              chromEnd: v2,
                                              score: v3,
                                              thickStart: v4,
                                              thickEnd: v5,
                                              blockCount: v6,
                                              blockSizes: v7,
                                              blockStarts: v8,
                                              geneId: l.geneId,
                                              geneName: l.geneName,
                                              itemRgb: l.itemRgb,
                                              name: l.name,
                                              strand: l.strand,
                                              tags: l.tags,
                                              type: l.type
                                          };
                                      };
                                  };
                              };
                          };
                      };
                  };
              };
          };
      })(validChrId(l.chrom)))(validBigInt(l.chromStart)))(validBigInt(l.chromEnd)))(validInt(l.score)))(validBigInt(l.thickStart)))(validBigInt(l.thickEnd)))(validInt(l.blockCount)))(validList(l.blockSizes)))(validList(l.blockStarts));
  };
  var validateBedChunk = function (d) {
      var v = Data_Traversable.traverse(Data_Traversable.traversableArray)(Data_Either.applicativeEither)(Simple_JSON.read(Simple_JSON.readRecord()(Simple_JSON.readFieldsCons(new Data_Symbol.IsSymbol(function () {
          return "blockCount";
      }))(Simple_JSON.readString)(Simple_JSON.readFieldsCons(new Data_Symbol.IsSymbol(function () {
          return "blockSizes";
      }))(Simple_JSON.readString)(Simple_JSON.readFieldsCons(new Data_Symbol.IsSymbol(function () {
          return "blockStarts";
      }))(Simple_JSON.readString)(Simple_JSON.readFieldsCons(new Data_Symbol.IsSymbol(function () {
          return "chrom";
      }))(Simple_JSON.readString)(Simple_JSON.readFieldsCons(new Data_Symbol.IsSymbol(function () {
          return "chromEnd";
      }))(Simple_JSON.readString)(Simple_JSON.readFieldsCons(new Data_Symbol.IsSymbol(function () {
          return "chromStart";
      }))(Simple_JSON.readString)(Simple_JSON.readFieldsCons(new Data_Symbol.IsSymbol(function () {
          return "geneId";
      }))(Simple_JSON.readString)(Simple_JSON.readFieldsCons(new Data_Symbol.IsSymbol(function () {
          return "geneName";
      }))(Simple_JSON.readString)(Simple_JSON.readFieldsCons(new Data_Symbol.IsSymbol(function () {
          return "itemRgb";
      }))(Simple_JSON.readString)(Simple_JSON.readFieldsCons(new Data_Symbol.IsSymbol(function () {
          return "name";
      }))(Simple_JSON.readString)(Simple_JSON.readFieldsCons(new Data_Symbol.IsSymbol(function () {
          return "score";
      }))(Simple_JSON.readString)(Simple_JSON.readFieldsCons(new Data_Symbol.IsSymbol(function () {
          return "strand";
      }))(Simple_JSON.readString)(Simple_JSON.readFieldsCons(new Data_Symbol.IsSymbol(function () {
          return "tags";
      }))(Simple_JSON.readString)(Simple_JSON.readFieldsCons(new Data_Symbol.IsSymbol(function () {
          return "thickEnd";
      }))(Simple_JSON.readString)(Simple_JSON.readFieldsCons(new Data_Symbol.IsSymbol(function () {
          return "thickStart";
      }))(Simple_JSON.readString)(Simple_JSON.readFieldsCons(new Data_Symbol.IsSymbol(function () {
          return "type";
      }))(Simple_JSON.readString)(Simple_JSON.readFieldsNil)()())()())()())()())()())()())()())()())()())()())()())()())()())()())()())()())))(d);
      if (v instanceof Data_Either.Left) {
          return Data_Validation_Semigroup.invalid(Data_Functor.map(Data_List_Types.functorNonEmptyList)(Foreign.renderForeignError)(v.value0));
      };
      if (v instanceof Data_Either.Right) {
          return Data_Traversable.traverse(Data_Traversable.traversableArray)(Data_Validation_Semigroup.applicativeV(Data_List_Types.semigroupNonEmptyList))(validLine)(v.value0);
      };
      throw new Error("Failed pattern match at Genetics.Browser.Bed line 123, column 3 - line 126, column 38: " + [ v.constructor.name ]);
  };
  var fetchBed = function (url) {
      return Control_Bind.bind(Effect_Aff.bindAff)(Data_Functor.map(Effect_Aff.functorAff)(function (v) {
          return v.response;
      })(Network_HTTP_Affjax.get(Network_HTTP_Affjax_Response.json)(url)))(function (v) {
          var v1 = Control_Monad_Except.runExcept(Foreign.readArray(v));
          if (v1 instanceof Data_Either.Left) {
              return Debug_Trace.trace(Debug_Trace.warn())("shit's fucked")(function (v2) {
                  return Control_Applicative.pure(Effect_Aff.applicativeAff)(Data_Unit.unit);
              });
          };
          if (v1 instanceof Data_Either.Right) {
              return Data_Validation_Semigroup.unV(function ($30) {
                  return Control_Monad_Error_Class.throwError(Effect_Aff.monadThrowAff)(Effect_Exception.error(Data_Foldable.foldMap(Data_List_Types.foldableNonEmptyList)(Data_Monoid.monoidString)(function (v2) {
                      return v2 + ", ";
                  })($30)));
              })(Control_Applicative.pure(Effect_Aff.applicativeAff))(validateBedChunk(v1.value0));
          };
          throw new Error("Failed pattern match at Genetics.Browser.Bed line 132, column 3 - line 138, column 32: " + [ v1.constructor.name ]);
      });
  };
  exports["validChrId"] = validChrId;
  exports["validInt"] = validInt;
  exports["validBigInt"] = validBigInt;
  exports["validList"] = validList;
  exports["validLine"] = validLine;
  exports["validateBedChunk"] = validateBedChunk;
  exports["fetchBed"] = fetchBed;
})(PS["Genetics.Browser.Bed"] = PS["Genetics.Browser.Bed"] || {});
(function(exports) {
  // Generated by purs version 0.12.0
  "use strict";
  var Control_Applicative = PS["Control.Applicative"];
  var Control_Apply = PS["Control.Apply"];
  var Control_Category = PS["Control.Category"];
  var Control_Semigroupoid = PS["Control.Semigroupoid"];
  var Data_Function = PS["Data.Function"];
  var Data_Functor = PS["Data.Functor"];
  var Data_List = PS["Data.List"];
  var Data_List_Types = PS["Data.List.Types"];
  var Data_Monoid = PS["Data.Monoid"];
  var Data_Ord = PS["Data.Ord"];
  var Data_Ordering = PS["Data.Ordering"];
  var Data_Symbol = PS["Data.Symbol"];
  var Data_Tuple = PS["Data.Tuple"];
  var Prelude = PS["Prelude"];
  var Record = PS["Record"];
  var Record_Builder = PS["Record.Builder"];
  var Type_Prelude = PS["Type.Prelude"];
  var Type_Row = PS["Type.Row"];
  var Keys = function (keysImpl) {
      this.keysImpl = keysImpl;
  }; 
  var nilKeys = new Keys(function (v) {
      return Data_Monoid.mempty(Data_List_Types.monoidList);
  });
  var keysImpl = function (dict) {
      return dict.keysImpl;
  };
  var keys = function (dictRowToList) {
      return function (dictKeys) {
          return function (v) {
              return keysImpl(dictKeys)(Type_Row.RLProxy.value);
          };
      };
  };
  var consKeys = function (dictIsSymbol) {
      return function (dictKeys) {
          return new Keys(function (v) {
              var rest = keysImpl(dictKeys)(Type_Row.RLProxy.value);
              var first = Data_Symbol.reflectSymbol(dictIsSymbol)(Data_Symbol.SProxy.value);
              return new Data_List_Types.Cons(first, rest);
          });
      };
  };
  exports["keysImpl"] = keysImpl;
  exports["Keys"] = Keys;
  exports["keys"] = keys;
  exports["nilKeys"] = nilKeys;
  exports["consKeys"] = consKeys;
})(PS["Record.Extra"] = PS["Record.Extra"] || {});
(function(exports) {
  // Generated by purs version 0.12.0
  "use strict";
  var Color = PS["Color"];
  var Color_Scheme_Clrs = PS["Color.Scheme.Clrs"];
  var Color_Scheme_X11 = PS["Color.Scheme.X11"];
  var Control_Applicative = PS["Control.Applicative"];
  var Control_Bind = PS["Control.Bind"];
  var Control_Category = PS["Control.Category"];
  var Control_Monad_Error_Class = PS["Control.Monad.Error.Class"];
  var Control_Monad_Except = PS["Control.Monad.Except"];
  var Control_Monad_Except_Trans = PS["Control.Monad.Except.Trans"];
  var Control_Semigroupoid = PS["Control.Semigroupoid"];
  var Data_Array = PS["Data.Array"];
  var Data_BigInt = PS["Data.BigInt"];
  var Data_Boolean = PS["Data.Boolean"];
  var Data_Either = PS["Data.Either"];
  var Data_Eq = PS["Data.Eq"];
  var Data_EuclideanRing = PS["Data.EuclideanRing"];
  var Data_Filterable = PS["Data.Filterable"];
  var Data_Foldable = PS["Data.Foldable"];
  var Data_FoldableWithIndex = PS["Data.FoldableWithIndex"];
  var Data_Function = PS["Data.Function"];
  var Data_Functor = PS["Data.Functor"];
  var Data_FunctorWithIndex = PS["Data.FunctorWithIndex"];
  var Data_Identity = PS["Data.Identity"];
  var Data_Lens = PS["Data.Lens"];
  var Data_Lens_Fold = PS["Data.Lens.Fold"];
  var Data_Lens_Getter = PS["Data.Lens.Getter"];
  var Data_Lens_Index = PS["Data.Lens.Index"];
  var Data_Lens_Internal_Forget = PS["Data.Lens.Internal.Forget"];
  var Data_Lens_Internal_Re = PS["Data.Lens.Internal.Re"];
  var Data_Lens_Iso = PS["Data.Lens.Iso"];
  var Data_Lens_Lens_Tuple = PS["Data.Lens.Lens.Tuple"];
  var Data_List = PS["Data.List"];
  var Data_List_Types = PS["Data.List.Types"];
  var Data_Map = PS["Data.Map"];
  var Data_Map_Internal = PS["Data.Map.Internal"];
  var Data_Maybe = PS["Data.Maybe"];
  var Data_Maybe_First = PS["Data.Maybe.First"];
  var Data_Monoid = PS["Data.Monoid"];
  var Data_Newtype = PS["Data.Newtype"];
  var Data_Ord = PS["Data.Ord"];
  var Data_Pair = PS["Data.Pair"];
  var Data_Profunctor_Strong = PS["Data.Profunctor.Strong"];
  var Data_Ring = PS["Data.Ring"];
  var Data_Semigroup = PS["Data.Semigroup"];
  var Data_Semiring = PS["Data.Semiring"];
  var Data_Show = PS["Data.Show"];
  var Data_Symbol = PS["Data.Symbol"];
  var Data_Traversable = PS["Data.Traversable"];
  var Data_Tuple = PS["Data.Tuple"];
  var Data_Unfoldable = PS["Data.Unfoldable"];
  var Data_Unit = PS["Data.Unit"];
  var Data_Variant = PS["Data.Variant"];
  var Effect = PS["Effect"];
  var Effect_Aff = PS["Effect.Aff"];
  var Effect_Class = PS["Effect.Class"];
  var Effect_Console = PS["Effect.Console"];
  var Effect_Exception = PS["Effect.Exception"];
  var Foreign = PS["Foreign"];
  var Foreign_Index = PS["Foreign.Index"];
  var Foreign_Keys = PS["Foreign.Keys"];
  var Genetics_Browser = PS["Genetics.Browser"];
  var Genetics_Browser_Bed = PS["Genetics.Browser.Bed"];
  var Genetics_Browser_Canvas = PS["Genetics.Browser.Canvas"];
  var Genetics_Browser_Coordinates = PS["Genetics.Browser.Coordinates"];
  var Genetics_Browser_Layer = PS["Genetics.Browser.Layer"];
  var Genetics_Browser_Types = PS["Genetics.Browser.Types"];
  var Graphics_Canvas = PS["Graphics.Canvas"];
  var Graphics_Drawing = PS["Graphics.Drawing"];
  var Graphics_Drawing_Font = PS["Graphics.Drawing.Font"];
  var $$Math = PS["Math"];
  var Network_HTTP_Affjax = PS["Network.HTTP.Affjax"];
  var Network_HTTP_Affjax_Response = PS["Network.HTTP.Affjax.Response"];
  var Prelude = PS["Prelude"];
  var Record = PS["Record"];
  var Record_Builder = PS["Record.Builder"];
  var Record_Extra = PS["Record.Extra"];
  var Simple_JSON = PS["Simple.JSON"];
  var Type_Prelude = PS["Type.Prelude"];
  var Unsafe_Coerce = PS["Unsafe.Coerce"];                 
  var snpsUI = function (vscale) {
      return Genetics_Browser.renderFixedUI(Genetics_Browser_Layer.CLeft.create(Genetics_Browser.drawVScaleInSlot(vscale)));
  };
  var showAnnotationField = function (fv) {
      return fv.field + (": " + fv.value);
  };
  var showAnnotation = function (a) {
      var chr = "Chr: " + Data_Show.show(Genetics_Browser_Types.showChrId)(a.feature.chr);
      var name = Data_Maybe.fromMaybe("SNP: " + a.feature.name)(Data_Functor.map(Data_Maybe.functorMaybe)(function (v) {
          return "Gene: " + v;
      })(a.feature.gene));
      var pos = "Pos: " + Data_Show.show(Genetics_Browser_Types.showBp)(a.feature.pos);
      return Data_Semigroup.append(Data_List_Types.semigroupList)(Data_List.fromFoldable(Data_Foldable.foldableArray)([ name, chr, pos ]))(Data_Functor.map(Data_List_Types.functorList)(showAnnotationField)(a.feature.rest));
  };
  var peak1 = function (radius) {
      return function (snps) {
          return Control_Bind.bind(Data_Maybe.bindMaybe)(Data_Foldable.minimumBy(Data_Foldable.foldableArray)(Data_Function.on(Data_Ord.compare(Data_Ord.ordNumber))(function (v) {
              return v.feature.score;
          }))(snps))(function (v) {
              var covers = Genetics_Browser_Coordinates.aroundPair(Genetics_Browser_Types.ringBp)(radius)(v.position);
              var v1 = Data_Filterable.partition(Data_Filterable.filterableArray)(function (p) {
                  return Genetics_Browser_Coordinates.pairsOverlap(Genetics_Browser_Types.ordBp)(p.position)(covers);
              })(snps);
              return Control_Applicative.pure(Data_Maybe.applicativeMaybe)(new Data_Tuple.Tuple({
                  covers: covers,
                  y: v.feature.score,
                  elements: v1.yes
              }, v1.no));
          });
      };
  };
  var peaks = function (r) {
      return function (snps) {
          return Data_Unfoldable.unfoldr(Data_Unfoldable.unfoldableArray)(peak1(r))(snps);
      };
  };
  var parseSNP = function (cSys) {
      return function (a) {
          return Control_Bind.bind(Control_Monad_Except_Trans.bindExceptT(Data_Identity.monadIdentity))(Simple_JSON["read'"](Simple_JSON.readRecord()(Simple_JSON.readFieldsCons(new Data_Symbol.IsSymbol(function () {
              return "chr";
          }))(Simple_JSON.readString)(Simple_JSON.readFieldsCons(new Data_Symbol.IsSymbol(function () {
              return "p_wald";
          }))(Simple_JSON.readNumber)(Simple_JSON.readFieldsCons(new Data_Symbol.IsSymbol(function () {
              return "ps";
          }))(Simple_JSON.readNumber)(Simple_JSON.readFieldsCons(new Data_Symbol.IsSymbol(function () {
              return "rs";
          }))(Simple_JSON.readString)(Simple_JSON.readFieldsNil)()())()())()())()()))(a))(function (v) {
              var position = (function (p) {
                  return Data_Functor.map(Data_Pair.functorPair)(Data_Newtype.wrap(Genetics_Browser_Types.newtypeBp))(new Data_Pair.Pair(p, p));
              })(v.ps);
              var feature = {
                  score: v.p_wald,
                  chrId: Data_Newtype.wrap(Genetics_Browser_Types.newtypeChrId)(v.chr),
                  name: v.rs
              };
              return Control_Bind.bind(Control_Monad_Except_Trans.bindExceptT(Data_Identity.monadIdentity))((function () {
                  var v1 = Data_Map_Internal.lookup(Genetics_Browser_Types.ordChrId)(feature.chrId)(Data_Lens_Getter.view(Genetics_Browser_Coordinates._Segments(Data_Lens_Internal_Forget.strongForget))(cSys));
                  if (v1 instanceof Data_Maybe.Nothing) {
                      return Control_Monad_Error_Class.throwError(Control_Monad_Except_Trans.monadThrowExceptT(Data_Identity.monadIdentity))(Control_Applicative.pure(Data_List_Types.applicativeNonEmptyList)(new Foreign.ForeignError("Annotation chr not found in coordinate system!")));
                  };
                  if (v1 instanceof Data_Maybe.Just) {
                      return Control_Applicative.pure(Control_Monad_Except_Trans.applicativeExceptT(Data_Identity.monadIdentity))(Genetics_Browser_Types.Bp(Data_BigInt.toNumber(Genetics_Browser_Coordinates.pairSize(Data_BigInt.ringBigInt)(v1.value0))));
                  };
                  throw new Error("Failed pattern match at Genetics.Browser.Demo line 180, column 16 - line 186, column 49: " + [ v1.constructor.name ]);
              })())(function (v1) {
                  return Control_Applicative.pure(Control_Monad_Except_Trans.applicativeExceptT(Data_Identity.monadIdentity))({
                      position: position,
                      frameSize: v1,
                      feature: feature
                  });
              });
          });
      };
  };
  var normYLogScore = function (s) {
      return function ($156) {
          return Genetics_Browser_Coordinates.normalize(Data_EuclideanRing.euclideanRingNumber)(s.min)(s.max)(Data_Newtype.unwrap(Genetics_Browser_Types.newtypeNegLog10)(Data_Lens_Getter.view(Genetics_Browser_Types._NegLog10(Data_Lens_Internal_Forget.profunctorForget))($156)));
      };
  };
  var getSNPs = function (cs) {
      return function (url) {
          return Control_Bind.bind(Effect_Aff.bindAff)(Network_HTTP_Affjax.get(Network_HTTP_Affjax_Response.json)(url))(function (v) {
              return Control_Bind.bind(Effect_Aff.bindAff)((function () {
                  var v1 = Control_Monad_Except.runExcept(Foreign.readArray(v.response));
                  if (v1 instanceof Data_Either.Left) {
                      return Control_Monad_Error_Class.throwError(Effect_Aff.monadThrowAff)(Effect_Exception.error("SNP data is not an array"));
                  };
                  if (v1 instanceof Data_Either.Right) {
                      return Control_Applicative.pure(Effect_Aff.applicativeAff)(v1.value0);
                  };
                  throw new Error("Failed pattern match at Genetics.Browser.Demo line 281, column 5 - line 283, column 31: " + [ v1.constructor.name ]);
              })())(function (v1) {
                  var parsed = Data_Filterable.partitionMap(Data_Filterable.filterableArray)(function ($157) {
                      return Control_Monad_Except.runExcept(parseSNP(cs)($157));
                  })(v1);
                  return Control_Applicative.pure(Effect_Aff.applicativeAff)(Genetics_Browser.groupToMap(Data_Monoid.monoidArray)(Genetics_Browser_Types.ordChrId)(Data_Foldable.foldableArray)(Control_Applicative.applicativeArray)(function (v2) {
                      return v2.feature.chrId;
                  })(Data_Filterable.filter(Data_Filterable.filterableArray)(function (f) {
                      return Data_Ord.greaterThanOrEq(Genetics_Browser_Types.ordBp)(Data_Pair.fst(f.position))(Data_Newtype.wrap(Genetics_Browser_Types.newtypeBp)(0));
                  })(parsed.right)));
              });
          });
      };
  };
  var filterSig = function (v) {
      return Data_Functor.map(Data_Map_Internal.functorMap)(Data_Filterable.filter(Data_Filterable.filterableArray)(function (snp) {
          return snp.feature.score <= Data_Lens_Getter.viewOn(v.sig)(Data_Lens_Iso.re(Genetics_Browser_Types._NegLog10(Data_Lens_Internal_Re.profunctorRe(Data_Lens_Internal_Forget.profunctorForget))));
      }));
  };
  var dist = function (p1) {
      return function (p2) {
          var y$prime = p1.y - p2.y;
          var x$prime = p1.x - p2.x;
          return $$Math.sqrt($$Math.pow(x$prime)(2.0) + $$Math.pow(y$prime)(2.0));
      };
  };
  var renderSNPs = function (snpData) {
      return function (v) {
          var pointed = function (size) {
              var place = function (v1) {
                  return function (s) {
                      return {
                          x: v1.value0 + Genetics_Browser_Coordinates.pairSize(Data_Ring.ringNumber)(v1) * Data_Newtype.unwrap(Genetics_Browser_Coordinates.newtypeNormalized)(Genetics_Browser.featureNormX(s)),
                          y: size.height * (1 - normYLogScore(v.threshold)(s.feature.score))
                      };
                  };
              };
              var placeSeg = function (chrId) {
                  return function (seg) {
                      return Data_Foldable.foldMap(Data_Foldable.foldableMaybe)(Data_Monoid.monoidArray)(Data_Functor.map(Data_Functor.functorArray)(Data_Profunctor_Strong.fanout(Control_Category.categoryFn)(Data_Profunctor_Strong.strongFn)(Control_Category.identity(Control_Category.categoryFn))(place(seg))))(Data_Map_Internal.lookup(Genetics_Browser_Types.ordChrId)(chrId)(snpData));
                  };
              };
              return Data_FoldableWithIndex.foldMapWithIndex(Data_Map_Internal.foldableWithIndexMap)(Data_Monoid.monoidArray)(placeSeg);
          };
          var hotspots = function (pts) {
              return function (radius$prime) {
                  return function (pt) {
                      var covers = function (v1) {
                          if (dist(v1.value1)(pt) <= v.snpsConfig.radius + radius$prime) {
                              return new Data_Maybe.Just(v1.value0);
                          };
                          if (Data_Boolean.otherwise) {
                              return Data_Maybe.Nothing.value;
                          };
                          throw new Error("Failed pattern match at Genetics.Browser.Demo line 494, column 15 - line 494, column 63: " + [ v1.constructor.name ]);
                      };
                      return Data_Filterable.filterMap(Data_Filterable.filterableArray)(covers)(pts);
                  };
              };
          };
          var drawing = (function () {
              var c = Graphics_Drawing.circle(v.snpsConfig.pixelOffset.x)(v.snpsConfig.pixelOffset.y)(v.snpsConfig.radius);
              var fill = Graphics_Drawing.filled(Graphics_Drawing.fillColor(Data_Newtype.unwrap(Genetics_Browser.newtypeHexColor)(v.snpsConfig.color.fill)))(c);
              var out = Graphics_Drawing.outlined(Data_Semigroup.append(Graphics_Drawing.semigroupOutlineStyle)(Graphics_Drawing.outlineColor(Data_Newtype.unwrap(Genetics_Browser.newtypeHexColor)(v.snpsConfig.color.outline)))(Graphics_Drawing.lineWidth(v.snpsConfig.lineWidth)))(c);
              return Data_Semigroup.append(Graphics_Drawing.semigroupDrawing)(out)(fill);
          })();
          var drawings = function (pts) {
              return [ {
                  drawing: drawing,
                  points: Data_Functor.map(Data_Functor.functorArray)(Data_Lens_Getter.view(Data_Lens_Lens_Tuple._2(Data_Lens_Internal_Forget.strongForget)))(pts)
              } ];
          };
          return function (seg) {
              return function (size) {
                  var pts = pointed(size)(seg);
                  return {
                      renderables: Control_Applicative.pure(Data_List_Types.applicativeList)(Data_Variant.inj()(new Data_Symbol.IsSymbol(function () {
                          return "drawings";
                      }))(Genetics_Browser_Canvas._drawings)(drawings(pts))),
                      hotspots: hotspots(pts)
                  };
              };
          };
      };
  };
  var bedToFeature = function (cs) {
      return function (pl) {
          return Control_Bind.bind(Data_Maybe.bindMaybe)(Data_Lens_Fold.previewOn(cs)(function ($158) {
              return Genetics_Browser_Coordinates._Segments(Data_Lens_Internal_Forget.strongForget)(Data_Lens_Index.ix(Data_Lens_Index.indexMap(Genetics_Browser_Types.ordChrId))(pl.chrom)(Data_Lens_Internal_Forget.wanderForget(Data_Maybe_First.monoidFirst))($158));
          }))(function (v) {
              var toBp = function ($159) {
                  return Data_Newtype.wrap(Genetics_Browser_Types.newtypeBp)(Data_BigInt.toNumber($159));
              };
              var thickRange = Data_Functor.map(Data_Pair.functorPair)(toBp)(new Data_Pair.Pair(pl.thickStart, pl.thickEnd));
              var position = Data_Functor.map(Data_Pair.functorPair)(toBp)(new Data_Pair.Pair(pl.chromStart, pl.chromEnd));
              var frameSize = toBp(Genetics_Browser_Coordinates.pairSize(Data_BigInt.ringBigInt)(v));
              var blocks = Data_Array.zipWith(function (start) {
                  return function (size) {
                      return Data_Functor.map(Data_Pair.functorPair)(toBp)(new Data_Pair.Pair(start, size));
                  };
              })(pl.blockStarts)(pl.blockSizes);
              return Control_Applicative.pure(Data_Maybe.applicativeMaybe)({
                  position: position,
                  frameSize: frameSize,
                  feature: {
                      thickRange: thickRange,
                      blocks: blocks,
                      geneId: pl.geneId,
                      geneName: pl.geneName,
                      chrId: pl.chrom
                  }
              });
          });
      };
  };
  var getGenes = function (cs) {
      return function (url) {
          return Control_Bind.bind(Effect_Aff.bindAff)(Genetics_Browser_Bed.fetchBed(url))(function (v) {
              var fs = Data_Filterable.filterMap(Data_Filterable.filterableArray)(bedToFeature(cs))(v);
              return Control_Applicative.pure(Effect_Aff.applicativeAff)(Genetics_Browser.groupToMap(Data_Monoid.monoidArray)(Genetics_Browser_Types.ordChrId)(Data_Foldable.foldableArray)(Control_Applicative.applicativeArray)(function (v1) {
                  return v1.feature.chrId;
              })(fs));
          });
      };
  };   
  var annotationsUI = function (legend) {
      return Genetics_Browser.renderFixedUI(Genetics_Browser_Layer.CRight.create(Genetics_Browser.drawLegendInSlot(legend)));
  };
  var annotationsForScale = function (cSys) {
      return function (snps) {
          return function (annots) {
              return Data_FunctorWithIndex.mapWithIndex(Data_Map_Internal.functorWithIndexMap)(function (chr) {
                  return function (seg) {
                      return Data_Maybe.fromMaybe([  ])(Control_Bind.bind(Data_Maybe.bindMaybe)(Data_Map_Internal.lookup(Genetics_Browser_Types.ordChrId)(chr)(snps))(function (v) {
                          return Control_Bind.bind(Data_Maybe.bindMaybe)(Data_Map_Internal.lookup(Genetics_Browser_Types.ordChrId)(chr)(annots))(function (v1) {
                              return Control_Bind.bind(Data_Maybe.bindMaybe)(Data_Functor.map(Data_Maybe.functorMaybe)(function (v2) {
                                  return v2.frameSize;
                              })(Data_Array.head(v)))(function (v2) {
                                  var rad = Data_EuclideanRing.div(Genetics_Browser_Types.euclideanRingBp)(Data_Semiring.mul(Genetics_Browser_Types.semiringBp)(Data_Newtype.wrap(Genetics_Browser_Types.newtypeBp)(3.75))(v2))(Data_Newtype.wrap(Genetics_Browser_Types.newtypeBp)(Genetics_Browser_Coordinates.pairSize(Data_Ring.ringNumber)(seg)));
                                  var f = function (pk) {
                                      return {
                                          elements: Data_Filterable.filter(Data_Filterable.filterableArray)(function ($160) {
                                              return Genetics_Browser_Coordinates.pairsOverlap(Genetics_Browser_Types.ordBp)(pk.covers)((function (v4) {
                                                  return v4.position;
                                              })($160));
                                          })(v1),
                                          covers: pk.covers,
                                          y: pk.y
                                      };
                                  };
                                  return Control_Applicative.pure(Data_Maybe.applicativeMaybe)(Data_Functor.map(Data_Functor.functorArray)(f)(peaks(rad)(v)));
                              });
                          });
                      }));
                  };
              });
          };
      };
  };
  var annotationLegendEntry = function (conf) {
      return function (a) {
          var mkIcon = function (color) {
              return Data_Semigroup.append(Data_Semigroup.semigroupFn(Graphics_Drawing.semigroupDrawing))(Graphics_Drawing.outlined(Data_Semigroup.append(Graphics_Drawing.semigroupOutlineStyle)(Graphics_Drawing.outlineColor(Data_Newtype.unwrap(Genetics_Browser.newtypeHexColor)(conf.outline)))(Graphics_Drawing.lineWidth(2.0))))(Graphics_Drawing.filled(Graphics_Drawing.fillColor(Data_Newtype.unwrap(Genetics_Browser.newtypeHexColor)(color))))(Graphics_Drawing.circle(0.0)(0.0)(conf.radius));
          };
          if (a.feature.gene instanceof Data_Maybe.Nothing) {
              return {
                  text: "SNP name",
                  icon: mkIcon(conf.snpColor)
              };
          };
          if (a.feature.gene instanceof Data_Maybe.Just) {
              return {
                  text: "Gene name",
                  icon: mkIcon(conf.geneColor)
              };
          };
          throw new Error("Failed pattern match at Genetics.Browser.Demo line 369, column 6 - line 371, column 69: " + [ a.feature.gene.constructor.name ]);
      };
  };
  var annotationLegendTest = function (dictFoldable) {
      return function (dictFunctor) {
          return function (config) {
              return function (fs) {
                  var as = Data_Array.concat(Data_Array.fromFoldable(Data_List_Types.foldableList)(Data_Functor.map(Data_List_Types.functorList)(Data_Array.fromFoldable(dictFoldable))(Data_Map_Internal.values(fs))));
                  return Genetics_Browser.trackLegend(Data_Foldable.foldableArray)(Data_Functor.functorArray)(annotationLegendEntry(config))(as);
              };
          };
      };
  };
  var renderAnnotationPeaks = function (cSys) {
      return function (vScale) {
          return function (conf) {
              return function (annoPks) {
                  return function (cdim) {
                      var tailPixels = 6.0e-2 * cdim.height;
                      var drawingCovers = function (aPeak) {
                          var gH = 11.0 - 6.5;
                          var h = tailPixels + gH * Data_Foldable.length(Data_Foldable.foldableArray)(Data_Semiring.semiringNumber)(aPeak.elements);
                          var y = aPeak.y - h;
                          return {
                              x: aPeak.covers.value0,
                              y: y,
                              width: 14.0,
                              height: h
                          };
                      };
                      var drawAndLabel = function (aPeak) {
                          var x = aPeak.covers.value0 + 0.5 * (aPeak.covers.value1 - aPeak.covers.value0);
                          var tail = (function () {
                              var $113 = Data_Array["null"](aPeak.elements);
                              if ($113) {
                                  return Data_Monoid.mempty(Graphics_Drawing.monoidDrawing);
                              };
                              return Graphics_Drawing.outlined(Data_Semigroup.append(Graphics_Drawing.semigroupOutlineStyle)(Graphics_Drawing.lineWidth(1.3))(Graphics_Drawing.outlineColor(Color.black)))(Graphics_Drawing.path(Data_Foldable.foldableArray)([ {
                                  x: 0.0,
                                  y: 0.0
                              }, {
                                  x: 0.0,
                                  y: -tailPixels
                              } ]));
                          })();
                          var icons = Graphics_Drawing.translate(0.0)(-tailPixels)(Data_Foldable.foldr(Data_Foldable.foldableArray)(function (a) {
                              return function (d) {
                                  return Graphics_Drawing.translate(0.0)(-6.5)(Data_Semigroup.append(Graphics_Drawing.semigroupDrawing)((annotationLegendEntry(conf)(a)).icon)(d));
                              };
                          })(Data_Monoid.mempty(Graphics_Drawing.monoidDrawing))(aPeak.elements));
                          var labelsHeight = Data_Foldable.length(Data_Foldable.foldableArray)(Data_Semiring.semiringNumber)(aPeak.elements) * 14.0;
                          var drawing = {
                              drawing: Data_Semigroup.append(Graphics_Drawing.semigroupDrawing)(tail)(icons),
                              points: [ {
                                  x: x,
                                  y: aPeak.y
                              } ]
                          };
                          var dC = drawingCovers(aPeak);
                          var v = (function () {
                              var $114 = dC.y > labelsHeight;
                              if ($114) {
                                  return {
                                      g: Genetics_Browser_Canvas.LCenter.value,
                                      y0: dC.y
                                  };
                              };
                              return {
                                  g: Genetics_Browser_Canvas.LLeft.value,
                                  y0: aPeak.y
                              };
                          })();
                          var f = function (a) {
                              return function (v1) {
                                  return Data_Tuple.Tuple.create(v1.value0 - 8.0)(Data_Array.snoc(v1.value1)({
                                      text: Data_Maybe.fromMaybe(a.feature.name)(a.feature.gene),
                                      point: {
                                          x: x,
                                          y: v1.value0
                                      },
                                      gravity: v.g
                                  }));
                              };
                          };
                          var label = Data_Tuple.snd(Data_Foldable.foldr(Data_Foldable.foldableArray)(f)(new Data_Tuple.Tuple(v.y0, Data_Monoid.mempty(Data_Monoid.monoidArray)))(aPeak.elements));
                          return new Data_Tuple.Tuple([ drawing ], label);
                      };
                      var drawAndLabelAll = function (pks) {
                          return Data_Foldable.foldMap(Data_Map_Internal.foldableMap)(Data_Tuple.monoidTuple(Data_Monoid.monoidArray)(Data_Monoid.monoidArray))(Data_Foldable.foldMap(Data_Foldable.foldableArray)(Data_Tuple.monoidTuple(Data_Monoid.monoidArray)(Data_Monoid.monoidArray))(drawAndLabel))(pks);
                      };
                      var curAnnotPeaks = function (segs) {
                          var f = function (chr) {
                              return function (pks) {
                                  return Data_Maybe.fromMaybe([  ])(Control_Bind.bind(Data_Maybe.bindMaybe)(Data_Functor.map(Data_Maybe.functorMaybe)(function ($161) {
                                      return Data_Newtype.wrap(Genetics_Browser_Types.newtypeBp)(Data_BigInt.toNumber(Genetics_Browser_Coordinates.pairSize(Data_BigInt.ringBigInt)($161)));
                                  })(Data_Map_Internal.lookup(Genetics_Browser_Types.ordChrId)(chr)(Data_Lens_Getter.viewOn(cSys)(Genetics_Browser_Coordinates._Segments(Data_Lens_Internal_Forget.strongForget)))))(function (v) {
                                      return Control_Bind.bind(Data_Maybe.bindMaybe)(Data_Map_Internal.lookup(Genetics_Browser_Types.ordChrId)(chr)(segs))(function (v1) {
                                          var rescale = function (pk) {
                                              return {
                                                  covers: Data_Functor.map(Data_Pair.functorPair)(function (x) {
                                                      return v1.value0 + Genetics_Browser_Coordinates.pairSize(Data_Ring.ringNumber)(v1) * Data_Newtype.unwrap(Genetics_Browser_Types.newtypeBp)(Data_EuclideanRing.div(Genetics_Browser_Types.euclideanRingBp)(x)(v));
                                                  })(pk.covers),
                                                  y: cdim.height * (1 - normYLogScore(vScale)(pk.y)),
                                                  elements: pk.elements
                                              };
                                          };
                                          return Control_Applicative.pure(Data_Maybe.applicativeMaybe)(Data_Functor.map(Data_Functor.functorArray)(rescale)(pks));
                                      });
                                  }));
                              };
                          };
                          return Data_FunctorWithIndex.mapWithIndex(Data_Map_Internal.functorWithIndexMap)(f)(annoPks);
                      };
                      return function (segs) {
                          var v = drawAndLabelAll(curAnnotPeaks(segs));
                          return {
                              drawings: v.value0,
                              labels: v.value1
                          };
                      };
                  };
              };
          };
      };
  };
  var renderAnnotations = function (cSys) {
      return function (sigSnps) {
          return function (allAnnots) {
              return function (conf) {
                  var annoPeaks = annotationsForScale(cSys)(sigSnps)(allAnnots);
                  return function (seg) {
                      return function (size) {
                          var v = renderAnnotationPeaks(cSys)(conf.threshold)(conf.annotationsConfig)(annoPeaks(seg))(size)(seg);
                          return Data_List.fromFoldable(Data_Foldable.foldableArray)([ Data_Variant.inj()(new Data_Symbol.IsSymbol(function () {
                              return "drawings";
                          }))(Genetics_Browser_Canvas._drawings)(v.drawings), Data_Variant.inj()(new Data_Symbol.IsSymbol(function () {
                              return "labels";
                          }))(Genetics_Browser_Canvas._labels)(v.labels) ]);
                      };
                  };
              };
          };
      };
  };
  var annotationFields = function (dictKeys) {
      return function (dictRowToList) {
          return Record_Extra.keys()(Record_Extra.consKeys(new Data_Symbol.IsSymbol(function () {
              return "chr";
          }))(Record_Extra.consKeys(new Data_Symbol.IsSymbol(function () {
              return "gene";
          }))(Record_Extra.consKeys(new Data_Symbol.IsSymbol(function () {
              return "name";
          }))(Record_Extra.consKeys(new Data_Symbol.IsSymbol(function () {
              return "pos";
          }))(Record_Extra.consKeys(new Data_Symbol.IsSymbol(function () {
              return "url";
          }))(Record_Extra.nilKeys))))))(Data_Unit.unit);
      };
  };
  var parseAnnotationRest = function (a) {
      return Control_Bind.bind(Control_Monad_Except_Trans.bindExceptT(Data_Identity.monadIdentity))(Data_Functor.map(Control_Monad_Except_Trans.functorExceptT(Data_Identity.functorIdentity))(Data_List.fromFoldable(Data_Foldable.foldableArray))(Foreign_Keys.keys(a)))(function (v) {
          var restFields = Data_List.difference(Data_Eq.eqString)(v)(annotationFields(Record_Extra.consKeys(new Data_Symbol.IsSymbol(function () {
              return "chr";
          }))(Record_Extra.consKeys(new Data_Symbol.IsSymbol(function () {
              return "gene";
          }))(Record_Extra.consKeys(new Data_Symbol.IsSymbol(function () {
              return "name";
          }))(Record_Extra.consKeys(new Data_Symbol.IsSymbol(function () {
              return "pos";
          }))(Record_Extra.consKeys(new Data_Symbol.IsSymbol(function () {
              return "url";
          }))(Record_Extra.nilKeys))))))());
          return Data_Traversable["for"](Control_Monad_Except_Trans.applicativeExceptT(Data_Identity.monadIdentity))(Data_List_Types.traversableList)(restFields)(function (field) {
              return Data_Functor.map(Control_Monad_Except_Trans.functorExceptT(Data_Identity.functorIdentity))(function (v1) {
                  return {
                      field: field,
                      value: v1
                  };
              })(Foreign_Index.readProp(field)(a));
          });
      });
  };
  var parseAnnotation = function (cSys) {
      return function (a) {
          return Control_Bind.bind(Control_Monad_Except_Trans.bindExceptT(Data_Identity.monadIdentity))(Simple_JSON["read'"](Simple_JSON.readRecord()(Simple_JSON.readFieldsCons(new Data_Symbol.IsSymbol(function () {
              return "chr";
          }))(Simple_JSON.readString)(Simple_JSON.readFieldsCons(new Data_Symbol.IsSymbol(function () {
              return "gene";
          }))(Simple_JSON.readMaybe(Simple_JSON.readString))(Simple_JSON.readFieldsCons(new Data_Symbol.IsSymbol(function () {
              return "name";
          }))(Simple_JSON.readString)(Simple_JSON.readFieldsCons(new Data_Symbol.IsSymbol(function () {
              return "pos";
          }))(Simple_JSON.readNumber)(Simple_JSON.readFieldsCons(new Data_Symbol.IsSymbol(function () {
              return "url";
          }))(Simple_JSON.readMaybe(Simple_JSON.readString))(Simple_JSON.readFieldsNil)()())()())()())()())()()))(a))(function (v) {
              return Control_Bind.bind(Control_Monad_Except_Trans.bindExceptT(Data_Identity.monadIdentity))(parseAnnotationRest(a))(function (v1) {
                  var feature = Record_Builder.build(Control_Semigroupoid.composeFlipped(Record_Builder.semigroupoidBuilder)(Record_Builder.insert()()(new Data_Symbol.IsSymbol(function () {
                      return "rest";
                  }))(Data_Symbol.SProxy.value)(v1))(Control_Semigroupoid.composeFlipped(Record_Builder.semigroupoidBuilder)(Record_Builder.modify()()(new Data_Symbol.IsSymbol(function () {
                      return "chr";
                  }))(Data_Symbol.SProxy.value)(Genetics_Browser_Types.ChrId))(Record_Builder.modify()()(new Data_Symbol.IsSymbol(function () {
                      return "pos";
                  }))(Data_Symbol.SProxy.value)(Genetics_Browser_Types.Bp))))(v);
                  var position = (function (p) {
                      return new Data_Pair.Pair(p, p);
                  })(feature.pos);
                  return Control_Bind.bind(Control_Monad_Except_Trans.bindExceptT(Data_Identity.monadIdentity))((function () {
                      var v2 = Data_Map_Internal.lookup(Genetics_Browser_Types.ordChrId)(feature.chr)(Data_Lens_Getter.view(Genetics_Browser_Coordinates._Segments(Data_Lens_Internal_Forget.strongForget))(cSys));
                      if (v2 instanceof Data_Maybe.Nothing) {
                          return Control_Monad_Error_Class.throwError(Control_Monad_Except_Trans.monadThrowExceptT(Data_Identity.monadIdentity))(Control_Applicative.pure(Data_List_Types.applicativeNonEmptyList)(new Foreign.ForeignError("Annotation chr not found in coordinate system!")));
                      };
                      if (v2 instanceof Data_Maybe.Just) {
                          return Control_Applicative.pure(Control_Monad_Except_Trans.applicativeExceptT(Data_Identity.monadIdentity))(Genetics_Browser_Types.Bp(Data_BigInt.toNumber(Genetics_Browser_Coordinates.pairSize(Data_BigInt.ringBigInt)(v2.value0))));
                      };
                      throw new Error("Failed pattern match at Genetics.Browser.Demo line 232, column 16 - line 239, column 49: " + [ v2.constructor.name ]);
                  })())(function (v2) {
                      return Control_Applicative.pure(Control_Monad_Except_Trans.applicativeExceptT(Data_Identity.monadIdentity))({
                          position: position,
                          frameSize: v2,
                          feature: feature
                      });
                  });
              });
          });
      };
  };
  var getAnnotations = function (cs) {
      return function (url) {
          return Control_Bind.bind(Effect_Aff.bindAff)(Network_HTTP_Affjax.get(Network_HTTP_Affjax_Response.json)(url))(function (v) {
              return Control_Bind.bind(Effect_Aff.bindAff)((function () {
                  var v1 = Control_Monad_Except.runExcept(Foreign.readArray(v.response));
                  if (v1 instanceof Data_Either.Left) {
                      return Control_Monad_Error_Class.throwError(Effect_Aff.monadThrowAff)(Effect_Exception.error("Annotations data is not an array"));
                  };
                  if (v1 instanceof Data_Either.Right) {
                      return Control_Applicative.pure(Effect_Aff.applicativeAff)(v1.value0);
                  };
                  throw new Error("Failed pattern match at Genetics.Browser.Demo line 299, column 16 - line 302, column 37: " + [ v1.constructor.name ]);
              })())(function (v1) {
                  var parsed = Data_Filterable.partitionMap(Data_Filterable.filterableArray)(function ($162) {
                      return Control_Monad_Except.runExcept(parseAnnotation(cs)($162));
                  })(v1);
                  return Control_Bind.discard(Control_Bind.discardUnit)(Effect_Aff.bindAff)(Effect_Class.liftEffect(Effect_Aff.monadEffectAff)(function __do() {
                      Effect_Console.log("Raw annotations array length: " + Data_Show.show(Data_Show.showInt)(Data_Array.length(v1)))();
                      Effect_Console.log("Could not parse " + (Data_Show.show(Data_Show.showInt)(Data_Foldable.length(Data_Foldable.foldableArray)(Data_Semiring.semiringInt)(parsed.left)) + " annotations."))();
                      Effect_Console.log("Successfully parsed " + (Data_Show.show(Data_Show.showInt)(Data_Foldable.length(Data_Foldable.foldableArray)(Data_Semiring.semiringInt)(parsed.right)) + " annotations."))();
                      return Effect_Console.log(parsed.right)();
                  }))(function () {
                      return Control_Bind.discard(Control_Bind.discardUnit)(Effect_Aff.bindAff)((function () {
                          var v2 = Data_Array.head(parsed.right);
                          if (v2 instanceof Data_Maybe.Nothing) {
                              return Control_Applicative.pure(Effect_Aff.applicativeAff)(Data_Unit.unit);
                          };
                          if (v2 instanceof Data_Maybe.Just) {
                              return Effect_Class.liftEffect(Effect_Aff.monadEffectAff)(function __do() {
                                  Effect_Console.log("first annotation: ")();
                                  return Data_Foldable.sequence_(Effect.applicativeEffect)(Data_List_Types.foldableList)(Data_Functor.map(Data_List_Types.functorList)(Effect_Console.log)(Data_Functor.map(Data_List_Types.functorList)(function (v3) {
                                      return "> " + v3;
                                  })(showAnnotation(v2.value0))))();
                              });
                          };
                          throw new Error("Failed pattern match at Genetics.Browser.Demo line 320, column 3 - line 324, column 62: " + [ v2.constructor.name ]);
                      })())(function () {
                          return Control_Applicative.pure(Effect_Aff.applicativeAff)(Genetics_Browser.groupToMap(Data_Monoid.monoidArray)(Genetics_Browser_Types.ordChrId)(Data_Foldable.foldableArray)(Control_Applicative.applicativeArray)(function (v2) {
                              return v2.feature.chr;
                          })(parsed.right));
                      });
                  });
              });
          });
      };
  };
  var _snps = Data_Symbol.SProxy.value;
  var _annotations = Data_Symbol.SProxy.value;
  var addDemoLayers = function (cSys) {
      return function (config) {
          return function (trackData) {
              var vscale = Record_Builder.build(Record_Builder.merge()()(config.vscale))(config.score);
              var sigSnps = filterSig(config.score)(trackData.snps);
              var legend = Record.insert(new Data_Symbol.IsSymbol(function () {
                  return "entries";
              }))()()(Data_Symbol.SProxy.value)(annotationLegendTest(Data_Foldable.foldableArray)(Data_Functor.functorArray)(config.annotationsConfig)(trackData.annotations))(config.legend);
              var conf = {
                  segmentPadding: 12.0
              };
              var snpLayer = Genetics_Browser.renderHotspots(new Data_Symbol.IsSymbol(function () {
                  return "snps";
              }))()(conf)(cSys)(_snps)(Genetics_Browser_Layer.Padded.create(5.0)(renderSNPs(trackData.snps)));
              var bgLayer = Genetics_Browser.renderTrack(new Data_Symbol.IsSymbol(function () {
                  return "config";
              }))()(conf)(cSys)(Data_Symbol.SProxy.value)(Genetics_Browser_Layer.Padded.create(5.0)(Genetics_Browser.chrBackgroundLayer));
              var annotationLayer = Genetics_Browser.renderTrack(new Data_Symbol.IsSymbol(function () {
                  return "annotations";
              }))()(conf)(cSys)(_annotations)(Genetics_Browser_Layer.Padded.create(5.0)(renderAnnotations(cSys)(sigSnps)(trackData.annotations)));
              return function (bc) {
                  return function __do() {
                      var v = Genetics_Browser_Canvas.getDimensions(Effect_Class.monadEffectEffect)(bc)();
                      var v1 = Genetics_Browser_Canvas.createAndAddLayer_(Effect_Class.monadEffectEffect)(bc)("chrBackground")(bgLayer)();
                      var v2 = Genetics_Browser_Canvas.createAndAddLayer_(Effect_Class.monadEffectEffect)(bc)("ruler")(new Genetics_Browser_Layer.Layer(Genetics_Browser_Layer.Fixed.value, Genetics_Browser_Layer.NoMask.value, Genetics_Browser_Layer.Padded.create(5.0)(Genetics_Browser.thresholdRuler)))();
                      var v3 = Genetics_Browser_Canvas.createAndAddLayer(Effect_Class.monadEffectEffect)(bc)("snps")(snpLayer)();
                      var v4 = Genetics_Browser_Canvas.createAndAddLayer_(Effect_Class.monadEffectEffect)(bc)("annotations")(annotationLayer)();
                      var v5 = Genetics_Browser_Canvas.createAndAddLayer_(Effect_Class.monadEffectEffect)(bc)("vscale")(snpsUI(vscale))();
                      var v6 = Genetics_Browser_Canvas.createAndAddLayer_(Effect_Class.monadEffectEffect)(bc)("legend")(annotationsUI(legend))();
                      var v7 = Genetics_Browser_Canvas.createAndAddLayer_(Effect_Class.monadEffectEffect)(bc)("chrLabels")(Genetics_Browser.chrLabels({
                          segmentPadding: 12.0,
                          fontSize: config.chrLabels.fontSize
                      })(cSys))();
                      var snps = function (o) {
                          return function (v8) {
                              return function __do() {
                                  var v9 = v3.render({
                                      snps: {
                                          threshold: config.score,
                                          snpsConfig: config.snpsConfig
                                      },
                                      view: v8
                                  })();
                                  return v3.drawOnCanvas(o)(v9)();
                              };
                          };
                      };
                      var fixedUI = function __do() {
                          Control_Bind.bind(Effect.bindEffect)(v5.render(Data_Unit.unit))(v5.drawOnCanvas(new Data_Pair.Pair(0.0, 0.0)))();
                          Control_Bind.bind(Effect.bindEffect)(v6.render(Data_Unit.unit))(v6.drawOnCanvas(new Data_Pair.Pair(0.0, 0.0)))();
                          return Control_Bind.bind(Effect.bindEffect)(v2.render({
                              rulerColor: Data_Newtype.wrap(Genetics_Browser.newtypeHexColor)(Color_Scheme_Clrs.red),
                              threshold: config.score
                          }))(v2.drawOnCanvas(new Data_Pair.Pair(0.0, 0.0)))();
                      };
                      var chrs = function (o) {
                          return function (v8) {
                              return function __do() {
                                  Control_Bind.bind(Effect.bindEffect)(v1.render({
                                      config: {
                                          bg1: Color.white,
                                          bg2: Color_Scheme_X11.lightgray,
                                          segmentPadding: 12.0
                                      },
                                      view: v8
                                  }))(v1.drawOnCanvas(o))();
                                  return Control_Bind.bind(Effect.bindEffect)(v7.render({
                                      view: v8
                                  }))(v7.drawOnCanvas(o))();
                              };
                          };
                      };
                      var annotations = function (o) {
                          return function (v8) {
                              return Control_Bind.bind(Effect.bindEffect)(v4.render({
                                  annotations: {
                                      threshold: config.score,
                                      annotationsConfig: config.annotationsConfig
                                  },
                                  view: v8
                              }))(v4.drawOnCanvas(o));
                          };
                      };
                      return {
                          snps: snps,
                          annotations: annotations,
                          hotspots: v3.lastHotspots,
                          fixedUI: fixedUI,
                          chrs: chrs
                      };
                  };
              };
          };
      };
  };
  exports["bedToFeature"] = bedToFeature;
  exports["getGenes"] = getGenes;
  exports["parseSNP"] = parseSNP;
  exports["annotationFields"] = annotationFields;
  exports["parseAnnotation"] = parseAnnotation;
  exports["parseAnnotationRest"] = parseAnnotationRest;
  exports["showAnnotationField"] = showAnnotationField;
  exports["showAnnotation"] = showAnnotation;
  exports["getSNPs"] = getSNPs;
  exports["getAnnotations"] = getAnnotations;
  exports["peak1"] = peak1;
  exports["peaks"] = peaks;
  exports["annotationLegendEntry"] = annotationLegendEntry;
  exports["annotationLegendTest"] = annotationLegendTest;
  exports["normYLogScore"] = normYLogScore;
  exports["dist"] = dist;
  exports["filterSig"] = filterSig;
  exports["snpsUI"] = snpsUI;
  exports["annotationsUI"] = annotationsUI;
  exports["renderSNPs"] = renderSNPs;
  exports["annotationsForScale"] = annotationsForScale;
  exports["renderAnnotationPeaks"] = renderAnnotationPeaks;
  exports["renderAnnotations"] = renderAnnotations;
  exports["_snps"] = _snps;
  exports["_annotations"] = _annotations;
  exports["addDemoLayers"] = addDemoLayers;
})(PS["Genetics.Browser.Demo"] = PS["Genetics.Browser.Demo"] || {});
(function(exports) {
    "use strict";

  exports.buttonEvent = function(id) {
    return function(cb) {
      return function() {
        var el = document.getElementById(id);
        el.addEventListener('click', function(ev) {
          cb();
        });
      }
    };
  };


  exports.keydownEvent = function(el) {
    return function(cb) {
      return function() {
        window.addEventListener('keydown', function(ev) {
          cb(ev)();
        });
      }
    };
  };


  exports.resizeEvent = function(cb) {
      return function() {
          var resizeDelay = 250; // ms delay before running resize logic
          var resizeTimeout = null;

          var throttled = function() {
              if (resizeTimeout) {
                  clearTimeout(resizeTimeout);
              }

              resizeTimeout = setTimeout(function() {
                  resizeTimeout = null;
                  cb(exports.windowInnerSize())();
                  }, resizeDelay);
          };

          window.addEventListener('resize', throttled, false);
      };
  };


  exports.onTimeout = function(delay) {
      return function(cb) {
          return function() {
              var timeoutRef = null;

              var throttled = function() {
                  if (timeoutRef) {
                      clearTimeout(timeoutRef);
                  }

                  timeoutRef = setTimeout(function() {
                      timeoutRef = null;
                      cb();
                  }, delay);
              };

              return { run: throttled,
                       cancel: function() { clearTimeout(timeoutRef) } };
          };
      };
  };


  exports.windowInnerSize = function() {
      var w = window.innerWidth;
      var h = window.innerHeight;
      return { width: w, height: h };
  };

  exports.setWindow = function(k) {
      return function(v) {
          return function() {
              window[k] = v;
          };
      };
  };

  exports.setElementContents = function(el) {
      return function(html) {
          return function() {
              el.innerHTML = html;
          };
      };
  };


  var debugDivId = "debugDiv";

  exports.initDebugDiv = function(radius) {
      return function() {
          var view = document.getElementById("browser");
          var div = document.getElementById(debugDivId);
          if (!div) {
              div = document.createElement("div");
              view.appendChild(div);
          }
          div.id = debugDivId;

          div.style['position'] = "relative";
          div.style['left'] = "0.0";
          div.style['top']  = "0.0";
          div.style['border-radius'] = "50%";
          div.style['width']         = (radius * 2.0) + "px";
          div.style['height']        = (radius * 2.0) + "px";
          div.style['z-index']       = "100";
          div.style['backgroundColor'] = "red";
          div.style['pointer-events'] = "none";
          div.style['display'] = "inline-block";
          div.style['visibility'] = "hidden";
          div.dataset.radius = radius;
          return div;
      };
  };

  var getDebugDiv = function() {
      var div = document.getElementById(debugDivId);
      if (!div) {
          return initDebugDiv(10.0)();
      } else {
          return div;
      }
  };

  exports.setDebugDivVisibility = function(s) {
      return function() {
          var div = getDebugDiv();
          div.style['visibility'] = s;
      };
  };


  exports.setDebugDivPoint = function(p) {
      return function() {
          var div = getDebugDiv();
          var r = div.dataset.radius | 1.0;
          var x = p.x - r;
          var y = p.y - r * 2.0;
          // var y = p.y;
          div.style['left'] = x + "px";
          div.style['top']  = y + "px";
      };
  };
})(PS["Genetics.Browser.UI"] = PS["Genetics.Browser.UI"] || {});
(function(exports) {
  /* global window */
  "use strict";

  exports.window = function () {
    return window;
  };
})(PS["Web.HTML"] = PS["Web.HTML"] || {});
(function(exports) {
  // Generated by purs version 0.12.0
  "use strict";
  var $foreign = PS["Web.HTML.HTMLDocument"];
  var Control_Semigroupoid = PS["Control.Semigroupoid"];
  var Data_Functor = PS["Data.Functor"];
  var Data_Maybe = PS["Data.Maybe"];
  var Data_Nullable = PS["Data.Nullable"];
  var Effect = PS["Effect"];
  var Prelude = PS["Prelude"];
  var Unsafe_Coerce = PS["Unsafe.Coerce"];
  var Web_DOM_Document = PS["Web.DOM.Document"];
  var Web_DOM_Internal_Types = PS["Web.DOM.Internal.Types"];
  var Web_DOM_NonElementParentNode = PS["Web.DOM.NonElementParentNode"];
  var Web_DOM_ParentNode = PS["Web.DOM.ParentNode"];
  var Web_Event_EventTarget = PS["Web.Event.EventTarget"];
  var Web_HTML_HTMLDocument_ReadyState = PS["Web.HTML.HTMLDocument.ReadyState"];
  var Web_HTML_HTMLElement = PS["Web.HTML.HTMLElement"];
  var Web_Internal_FFI = PS["Web.Internal.FFI"]; 
  var toDocument = Unsafe_Coerce.unsafeCoerce;
  exports["toDocument"] = toDocument;
})(PS["Web.HTML.HTMLDocument"] = PS["Web.HTML.HTMLDocument"] || {});
(function(exports) {
    "use strict";

  exports.document = function (window) {
    return function () {
      return window.document;
    };
  };
})(PS["Web.HTML.Window"] = PS["Web.HTML.Window"] || {});
(function(exports) {
  // Generated by purs version 0.12.0
  "use strict";
  var $foreign = PS["Web.HTML.Window"];
  var Control_Semigroupoid = PS["Control.Semigroupoid"];
  var Data_Eq = PS["Data.Eq"];
  var Data_Functor = PS["Data.Functor"];
  var Data_Maybe = PS["Data.Maybe"];
  var Data_Newtype = PS["Data.Newtype"];
  var Data_Nullable = PS["Data.Nullable"];
  var Data_Ord = PS["Data.Ord"];
  var Effect = PS["Effect"];
  var Prelude = PS["Prelude"];
  var Unsafe_Coerce = PS["Unsafe.Coerce"];
  var Web_Event_EventTarget = PS["Web.Event.EventTarget"];
  var Web_HTML_HTMLDocument = PS["Web.HTML.HTMLDocument"];
  var Web_HTML_History = PS["Web.HTML.History"];
  var Web_HTML_Location = PS["Web.HTML.Location"];
  var Web_HTML_Navigator = PS["Web.HTML.Navigator"];
  var Web_Storage_Storage = PS["Web.Storage.Storage"];
  exports["document"] = $foreign.document;
})(PS["Web.HTML.Window"] = PS["Web.HTML.Window"] || {});
(function(exports) {
  // Generated by purs version 0.12.0
  "use strict";
  var $foreign = PS["Web.HTML"];
  var Effect = PS["Effect"];
  var Web_HTML_HTMLAnchorElement = PS["Web.HTML.HTMLAnchorElement"];
  var Web_HTML_HTMLAreaElement = PS["Web.HTML.HTMLAreaElement"];
  var Web_HTML_HTMLAudioElement = PS["Web.HTML.HTMLAudioElement"];
  var Web_HTML_HTMLBRElement = PS["Web.HTML.HTMLBRElement"];
  var Web_HTML_HTMLBaseElement = PS["Web.HTML.HTMLBaseElement"];
  var Web_HTML_HTMLBodyElement = PS["Web.HTML.HTMLBodyElement"];
  var Web_HTML_HTMLButtonElement = PS["Web.HTML.HTMLButtonElement"];
  var Web_HTML_HTMLCanvasElement = PS["Web.HTML.HTMLCanvasElement"];
  var Web_HTML_HTMLDListElement = PS["Web.HTML.HTMLDListElement"];
  var Web_HTML_HTMLDataElement = PS["Web.HTML.HTMLDataElement"];
  var Web_HTML_HTMLDataListElement = PS["Web.HTML.HTMLDataListElement"];
  var Web_HTML_HTMLDivElement = PS["Web.HTML.HTMLDivElement"];
  var Web_HTML_HTMLDocument = PS["Web.HTML.HTMLDocument"];
  var Web_HTML_HTMLElement = PS["Web.HTML.HTMLElement"];
  var Web_HTML_HTMLEmbedElement = PS["Web.HTML.HTMLEmbedElement"];
  var Web_HTML_HTMLFieldSetElement = PS["Web.HTML.HTMLFieldSetElement"];
  var Web_HTML_HTMLFormElement = PS["Web.HTML.HTMLFormElement"];
  var Web_HTML_HTMLHRElement = PS["Web.HTML.HTMLHRElement"];
  var Web_HTML_HTMLHeadElement = PS["Web.HTML.HTMLHeadElement"];
  var Web_HTML_HTMLHeadingElement = PS["Web.HTML.HTMLHeadingElement"];
  var Web_HTML_HTMLIFrameElement = PS["Web.HTML.HTMLIFrameElement"];
  var Web_HTML_HTMLImageElement = PS["Web.HTML.HTMLImageElement"];
  var Web_HTML_HTMLInputElement = PS["Web.HTML.HTMLInputElement"];
  var Web_HTML_HTMLKeygenElement = PS["Web.HTML.HTMLKeygenElement"];
  var Web_HTML_HTMLLIElement = PS["Web.HTML.HTMLLIElement"];
  var Web_HTML_HTMLLabelElement = PS["Web.HTML.HTMLLabelElement"];
  var Web_HTML_HTMLLegendElement = PS["Web.HTML.HTMLLegendElement"];
  var Web_HTML_HTMLLinkElement = PS["Web.HTML.HTMLLinkElement"];
  var Web_HTML_HTMLMapElement = PS["Web.HTML.HTMLMapElement"];
  var Web_HTML_HTMLMediaElement = PS["Web.HTML.HTMLMediaElement"];
  var Web_HTML_HTMLMetaElement = PS["Web.HTML.HTMLMetaElement"];
  var Web_HTML_HTMLMeterElement = PS["Web.HTML.HTMLMeterElement"];
  var Web_HTML_HTMLModElement = PS["Web.HTML.HTMLModElement"];
  var Web_HTML_HTMLOListElement = PS["Web.HTML.HTMLOListElement"];
  var Web_HTML_HTMLObjectElement = PS["Web.HTML.HTMLObjectElement"];
  var Web_HTML_HTMLOptGroupElement = PS["Web.HTML.HTMLOptGroupElement"];
  var Web_HTML_HTMLOptionElement = PS["Web.HTML.HTMLOptionElement"];
  var Web_HTML_HTMLOutputElement = PS["Web.HTML.HTMLOutputElement"];
  var Web_HTML_HTMLParagraphElement = PS["Web.HTML.HTMLParagraphElement"];
  var Web_HTML_HTMLParamElement = PS["Web.HTML.HTMLParamElement"];
  var Web_HTML_HTMLPreElement = PS["Web.HTML.HTMLPreElement"];
  var Web_HTML_HTMLProgressElement = PS["Web.HTML.HTMLProgressElement"];
  var Web_HTML_HTMLQuoteElement = PS["Web.HTML.HTMLQuoteElement"];
  var Web_HTML_HTMLScriptElement = PS["Web.HTML.HTMLScriptElement"];
  var Web_HTML_HTMLSelectElement = PS["Web.HTML.HTMLSelectElement"];
  var Web_HTML_HTMLSourceElement = PS["Web.HTML.HTMLSourceElement"];
  var Web_HTML_HTMLSpanElement = PS["Web.HTML.HTMLSpanElement"];
  var Web_HTML_HTMLStyleElement = PS["Web.HTML.HTMLStyleElement"];
  var Web_HTML_HTMLTableCaptionElement = PS["Web.HTML.HTMLTableCaptionElement"];
  var Web_HTML_HTMLTableCellElement = PS["Web.HTML.HTMLTableCellElement"];
  var Web_HTML_HTMLTableColElement = PS["Web.HTML.HTMLTableColElement"];
  var Web_HTML_HTMLTableDataCellElement = PS["Web.HTML.HTMLTableDataCellElement"];
  var Web_HTML_HTMLTableElement = PS["Web.HTML.HTMLTableElement"];
  var Web_HTML_HTMLTableHeaderCellElement = PS["Web.HTML.HTMLTableHeaderCellElement"];
  var Web_HTML_HTMLTableRowElement = PS["Web.HTML.HTMLTableRowElement"];
  var Web_HTML_HTMLTableSectionElement = PS["Web.HTML.HTMLTableSectionElement"];
  var Web_HTML_HTMLTemplateElement = PS["Web.HTML.HTMLTemplateElement"];
  var Web_HTML_HTMLTextAreaElement = PS["Web.HTML.HTMLTextAreaElement"];
  var Web_HTML_HTMLTimeElement = PS["Web.HTML.HTMLTimeElement"];
  var Web_HTML_HTMLTitleElement = PS["Web.HTML.HTMLTitleElement"];
  var Web_HTML_HTMLTrackElement = PS["Web.HTML.HTMLTrackElement"];
  var Web_HTML_HTMLUListElement = PS["Web.HTML.HTMLUListElement"];
  var Web_HTML_HTMLVideoElement = PS["Web.HTML.HTMLVideoElement"];
  var Web_HTML_History = PS["Web.HTML.History"];
  var Web_HTML_Location = PS["Web.HTML.Location"];
  var Web_HTML_Navigator = PS["Web.HTML.Navigator"];
  var Web_HTML_Window = PS["Web.HTML.Window"];
  exports["window"] = $foreign.window;
})(PS["Web.HTML"] = PS["Web.HTML"] || {});
(function(exports) {
    "use strict";

  exports.key = function (e) {
    return e.key;
  };
})(PS["Web.UIEvent.KeyboardEvent"] = PS["Web.UIEvent.KeyboardEvent"] || {});
(function(exports) {
  // Generated by purs version 0.12.0
  "use strict";
  var $foreign = PS["Web.UIEvent.KeyboardEvent"];
  var Control_Semigroupoid = PS["Control.Semigroupoid"];
  var Data_Bounded = PS["Data.Bounded"];
  var Data_Enum = PS["Data.Enum"];
  var Data_Eq = PS["Data.Eq"];
  var Data_Maybe = PS["Data.Maybe"];
  var Data_Ord = PS["Data.Ord"];
  var Data_Ordering = PS["Data.Ordering"];
  var Effect = PS["Effect"];
  var Prelude = PS["Prelude"];
  var Unsafe_Coerce = PS["Unsafe.Coerce"];
  var Web_Event_Event = PS["Web.Event.Event"];
  var Web_Internal_FFI = PS["Web.Internal.FFI"];
  var Web_UIEvent_UIEvent = PS["Web.UIEvent.UIEvent"];
  exports["key"] = $foreign.key;
})(PS["Web.UIEvent.KeyboardEvent"] = PS["Web.UIEvent.KeyboardEvent"] || {});
(function(exports) {
  // Generated by purs version 0.12.0
  "use strict";
  var $foreign = PS["Genetics.Browser.UI"];
  var Control_Applicative = PS["Control.Applicative"];
  var Control_Apply = PS["Control.Apply"];
  var Control_Bind = PS["Control.Bind"];
  var Control_Category = PS["Control.Category"];
  var Control_Semigroupoid = PS["Control.Semigroupoid"];
  var Data_Array = PS["Data.Array"];
  var Data_Bifunctor = PS["Data.Bifunctor"];
  var Data_BigInt = PS["Data.BigInt"];
  var Data_Either = PS["Data.Either"];
  var Data_EuclideanRing = PS["Data.EuclideanRing"];
  var Data_Filterable = PS["Data.Filterable"];
  var Data_Foldable = PS["Data.Foldable"];
  var Data_Function = PS["Data.Function"];
  var Data_Functor = PS["Data.Functor"];
  var Data_Generic_Rep = PS["Data.Generic.Rep"];
  var Data_Generic_Rep_Show = PS["Data.Generic.Rep.Show"];
  var Data_Int = PS["Data.Int"];
  var Data_Lens = PS["Data.Lens"];
  var Data_Lens_Getter = PS["Data.Lens.Getter"];
  var Data_Lens_Internal_Forget = PS["Data.Lens.Internal.Forget"];
  var Data_Lens_Iso_Newtype = PS["Data.Lens.Iso.Newtype"];
  var Data_List_Types = PS["Data.List.Types"];
  var Data_Map = PS["Data.Map"];
  var Data_Map_Internal = PS["Data.Map.Internal"];
  var Data_Maybe = PS["Data.Maybe"];
  var Data_Monoid = PS["Data.Monoid"];
  var Data_Newtype = PS["Data.Newtype"];
  var Data_Ord = PS["Data.Ord"];
  var Data_Pair = PS["Data.Pair"];
  var Data_Ring = PS["Data.Ring"];
  var Data_Semigroup = PS["Data.Semigroup"];
  var Data_Semiring = PS["Data.Semiring"];
  var Data_Show = PS["Data.Show"];
  var Data_Symbol = PS["Data.Symbol"];
  var Data_Time_Duration = PS["Data.Time.Duration"];
  var Data_Traversable = PS["Data.Traversable"];
  var Data_Tuple = PS["Data.Tuple"];
  var Data_Unit = PS["Data.Unit"];
  var Data_Variant = PS["Data.Variant"];
  var Effect = PS["Effect"];
  var Effect_Aff = PS["Effect.Aff"];
  var Effect_Aff_AVar = PS["Effect.Aff.AVar"];
  var Effect_Class = PS["Effect.Class"];
  var Effect_Console = PS["Effect.Console"];
  var Effect_Exception = PS["Effect.Exception"];
  var Effect_Ref = PS["Effect.Ref"];
  var Foreign = PS["Foreign"];
  var Genetics_Browser = PS["Genetics.Browser"];
  var Genetics_Browser_Canvas = PS["Genetics.Browser.Canvas"];
  var Genetics_Browser_Coordinates = PS["Genetics.Browser.Coordinates"];
  var Genetics_Browser_Demo = PS["Genetics.Browser.Demo"];
  var Genetics_Browser_Layer = PS["Genetics.Browser.Layer"];
  var Genetics_Browser_Types = PS["Genetics.Browser.Types"];
  var Global_Unsafe = PS["Global.Unsafe"];
  var Graphics_Canvas = PS["Graphics.Canvas"];
  var Graphics_Drawing = PS["Graphics.Drawing"];
  var $$Math = PS["Math"];
  var Partial_Unsafe = PS["Partial.Unsafe"];
  var Prelude = PS["Prelude"];
  var Simple_JSON = PS["Simple.JSON"];
  var Unsafe_Coerce = PS["Unsafe.Coerce"];
  var Web_DOM = PS["Web.DOM"];
  var Web_DOM_Document = PS["Web.DOM.Document"];
  var Web_DOM_Element = PS["Web.DOM.Element"];
  var Web_DOM_Node = PS["Web.DOM.Node"];
  var Web_DOM_ParentNode = PS["Web.DOM.ParentNode"];
  var Web_HTML = PS["Web.HTML"];
  var Web_HTML_HTMLDocument = PS["Web.HTML.HTMLDocument"];
  var Web_HTML_Window = PS["Web.HTML.Window"];
  var Web_UIEvent_KeyboardEvent = PS["Web.UIEvent.KeyboardEvent"];                 
  var ScrollView = (function () {
      function ScrollView(value0) {
          this.value0 = value0;
      };
      ScrollView.create = function (value0) {
          return new ScrollView(value0);
      };
      return ScrollView;
  })();
  var ZoomView = (function () {
      function ZoomView(value0) {
          this.value0 = value0;
      };
      ZoomView.create = function (value0) {
          return new ZoomView(value0);
      };
      return ZoomView;
  })();
  var ModView = (function () {
      function ModView(value0) {
          this.value0 = value0;
      };
      ModView.create = function (value0) {
          return new ModView(value0);
      };
      return ModView;
  })();
  var IBoxShow = (function () {
      function IBoxShow() {

      };
      IBoxShow.value = new IBoxShow();
      return IBoxShow;
  })();
  var IBoxHide = (function () {
      function IBoxHide() {

      };
      IBoxHide.value = new IBoxHide();
      return IBoxHide;
  })();
  var IBoxSetY = (function () {
      function IBoxSetY(value0) {
          this.value0 = value0;
      };
      IBoxSetY.create = function (value0) {
          return new IBoxSetY(value0);
      };
      return IBoxSetY;
  })();
  var IBoxSetX = (function () {
      function IBoxSetX(value0) {
          this.value0 = value0;
      };
      IBoxSetX.create = function (value0) {
          return new IBoxSetX(value0);
      };
      return IBoxSetX;
  })();
  var IBoxSetContents = (function () {
      function IBoxSetContents(value0) {
          this.value0 = value0;
      };
      IBoxSetContents.create = function (value0) {
          return new IBoxSetContents(value0);
      };
      return IBoxSetContents;
  })();
  var wrapWith = function (tag) {
      return function (x) {
          return "<" + (tag + (">" + (x + ("</" + (tag + ">")))));
      };
  };
  var updateViewFold = function (uv) {
      return Data_Newtype.over(Genetics_Browser_Coordinates.coordsysviewNewtype)(Genetics_Browser_Coordinates.coordsysviewNewtype)(Genetics_Browser_Coordinates.CoordSysView)((function () {
          if (uv instanceof ZoomView) {
              return function (v) {
                  return Genetics_Browser_Coordinates.scalePairBy(v)(uv.value0);
              };
          };
          if (uv instanceof ScrollView) {
              return function (v) {
                  return Genetics_Browser_Coordinates.translatePairBy(v)(uv.value0);
              };
          };
          if (uv instanceof ModView) {
              return uv.value0;
          };
          throw new Error("Failed pattern match at Genetics.Browser.UI line 202, column 39 - line 205, column 20: " + [ uv.constructor.name ]);
      })());
  };
  var updateInfoBox = function (el) {
      return function (cmd) {
          if (cmd instanceof IBoxShow) {
              return Genetics_Browser_Canvas.setElementStyle(el)("visibility")("visible");
          };
          if (cmd instanceof IBoxHide) {
              return Genetics_Browser_Canvas.setElementStyle(el)("visibility")("hidden");
          };
          if (cmd instanceof IBoxSetX) {
              return Genetics_Browser_Canvas.setElementStyle(el)("left")(Data_Show.show(Data_Show.showInt)(cmd.value0) + "px");
          };
          if (cmd instanceof IBoxSetY) {
              return Genetics_Browser_Canvas.setElementStyle(el)("top")(Data_Show.show(Data_Show.showInt)(cmd.value0) + "px");
          };
          if (cmd instanceof IBoxSetContents) {
              return $foreign.setElementContents(el)(cmd.value0);
          };
          throw new Error("Failed pattern match at Genetics.Browser.UI line 421, column 3 - line 431, column 33: " + [ cmd.constructor.name ]);
      };
  };
  var snpHTML = function (v) {
      var contents = Data_Foldable.foldMap(Data_Foldable.foldableArray)(Data_Monoid.monoidString)(wrapWith("p"))([ "SNP: " + v.feature.name, "Chr: " + Data_Show.show(Genetics_Browser_Types.showChrId)(v.feature.chrId), "Pos: " + Data_Show.show(Genetics_Browser_Types.showBp)(Data_Pair.fst(v.position)), "-log10: " + Data_Lens_Getter.viewOn(v.feature.score)(function ($195) {
          return Genetics_Browser_Types._NegLog10(Data_Lens_Internal_Forget.profunctorForget)(Data_Lens_Iso_Newtype._Newtype(Genetics_Browser_Types.newtypeNegLog10)(Genetics_Browser_Types.newtypeNegLog10)(Data_Lens_Internal_Forget.profunctorForget)(Genetics_Browser_Types._prec(4)($195)));
      }) ]);
      return wrapWith("div")(contents);
  };
  var showUpdateView = new Data_Show.Show(function (v) {
      if (v instanceof ScrollView) {
          return "(Scroll by " + (Data_Show.show(Data_Show.showNumber)(v.value0) + ")");
      };
      if (v instanceof ZoomView) {
          return "(Zoom by " + (Data_Show.show(Data_Show.showNumber)(v.value0) + ")");
      };
      return "(ModView)";
  });
  var semigroupUpdateView = new Data_Semigroup.Semigroup(function (v) {
      return function (v1) {
          if (v instanceof ScrollView && v1 instanceof ScrollView) {
              return new ScrollView(v.value0 + v1.value0);
          };
          if (v instanceof ZoomView && v1 instanceof ZoomView) {
              return new ZoomView(v.value0 * v1.value0);
          };
          return v1;
      };
  });
  var queueCmd = function (av) {
      return function (cmd) {
          return Effect_Aff.launchAff_(Effect_Aff_AVar.put(cmd)(av));
      };
  };
  var printSNPInfo = function (fs) {
      var n = Data_Foldable.length(Data_Foldable.foldableArray)(Data_Semiring.semiringInt)(fs);
      return function __do() {
          Effect_Console.log("showing " + (Data_Show.show(Data_Show.showInt)(5) + (" out of " + (Data_Show.show(Data_Show.showInt)(n) + " clicked glyphs"))))();
          return Data_Foldable.for_(Effect.applicativeEffect)(Data_Foldable.foldableArray)(Data_Array.take(5)(fs))(function ($196) {
              return Effect_Console.log($196);
          })();
      };
  };
  var peakHTML = function (disp) {
      return function (peak) {
          var v = Data_Array.uncons(peak.elements);
          if (v instanceof Data_Maybe.Nothing) {
              return "";
          };
          if (v instanceof Data_Maybe.Just && v.value0.tail.length === 0) {
              return disp(v.value0.head);
          };
          if (v instanceof Data_Maybe.Just) {
              return wrapWith("div")(wrapWith("p")(Data_Show.show(Data_Show.showInt)(Data_Foldable.length(Data_Foldable.foldableArray)(Data_Semiring.semiringInt)(v.value0.tail) + 1 | 0) + " annotations"));
          };
          throw new Error("Failed pattern match at Genetics.Browser.UI line 333, column 3 - line 341, column 1: " + [ v.constructor.name ]);
      };
  };
  var mouseChrSizes = Data_Functor.map(Data_Functor.functorArray)(Data_Bifunctor.bimap(Data_Tuple.bifunctorTuple)(Genetics_Browser_Types.ChrId)(function ($197) {
      return Data_Maybe.fromJust()(Data_BigInt.fromString($197));
  }))([ new Data_Tuple.Tuple("1", "195471971"), new Data_Tuple.Tuple("2", "182113224"), new Data_Tuple.Tuple("3", "160039680"), new Data_Tuple.Tuple("4", "156508116"), new Data_Tuple.Tuple("5", "151834684"), new Data_Tuple.Tuple("6", "149736546"), new Data_Tuple.Tuple("7", "145441459"), new Data_Tuple.Tuple("8", "129401213"), new Data_Tuple.Tuple("9", "124595110"), new Data_Tuple.Tuple("10", "130694993"), new Data_Tuple.Tuple("11", "122082543"), new Data_Tuple.Tuple("12", "120129022"), new Data_Tuple.Tuple("13", "120421639"), new Data_Tuple.Tuple("14", "124902244"), new Data_Tuple.Tuple("15", "104043685"), new Data_Tuple.Tuple("16", "98207768"), new Data_Tuple.Tuple("17", "94987271"), new Data_Tuple.Tuple("18", "90702639"), new Data_Tuple.Tuple("19", "61431566") ]);
  var monoidUpdateView = new Data_Monoid.Monoid(function () {
      return semigroupUpdateView;
  }, new ModView(Control_Category.identity(Control_Category.categoryFn)));
  var keyUI = function (el) {
      return function (mods) {
          return function (cb) {
              var f = function (ke) {
                  var v = Web_UIEvent_KeyboardEvent.key(ke);
                  if (v === "ArrowLeft") {
                      return cb(new ScrollView(-mods.scrollMod));
                  };
                  if (v === "ArrowRight") {
                      return cb(new ScrollView(mods.scrollMod));
                  };
                  return Control_Applicative.pure(Effect.applicativeEffect)(Data_Unit.unit);
              };
              return $foreign.keydownEvent(el)(f);
          };
      };
  };
  var infoBoxId = "infoBox";
  var initInfoBox = function __do() {
      var v = Data_Functor.map(Effect.functorEffect)(Web_HTML_HTMLDocument.toDocument)(Control_Bind.bindFlipped(Effect.bindEffect)(Web_HTML_Window.document)(Web_HTML.window))();
      var v1 = Web_DOM_Document.createElement("div")(v)();
      Web_DOM_Element.setId(infoBoxId)(v1)();
      (function __do() {
          var v2 = Web_DOM_Document.documentElement(v)();
          if (v2 instanceof Data_Maybe.Nothing) {
              return Effect_Exception["throw"]("Couldn't find document body!")();
          };
          if (v2 instanceof Data_Maybe.Just) {
              return Data_Functor["void"](Effect.functorEffect)(Web_DOM_Node.appendChild(Web_DOM_Element.toNode(v1))(Web_DOM_Element.toNode(v2.value0)))();
          };
          throw new Error("Failed pattern match at Genetics.Browser.UI line 444, column 31 - line 446, column 84: " + [ v2.constructor.name ]);
      })();
      return updateInfoBox(v1);
  };
  var genericInfoBoxF = new Data_Generic_Rep.Generic(function (x) {
      if (x instanceof IBoxShow) {
          return new Data_Generic_Rep.Inl(Data_Generic_Rep.NoArguments.value);
      };
      if (x instanceof IBoxHide) {
          return new Data_Generic_Rep.Inr(new Data_Generic_Rep.Inl(Data_Generic_Rep.NoArguments.value));
      };
      if (x instanceof IBoxSetY) {
          return new Data_Generic_Rep.Inr(new Data_Generic_Rep.Inr(new Data_Generic_Rep.Inl(x.value0)));
      };
      if (x instanceof IBoxSetX) {
          return new Data_Generic_Rep.Inr(new Data_Generic_Rep.Inr(new Data_Generic_Rep.Inr(new Data_Generic_Rep.Inl(x.value0))));
      };
      if (x instanceof IBoxSetContents) {
          return new Data_Generic_Rep.Inr(new Data_Generic_Rep.Inr(new Data_Generic_Rep.Inr(new Data_Generic_Rep.Inr(x.value0))));
      };
      throw new Error("Failed pattern match at Genetics.Browser.UI line 414, column 8 - line 414, column 54: " + [ x.constructor.name ]);
  }, function (x) {
      if (x instanceof Data_Generic_Rep.Inl) {
          return IBoxShow.value;
      };
      if (x instanceof Data_Generic_Rep.Inr && x.value0 instanceof Data_Generic_Rep.Inl) {
          return IBoxHide.value;
      };
      if (x instanceof Data_Generic_Rep.Inr && (x.value0 instanceof Data_Generic_Rep.Inr && x.value0.value0 instanceof Data_Generic_Rep.Inl)) {
          return new IBoxSetY(x.value0.value0.value0);
      };
      if (x instanceof Data_Generic_Rep.Inr && (x.value0 instanceof Data_Generic_Rep.Inr && (x.value0.value0 instanceof Data_Generic_Rep.Inr && x.value0.value0.value0 instanceof Data_Generic_Rep.Inl))) {
          return new IBoxSetX(x.value0.value0.value0.value0);
      };
      if (x instanceof Data_Generic_Rep.Inr && (x.value0 instanceof Data_Generic_Rep.Inr && (x.value0.value0 instanceof Data_Generic_Rep.Inr && x.value0.value0.value0 instanceof Data_Generic_Rep.Inr))) {
          return new IBoxSetContents(x.value0.value0.value0.value0);
      };
      throw new Error("Failed pattern match at Genetics.Browser.UI line 414, column 8 - line 414, column 54: " + [ x.constructor.name ]);
  });
  var showInfoBoxF = new Data_Show.Show(Data_Generic_Rep_Show.genericShow(genericInfoBoxF)(Data_Generic_Rep_Show.genericShowSum(Data_Generic_Rep_Show.genericShowConstructor(Data_Generic_Rep_Show.genericShowArgsNoArguments)(new Data_Symbol.IsSymbol(function () {
      return "IBoxShow";
  })))(Data_Generic_Rep_Show.genericShowSum(Data_Generic_Rep_Show.genericShowConstructor(Data_Generic_Rep_Show.genericShowArgsNoArguments)(new Data_Symbol.IsSymbol(function () {
      return "IBoxHide";
  })))(Data_Generic_Rep_Show.genericShowSum(Data_Generic_Rep_Show.genericShowConstructor(Data_Generic_Rep_Show.genericShowArgsArgument(Data_Show.showInt))(new Data_Symbol.IsSymbol(function () {
      return "IBoxSetY";
  })))(Data_Generic_Rep_Show.genericShowSum(Data_Generic_Rep_Show.genericShowConstructor(Data_Generic_Rep_Show.genericShowArgsArgument(Data_Show.showInt))(new Data_Symbol.IsSymbol(function () {
      return "IBoxSetX";
  })))(Data_Generic_Rep_Show.genericShowConstructor(Data_Generic_Rep_Show.genericShowArgsArgument(Data_Show.showString))(new Data_Symbol.IsSymbol(function () {
      return "IBoxSetContents";
  }))))))));
  var debugView = function (s) {
      var get = function (name) {
          return Effect_Aff.launchAff_(Control_Bind.bind(Effect_Aff.bindAff)(Effect_Class.liftEffect(Effect_Aff.monadEffectAff)(s.getView))(function (v) {
              return Effect_Class.liftEffect(Effect_Aff.monadEffectAff)(function __do() {
                  Effect_Console.log("CoordSysView: " + Data_Show.show(Data_Pair.showPair(Data_Show.showString))(Data_Functor.map(Data_Pair.functorPair)(Data_BigInt.toString)(Data_Newtype.unwrap(Genetics_Browser_Coordinates.coordsysviewNewtype)(v))))();
                  return $foreign.setWindow(name)((function (v1) {
                      return {
                          l: v1.value0,
                          r: v1.value1
                      };
                  })(Data_Newtype.unwrap(Genetics_Browser_Coordinates.coordsysviewNewtype)(v)))();
              });
          }));
      };
      var set = function (lr) {
          return s.queueUpdateView(ModView.create(Data_Function["const"](Data_Functor.map(Data_Pair.functorPair)(function ($198) {
              return Data_Maybe.fromJust()(Data_BigInt.fromNumber($198));
          })(new Data_Pair.Pair(lr.l, lr.r)))));
      };
      return Control_Applicative.pure(Effect.applicativeEffect)({
          get: get,
          set: set
      });
  };
  var btnUI = function (mods) {
      return function (cb) {
          return function __do() {
              $foreign.buttonEvent("scrollLeft")(cb(new ScrollView(-mods.scrollMod)))();
              $foreign.buttonEvent("scrollRight")(cb(new ScrollView(mods.scrollMod)))();
              $foreign.buttonEvent("zoomOut")(cb(ZoomView.create(1.0 + mods.zoomMod)))();
              return $foreign.buttonEvent("zoomIn")(cb(ZoomView.create(1.0 - mods.zoomMod)))();
          };
      };
  };
  var annotationHTMLShort = function (v) {
      var showOther = function (fv) {
          return fv.field + (": " + fv.value);
      };
      var name$prime = Data_Maybe.fromMaybe(v.feature.name)(v.feature.gene);
      var anchor = (function () {
          if (v.feature.url instanceof Data_Maybe.Nothing) {
              return name$prime;
          };
          if (v.feature.url instanceof Data_Maybe.Just) {
              return "<a target='_blank' href='" + (v.feature.url.value0 + ("'>" + (name$prime + "</a>")));
          };
          throw new Error("Failed pattern match at Genetics.Browser.UI line 394, column 18 - line 400, column 1: " + [ v.feature.url.constructor.name ]);
      })();
      return wrapWith("p")(anchor);
  };
  var annotationHTML = function (disp) {
      return function (v) {
          var url = Data_Maybe.fromMaybe("No URL")(Data_Functor.map(Data_Maybe.functorMaybe)(function (a) {
              return "URL: <a target='_blank' href='" + (a + ("'>" + (a + "</a>")));
          })(v.feature.url));
          var showOther = function (fv) {
              return fv.field + (": " + fv.value);
          };
          var name = Data_Maybe.fromMaybe("Annotated SNP: " + v.feature.name)(Data_Functor.map(Data_Maybe.functorMaybe)(function (v1) {
              return "Gene: " + v1;
          })(v.feature.gene));
          var contents = Data_Foldable.foldMap(Data_Foldable.foldableArray)(Data_Monoid.monoidString)(wrapWith("p"))(Data_Semigroup.append(Data_Semigroup.semigroupArray)([ name, url ])(Data_Filterable.filterMap(Data_Filterable.filterableArray)(disp)(Data_Array.fromFoldable(Data_List_Types.foldableList)(v.feature.rest))));
          return wrapWith("div")(contents);
      };
  };
  var annotationHTMLAll = annotationHTML(function ($199) {
      return Control_Applicative.pure(Data_Maybe.applicativeMaybe)(Genetics_Browser_Demo.showAnnotationField($199));
  });
  var annotationHTMLDefault = annotationHTML(function (x) {
      return Control_Applicative.pure(Data_Maybe.applicativeMaybe)((function () {
          if (x.field === "p_lrt") {
              return "p_lrt: " + Data_Lens_Getter.viewOn(x.value)(function ($200) {
                  return Genetics_Browser_Types._NegLog10(Data_Lens_Internal_Forget.profunctorForget)(Data_Lens_Iso_Newtype._Newtype(Genetics_Browser_Types.newtypeNegLog10)(Genetics_Browser_Types.newtypeNegLog10)(Data_Lens_Internal_Forget.profunctorForget)(Genetics_Browser_Types._prec(4)($200)));
              });
          };
          return Genetics_Browser_Demo.showAnnotationField(x);
      })());
  });
  var annoPeakHTML = function (peak) {
      var v = Data_Array.uncons(peak.elements);
      if (v instanceof Data_Maybe.Nothing) {
          return "";
      };
      if (v instanceof Data_Maybe.Just && v.value0.tail.length === 0) {
          return annotationHTMLAll(v.value0.head);
      };
      if (v instanceof Data_Maybe.Just) {
          return wrapWith("div")(wrapWith("p")("Annotations:") + Data_Foldable.foldMap(Data_Foldable.foldableArray)(Data_Monoid.monoidString)(annotationHTMLShort)(peak.elements));
      };
      throw new Error("Failed pattern match at Genetics.Browser.UI line 345, column 3 - line 350, column 75: " + [ v.constructor.name ]);
  };
  var animateDelta = function (dictMonoid) {
      return function (update) {
          return function (done) {
              return function (refs) {
                  return function (timeout) {
                      return function __do() {
                          var v = $foreign.onTimeout(timeout)(function __do() {
                              var v = Effect_Ref.read(refs.velocity)();
                              Effect_Ref.write(Data_Monoid.mempty(dictMonoid))(refs.velocity)();
                              return Effect_Aff.launchAff_(Effect_Class.liftEffect(Effect_Aff.monadEffectAff)(Control_Bind.bind(Effect.bindEffect)(Effect_Ref.modify(update(v))(refs.current))(done)))();
                          })();
                          return function (cmd) {
                              return function __do() {
                                  Effect_Ref.modify_(function (v1) {
                                      return Data_Semigroup.append(dictMonoid.Semigroup0())(v1)(cmd);
                                  })(refs.velocity)();
                                  return v.run();
                              };
                          };
                      };
                  };
              };
          };
      };
  };
  var _render = Data_Symbol.SProxy.value;
  var uiViewUpdate = function (cs) {
      return function (timeout) {
          return function (v) {
              var update = function (vD) {
                  return function ($201) {
                      return Genetics_Browser_Coordinates.normalizeView(cs)(Data_BigInt.fromInt(200000))(updateViewFold(vD)($201));
                  };
              };
              var done = function (v1) {
                  return Effect_Aff.launchAff_(Effect_Aff_AVar.put(Data_Variant.inj()(new Data_Symbol.IsSymbol(function () {
                      return "render";
                  }))(_render)(Data_Unit.unit))(v.uiCmd));
              };
              return function __do() {
                  var v1 = Effect_Ref["new"](Data_Monoid.mempty(monoidUpdateView))();
                  return animateDelta(monoidUpdateView)(update)(done)({
                      current: v.view,
                      velocity: v1
                  })(timeout)();
              };
          };
      };
  };
  var _docResize = Data_Symbol.SProxy.value;
  var initializeBrowser = function (cSys) {
      return function (renderFuns) {
          return function (initView) {
              return function (bc) {
                  return Control_Bind.bind(Effect_Aff.bindAff)(Effect_Aff_AVar.empty)(function (v) {
                      return Control_Bind.bind(Effect_Aff.bindAff)(Effect_Class.liftEffect(Effect_Aff.monadEffectAff)(Effect_Ref["new"](initView)))(function (v1) {
                          return Control_Bind.bind(Effect_Aff.bindAff)(Effect_Aff_AVar["new"](bc))(function (v2) {
                              return Control_Bind.bind(Effect_Aff.bindAff)(Effect_Aff_AVar.empty)(function (v3) {
                                  return Control_Bind.bind(Effect_Aff.bindAff)(Effect_Aff_AVar.empty)(function (v4) {
                                      var queueCommand = Data_Function.flip(Effect_Aff_AVar.put)(v3);
                                      var getView = Effect_Ref.read(v1);
                                      return Control_Bind.bind(Effect_Aff.bindAff)(Effect_Class.liftEffect(Effect_Aff.monadEffectAff)(uiViewUpdate(cSys)(Data_Newtype.wrap(Data_Time_Duration.newtypeMilliseconds)(30.0))({
                                          view: v1,
                                          uiCmd: v3
                                      })))(function (v5) {
                                          var mainLoop = Control_Bind.bind(Effect_Aff.bindAff)(Effect_Aff_AVar.take(v3))(function (v6) {
                                              return Control_Bind.discard(Control_Bind.discardUnit)(Effect_Aff.bindAff)(Data_Variant.on()(new Data_Symbol.IsSymbol(function () {
                                                  return "docResize";
                                              }))(_docResize)(function (v7) {
                                                  return Control_Bind.bind(Effect_Aff.bindAff)(Data_Functor.map(Effect_Aff.functorAff)(function (v8) {
                                                      return v8.size;
                                                  })(Genetics_Browser_Canvas.getDimensions(Effect_Aff.monadEffectAff)(bc)))(function (v8) {
                                                      return Control_Bind.discard(Control_Bind.discardUnit)(Effect_Aff.bindAff)(Genetics_Browser_Canvas.setBrowserContainerSize(Effect_Aff.monadEffectAff)({
                                                          width: v7.width,
                                                          height: v8.height
                                                      })(bc))(function () {
                                                          return Control_Bind.discard(Control_Bind.discardUnit)(Effect_Aff.bindAff)(queueCommand(Data_Variant.inj()(new Data_Symbol.IsSymbol(function () {
                                                              return "render";
                                                          }))(_render)(Data_Unit.unit)))(function () {
                                                              return mainLoop;
                                                          });
                                                      });
                                                  });
                                              })(Data_Variant.on()(new Data_Symbol.IsSymbol(function () {
                                                  return "render";
                                              }))(_render)(function (v7) {
                                                  return Control_Applicative.pure(Effect_Aff.applicativeAff)(Data_Unit.unit);
                                              })(Data_Variant.case_))(v6))(function () {
                                                  return Control_Bind.discard(Control_Bind.discardUnit)(Effect_Aff.bindAff)(Control_Bind.bindFlipped(Effect_Aff.bindAff)(Data_Foldable.traverse_(Effect_Aff.applicativeAff)(Data_Foldable.foldableMaybe)(Effect_Aff.killFiber(Effect_Exception.error("Resetting renderer"))))(Effect_Aff_AVar.tryTake(v)))(function () {
                                                      return Control_Bind.bind(Effect_Aff.bindAff)(Effect_Class.liftEffect(Effect_Aff.monadEffectAff)(getView))(function (v7) {
                                                          return Control_Bind.bind(Effect_Aff.bindAff)(Genetics_Browser_Canvas.getDimensions(Effect_Aff.monadEffectAff)(bc))(function (v8) {
                                                              var trackDims = (function (v9) {
                                                                  return v9.padded;
                                                              })(Genetics_Browser_Layer.browserSlots(v8));
                                                              var currentScale = Genetics_Browser_Coordinates.viewScale(trackDims.size)(v7);
                                                              var pxView = Data_Functor.map(Data_Pair.functorPair)(Genetics_Browser_Coordinates.scaleToScreen(currentScale))(Data_Newtype.unwrap(Genetics_Browser_Coordinates.coordsysviewNewtype)(v7));
                                                              return Control_Bind.bind(Effect_Aff.bindAff)(Effect_Aff.forkAff(Effect_Class.liftEffect(Effect_Aff.monadEffectAff)(function __do() {
                                                                  renderFuns.chrs(pxView)(v7)();
                                                                  renderFuns.annotations(pxView)(v7)();
                                                                  renderFuns.snps(pxView)(v7)();
                                                                  return renderFuns.fixedUI();
                                                              })))(function (v9) {
                                                                  return Control_Bind.discard(Control_Bind.discardUnit)(Effect_Aff.bindAff)(Effect_Aff_AVar.put(v9)(v))(function () {
                                                                      return mainLoop;
                                                                  });
                                                              });
                                                          });
                                                      });
                                                  });
                                              });
                                          });
                                          return Control_Bind.bind(Effect_Aff.bindAff)(Effect_Aff.forkAff(mainLoop))(function (v6) {
                                              return Control_Bind.discard(Control_Bind.discardUnit)(Effect_Aff.bindAff)(queueCommand(Data_Variant.inj()(new Data_Symbol.IsSymbol(function () {
                                                  return "render";
                                              }))(_render)(Data_Unit.unit)))(function () {
                                                  return Control_Applicative.pure(Effect_Aff.applicativeAff)({
                                                      getView: getView,
                                                      container: bc,
                                                      lastHotspots: renderFuns.hotspots,
                                                      queueCommand: queueCommand,
                                                      queueUpdateView: v5
                                                  });
                                              });
                                          });
                                      });
                                  });
                              });
                          });
                      });
                  });
              };
          };
      };
  };
  var runBrowser = function (config) {
      return function (bc) {
          return Effect_Aff.launchAff((function () {
              var cSys = Genetics_Browser_Coordinates.coordSys(Genetics_Browser_Types.ordChrId)(Data_BigInt.semiringBigInt)(mouseChrSizes);
              var initialView = Data_Maybe.fromMaybe(Data_Newtype.wrap(Genetics_Browser_Coordinates.coordsysviewNewtype)(new Data_Pair.Pair(Data_Semiring.zero(Data_BigInt.semiringBigInt), Data_Lens_Getter.viewOn(cSys)(Genetics_Browser_Coordinates._TotalSize(Data_BigInt.ringBigInt)))))(Control_Bind.bind(Data_Maybe.bindMaybe)(config.initialChrs)(function (v) {
                  return Control_Bind.bind(Data_Maybe.bindMaybe)(Data_Map_Internal.lookup(Genetics_Browser_Types.ordChrId)(Data_Newtype.wrap(Genetics_Browser_Types.newtypeChrId)(v.left))(Data_Lens_Getter.viewOn(cSys)(Genetics_Browser_Coordinates._Segments(Data_Lens_Internal_Forget.strongForget))))(function (v1) {
                      return Control_Bind.bind(Data_Maybe.bindMaybe)(Data_Map_Internal.lookup(Genetics_Browser_Types.ordChrId)(Data_Newtype.wrap(Genetics_Browser_Types.newtypeChrId)(v.right))(Data_Lens_Getter.viewOn(cSys)(Genetics_Browser_Coordinates._Segments(Data_Lens_Internal_Forget.strongForget))))(function (v2) {
                          return Control_Applicative.pure(Data_Maybe.applicativeMaybe)(Data_Newtype.wrap(Genetics_Browser_Coordinates.coordsysviewNewtype)(new Data_Pair.Pair(v1.value0, v2.value1)));
                      });
                  });
              }));
              return Control_Bind.discard(Control_Bind.discardUnit)(Effect_Aff.bindAff)(Effect_Class.liftEffect(Effect_Aff.monadEffectAff)($foreign.initDebugDiv(1.0)))(function () {
                  return Control_Bind.bind(Effect_Aff.bindAff)(Effect_Class.liftEffect(Effect_Aff.monadEffectAff)(initInfoBox))(function (v) {
                      return Control_Bind.bind(Effect_Aff.bindAff)(Control_Apply.apply(Effect_Aff.applyAff)(Control_Apply.apply(Effect_Aff.applyAff)(Data_Functor.map(Effect_Aff.functorAff)(function (v1) {
                          return function (v2) {
                              return function (v3) {
                                  return {
                                      genes: v1,
                                      snps: v2,
                                      annotations: v3
                                  };
                              };
                          };
                      })(Data_Foldable.foldMap(Data_Foldable.foldableMaybe)(Effect_Aff.monoidAff(Data_Map_Internal.monoidMap(Genetics_Browser_Types.ordChrId)))(Genetics_Browser_Demo.getGenes(cSys))(config.urls.genes)))(Data_Foldable.foldMap(Data_Foldable.foldableMaybe)(Effect_Aff.monoidAff(Data_Map_Internal.monoidMap(Genetics_Browser_Types.ordChrId)))(Genetics_Browser_Demo.getSNPs(cSys))(config.urls.snps)))(Data_Foldable.foldMap(Data_Foldable.foldableMaybe)(Effect_Aff.monoidAff(Data_Map_Internal.monoidMap(Genetics_Browser_Types.ordChrId)))(Genetics_Browser_Demo.getAnnotations(cSys))(config.urls.annotations)))(function (v1) {
                          return Control_Bind.bind(Effect_Aff.bindAff)(Effect_Class.liftEffect(Effect_Aff.monadEffectAff)(Genetics_Browser_Demo.addDemoLayers(cSys)(config)(v1)(bc)))(function (v2) {
                              return Control_Bind.bind(Effect_Aff.bindAff)(initializeBrowser(cSys)(v2)(initialView)(bc))(function (v3) {
                                  return Control_Bind.discard(Control_Bind.discardUnit)(Effect_Aff.bindAff)(Effect_Class.liftEffect(Effect_Aff.monadEffectAff)(function __do() {
                                      $foreign.resizeEvent(function (d) {
                                          return Effect_Aff.launchAff_(v3.queueCommand(Data_Variant.inj()(new Data_Symbol.IsSymbol(function () {
                                              return "docResize";
                                          }))(_docResize)(d)));
                                      })();
                                      var btnMods = {
                                          scrollMod: 0.1,
                                          zoomMod: 0.15
                                      };
                                      btnUI(btnMods)(v3.queueUpdateView)();
                                      $foreign.buttonEvent("reset")(v3.queueUpdateView(new ModView(Data_Function["const"](Data_Newtype.unwrap(Genetics_Browser_Coordinates.coordsysviewNewtype)(initialView)))))();
                                      keyUI(Data_Lens_Getter.viewOn(bc)(Genetics_Browser_Canvas._Container(Data_Lens_Internal_Forget.strongForget)))({
                                          scrollMod: 7.5e-2
                                      })(v3.queueUpdateView)();
                                      Genetics_Browser_Canvas.dragScroll(bc)(function (v4) {
                                          return Control_Applicative.when(Effect.applicativeEffect)($$Math.abs(v4.x) >= 1)(function __do() {
                                              var v5 = Data_Functor.map(Effect.functorEffect)(function ($202) {
                                                  return (function (v5) {
                                                      return v5.padded;
                                                  })(Genetics_Browser_Layer.browserSlots($202));
                                              })(Genetics_Browser_Canvas.getDimensions(Effect_Class.monadEffectEffect)(bc))();
                                              return v3.queueUpdateView(ScrollView.create(-v4.x / v5.size.width))();
                                          });
                                      })();
                                      return Genetics_Browser_Canvas.wheelZoom(bc)(function (dY) {
                                          return v3.queueUpdateView(ZoomView.create(1.0 + 6.0e-2 * dY));
                                      })();
                                  }))(function () {
                                      return Control_Bind.discard(Control_Bind.discardUnit)(Effect_Aff.bindAff)(Effect_Class.liftEffect(Effect_Aff.monadEffectAff)((function () {
                                          var sigSnps = Genetics_Browser_Demo.filterSig(config.score)(v1.snps);
                                          var annotAround = function (pks) {
                                              return function (snp) {
                                                  return Control_Bind.bindFlipped(Data_Maybe.bindMaybe)(Data_Foldable.find(Data_Foldable.foldableArray)(function (a) {
                                                      return Genetics_Browser_Coordinates.pairsOverlap(Genetics_Browser_Types.ordBp)(a.covers)(snp.position);
                                                  }))(Data_Map_Internal.lookup(Genetics_Browser_Types.ordChrId)(snp.feature.chrId)(pks));
                                              };
                                          };
                                          var glyphClick = function (p) {
                                              return Effect_Aff.launchAff_(Control_Bind.bind(Effect_Aff.bindAff)(Effect_Class.liftEffect(Effect_Aff.monadEffectAff)(v3.getView))(function (v4) {
                                                  return Control_Bind.bind(Effect_Aff.bindAff)(Data_Functor.map(Effect_Aff.functorAff)(function ($203) {
                                                      return (function (v6) {
                                                          return v6.padded;
                                                      })(Genetics_Browser_Layer.browserSlots($203));
                                                  })(Genetics_Browser_Canvas.getDimensions(Effect_Aff.monadEffectAff)(bc)))(function (v6) {
                                                      var segs = Genetics_Browser.pixelSegments({
                                                          segmentPadding: 12.0
                                                      })(cSys)(v6.size)(v4);
                                                      var annoPeaks = Genetics_Browser_Demo.annotationsForScale(cSys)(sigSnps)(v1.annotations)(segs);
                                                      return Effect_Class.liftEffect(Effect_Aff.monadEffectAff)(function __do() {
                                                          var v7 = v3.lastHotspots();
                                                          var clicked = v7(1.0)(p);
                                                          var v8 = Data_Array.head(clicked);
                                                          if (v8 instanceof Data_Maybe.Nothing) {
                                                              return v(IBoxHide.value)();
                                                          };
                                                          if (v8 instanceof Data_Maybe.Just) {
                                                              v(IBoxShow.value)();
                                                              v(IBoxSetX.create(Data_Int.round(p.x)))();
                                                              v(IBoxSetY.create(Data_Int.round(p.y)))();
                                                              return v(IBoxSetContents.create(snpHTML(v8.value0) + Data_Foldable.foldMap(Data_Foldable.foldableMaybe)(Data_Monoid.monoidString)(annoPeakHTML)(annotAround(annoPeaks)(v8.value0))))();
                                                          };
                                                          throw new Error("Failed pattern match at Genetics.Browser.UI line 530, column 13 - line 538, column 68: " + [ v8.constructor.name ]);
                                                      });
                                                  });
                                              }));
                                          };
                                          return Genetics_Browser_Canvas.browserClickHandler(Effect_Class.monadEffectEffect)(bc)(new Genetics_Browser_Layer.Padded(5.0, glyphClick));
                                      })()))(function () {
                                          return Control_Applicative.pure(Effect_Aff.applicativeAff)(Data_Unit.unit);
                                      });
                                  });
                              });
                          });
                      });
                  });
              });
          })());
      };
  };
  var main = function (rawConfig) {
      return function __do() {
          var v = (function __do() {
              var v = Data_Functor.map(Effect.functorEffect)(Web_HTML_HTMLDocument.toDocument)(Control_Bind.bindFlipped(Effect.bindEffect)(Web_HTML_Window.document)(Web_HTML.window))();
              return Web_DOM_ParentNode.querySelector(Data_Newtype.wrap(Web_DOM_ParentNode.newtypeQuerySelector)("#browser"))(Web_DOM_Document.toParentNode(v))();
          })();
          if (v instanceof Data_Maybe.Nothing) {
              return Effect_Console.log("Could not find element '#browser'")();
          };
          if (v instanceof Data_Maybe.Just) {
              var v1 = Simple_JSON.read(Simple_JSON.readRecord()(Simple_JSON.readFieldsCons(new Data_Symbol.IsSymbol(function () {
                  return "annotationsConfig";
              }))(Simple_JSON.readRecord()(Simple_JSON.readFieldsCons(new Data_Symbol.IsSymbol(function () {
                  return "geneColor";
              }))(Genetics_Browser.readforeignHexColor)(Simple_JSON.readFieldsCons(new Data_Symbol.IsSymbol(function () {
                  return "outline";
              }))(Genetics_Browser.readforeignHexColor)(Simple_JSON.readFieldsCons(new Data_Symbol.IsSymbol(function () {
                  return "radius";
              }))(Simple_JSON.readNumber)(Simple_JSON.readFieldsCons(new Data_Symbol.IsSymbol(function () {
                  return "snpColor";
              }))(Genetics_Browser.readforeignHexColor)(Simple_JSON.readFieldsNil)()())()())()())()()))(Simple_JSON.readFieldsCons(new Data_Symbol.IsSymbol(function () {
                  return "browserHeight";
              }))(Simple_JSON.readNumber)(Simple_JSON.readFieldsCons(new Data_Symbol.IsSymbol(function () {
                  return "chrLabels";
              }))(Simple_JSON.readRecord()(Simple_JSON.readFieldsCons(new Data_Symbol.IsSymbol(function () {
                  return "fontSize";
              }))(Simple_JSON.readInt)(Simple_JSON.readFieldsNil)()()))(Simple_JSON.readFieldsCons(new Data_Symbol.IsSymbol(function () {
                  return "initialChrs";
              }))(Simple_JSON.readMaybe(Simple_JSON.readRecord()(Simple_JSON.readFieldsCons(new Data_Symbol.IsSymbol(function () {
                  return "left";
              }))(Simple_JSON.readString)(Simple_JSON.readFieldsCons(new Data_Symbol.IsSymbol(function () {
                  return "right";
              }))(Simple_JSON.readString)(Simple_JSON.readFieldsNil)()())()())))(Simple_JSON.readFieldsCons(new Data_Symbol.IsSymbol(function () {
                  return "legend";
              }))(Simple_JSON.readRecord()(Simple_JSON.readFieldsCons(new Data_Symbol.IsSymbol(function () {
                  return "fontSize";
              }))(Simple_JSON.readInt)(Simple_JSON.readFieldsCons(new Data_Symbol.IsSymbol(function () {
                  return "hPad";
              }))(Simple_JSON.readNumber)(Simple_JSON.readFieldsCons(new Data_Symbol.IsSymbol(function () {
                  return "vPad";
              }))(Simple_JSON.readNumber)(Simple_JSON.readFieldsNil)()())()())()()))(Simple_JSON.readFieldsCons(new Data_Symbol.IsSymbol(function () {
                  return "padding";
              }))(Simple_JSON.readRecord()(Simple_JSON.readFieldsCons(new Data_Symbol.IsSymbol(function () {
                  return "bottom";
              }))(Simple_JSON.readNumber)(Simple_JSON.readFieldsCons(new Data_Symbol.IsSymbol(function () {
                  return "left";
              }))(Simple_JSON.readNumber)(Simple_JSON.readFieldsCons(new Data_Symbol.IsSymbol(function () {
                  return "right";
              }))(Simple_JSON.readNumber)(Simple_JSON.readFieldsCons(new Data_Symbol.IsSymbol(function () {
                  return "top";
              }))(Simple_JSON.readNumber)(Simple_JSON.readFieldsNil)()())()())()())()()))(Simple_JSON.readFieldsCons(new Data_Symbol.IsSymbol(function () {
                  return "score";
              }))(Simple_JSON.readRecord()(Simple_JSON.readFieldsCons(new Data_Symbol.IsSymbol(function () {
                  return "max";
              }))(Simple_JSON.readNumber)(Simple_JSON.readFieldsCons(new Data_Symbol.IsSymbol(function () {
                  return "min";
              }))(Simple_JSON.readNumber)(Simple_JSON.readFieldsCons(new Data_Symbol.IsSymbol(function () {
                  return "sig";
              }))(Simple_JSON.readNumber)(Simple_JSON.readFieldsNil)()())()())()()))(Simple_JSON.readFieldsCons(new Data_Symbol.IsSymbol(function () {
                  return "snpsConfig";
              }))(Simple_JSON.readRecord()(Simple_JSON.readFieldsCons(new Data_Symbol.IsSymbol(function () {
                  return "color";
              }))(Simple_JSON.readRecord()(Simple_JSON.readFieldsCons(new Data_Symbol.IsSymbol(function () {
                  return "fill";
              }))(Genetics_Browser.readforeignHexColor)(Simple_JSON.readFieldsCons(new Data_Symbol.IsSymbol(function () {
                  return "outline";
              }))(Genetics_Browser.readforeignHexColor)(Simple_JSON.readFieldsNil)()())()()))(Simple_JSON.readFieldsCons(new Data_Symbol.IsSymbol(function () {
                  return "lineWidth";
              }))(Simple_JSON.readNumber)(Simple_JSON.readFieldsCons(new Data_Symbol.IsSymbol(function () {
                  return "pixelOffset";
              }))(Simple_JSON.readRecord()(Simple_JSON.readFieldsCons(new Data_Symbol.IsSymbol(function () {
                  return "x";
              }))(Simple_JSON.readNumber)(Simple_JSON.readFieldsCons(new Data_Symbol.IsSymbol(function () {
                  return "y";
              }))(Simple_JSON.readNumber)(Simple_JSON.readFieldsNil)()())()()))(Simple_JSON.readFieldsCons(new Data_Symbol.IsSymbol(function () {
                  return "radius";
              }))(Simple_JSON.readNumber)(Simple_JSON.readFieldsNil)()())()())()())()()))(Simple_JSON.readFieldsCons(new Data_Symbol.IsSymbol(function () {
                  return "urls";
              }))(Simple_JSON.readRecord()(Simple_JSON.readFieldsCons(new Data_Symbol.IsSymbol(function () {
                  return "annotations";
              }))(Simple_JSON.readMaybe(Simple_JSON.readString))(Simple_JSON.readFieldsCons(new Data_Symbol.IsSymbol(function () {
                  return "genes";
              }))(Simple_JSON.readMaybe(Simple_JSON.readString))(Simple_JSON.readFieldsCons(new Data_Symbol.IsSymbol(function () {
                  return "snps";
              }))(Simple_JSON.readMaybe(Simple_JSON.readString))(Simple_JSON.readFieldsNil)()())()())()()))(Simple_JSON.readFieldsCons(new Data_Symbol.IsSymbol(function () {
                  return "vscale";
              }))(Simple_JSON.readRecord()(Simple_JSON.readFieldsCons(new Data_Symbol.IsSymbol(function () {
                  return "color";
              }))(Genetics_Browser.readforeignHexColor)(Simple_JSON.readFieldsCons(new Data_Symbol.IsSymbol(function () {
                  return "fonts";
              }))(Simple_JSON.readRecord()(Simple_JSON.readFieldsCons(new Data_Symbol.IsSymbol(function () {
                  return "labelSize";
              }))(Simple_JSON.readInt)(Simple_JSON.readFieldsCons(new Data_Symbol.IsSymbol(function () {
                  return "scaleSize";
              }))(Simple_JSON.readInt)(Simple_JSON.readFieldsNil)()())()()))(Simple_JSON.readFieldsCons(new Data_Symbol.IsSymbol(function () {
                  return "hPad";
              }))(Simple_JSON.readNumber)(Simple_JSON.readFieldsCons(new Data_Symbol.IsSymbol(function () {
                  return "numSteps";
              }))(Simple_JSON.readInt)(Simple_JSON.readFieldsNil)()())()())()())()()))(Simple_JSON.readFieldsNil)()())()())()())()())()())()())()())()())()())()()))(rawConfig);
              if (v1 instanceof Data_Either.Left) {
                  return $foreign.setElementContents(v.value0)("<p>Error when parsing provided config object:<p>" + Data_Foldable.foldMap(Data_List_Types.foldableNonEmptyList)(Data_Monoid.monoidString)(function ($204) {
                      return wrapWith("p")(Foreign.renderForeignError($204));
                  })(v1.value0))();
              };
              if (v1 instanceof Data_Either.Right) {
                  var v2 = $foreign.windowInnerSize();
                  var dimensions = {
                      width: v2.width,
                      height: v1.value0.browserHeight
                  };
                  var v3 = Genetics_Browser_Canvas.browserContainer(dimensions)(v1.value0.padding)(v.value0)();
                  Effect_Console.log(Global_Unsafe.unsafeStringify(v1.value0))();
                  return Data_Functor["void"](Effect.functorEffect)(runBrowser(v1.value0)(v3))();
              };
              throw new Error("Failed pattern match at Genetics.Browser.UI line 584, column 7 - line 597, column 37: " + [ v1.constructor.name ]);
          };
          throw new Error("Failed pattern match at Genetics.Browser.UI line 580, column 3 - line 597, column 37: " + [ v.constructor.name ]);
      };
  };
  exports["initializeBrowser"] = initializeBrowser;
  exports["ScrollView"] = ScrollView;
  exports["ZoomView"] = ZoomView;
  exports["ModView"] = ModView;
  exports["updateViewFold"] = updateViewFold;
  exports["queueCmd"] = queueCmd;
  exports["animateDelta"] = animateDelta;
  exports["uiViewUpdate"] = uiViewUpdate;
  exports["btnUI"] = btnUI;
  exports["keyUI"] = keyUI;
  exports["_render"] = _render;
  exports["_docResize"] = _docResize;
  exports["debugView"] = debugView;
  exports["printSNPInfo"] = printSNPInfo;
  exports["wrapWith"] = wrapWith;
  exports["snpHTML"] = snpHTML;
  exports["peakHTML"] = peakHTML;
  exports["annoPeakHTML"] = annoPeakHTML;
  exports["annotationHTML"] = annotationHTML;
  exports["annotationHTMLAll"] = annotationHTMLAll;
  exports["annotationHTMLDefault"] = annotationHTMLDefault;
  exports["annotationHTMLShort"] = annotationHTMLShort;
  exports["IBoxShow"] = IBoxShow;
  exports["IBoxHide"] = IBoxHide;
  exports["IBoxSetY"] = IBoxSetY;
  exports["IBoxSetX"] = IBoxSetX;
  exports["IBoxSetContents"] = IBoxSetContents;
  exports["updateInfoBox"] = updateInfoBox;
  exports["infoBoxId"] = infoBoxId;
  exports["initInfoBox"] = initInfoBox;
  exports["runBrowser"] = runBrowser;
  exports["main"] = main;
  exports["mouseChrSizes"] = mouseChrSizes;
  exports["showUpdateView"] = showUpdateView;
  exports["semigroupUpdateView"] = semigroupUpdateView;
  exports["monoidUpdateView"] = monoidUpdateView;
  exports["genericInfoBoxF"] = genericInfoBoxF;
  exports["showInfoBoxF"] = showInfoBoxF;
  exports["windowInnerSize"] = $foreign.windowInnerSize;
  exports["buttonEvent"] = $foreign.buttonEvent;
  exports["keydownEvent"] = $foreign.keydownEvent;
  exports["resizeEvent"] = $foreign.resizeEvent;
  exports["onTimeout"] = $foreign.onTimeout;
  exports["initDebugDiv"] = $foreign.initDebugDiv;
  exports["setDebugDivVisibility"] = $foreign.setDebugDivVisibility;
  exports["setDebugDivPoint"] = $foreign.setDebugDivPoint;
  exports["setElementContents"] = $foreign.setElementContents;
  exports["setWindow"] = $foreign.setWindow;
})(PS["Genetics.Browser.UI"] = PS["Genetics.Browser.UI"] || {});module.exports = PS["Genetics.Browser.UI"];

}).call(this,require('_process'))
},{"_process":1,"big-integer":2}]},{},[3])(3)
});
