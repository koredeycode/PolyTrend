import { home, status, polygon } from './controllers';


export default {
  id: 'polygon-endpoint',
  handler: (router) => {
    router.get('/', home);
    router.post('/', polygon);
    router.get('/status', status);
  },
};
