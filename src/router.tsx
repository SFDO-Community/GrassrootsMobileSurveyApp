import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import LocalizationContext from './context/localizationContext';

// screens
import Login from './screens/Login';
import AreaCode from './screens/AreaCode';
import SurveyList from './screens/SurveyList';
import SurveyTypePicker from './screens/SurveyTypePicker';
import SurveyEditor from './screens/SurveyEditor';
import Settings from './screens/Settings';
import LookupSearch from './screens/LookupSearch';

// components
import { SettingsButton, LogoutButton } from './components/headerButtons';

// styles
import { APP_FONTS, APP_THEME } from './constants';

export type StackParamList = {
  Login: undefined;
  AreaCode: undefined;
  SurveyList: {
    isLocalizationPrepared?: boolean;
  };
  SurveyTypePicker: undefined;
  SurveyEditor: {
    selectedRecordTypeId: string;
    selectedLayoutId: string;
    localId?: string;
  };
  Settings: undefined;
};

const MainStack = createStackNavigator();
const RootStack = createStackNavigator();

function MainStackScreen() {
  const { t } = useContext(LocalizationContext);
  return (
    <MainStack.Navigator>
      <MainStack.Screen
        name="Login"
        component={Login}
        options={{
          title: t('LOGIN'),
          ...headerStyle,
        }}
      />
      <MainStack.Screen
        name="AreaCode"
        component={AreaCode}
        options={{
          title: t('ENTER_AREA_CODE'),
          ...headerStyle,
        }}
      />
      <MainStack.Screen
        name="SurveyList"
        component={SurveyList}
        options={({ navigation }) => ({
          title: t('SURVEYS'),
          headerLeft: () => LogoutButton(navigation, t),
          headerRight: () => SettingsButton(navigation),
          ...headerStyle,
        })}
      />
      <MainStack.Screen
        name="SurveyTypePicker"
        component={SurveyTypePicker}
        options={{
          title: t('CHOOSE_SURVEY'),
          ...headerStyle,
        }}
      />
      <MainStack.Screen
        name="SurveyEditor"
        component={SurveyEditor}
        options={{
          title: t('NEW_SURVEY'),
          ...headerStyle,
        }}
      />
      <MainStack.Screen
        name="Settings"
        component={Settings}
        options={{
          title: t('SETTINGS'),
          ...headerStyle,
        }}
      />
    </MainStack.Navigator>
  );
}

export default function Router() {
  return (
    <NavigationContainer>
      <RootStack.Navigator mode="modal" headerMode="none">
        <RootStack.Screen name="Main" component={MainStackScreen} />
        <RootStack.Screen name="Lookup" component={LookupSearch} />
      </RootStack.Navigator>
    </NavigationContainer>
  );
}

const headerStyle = {
  headerStyle: {
    backgroundColor: APP_THEME.NAVIGATION_BACKGROUND,
  },
  headerTintColor: APP_THEME.APP_BASE_FONT_COLOR,
  headerTitleStyle: {
    fontSize: 16,
    fontWeight: '600' as '600',
    fontFamily: APP_FONTS.FONT_BOLD,
  },
};
