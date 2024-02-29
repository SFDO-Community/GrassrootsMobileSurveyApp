import { CompositeObjectCreateResultItem } from '../types/survey';
import { logger } from '../utility/logger';
import { notifyError } from '../utility/notification';
import { getRecords } from './database/database';
import { updateSurveyStatusSynced } from './database/localSurvey';
import { fetchSurveysWithTitleFields, uploadSurveyListToSalesforce } from './salesforce/survey';
import { DB_TABLE, SYNC_ERROR } from '../constants';

export const syncLocalSurvey = async (localId: string) => {
  const survey = await getRecords(DB_TABLE.SURVEY, `WHERE _localId = '${localId}'`);
  await syncLocalSurveys(survey);
};

/**
 * @description Upload local surveys, handle response from Salesforce,
 * and then show toast message.
 */
export const syncLocalSurveys = async (localSurveys: Array<any>) => {
  try {
    const response = await uploadSurveyListToSalesforce(localSurveys);
    logger('DEBUG', 'upload result', response);
    if (
      response.hasErrors === false &&
      response.results &&
      response.results.length > 0 &&
      response.results.length === localSurveys.length
    ) {
      const references: Array<CompositeObjectCreateResultItem> = response.results;
      const localIdToSurveyIdMap: Map<string, string> = new Map(references.map(r => [r.referenceId, r.id]));
      const surveyIdToRefreshedSurveysMap = await fetchSurveysWithTitleFields(references.map(r => r.id));
      const refreshedSurveys = [];
      localIdToSurveyIdMap.forEach((surveyId, _localId) => {
        refreshedSurveys.push({ _localId, ...surveyIdToRefreshedSurveysMap.get(surveyId) });
      });
      await updateSurveyStatusSynced(refreshedSurveys);
      return;
    } else if (response.hasErrors) {
      return Promise.reject({ type: SYNC_ERROR.API, message: response.results[0].errors[0].message });
    } else {
      return Promise.reject({ type: SYNC_ERROR.UNEXPECTED });
    }
  } catch (e) {
    notifyError(e.message);
  }
};
