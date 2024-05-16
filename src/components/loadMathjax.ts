"use client";

import { useEffect } from "react";

export default function MathJax() {
  useEffect(() => {
    // @ts-ignore
    window.MathJax = {
      tex: {
        inlineMath: [["\\(", "\\)"]],
      },
      svg: {
        fontCache: "global",
      },
    };

    (function () {
      var script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js";
      script.async = true;
      document.head.appendChild(script);
    })();
  }, []);

  return null;
}
