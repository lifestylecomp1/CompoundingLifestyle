import bcrypt from 'bcryptjs';
import { createPartner } from './index.js';

/**
 * Seeds the database with demo partners if empty.
 * Run: npm run db:seed
 */
async function seed() {
  const { countPartners } = await import('./index.js');
  const count = countPartners();
  if (count > 0) {
    console.log('Database already has partners. Skipping seed.');
    return;
  }

  const hash = await bcrypt.hash('partner123', 12);
  createPartner('partner-1', 'demo@provider.com', 'Demo Provider', hash);
  createPartner('partner-2', 'rep@example.com', 'Sales Rep', hash);

  console.log('Seeded 2 demo partners:');
  console.log('  - demo@provider.com / partner123');
  console.log('  - rep@example.com / partner123');
}

seed().catch(console.error);
