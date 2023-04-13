import { TokenBlacklistSchema } from './token-blacklist.schema';

describe('TokenBlacklistSchema', () => {
  it('should be defined', () => {
    expect(new TokenBlacklistSchema()).toBeDefined();
  });
});
