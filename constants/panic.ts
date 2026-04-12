/**
 * Panic screen constants.
 *
 * - SIDE_EFFECTS: 6 side effect cards shown on the panic screen
 * - TYPEWRITER_MESSAGES: 7 rotating messages shown in the capsule overlay
 * - TYPEWRITER_CONFIG: animation timing for the typewriter capsule
 * - CAMERA_ASPECT_RATIO: front camera preview aspect ratio
 */

import type { ComponentProps } from 'react';
import type { Ionicons } from '@expo/vector-icons';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

export interface SideEffect {
  id: string;
  icon: IoniconName;
  iconColor: string;
  titleKey: string;
  descriptionKey: string;
}

export const SIDE_EFFECTS: SideEffect[] = [
  {
    id: 'selfHate',
    icon: 'sad-outline',
    iconColor: '#F472B6', // pink
    titleKey: 'panic.sideEffects.selfHate.title',
    descriptionKey: 'panic.sideEffects.selfHate.description',
  },
  {
    id: 'numbness',
    icon: 'pulse-outline',
    iconColor: '#FB923C', // orange
    titleKey: 'panic.sideEffects.numbness.title',
    descriptionKey: 'panic.sideEffects.numbness.description',
  },
  {
    id: 'ed',
    icon: 'help-circle-outline',
    iconColor: '#A78BFA', // purple
    titleKey: 'panic.sideEffects.ed.title',
    descriptionKey: 'panic.sideEffects.ed.description',
  },
  {
    id: 'willpower',
    icon: 'power-outline',
    iconColor: '#34D399', // green
    titleKey: 'panic.sideEffects.willpower.title',
    descriptionKey: 'panic.sideEffects.willpower.description',
  },
  {
    id: 'focus',
    icon: 'alert-circle-outline',
    iconColor: '#FBBF24', // yellow/orange
    titleKey: 'panic.sideEffects.focus.title',
    descriptionKey: 'panic.sideEffects.focus.description',
  },
  {
    id: 'isolation',
    icon: 'person-add-outline',
    iconColor: '#2DD4BF', // teal
    titleKey: 'panic.sideEffects.isolation.title',
    descriptionKey: 'panic.sideEffects.isolation.description',
  },
];

export const TYPEWRITER_MESSAGE_KEYS = [
  'panic.messages.m1',
  'panic.messages.m2',
  'panic.messages.m3',
  'panic.messages.m4',
  'panic.messages.m5',
  'panic.messages.m6',
  'panic.messages.m7',
] as const;

export const TYPEWRITER_CONFIG = {
  ENTER_DURATION_MS: 300,
  CHAR_INTERVAL_MS: 45,
  HOLD_DURATION_MS: 900,
  EXIT_DURATION_MS: 400,
  INTERVAL_MS: 150,
} as const;

export const CAMERA_ASPECT_RATIO = 4 / 3;
