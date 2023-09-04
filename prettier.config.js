module.exports = {
    printWidth: 100,
    tabWidth: 4,
    singleQuote: true,
    plugins: [require.resolve('prettier-plugin-import-sort')],
    ignoreTypes: ['html', 'css']
};
