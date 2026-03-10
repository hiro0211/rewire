import React from 'react';
import { View } from 'react-native';

const DateTimePicker = (props: any) => (
  <View
    testID="date-picker"
    {...props}
    onChange={(e: any) =>
      props.onChange?.(e, props.value || new Date('2026-01-15'))
    }
  />
);

export default DateTimePicker;
