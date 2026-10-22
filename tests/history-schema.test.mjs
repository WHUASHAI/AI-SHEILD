import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
test('empty-database bootstrap is transactional and enforces exactly one scan owner',()=>{
  const sql=readFileSync('prisma/persistent-history.sql','utf8');
  assert.match(sql,/BEGIN;/);assert.match(sql,/COMMIT;/);
  assert.match(sql,/Scan_exactly_one_owner/);
  assert.match(sql,/num_nonnulls\("userId", "guestSessionId"\) = 1/);
  assert.match(sql,/CREATE TABLE "ScanCompletion"/);
  assert.doesNotMatch(sql,/DROP TABLE|TRUNCATE/i);
});
