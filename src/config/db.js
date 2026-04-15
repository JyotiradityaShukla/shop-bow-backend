require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const toPostgresParams = (sql) => {
  let index = 0;
  return sql.replace(/\?/g, () => `$${++index}`);
};

const normalizeInsertSql = (sql) => {
  if (!/^\s*insert\b/i.test(sql)) return sql;
  if (/\breturning\b/i.test(sql)) return sql;
  return `${sql.trimEnd()} RETURNING id`;
};

const runQuery = async (client, sql, params = []) => {
  const baseSql = toPostgresParams(sql);
  const normalizedSql = normalizeInsertSql(baseSql);
  const command = normalizedSql.trim().split(/\s+/)[0].toUpperCase();

  if (command === 'SELECT' || command === 'WITH') {
    const rows = await client.$queryRawUnsafe(normalizedSql, ...params);
    return [rows];
  }

  if (command === 'INSERT') {
    const rows = await client.$queryRawUnsafe(normalizedSql, ...params);
    return [{ insertId: rows?.[0]?.id ?? null, affectedRows: rows.length }];
  }

  if (command === 'UPDATE' || command === 'DELETE') {
    const affectedRows = await client.$executeRawUnsafe(normalizedSql, ...params);
    return [{ affectedRows }];
  }

  await client.$executeRawUnsafe(normalizedSql, ...params);
  return [{ affectedRows: 0 }];
};

const createAdapter = (client) => ({
  query: (sql, params = []) => runQuery(client, sql, params),
  transaction: (callback) =>
    client.$transaction(async (tx) => callback(createAdapter(tx))),
});

prisma.$connect()
  .then(() => console.log('✅ PostgreSQL connected via Prisma'))
  .catch((err) => console.error('❌ PostgreSQL connection error:', err.message));

module.exports = createAdapter(prisma);
