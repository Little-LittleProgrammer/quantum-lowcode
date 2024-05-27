var M=Object.defineProperty,j=Object.defineProperties;var U=Object.getOwnPropertyDescriptors;var A=Object.getOwnPropertySymbols;var z=Object.prototype.hasOwnProperty,F=Object.prototype.propertyIsEnumerable;var O=(r,i,o)=>i in r?M(r,i,{enumerable:!0,configurable:!0,writable:!0,value:o}):r[i]=o,P=(r,i)=>{for(var o in i||(i={}))z.call(i,o)&&O(r,o,i[o]);if(A)for(var o of A(i))F.call(i,o)&&O(r,o,i[o]);return r},R=(r,i)=>j(r,U(i));import{d as N,r as p,_ as t,B as q,D as G,F as f,G as $,w as I,p as s,H as K,f as L,g as T,I as H,J}from"./index-ee06fcba.js";const Q=["advlist anchor autolink autosave code codesample  directionality  fullscreen hr insertdatetime link lists media nonbreaking noneditable pagebreak paste preview print save searchreplace spellchecker tabfocus  template  textpattern visualblocks visualchars wordcount"],W=["fontsizeselect lineheight searchreplace bold italic underline strikethrough alignleft aligncenter alignright outdent indent  blockquote undo redo removeformat subscript superscript code codesample","hr bullist numlist link  preview anchor pagebreak insertdatetime media  forecolor backcolor fullscreen"],X=["onActivate","onAddUndo","onBeforeAddUndo","onBeforeExecCommand","onBeforeGetContent","onBeforeRenderUI","onBeforeSetContent","onBeforePaste","onBlur","onChange","onClearUndos","onClick","onContextMenu","onCopy","onCut","onDblclick","onDeactivate","onDirty","onDrag","onDragDrop","onDragEnd","onDragGesture","onDragOver","onDrop","onExecCommand","onFocus","onFocusIn","onFocusOut","onGetContent","onHide","onInit","onKeyDown","onKeyPress","onKeyUp","onLoadContent","onMouseDown","onMouseEnter","onMouseLeave","onMouseMove","onMouseOut","onMouseOver","onMouseUp","onNodeChange","onObjectResizeStart","onObjectResized","onObjectSelected","onPaste","onPostProcess","onPostRender","onPreProcess","onProgressState","onRedo","onRemove","onReset","onSaveContent","onSelectionChange","onSetAttrib","onSetContent","onShow","onSubmit","onUndo","onVisualAid"],Y=r=>X.indexOf(r)!==-1,Z=(r,i,o)=>{Object.keys(i).filter(Y).forEach(_=>{const d=i[_];typeof d=="function"&&(_==="onInit"?d(r,o):o.on(_.substring(2),u=>d(u,o)))})},ee=["id"],ne=N({name:"RichText",__name:"rich-text",props:{options:{type:Object,default:()=>{}},value:{type:String},toolbar:{type:Array,default:W},plugins:{type:Array,default:Q},height:{type:[Number,String],required:!1,default:400},width:{type:[Number,String],required:!1,default:"auto"},themeMode:{type:String,default:"light"}},emits:["change","update:value","inited","init-error"],setup(r,{emit:i}){let o=null;const _=p(!1);t(()=>import("./tinymce-4f5f30e9.js").then(e=>e.t),["assets/tinymce-4f5f30e9.js","assets/index-ee06fcba.js","assets/index-615a9d86.css"]).then(e=>{o=e.default||e,d(),_.value=!0}).catch(()=>{_.value=!1});function d(){t(()=>import("./lang-70b5f47b.js"),[]),t(()=>import("./index-7d3e824e.js").then(e=>e.i),[]),t(()=>import("./index-a23dc3b4.js").then(e=>e.i),["assets/index-a23dc3b4.js","assets/index-ee06fcba.js","assets/index-615a9d86.css"]),t(()=>import("./icons-4a2f17a7.js"),[]),t(()=>import("./index-e2e0caad.js").then(e=>e.i),[]),t(()=>import("./index-3a962810.js").then(e=>e.i),[]),t(()=>import("./index-1d29977b.js").then(e=>e.i),[]),t(()=>import("./index-68e79d82.js").then(e=>e.i),[]),t(()=>import("./index-151771c3.js").then(e=>e.i),[]),t(()=>import("./index-40f8f9c7.js").then(e=>e.i),[]),t(()=>import("./index-a38f58c1.js").then(e=>e.i),[]),t(()=>import("./index-c6c43ba4.js").then(e=>e.i),[]),t(()=>import("./index-8b272f06.js").then(e=>e.i),[]),t(()=>import("./index-9a0b6d47.js").then(e=>e.i),[]),t(()=>import("./index-932c7783.js").then(e=>e.i),[]),t(()=>import("./index-67d45d42.js").then(e=>e.i),[]),t(()=>import("./index-a9bbb937.js").then(e=>e.i),[]),t(()=>import("./index-08bdc2f1.js").then(e=>e.i),[]),t(()=>import("./index-b8f88cb4.js").then(e=>e.i),[]),t(()=>import("./index-433937d2.js").then(e=>e.i),[]),t(()=>import("./index-412c3bb0.js").then(e=>e.i),[]),t(()=>import("./index-137b3deb.js").then(e=>e.i),[]),t(()=>import("./index-d7a4b7cf.js").then(e=>e.i),[]),t(()=>import("./index-01b5aec7.js").then(e=>e.i),[]),t(()=>import("./index-39db08bd.js").then(e=>e.i),[]),t(()=>import("./index-236e007d.js").then(e=>e.i),[]),t(()=>import("./index-e5d2353d.js").then(e=>e.i),[]),t(()=>import("./index-e83ce345.js").then(e=>e.i),[]),t(()=>import("./index-729af9fa.js").then(e=>e.i),[]),t(()=>import("./index-668e2321.js").then(e=>e.i),[]),t(()=>import("./index-122c53cf.js").then(e=>e.i),[])}const u=r,m=i,g=p("tiny-vue"+q(4)),D=p(null),E=p(null),c=G(),V=p(!1),b=f(()=>{const e=u.width;return $(e)?`${e}px`:e}),y=f(()=>u.themeMode==="light"?"oxide":"oxide-dark");I(()=>_.value,e=>{e&&setTimeout(()=>{k()},300)});const h=f(()=>{const{height:e,options:n,toolbar:l,plugins:a}=u;return R(P({selector:`#${s(g)}`,height:e,toolbar:l,menubar:"file edit insert view format table",plugins:a,language:"zh_CN",branding:!1,default_link_target:"_blank",link_title:!1,object_resizing:!1,skin:y.value},n),{setup:v=>{E.value=v,v.on("init",B=>C(B))}})});function k(){const e=s(D);e&&(e.style.visibility=""),o.init(s(h)).then(n=>{h.value,m("inited",n)}).catch(n=>{m("init-error",n)})}function C(e){const n=s(E);if(!n)return;const l=u.value||"";n.setContent(l),x(n),Z(e,c,s(E))}function S(e,n,l){e&&typeof n=="string"&&n!==l&&n!==e.getContent({format:c.outputFormat})&&e.setContent(n)}function x(e){const n=c.modelEvents?c.modelEvents:null,l=Array.isArray(n)?n.join(" "):n;I(()=>u.value,(a,v)=>{S(e,a,v)},{immediate:!0}),e.on(l||"change keyup undo redo",()=>{const a=e.getContent({format:c.outputFormat});m("update:value",a),m("change",a)}),e.on("FullscreenStateChanged",a=>{V.value=a.state})}function w(){var e;o!==null&&((e=o==null?void 0:o.remove)==null||e.call(o,s(h).selector))}return K(()=>{w()}),(e,n)=>(L(),T("div",{class:"q-rich-text",style:J({width:b.value})},[_.value&&!h.value.inline?(L(),T("textarea",{key:0,id:g.value,ref_key:"elRef",ref:D,style:{visibility:"hidden"}},null,8,ee)):H(e.$slots,"default",{key:1})],4))}});export{ne as default};
