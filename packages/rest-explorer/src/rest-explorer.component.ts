// Copyright IBM Corp. 2018,2020. All Rights Reserved.
// Node module: @loopback/rest-explorer
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import {bind, config, ContextTags, inject} from '@loopback/context';
import {Component, CoreBindings} from '@loopback/core';
import {createControllerFactoryForClass, RestApplication} from '@loopback/rest';
import * as path from 'path';
import {ExplorerController} from './rest-explorer.controller';
import {RestExplorerBindings} from './rest-explorer.keys';
import {RestExplorerConfig} from './rest-explorer.types';

const swaggerUI = require('swagger-ui-dist');

/**
 * A component providing a self-hosted API Explorer.
 */
@bind({tags: {[ContextTags.KEY]: RestExplorerBindings.COMPONENT.key}})
export class RestExplorerComponent implements Component {
  constructor(
    @inject(CoreBindings.APPLICATION_INSTANCE)
    private application: RestApplication,
    @config()
    restExplorerConfig: RestExplorerConfig = {},
  ) {
    const explorerPath = restExplorerConfig.path ?? '/explorer';

    this.registerControllerRoute('get', explorerPath, 'indexRedirect');
    this.registerControllerRoute('get', explorerPath + '/', 'index');
    if (restExplorerConfig.useSelfHostedSpec !== false) {
      this.registerControllerRoute(
        'get',
        explorerPath + '/openapi.json',
        'spec',
      );
    }

    const absolutePath = swaggerUI.getAbsoluteFSPath();
    application.static(explorerPath, absolutePath);

    // mount the `/themes` path if app provides it to customize the
    // swagger-ui theme
    if (restExplorerConfig.themesPath) {
      const customThemesPath = path.join(absolutePath, restExplorerConfig.themesPath);
      application.static(explorerPath + '/themes', customThemesPath);
    }

    // Disable redirect to externally hosted API explorer
    application.restServer.config.apiExplorer = {disabled: true};
  }

  private registerControllerRoute(
    verb: string,
    path: string,
    methodName: string,
  ) {
    this.application.route(
      verb,
      path,
      {
        'x-visibility': 'undocumented',
        responses: {},
      },
      ExplorerController,
      createControllerFactoryForClass(ExplorerController),
      methodName,
    );
  }
}
