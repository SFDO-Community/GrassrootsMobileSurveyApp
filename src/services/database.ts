import * as SQLite from 'expo-sqlite';
import { logger } from '../utility/logger';
import { FieldTypeMapping } from '../types/sqlite';
import { DB_TABLE } from '../constants';

const database = SQLite.openDatabase('AppDatabase.db');

/**
 * @description Get all the records from a local table
 * @param tableName
 */
export const getAllRecords = (tableName: string) => {
  return new Promise<Array<any>>(async (resolve, reject) => {
    const statement = `select * from ${tableName}`;
    logger('FINE', 'getAllRecords', statement);

    executeTransaction(statement)
      .then(result => {
        resolve(result.rows._array);
      })
      .catch(error => {
        reject(error);
      });
  });
};

/**
 * @description Get all the records from a local table and run callback method using result array as argument
 * @param tableName
 * @param onSuccess callback method
 */
export const getAllRecordsWithCallback = (tableName: string, onSuccess) => {
  return new Promise(async (resolve, reject) => {
    database.transaction(
      txn => {
        txn.executeSql(`select * from ${tableName}`, [], (_, { rows: { _array } }) => {
          onSuccess(_array);
          resolve(true);
        });
      },
      error => {
        logger('ERROR', 'getAllRecordsWithCallback', error);
        reject(error);
      }
    );
  });
};

/**
 * @description Get records from a local table with condition
 * @param tableName
 * @param whereClause Required.
 */
export const getRecords = (tableName, whereClause): Promise<Array<any>> => {
  return new Promise<Array<any>>(async (resolve, reject) => {
    if (!whereClause) {
      reject('Specify where clause or use "getAllRecords" instead.');
    }
    const statement = `select * from ${tableName} ${whereClause}`;
    logger('FINE', 'getRecords', statement);

    executeTransaction(statement)
      .then(result => {
        resolve(result.rows._array);
      })
      .catch(error => {
        reject(error);
      });
  });
};

/**
 * @description Get records from a local table with condition
 * @param tableName
 * @param whereClause Required.
 */
export const getRecordsWithCallback = (tableName: string, whereClause: string, onSuccess) => {
  return new Promise(async (resolve, reject) => {
    if (!whereClause) {
      reject('Specify where clause or use "getAllRecordsWithCallback" instead.');
    }
    const statement = `select * from ${tableName} ${whereClause}`;
    database.transaction(
      txn => {
        txn.executeSql(statement, [], (_, { rows: { _array } }) => {
          onSuccess(_array);
          resolve(true);
        });
      },
      error => {
        logger('ERROR', 'getAllRecordsWithCallback', error);
        reject(error);
      }
    );
  });
};

/**
 * @description Save records to the local sqlite table
 * @param tableName Name of table on local sqlite
 * @param records
 * @param primaryKey
 */
export const saveRecords = (tableName: string, records, primaryKey: string) => {
  return new Promise(async (resolve, reject) => {
    const fieldTypeMappings: Array<FieldTypeMapping> = getFieldTypeMappings(records[0]);
    await prepareTable(tableName, fieldTypeMappings, primaryKey);

    const keys = fieldTypeMappings.map(field => field.name).join(','); // e.g., 'developerName', 'recordTypeId', ...
    const values = records
      .map(record => {
        return `(${Object.values(convertObjectToSQLite(record))})`;
      })
      .join(','); // e.g., ('a1', 'b2'), ('c1', 'd2')
    const statement = `insert into ${tableName} (${keys}) values ${values}`;
    logger('DEBUG', 'saveRecords', statement);

    executeTransaction(statement)
      .then(result => {
        resolve(result);
      })
      .catch(error => {
        reject(error);
      });
  });
};

/**
 * @description Update a object to local table
 * @param tableName Name of table on local sqlite
 * @param record record object
 * @param whereClause where clause string
 */
export const updateRecord = (tableName: string, record, whereClause: string) => {
  return new Promise((resolve, reject) => {
    Object.entries(record).forEach(([key, value]) => {
      if (value === null) {
        delete record[key];
      }
    });
    const keyValues = Object.entries(convertObjectToSQLite(record))
      .map(([key, value]) => `${key} = ${value}`)
      .join(',');
    const statement = `update ${tableName} set ${keyValues} ${whereClause}`;
    logger('DEBUG', 'updateRecord', statement);
    executeTransaction(statement)
      .then(result => {
        resolve(result);
      })
      .catch(error => {
        reject(error);
      });
  });
};

/**
 * @description Update survey sync status to 'Synced'.
 * @param tableName
 * @param field
 * @param value
 * @param whereClause
 */
