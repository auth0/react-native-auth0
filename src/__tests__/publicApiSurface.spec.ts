import * as path from 'path';
import * as ts from 'typescript';
import { FROZEN_PUBLIC_API } from './fixtures/frozenPublicApi';

/**
 * Loads `src/index.ts` through the TypeScript compiler and returns its
 * checker plus a name -> symbol map of its exports.
 *
 * A runtime `import * from '../index'` cannot be used here: most of the surface
 * is type-only and erased at runtime, so it would silently miss regressions in
 * the exported types — which are just as breaking as a missing class.
 */
function resolvePublicExportSymbols(): {
  checker: ts.TypeChecker;
  exports: Map<string, ts.Symbol>;
} {
  const projectRoot = path.resolve(__dirname, '..', '..');
  const configPath = path.join(projectRoot, 'tsconfig.json');
  const entryPoint = path.join(projectRoot, 'src', 'index.ts');

  const config = ts.getParsedCommandLineOfConfigFile(configPath, {}, {
    ...ts.sys,
    onUnRecoverableConfigFileDiagnostic: (diagnostic) => {
      throw new Error(
        ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n')
      );
    },
  } as ts.ParseConfigFileHost);

  if (!config) {
    throw new Error(`Unable to parse ${configPath}`);
  }

  const program = ts.createProgram([entryPoint], config.options);
  const checker = program.getTypeChecker();
  const sourceFile = program.getSourceFile(entryPoint);

  if (!sourceFile) {
    throw new Error(`Unable to load ${entryPoint}`);
  }

  const moduleSymbol = checker.getSymbolAtLocation(sourceFile);

  if (!moduleSymbol) {
    throw new Error(`${entryPoint} is not a module`);
  }

  const exports = new Map(
    checker
      .getExportsOfModule(moduleSymbol)
      .map((symbol) => [symbol.getName(), symbol])
  );

  return { checker, exports };
}

describe('public API surface', () => {
  // Building a full TS program is slower than a normal unit test.
  const { checker, exports } = resolvePublicExportSymbols();
  const actual = [...exports.keys()].sort();

  it('matches the frozen v6 contract exactly', () => {
    expect(actual).toEqual([...FROZEN_PUBLIC_API].sort());
  });

  it('exports nothing that has been removed from the contract', () => {
    const frozen = new Set(FROZEN_PUBLIC_API);
    expect(actual.filter((name) => !frozen.has(name))).toEqual([]);
  });

  it('still exports everything the contract promises', () => {
    const exported = new Set(actual);
    expect(FROZEN_PUBLIC_API.filter((name) => !exported.has(name))).toEqual([]);
  });

  it('exposes the default export under a named alias', () => {
    // `default` alone is awkward for consumers doing `import { Auth0 }`.
    const defaultExport = exports.get('default');
    const namedAuth0Export = exports.get('Auth0');

    expect(defaultExport).toBeDefined();
    expect(namedAuth0Export).toBeDefined();

    const resolve = (symbol: ts.Symbol) =>
      symbol.flags & ts.SymbolFlags.Alias
        ? checker.getAliasedSymbol(symbol)
        : symbol;

    // Both names must resolve to the exact same underlying symbol, not just
    // both happen to exist.
    expect(resolve(defaultExport!)).toBe(resolve(namedAuth0Export!));
  });
});
