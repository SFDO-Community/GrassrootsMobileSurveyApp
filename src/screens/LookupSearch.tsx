import React, { useState, useEffect } from 'react';
import { Button, FlatList, SafeAreaView, Text, View, StyleSheet } from 'react-native';
import { Input, Divider } from 'react-native-elements';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/core';

import { useDispatch } from '../state/surveyEditorState';
import { getAllRecordsWithCallback } from '../services/database/database';
import { ListItem } from '../components';

import Constants from 'expo-constants';
import { APP_FONTS, APP_THEME, DB_TABLE } from '../constants';

import { StackParamList } from '../Router';
import { SQLiteContact } from '../types/sqlite';

type LookupSearchNavigationProp = StackNavigationProp<StackParamList, 'SurveyEditor'>;
type LookupSearchRouteProp = RouteProp<StackParamList, 'SurveyEditor'>;

type LookupSearchProps = {
  route: LookupSearchRouteProp;
  navigation: LookupSearchNavigationProp;
};
/**
 * @description Lookup search modal screen. Defined in router.tsx and called from lookup component (components/surveyEditor/lookup.tsx).
 */
export default function LookupSearch({ navigation, route }: LookupSearchProps) {
  const fieldName = route.params.fieldName;
  const title = route.params.title;
  const [searchTerm, setSearchTerm] = useState('');
  const [result, setResult] = useState<Array<SQLiteContact>>([]);

  const dispatchSurvey = useDispatch();

  useEffect(() => {
    const loadRecords = async () => {
      await getAllRecordsWithCallback(DB_TABLE.CONTACT, setResult);
    };
    loadRecords();
  }, []);

  const filteredResult = searchTerm ? result.filter(r => r.name.includes(searchTerm)) : result;

  return (
    <SafeAreaView style={{ paddingTop: Constants.statusBarHeight }}>
      <View style={styles.headerStyle}>
        <Button onPress={() => navigation.goBack()} title="Cancel" />
        <Text style={styles.labelStyle}>{title}</Text>
      </View>
      <View>
        <Input
          placeholder={`Search ${title}`}
          inputContainerStyle={styles.inputContainerStyle}
          renderErrorMessage={false}
          inputStyle={styles.inputStyle}
          onChangeText={value => setSearchTerm(value)}
          rightIcon={{ name: 'search', color: APP_THEME.APP_LIGHT_FONT_COLOR }}
        />
      </View>
      <View style={styles.resultContainerStyle}>
        <FlatList
          keyExtractor={(item, index) => {
            return index.toString();
          }}
          data={filteredResult}
          renderItem={({ item }) => (
            <ListItem
              title={item.name}
              onPress={() => {
                dispatchSurvey({ type: 'UPDATE', field: { name: fieldName, value: item.id } });
                navigation.goBack();
              }}
            />
          )}
          ItemSeparatorComponent={() => <Divider style={{ backgroundColor: APP_THEME.APP_BORDER_COLOR }} />}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  headerStyle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 5,
  },
  labelStyle: {
    fontWeight: '600',
    flexGrow: 1,
    fontSize: 18,
    textAlign: 'center',
  },
  inputContainerStyle: {
    backgroundColor: APP_THEME.APP_WHITE,
    height: 40,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: APP_THEME.APP_BORDER_COLOR,
  },
  inputStyle: {
    paddingLeft: 5,
    fontSize: 16,
    fontFamily: APP_FONTS.FONT_REGULAR,
  },
  resultContainerStyle: {
    paddingTop: 10,
  },
});
