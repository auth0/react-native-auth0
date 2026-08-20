import * as Classes from '../classes';
import * as Hooks from '../hooks';
import * as Enums from '../enums';
import * as DocsBarrel from '../index';
import { FROZEN_PUBLIC_API } from '../../__tests__/fixtures/frozenPublicApi';

/**
 * `src/exports/*` exists only for TypeDoc navigation grouping. Every runtime
 * export it re-exports comes from `src/index.ts`, so a name can only appear
 * here if it is also part of the frozen public surface — this test just
 * confirms that stays true (the `export { X } from '../index'` lines in
 * classes.ts/hooks.ts/enums.ts already make it a compile error otherwise).
 */
describe('docs export barrel', () => {
  const frozen = new Set(FROZEN_PUBLIC_API);

  it('exposes exactly the four TypeDoc namespaces', () => {
    expect(Object.keys(DocsBarrel).sort()).toEqual([
      'Classes',
      'Enums',
      'Hooks',
      'Interface',
    ]);
  });

  it.each([
    ['Classes', Classes],
    ['Hooks', Hooks],
    ['Enums', Enums],
  ])(
    'every named export in %s is part of the frozen public surface',
    (_name, namespace) => {
      expect(
        Object.keys(namespace).filter((name) => !frozen.has(name))
      ).toEqual([]);
    }
  );
});
