import { surveyFilterReducer } from '../../src/reducers/surveyFilterReducer';

describe('surveyFilterReducer', () => {
  it('actions', () => {
    const all = surveyFilterReducer({}, { type: 'SHOW_ALL' });
    expect(all).toEqual('SHOW_ALL');

    const synced = surveyFilterReducer({}, { type: 'SHOW_SYNCED' });
    expect(synced).toEqual('SHOW_SYNCED');

    const unsynced = surveyFilterReducer({}, { type: 'SHOW_UNSYNCED' });
    expect(unsynced).toEqual('SHOW_UNSYNCED');
  });

  it('invalid action', () => {
    try {
      surveyFilterReducer({}, 'DUMMY');
    } catch (e) {
      expect(e.message).toEqual('Invalid action type for SurveyFilterReducer');
    }
  });
});
