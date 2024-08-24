module.exports = {
    transform: { '^.+\\.ts?$': 'ts-jest' },
    testEnvironment: 'node',
    testRegex: '/test/.*\\.(test|spec)?\\.ts$',
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    moduleNameMapper: {
        "src/(.*)": "<rootDir>/src/$1",
    },
};
