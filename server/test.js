import http from 'http';

http.get('http://localhost:5000/api/config/job-roles', (res) => {
  console.log('Status Code:', res.statusCode);
  let rawData = '';
  res.on('data', (chunk) => { rawData += chunk; });
  res.on('end', () => {
    try {
      console.log('Body:', rawData);
    } catch (e) {
      console.error(e.message);
    }
  });
}).on('error', (e) => {
  console.error(`Got error: ${e.message}`);
});
