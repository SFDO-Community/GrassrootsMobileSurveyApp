import React, { useState, useReducer, useEffect, useContext, useCallback, useLayoutEffect } from 'react';
import { Alert, View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Icon, Divider, SearchBar } from 'react-native-elements';
import { SwipeListView } from 'react-native-swipe-list-view';
import NetInfo from '@react-native-community/netinfo';
import { useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
// components
import { ListItem, Loader } from '../components';
import FilterButtonGroup from './SurveyListFilter';
import { SurveyListRightButtons } from './SurveyListHeaderButtons';
// services
import { buildDictionary } from '../services/dictionary';
import { deleteRecord } from '../services/database/database';
import { getAllAvailableRecordTypes } from '../services/database/metadata';
import { forceLogout } from '../services/session';
import { syncLocalSurvey } from '../services/sync';
import { getLocalSurveysForList } from '../services/database/localSurvey';
// store
import { surveyFilterReducer } from '../reducers/surveyFilterReducer';
import LocalizationContext from '../context/localizationContext';
// util, constants
import { formatISOStringToCalendarDateString } from '../utility/date';
import { logger } from '../utility/logger';
import { notifyError } from '../utility/notification';
import {
  APP_FONTS,
  APP_THEME,
  DB_TABLE,
  SURVEY_DATE_FIELD,
  SYNC_STATUS_UNSYNCED,
  SYNC_STATUS_SYNCED,
} from '../constants';
// types
import { StackParamList } from '../Router';
import { SQLiteRecordType } from '../types/sqlite';

type SurveyTypePickerNavigationProp = StackNavigationProp<StackParamList, 'SurveyList'>;

type SurveyListProps = {
  navigation: SurveyTypePickerNavigationProp;
};
// TODO: navigate to login screen when session timeout

export default function SurveyList({ navigation }: SurveyListProps) {
  const [surveys, setSurveys] = useState([]);
  const [recordTypes, setRecordTypes] = useState<Array<SQLiteRecordType>>([]);
  const [filter, dispatchFilter] = useReducer(surveyFilterReducer, 'SHOW_UNSYNCED');

  const [searchTerm, setSearchTerm] = useState('');
  const [showsSpinner, setShowsSpinner] = useState(false);
  const [isNetworkConnected, setIsNetworkConnected] = useState(false);

  const { t } = useContext(LocalizationContext);

  /**
   * @description Initialization. Subscribe NetInfo and create dictionary.
   */
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      logger('INFO', 'SurveyList', `Connection type: ${state.type}`);
      logger('INFO', 'SurveyList', `Is connected? ${state.isConnected}`);
      setIsNetworkConnected(state.isConnected);
    });

    setShowsSpinner(true);
    const prepare = async () => {
      try {
        const availableRecordTypes = await getAllAvailableRecordTypes();
        setRecordTypes(availableRecordTypes);
        await buildDictionary();
        await refreshSurveys();
      } catch {
        notifyError('Unexpected error occcured while loading survey list. Contact your administrator and login again.');
        await forceLogout(navigation);
      }
    };
    prepare();
    setShowsSpinner(false);
    return () => {
      unsubscribe();
    };
  }, []);

  /**
   * Refresh survey list on focus this screen
   */
  useFocusEffect(
    useCallback(() => {
      const refresh = async () => {
        setShowsSpinner(true);
        try {
          await refreshSurveys();
        } catch {}
        setShowsSpinner(false);
      };
      refresh();
    }, [])
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: function HeaderRightButtons() {
        return (
          <SurveyListRightButtons
            isNetworkConnected={isNetworkConnected}
            surveys={surveys}
            setShowsSpinner={setShowsSpinner}
            refreshSurveys={refreshSurveys}
            navigation={navigation}
          />
        );
      },
    });
  }, [navigation, surveys, isNetworkConnected]);

  const refreshSurveys = async () => {
    return await getLocalSurveysForList(setSurveys);
  };

  const getSurveyTitle = survey => {
    return survey.titleFieldName && survey[survey.titleFieldName]
      ? survey[survey.titleFieldName]
      : `Survey #${survey._localId}`;
  };

  /**
   * @description Filter surveys by button selection, and then by search term.
   */
  const filteredSurveys = surveys
    .filter(survey => {
      if (filter === 'SHOW_UNSYNCED' && survey._syncStatus === SYNC_STATUS_UNSYNCED) return true;
      if (filter === 'SHOW_SYNCED' && survey._syncStatus === SYNC_STATUS_SYNCED) return true;
      if (filter === 'SHOW_ALL') return true;
      return false;
    })
    .map(survey => {
      return {
        ...survey,
        subtitle: `${survey.label} • ${formatISOStringToCalendarDateString(survey[SURVEY_DATE_FIELD])}`,
        showCaret: survey._syncStatus === SYNC_STATUS_UNSYNCED,
        title: `${getSurveyTitle(survey)}`,
      };
    })
    .filter(survey => {
      return survey.title ? survey.title.includes(searchTerm) : true;
    });

  const newSurveyButton = () => {
    return (
      recordTypes && (
        <View style={styles.addButtonStyle}>
          <Icon
            reverse
            raised
            name="md-add"
            type="ionicon"
            size={22}
            color={APP_THEME.APP_BASE_FONT_COLOR}
            onPress={() => {
              if (recordTypes.length === 1) {
                navigation.navigate('SurveyEditor', {
                  selectedLayoutId: recordTypes[0].layoutId,
                  selectedRecordTypeId: recordTypes[0].recordTypeId,
                });
              } else {
                navigation.navigate('SurveyTypePicker');
              }
            }}
          />
        </View>
      )
    );
  };

  const keyExtractor = (item, index) => index.toString();

  const renderItem = data => {
    return (
      <ListItem
        title={data.item.title}
        subtitle={data.item.subtitle}
        onPress={() => {
          navigation.navigate('SurveyEditor', { _localId: data.item._localId });
        }}
        showCaret={data.item.showCaret}
      />
    );
  };

  const showDeleteConfirmAlert = (rowMap, item, index) => {
    Alert.alert(
      t('DELETE'),
      t('DELETE_MESSAGE'),
      [
        {
          text: t('DELETE'),
          onPress: async () => {
            if (rowMap[index]) {
              rowMap[index].closeRow();
            }
            await deleteRecord(DB_TABLE.SURVEY, item._localId);
            await refreshSurveys();
          },
        },
        {
          text: t('CANCEL'),
        },
      ],
      { cancelable: true }
    );
  };

  const showSyncConfirmAlert = (rowMap, item, index) => {
    Alert.alert(
      t('SYNC'),
      t('SYNC_MESSAGE'),
      [
        {
          text: t('SYNC'),
          onPress: async () => {
            setShowsSpinner(true);
            await syncLocalSurvey(item._localId);
            await refreshSurveys();
            setShowsSpinner(false);
          },
        },
        {
          text: t('CANCEL'),
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <View style={styles.flex1}>
      <Loader loading={showsSpinner} />
      <View style={styles.flex1}>
        <SearchBar
          placeholder={t('SEARCH_SURVEYS')}
          value={searchTerm}
          round={true}
          inputStyle={styles.searchBarInputStyle}
          inputContainerStyle={styles.searchBarInputContainerStyle}
          containerStyle={styles.searchBarContainerStyle}
          onChangeText={searchTerm => setSearchTerm(searchTerm)}
        />
        <FilterButtonGroup dispatch={dispatchFilter} surveys={surveys} />
        <Divider style={{ backgroundColor: APP_THEME.APP_BORDER_COLOR }} />
        <SwipeListView
          data={filteredSurveys}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          ItemSeparatorComponent={() => {
            return <Divider style={{ backgroundColor: APP_THEME.APP_BORDER_COLOR }} />;
          }}
          renderHiddenItem={(data, rowMap) =>
            data.item._syncStatus === SYNC_STATUS_UNSYNCED ? (
              <View style={styles.rowBack}>
                <TouchableOpacity style={[styles.backRightBtn, styles.backRightSyncBtnRight]}>
                  <Text
                    style={styles.backTextWhite}
                    onPress={() => showSyncConfirmAlert(rowMap, data.item, data.index)}
                  >
                    {t('SYNC')}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.backRightBtn, styles.backRightBtnRight]}
                  onPress={() => showDeleteConfirmAlert(rowMap, data.item, data.index)}
                >
                  <Text style={styles.backTextWhite}>{t('DELETE')}</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.rowBack}>
                <TouchableOpacity style={[styles.backRightBtn, styles.backDisabledRightBtnRight]}>
                  <Text style={styles.backTextWhite}>{t('DELETE')}</Text>
                </TouchableOpacity>
              </View>
            )
          }
          disableRightSwipe
          rightOpenValue={-150}
        />
        {newSurveyButton()}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchBarInputStyle: {
    fontFamily: APP_FONTS.FONT_REGULAR,
    fontSize: 16,
  },
  searchBarInputContainerStyle: {
    backgroundColor: APP_THEME.APP_GRAY_BACKGROUND_COLOR,
  },
  searchBarContainerStyle: {
    backgroundColor: APP_THEME.APP_WHITE,
    borderBottomColor: APP_THEME.APP_BORDER_COLOR,
    borderTopColor: APP_THEME.APP_BORDER_COLOR,
  },
  flex1: {
    flex: 1,
    backgroundColor: APP_THEME.APP_WHITE,
  },
  addButtonStyle: { position: 'absolute', bottom: 30, right: 30 },
  backTextWhite: {
    color: APP_THEME.APP_WHITE,
    fontFamily: APP_FONTS.FONT_REGULAR,
  },
  rowBack: {
    alignItems: 'center',
    backgroundColor: APP_THEME.APP_WHITE,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingLeft: 15,
  },
  backRightBtn: {
    alignItems: 'center',
    bottom: 0,
    justifyContent: 'center',
    position: 'absolute',
    top: 0,
    width: 75,
  },
  backRightBtnRight: {
    backgroundColor: APP_THEME.APP_ERROR_COLOR,
    right: 0,
  },
  backRightSyncBtnRight: {
    backgroundColor: APP_THEME.APP_BASE_COLOR,
    right: 75,
  },
  backDisabledRightBtnRight: {
    backgroundColor: APP_THEME.APP_DISABLED_BACKGROUND_COLOR,
    right: 0,
  },
});
