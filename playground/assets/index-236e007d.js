function w(f,y){for(var u=0;u<y.length;u++){const r=y[u];if(typeof r!="string"&&!Array.isArray(r)){for(const o in r)if(o!=="default"&&!(o in f)){const c=Object.getOwnPropertyDescriptor(r,o);c&&Object.defineProperty(f,o,c.get?c:{enumerable:!0,get:()=>r[o]})}}}return Object.freeze(Object.defineProperty(f,Symbol.toStringTag,{value:"Module"}))}var x={};(function(){var f=tinymce.util.Tools.resolve("tinymce.PluginManager"),y=tinymce.util.Tools.resolve("tinymce.dom.DOMUtils"),u=tinymce.util.Tools.resolve("tinymce.EditorManager"),r=tinymce.util.Tools.resolve("tinymce.Env"),o=tinymce.util.Tools.resolve("tinymce.util.Delay"),c=tinymce.util.Tools.resolve("tinymce.util.Tools"),b=tinymce.util.Tools.resolve("tinymce.util.VK"),D=function(e){return e.getParam("tabfocus_elements",":prev,:next")},P=function(e){return e.getParam("tab_focus",D(e))},g=y.DOM,K=function(e){e.keyCode===b.TAB&&!e.ctrlKey&&!e.altKey&&!e.metaKey&&e.preventDefault()},h=function(e){var d=function(a){var m;if(!(a.keyCode!==b.TAB||a.ctrlKey||a.altKey||a.metaKey||a.isDefaultPrevented())){var p=function(_){var s=g.select(":input:enabled,*[tabindex]:not(iframe)"),O=function(l){var v=l;return l.nodeName==="BODY"||v.type!=="hidden"&&v.style.display!=="none"&&v.style.visibility!=="hidden"&&O(l.parentNode)},k=function(l){return/INPUT|TEXTAREA|BUTTON/.test(l.tagName)&&u.get(a.id)&&l.tabIndex!==-1&&O(l)};if(c.each(s,function(l,v){if(l.id===e.id)return m=v,!1}),_>0){for(var n=m+1;n<s.length;n++)if(k(s[n]))return s[n]}else for(var n=m-1;n>=0;n--)if(k(s[n]))return s[n];return null},i=c.explode(P(e));i.length===1&&(i[1]=i[0],i[0]=":prev");var t;if(a.shiftKey?i[0]===":prev"?t=p(-1):t=g.get(i[0]):i[1]===":next"?t=p(1):t=g.get(i[1]),t){var T=u.get(t.id||t.name);t.id&&T?T.focus():o.setTimeout(function(){r.webkit||window.focus(),t.focus()},10),a.preventDefault()}}};e.on("init",function(){e.inline&&g.setAttrib(e.getBody(),"tabIndex",null),e.on("keyup",K),r.gecko?e.on("keypress keydown",d):e.on("keydown",d)})};function A(){f.add("tabfocus",function(e){h(e)})}A()})();const M=w({__proto__:null,default:x},[x]);export{M as i};