export const updateFieldValue = (tableName: string, field: string, value: string | number, whereClause: string) => {
  return new Promise((resolve, reject) => {
    const statement = `update ${tableName} set ${field} = '${value}' ${whereClause}`;
    logger('DEBUG', 'update field value', statement);
    executeTransaction(statement)
      .then(result => {
        resolve(result);
      })
      .catch(error => {
        reject(error);
      });
  });
};

/**
 * @description Delete a record in local table
 * @param tableName
 * @param LocalId
 */
export const deleteRecord = (tableName, localId) => {
  return new Promise((resolve, reject) => {
    const statement = `delete from ${tableName} where localId = ${localId}`;

    executeTransaction(statement)
      .then(result => {
        resolve(result);
      })
      .catch(error => {
        reject(error);
      });
  });
};

/**
 * @description Create table if not exists, given table name and field type mappings. 'name', 'id' or 'localId' field will be primary.
 * @param fieldName Name of table on sqlite
 * @param fieldTypeMappings Array of field type mapping
 * @param primaryKey Field name of primary key
 */
export const prepareTable = (tableName: string, fieldTypeMappings: Array<FieldTypeMapping>, primaryKey: string) => {
  return new Promise((resolve, reject) => {
    const fieldsWithType = fieldTypeMappings
      .map(field => {
        if (field.name === primaryKey) {
          return `${field.name} ${field.type} primary key`;
        } else {
          return `${field.name} ${field.type}`;
        }
      })
      .join(',');
    const localId = 'localId integer primary key autoincrement';
    const fieldsInStatement = !primaryKey ? `${localId},${fieldsWithType}` : fieldsWithType;
    logger('DEBUG', 'prepareTable', `create table if not exists ${tableName} (${fieldsInStatement});`);

    executeTransaction(`create table if not exists ${tableName} (${fieldsInStatement});`)
      .then(result => {
        resolve(result);
      })
      .catch(error => {
        reject(error);
      });
  });
};

/**
 * @description Returns mappings of sqlite field name and type from Salesforce record
 * e.g., {field1: 'hello', field2: 123} => [{field: 'field1', type: 'text', field: 'field2', type: 'integer'}]
 * @param record
 */
const getFieldTypeMappings = (record: Record<string, any>): Array<FieldTypeMapping> => {
  const result: Array<FieldTypeMapping> = [];
  for (const [name, value] of Object.entries(record)) {
    let type;
    if (typeof value === 'number' || typeof value === 'boolean') {
      type = 'integer';
    } else {
      // string
      type = 'text';
    }
    result.push({
      name,
      type,
    });
  }
  return result;
};

/**
 * @description Convert values of a record into sqlite supported formated object for dml statement
 * @param record
 * @example { name: 'Hello', somethingBool: true } => { name: 'Hello', somethingBool: 1 }
 */
const convertObjectToSQLite = record => {
  const converted = Object.entries(record).reduce((result, [key, value]) => {
    let sqliteValue;
    if (typeof value === 'string') {
      sqliteValue = `'${value.replace(/'/g, "''")}'`; // escape single quote
    } else if (typeof value === 'boolean') {
      sqliteValue = value ? 1 : 0; // 1: true, 0: false
    } else if (!value) {
      // use blank string for null
      sqliteValue = "''";
    } else {
      sqliteValue = value;
    }
    return {
      ...result,
      [key]: sqliteValue,
    };
  }, {});
  return converted;
};

/**
 * @description Drop all the local tables
 */
export const clearDatabase = async () => {
  logger('DEBUG', 'clearDatabase', 'Deleting all the tables');
  for (const [key, value] of Object.entries(DB_TABLE)) {
    await clearTable(value);
  }
};

/**
 * @description Drop table
 * @param tableName
 */
export const clearTable = (tableName: string) => {
  return new Promise((resolve, reject) => {
    logger('DEBUG', 'clearTable', `Deleting ${tableName}`);
    const statement = `DROP TABLE IF EXISTS ${tableName};`;

    executeTransaction(statement)
      .then(result => {
        resolve(result);
      })
      .catch(error => {
        reject(error);
      });
  });
};

/**
 * @description Wrapper private (async) function to execute sql statement.
 * @param statement
 */
const executeTransaction = (statement: string) => {
  return new Promise<SQLite.SQLResultSet>((resolve, reject) => {
    try {
      database.transaction(tx => {
        tx.executeSql(
          statement,
          null,
          (txn, result) => {
            logger('FINE', 'sqlite', 'success');
            resolve(result);
          },
          (txn, error) => {
            logger('ERROR', 'sqlite', `${JSON.stringify(error)} ${JSON.stringify(txn)}`);
            reject(error);
            return false;
          }
        );
      });
    } catch (error) {
      logger('ERROR', 'sqlite', error);
      reject(error);
    }
  });
};
