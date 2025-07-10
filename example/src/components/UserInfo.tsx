import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import type { User } from 'react-native-auth0';

type Props = {
  user: User | null;
};

const UserInfo = ({ user }: Props) => {
  if (!user) {
    return null;
  }

  return (
    <View style={styles.container}>
      {user.picture && (
        <Image style={styles.avatar} source={{ uri: user.picture }} />
      )}
      <Text style={styles.title}>{user.name}</Text>
      {Object.entries(user).map(([key, value]) => (
        <View style={styles.row} key={key}>
          <Text style={styles.label}>{key}</Text>
          <Text style={styles.value}>{String(value)}</Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    padding: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#212121',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  label: {
    fontSize: 16,
    color: '#757575',
    flex: 1,
  },
  value: {
    fontSize: 16,
    color: '#212121',
    fontWeight: '500',
    flex: 2,
    textAlign: 'right',
  },
});

export default UserInfo;
