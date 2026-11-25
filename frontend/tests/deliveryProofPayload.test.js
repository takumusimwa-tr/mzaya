import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildDeliveryProofPayload as build } from '../src/api/deliveryProofPayload.js'
test('recipient payload is trimmed and excludes unrelated evidence', () => assert.deepEqual(build({proofType:'recipient_confirmation',recipientName:' Ada ',assetUrl:'https://example.com/a',notes:' ok '}),{proof_type:'recipient_confirmation',recipient_name:'Ada',notes:'ok'}))
test('photo and signature use separate fields', () => { for (const type of ['photo','signature']) assert.deepEqual(build({proofType:type,assetUrl:'https://example.com/a'}),{proof_type:type,[`${type}_url`]:'https://example.com/a'}) })
test('OTP is unavailable', () => assert.throws(() => build({proofType:'otp'})))
test('missing recipient rejected', () => assert.throws(() => build({proofType:'recipient_confirmation',recipientName:' '})))
test('unsafe URLs rejected', () => { for (const assetUrl of ['http://example.com','javascript:alert(1)','https://a:b@example.com','invalid']) assert.throws(() => build({proofType:'photo',assetUrl})) })
test('field limits enforced', () => assert.throws(() => build({proofType:'recipient_confirmation',recipientName:'a'.repeat(121)})))
