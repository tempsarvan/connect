// Connect for Programmers (Developer Suite)

export function runJavaScriptSnippet(code) {
  const logs = [];
  const originalLog = console.log;

  console.log = (...args) => {
    logs.push(args.map((a) => (typeof a === "object" ? JSON.stringify(a) : String(a))).join(" "));
    originalLog.apply(console, args);
  };

  try {
    const result = new Function(code)();
    console.log = originalLog;
    return {
      success: true,
      logs,
      result: result !== undefined ? String(result) : null
    };
  } catch (err) {
    console.log = originalLog;
    return {
      success: false,
      logs,
      error: err.message
    };
  }
}

export function formatCodeSnippet(code, language = "javascript") {
  if (!code) return "";
  const escaped = code
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  return `<pre class="dev-code-block lang-${language}"><code>${escaped}</code></pre>`;
}
