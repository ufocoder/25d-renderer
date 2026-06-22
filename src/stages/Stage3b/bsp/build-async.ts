import {
  buildBSPTree as buildBSPTreeSync,
  collectLeaves,
} from './build';
import type { BSPNode } from './typings';

export async function buildBSPTree(
  segs: Seg[],
  maxDepth: number = 10,
  minSegments: number = 3,
  onSplitDebug?: (data: unknown) => Promise<void>,
): Promise<BSPNode> {
  const debugSteps: unknown[] = [];
  const tree = buildBSPTreeSync(
    segs,
    maxDepth,
    minSegments,
    onSplitDebug ? (data) => debugSteps.push(data) : undefined,
  );

  if (onSplitDebug) {
    for (const step of debugSteps) {
      await onSplitDebug(step);
    }
  }

  return tree;
}

export { collectLeaves };
