//const axios = require('axios');
const { calculateAuthorizationHeader } = require('./veracode-hmac.js');
const { getHostAndCredentials } = require('../utils.js')
const core = require('@actions/core');
const { setGlobalDispatcher,ProxyAgent, fetch } = require('undici')


function setGlobalProxy(debug) {
  core.debug('--  setGlobalProxy() - START  --');
  const httpProxy = process.env.http_proxy || process.env.HTTP_PROXY;
  const httpsProxy = process.env.https_proxy || process.env.HTTPS_PROXY;
  const proxyHost = process.env.PROXY_HOST;
  const proxyPort = process.env.PROXY_PORT;
  const proxyUser = process.env.PROXY_USER;
  const proxyPass = process.env.PROXY_PASS;
  const proxyProtocol = process.env.PROXY_PROTOCOAL || 'http';

  if (httpProxy || httpsProxy || (proxyHost && proxyPort)) {
    let uri = httpsProxy || httpProxy || `${proxyProtocol}://${proxyHost}:${proxyPort}`;
    let proxyAttr = {uri};

    if (proxyUser && proxyPass) {
      proxyAttr['token'] = `Basic ${Buffer.from(`${proxyUser}:${proxyPass}`).toString('base64')}`
    }
    if (debug && debug==1) {
      core.info('---- DEBUG OUTPUT START ----')
      core.info('---- getProxy ----')
      core.info('---- proxyAttr: ' + JSON.stringify(proxyAttr))
      core.info('---- http_proxy: ' + (process.env.HTTP_PROXY || process.env.http_proxy))
      core.info('---- https_proxy: ' + (process.env.HTTPS_PROXY || process.env.https_proxy))
      core.info('---- proxy user: ' + proxyUser)
      core.info('---- proxy pass provided: ' + (proxyPass && proxyPass.length>0))      
      core.info('---- DEBUG OUTPUT END ----')  
    }
    const proxyAgent = new ProxyAgent(proxyAttr);
    setGlobalDispatcher(proxyAgent);
    core.debug(`---- Global Proxy Set to: ${uri} ---`);
  } else {
    if (debug && debug==1) {
      core.info('---- DEBUG OUTPUT START ----')
      core.info('---- getProxy ----')
      core.info('---- NO Proxy host or port provided ----')
      core.info('---- DEBUG OUTPUT END ----')  
    }
  }
  core.debug('--  setGlobalProxy() - END  --');
}

async function getResourceByAttribute (vid, vkey, resource,debug) {
  const resourceUri = resource.resourceUri;
  const queryAttribute = resource.queryAttribute;
  const queryValue = resource.queryValue;
  const queryAttribute2 = resource.queryAttribute2;
  const queryValue2 = resource.queryValue2;
  var urlQueryParams = queryAttribute !== '' ? `?${queryAttribute}=${queryValue}` : '';
  if ( queryAttribute2 ){
    urlQueryParams = urlQueryParams+`&${queryAttribute2}=${queryValue2}`;
  }

  const { host, vid: updatedVid, vkey: updatedVkey } = getHostAndCredentials(vid, vkey);
  const headers = {
    'Authorization': calculateAuthorizationHeader(updatedVid, updatedVkey, host, resourceUri, 
      urlQueryParams, 'GET')
  };

  const appUrl = `https://${host}${resourceUri}${urlQueryParams}`;

  if (debug && debug==1) {
    core.info('---- DEBUG OUTPUT START ----')
    core.info('---- getResourceByAttribute - request settings ----')
    core.info('---- req url: ' + appUrl)
    core.info('---- http_proxy: ' + (process.env.HTTP_PROXY || process.env.http_proxy))
    core.info('---- https_proxy: ' + (process.env.HTTPS_PROXY || process.env.https_proxy))
    core.info('---- headers: ' + JSON.stringify(headers))
    core.info('---- DEBUG OUTPUT END ----')  
  }

  try {

    //if ( process.env.HTTP_PROXY !="" || process.env.HTTPS_PROXY !="" || process.env.http_proxy !="" || process.env.https_proxy !=""){
      const response = await fetch(appUrl,{ headers });
      const data = await response.json();

      if (debug && debug==1) {
          core.info('---- DEBUG OUTPUT START ----')
          core.info('---- getResourceByAttribute - post resource response ----')
          core.info('---- Response Status: ' + response.status)
          core.info('---- Response Status Text: ' + response.statusText)
          core.info('---- Response URL: ' + response.url)
          core.info('---- Response OK: ' + response.ok)
          core.info('---- Response Type: ' + response.type)
          core.info('---- data:')
          core.info(data);
          core.info('---- DEBUG OUTPUT END ----')
      }

      return data;
    // }
    // else {
    //   const response = await axios.get(appUrl, { headers });
    //   return response.data; // Access the response data
    // }
  } catch (error) {
    core.info('--- Cought error in getResourceByAttribute ---');
    console.error(error);
  }
}

async function getResource (vid, vkey, resource,debug) {
  const resourceUri = resource.resourceUri;
  const { host, vid: updatedVid, vkey: updatedVkey } = getHostAndCredentials(vid, vkey);
  const headers = {
    'Authorization': calculateAuthorizationHeader(updatedVid, updatedVkey, host, resourceUri, '', 'GET')
  };
  const appUrl = `https://${host}${resourceUri}`;

  if (debug && debug==1) {
    core.info('---- DEBUG OUTPUT START ----')
    core.info('---- getResource - request settings ----')
    core.info('---- req url: ' + appUrl)
    core.info('---- http_proxy: ' + (process.env.HTTP_PROXY || process.env.http_proxy))
    core.info('---- https_proxy: ' + (process.env.HTTPS_PROXY || process.env.https_proxy))
    core.info('---- headers: ' + JSON.stringify(headers))
    core.info('---- DEBUG OUTPUT END ----')  
  }

  try {
    //if ( process.env.HTTP_PROXY !="" || process.env.HTTPS_PROXY !="" || process.env.http_proxy !="" || process.env.https_proxy !=""){
      const response = await fetch(appUrl,{ headers });
      return data = await response.json();
    // }
    // else {
    //   const response = await axios.get(appUrl, { headers });
    //   return response.data; // Access the response data
    // }
  } catch (error) {
    console.error(error);
  }
}

async function createResource(vid, vkey, resource) {
  const resourceUri = resource.resourceUri;
  const resourceData = resource.resourceData;
  const { host, vid: updatedVid, vkey: updatedVkey } = getHostAndCredentials(vid, vkey);
  const headers = {
    'Authorization': calculateAuthorizationHeader(updatedVid, updatedVkey, host, resourceUri, '', 'POST'),
    "Content-Type": "application/json"
  };

  const appUrl = `https://${host}${resourceUri}`;
  try {
    //if ( process.env.HTTP_PROXY !="" || process.env.HTTPS_PROXY !="" || process.env.http_proxy !="" || process.env.https_proxy !=""){
      const response = await fetch(appUrl,{ 
        method: 'POST',
        headers: headers,
        body: JSON.stringify(resourceData)
        });
      return data = await response.json();
    // }
    // else {
    //   const response = await axios.post(appUrl, resourceData, { headers });
    //   return response.data; // Access the response data
    // }
  } catch (error) {
    console.error(error);
  }
}

module.exports = {
  getResourceByAttribute,
  getResource,
  createResource,
  setGlobalProxy
};