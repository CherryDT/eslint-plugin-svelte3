export const processor_options = {};

// find Linter instance
const linter_paths = Object.keys(require.cache).filter(path => path.endsWith('/eslint/lib/linter/linter.js') || path.endsWith('\\eslint\\lib\\linter\\linter.js'));
if (!linter_paths.length) {
	throw new Error('Could not find ESLint Linter in require cache');
}
// there may be more than one instance in case of multiple folders in the workspace
// try to find the one that's inside the same node_modules directory as this plugin
// if not found for some reason, assume it's the last one in the array
const linter_path = linter_paths.find(path => path.startsWith(__dirname.replace(/(?<=[/\\]node_modules[/\\]).*$/, ''))) || linter_paths.pop();
const { Linter } = require(linter_path);

// patch Linter#verify
const { verify } = Linter.prototype;
Linter.prototype.verify = function(code, config, options) {
	// fetch settings
	const settings = config && (typeof config.extractConfig === 'function' ? config.extractConfig(options.filename) : config).settings || {};
	processor_options.custom_compiler = settings['svelte3/compiler'];
	processor_options.ignore_warnings = settings['svelte3/ignore-warnings'];
	processor_options.ignore_styles = settings['svelte3/ignore-styles'];
	processor_options.compiler_options = settings['svelte3/compiler-options'];
	processor_options.named_blocks = settings['svelte3/named-blocks'];
	processor_options.typescript = settings['svelte3/typescript'];
	// call original Linter#verify
	return verify.call(this, code, config, options);
};
