(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/components/WorkflowCanvas.tsx [app-client] (ecmascript, next/dynamic entry, async loader)", ((__turbopack_context__) => {

__turbopack_context__.v((parentImport) => {
    return Promise.all([
  "static/chunks/src_components_ceef21b9._.js",
  "static/chunks/node_modules_ddeae2df._.js",
  {
    "path": "static/chunks/_3fc87d4f._.css",
    "included": [
      "[project]/node_modules/reactflow/dist/style.css [app-client] (css)",
      "[project]/src/styles/animated-edges.css [app-client] (css)"
    ],
    "moduleChunks": [
      "static/chunks/node_modules_reactflow_dist_style_css_bad6b30c._.single.css",
      "static/chunks/src_styles_animated-edges_css_bad6b30c._.single.css"
    ]
  },
  "static/chunks/src_components_WorkflowCanvas_tsx_500761b2._.js"
].map((chunk) => __turbopack_context__.l(chunk))).then(() => {
        return parentImport("[project]/src/components/WorkflowCanvas.tsx [app-client] (ecmascript, next/dynamic entry)");
    });
});
}),
]);