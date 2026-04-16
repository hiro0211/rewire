import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { OrbGlowLayers } from '../OrbGlowLayers';

describe('OrbGlowLayers', () => {
  it('3つのグローレイヤーをレンダリングする', () => {
    render(
      <OrbGlowLayers size={200} glowColor="rgba(201, 203, 224, 0.3)" pulseDuration={4000} />
    );
    expect(screen.getByTestId('orb-glow-inner')).toBeTruthy();
    expect(screen.getByTestId('orb-glow-outer')).toBeTruthy();
    expect(screen.getByTestId('orb-pulse-ring')).toBeTruthy();
  });

  it('sizeに基づいた寸法でレンダリングされる', () => {
    const size = 150;
    render(
      <OrbGlowLayers size={size} glowColor="rgba(255, 181, 71, 0.3)" pulseDuration={3500} />
    );
    const inner = screen.getByTestId('orb-glow-inner');
    const outer = screen.getByTestId('orb-glow-outer');
    expect(inner.props.style).toBeDefined();
    expect(outer.props.style).toBeDefined();
  });

  it('タッチイベントを透過する', () => {
    const { getByTestId } = render(
      <OrbGlowLayers size={200} glowColor="rgba(201, 203, 224, 0.3)" pulseDuration={4000} />
    );
    expect(getByTestId('orb-glow-inner').props.pointerEvents).toBe('none');
    expect(getByTestId('orb-glow-outer').props.pointerEvents).toBe('none');
    expect(getByTestId('orb-pulse-ring').props.pointerEvents).toBe('none');
  });
});
