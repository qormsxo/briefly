import { postgresSsl, typeormNestOptions } from './typeorm.config';

describe('typeormNestOptions', () => {
  const env = {
    DATABASE_URL: 'postgresql://briefly:briefly@localhost:5432/briefly',
    DATABASE_SSL: 'false',
  };

  it('enables synchronize only outside production', () => {
    expect(typeormNestOptions({ ...env, NODE_ENV: 'development' }).synchronize).toBe(
      true,
    );
    expect(typeormNestOptions({ ...env, NODE_ENV: 'production' }).synchronize).toBe(
      false,
    );
  });

  it('enables ssl when DATABASE_SSL is true', () => {
    expect(postgresSsl('true')).toEqual({ rejectUnauthorized: false });
    expect(postgresSsl('false')).toBe(false);
  });
});
