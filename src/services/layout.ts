import { getRecords } from './database/database';
import { SQLitePageLayoutSection, SQLitePageLayoutItem } from '../types/sqlite';
import { SurveyLayout } from '../types/survey';
import { logger } from '../utility/logger';
import { DB_TABLE } from '../constants';

/**
 * Construct page layout object from locally stored page layout sections and items
 * @param layoutId
 */
export const buildLayoutDetail = async (layoutId: string): Promise<SurveyLayout> => {
  // sections in the layout
  const sections: Array<SQLitePageLayoutSection> = await getRecords(
    DB_TABLE.PAGE_LAYOUT_SECTION,
    `where layoutId='${layoutId}'`
  );
  // items used in the sections
  const sectionIds = sections.map(s => s.id);
  const items: Array<SQLitePageLayoutItem> = await getRecords(
    DB_TABLE.PAGE_LAYOUT_ITEM,
    `where sectionId in (${sectionIds.map(id => `'${id}'`).join(',')})`
  );
  logger('FINE', 'buildLayoutDetail', items);

  // group items by section id
  const sectionIdToItems = items.reduce(
    (result, item) => ({
      ...result,
      [item.sectionId]: [...(result[item.sectionId] || []), item],
    }),
    {}
  );

  const layout: SurveyLayout = {
    sections: sections.map(s => ({
      id: s.id,
      title: s.sectionLabel,
      data: sectionIdToItems[s.id]
        ? sectionIdToItems[s.id].map(item => ({
            name: item.fieldName,
            label: item.fieldLabel,
            type: item.fieldType,
            required: !!item.required,
          }))
        : [],
    })),
  };

  return layout;
};
