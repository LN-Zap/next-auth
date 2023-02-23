"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.BroadcastChannel = BroadcastChannel;
exports.apiBaseUrl = apiBaseUrl;
exports.fetchData = fetchData;
exports.now = now;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _typeof2 = _interopRequireDefault(require("@babel/runtime/helpers/typeof"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

function fetchData(_x, _x2, _x3) {
  return _fetchData.apply(this, arguments);
}

function _fetchData() {
  _fetchData = (0, _asyncToGenerator2.default)(_regenerator.default.mark(function _callee(path, __NEXTAUTH, logger) {
    var _ref,
        ctx,
        _ref$req,
        req,
        url,
        logs,
        options,
        res,
        dataAsString,
        data,
        _args = arguments;

    return _regenerator.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _ref = _args.length > 3 && _args[3] !== undefined ? _args[3] : {}, ctx = _ref.ctx, _ref$req = _ref.req, req = _ref$req === void 0 ? ctx === null || ctx === void 0 ? void 0 : ctx.req : _ref$req;
            url = "".concat(apiBaseUrl(__NEXTAUTH), "/").concat(path);
            logs = [];
            _context.prev = 3;
            options = req !== null && req !== void 0 && req.headers.cookie ? {
              headers: {
                cookie: req.headers.cookie
              }
            } : {};
            logs.push("Before fetch");
            _context.next = 8;
            return fetch(url, options);

          case 8:
            res = _context.sent;
            logs.push("After fetch");
            logs.push("res.ok: ".concat(res === null || res === void 0 ? void 0 : res.ok));
            logs.push("res.status: ".concat(res === null || res === void 0 ? void 0 : res.status));
            logs.push("res.statusText: ".concat(res === null || res === void 0 ? void 0 : res.statusText));
            logs.push("res.type: ".concat(res === null || res === void 0 ? void 0 : res.type));
            _context.next = 16;
            return res.text();

          case 16:
            dataAsString = _context.sent;
            logs.push("response body, as string: ".concat(dataAsString));
            data = JSON.parse(dataAsString);

            if (res.ok) {
              _context.next = 21;
              break;
            }

            throw data;

          case 21:
            return _context.abrupt("return", Object.keys(data).length > 0 ? data : null);

          case 24:
            _context.prev = 24;
            _context.t0 = _context["catch"](3);
            logger.error("CLIENT_FETCH_ERROR", {
              error: _context.t0,
              url: url,
              errorType: (0, _typeof2.default)(_context.t0),
              errorToString: _context.t0.toString(),
              userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'window=undefined',
              logs: logs
            });
            return _context.abrupt("return", null);

          case 28:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, null, [[3, 24]]);
  }));
  return _fetchData.apply(this, arguments);
}

function apiBaseUrl(__NEXTAUTH) {
  if (typeof window === "undefined") {
    return "".concat(__NEXTAUTH.baseUrlServer).concat(__NEXTAUTH.basePathServer);
  }

  return __NEXTAUTH.basePath;
}

function now() {
  return Math.floor(Date.now() / 1000);
}

function BroadcastChannel() {
  var name = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "nextauth.message";
  return {
    receive: function receive(onReceive) {
      var handler = function handler(event) {
        var _event$newValue;

        if (event.key !== name) return;
        var message = JSON.parse((_event$newValue = event.newValue) !== null && _event$newValue !== void 0 ? _event$newValue : "{}");
        if ((message === null || message === void 0 ? void 0 : message.event) !== "session" || !(message !== null && message !== void 0 && message.data)) return;
        onReceive(message);
      };

      window.addEventListener("storage", handler);
      return function () {
        return window.removeEventListener("storage", handler);
      };
    },
    post: function post(message) {
      if (typeof window === "undefined") return;

      try {
        localStorage.setItem(name, JSON.stringify(_objectSpread(_objectSpread({}, message), {}, {
          timestamp: now()
        })));
      } catch (_unused) {}
    }
  };
}