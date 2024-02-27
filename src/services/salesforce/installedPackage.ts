import { MIN_PACKAGE_VERSION, SUBSCRIBER_PACKAGE_VERSION } from '../../constants';
import { fetchToolingRecords } from './core';

export const validateInstalledPackageVersion = async () => {
  const query = `SELECT SubscriberPackageVersion.MajorVersion,SubscriberPackageVersion.MinorVersion, SubscriberPackageVersion.PatchVersion, SubscriberPackageVersion.BuildNumber FROM InstalledSubscriberPackage WHERE SubscriberPackageId = '${SUBSCRIBER_PACKAGE_VERSION}'`;
  const queryResponse = await fetchToolingRecords(query);
  if (queryResponse.records.length === 0) {
    return Promise.reject({ error: 'older_version' });
  }
  const record = queryResponse.records[0].SubscriberPackageVersion;
  const version = `${record.MajorVersion}.${record.MinorVersion}.${record.PatchVersion}.${record.BuildNumber}`;
  if (version < MIN_PACKAGE_VERSION) {
    return Promise.reject({ error: 'older_version' });
  }
  return Promise.resolve({});
};
