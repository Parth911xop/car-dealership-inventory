import { execSync } from 'child_process';
import * as dotenv from 'dotenv';

module.exports = async () => {
  dotenv.config({ path: '.env.test' });
  // Push the schema to the test database before tests run
  execSync('npx prisma migrate deploy', {
    env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL },
    stdio: 'inherit',
  });
};
