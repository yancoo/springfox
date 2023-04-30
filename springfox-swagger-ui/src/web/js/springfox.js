import csrfSupport from './csrf';

window.onload = () => {

  const buildSystemAsync = async (baseUrl) => {
    try {
      const configUIResponse = await fetch(
          baseUrl + "/swagger-resources/configuration/ui",
          {
            credentials: 'same-origin',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
          });
      const configUI = await configUIResponse.json();

      const configSecurityResponse = await fetch(
          baseUrl + "/swagger-resources/configuration/security",
          {
            credentials: 'same-origin',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
          });
      const configSecurity = await configSecurityResponse.json();

      const resourcesResponse = await fetch(
          baseUrl + "/swagger-resources",
          {
            credentials: 'same-origin',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
          });
      const resources = await resourcesResponse.json();

      const cloudResourcesResponse = await fetch(
        baseUrl + "/swagger-cloud-resources",
        {
          credentials: 'same-origin',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
        });
      const cloudResources = await cloudResourcesResponse.json();

      resources.forEach(resource => {
        if (resource.url.substring(0, 4) !== 'http') {
          resource.url = baseUrl + resource.url;
        }
      });
      var mergedResources = []
      var cloudBaseUrl = baseUrl 
      var index = cloudBaseUrl.indexOf("//")
      var endIndex =  -1
      if( index === -1){// xxx/yy => xxx
        endIndex = cloudBaseUrl.indexOf("/")
        if( endIndex != -1){
          cloudBaseUrl = cloudBaseUrl.substring(0, endIndex)
        }
      }else{ // http://xxx/yy => http://xxx
        endIndex = cloudBaseUrl.substring(index+2).indexOf("/")
        if( endIndex != -1){
          cloudBaseUrl = cloudBaseUrl.substring(0, index+2+endIndex)
        }
      }
      cloudResources.forEach(resource =>{
        if (resource.url.substring(0, 4) !== 'http') {
          resource.url = cloudBaseUrl + resource.url;
        }
        mergedResources.push(resource)
      })
      for(var i = resources.length - 1; i >= 0 ; i --){
        var er = resources[i]
        var exist = false // default 或 group已存在，则跳过
        mergedResources.forEach(mr => {
          if( mr.url === er.url ){
            exist = true
          }
        })
        if( !exist ){// 不存在时，头部插入
          mergedResources.unshift(er)
        }
      }
      mergedResources.forEach(resource => {
        console.log("resource", resource)
      })
      window.ui = getUI(baseUrl, mergedResources, configUI, configSecurity);
    } catch (e) {
      const retryURL = await prompt(
        "Unable to infer base url. This is common when using dynamic servlet registration or when" +
        " the API is behind an API Gateway. The base url is the root of where" +
        " all the swagger resources are served. For e.g. if the api is available at http://example.org/api/v2/api-docs" +
        " then the base url is http://example.org/api/. Please enter the location manually: ",
        window.location.href);

      return buildSystemAsync(retryURL);
    }
  };

  const getUI = (baseUrl, resources, configUI, configSecurity) => {
    const ui = SwaggerUIBundle({
      /*--------------------------------------------*\
       * Core
      \*--------------------------------------------*/
      configUrl: null,
      dom_id: "#swagger-ui",
      dom_node: null,
      spec: {},
      url: "",
      urls: resources,
      /*--------------------------------------------*\
       * Plugin system
      \*--------------------------------------------*/
      layout: "StandaloneLayout",
      plugins: [
        SwaggerUIBundle.plugins.DownloadUrl
      ],
      presets: [
        SwaggerUIBundle.presets.apis,
        SwaggerUIStandalonePreset
      ],
      /*--------------------------------------------*\
       * Display
      \*--------------------------------------------*/
      deepLinking: configUI.deepLinking,
      displayOperationId: configUI.displayOperationId,
      defaultModelsExpandDepth: configUI.defaultModelsExpandDepth,
      defaultModelExpandDepth: configUI.defaultModelExpandDepth,
      defaultModelRendering: configUI.defaultModelRendering,
      displayRequestDuration: configUI.displayRequestDuration,
      docExpansion: configUI.docExpansion,
      filter: configUI.filter,
      maxDisplayedTags: configUI.maxDisplayedTags,
      operationsSorter: configUI.operationsSorter,
      showExtensions: configUI.showExtensions,
      tagSorter: configUI.tagSorter,
      /*--------------------------------------------*\
       * Network
      \*--------------------------------------------*/
      oauth2RedirectUrl: baseUrl + "/webjars/springfox-swagger-ui/oauth2-redirect.html",
      requestInterceptor: (a => a),
      responseInterceptor: (a => a),
      showMutatedRequest: true,
      supportedSubmitMethods: configUI.supportedSubmitMethods,
      validatorUrl: configUI.validatorUrl,
      /*--------------------------------------------*\
       * Macros
      \*--------------------------------------------*/
      modelPropertyMacro: null,
      parameterMacro: null,
    });

    ui.initOAuth({
      /*--------------------------------------------*\
       * OAuth
      \*--------------------------------------------*/
      clientId: configSecurity.clientId,
      clientSecret: configSecurity.clientSecret,
      realm: configSecurity.realm,
      appName: configSecurity.appName,
      scopeSeparator: configSecurity.scopeSeparator,
      additionalQueryStringParams: configSecurity.additionalQueryStringParams,
      useBasicAuthenticationWithAccessCodeGrant: configSecurity.useBasicAuthenticationWithAccessCodeGrant,
    });

    return ui;
  };

  const getBaseURL = () => {
    const urlMatches = /(.*)\/swagger-ui.html.*/.exec(window.location.href);
    return urlMatches[1];
  };

  /* Entry Point */
  (async () => {
    await buildSystemAsync(getBaseURL());
    await csrfSupport(getBaseURL());
  })();

};
