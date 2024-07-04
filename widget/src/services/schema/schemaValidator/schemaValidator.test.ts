import fs from 'fs';

import { log, messages } from '../../../messages';

import SchemaValidator from './schemaValidator';

const schemaData = fs.readFileSync('src/services/__fixtures__/schema.json', 'utf8').toString();

describe('Schema Validator', () => {
    beforeEach(() => {
        jest
            .spyOn(log, 'info')
            .mockImplementation(jest.fn());
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    it('succeeds with valid schema json', () => {
        const validator = new SchemaValidator(JSON.parse(schemaData));
        const spy = jest.spyOn(messages, 'schemaValidated');

        validator.validate();
        expect(spy).toBeCalled();
    });

    it('fails if schema is not valid', () => {
        const parsedSchema = JSON.parse(schemaData);
        parsedSchema[1].sections[0].settings[0].id = null;

        const validator = new SchemaValidator(parsedSchema);
        const spy = jest.spyOn(log, 'error').mockImplementation(jest.fn());
        validator.validate();
        expect(spy).toBeCalled();
    });
});
