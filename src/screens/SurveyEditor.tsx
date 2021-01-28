import React, { useState, useEffect, useContext, useLayoutEffect } from 'react';
import { Button, View, Text, StyleSheet } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/core';
import { KeyboardAwareSectionList } from 'react-native-keyboard-aware-scroll-view';
// component
import SurveyEditorItem from './SurveyEditorItem';
// state
import LocalizationContext from '../context/localizationContext';
import { useSelector, useDispatch } from '../state/surveyEditorState';
// services
import { getRecords } from '../services/database/database';
import { buildLayoutDetail } from '../services/describe';
import { notifyError, notifySuccess } from '../utility/notification';
import { upsertLocalSurvey } from '../services/database/localSurvey';
// constatns
import { APP_THEME, APP_FONTS, DB_TABLE, SYNC_STATUS_UNSYNCED } from '../constants';
// types
import { SurveyLayout } from '../types/survey';
import { SQLiteSurvey, SQLiteRecordType } from '../types/sqlite';
import { StackParamList } from '../Router';
type SurveyEditorNavigationProp = StackNavigationProp<StackParamList, 'SurveyEditor'>;
type SurveyEditorRouteProp = RouteProp<StackParamList, 'SurveyEditor'>;

type Props = {
  route: SurveyEditorRouteProp;
  navigation: SurveyEditorNavigationProp;
};

export default function SurveyEditor({ route, navigation }: Props) {
  const [layout, setLayout] = useState<SurveyLayout>({});
  const [doneButtonDisabled, setDoneButtonDisabled] = useState(false);
  const survey = useSelector(state => state.survey);
  const dispatchSurvey = useDispatch();

  const { t } = useContext(LocalizationContext);

  const MODE = route.params._localId ? 'EDIT_OR_VIEW' : 'NEW';

  const requiredFields: Array<string> = layout.sections
    ? layout.sections.map(s => s.data.filter(f => f.required).map(f => f.name)).flat()
    : [];

  const missingRequiredFields = survey => {
    for (const requiredField of requiredFields) {
      if (!survey[requiredField]) {
        return true;
      }
    }
    return false;
  };

  useEffect(() => {
    setDoneButtonDisabled(true);
    const fetch = async () => {
      if (MODE === 'NEW') {
        dispatchSurvey({ type: 'LOAD', detail: { _syncStatus: SYNC_STATUS_UNSYNCED } });
        const result = await buildLayoutDetail(route.params.selectedLayoutId);
        setLayout(result);
      } else if (MODE === 'EDIT_OR_VIEW') {
        // query existing survey from local database
        const storedSurveys: Array<SQLiteSurvey> = await getRecords(
          DB_TABLE.SURVEY,
          `where _localId = ${route.params._localId}`
        );
        const storedRecordTypes: Array<SQLiteRecordType> = await getRecords(
          DB_TABLE.RECORD_TYPE,
          `where RecordTypeId ='${storedSurveys[0].RecordTypeId}'`
        );
        console.log(JSON.stringify(storedSurveys[0])); // TODO: REMOVE
        dispatchSurvey({ type: 'LOAD', detail: storedSurveys[0] });
        const result = await buildLayoutDetail(storedRecordTypes[0].layoutId);
        setLayout(result);
      }
    };
    fetch();
    setDoneButtonDisabled(false);
  }, []);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => SaveButton(),
    });
  }, [navigation, survey, layout]);

  const SaveButton = () => {
    return (
      survey &&
      survey._syncStatus === SYNC_STATUS_UNSYNCED && (
        <Button
          onPress={async () => {
            setDoneButtonDisabled(true);
            if (missingRequiredFields(survey)) {
              setDoneButtonDisabled(false);
              notifyError('Please enter required fields.');
              return;
            }
            // For new survey, use record type id passed from picker screen. For existing survey, use stored record type id.
            const recordTypeId = route.params.selectedRecordTypeId || survey.RecordTypeId;
            const record = { ...survey, RecordTypeId: recordTypeId };
            await upsertLocalSurvey(record);
            dispatchSurvey({ type: 'CLEAR' });
            notifySuccess(`${survey._localId ? 'Updated the survey!' : 'Created a new survey!'}`);
            navigation.navigate('SurveyList');
          }}
          disabled={doneButtonDisabled}
          title={t('SAVE')}
        />
      )
    );
  };

  return (
    <View style={{ flex: 1 }}>
      {layout.sections && (
        <KeyboardAwareSectionList
          sections={layout.sections}
          keyExtractor={item => item.name}
          renderSectionHeader={({ section: { title } }) => (
            <View style={styles.headerView}>
              <Text style={styles.sectionTitle}>{title.toUpperCase()}</Text>
            </View>
          )}
          renderItem={({ item }) => (
            <SurveyEditorItem
              navigation={navigation}
              title={item.label}
              name={item.name}
              type={item.type}
              required={item.required}
            />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  headerView: {
    backgroundColor: APP_THEME.APP_LIST_HEADER_COLOR,
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 10,
    color: APP_THEME.APP_LIGHT_FONT_COLOR,
    letterSpacing: 0.42,
    padding: 10,
    fontFamily: APP_FONTS.FONT_REGULAR,
  },
  flex1: {
    flex: 1,
  },
  inputButton: { width: '40%', alignSelf: 'center', paddingTop: 20 },
});
