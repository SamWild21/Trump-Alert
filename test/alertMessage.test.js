import assert from 'node:assert/strict';
import test from 'node:test';
import { buildAlertEmail, SAMPLE_ALERT_POST } from '../src/alertMessage.js';

test('builds alert email from only created_at and content', () => {
  const email = buildAlertEmail(SAMPLE_ALERT_POST);

  assert.equal(email.subject, 'Trump Alert');
  assert.equal(
    email.text,
    "Time: 2026-06-10T13:30:58.894Z\nContent: Wow! CITI was ranked Number 1 in topping M&A Advisory Market by Value in Q1. Congratulations to Jane F and ALL of her great people. They've worked really hard! BIG comeback for CITI!!! President DONALD J. TRUMP"
  );
  assert.equal(email.text.includes(SAMPLE_ALERT_POST.url), false);
  assert.equal(email.text.includes(String(SAMPLE_ALERT_POST.replies_count)), false);
  assert.equal(email.text.includes(String(SAMPLE_ALERT_POST.reblogs_count)), false);
  assert.equal(email.text.includes(String(SAMPLE_ALERT_POST.favourites_count)), false);
});
