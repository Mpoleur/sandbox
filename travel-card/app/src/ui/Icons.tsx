import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';
import { colors } from './theme';

// Self-drawn icons, 24 dp, 2 dp stroke, round caps (App Style Sheet 4). No icon font.
interface IconProps {
  size?: number;
  color?: string;
}

const base = { viewBox: '0 0 24 24', fill: 'none', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;

export function MoreIcon({ size = 24, color = colors.onSurface }: IconProps) {
  return (
    <Svg width={size} height={size} {...base}>
      <Circle cx="12" cy="5" r="1.6" fill={color} stroke={color} />
      <Circle cx="12" cy="12" r="1.6" fill={color} stroke={color} />
      <Circle cx="12" cy="19" r="1.6" fill={color} stroke={color} />
    </Svg>
  );
}

export function PlusIcon({ size = 24, color = colors.onPrimary }: IconProps) {
  return (
    <Svg width={size} height={size} {...base} stroke={color}>
      <Path d="M12 5v14M5 12h14" />
    </Svg>
  );
}

export function SearchIcon({ size = 24, color = colors.onSurfaceMuted }: IconProps) {
  return (
    <Svg width={size} height={size} {...base} stroke={color}>
      <Circle cx="11" cy="11" r="6.5" />
      <Path d="M16 16l4.5 4.5" />
    </Svg>
  );
}

export function StarIcon({ size = 24, color = colors.primary }: IconProps) {
  return (
    <Svg width={size} height={size} {...base} stroke={color} fill={color}>
      <Path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.9L12 16.9l-5.2 2.8 1-5.9L3.5 9.7l5.9-.8z" />
    </Svg>
  );
}

export function ArrowIcon({ size = 24, color = colors.primary, down = false }: IconProps & { down?: boolean }) {
  return (
    <Svg width={size} height={size} {...base} stroke={color}>
      <Path d={down ? 'M12 5v14M6 13l6 6 6-6' : 'M12 19V5M6 11l6-6 6 6'} />
    </Svg>
  );
}
