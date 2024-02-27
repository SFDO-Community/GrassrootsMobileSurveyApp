import { METADATA_ERROR, MIN_PACKAGE_VERSION, SUBSCRIBER_PACKAGE_VERSION } from '../../constants';
import { fetchToolingRecords } from './core';

export const validateInstalledPackageVersion = async () => {
  const query = `SELECT SubscriberPackageVersion.MajorVersion,SubscriberPackageVersion.MinorVersion, SubscriberPackageVersion.PatchVersion, SubscriberPackageVersion.BuildNumber FROM InstalledSubscriberPackage WHERE SubscriberPackageId = '${SUBSCRIBER_PACKAGE_VERSION}'`;
  const records = await fetchToolingRecords(query);
  if (records.length === 0) {
    return Promise.reject({ error: METADATA_ERROR.INVALID_PACKAGE_VERSION });
  }
  const record = records[0].SubscriberPackageVersion;
  const version = `${record.MajorVersion}.${record.MinorVersion}.${record.PatchVersion}.${record.BuildNumber}`;
  if (version < MIN_PACKAGE_VERSION) {
    return Promise.reject({ error: METADATA_ERROR.INVALID_PACKAGE_VERSION });
  }
  return Promise.resolve({});
};
