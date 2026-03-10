import { logger } from '../logger';

describe('logger', () => {
  const originalDev = (global as any).__DEV__;

  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'warn').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
    (global as any).__DEV__ = true;
    logger.setLevel('debug');
  });

  afterEach(() => {
    jest.restoreAllMocks();
    (global as any).__DEV__ = originalDev;
  });

  it('errorレベルでconsole.errorが呼ばれる', () => {
    logger.error('Test', 'something failed');
    expect(console.error).toHaveBeenCalledWith('[Test]', 'something failed');
  });

  it('warnレベルでconsole.warnが呼ばれる', () => {
    logger.warn('Test', 'something warned');
    expect(console.warn).toHaveBeenCalledWith('[Test]', 'something warned');
  });

  it('infoレベルでconsole.logが呼ばれる', () => {
    logger.info('Test', 'info message');
    expect(console.log).toHaveBeenCalledWith('[Test]', 'info message');
  });

  it('debugレベルでconsole.logが呼ばれる', () => {
    logger.debug('Test', 'debug message');
    expect(console.log).toHaveBeenCalledWith('[Test]', 'debug message');
  });

  it('レベルがerrorの場合warnは出力されない', () => {
    logger.setLevel('error');
    logger.warn('Test', 'should not appear');
    expect(console.warn).not.toHaveBeenCalled();
  });

  it('レベルがerrorの場合errorは出力される', () => {
    logger.setLevel('error');
    logger.error('Test', 'should appear');
    expect(console.error).toHaveBeenCalledWith('[Test]', 'should appear');
  });

  it('レベルがwarnの場合infoは出力されない', () => {
    logger.setLevel('warn');
    logger.info('Test', 'should not appear');
    expect(console.log).not.toHaveBeenCalled();
  });

  it('複数の引数を渡せる', () => {
    const err = new Error('test error');
    logger.error('Tag', 'msg', err, { extra: true });
    expect(console.error).toHaveBeenCalledWith('[Tag]', 'msg', err, { extra: true });
  });
});
