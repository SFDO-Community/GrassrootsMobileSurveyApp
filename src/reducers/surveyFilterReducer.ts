export interface SurveyFilterAction {
  type: SurveyFilterActionType;
}

const SurveyFilterActionType = {
  SHOW_ALL: 'SHOW_ALL',
  SHOW_SYNCED: 'SHOW_SYNCED',
  SHOW_UNSYCED: 'SHOW_UNSYNCED',
} as const;
type SurveyFilterActionType = typeof SurveyFilterActionType[keyof typeof SurveyFilterActionType];

export const surveyFilterReducer = (state, action: SurveyFilterAction) => {
  switch (action.type) {
    case 'SHOW_ALL':
      return 'SHOW_ALL';
    case 'SHOW_SYNCED':
      return 'SHOW_SYNCED';
    case 'SHOW_UNSYNCED':
      return 'SHOW_UNSYNCED';
    default:
      throw new Error('Invalid action type for SurveyFilterReducer');
  }
};
