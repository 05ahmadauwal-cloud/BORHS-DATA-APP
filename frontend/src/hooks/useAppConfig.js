import { useQuery } from '@tanstack/react-query';
import { publicAPI } from '../api';

const DEFAULT_CONFIG = {
  appName: 'BORHS Data',
  appTagline: 'Everyday payments, simplified.',
  supportEmail: '',
  supportPhone: '',
  minWalletFund: 100,
  maxWalletFund: 5000000,
  maintenanceMode: false,
  referralRates: { level1: 5, level2: 2, level3: 1 },
};

export default function useAppConfig() {
  const query = useQuery({
    queryKey: ['app-config'],
    queryFn: publicAPI.getAppConfig,
    select: (response) => ({ ...DEFAULT_CONFIG, ...response.data.data }),
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    refetchInterval: 30_000,
  });
  return { ...query, data: query.data || DEFAULT_CONFIG };
}
