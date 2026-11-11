import { __commonJSMin as e, __require as t } from "../rolldown-runtime.mjs";
var n = e(((e, n) => {
	n.exports = s;
	var r = t(`crypto`), i = t(`fs`).Stats, a = Object.prototype.toString;
	function o(e) {
		if (e.length === 0) return `"0-2jmj7l5rSw0yVb/vlWAYkK/YBwk"`;
		var t = r.createHash(`sha1`).update(e, `utf8`).digest(`base64`).substring(0, 27);
		return `"` + (typeof e == `string` ? Buffer.byteLength(e, `utf8`) : e.length).toString(16) + `-` + t + `"`;
	}
	function s(e, t) {
		if (e == null) throw TypeError(`argument entity is required`);
		var n = c(e), r = t && typeof t.weak == `boolean` ? t.weak : n;
		if (!n && typeof e != `string` && !Buffer.isBuffer(e)) throw TypeError(`argument entity must be string, Buffer, or fs.Stats`);
		var i = n ? l(e) : o(e);
		return r ? `W/` + i : i;
	}
	function c(e) {
		return typeof i == `function` && e instanceof i || e && typeof e == `object` && `ctime` in e && a.call(e.ctime) === `[object Date]` && `mtime` in e && a.call(e.mtime) === `[object Date]` && `ino` in e && typeof e.ino == `number` && `size` in e && typeof e.size == `number`;
	}
	function l(e) {
		var t = e.mtime.getTime().toString(16);
		return `"` + e.size.toString(16) + `-` + t + `"`;
	}
}));
export { n as require_etag };
