import prettier from 'prettier';
export default (code: string) => {
    return prettier.format(code, {
        parser: "typescript",
        tabWidth: 4,
        jsxBracketSameLine: false
    })
}