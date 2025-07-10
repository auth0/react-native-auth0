import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';

type Props = {
  title: string;
  result: object | null | void;
  error: Error | null;
};

const Result = ({ title, result, error }: Props) => {
  if (!result && !error) {
    return null;
  }

  const isError = !!error;
  const content = error ? error.message : JSON.stringify(result, null, 2);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <View style={[styles.resultBox, isError && styles.errorBox]}>
        <Text style={isError ? styles.errorText : styles.resultText} selectable>
          {content}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
    width: '100%',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  resultBox: {
    backgroundColor: '#E8F5E9',
    borderColor: '#A5D6A7',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
  },
  errorBox: {
    backgroundColor: '#FFEBEE',
    borderColor: '#EF9A9A',
  },
  resultText: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    color: '#1B5E20',
  },
  errorText: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    color: '#B71C1C',
  },
});

export default Result;
