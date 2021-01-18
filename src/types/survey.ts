/**
 * Fields used for survey list item.
 */
export interface SurveyListItem {
  title: string;
  subtitle: string;
  showCaret: boolean;
  syncStatus: 'Unsynced' | 'Synced';
}

/**
 * Object for survey layout definition used in 'SectionList' component on survey editor screen.
 */
export interface SurveyLayout {
  sections?: Array<{
    id: string;
    title: string;
    data: Array<{
      name: string;
      label: string;
      type: string;
    }>;
  }>;
}
