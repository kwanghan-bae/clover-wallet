import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

/**
 * @description 로컬 개발 모드용 dev 유저 시드.
 * ssoQualifier = email 형태로 멱등 upsert. 이메일 도메인이 .test라 prod와 충돌 없음.
 *
 * Prisma 7 + PrismaPg 어댑터 런타임과 동일한 어댑터를 사용해야 한다
 * (apps/backend/src/prisma/prisma.service.ts 참고).
 */
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('[seed] DATABASE_URL is not set');
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const DEV_EMAILS = ['dev1@local.test', 'dev2@local.test', 'dev3@local.test'];

async function main() {
  for (const email of DEV_EMAILS) {
    const user = await prisma.user.upsert({
      where: { ssoQualifier: email },
      create: { ssoQualifier: email, email, age: 0, locale: 'ko' },
      update: {},
    });
    console.log(`[seed] dev user ready: id=${user.id} email=${email}`);
  }
}

main()
  .catch((e) => {
    console.error('[seed] failed:', e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
