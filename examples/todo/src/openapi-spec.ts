// Copyright IBM Corp. 2018,2020. All Rights Reserved.
// Node module: @loopback/example-todo
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {ApplicationConfig} from '@loopback/core';
import {OpenAPIObject} from '@loopback/rest';
import {TodoListApplication} from './application';

/**
 * Export the OpenAPI spec from the application
 */
async function exportOpenApiSpec(): Promise<OpenAPIObject> {
  const config: ApplicationConfig = {
    rest: {
      port: +(process.env.PORT ?? 3000),
      host: process.env.HOST ?? 'localhost',
      openApiSpec: {
        setServersFromRequest: true,
      },
    },
  };
  const outFile = process.argv[2] ?? '';
  const app = new TodoListApplication(config);
  await app.boot();
  return app.exportOpenApiSpec(outFile);
}

if (require.main === module) {
  exportOpenApiSpec().catch(err => {
    console.error('Fail to export OpenAPI spec from the application.', err);
    process.exit(1);
  });
}
