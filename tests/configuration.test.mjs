import test from 'node:test';
import assert from 'node:assert/strict';
import {storeConfigurationIssues,adminConfigurationIssues} from '../lib/configuration.mjs';

const ready={STORE_LIVE:'true',PRODUCT_CONFIRMED:'true',LEGAL_CONFIRMED:'true',STRIPE_SECRET_KEY:'sk_test_private_fixture',NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:'pk_test_public_fixture',BUSINESS_NAME:'private merchant',BUSINESS_ADDRESS:'private address',CONTACT_EMAIL:'private@example.invalid',DELIVERY_ESTIMATE:'48h',RETURN_ADDRESS:'private return'};

test('diagnostics identify every missing checkout setting without requiring CUI',()=>{
  assert.deepEqual(storeConfigurationIssues(ready),[]);
  for(const variable of Object.keys(ready)) {
    const issues=storeConfigurationIssues({...ready,[variable]:''});
    assert.ok(issues.some(issue=>issue.variable.includes(variable)),variable);
  }
});
test('diagnostics retain strict confirmation flags and matched Stripe modes',()=>{
  for(const value of ['false','TRUE','true ','"true"']) {
    assert.equal(storeConfigurationIssues({...ready,LEGAL_CONFIRMED:value})[0].variable,'LEGAL_CONFIRMED');
  }
  assert.deepEqual(storeConfigurationIssues({...ready,STRIPE_SECRET_KEY:'sk_live_private',NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:'pk_live_public'}),[]);
  assert.equal(storeConfigurationIssues({...ready,STRIPE_SECRET_KEY:'sk_live_private'})[0].variable,'STRIPE_SECRET_KEY / NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY');
});
test('timer and administrator secrets retain minimum-length checks',()=>{
  for(const value of ['', 'x'.repeat(31)]) {
    assert.equal(adminConfigurationIssues({ADMIN_PASSWORD:value})[0].variable,'ADMIN_PASSWORD');
    assert.equal(storeConfigurationIssues({...ready,VISITOR_OFFER_ENABLED:'true',OFFER_SIGNING_SECRET:value})[0].variable,'OFFER_SIGNING_SECRET');
  }
  assert.deepEqual(adminConfigurationIssues({ADMIN_PASSWORD:'x'.repeat(32)}),[]);
  assert.deepEqual(storeConfigurationIssues({...ready,VISITOR_OFFER_ENABLED:'true',OFFER_SIGNING_SECRET:'x'.repeat(32)}),[]);
  assert.deepEqual(storeConfigurationIssues({...ready,VISITOR_OFFER_ENABLED:'false'}),[]);
});
test('diagnostic output never includes supplied secrets or user-defined configuration values',()=>{
  const values={...ready,LEGAL_CONFIRMED:'private-wrong-flag',STRIPE_SECRET_KEY:'private-bad-key',ADMIN_PASSWORD:'private-password',VISITOR_OFFER_ENABLED:'true',OFFER_SIGNING_SECRET:'private-offer-secret'};
  const output=JSON.stringify([storeConfigurationIssues(values),adminConfigurationIssues(values)]);
  for(const value of Object.values(values).filter(value=>value.startsWith('private'))) assert.ok(!output.includes(value));
});
