import { promises as fs } from 'fs';

export async function exportFlow(name: string, data: unknown): Promise<void> {
  const path = `packages/n8n-flows/${name}.json`;
  await fs.writeFile(path, JSON.stringify(data, null, 2), 'utf8');
}

// Example usage when running this file directly
if (require.main === module) {
  exportFlow('sample', { name: 'sample', nodes: [] });
}
