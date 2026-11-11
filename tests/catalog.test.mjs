import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import {colors,validateSelection,product,activeDeadline} from '../lib/catalog.mjs';
test('19 unique variants resolve to supplied photographs',()=>{assert.equal(colors.length,19);assert.equal(new Set(colors.map(c=>c.id)).size,19);for(const c of colors)assert.ok(existsSync(new URL('../public'+c.image,import.meta.url)));});
test('checkout selection rejects unknown variants and unsafe quantities',()=>{for(const input of [null,{}, {color:'missing',quantity:1},{color:'v01',quantity:0},{color:'v01',quantity:6},{color:'v01',quantity:1.5},{color:'v01',quantity:'2'}])assert.equal(validateSelection(input),null);});
test('checkout selection ignores client supplied price',()=>{assert.deepEqual(validateSelection({color:'v19',quantity:2,amount:1}),{color:'v19',quantity:2});assert.equal(product.amount,16900);});
test('deadline is absolute and does not reset after expiry',()=>{const now=Date.parse('2026-01-01T00:00:00Z');assert.equal(activeDeadline('2026-01-01T01:00:00Z',now),now+3600000);assert.equal(activeDeadline('2026-01-01T01:00:00Z',now+3600001),null);assert.equal(activeDeadline('',now),null);assert.equal(activeDeadline('invalid',now),null);});
