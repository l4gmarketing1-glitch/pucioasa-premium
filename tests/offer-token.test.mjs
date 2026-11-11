import test from 'node:test';
import assert from 'node:assert/strict';
import {createOfferToken,readOfferToken,offerDurationMs} from '../lib/offer-token.mjs';
const secret='test-only-secret-not-for-deployment-123456789';
test('visitor offers last exactly 86 minutes and expired records are retained',()=>{
 const now=Date.now(),token=createOfferToken(secret,now);
 assert.deepEqual(readOfferToken(token,secret,now),{issuedAt:now,expiresAt:now+86*60000});
 assert.equal(readOfferToken(token,secret,now+offerDurationMs+1).expiresAt,now+offerDurationMs);
});
test('offer expiry cannot be changed without the signing secret',()=>{
 const now=Date.now(),token=createOfferToken(secret,now),parts=token.split('.');
 const data=JSON.parse(Buffer.from(parts[0],'base64url').toString());data.expiresAt+=86400000;
 const forged=Buffer.from(JSON.stringify(data)).toString('base64url')+'.'+parts[1];
 assert.equal(readOfferToken(forged,secret,now),null);
 assert.equal(readOfferToken(token,'a-different-signing-secret-at-least-32-characters',now),null);
 for(const value of [null,'bad','abc.def','.'.repeat(600)]) assert.equal(readOfferToken(value,secret,now),null);
 assert.equal(readOfferToken(createOfferToken(secret,now+60000),secret,now),null);
});
