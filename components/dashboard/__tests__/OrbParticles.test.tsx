import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { OrbParticles } from '../OrbParticles';

describe('OrbParticles', () => {
  it('指定された数のパーティクルをレンダリングする', () => {
    render(<OrbParticles size={200} count={6} tintColor="#FFB547" />);
    expect(screen.getByTestId('orb-particles')).toBeTruthy();
    expect(screen.getAllByTestId(/^orb-particle-/)).toHaveLength(6);
  });

  it('count=0のとき空コンテナをレンダリングする', () => {
    render(<OrbParticles size={200} count={0} tintColor="#FFB547" />);
    expect(screen.getByTestId('orb-particles')).toBeTruthy();
    expect(screen.queryAllByTestId(/^orb-particle-/)).toHaveLength(0);
  });

  it('タッチイベントを透過する', () => {
    const { getByTestId } = render(
      <OrbParticles size={200} count={4} tintColor="#C9CBE0" />
    );
    expect(getByTestId('orb-particles').props.pointerEvents).toBe('none');
  });
});
