import React from 'react';
import { Text } from 'react-native';
import { render, act } from '@testing-library/react-native';
import { CountdownTimer } from '../CountdownTimer';

describe('CountdownTimer', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('初期値を MM:SS で表示する', () => {
    const { getByTestId } = render(<CountdownTimer initialSeconds={300} />);
    expect(getByTestId('countdown-timer').props.children).toBe('05:00');
  });

  it('1秒後にデクリメントされる', () => {
    const { getByTestId } = render(<CountdownTimer initialSeconds={300} />);
    act(() => { jest.advanceTimersByTime(1000); });
    expect(getByTestId('countdown-timer').props.children).toBe('04:59');
  });

  it('0で停止する', () => {
    const { getByTestId } = render(<CountdownTimer initialSeconds={2} />);
    act(() => { jest.advanceTimersByTime(3000); });
    expect(getByTestId('countdown-timer').props.children).toBe('00:00');
  });

  it('60秒未満のフォーマット', () => {
    const { getByTestId } = render(<CountdownTimer initialSeconds={45} />);
    expect(getByTestId('countdown-timer').props.children).toBe('00:45');
  });

  it('0になったときonExpireコールバックが呼ばれる', () => {
    const onExpire = jest.fn();
    render(<CountdownTimer initialSeconds={1} onExpire={onExpire} />);
    act(() => { jest.advanceTimersByTime(1000); });
    expect(onExpire).toHaveBeenCalledTimes(1);
  });

  it('onExpireが未指定でもエラーにならない', () => {
    const { getByTestId } = render(<CountdownTimer initialSeconds={1} />);
    act(() => { jest.advanceTimersByTime(1000); });
    expect(getByTestId('countdown-timer').props.children).toBe('00:00');
  });

  it('3600秒以上のときHH:MM:SS形式で表示する', () => {
    // 23時間59分59秒 = 86399秒
    const { getByTestId } = render(<CountdownTimer initialSeconds={86399} />);
    expect(getByTestId('countdown-timer').props.children).toBe('23:59:59');
  });

  it('ちょうど1時間のときHH:MM:SS形式で表示する', () => {
    const { getByTestId } = render(<CountdownTimer initialSeconds={3600} />);
    expect(getByTestId('countdown-timer').props.children).toBe('01:00:00');
  });

  it('3600秒未満のときはMM:SS形式のまま', () => {
    const { getByTestId } = render(<CountdownTimer initialSeconds={3599} />);
    expect(getByTestId('countdown-timer').props.children).toBe('59:59');
  });

  it('onExpireはsetState外のuseEffectから呼ばれる（レンダリング中にエラーを起こさない）', () => {
    const onExpire = jest.fn();
    // onExpireが親のstateを更新してもエラーにならないことを検証
    const Parent = () => {
      const [expired, setExpired] = React.useState(false);
      return (
        <>
          <CountdownTimer initialSeconds={1} onExpire={() => setExpired(true)} />
          {expired && <Text testID="expired">Expired</Text>}
        </>
      );
    };
    const { getByTestId } = render(<Parent />);
    // これがsetState内から呼ばれていると "Cannot update a component while rendering a different component" エラー
    act(() => { jest.advanceTimersByTime(1000); });
    expect(getByTestId('expired')).toBeTruthy();
  });
});
