import React, { useState, useEffect, useLayoutEffect } from 'react';
import { Button, View, Text, StyleSheet } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/core';
import { KeyboardAwareSectionList } from 'react-native-keyboard-aware-scroll-view';
// component
import SurveyEditorItem from '../components/surveyEditor/SurveyEditorItem';
// state
import { useLocalizationContext } from '../context/localizationContext';
import { useSelector, useDispatch } from '../context/surveyEditorContext';
// services
import { getRecords } from '../services/database/database';
import { buildLayoutDetail } from '../services/layout';
import { notifyError, notifySuccess } from '../utility/notification';
import { upsertLocalSurvey } from '../services/database/localSurvey';
// constants
import { APP_THEME, APP_FONTS, DB_TABLE, SYNC_STATUS_UNSYNCED, L10N_PREFIX } from '../constants';
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

  const { t } = useLocalizationContext();

  const MODE = route.params._localId ? (survey._syncStatus === SYNC_STATUS_UNSYNCED ? 'EDIT' : 'VIEW') : 'NEW';

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
      let result;
      if (MODE === 'NEW') {
        dispatchSurvey({ type: 'LOAD', detail: { _syncStatus: SYNC_STATUS_UNSYNCED } });
        result = await buildLayoutDetail(route.params.selectedLayoutId);
      } else if (MODE === 'EDIT' || MODE === 'VIEW') {
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
        result = await buildLayoutDetail(storedRecordTypes[0].layoutId);
      }
      setLayout({
        sections: result.sections.map(s => ({ ...s, title: t(`${L10N_PREFIX.PageLayoutSectionId}${s.id}`) })),
      });
    };
    fetch();
    setDoneButtonDisabled(false);
  }, []);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => SaveButton(),
      title: t(`${MODE}_SURVEY`),
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
              notifyError(t('SURVEY_EDITOR_REQUIRED_FIELDS'));
              return;
            }
            // For new survey, use record type id passed from picker screen. For existing survey, use stored record type id.
            const recordTypeId = route.params.selectedRecordTypeId || survey.RecordTypeId;
            const record = { ...survey, RecordTypeId: recordTypeId };
            await upsertLocalSurvey(record);
            dispatchSurvey({ type: 'CLEAR' });
            notifySuccess(`${survey._localId ? t('SURVEY_EDITOR_UPDATE_SUCCESS') : t('SURVEY_EDITOR_CREATE_SUCCESS')}`);
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
          scrollIndicatorInsets={{ right: 1 }}
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
