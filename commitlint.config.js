module.exports = {
    rules: {
        'type-empty': [2, 'never'],
        'type-case': [2, 'always', 'lower-case'],
        'type-enum': [
            2,
            'always',
            ['feat', 'fix', 'docs', 'tweak', 'refactor', 'test', 'chore', 'wip'],
        ],
        'scope-case': [2, 'always', 'lower-case'],
        'header-max-length': [2, 'always', 72],
        'header-full-stop': [2, 'never'],
    },
};
