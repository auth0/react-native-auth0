import React from 'react';
import { Text, View } from 'react-native';

type Props = {
  title: string;
  children: React.ReactNode;
};

// A feature section: a heading followed by its controls, separated by spacing.
const Section = ({ title, children }: Props) => (
  <View style={{ gap: 8 }}>
    <Text style={{ fontWeight: 'bold' }}>{title}</Text>
    {children}
  </View>
);

export default Section;
