String.fromCharCode;
const e = /^[\s\w\0+.-]{2,}:([/\\]{1,2})/, t = /^[\s\w\0+.-]{2,}:([/\\]{2})?/, n = /^([/\\]\s*){2,}[^/\\]/, r = /\/$|\/\?|\/#/, i = /^\.?\//;
function a(r, i = {}) {
	return typeof i == `boolean` && (i = { acceptRelative: i }), i.strict ? e.test(r) : t.test(r) || (i.acceptRelative ? n.test(r) : !1);
}
function o(e = ``, t) {
	return t ? r.test(e) : e.endsWith(`/`);
}
function s(e = ``, t) {
	if (!t) return e.endsWith(`/`) ? e : e + `/`;
	if (o(e, !0)) return e || `/`;
	let n = e, r = ``, i = e.indexOf(`#`);
	if (i !== -1 && (n = e.slice(0, i), r = e.slice(i), !n)) return r;
	let [a, ...s] = n.split(`?`);
	return a + `/` + (s.length > 0 ? `?${s.join(`?`)}` : ``) + r;
}
function c(e = ``) {
	return e.startsWith(`/`);
}
function l(e = ``) {
	return c(e) ? e : `/` + e;
}
function u(e) {
	return e && e !== `/`;
}
function d(e, ...t) {
	let n = e || ``;
	for (let e of t.filter((e) => u(e))) if (n) {
		let t = e.replace(i, ``);
		n = s(n) + t;
	} else n = e;
	return n;
}
export { a as hasProtocol, d as joinURL, l as withLeadingSlash };
