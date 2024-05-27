function Cr(v,p){for(var m=0;m<p.length;m++){const u=p[m];if(typeof u!="string"&&!Array.isArray(u)){for(const c in u)if(c!=="default"&&!(c in v)){const s=Object.getOwnPropertyDescriptor(u,c);s&&Object.defineProperty(v,c,s.get?s:{enumerable:!0,get:()=>u[c]})}}}return Object.freeze(Object.defineProperty(v,Symbol.toStringTag,{value:"Module"}))}var B={};(function(){var v=tinymce.util.Tools.resolve("tinymce.PluginManager"),p=function(r){var n=typeof r;return r===null?"null":n==="object"&&(Array.prototype.isPrototypeOf(r)||r.constructor&&r.constructor.name==="Array")?"array":n==="object"&&(String.prototype.isPrototypeOf(r)||r.constructor&&r.constructor.name==="String")?"string":n},m=function(r){return function(n){return p(n)===r}},u=function(r){return function(n){return typeof n===r}},c=m("string"),s=u("boolean"),R=function(r){return r==null},H=function(r){return!R(r)},h=u("function"),_=u("number"),z=function(){},j=function(r,n){return function(e){return r(n(e))}},d=function(r){return function(){return r}},F=function(r){return r},y=d(!1),T=d(!0),w=function(){return D},D=function(){var r=function(t){return t()},n=F,e={fold:function(t,o){return t()},isSome:y,isNone:T,getOr:n,getOrThunk:r,getOrDie:function(t){throw new Error(t||"error: getOrDie called on none.")},getOrNull:d(null),getOrUndefined:d(void 0),or:n,orThunk:r,map:w,each:z,bind:w,exists:y,forall:T,filter:function(){return w()},toArray:function(){return[]},toString:d("none()")};return e}(),b=function(r){var n=d(r),e=function(){return o},t=function(i){return i(r)},o={fold:function(i,l){return l(r)},isSome:T,isNone:y,getOr:n,getOrThunk:n,getOrDie:n,getOrNull:n,getOrUndefined:n,or:e,orThunk:e,map:function(i){return b(i(r))},each:function(i){i(r)},bind:t,exists:t,forall:t,filter:function(i){return i(r)?o:D},toArray:function(){return[r]},toString:function(){return"some("+r+")"}};return o},U=function(r){return r==null?D:b(r)},f={some:b,none:w,from:U},$=function(r,n){for(var e=r.length,t=new Array(e),o=0;o<e;o++){var i=r[o];t[o]=n(i,o)}return t},O=function(r,n){for(var e=0,t=r.length;e<t;e++){var o=r[e];n(o,e)}},V=function(r,n){for(var e=[],t=0,o=r.length;t<o;t++){var i=r[t];n(i,t)&&e.push(i)}return e},I=9,G=11,E=1,K=3,X=function(r,n){var e=n||document,t=e.createElement("div");if(t.innerHTML=r,!t.hasChildNodes()||t.childNodes.length>1)throw console.error("HTML does not have a single root node",r),new Error("HTML must have a single root node");return g(t.childNodes[0])},q=function(r,n){var e=n||document,t=e.createElement(r);return g(t)},J=function(r,n){var e=n||document,t=e.createTextNode(r);return g(t)},g=function(r){if(r==null)throw new Error("Node cannot be null or undefined");return{dom:r}},Q=function(r,n,e){return f.from(r.dom.elementFromPoint(n,e)).map(g)},a={fromHtml:X,fromTag:q,fromText:J,fromDom:g,fromPoint:Q},P=function(r,n){var e=r.dom;if(e.nodeType!==E)return!1;var t=e;if(t.matches!==void 0)return t.matches(n);if(t.msMatchesSelector!==void 0)return t.msMatchesSelector(n);if(t.webkitMatchesSelector!==void 0)return t.webkitMatchesSelector(n);if(t.mozMatchesSelector!==void 0)return t.mozMatchesSelector(n);throw new Error("Browser lacks native selectors")};typeof window!="undefined"||Function("return this;")();var W=function(r){var n=r.dom.nodeName;return n.toLowerCase()},Y=function(r){return r.dom.nodeType},N=function(r){return function(n){return Y(n)===r}},k=N(E),Z=N(K),x=N(I),rr=N(G),nr=function(r){return function(n){return k(n)&&W(n)===r}},er=function(r){return a.fromDom(r.dom.ownerDocument)},tr=function(r){return x(r)?r:er(r)},or=function(r){return f.from(r.dom.parentNode).map(a.fromDom)},ir=function(r){return $(r.dom.childNodes,a.fromDom)},ur=function(r,n,e){if(c(e)||s(e)||_(e))r.setAttribute(n,e+"");else throw console.error("Invalid call to Attribute.set. Key ",n,":: Value ",e,":: Element ",r),new Error("Attribute value was not simple")},ar=function(r,n,e){ur(r.dom,n,e)},A=function(r,n){r.dom.removeAttribute(n)},cr=function(r){return rr(r)&&H(r.dom.host)},fr=h(Element.prototype.attachShadow)&&h(Node.prototype.getRootNode),lr=fr?function(r){return a.fromDom(r.dom.getRootNode())}:tr,dr=function(r){var n=lr(r);return cr(n)?f.some(n):f.none()},vr=function(r){return a.fromDom(r.dom.host)},M=function(r){var n=Z(r)?r.dom.parentNode:r.dom;if(n==null||n.ownerDocument===null)return!1;var e=n.ownerDocument;return dr(a.fromDom(n)).fold(function(){return e.body.contains(n)},j(M,vr))},mr=function(r,n,e){for(var t=r.dom,o=h(e)?e:y;t.parentNode;){t=t.parentNode;var i=a.fromDom(t);if(n(i))return f.some(i);if(o(i))break}return f.none()},sr=function(r,n,e){return mr(r,function(t){return P(t,n)},e)},gr=function(r){return r.style!==void 0&&h(r.style.getPropertyValue)},pr=function(r,n){var e=r.dom,t=window.getComputedStyle(e),o=t.getPropertyValue(n);return o===""&&!M(r)?hr(e,n):o},hr=function(r,n){return gr(r)?r.style.getPropertyValue(n):""},S=function(r){return pr(r,"direction")==="rtl"?"rtl":"ltr"},yr=function(r,n){return V(ir(r),n)},wr=function(r,n){return yr(r,function(e){return P(e,n)})},Nr=function(r){return or(r).filter(k)},Tr=function(r,n){var e=n?sr(r,"ol,ul"):f.some(r);return e.getOr(r)},Dr=nr("li"),C=function(r,n){var e=r.selection.getSelectedBlocks();e.length>0&&(O(e,function(t){var o=a.fromDom(t),i=Dr(o),l=Tr(o,i),Er=Nr(l);Er.each(function(Pr){var kr=S(Pr);if(kr!==n?ar(l,"dir",n):S(l)!==n&&A(l,"dir"),i){var Ar=wr(l,"li[dir]");O(Ar,function(Mr){return A(Mr,"dir")})}})}),r.nodeChanged())},br=function(r){r.addCommand("mceDirectionLTR",function(){C(r,"ltr")}),r.addCommand("mceDirectionRTL",function(){C(r,"rtl")})},L=function(r,n){return function(e){var t=function(o){var i=a.fromDom(o.element);e.setActive(S(i)===n)};return r.on("NodeChange",t),function(){return r.off("NodeChange",t)}}},Sr=function(r){r.ui.registry.addToggleButton("ltr",{tooltip:"Left to right",icon:"ltr",onAction:function(){return r.execCommand("mceDirectionLTR")},onSetup:L(r,"ltr")}),r.ui.registry.addToggleButton("rtl",{tooltip:"Right to left",icon:"rtl",onAction:function(){return r.execCommand("mceDirectionRTL")},onSetup:L(r,"rtl")})};function Or(){v.add("directionality",function(r){br(r),Sr(r)})}Or()})();const Lr=Cr({__proto__:null,default:B},[B]);export{Lr as i};
