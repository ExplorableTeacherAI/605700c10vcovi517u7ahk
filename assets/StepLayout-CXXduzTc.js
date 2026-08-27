import{j as e,r as o,u as T,g as y,z as N}from"./index-Di8kfl66.js";const E=({children:l,className:i=""})=>e.jsx("div",{className:`step-content w-full ${i}`,children:l});function L({gateVarName:l,correctAnswer:i,onReady:s}){const r=y(l,""),d=o.useRef(!1),u=typeof r=="string"&&N(r,i);return o.useEffect(()=>{if(u&&!d.current){d.current=!0;const n=setTimeout(s,700);return()=>clearTimeout(n)}},[u,s]),null}function B({label:l,onClick:i,gateVarName:s,correctAnswer:r,isLast:d}){const u=y(s??"__step_no_gate__",""),n=!s||!r||r.length===0||typeof u=="string"&&N(u,r);return d?null:e.jsxs("div",{className:"flex flex-col items-start gap-1.5 mt-4",children:[s&&!n&&e.jsx("p",{className:"text-xs text-[#3cc499]/70 italic",children:"Complete the activity above to continue."}),e.jsxs("button",{onClick:i,disabled:!n,className:`
                    inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium
                    bg-[#3cc499] text-white shadow
                    transition-all duration-150
                    hover:opacity-90 active:scale-95
                    disabled:opacity-30 disabled:cursor-not-allowed disabled:pointer-events-none
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3cc499]
                    select-none
                `,children:[e.jsx("span",{children:l}),e.jsx("span",{className:"text-base leading-none",children:"→"})]})]})}const S=({children:l,className:i="",varName:s,revealLabel:r="Continue",showProgress:d=!0,allowBack:u=!1,onStepReveal:n})=>{const b=o.Children.toArray(l),m=b.length,[p,w]=o.useState(0),g=T(),f=o.useCallback(t=>{t<0||t>=m||(w(t),s&&g(s,t),n==null||n(t))},[m,s,g,n]),v=o.useCallback(t=>f(t+1),[f]),C=o.useCallback(t=>f(Math.max(0,t-1)),[f]),A=t=>o.isValidElement(t)&&t.type===E?t.props:{},V=d&&m>1&&e.jsxs("div",{className:"mb-5 text-xs font-medium text-[#3cc499]/60 tracking-wide select-none",children:["Step ",p+1," / ",m]});return e.jsxs("div",{className:`w-full flex flex-col ${i}`,"data-layout-type":"step","data-layout-total":m,"data-layout-revealed":p,children:[V,e.jsx("div",{className:"flex flex-col",children:b.map((t,a)=>{const x=a===p,k=a>p,h=a===m-1,c=A(t),_=c.revealLabel??r,j=!!c.autoAdvance&&!!c.completionVarName;return k?null:e.jsxs("div",{className:`
                                w-full
                                animate-in fade-in slide-in-from-bottom-3 duration-500
                                ${a>0?"pt-6 mt-2":""}
                            `,children:[e.jsx("div",{children:t}),x&&j&&!h&&c.correctAnswer&&e.jsx(L,{gateVarName:c.completionVarName,correctAnswer:c.correctAnswer,onReady:()=>v(a)}),e.jsxs("div",{className:"flex items-center gap-3 flex-wrap",children:[x&&!j&&e.jsx(B,{label:_,onClick:()=>v(a),gateVarName:c.completionVarName,correctAnswer:c.correctAnswer,isLast:h}),u&&a>0&&x&&e.jsxs("button",{onClick:()=>C(a),className:`
                                            inline-flex items-center gap-1.5 mt-4 px-3 py-2 rounded-xl
                                            text-xs font-medium text-[#3cc499]
                                            border border-[#3cc499]/30 bg-background
                                            hover:bg-[#3cc499]/10
                                            transition-all duration-150 select-none
                                            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3cc499]
                                        `,children:[e.jsx("span",{children:"←"}),e.jsx("span",{children:"Back"})]})]})]},a)})})]})};export{S,E as a};
