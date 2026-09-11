import React from 'react';
import { Text, View } from 'react-native';

type Props = {
  result?: unknown;
  error?: Error | null;
};

// Minimal result/error display. No styling beyond spacing, per the example's
// "default React Native components only" convention.
const ResultView = ({ result, error }: Props) => {
  if (!result && !error) {
    return null;
  }
  return (
    <View style={{ marginTop: 8 }}>
      {error ? (
        <Text selectable>Error: {error.message}</Text>
      ) : (
        <Text selectable>{format(result)}</Text>
      )}
    </View>
  );
};

const format = (value: unknown): string => {
  if (typeof value === 'string') {
    return value;
  }
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
};

export default ResultView;
