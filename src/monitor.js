import { sendPostAlert } from './email.js';
import { fetchPosts } from './truthSocialSource.js';

export class TruthSocialMonitor {
  constructor({ config, stateStore, logger = console }) {
    this.config = config;
    this.stateStore = stateStore;
    this.logger = logger;
    this.timer = null;
    this.isChecking = false;
  }

  start() {
    this.logger.info('Truth Social monitor started.');
    void this.checkOnce();
    this.timer = setInterval(() => void this.checkOnce(), this.config.pollIntervalMs);
  }

  stop() {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
  }

  async checkOnce() {
    if (this.isChecking) {
      this.logger.warn('Previous check is still running; skipping this interval.');
      return;
    }

    this.isChecking = true;
    try {
      const posts = await fetchPosts(this.config);
      if (posts.length === 0) {
        this.logger.info('No posts returned by source.');
        return;
      }

      const state = await this.stateStore.read();
      const latestPost = posts[0];

      if (!state.lastPostId) {
        if (this.config.sendInitialAlerts) {
          await this.alertAndCheckpoint([latestPost]);
          this.logger.info(`Initial alert sent for post ${latestPost.id}.`);
        } else {
          await this.stateStore.writeLastPostId(latestPost.id);
          this.logger.info(`Initial checkpoint set to post ${latestPost.id}.`);
        }
        return;
      }

      if (latestPost.id === state.lastPostId) {
        this.logger.info('No new posts detected.');
        return;
      }

      const lastSeenIndex = posts.findIndex((post) => post.id === state.lastPostId);
      const newPosts =
        lastSeenIndex === -1
          ? [latestPost]
          : posts.slice(0, lastSeenIndex).reverse();

      if (lastSeenIndex === -1) {
        this.logger.warn(
          `Last checkpoint ${state.lastPostId} was not in the fetched page; alerting only on newest post ${latestPost.id}.`
        );
      }

      await this.alertAndCheckpoint(newPosts);
      this.logger.info(`Processed ${newPosts.length} new post(s).`);
    } catch (error) {
      this.logger.error(`Monitor check failed: ${error.stack ?? error.message}`);
    } finally {
      this.isChecking = false;
    }
  }

  async alertAndCheckpoint(posts) {
    for (const post of posts) {
      await sendPostAlert(this.config, post);
      await this.stateStore.writeLastPostId(post.id);
      this.logger.info(`Alert sent and checkpoint updated for post ${post.id}.`);
    }
  }
}
