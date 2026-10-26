import { it } from 'vitest';

/**
 * A test that asserts the correct behaviour for a defect that is still open.
 * It passes while the defect reproduces and fails once it stops reproducing,
 * so the marker is removed and the test stays as a regression check.
 *
 * Set SHOW_KNOWN_DEFECTS=1 to run these as ordinary tests and see the actual
 * assertion each defect breaks.
 */
export function knownDefect(defectId: string, title: string, run: () => void | Promise<void>) {
  const name = `[known defect ${defectId}] ${title}`;
  if (process.env.SHOW_KNOWN_DEFECTS === '1') {
    it(name, run);
  } else {
    it.fails(name, run);
  }
}
