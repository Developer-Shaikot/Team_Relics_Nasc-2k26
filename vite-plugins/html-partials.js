// Build-time HTML partials for Vite.
//
// In any HTML file processed by Vite (index.html), a line like
//     <!-- @include screens/splash.html -->
// is replaced with the contents of src/partials/screens/splash.html.
// Partials may include other partials (paths are always relative to src/partials).
// A .js partial is inlined as a plain (non-module, unbundled) <script> block.
//
// The browser still receives ONE complete HTML document, so runtime behaviour is
// identical to a hand-written single file: every element exists before main.js runs.

import fs from 'node:fs';
import path from 'node:path';

const INCLUDE_LINE = /^[ \t]*<!--\s*@include\s+([\w./-]+)\s*-->[ \t]*$/gm;

export default function htmlPartials({ dir = 'src/partials' } = {}) {
  let root = process.cwd();
  const partialsDir = () => path.resolve(root, dir);

  function expand(html, stack = []) {
    return html.replace(INCLUDE_LINE, (_line, rel) => {
      const file = path.resolve(partialsDir(), rel);
      if (!file.startsWith(partialsDir() + path.sep)) {
        throw new Error(`[html-partials] include outside ${dir}: ${rel}`);
      }
      if (stack.includes(file)) {
        throw new Error(`[html-partials] circular include: ${[...stack, file].map(f => path.relative(root, f)).join(' -> ')}`);
      }
      if (!fs.existsSync(file)) {
        throw new Error(`[html-partials] missing partial: ${path.join(dir, rel)}`);
      }
      const content = fs.readFileSync(file, 'utf8').replace(/\r?\n$/, '');
      if (file.endsWith('.js')) {
        // Classic inline script (runs synchronously during parsing, NOT bundled)
        // "</script" ends the block early and "<!--" switches the HTML parser into escaped mode
        if (/<\/script|<!--/i.test(content)) throw new Error(`[html-partials] "</script" or "<!--" inside ${rel}`);
        return `  <script>\n${content}\n  </script>`;
      }
      return expand(content, [...stack, file]);
    });
  }

  return {
    name: 'html-partials',
    configResolved(config) {
      root = config.root;
    },
    transformIndexHtml: {
      order: 'pre', // expand before Vite resolves <script>/<link>/asset URLs
      handler: (html) => expand(html),
    },
    configureServer(server) {
      // Editing a partial should refresh the page just like editing index.html
      server.watcher.add(partialsDir());
      const reload = (file) => {
        if (file.startsWith(partialsDir()) && /\.(html|js)$/.test(file)) {
          server.ws.send({ type: 'full-reload', path: '*' });
        }
      };
      server.watcher.on('change', reload);
      server.watcher.on('add', reload);
      server.watcher.on('unlink', reload);
    },
  };
}

// Exported for scripts/tests that need the fully expanded page outside Vite
export function expandPartials(html, root = process.cwd(), dir = 'src/partials') {
  const plugin = htmlPartials({ dir });
  plugin.configResolved({ root });
  return plugin.transformIndexHtml.handler(html);
}
