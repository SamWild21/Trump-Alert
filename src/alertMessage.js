export const SAMPLE_ALERT_POST = {
  id: '116726055495215764',
  created_at: '2026-06-10T13:30:58.894Z',
  content:
    "Wow! CITI was ranked Number 1 in topping M&A Advisory Market by Value in Q1. Congratulations to Jane F and ALL of her great people. They've worked really hard! BIG comeback for CITI!!! President DONALD J. TRUMP",
  url: 'https://truthsocial.com/@realDonaldTrump/116726055495215764',
  media: [],
  replies_count: 214,
  reblogs_count: 456,
  favourites_count: 2329
};

export function buildAlertEmail(post) {
  const source = post.raw ?? post;

  return {
    subject: 'Trump Alert',
    text: `Time: ${source.created_at ?? ''}\nContent: ${source.content ?? ''}`
  };
}
