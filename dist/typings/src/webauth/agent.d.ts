export default class Agent {
  show(
    url: string,
    ephemeralSession?: boolean,
    skipLegacyListener?: boolean,
    closeOnLoad?: boolean
  ): Promise<string | undefined>;
  newTransaction(): Promise<unknown>;
}
