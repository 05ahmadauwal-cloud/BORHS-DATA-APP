const Settings = require('../../models/Settings');

const NETWORKS = ['mtn', 'airtel', 'glo', '9mobile'];
const SETTINGS_KEY = 'data_network_status';

const normalize = (value = {}) => Object.fromEntries(
  NETWORKS.map((network) => [network, value[network] !== false])
);

const getNetworkStatus = async () => normalize(await Settings.get(SETTINGS_KEY, {}));

const isNetworkEnabled = async (network) => {
  const status = await getNetworkStatus();
  return status[network] !== false;
};

const setNetworkEnabled = async (network, enabled, userId) => {
  if (!NETWORKS.includes(network)) {
    throw Object.assign(new Error('Invalid data network'), { statusCode: 400 });
  }
  const status = await getNetworkStatus();
  status[network] = Boolean(enabled);
  await Settings.set(SETTINGS_KEY, status, userId);
  return status;
};

module.exports = { NETWORKS, getNetworkStatus, isNetworkEnabled, setNetworkEnabled };
