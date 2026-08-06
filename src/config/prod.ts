import { proxy } from './proxy'

/** 生产：H5 同源 `/api`；小程序请改 host 为 Service 公网地址 */
export default {
  host: proxy['/api/'].target,
  baseUrl: '/api',
}
