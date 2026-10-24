import test from 'node:test';
import { cases } from './timeline.cases.js';
for (const scenario of cases) test(scenario.name, scenario.run);
