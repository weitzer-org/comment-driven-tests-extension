const { average } = require('./calculator');

describe('average', () => {
  it('should return the average of a list of numbers', () => {
    expect(average([1, 2, 3, 4, 5])).toBe(3);
  });

  it('should return 0 for an empty array', () => {
    expect(average([])).toBe(0);
  });
});
