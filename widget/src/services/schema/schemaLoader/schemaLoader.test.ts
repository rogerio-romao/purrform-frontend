import fs from 'fs';

import { messages } from '../../../messages';

import schemaLoader, { handleSchemaLoader } from './schemaLoader';

const schemaData = fs.readFileSync('src/services/__fixtures__/schema.json', 'utf8').toString();

describe('Schema Loader Handler', () => {
    it('properly returns schema object to resolve', () => {
        const { data } = handleSchemaLoader(null, schemaData);

        expect(data).toEqual(schemaData);
    });

    it('doesn\'t populate the data field if there is an error', () => {
        const { data } = handleSchemaLoader(Error('testing error'), schemaData);

        expect(data).not.toEqual(schemaData);
    });
});

describe('Schema Loader', () => {
    describe('when handleSchema return schemaResult', () => {
        it('should resolve with schemaResult', () => {
            const result = schemaLoader('src/services/__fixtures__');

            expect(result).resolves.toEqual(handleSchemaLoader(null, schemaData));
        });
    });

    describe('when handleSchema return schemaResult', () => {
        it('should return with no data', () => {
            const result = schemaLoader('dummyPath');

            expect(result).rejects.toEqual(messages.invalidSchema());
        });
    });
});
